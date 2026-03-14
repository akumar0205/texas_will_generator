from pydantic import BaseModel
from app.schemas.intake import IntakeData

try:
    from langchain_core.prompts import ChatPromptTemplate
except Exception:  # graceful fallback if langchain unavailable at runtime
    ChatPromptTemplate = None


class IntakeAnalysis(BaseModel):
    follow_up_questions: list[str]
    missing_fields: list[str]
    conflicts: list[str]


def analyze_intake(data: IntakeData) -> IntakeAnalysis:
    _ = ChatPromptTemplate  # explicit marker that LangChain is the integration point

    missing = []
    if data.family.has_minor_children and not data.guardians.guardian_for_minors:
        missing.append("guardians.guardian_for_minors")

    conflicts = []
    if data.testator.marital_status == "married" and data.family.spouse is None:
        conflicts.append("Married status but spouse details missing")

    follow_ups = []
    if missing:
        follow_ups.append("Please provide a guardian for minor children.")
    if conflicts:
        follow_ups.append("Please confirm spouse information for Texas community property context.")

    return IntakeAnalysis(follow_up_questions=follow_ups, missing_fields=missing, conflicts=conflicts)
