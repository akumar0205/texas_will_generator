# AGENTS.md

## Overview
This document provides an **agent‑friendly reference** for building, linting, and testing the Texas Will Generator monorepo. It includes commands for both the **frontend (Next.js / TypeScript)** and the **backend (FastAPI / Python)**, as well as style guidelines that agents can follow when reading, editing, or creating code.

---

## Table of Contents
1. [Build / Run Commands](#build--run-commands)
   - Frontend
   - Backend
2. [Testing Commands](#testing-commands)
   - Run all tests
   - Run a single test (frontend & backend)
   - Watch mode (frontend)
3. [Linting & Formatting](#linting--formatting)
   - TypeScript
   - Python
4. [Code Style Guidelines](#code-style-guidelines)
   - General conventions
   - TypeScript (frontend)
   - Python (backend)
5. [Error Handling Conventions](#error-handling-conventions)
6. [Naming Conventions](#naming-conventions)
7. [Import Ordering](#import-ordering)
8. [Documentation Comments](#documentation-comments)
9. [Cursor / Copilot Rules (if present)](#cursor--copilot-rules)
10. [Useful Scripts & Aliases](#useful-scripts--aliases)

---

## Build / Run Commands

### Frontend (apps/web)
| Action | Command |
|--------|---------|
| **Start development server** | `npm run web:dev` |
| **Build for production** | `npm run web:build` |
| **Start production server** | `npm run web:start` |
| **Run tests** | `npm run web:test` |

> **Note:** These scripts are defined in the top-level package.json and proxy to the workspace.

### Backend (apps/api)
| Action | Command |
|--------|---------|
| **Run API (development)** | `npm run api:run` |
| **Run tests** | `npm run api:test` |
| **Install dependencies** | `cd apps/api && pip install -e .[dev]` |
| **Format code** | `npm run api:format` |
| **Lint code** | `npm run api:lint` |
| **Type check** | `npm run api:typecheck` |

> **Note:** These scripts are defined in the top-level package.json for convenience.

---

## Testing Commands

### Run **all** tests
- **Frontend:** `npm run web:test`
- **Backend:** `npm run api:test`

### Run a **single** test
#### Frontend (Jest)
```bash
# Replace <path/to/file.test.tsx> with the test file you want to run
npm run web:test -- <path/to/file.test.tsx>
```

> The `--` passes arguments through to Jest.

#### Backend (pytest)
```bash
# Replace <test_path>::<test_name> with the specific test
npm run api:test -- <test_path>::<test_name>
```

*Example:* `npm run api:test -- app/tests/test_api.py::test_happy_path_generation_and_download`

### Watch mode (frontend)
```bash
npm run web:test -- --watch
```

---

## Linting & Formatting

### TypeScript / JavaScript (frontend)
The project uses Next.js with TypeScript. ESLint and Prettier are configured:

```bash
# Run lint
npm run web:lint

# Auto‑fix
npm run web:lint:fix

# Format with Prettier
npm run web:format
```

### Python (backend)
```bash
# Run lint / type check
npm run api:lint   # ruff check
npm run api:format # black formatting
npm run api:typecheck # mypy type checking
```

---

## Code Style Guidelines

### General Conventions
- **Indentation:** 2 spaces for TypeScript, 4 spaces for Python.
- **Line length:** 88 characters for Python, 100 characters for TypeScript.
- **Trailing commas** in multiline literals/objects.
- **Prefer `const`/`let` over `var`** in TS. Use `readonly` for immutable values.
- **Avoid console.log** in production code; use a logger abstraction.
- **Write tests** for every new function/method.

### TypeScript (frontend)
1. **Component Files** – Use the `.tsx` extension for React components. Export the component as default unless there are multiple named exports.
2. **Props** – Define a dedicated `Props` interface; keep it near the component.
3. **State Management** – Prefer React hooks (`useState`, `useEffect`). For cross‑component state, use Context or a store library.
4. **Async Calls** – Use `async/await`; wrap with `try/catch` and surface errors via UI.
5. **Utility Functions** – Place in `utils/` and export typed functions.
6. **Strict Types** – Never use `any`. Use generics, unions, and literal types.
7. **JSX Formatting** – One prop per line if >2 props, close self‑closing tags (`<Component />`).
8. **File Organization** – Follow the existing structure in `apps/web/` with components, app, lib, etc.

### Python (backend)
1. **FastAPI Routes** – Use Pydantic models for request/response schemas. Return `Response` objects with appropriate status codes.
2. **Dependency Injection** – Leverage FastAPI's `Depends` for DB sessions, config, etc.
3. **Async vs Sync** – Prefer `async def` for I/O‑bound endpoints; keep CPU‑heavy code in background tasks.
4. **Service Layer** – Keep business logic in `services/` modules, not in route handlers.
5. **Error Handling** – Raise `HTTPException` with clear detail; map domain errors to appropriate status codes.
6. **Logging** – Use the standard library `logging` module; configure a JSON formatter for structured logs.
7. **Type Hints** – Use `typing` annotations everywhere; enable `mypy --strict`.
8. **File Organization** – Follow the existing structure in `apps/api/app/` with api, core, db, models, schemas, services.

---

## Error Handling Conventions
- **Frontend:**
  - Throw custom `Error` subclasses for domain errors.
  - Centralize API error handling in a hook that maps HTTP status codes to UI messages.
  - Use React error boundaries where appropriate.
- **Backend:**
  - Define custom exception classes in `app/exceptions.py` if needed.
  - Use FastAPI exception handlers (`@app.exception_handler`) to translate them to HTTP responses.
  - Do not expose internal stack traces to the client; log them server‑side.
  - Return appropriate HTTP status codes (400 for client errors, 500 for server errors).

---

## Naming Conventions
| Entity | Convention |
|--------|------------|
| **Files / Directories** | `kebab-case` (e.g., `beneficiary-split-editor.tsx`, `risk_evaluations.py`) |
| **Variables / Functions** | `camelCase` (TS) / `snake_case` (Python) |
| **Classes / Interfaces** | `PascalCase` |
| **Constants** | `UPPER_SNAKE_CASE` |
| **React Components** | `PascalCase` matching file name |
| **Pydantic Models** | `PascalCase` ending with `Schema` or `Model` |
| **SQLAlchemy Models** | `PascalCase` matching table names in singular form |
| **API Endpoints** | Use descriptive, RESTful names with hyphens (`/will/generate`) |

---

## Import Ordering
1. **Standard library / built‑ins**
2. **Third‑party libraries**
3. **Internal absolute imports** (using the `@/` alias for TS, or `app.` for Python)
4. **Relative imports** (if truly local)

Separate each group with a blank line. Example (TS):
```ts
import React from "react";
import { useRouter } from "next/router";

import { fetchWill } from "@/lib/api";

import styles from "./MyComponent.module.css";
```

Example (Python):
```python
from collections import defaultdict
from typing import List

from fastapi import FastAPI
from sqlalchemy.orm import Session

from app.models.intake import Intake
from app.schemas.intake import IntakeData
```

---

## Documentation Comments
- **TS/JSX:** Use JSDoc style above exported functions/components.
```ts
/**
 * Renders a progress stepper.
 * @param steps - Array of step titles.
 * @returns JSX element.
 */
export const ProgressStepper = ({ steps }: { steps: string[] }) => { /* … */ };
```
- **Python:** Use docstrings with Google style.
```python
def calculate_residuary(assets: List[Asset]) -> float:
    """Calculate the residuary percentage.

    Args:
        assets: List of asset objects.

    Returns:
        The residuary percentage as a float.
    """
    # …
```

---

## Cursor / Copilot Rules
No `.cursor` or Copilot instruction files are present in this repository. Agents should therefore rely on the conventions outlined above.

---

## Useful Scripts & Aliases
The following convenience scripts are available in the top-level package.json:
```json
{
  "scripts": {
    "web:dev": "npm --workspace apps/web run dev",
    "web:build": "npm --workspace apps/web run build",
    "web:start": "npm --workspace apps/web run start",
    "web:test": "npm --workspace apps/web run test",
    "web:lint": "npm --workspace apps/web run lint",
    "web:lint:fix": "npm --workspace apps/web run lint:fix",
    "web:format": "npm --workspace apps/web run format",
    "api:test": "cd apps/api && pytest",
    "api:lint": "cd apps/api && ruff check .",
    "api:format": "cd apps/api && black .",
    "api:typecheck": "cd apps/api && mypy .",
    "api:run": "cd apps/api && uvicorn app.main:app --reload"
  }
}
```

---

*This file is intended for **autonomous agents**. Follow the guidelines verbatim when generating or modifying code, and prefer the commands above for building, linting, or testing.*