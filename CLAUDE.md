# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack AI-powered learning platform ("AI赋能学习平台", Chinese-language UI). Flask backend + React frontend, using Alibaba DashScope (Qwen LLM) via OpenAI-compatible API.

## Commands

**Backend** (run from `backend/`):
- **Start server**: `python app.py` — runs on http://localhost:5000, auto-initializes SQLite DB
- **Install deps**: `pip install -r requirements.txt`
- **Health check**: `curl http://localhost:5000/api/health`

**Frontend** (run from `frontend/`):
- **Dev server**: `npm run dev` — runs on http://localhost:5173
- **Build**: `npm run build` (runs `tsc && vite build`)
- **Lint**: `npm run lint`
- **Test (single run)**: `npm run test` (runs `vitest --run`)
- **Test (watch)**: `npm run test:watch`
- **Format**: Prettier at root `.prettierrc` — no semicolons, single quotes, 100 char width

Pre-commit hook (Husky + lint-staged) runs `npx lint-staged` automatically.

## Backend Architecture

**Stack**: Python 3, Flask 3.0, SQLite (WAL mode), OpenAI SDK (pointing at DashScope)

**Core wiring**:
- `backend/app.py` — Flask app init, CORS, blueprint registration (50MB max upload)
- `backend/config.py` — API keys, DB path, model names (`qwen2.5-7b-instruct-1m` for text, `qwen2.5-vl-32b-instruct` for vision)
- `backend/database.py` — `get_db()` returns SQLite connection with Row factory; `init_db()` runs `schema.sql`
- `backend/schema.sql` — All table definitions (CREATE IF NOT EXISTS)

**AI service layer** (`backend/services/ai_service.py`):
- `chat_completion(messages, temperature)` — calls DashScope via OpenAI SDK, no max_tokens limit
- `chat_completion_json(messages)` — same but strips markdown fences and parses JSON response
- `translate_long_text(text, chunk_size=2000)` — splits text by paragraphs into chunks for translation

**Shared utilities** (`backend/utils/`):
- `helpers.py` — `gen_id()` (UUID4), `now_iso()`, `row_to_dict()`, `error_response()`, `parse_json_field()`
- `file_parser.py` — `extract_text(filepath)` handles TXT, PDF (PyPDF2), DOCX (python-docx)

**Blueprint pattern** — each feature module is a Flask Blueprint in `backend/blueprints/`, registered in `app.py`. All use `/api/v1/<module>` prefix (except pomodoro at `/api/pomodoro`). DB columns use `snake_case`; JSON responses use `camelCase` via a `_format_*()` helper in each blueprint. Each endpoint manually calls `get_db()` and `db.close()`.

## Frontend Architecture

**Stack**: React 18, TypeScript, Vite 5, Tailwind CSS 3, Zustand, React Query v5, React Router v6, Axios, Framer Motion

**State management** — Zustand stores in `frontend/src/store/index.ts`:
- `useUserStore` — auth user (persisted to localStorage)
- `useUIStore` — sidebar, theme, loading (persisted)
- `useNotificationStore` — toast notifications with auto-dismiss
- `useLearningProgressStore` — study metrics (persisted)

**API layer** — `frontend/src/utils/api-client.ts`:
- Singleton `apiClient` wrapping Axios with Bearer token auth from `localStorage('auth_token')`
- Response interceptor auto-shows error notifications via `useNotificationStore`
- All endpoints defined in `API_ENDPOINTS` constant (versioned under `/api/v1/`)
- 30s timeout, JSON content type

**Routing** — flat route structure in `App.tsx`, all pages at top level (`/books`, `/papers`, `/quotes`, `/problems`, `/pomodoro`, `/relaxation`, `/documents`, `/brainstorm`, `/essays`, `/error-questions`, `/notes`)

**Shared UI components** — re-exported from `frontend/src/components/ui/index.ts` (Button, Card, Input, Textarea, LoadingSpinner, LoadingOverlay, ProgressBar). Use these for consistency.

**Types** — API response/entity types in `frontend/src/types/api.ts`

**Custom Tailwind** — `primary` color palette (blue-based), custom animations (`fade-in`, `slide-up`, `slide-down`, `pulse-slow`), `xs` breakpoint at 475px

## Conventions

- UI text is in Chinese (Simplified)
- Feature pages live in `frontend/src/pages/`, each composed of feature-specific components from `frontend/src/components/`
- Frontend userId fallback: `useUserStore((s) => s.user)` with `user?.id || 'demo-user'`
- Tab-based pages use `useState` for active tab + conditional rendering (see ErrorQuestions.tsx, Notes.tsx as examples)
- Vite dev server proxies `/api` to Flask backend (configured in `frontend/vite.config.ts`)
- React Query: 5-minute stale time, single retry
- Adding a new feature module requires: blueprint in `backend/blueprints/`, table in `schema.sql`, register in `app.py`, page in `frontend/src/pages/`, route in `App.tsx`, nav item in `Layout.tsx`
- Docker production build uses multi-stage (node:18-alpine → nginx:alpine)
