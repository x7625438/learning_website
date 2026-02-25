# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered learning platform frontend (Chinese-language UI: "AI赋能学习平台"). Frontend-only repo — the backend API is external, expected at `VITE_API_URL` (defaults to `http://localhost:5000`).

## Commands

All commands run from `frontend/`:

- **Dev server**: `npm run dev`
- **Build**: `npm run build` (runs `tsc && vite build`)
- **Lint**: `npm run lint`
- **Test (single run)**: `npm run test` (runs `vitest --run`)
- **Test (watch)**: `npm run test:watch`
- **Format**: Prettier is configured at root `.prettierrc` — no semicolons, single quotes, 100 char width

Pre-commit hook (Husky + lint-staged) runs `npx lint-staged` automatically.

## Architecture

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

**Routing** — flat route structure in `App.tsx`, all pages at top level (`/books`, `/papers`, `/quotes`, `/problems`, `/pomodoro`, `/relaxation`, `/documents`, `/resources`, `/brainstorm`, `/essays`, `/error-questions`)

**Shared UI components** — re-exported from `frontend/src/components/ui/index.ts` (Button, Card, Input, Textarea, LoadingSpinner, LoadingOverlay, ProgressBar). Use these for consistency.

**Types** — API response/entity types in `frontend/src/types/api.ts`

**Custom Tailwind** — `primary` color palette (blue-based), custom animations (`fade-in`, `slide-up`, `slide-down`, `pulse-slow`), `xs` breakpoint at 475px

## Conventions

- UI text is in Chinese (Simplified)
- Feature pages live in `frontend/src/pages/`, each typically composed of feature-specific components from `frontend/src/components/`
- React Query is configured with 5-minute stale time and single retry
- Docker production build uses multi-stage (node:18-alpine → nginx:alpine)
