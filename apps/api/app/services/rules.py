from app.schemas.intake import IntakeData, RiskResult


def validate_intake(data: IntakeData) -> list[str]:
    issues: list[str] = []
    if data.testator.state != "TX":
        issues.append("Jurisdiction must be Texas")
    if not all([
        data.capacity_confirmations.age_18_plus,
        data.capacity_confirmations.sound_mind,
        data.capacity_confirmations.voluntary,
        data.capacity_confirmations.revoke_prior_wills,
    ]):
        issues.append("Capacity confirmations incomplete")
    if not data.execution_preferences.two_witnesses_confirmed:
        issues.append("Two witnesses are required")
    if data.family.has_minor_children and not data.guardians.guardian_for_minors:
        issues.append("Minor children require guardian designation")
    return issues


def risk_flags(data: IntakeData) -> tuple[RiskResult, list[str]]:
    flags: list[str] = []
    hard: list[str] = []

    if data.special_clauses.disinheritance_flag:
        flags.append("Disinheritance detected")
    if data.family.blended_family:
        flags.append("Blended family complexity")
    if any(c.special_needs for c in data.family.children) or any(
        r.beneficiary.special_needs for r in data.residuary_beneficiaries
    ):
        hard.append("Special-needs beneficiary")
    if any(asset in {"business", "mineral", "out_of_state_real_estate"} for asset in data.complex_assets):
        hard.append("Complex asset planning required")

    if data.testator.state != "TX":
        hard.append("Non-Texas jurisdiction")

    if hard:
        return "ATTORNEY_REVIEW_REQUIRED", flags + hard
    if flags:
        return "ELIGIBLE_WITH_WARNING", flags
    return "ELIGIBLE", []


def clause_selector(data: IntakeData) -> list[str]:
    clauses = ["TX-INTRO-001", "TX-REVOCATION-001", "TX-EXECUTOR-001", "TX-RESIDUARY-001"]
    if data.family.has_minor_children:
        clauses.append("TX-GUARDIAN-001")
    if data.gifts.specific_bequests:
        clauses.append("TX-SPECIFIC-GIFTS-001")
    if data.execution_preferences.self_proving_affidavit_intent:
        clauses.append("TX-SELF-PROVING-001")
    if data.special_clauses.digital_assets:
        clauses.append("TX-DIGITAL-ASSETS-001")
    return clauses


def assemble_context(data: IntakeData) -> dict:
    return {
        "testator_name": data.testator.name,
        "county": data.testator.county,
        "executor_name": data.fiduciaries.executor.name,
        "residuary": [
            {"name": b.beneficiary.name, "percentage": b.percentage}
            for b in data.residuary_beneficiaries
        ],
        "specific_gifts": [
            {"asset": gift.asset_description, "beneficiary": gift.beneficiary.name}
            for gift in data.gifts.specific_bequests
        ],
    }
