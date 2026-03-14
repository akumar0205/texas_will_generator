from pydantic import BaseModel, Field, ConfigDict, model_validator
from typing import Optional, Literal
from datetime import date


RiskResult = Literal["ELIGIBLE", "ELIGIBLE_WITH_WARNING", "ATTORNEY_REVIEW_REQUIRED"]


class Person(BaseModel):
    name: str
    relationship: Optional[str] = None
    age: Optional[int] = None
    special_needs: bool = False


class Testator(BaseModel):
    name: str
    dob: date
    address: str
    county: str
    marital_status: Literal["single", "married", "divorced", "widowed"]
    state: str = "TX"


class CapacityConfirmations(BaseModel):
    age_18_plus: bool
    sound_mind: bool
    voluntary: bool
    revoke_prior_wills: bool


class Family(BaseModel):
    spouse: Optional[Person] = None
    children: list[Person] = Field(default_factory=list)
    descendants_of_deceased_children: bool = False
    has_minor_children: bool = False
    blended_family: bool = False


class Fiduciaries(BaseModel):
    executor: Person
    alternates: list[Person] = Field(default_factory=list)
    independent_administration: bool = True
    waive_bond: bool = True


class Guardians(BaseModel):
    guardian_for_minors: Optional[Person] = None
    alternate_guardian: Optional[Person] = None


class SpecificGift(BaseModel):
    asset_description: str
    beneficiary: Person


class ResiduaryShare(BaseModel):
    beneficiary: Person
    percentage: int


class Gifts(BaseModel):
    specific_bequests: list[SpecificGift] = Field(default_factory=list)
    fallback_to_residuary: bool = True


class SpecialClauses(BaseModel):
    survivorship_days: int = 120
    simultaneous_death_clause: bool = True
    disinheritance_flag: bool = False
    digital_assets: bool = True


class ExecutionPreferences(BaseModel):
    two_witnesses_confirmed: bool
    self_proving_affidavit_intent: bool


class IntakeData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    testator: Testator
    capacity_confirmations: CapacityConfirmations
    family: Family
    fiduciaries: Fiduciaries
    guardians: Guardians
    gifts: Gifts
    residuary_beneficiaries: list[ResiduaryShare]
    special_clauses: SpecialClauses
    execution_preferences: ExecutionPreferences
    complex_assets: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def percentages_total_100(self):
        total = sum(item.percentage for item in self.residuary_beneficiaries)
        if total != 100:
            raise ValueError("Residuary percentages must equal 100")
        return self


class StartIntakeResponse(BaseModel):
    session_id: str
    status: str


class IntakeAnswerRequest(BaseModel):
    session_id: str
    data: dict


class IntakeValidateRequest(BaseModel):
    session_id: str


class RiskEvaluateRequest(BaseModel):
    session_id: str


class RiskEvaluateResponse(BaseModel):
    result: RiskResult
    flags: list[str]


class WillGenerateRequest(BaseModel):
    session_id: str


class WillGenerateResponse(BaseModel):
    will_id: str
    result: RiskResult
    documents: dict
    clause_ids: list[str]
