# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

Shiksha-Setu is a GenAI-powered platform that ingests government teacher training PDFs and generates cluster-specific, micro-learning modules using a RAG pipeline, with optional vernacular translation and distribution via a web dashboard.

Core flow (Phase 1 backend complete, frontend in progress):
- Admin defines **Cluster Profiles** (e.g., tribal belt, low infrastructure).
- Admin uploads state training **Manuals** (PDFs) and indexes them for RAG.
- System generates **Modules** adapted to a cluster using Groq (Llama 3.x) + retrieved context.
- Optional **Translation** into Indian languages.
- Frontend will provide a split-screen "original vs adapted" review and export flows.

Key living specs are under `PRD/` (see below). Treat them as the source of truth for product behavior.

## Key documentation to consult first

- Root project overview and setup: `README.md`.
- Product requirements (living PRD): `PRD/Shiksha-Setu_Product_Requirements_Document.md`.
- Backend architecture and API details: `PRD/Backend_Phase1_Documentation.md`.
- Phase 1 implementation summary: `PRD/Phase_1_Implementation_Summary.md`.
- Backend-specific setup and structure: `backend/README.md` and `backend/STRUCTURE_MIGRATION.md`.
- Frontend setup and structure: `frontend/README.md`.
- Windows-specific backend/frontend startup notes: `WINDOWS_SETUP.md`.
- AI-assistant rules and documentation conventions: `.github/copilot-instructions.md` (summarized under "Conventions & rules").

When changing behavior or adding notable features, update the PRD(s) above (version, status, "Last Updated" and relevant sections) as part of the change.

## Commands and dev workflows

### Backend (FastAPI service)

All backend commands run from `backend/` unless otherwise noted.

**Initial setup**
- Create and activate virtualenv (generic example):
  - Windows PowerShell:
    - `python -m venv venv`
    - `venv\Scripts\Activate.ps1`
  - Windows Command Prompt:
    - `python -m venv venv`
    - `venv\Scripts\activate.bat`
  - Linux/macOS:
    - `python -m venv venv`
    - `source venv/bin/activate`

- Install dependencies:
  - `pip install -r requirements.txt`

- Environment file:
  - Copy template and edit secrets:
    - Windows: `copy .env.example .env`
    - Linux/macOS: `cp .env.example .env`
  - Populate at minimum:
    - `GROQ_API_KEY`
    - `DATABASE_URL` (defaults to SQLite in most docs)
    - Optional: translation/model-related keys if you use those features.

- Initialize database (creates core tables):
  - `python init_database.py`

**Running the backend server (development)**
- Simplest entrypoint (also used in several docs):
  - `python main.py`

- Explicit Uvicorn invocation (preferred when you need reload/port control):
  - `python -m uvicorn main:app --reload --port 8000`

Key URLs once running:
- API root / status: `http://localhost:8000/`
- Health check: `http://localhost:8000/health`
- OpenAPI / Swagger docs: `http://localhost:8000/docs`

### Backend tests

Backend tests live under `backend/tests/` and are plain Python scripts, not wired to a single test runner.

Common patterns:
- Change into tests directory:
  - `cd backend/tests`

- Quick service-level smoke test (translation, DB, AI, PDF libs):
  - `python test_quick.py`

- Translation API smoke test (requires backend server running on `localhost:8000`):
  - `python test_quick_translation.py`

- Simple API integration test (also expects server running):
  - `python test_api_simple.py`

- To run any single backend test script, call it directly, e.g.:
  - `python test_api_endpoints.py`

If you introduce `pytest` in the future, keep these existing scripts working or wrap them, as they are referenced from the Phase 1 documentation.

### Frontend (React + Vite)

All frontend commands run from `frontend/`.

- Install dependencies:
  - `npm install`

- Run dev server (Vite):
  - `npm run dev`
  - Default dev URL: `http://localhost:3000`

- Build for production:
  - `npm run build`

- Preview built bundle locally:
  - `npm run preview`

Vite configuration is in `frontend/vite.config.js`.

### Combined startup scripts (root directory)

From the repository root you can spin up backend and frontend with the provided scripts (see root `README.md`):

- Windows (PowerShell):
  - `./start.ps1`
- Windows (Command Prompt):
  - `start.bat`
- Linux/macOS:
  - `chmod +x start.sh`
  - `./start.sh`

These scripts assume the usual `backend` and `frontend` layouts and may expect virtualenv and Node dependencies to be installed first.

### Windows-specific notes

If PowerShell blocks script or virtualenv activation (execution policy errors), follow `WINDOWS_SETUP.md` for the exact `Set-ExecutionPolicy` and activation commands, or switch to Command Prompt for activation.

## Backend architecture (big picture)

