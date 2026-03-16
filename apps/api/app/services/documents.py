from datetime import datetime
from pathlib import Path
from uuid import uuid4
import textwrap

from app.schemas.intake import IntakeData

OUTPUT_DIR = Path("generated")
OUTPUT_DIR.mkdir(exist_ok=True)

PAGE_WIDTH = 612
PAGE_HEIGHT = 792
TOP_Y = 760
BOTTOM_Y = 70
LEFT_X = 56
INDENT_X = 74


def _escape_pdf_text(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _wrap_text(text: str, width: int = 88) -> list[str]:
    if not text:
        return [""]
    return textwrap.wrap(text, width=width, break_long_words=False, break_on_hyphens=False)


def _center_x(text: str, font_size: int) -> int:
    # Approximate average glyph width for Times family.
    width = int(len(text) * font_size * 0.5)
    return max(LEFT_X, (PAGE_WIDTH - width) // 2)


def _append_wrapped(layout: list[dict], text: str, style: str) -> None:
    for line in _wrap_text(text):
        layout.append({"text": line, "style": style})


def _paginate_layout(layout: list[dict]) -> list[list[dict]]:
    line_heights = {
        "title": 24,
        "subtitle": 18,
        "section": 18,
        "clause": 15,
        "body": 15,
        "signature": 16,
        "small": 13,
        "blank": 9,
    }

    pages: list[list[dict]] = [[]]
    y = TOP_Y

    for entry in layout:
        style = entry["style"]
        height = line_heights.get(style, 15)
        if y - height < BOTTOM_Y:
            pages.append([])
            y = TOP_Y
        pages[-1].append(entry)
        y -= height

    return pages


def _build_simple_pdf(layout: list[dict]) -> bytes:
    pages = _paginate_layout(layout)
    total_pages = len(pages)

    content_streams: list[bytes] = []
    for page_index, page_entries in enumerate(pages, start=1):
        commands = ["BT"]
        y = TOP_Y

        for entry in page_entries:
            style = entry["style"]
            text = _escape_pdf_text(entry.get("text", ""))

            if style == "blank":
                y -= 9
                continue

            if style == "title":
                font, size, x, step = "F2", 16, _center_x(text, 16), 24
            elif style == "subtitle":
                font, size, x, step = "F2", 12, _center_x(text, 12), 18
            elif style == "section":
                font, size, x, step = "F2", 12, LEFT_X, 18
            elif style == "clause":
                font, size, x, step = "F1", 11, INDENT_X, 15
            elif style == "signature":
                font, size, x, step = "F1", 12, LEFT_X, 16
            elif style == "small":
                font, size, x, step = "F3", 10, LEFT_X, 13
            else:
                font, size, x, step = "F1", 12, LEFT_X, 15

            commands.append(f"/{font} {size} Tf")
            commands.append(f"1 0 0 1 {x} {y} Tm ({text}) Tj")
            y -= step

        commands.append("ET")

        footer_y = 46
        footer = f"Draft for review only | Page {page_index} of {total_pages}"
        footer_x = _center_x(footer, 10)
        commands.append("0.70 w")
        commands.append(f"{LEFT_X} 58 m {PAGE_WIDTH - LEFT_X} 58 l S")
        commands.append("BT")
        commands.append("/F3 10 Tf")
        commands.append(f"1 0 0 1 {footer_x} {footer_y} Tm ({_escape_pdf_text(footer)}) Tj")
        commands.append("ET")

        content_streams.append("\n".join(commands).encode("latin-1", errors="replace"))

    page_count = len(content_streams)
    pages_kids = " ".join(f"{3 + i} 0 R" for i in range(page_count))

    # 1: Catalog, 2: Pages, 3..: Page objects, then font objects (regular, bold, italic), then streams.
    font_regular_object = 3 + page_count
    font_bold_object = font_regular_object + 1
    font_italic_object = font_bold_object + 1
    first_content_object = font_italic_object + 1

    objects: list[bytes] = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        f"<< /Type /Pages /Kids [{pages_kids}] /Count {page_count} >>".encode("latin-1"),
    ]

    for page_offset in range(page_count):
        content_object = first_content_object + page_offset
        page_object = (
            "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
            f"/Resources << /Font << /F1 {font_regular_object} 0 R /F2 {font_bold_object} 0 R /F3 {font_italic_object} 0 R >> >> "
            f"/Contents {content_object} 0 R >>"
        ).encode("latin-1")
        objects.append(page_object)

    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>")
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold >>")
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic >>")

    for stream in content_streams:
        objects.append(
            f"<< /Length {len(stream)} >>\nstream\n".encode("latin-1")
            + stream
            + b"\nendstream"
        )

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]

    for object_number, object_body in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{object_number} 0 obj\n".encode("latin-1"))
        pdf.extend(object_body)
        pdf.extend(b"\nendobj\n")

    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(offsets)}\n".encode("latin-1"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("latin-1"))

    pdf.extend(
        (
            f"trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF\n"
        ).encode("latin-1")
    )

    return bytes(pdf)


