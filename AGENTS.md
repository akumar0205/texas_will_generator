# AGENTS.md

## Overview
This document provides an agent-friendly reference for building, linting, and testing the Texas Will Generator monorepo. It includes commands for both the frontend (Next.js / TypeScript) and backend (FastAPI / Python), as well as style guidelines.

---

## Build / Run Commands

### Frontend (apps/web)
| Action | Command |
|--------|---------|
| Start development server | `npm run web:dev` |
| Build for production | `npm run web:build` |
| Start production server | `npm run web:start` |
| Run tests | `npm run web:test` |

### Backend (apps/api)
| Action | Command |
|--------|---------|
| Run API (development) | `cd apps/api && uvicorn app.main:app --reload` |
| Run tests | `cd apps/api && pytest` |
| Install dependencies | `cd apps/api && pip install -e .[dev]` |

---

## Testing Commands

### Run a single test
#### Frontend (Jest)
```bash
npm run web:test -- <path/to/file.test.tsx>
```

#### Backend (pytest)
```bash
cd apps/api && pytest <test_path>::<test_name>
```

Example: `cd apps/api && pytest app/tests/test_api.py::test_happy_path_generation_and_download`

---

## Linting & Formatting

### TypeScript / JavaScript (frontend)
```bash
npm run web:lint      # ESLint
npm run web:lint:fix  # Auto-fix
npm run web:format    # Prettier
```

### Python (backend)
```bash
cd apps/api && ruff check .         # Lint
cd apps/api && ruff check . --fix   # Auto-fix
cd apps/api && black .              # Format
cd apps/api && mypy .               # Type check
```

---

## Code Style Guidelines

### General Conventions
- Indentation: 2 spaces for TypeScript, 4 spaces for Python
- Line length: 88 characters for Python, 100 characters for TypeScript
- Trailing commas in multiline literals/objects
- Prefer const/let over var in TS; use readonly for immutable values
- Avoid console.log in production code

### TypeScript (frontend)
1. Component Files - Use .tsx extension; export as default
2. Props - Define dedicated Props interface near component
3. State Management - Prefer React hooks (useState, useEffect)
4. Async Calls - Use async/await with try/catch
5. Strict Types - Never use any; use generics, unions, literals
6. Import Ordering: stdlib → third-party → internal (@/) → relative
7. JSX Formatting - One prop per line for >2 props; close self-closing tags

### Python (backend)
1. FastAPI Routes - Use Pydantic models; return appropriate status codes
2. Dependency Injection - Leverage Depends for DB sessions, config
3. Async vs Sync - Prefer async def for I/O-bound endpoints
4. Service Layer - Keep business logic in services/, not routes
5. Error Handling - Raise HTTPException with clear detail
6. Type Hints - Annotate everything; enable mypy --strict
7. Import Ordering: stdlib → third-party → app. → relative

---

## Error Handling Conventions

- Frontend: Throw custom Error subclasses; centralize API error handling
- Backend: Define custom exceptions in app/exceptions.py; use @app.exception_handler; log server-side

---

## Naming Conventions

| Entity | Convention |
|--------|------------|
| Files / Directories | kebab-case |
| Variables / Functions | camelCase (TS) / snake_case (Python) |
| Classes / Interfaces | PascalCase |
| Constants | UPPER_SNAKE_CASE |
| React Components | PascalCase matching file name |
| Pydantic Models | PascalCase ending with Schema/Model |
| SQLAlchemy Models | PascalCase singular |
| API Endpoints | kebab-case (/will/generate) |

---

## Project Structure

### Frontend (apps/web)
- app/ - Next.js pages router pages
- components/ - Reusable React components
- lib/ - Utilities and API clients
- __tests__/ - Test files

### Backend (apps/api)
- app/api/ - FastAPI route handlers
- app/services/ - Business logic
- app/models/ - SQLAlchemy models
- app/schemas/ - Pydantic schemas
- app/tests/ - Test files

---

## Cursor / Copilot Rules
No Cursor or Copilot instruction files present. Follow guidelines above.

---

*This file is intended for autonomous agents. Follow the guidelines verbatim when generating or modifying code.*
