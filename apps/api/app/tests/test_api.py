from fastapi.testclient import TestClient
from app.main import app
from app.services.rules import risk_flags, clause_selector
from app.schemas.intake import IntakeData

client = TestClient(app)


def sample_payload(**overrides):
    base = {
        "testator": {"name": "Jane Doe", "dob": "1985-02-02", "address": "1 Main St", "county": "Travis", "marital_status": "single", "state": "TX"},
        "capacity_confirmations": {"age_18_plus": True, "sound_mind": True, "voluntary": True, "revoke_prior_wills": True},
        "family": {"spouse": None, "children": [], "descendants_of_deceased_children": False, "has_minor_children": False, "blended_family": False},
        "fiduciaries": {"executor": {"name": "Alex Roe", "relationship": "friend", "age": 40, "special_needs": False}, "alternates": [], "independent_administration": True, "waive_bond": True},
        "guardians": {"guardian_for_minors": None, "alternate_guardian": None},
        "gifts": {"specific_bequests": [], "fallback_to_residuary": True},
        "residuary_beneficiaries": [{"beneficiary": {"name": "Alex Roe", "relationship": "friend", "age": 40, "special_needs": False}, "percentage": 100}],
        "special_clauses": {"survivorship_days": 120, "simultaneous_death_clause": True, "disinheritance_flag": False, "digital_assets": True},
        "execution_preferences": {"two_witnesses_confirmed": True, "self_proving_affidavit_intent": True},
        "complex_assets": [],
    }
    for k, v in overrides.items():
        base[k] = v
    return base


def test_schema_validation():
    intake = IntakeData.model_validate(sample_payload())
    assert intake.testator.state == "TX"


def test_rules_risk_classification():
    data = IntakeData.model_validate(sample_payload(complex_assets=["business"]))
    result, _ = risk_flags(data)
    assert result == "ATTORNEY_REVIEW_REQUIRED"


def test_clause_selection_deterministic():
    data = IntakeData.model_validate(sample_payload())
    clauses = clause_selector(data)
    assert "TX-INTRO-001" in clauses
    assert "TX-SELF-PROVING-001" in clauses


def test_happy_path_generation_and_download():
    started = client.post("/intake/start").json()
    sid = started["session_id"]
    client.post("/intake/answer", json={"session_id": sid, "data": sample_payload()})
    r = client.post("/will/generate", json={"session_id": sid}, headers={"Idempotency-Key": "abc-1"})
    assert r.status_code == 200
    will_id = r.json()["will_id"]
    d = client.get(f"/will/{will_id}/download")
    assert d.status_code == 200


def test_escalation_blocks_generation():
    started = client.post("/intake/start").json()
    sid = started["session_id"]
    client.post("/intake/answer", json={"session_id": sid, "data": sample_payload(complex_assets=["mineral"])})
    r = client.post("/will/generate", json={"session_id": sid}, headers={"Idempotency-Key": "abc-2"})
    assert r.status_code == 422