The backend is a layered FastAPI application with a modular structure. Prefer the **modular directories** over legacy flat files when reading or modifying behavior.

High-level layout (see also `backend/README.md`, `PRD/Backend_Phase1_Documentation.md`, and `backend/STRUCTURE_MIGRATION.md`):

- `main.py`
  - FastAPI application entrypoint.
  - Wires up CORS, includes routers from `api/`, and exposes health/docs.

- `core/`
  - `config.py` – Pydantic settings; central place for env vars like `GROQ_API_KEY`, `DATABASE_URL`, translation/model options, and other global configuration.
  - `database.py` – SQLAlchemy engine, session factory, and database initialization helpers.
  - `vector_store.py` – Custom vector-store implementation used by the RAG pipeline instead of ChromaDB (chosen for Python 3.14 compatibility). Embeddings are persisted here (e.g., via a simple on-disk format) and accessed by services.

- `models/`
  - `database_models.py` – SQLAlchemy ORM models for the four main tables:
    - `Cluster` – teacher cluster profiles (geography, language, infrastructure, challenges, etc.).
    - `Manual` – uploaded training manuals and metadata, including RAG indexing status.
    - `Module` – AI-generated adapted training modules, linked to a manual + cluster.
    - `Feedback` – teacher/admin feedback records attached to modules.

- `schemas/`
  - `api_schemas.py` – Pydantic models used as request/response schemas across the API (e.g., cluster create/update, manual metadata, module responses, translation requests, feedback payloads).
  - These schemas define the external API contract; update them in sync with `api/` route changes and the PRD.

- `services/`
  - `pdf_processor.py` – PDF ingestion pipeline:
    - Extracts text from uploaded PDFs (PyPDF2 + pdfplumber).
    - Chunks text into overlapping segments (tunable chunk size/overlap) for embeddings.
  - `rag_engine.py` – Retrieval-Augmented Generation support:
    - Uses sentence-transformers to embed chunks.
    - Stores and queries embeddings via `core.vector_store`.
    - Provides `index_manual`-style operations and semantic search helpers for modules.
  - `ai_engine.py` – High-level AI orchestration around the Groq Llama models:
    - Builds prompts using cluster profiles + RAG context + original text.
    - Calls Groq via the `groq` SDK and returns adapted content.
  - `translation_service.py` – Production translation service using `deep-translator` (Google Translate) for 12+ Indian languages:
    - Single and batch translation.
    - Supported-language discovery and validation.
  - `translation_service_old.py` – Legacy / experimental translation path, kept for reference; do not extend it for new work unless you know you need that behavior.

- `api/`
  - `clusters.py` – CRUD for clusters (`/api/clusters`). Uses `models.Cluster` + corresponding Pydantic schemas.
  - `manuals.py` – Upload and manage manuals (`/api/manuals`), including file storage into an `uploads/`-style directory and RAG indexing triggers.
  - `modules.py` – Module generation and management (`/api/modules`): orchestrates RAG search, AI adaptation, optional translation, and persistence.
  - `translation.py` – Translation HTTP endpoints (`/api/translation/...`) backed by `translation_service`.

- `tests/`
  - Contains targeted scripts for service-level and endpoint-level checks (quick service health, translation behavior, minimal API integration). They assume the architecture above and, for API tests, a running server.

### Legacy flat files

`backend/STRUCTURE_MIGRATION.md` documents a migration from a flat layout (`config.py`, `database.py`, `models.py`, `schemas.py`, `pdf_processor.py`, `rag_engine.py`, `ai_engine.py`, `routes/`) to the modular structure described above.

- Those legacy root-level modules and the `routes/` directory may still exist but are considered **deprecated** in favor of `core/`, `models/`, `schemas/`, `services/`, and `api/`.
- When adding or modifying backend behavior, work in the modular directories and avoid reusing the legacy modules; treat them as historical only.

### Core domain flows (backend)

You can think in terms of four main domain flows, which are also how the API and services are organized:

1. **Cluster management**
   - Data lives in `models.Cluster`.
   - Business logic is minimal; most work is in validation and CRUD endpoints under `api/clusters.py`.
   - When adding cluster attributes or constraints, you must update: models, schemas, relevant API routes, and the PRD sections describing cluster profiles.

2. **Manual ingestion and indexing**
   - Upload handled in `api/manuals.py` (multipart form-data → file on disk + DB row in `Manual`).
   - `services.pdf_processor` extracts and chunks text.
   - `services.rag_engine` embeds chunks and persists to `core.vector_store`.
   - Manual records track whether they have been indexed; indexing endpoints flip that state after a successful pipeline run.

