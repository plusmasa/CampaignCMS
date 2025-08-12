# Changelog

All notable changes to this project will be documented in this file.

## [2025-08-11] Phase 9 – Offer editor polish, computed URL, and header actions
- Offer campaign UX
	- Added CTA field under Description (UI + schema/types).
	- Enforced character limits with live counters and hard caps: Header (30), Description (75), CTA (30).
	- Removed the Offer Image URL input from the editor UI (template remains for future media integration).
	- Added SKU and Form Label fields; updated backend schema/templates and frontend types.
	- Computed Redeem URL from SKU + Form Label in Draft editor with guidance messages when inputs are missing.
	- Read-only view displays the computed URL and includes a Copy URL icon button with toast feedback.
- Header actions ordering
	- Icon-only transparent actions (Duplicate, AI Duplicate, Delete) appear before secondary and primary actions across states.
- Dashboard/Partner
	- Partner tagging on Campaigns (partnerId) surfaced in Dashboard with column + filter; column visibility preferences persist.
- Runtime
	- Verified backend (3001) and frontend (3000) servers; health endpoints OK. Noted correct working directory for restarts.

## [2025-08-10] Multi-market variants editor + AI suggestions
- Frontend: Refactored Campaign Editor to support multiple market variants per campaign
	- Add/duplicate/delete variant cards with per-variant market selection and validation
	- Read-only rendering shows all persisted variants by market
	- Unified input widths and fixed collapsed dropdown label visibility
- Backend: Validation and persistence for variants
	- Ajv-based validateConfig now supports `config.variants[]` with allowed markets and uniqueness
	- `PUT /api/campaigns/:id/config` derives `campaign.markets` from variant markets
	- Legacy single-config remains supported
- AI assist: Introduced local suggestion endpoint and UI wiring
	- New endpoint: `POST /api/ai/suggest` returns a suggested variant `{ market, config }` for a target market
	- Frontend modal flow to generate and insert suggested variants; prevents duplicate markets
- Workflow/publish fixes: Save config and channel settings before publish/schedule, compute end date defaults, then transition state
 - Workflow gating: Server-side gating added for Publish/Schedule/Reschedule requiring channels, Ajv-valid content, unique variant markets, valid date ranges, and per-channel channelConfig required fields with light type checks
 - Frontend validation: Client-side per-channel validation added to Campaign Editor to surface errors before API submission
- Run & troubleshooting
	- Verified dev servers: Frontend on http://localhost:3000, Backend on http://localhost:3001
	- Resolved port EADDRINUSE on 3001; added notes to Runbook about starting from `campaign-cms/` project root

## [2025-08-07] Phases 5 & 6 Complete
- Marked Phase 5 and Phase 6 as COMPLETE in Project_Phases.md with timelines and deliverables
- Editor features, workflow actions, validations, and UI polish documented
- campaign-cms/README.md updated: current status, highlights, next steps (Phase 7)
- Frontend/Backend refinements including DataGrid tweaks and timezone display

## [2025-08-06] Phase 3.5 Complete
- Testing framework established (Jest + Supertest); utilities for DRY; logging and error handling
- Documentation updates across StartHere, Project_Phases, Technical_Specifications, BestPractices
- campaign-cms/README.md: project overview, scripts, endpoints

## [2025-08-04] Phase 4 Frontend Summary
- React 18 + TS + Vite setup, Fluent UI v9 adoption
- Dashboard, header, modals, DataGrid, search/filtering
- Type-safe API client and component architecture

---

Older per-phase summaries have been consolidated here. See repository history for additional details.
