from pathlib import Path
from uuid import uuid4
from app.schemas.intake import IntakeData


OUTPUT_DIR = Path("generated")
OUTPUT_DIR.mkdir(exist_ok=True)


def generate_docs(data: IntakeData, clause_ids: list[str]) -> tuple[str, dict]:
    will_id = str(uuid4())
    base = OUTPUT_DIR / will_id
    base.mkdir(exist_ok=True)

    will_path = base / "texas_will.txt"
    affidavit_path = base / "self_proving_affidavit.txt"
    instructions_path = base / "signing_instructions.txt"

    will_path.write_text(
        "Texas Attested Will (Template)\n"
        f"Testator: {data.testator.name}\n"
        f"County: {data.testator.county}\n"
        f"Clauses: {', '.join(clause_ids)}\n"
        "[DOCUMENT PREPARATION ONLY - NOT LEGAL ADVICE]"
    )
    affidavit_path.write_text("Self-Proving Affidavit Template\nRequires two witnesses and notary in Texas.")
    instructions_path.write_text(
        "Signing Instructions Checklist\n"
        "1. Gather two disinterested witnesses.\n"
        "2. Sign will in each other's presence.\n"
        "3. Complete self-proving affidavit before notary."
    )

    return will_id, {
        "will": str(will_path),
        "affidavit": str(affidavit_path),
        "instructions": str(instructions_path),
    }
