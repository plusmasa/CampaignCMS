# Campaign Structure Plan (Multi-Type Campaigns)

## Purpose
Define a scalable structure for supporting multiple campaign types in the Campaign CMS, with clear UX patterns, data model, validation, and API contracts that work with our current demo stack (Node/Express + SQLite + React/Fluent 2). No code in this document—this is the implementation guide for the next coder.

## Summary Recommendation (Option 3: Wizard + Safe Duplicate) — Solution 2 UX
- Creation begins on the editor route but in a pre-draft state that shows a Type Picker (RadioGroup + disabled Continue until a selection).
- User selects a type (and optional preset) and clicks Continue. Only then do we create a Draft and seed its config from the chosen template.
- Type is “soft-locked” while config is empty (optional in-place change with reset). After meaningful config or Publish, type is immutable; use Duplicate-as-New-Type to convert.
- Presets (e.g., Quiz 3/10) are parameterized templates under a base type (QUIZ).

Why: avoids orphan Drafts, prevents accidental data loss (vs raw dropdown swap), keeps the mental model simple (pick → create → edit), and still allows early flexibility.

## Goals & Requirements
- Support multiple campaign types now and add new ones later without schema churn.
- Provide type-specific templates (scaffolds) and strict validation per type.
- Allow safe “convert” via Duplicate-as-New-Type instead of destructive in-place changes.
- Maintain backwards compatibility; existing campaigns map to OFFER.
- Keep using SQLite; JSON config stored as TEXT; optional JSON1 usage if available.

Initial Types/Presets
- OFFER: Banners with image/header/description (maps to current model)
- POLL: One question with exactly 2 options; record user selection
- QUIZ: N questions (e.g., 3 or 10), each with 3 choices and exactly 1 correct
- QUEST: 4 required actions; optional per-action cooldown; prize; display images/headers/descriptions per campaign and per action

## Data Model
A single Campaign entity with a type discriminator and a type-specific config JSON.

Stable columns (existing)
- id (PK), title (TEXT), state (TEXT), markets (JSON TEXT), channels (JSON TEXT), startDate (DATETIME), endDate (DATETIME), createdAt, updatedAt

New columns
- type TEXT NOT NULL CHECK (type IN ('OFFER','POLL','QUIZ','QUEST'))
- templateVersion INTEGER NOT NULL DEFAULT 1
- config TEXT NOT NULL DEFAULT '{}'  

Notes
- JSON stored as TEXT; application layer (Node) validates and serializes.
- If SQLite JSON1 functions are present, we can optionally add functional indexes later (non-blocking for MVP).
- Consider WAL mode for better concurrency (optional; demo-scale is fine without).

## Validation Strategy
Use a discriminated-union schema with Ajv:
- Discriminator: campaign.type
- Schema branches: one per type; only the matching branch validates the config.
- Presets (Quiz 3/10) seed different scaffolds and enforce constraints (e.g., questionCount, exactly 3 choices, one correctIndex).

Meaningful Config Heuristic (soft-lock trigger)
- OFFER: banners.length > 0 or any banner field not empty/placeholder
- POLL: non-empty question text or options modified from default
- QUIZ: questions.length > 0 or any non-placeholder prompt/choice changed
- QUEST: any action’s fields changed from defaults, cooldown set, or reward configured

## API Contracts (Additions/Adjustments)
- POST /api/campaigns (triggered by Continue in Type Picker)
  - Body: { title?, markets?, channels?, type, preset? }
  - Behavior: creates Draft with type, templateVersion=latest, config seeded from template (respect preset params like quiz questionCount). This endpoint is not called until the user selects a type and clicks Continue.
  - Returns: full campaign (including id) for navigation to /campaigns/:id

- GET /api/campaign-types
  - Returns list of supported types + presets and human labels (for Type Picker).

- PUT /api/campaigns/:id/config
  - Body: { config }
  - Behavior: validates config against the campaign’s type schema; rejects on mismatch.

- POST /api/campaigns/:id/duplicate
  - Query: type (optional). If provided and different from source, use new type + its template; otherwise clone same type + config.
  - Returns: new Draft campaign id.

- PATCH /api/campaigns/:id/type (optional)
  - Only allowed when state=Draft AND config is “empty” per heuristic; resets config to new template. Otherwise 409 + guidance to use duplicate.

- Existing workflow endpoints remain; type is immutable after Publish.

Errors & Status Codes
- 400: invalid type/preset, invalid config shape for type
- 409: attempt to change type when immutable (published or meaningful config exists)
- 422: schema validation failed (detailed Ajv errors)

## API Examples (Contracts)

### POST /api/campaigns — Create after type selection (Continue)

Request (Offer)
```json
{
  "type": "OFFER",
  "title": "Summer Promo",
  "markets": { "scope": "all" }
}
```

Request (Quiz preset)
```json
{
  "type": "QUIZ",
  "preset": { "questionCount": 10 }
}
```

