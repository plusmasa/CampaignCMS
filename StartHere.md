# Start Here - Campaign Management CMS Project

## Welcome! 🚀

You’re joining a project already in motion. Read this to get oriented fast and avoid rework.

## 📚 Required Reading (read in order)

1) PRD_Campaign_Management_CMS.md
- Product scope, core entities, workflow rules, UI expectations.

2) Project_Phases.md
- Roadmap and current status; deliverables and QA per phase.

3) Technical_Specifications.md
- Architecture, DB schema, API endpoints, ports.

4) BestPractices.md
- CRITICAL: code quality, testing, performance, security, QA checklist.

5) WorkWithHuman.md
- Process, review cadence, and how to move between phases.

6) Documentation-Update-Summary.md
- Session-by-session changes; pointers to what changed recently.

7) Phase4-Frontend-Summary.md and Phase3-5-Summary.md
- What shipped in Dashboard and Editor groundwork.

8) Phase5-Testing-Plan.md
- Testing expectations and coverage goals for recent phases.

9) TimezonePlan.md
- How and where we display times (Pacific) and why.

10) campaign-cms/README.md
- Current app status, highlights, and next steps from the codebase perspective.

## 🔍 Current Status (keep this in mind)

- Phases 5 and 6 COMPLETE ✅
   - Campaign Editor: state-aware actions (Publish, Schedule, Unschedule, Stop, Duplicate) with confirmations, validations, and toasts.
   - Dashboard: right-rail filter panel transitions stabilized; DataGrid column animations intentionally removed.
   - Routing: workflow endpoints for publish/schedule/unschedule/stop; duplicate endpoint added.
   - Timezone: non-Draft time displays in America/Los_Angeles (Pacific).
- Tests: 126 passing, strong coverage (≈92% statements / 79% branches). Thresholds enforced by Jest config (≥60% globals).
- Next Phase: Phase 7 – Channel Configuration UI + Reporting.

Refer to Project_Phases.md for exact deliverables and definitions of done.

## ▶️ Run the app locally

Prereqs: Node 18+ recommended.

1) Install deps
- In repo root: npm install
- In frontend/: npm install

2) Start dev servers (backend + frontend)
- From repo root: npm run dev:full
- Backend: http://localhost:3001, Frontend: http://localhost:3000

3) If ports are stuck (3000/3001)
- Kill processes bound to ports or restart your shell; see BestPractices.md for the quick kill snippet.

Notes
- Backend auto-seeds SQLite on start; DB file at campaign-cms/backend/data/campaign_cms.sqlite
- Health: /api/health and /api/db-health

## 🧪 Testing & Coverage

- Run all tests: npm test
- Watch mode: npm run test:watch
- Coverage: npm run test:coverage
- Coverage thresholds (jest.config.json): 60% global min; current well above. Keep it green.

Scope
- Backend unit/integration tests (Jest + Supertest). No frontend tests yet.

## 🧹 Quality gates

- Lint backend: npm run lint
- Auto-fix backend: npm run lint:fix
- Frontend type-check: npm run type-check (from repo root)
- Build frontend: npm run build

Console warnings
- Some CLI scripts and logger use console; lint may warn. Warnings are acceptable there; avoid noisy logs in production paths.

## 🧭 Where to make changes

- Backend
   - Routes: campaign-cms/backend/routes/
   - Models/DB: campaign-cms/backend/models/ and backend/database/
   - Workflow: backend/routes/campaign-workflow.js (behavior tested but excluded from coverage report by config)

- Frontend (Vite + React 18 + TS + Fluent UI v9)
   - Pages: campaign-cms/frontend/src/pages/
   - Components: campaign-cms/frontend/src/components/
   - Services/API: campaign-cms/frontend/src/services/

## 🧩 Key design decisions to respect

- Editor actions are state-aware and require confirmations for destructive/irreversible ops.
- Validate title, channels, markets on write; no direct state change via PUT /api/campaigns — use workflow endpoints.
- Time display in Pacific for non-Draft states.
- Keep motion minimal and consistent; DataGrid column animations are intentionally removed.

## 🎯 Your first steps

1) Read the docs listed above, especially Documentation-Update-Summary.md for what changed recently.
2) Confirm you can run dev:full and hit the health endpoints.
3) Run tests with coverage; ensure thresholds pass.
4) Sync with Project_Phases.md and begin Phase 7 tasks (Channel config UI + Reporting) after approval.

## ✅ When you’re ready

- Tell the human you’ve read everything and can run the app/tests.
- Share a brief summary of Phase 7 scope you plan to tackle first and ask for approval.

Welcome aboard! 🎉

## 🛠️ Troubleshooting

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
   - Harmless. Adding `"type": "module"` to package.json removes it but may affect CommonJS requires. Keep as-is unless migrating.

- Console warnings in scripts/logger
   - CLI scripts and logger intentionally use console; lint may warn. Avoid adding noisy logs in request handlers.

- API route 404s from UI
   - Verify workflow paths match services:
      - Publish: `POST /api/workflow/publish/:id`
      - Unschedule: `POST /api/workflow/unschedule/:id`
      - Reschedule: `POST /api/workflow/reschedule/:id`
      - Stop: `POST /api/workflow/stop/:id`
   - For CRUD, use `/api/campaigns` routes; do not mutate `state` via `PUT /api/campaigns/:id`.

- Vite dev server flakiness
   - Clear node modules and reinstall if needed:
      ```bash
      cd campaign-cms
      rm -rf node_modules frontend/node_modules
      npm install && (cd frontend && npm install)
      ```