def _write_pdf(path: Path, layout: list[dict]) -> None:
    path.write_bytes(_build_simple_pdf(layout))


def generate_docs(data: IntakeData, clause_ids: list[str]) -> tuple[str, dict]:
    will_id = str(uuid4())
    base = OUTPUT_DIR / will_id
    base.mkdir(exist_ok=True)

    will_path = base / "texas_will.pdf"
    affidavit_path = base / "self_proving_affidavit.pdf"
    instructions_path = base / "signing_instructions.txt"

    spouse_name = data.family.spouse.name if data.family.spouse else "None"
    prepared_on = datetime.utcnow().strftime("%B %d, %Y")

    layout: list[dict] = [
        {"text": "LAST WILL AND TESTAMENT", "style": "title"},
        {"text": "STATE OF TEXAS", "style": "subtitle"},
        {"text": f"COUNTY OF {data.testator.county.upper()}", "style": "subtitle"},
        {"style": "blank"},
        {"text": f"Prepared For: {data.testator.name}", "style": "body"},
        {"text": f"Address: {data.testator.address}", "style": "body"},
        {"text": f"Prepared On: {prepared_on}", "style": "body"},
        {"style": "blank"},
    ]

    _append_wrapped(
        layout,
        (
            f"I, {data.testator.name}, of {data.testator.county} County, Texas, being of sound mind "
            "and over the age of eighteen (18) years, do hereby make, publish, and declare this "
            "instrument to be my Last Will and Testament, and I revoke all prior wills and codicils."
        ),
        "body",
    )

    layout.extend([
        {"style": "blank"},
        {"text": "ARTICLE I - IDENTIFICATION", "style": "section"},
        {"text": f"1.1 Testator: {data.testator.name}", "style": "clause"},
        {"text": f"1.2 Date of Birth: {data.testator.dob.isoformat()}", "style": "clause"},
        {"text": f"1.3 Marital Status: {data.testator.marital_status.capitalize()}", "style": "clause"},
        {"text": f"1.4 Spouse: {spouse_name}", "style": "clause"},
        {"style": "blank"},
        {"text": "ARTICLE II - FAMILY DECLARATIONS", "style": "section"},
        {"text": "2.1 Children/Descendants:", "style": "clause"},
    ])

    if data.family.children:
        for child in data.family.children:
            layout.append({"text": f"- {child.name}", "style": "clause"})
    else:
        layout.append({"text": "- None listed.", "style": "clause"})

    layout.extend([
        {"style": "blank"},
        {"text": "ARTICLE III - SPECIFIC BEQUESTS", "style": "section"},
    ])

    if data.gifts.specific_bequests:
        for index, gift in enumerate(data.gifts.specific_bequests, start=1):
            _append_wrapped(
                layout,
                f"3.{index} I give {gift.asset_description} to {gift.beneficiary.name}.",
                "clause",
            )
    else:
        layout.append({"text": "3.1 I make no specific bequests.", "style": "clause"})

    layout.extend([
        {"style": "blank"},
        {"text": "ARTICLE IV - RESIDUARY ESTATE", "style": "section"},
        {"text": "4.1 I give all the rest, residue, and remainder of my estate as follows:", "style": "clause"},
    ])

    for share in data.residuary_beneficiaries:
        layout.append({"text": f"- {share.beneficiary.name}: {share.percentage}%", "style": "clause"})

    layout.extend([
        {"style": "blank"},
        {"text": "ARTICLE V - INDEPENDENT EXECUTOR", "style": "section"},
        {"text": f"5.1 I appoint {data.fiduciaries.executor.name} as Independent Executor.", "style": "clause"},
        {"text": "5.2 No bond shall be required.", "style": "clause"},
        {"text": "5.3 Independent administration is requested to the fullest extent allowed by Texas law.", "style": "clause"},
        {"style": "blank"},
        {"text": "ARTICLE VI - SURVIVORSHIP", "style": "section"},
        {"text": f"6.1 A beneficiary must survive me by {data.special_clauses.survivorship_days} days to take under this will.", "style": "clause"},
        {"text": "6.2 If deaths are simultaneous, distribution shall be determined as if I survived the other person.", "style": "clause"},
        {"style": "blank"},
        {"text": "ARTICLE VII - GENERAL PROVISIONS", "style": "section"},
        {"text": "7.1 This will is governed by the laws of the State of Texas.", "style": "clause"},
    ])

    _append_wrapped(
        layout,
        "7.2 Any invalid provision shall not affect the validity of the remaining provisions.",
        "clause",
    )

    layout.extend([
        {"style": "blank"},
        {"text": "EXECUTION", "style": "section"},
        {"text": "Signed on ________________________, 20____.", "style": "signature"},
        {"style": "blank"},
        {"text": "____________________________________________", "style": "signature"},
        {"text": f"{data.testator.name}, Testator", "style": "signature"},
        {"style": "blank"},
        {"text": "ATTESTATION BY WITNESSES", "style": "section"},
        {"text": "The Testator signed and declared this instrument as the Testator's Last Will and Testament in our presence.", "style": "signature"},
        {"text": "We sign in the Testator's presence and in the presence of each other.", "style": "signature"},
        {"style": "blank"},
        {"text": "Witness 1: ________________________________________", "style": "signature"},
        {"text": "Address: __________________________________________", "style": "signature"},
        {"style": "blank"},
        {"text": "Witness 2: ________________________________________", "style": "signature"},
        {"text": "Address: __________________________________________", "style": "signature"},
        {"style": "blank"},
        {"text": "NOTARY ACKNOWLEDGMENT", "style": "section"},
        {"text": "A separate self-proving affidavit form accompanies this will for notarization.", "style": "signature"},
        {"style": "blank"},
        {"text": f"Applied Clauses: {', '.join(clause_ids)}", "style": "small"},
        {"text": "Document preparation only. Not legal advice.", "style": "small"},
    ])

    _write_pdf(will_path, layout)

    affidavit_layout: list[dict] = [
        {"text": "SELF-PROVING AFFIDAVIT", "style": "title"},
        {"text": "STATE OF TEXAS", "style": "subtitle"},
        {"text": f"COUNTY OF {data.testator.county.upper()}", "style": "subtitle"},
        {"style": "blank"},
        {"text": "BEFORE ME, the undersigned authority, on this day personally appeared", "style": "body"},
        {"text": f"{data.testator.name}, Testator, and the witnesses named below,", "style": "body"},
        {"text": "all known to me (or satisfactorily proven) to be the persons whose names", "style": "body"},
        {"text": "are subscribed to the foregoing instrument.", "style": "body"},
        {"style": "blank"},
        {"text": "The Testator declared to the witnesses and to me that the instrument is", "style": "body"},
        {"text": "the Testator's Last Will and Testament, and that the Testator executed it", "style": "body"},
        {"text": "as a free and voluntary act for the purposes expressed therein.", "style": "body"},
        {"style": "blank"},
        {"text": "Each witness stated that the witness signed the will as witness in the", "style": "body"},
        {"text": "presence of the Testator and in the presence of the other witness.", "style": "body"},
        {"style": "blank"},
        {"text": "Subscribed and sworn to before me on ________________________, 20____.", "style": "signature"},
        {"style": "blank"},
        {"text": "____________________________________________", "style": "signature"},
        {"text": f"{data.testator.name}, Testator", "style": "signature"},
        {"style": "blank"},
        {"text": "____________________________________________", "style": "signature"},
        {"text": "Witness 1", "style": "signature"},
        {"style": "blank"},
        {"text": "____________________________________________", "style": "signature"},
        {"text": "Witness 2", "style": "signature"},
        {"style": "blank"},
        {"text": "____________________________________________", "style": "signature"},
        {"text": "Notary Public, State of Texas", "style": "signature"},
        {"text": "My commission expires: ____________________", "style": "signature"},
        {"style": "blank"},
        {"text": "Document preparation only. Not legal advice.", "style": "small"},
    ]

    _write_pdf(affidavit_path, affidavit_layout)
    instructions_path.write_text(
        "Signing Instructions Checklist\n"
        "1. Gather two disinterested witnesses.\n"
        "2. Sign will in each other's presence.\n"
        "3. Complete self-proving affidavit before notary.",
        encoding="utf-8",
    )

    return will_id, {
        "will": str(will_path),
        "affidavit": str(affidavit_path),
        "instructions": str(instructions_path),
    }