Response 201
```json
{
  "success": true,
  "data": {
    "id": 123,
    "type": "QUIZ",
    "templateVersion": 1,
    "state": "Draft",
    "title": null,
    "markets": { "scope": "all" },
    "config": {
      "questions": [
        { "prompt": "", "choices": ["", "", ""], "correctIndex": 0 }
        // ... 9 more
      ]
    },
    "createdAt": "2025-08-08T19:00:00.000Z",
    "updatedAt": "2025-08-08T19:00:00.000Z"
  },
  "message": "Campaign created"
}
```

Response 400 (invalid preset)
```json
{
  "success": false,
  "message": "Invalid preset for type QUIZ",
  "error": "questionCount must be one of [3,10]"
}
```

### GET /api/campaign-types — List types and presets

Response 200
```json
{
  "success": true,
  "data": [
    { "type": "OFFER", "label": "Offer", "presets": [] },
    { "type": "POLL", "label": "Poll", "presets": [] },
    { "type": "QUIZ", "label": "Quiz", "presets": [ { "label": "Quiz 3", "questionCount": 3 }, { "label": "Quiz 10", "questionCount": 10 } ] },
    { "type": "QUEST", "label": "Quest", "presets": [] }
  ]
}
```

### PUT /api/campaigns/:id/config — Update type-specific config

Request (Quiz: set first question)
```json
{
  "config": {
    "questions": [
      { "prompt": "What is 2+2?", "choices": ["3", "4", "5"], "correctIndex": 1 },
      { "prompt": "", "choices": ["", "", ""], "correctIndex": 0 }
      // ... remaining scaffold entries
    ]
  }
}
```

Response 200
```json
{ "success": true, "data": { "updatedAt": "2025-08-08T19:05:00.000Z" }, "message": "Config updated" }
```

Response 422 (Ajv validation)
```json
{
  "success": false,
  "message": "Validation failed",
  "error": [
    { "instancePath": "/config/questions/0/correctIndex", "keyword": "enum", "message": "must be one of [0,1,2]" },
    { "instancePath": "/config/questions", "keyword": "minItems", "message": "must NOT have fewer than 3 items" }
  ]
}
```

### PATCH /api/campaigns/:id/type — Change type only for empty Drafts (optional)

Request
```json
{ "type": "OFFER", "preset": null }
```

Response 200 (reset applied)
```json
{ "success": true, "message": "Type changed and config reset to template" }
```

Response 409 (meaningful config present)
```json
{
  "success": false,
  "message": "Type change not allowed after content exists. Use duplicate-as-new-type.",
  "error": "immutable_type_after_meaningful_config"
}
```

### POST /api/campaigns/:id/duplicate — Safe duplicate (optionally convert type)

POST /api/campaigns/123/duplicate?type=QUIZ

Response 201
```json
{
  "success": true,
  "data": { "id": 456 },
  "message": "Campaign duplicated"
}
```

Response 400 (invalid target type)
```json
{ "success": false, "message": "Invalid type 'SURVEY'", "error": "unsupported_type" }
```

Notes
- All responses follow our standard format: success, data, message, timestamp (optional).
- For Ajv errors, return a concise array suitable for inline UI messages.
- Server enforces type immutability after Publish; client should also hide the control in those states.

## Frontend UX (Solution 2) — State & Routing

Route model
- New Campaign opens /campaigns/new in a new tab (same editor route).
- Pre-draft state: no campaignId; render Type Picker only.
- On Continue: call POST /api/campaigns with {type, preset?} → navigate to /campaigns/:id.
- Draft state: campaignId exists; render the standard editor with type-specific config UI.

Type Picker UI (pre-draft)
- Radio list of campaign types (and optional presets), with short descriptions and icons.
- Continue button disabled until a selection is made; enabled after selection.
- Deep-link support: /campaigns/new?type=QUIZ&preset=10 pre-selects and enables Continue.
- Error handling: show non-blocking error toast if create fails; keep selection and allow retry.
- Accessibility: keyboard navigable RadioGroup, visible focus, ARIA labels, disabled state announced.

Editor UI (draft)
- Show Type badge (and templateVersion) in header.
- If config is “empty,” optionally show a subtle “Change type” link that triggers a reset (confirmation required).
- If config is meaningful or state != Draft, hide/disable type changes and surface “Duplicate as new type” instead.

State machine (high-level)
- pre-draft (type: null, id: null) → on select+continue → draft (id: X, type: T)
- draft (empty config) ↔ change type (resets config to new template with confirmation)
- draft (meaningful) → locked draft (type immutable) → publish → live/complete
- any locked state: “Duplicate as new type” → new draft with new type and seeded template

State diagram

