# Developer Runbook (Read-Only Orientation)

Use this when you need to run, test, or troubleshoot locally. If you’re only planning a feature, just skim for context.

## Run the app locally

Prereqs: Node 18+ recommended.

1) Install deps
- In project root `campaign-cms/`: `npm install`
- In `campaign-cms/frontend/`: `npm install`

2) Start dev servers (backend + frontend)
- From repo root: `npm run dev:full`
- Backend: http://localhost:3001, Frontend: http://localhost:3000

3) If ports are stuck (3000/3001)
- Kill processes bound to ports or restart your shell; see snippet below.

Notes
- Backend auto-seeds SQLite on start; DB file at `campaign-cms/backend/data/campaign_cms.sqlite`
- Health: `/api/health` and `/api/db-health`

## Testing & Coverage

- Run all tests: `npm test`
- Watch mode: `npm run test:watch`
- Coverage: `npm run test:coverage`
- Coverage thresholds (jest.config.json): 60% global min; current well above. Keep it green.

Scope
- Backend unit/integration tests (Jest + Supertest). No frontend tests yet.

## Quality gates

- Lint backend: `npm run lint`
- Auto-fix backend: `npm run lint:fix`
- Frontend type-check: `npm run type-check` (from repo root)
- Build frontend: `npm run build`

Console warnings
- Some CLI scripts and logger use console; lint may warn. Warnings are acceptable there; avoid noisy logs in production paths.

## Where to make changes

- Backend
   - Routes: `campaign-cms/backend/routes/`
   - Models/DB: `campaign-cms/backend/models/` and `backend/database/`
   - Workflow: `backend/routes/campaign-workflow.js` (behavior tested but excluded from coverage report by config)

- Frontend (Vite + React 18 + TS + Fluent UI v9)
   - Pages: `campaign-cms/frontend/src/pages/`
   - Components: `campaign-cms/frontend/src/components/`
   - Services/API: `campaign-cms/frontend/src/services/`
   - Types: `campaign-cms/frontend/src/types/`

## Troubleshooting

- Ports 3000/3001 already in use
   - Kill processes and restart dev servers.
   - macOS/zsh:
      ```bash
      lsof -ti tcp:3000 | xargs -r kill -9
      lsof -ti tcp:3001 | xargs -r kill -9
      ```

- DB issues (stale data, schema drift)
   - Reset and re-seed SQLite from repo root:
      ```bash
      cd campaign-cms
      npm run reset-db
      ```
   - DB file: `campaign-cms/backend/data/campaign_cms.sqlite` (delete to force a fresh seed next start).

- CORS / Codespaces
   - Codespaces origins are allowed by default.
   - Local: ensure FRONTEND_URL and ports match (defaults 3000 frontend, 3001 backend). Update `.env` if you change ports.

- Jest warnings: sqlite in-memory deprecation
   - Safe to ignore for now; tests use in-memory SQLite. Does not affect local dev DB.

- ESLint warning about eslint.config.js module type
   - Harmless. Adding "type": "module" to package.json removes it but may affect CommonJS requires. Keep as-is unless migrating.

- Console warnings in scripts/logger
   - CLI scripts and logger intentionally use console; lint may warn. Avoid adding noisy logs in request handlers.

- API route 404s from UI
   - Verify workflow paths match services:
      - Publish: `POST /api/workflow/publish/:id`
      - Unschedule: `POST /api/workflow/unschedule/:id`
      - Reschedule: `POST /api/workflow/reschedule/:id`
      - Stop: `POST /api/workflow/stop/:id`
   - For CRUD, use `/api/campaigns` routes; do not mutate `state` via `PUT /api/campaigns/:id`.
 
- AI suggestions
   - Endpoint: `POST /api/ai/suggest` with body `{ type, sourceConfig, targetMarket }`
   - Frontend service: `aiService.suggestVariant(...)`
   - Inserted via editor “AI Duplicate” flow; markets remain unique per campaign

- Vite dev server flakiness
   - Clear node modules and reinstall if needed:
      ```bash
      cd campaign-cms
      rm -rf node_modules frontend/node_modules
      npm install && (cd frontend && npm install)
      ```