3. **Module generation (RAG + Groq)**
   - Initiated via `/api/modules/generate` in `api/modules.py`.
   - Flow:
     - Fetch cluster, manual, and indexed context.
     - Use RAG to retrieve relevant chunks.
     - Build an adaptation prompt respecting cluster constraints (e.g., low infrastructure, primary language) and safety requirements.
     - Call Groq via `ai_engine` to produce adapted content.
     - Optionally translate the result via `translation_service`.
     - Persist a `Module` record with metadata linking back to manual + cluster.

4. **Feedback capture**
   - Feedback is recorded as `Feedback` rows and exposed via module-related endpoints.
   - Used for future analytics/quality loops as described in the PRD.

When implementing new backend features, anchor them to one of these flows and mirror the existing layering (schema → service → API) instead of pushing logic into route handlers or raw database code.

## Frontend architecture (big picture)

The frontend is a React 18 + Vite SPA located under `frontend/` (see `frontend/README.md`).

Key structure:
- `src/main.jsx` – React/Vite entrypoint.
- `src/App.jsx` – Top-level application component and router shell.
- `src/components/` – Reusable UI components.
- `src/pages/` – Page-level views (e.g., dashboards and workflows to manage clusters, manuals, modules, and comparison views).
- `src/services/` – API client layer, typically using Axios to call the backend routes documented in the backend PRD.

Frontend responsibilities per PRD:
- Provide an admin "command center" with navigation for uploads, clusters, generated modules, and analytics.
- Implement the split-screen view: original PDF/manual content vs AI-adapted module.
- Surface approval and feedback flows before content is shared outward.
- Later-phase features (WhatsApp/PDF export, simple analytics) should also be modeled as separate pages or flows using this structure.

When adding new UI behavior, prefer:
- Page-level orchestration in `src/pages/`.
- Reusable widgets in `src/components/`.
- All backend HTTP calls encapsulated in `src/services/` so that routing and components do not embed URL details.

## Conventions & rules for AI-assisted changes

The `.github/copilot-instructions.md` file defines project-wide rules that apply to Warp as well:

### Style and communication

- Do not use emojis in code, comments, documentation, or commit messages.
- Keep messaging and inline documentation professional, clear, and direct.

### Documentation and PRD handling

- All **product requirements, technical specs, prompts, and planning docs** live under `PRD/`.
- The main PRD (`PRD/Shiksha-Setu_Product_Requirements_Document.md`) is a **living document**:
  - When adding features, changing architecture, or altering scope, update the relevant sections.
  - Maintain the PRD's version number, "Status", and "Last Updated" fields.
  - If a new feature has its own detailed spec, the main PRD must at least reference it and summarize how it integrates.
- When creating new PRD-like documents:
  - Place them inside `PRD/`.
  - Use descriptive filenames with underscores (e.g., `New_Feature_Spec.md`).

### Repository layout expectations

High-level structure (do not reorganize without updating docs and PRD):
- `PRD/` – All product requirements, technical specs, and planning docs.
- `backend/` – Backend application code (FastAPI, services, tests).
- `frontend/` – Frontend React + Vite application.
- `docs/` – For any future project documentation that is not part of the PRD set.

When adding new files, respect this layout so other tools and contributors can rely on it.

### Code organization and file size

- When any single code file approaches **400–500 lines**, prefer splitting it into smaller modules.
- Use either a numeric suffix (`filename_part1.py`, `filename_part2.py`) or a responsibility-based split (`filename_core.py`, `filename_utils.py`, etc.).
- At the top of each split file, add a brief comment explaining how the original file was divided and which related modules to consult.
- Update imports across the codebase to reflect the split.

These rules are important when adding new service logic, large schemas, or complex React components.

## How Warp should approach new work in this repo

- **Backend changes** should follow the existing layered pattern:
  - Define/update Pydantic schemas in `schemas/api_schemas.py`.
  - Implement business logic in `services/` (or a new service module if needed), using `core.config`, `core.database`, and `core.vector_store` primitives.
  - Expose behavior via FastAPI routers in `api/`, keeping route handlers thin.
  - Add or adapt targeted scripts under `backend/tests/` to validate new functionality, using the existing quick tests as a reference.

- **Frontend changes** should:
  - Use React Router in `App.jsx` / routing setup to introduce new screens.
  - Keep API interactions centralized in `src/services/`.
  - Favor small, composable components in `src/components/`.

- **Documentation updates** are not optional when behavior changes:
  - Update the relevant PRD section(s), backend/frontend READMEs if they describe the changed workflows, and ensure "Last Updated" metadata stays accurate.

By following the commands and structures above, future Warp instances should be able to run the stack locally, understand where any given behavior lives, and extend the system without fighting the existing architecture or documentation practices.