```
 [pre-draft]
   |
   | select type + Continue
   v
 [draft: empty config] <-----------------------------.
   |        ^                                        \
   | save   | change type (confirm, reset)            \
   |        |                                         \
   v        |                                          \
 [draft: meaningful] --soft-lock--> [draft: locked]       \
   |                                   |                \
   | publish/schedule                  | duplicate as    \
   v                                   | new type         \
 [scheduled] --------------------------- | ----------------> [draft: empty (new type)]
   |  unschedule                       |
   v                                   |
 [draft: locked]                         |
   |                                   |
   | auto start at publish time        |
   v                                   |
   [live]  --stop-->  [complete]         |
```

Legend and endpoints
- pre-draft → draft: POST /api/campaigns (body: { type, preset? })
- change type (only empty): PATCH /api/campaigns/:id/type (resets config) [optional]
- save config: PUT /api/campaigns/:id/config (Ajv validation per type)
- publish/schedule/unschedule/stop: existing workflow endpoints
- duplicate as new type: POST /api/campaigns/:id/duplicate?type=NEW_TYPE

Notes
- “empty config” means not meaningfully modified from template (heuristic).
- “soft-lock” occurs after meaningful config or on Publish; type becomes immutable.
- Duplicate flow never mutates the source; it creates a new Draft with the selected type and seeded template.

Edge cases
- Abandon /campaigns/new: no DB writes performed.
- Double-click Continue: client disables while awaiting POST; server may enforce idempotency by default via client-side lock.
- Refresh on /campaigns/new: remains pre-draft; refresh on /campaigns/:id: reloads draft editor.

## Template & Schema Management
- Template: default seeded config per type/preset; versioned by templateVersion.
- Schema: JSON Schema per type. Keep schemas alongside templates, version them together; server exposes latestVersion per type.
- QUIZ presets: preset.questionCount ∈ {3,10}; schema enforces minItems/maxItems and exactly 3 choices per question, one correctIndex (0..2).

Type Config Outlines (illustrative)
- OFFER.config
  - banners: [{ imageUrl, header, description }]
- POLL.config
  - question: string
  - options: [string, string]
  - recordSelection: boolean (default true)
- QUIZ.config
  - questions: [{ prompt, choices:[string,string,string], correctIndex: 0|1|2 }]
- QUEST.config
  - actions: Array<4> of { key, header, description, cooldownDays?, images:{ complete, incomplete } }
  - reward: { type, value }
  - display: { image, header, description }

## SQLite Considerations
- Storage: TEXT for JSON; app-layer validation is sufficient.
- Optional JSON1 usage (if available): json_extract, json_array_length for admin/reporting filters; not required for core CRUD.
- Optional functional indexes (later): e.g., idx_quiz_qcount ON json_array_length(json_extract(config,'$.questions'))
- Keep B-Tree indexes on (type), (state), (updatedAt) for dashboard queries.

## Migration Plan (Backwards Compatible)
1) Add columns: type (default OFFER), templateVersion (default 1), config (default '{}').
2) Backfill existing OFFER campaigns: move banner-like fields into config.banners; keep channels/markets untouched.
3) Update seed/reset scripts to create type/config from templates.
4) Data validation pass: ensure every row validates against its type schema.

Rollback Strategy
- Columns are additive; keep old fields until confident, then remove legacy banner fields in a later migration (if any exist outside config).

## Business Rules & Edge Cases
- Type selection required at creation.
- Type immutable after Publish; Draft soft-lock applies once meaningful config exists.
- Duplicate-as-New-Type creates a fresh Draft; original remains unchanged.
- Presets are UX sugar; resulting config must still pass schema for the type.
- Reporting: capture type-specific events later (separate Phase), not a blocker here.

## Testing Strategy
Unit
- Schema validation per type (happy paths + constraints violations)
- Heuristic for “meaningful config” across types

Integration
- Create with type/preset → seeded config correct
- Update config → Ajv validation errors surfaced properly
- Type change rules → soft-lock allowed/blocked; duplicate endpoint behavior

Migration
- Backfill produces valid OFFER configs; idempotent re-run

Non-functional
- Dashboard queries on (type/state/updatedAt) performant

## Delivery Plan (Phases)
- Phase 6.5 (This doc): Structure plan and API contracts, migration outline; no code yet. Read this file before implementation.
- Phase A: Backend foundations (columns, templates/schemas in code, Ajv, create/update/duplicate/type-change rules) + migration script.
- Phase B: Frontend creation wizard (Type Picker + presets, soft-lock UX, Duplicate-as-New-Type flow).
- Phase C: Type-specific editors (Offer, Poll, Quiz, Quest) wired to PUT /config with validation errors shown.
- Phase D: Indexes/optimizations and admin filters (optional JSON1 usage).

## Open Questions (Confirm with PM)
- POLL: Always exactly 2 options, or allow 2–N later?
- QUIZ: Lock at 3 choices per question, or allow 3–5 later?
- QUEST: Exactly 4 actions or min/max bounds? Are cooldown units only days?
- When should soft-lock trigger—first successful save or any field change? Keep current rule unless changed.

---

This plan defines the discriminator model, validation, API shape, and migration approach compatible with SQLite and our current architecture.
