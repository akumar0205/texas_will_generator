from datetime import datetime
from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from uuid import uuid4
from pathlib import Path

from app.db.session import get_db
from app.models.intake import Intake, RiskEvaluation, GeneratedDocument, AuditLog, LeadCapture
from app.schemas.intake import (
    StartIntakeResponse,
    IntakeAnswerRequest,
    IntakeValidateRequest,
    RiskEvaluateRequest,
    RiskEvaluateResponse,
    WillGenerateRequest,
    WillGenerateResponse,
    IntakeData,
    LeadCaptureRequest,
    LeadCaptureResponse,
)
from app.services.rules import validate_intake, risk_flags, clause_selector
from app.services.documents import generate_docs
from app.services.langchain_service import analyze_intake

router = APIRouter()


@router.post("/intake/start", response_model=StartIntakeResponse)
def intake_start(db: Session = Depends(get_db)):
    session_id = str(uuid4())
    intake = Intake(session_id=session_id, payload={})
    db.add(intake)
    db.add(AuditLog(event="INTAKE_STARTED", details=session_id))
    db.commit()
    return StartIntakeResponse(session_id=session_id, status="IN_PROGRESS")


@router.post("/intake/answer")
def intake_answer(req: IntakeAnswerRequest, db: Session = Depends(get_db)):
    intake = db.query(Intake).filter(Intake.session_id == req.session_id).first()
    if not intake:
        raise HTTPException(status_code=404, detail="Session not found")
    payload = intake.payload or {}
    payload.update(req.data)
    intake.payload = payload
    intake.updated_at = datetime.utcnow()
    db.add(AuditLog(event="INTAKE_ANSWERED", details=req.session_id))
    db.commit()
    return {"status": "saved", "session_id": req.session_id}


@router.post("/intake/validate")
def intake_validate(req: IntakeValidateRequest, db: Session = Depends(get_db)):
    intake = db.query(Intake).filter(Intake.session_id == req.session_id).first()
    if not intake:
        raise HTTPException(status_code=404, detail="Session not found")
    data = IntakeData.model_validate(intake.payload)
    issues = validate_intake(data)
    llm_analysis = analyze_intake(data)
    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "follow_up_questions": llm_analysis.follow_up_questions,
        "missing_fields": llm_analysis.missing_fields,
        "conflicts": llm_analysis.conflicts,
    }


@router.post("/risk/evaluate", response_model=RiskEvaluateResponse)
def evaluate_risk(req: RiskEvaluateRequest, db: Session = Depends(get_db)):
    intake = db.query(Intake).filter(Intake.session_id == req.session_id).first()
    if not intake:
        raise HTTPException(status_code=404, detail="Session not found")
    data = IntakeData.model_validate(intake.payload)
    result, flags = risk_flags(data)
    db.add(RiskEvaluation(intake_id=intake.id, result=result, flags={"flags": flags}))
    db.add(AuditLog(event="RISK_EVALUATED", details=f"{req.session_id}:{result}"))
    db.commit()
    return RiskEvaluateResponse(result=result, flags=flags)


@router.post("/will/generate", response_model=WillGenerateResponse)
def will_generate(
    req: WillGenerateRequest,
    db: Session = Depends(get_db),
    idempotency_key: str = Header(default="", alias="Idempotency-Key"),
):
    if not idempotency_key:
        raise HTTPException(status_code=400, detail="Idempotency-Key header required")

    intake = db.query(Intake).filter(Intake.session_id == req.session_id).first()
    if not intake:
        raise HTTPException(status_code=404, detail="Session not found")

    existing = db.query(GeneratedDocument).filter(
        GeneratedDocument.intake_id == intake.id,
        GeneratedDocument.idempotency_key == idempotency_key,
    ).first()
    if existing:
        return WillGenerateResponse(
            will_id=existing.will_id,
            result="ELIGIBLE",
            documents=existing.documents,
            clause_ids=existing.clause_ids,
        )

    data = IntakeData.model_validate(intake.payload)
    result, flags = risk_flags(data)
    if result == "ATTORNEY_REVIEW_REQUIRED":
        raise HTTPException(status_code=422, detail={"result": result, "flags": flags})

    clause_ids = clause_selector(data)
    will_id, docs = generate_docs(data, clause_ids)

    record = GeneratedDocument(
        intake_id=intake.id,
        will_id=will_id,
        idempotency_key=idempotency_key,
        documents=docs,
        clause_ids=clause_ids,
    )
    db.add(record)
    db.add(AuditLog(event="WILL_GENERATED", details=f"{req.session_id}:{will_id}"))
    db.commit()

    return WillGenerateResponse(will_id=will_id, result=result, documents=docs, clause_ids=clause_ids)


@router.get("/will/{will_id}/download")
def download_will(will_id: str, doc: str = "will", db: Session = Depends(get_db)):
    generated = db.query(GeneratedDocument).filter(GeneratedDocument.will_id == will_id).first()
    if not generated:
        raise HTTPException(status_code=404, detail="Will not found")
    path = generated.documents.get(doc)
    if not path or not Path(path).exists():
        raise HTTPException(status_code=404, detail="Document asset not found")
    filename = Path(path).name
    media_type = "application/pdf" if str(path).endswith(".pdf") else None
    return FileResponse(path, filename=filename, media_type=media_type)


@router.post("/leads", response_model=LeadCaptureResponse)
def create_lead(req: LeadCaptureRequest, db: Session = Depends(get_db)):
    existing = db.query(LeadCapture).filter(LeadCapture.email == req.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    lead = LeadCapture(email=req.email, source=req.source)
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return LeadCaptureResponse(id=lead.id, email=lead.email, created_at=lead.created_at)
