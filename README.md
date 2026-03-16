# Texas Will Generator Monorepo

Texas-only document preparation workflow (not legal advice) that guides users through intake and either generates a document packet or routes to attorney review for complex/risky scenarios.

## Monorepo Structure

```text
.
├── apps
│   ├── api
│   │   ├── app
│   │   │   ├── api/routes.py
│   │   │   ├── clauses/library.json
│   │   │   ├── core/config.py
│   │   │   ├── db/session.py
│   │   │   ├── models/intake.py
│   │   │   ├── schemas/intake.py
│   │   │   ├── services/{documents.py,langchain_service.py,rules.py}
│   │   │   ├── tests/test_api.py
│   │   │   └── main.py
│   │   ├── .env.example
│   │   └── pyproject.toml
│   └── web
│       ├── app/{page.tsx,intake/page.tsx,review/page.tsx,results/page.tsx,layout.tsx,globals.css}
│       ├── components/{FormField.tsx,PersonCard.tsx,BeneficiarySplitEditor.tsx,RiskBanner.tsx,ProgressStepper.tsx,DocumentCard.tsx}
│       ├── __tests__/wizard.test.tsx
│       ├── .env.example
│       └── package.json
├── packages/shared/src/types.ts
└── README.md
```

## Product Scope Implemented

- Texas-only hard guard in validation + risk engine.
- Typed attested will workflow + self-proving affidavit + signing instructions outputs.
- Deterministic risk engine with escalation enum:
  - `ELIGIBLE`
  - `ELIGIBLE_WITH_WARNING`
  - `ATTORNEY_REVIEW_REQUIRED`
- Clause library with versioned template clauses and conditions.
- LangChain integration boundary for structured follow-up/missing/conflict output.
- Idempotency key support on `/will/generate`.

## Setup Instructions

### 1) Backend

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
cp .env.example .env
uvicorn app.main:app --reload
```

### 2) Frontend

```bash
cd apps/web
npm install
cp .env.example .env.local
npm run dev
```

## Run Commands

```bash
# backend tests
cd apps/api && pytest

# frontend tests
cd apps/web && npm test
```

## Seed / Demo Data

Use the payload from `apps/api/app/tests/test_api.py::sample_payload` as demo intake data.

## API cURL Examples

```bash
# start
curl -X POST http://localhost:8000/intake/start

# answer
curl -X POST http://localhost:8000/intake/answer \
  -H 'Content-Type: application/json' \
  -d '{"session_id":"<SESSION>","data":{...intake payload...}}'

# validate
curl -X POST http://localhost:8000/intake/validate \
  -H 'Content-Type: application/json' \
  -d '{"session_id":"<SESSION>"}'

# risk evaluate
curl -X POST http://localhost:8000/risk/evaluate \
  -H 'Content-Type: application/json' \
  -d '{"session_id":"<SESSION>"}'

# generate will packet
curl -X POST http://localhost:8000/will/generate \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: demo-key-1' \
  -d '{"session_id":"<SESSION>"}'

# download
curl -L "http://localhost:8000/will/<WILL_ID>/download?doc=will" -o texas_will.pdf
curl -L "http://localhost:8000/will/<WILL_ID>/download?doc=affidavit" -o affidavit.pdf
curl -L "http://localhost:8000/will/<WILL_ID>/download?doc=instructions" -o instructions.txt
```

## Known Limitations

- Will and affidavit outputs are generated as downloadable `.pdf` files; signing instructions remain a `.txt` template artifact.
- Assistant panel in web app is scaffolded; no live chat transport yet.
- Frontend persistence is client-side scaffold only; no complete save/resume wiring in UI.
- SQLite is configured for local dev only.

## Next Improvements Roadmap

1. Replace text generation with `docxtpl` templates and clause injection with version locking.
2. Add full SQLAlchemy migration strategy (Alembic) and Postgres profile.
3. Integrate LangChain structured model invocation (Ollama provider) for follow-ups with confidence scores.
4. Complete web-to-api orchestration for all intake steps and resume behavior.
5. Add Playwright e2e for full intake-to-download path.
