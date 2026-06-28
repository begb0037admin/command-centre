# command-centre — Living Handover Document

**Last updated:** 2026-06-28 (sidebar reorder, Oxford crest restored, Daily Focus card margin fix)
**Status:** Active — Module 1 live at https://begb0037admin.github.io/command-centre/

---

## Architecture

| Component | Description |
|---|---|
| `index.html` | Shell — HTML structure only. Oxford navy sidebar (340px), blue-grey main (#f5f7fb), Inter font. No framework, no build step. Loads css/styles.css → js/api.js → js/app.js. |
| `css/styles.css` | All styles extracted from former monolithic index.html. |
| `js/api.js` | Data layer — constants, task state, loadTasks(), fetchTasksRemote(), mergeRemote(), persistTasks(), showSaveToast(). No DOM dependencies at load time. |
| `js/app.js` | UI layer — all rendering, interaction, drag/drop, suggestions, sidebar resize, init. Load order: after api.js. |
| `data/tasks.json` | Task data. Fields: id, title, tier (today/week/parked), source, emailRef, notes, actions[], dateAdded. |
| `governance/` | Governance workflow standard (v1.1), phase templates, and phase evidence artefacts. |
| `docs/project/generated/` | Approved Codex artefact path. All Codex-produced review artefacts are committed here. |

---

## Current State (fully working as of 2026-06-23)

### Working
- GitHub Pages live — `begb0037admin.github.io/command-centre/`
- `data/tasks.json` loads on page open (cache-busted with `?_=Date.now()`)
- Three priority tiers: Today / Tomorrow / This Week / Parked
- Sidebar: Oxford navy, 320px, real OUO.jpg crest (base64), live task counts per tier, week-start date, Add Task button
- Collapsible task drawers: chevron toggle, action bullet list (→), source/emailRef/date metadata grid, editable notes with Save button, Move To tier controls
- Quick-add panel: floating, title + tier picker + source + emailRef + notes, defaults source to "Manual", Esc to close
- Done state: checkbox tick fades + strikes through card, persists in localStorage (`commandCentre_done_v1`)
- Hide/Show Done toggle in header
- Time-aware greeting: Good morning / afternoon / evening, Kevin
- Cloudflare Worker write-back (`cc-tasks-writer.kevinlelitte.workers.dev`) — PAT held server-side; tasks.json writes, tier moves, notes edits and suggestion drags all persist from any machine/browser ✅ **Confirmed working 2026-06-23**
- 'From your inbox' suggestion panel — drags AI-proposed tasks into tier lists; dismissals persist in localStorage
- **Tier focus mode** — selecting a tier in the sidebar dropdown (Today/Tomorrow/This Week/Parked) collapses all other tier columns and expands the selected one full-width. "All" returns to the four-column grid. Add button targets the focused tier.
- **Badge CSS normalised** — NEW (green) and UPDATED (blue) badges match Work Inbox exactly
- **Emoji removed** from all three "Open email" button locations
- **Save-status toast** — centred bottom toast: "Saving…" (blue), "Saved ✓" (green, 3s auto-dismiss), "Save failed ✗ (HTTP XXX)" (red, tap to dismiss). Sidebar "Last save" row.
- **Sidebar nav order (2026-06-28):** Daily Focus widget → From your inbox → Tasks counts → Links → My Links

### Known Limitations (by design — v1)
- Done state in localStorage is keyed by task ID — if `tasks.json` is regenerated with new IDs, done state resets.

### GitHub Pages
- Enabled manually by Kevin after first push (Settings → Pages → main / root)
- Deploy time ~1 min after push to main

---

## File Locations

| File | Path |
|---|---|
| Task data | `data/tasks.json` |
| Dashboard shell | `index.html` (repo root) |
| Styles | `css/styles.css` |
| Data layer | `js/api.js` |
| UI layer | `js/app.js` |
| Oxford crest | Embedded as base64 in `index.html` (source: OUO.jpg) — full 10,416-char JPEG, restored 2026-06-28 |
| Inbox suggestions | `data/inbox_suggestions.json` (written by work-inbox fetch_inbox.py Phase 3.5) |
| Triage ledger | `data/triage_ledger.json` (dedup tracker for Phase 3.6 auto-updates) |
| Archive | `Archive/tasks_backup_YYYYMMDD.json` (auto-created before every write) |
| Governance standard | `governance/GOVERNANCE_WORKFLOW_STANDARD.md` (v1.1) |
| Phase 1 Evidence Package | `governance/evidence/PHASE_1_EVIDENCE_PACKAGE.md` |
| Phase 1 Review Request | `governance/evidence/PHASE_1_REVIEW_REQUEST.md` |
| Phase 1 Remediation Evidence | `governance/evidence/PHASE_1_REMEDIATION_EVIDENCE.md` |
| Phase 1 Validation Request | `governance/evidence/PHASE_1_VALIDATION_REQUEST.md` |
| Phase templates | `governance/templates/` (9 templates) |
| Codex artefact path | `docs/project/generated/` |
| Phase 1 Challenge Report (Codex) | `docs/project/generated/PHASE_1_CHALLENGE_REPORT.md` |
| Phase 1 Remediation Request (Codex) | `docs/project/generated/PHASE_1_REMEDIATION_REQUEST.md` |
| CLOUDFLARE Plan Review Request | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_REVIEW_REQUEST_20260625.md` |
| CLOUDFLARE Seat B Challenge Brief | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_GOVERNANCE_CHALLENGE_BRIEF_20260625.md` |
| CLOUDFLARE Codex Challenge Report | `docs/project/generated/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_CHALLENGE_REPORT_20260625.md` |
| CLOUDFLARE Codex Remediation Request | `docs/project/generated/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_REMEDIATION_REQUEST_20260625.md` |
| CLOUDFLARE Remediated Plan | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_PLAN_REMEDIATED_20260625.md` |
| CLOUDFLARE Remediation Evidence | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_REMEDIATION_EVIDENCE_20260625.md` |
| CLOUDFLARE Validation Request | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_VALIDATION_REQUEST_20260625.md` |
| CLOUDFLARE Codex Validation Report | `docs/project/generated/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_VALIDATION_REPORT_20260625.md` |
| CLOUDFLARE Governance Review Request | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_GOVERNANCE_REVIEW_REQUEST_20260625.md` |
| CLOUDFLARE Governance Decision | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_GOVERNANCE_DECISION_20260625.md` |

---

## Governance Workflow

All multi-repository governance operations follow the 6-stage workflow defined in `governance/GOVERNANCE_WORKFLOW_STANDARD.md` (v1.1, updated 2026-06-21, commit `65b753b5cf5242307786dda0eca09c766812878d`).

### Governance Workflow Correction (2026-06-21)

**Trigger:** Codex attempted to commit review artefacts during Phase 1 Stage 3 without a clearly defined write path, resulting in local file outputs and failed commits.

**Correction applied:**
- GOVERNANCE_WORKFLOW_STANDARD.md updated to v1.1 — Section 9 (Codex Controlled Write Constraint) added.
- Artefact table updated: Codex-produced artefacts (Challenge Report, Remediation Request, Validation Report) now explicitly assigned to `docs/project/generated/`.
- Agent responsibilities updated: Codex write boundary and operating mode verification made mandatory.
- Claude Code fallback obligation made explicit: when Codex cannot write, Claude Code commits Codex artefact content exactly as supplied, no edits.
- 6 Codex-facing templates updated: PHASE_REVIEW_REQUEST, PHASE_CHALLENGE_REPORT, PHASE_REMEDIATION_REQUEST, PHASE_VALIDATION_REQUEST, PHASE_VALIDATION_REPORT, PHASE_GOVERNANCE_REVIEW_REQUEST.
- All updated templates now include: Codex Operating Mode section (Option A / Option B), Claude Code Commit Handoff section with exact filenames, target path, wording preservation requirement, and HANDOVER.md update obligation.

**Codex operating model (corrected):**

| Role | Agent | Write path |
|------|-------|------------|
| Primary implementation and remediation | Claude Code | `governance/evidence/` + all production files |
| Independent technical reviewer | Codex | `docs/project/generated/` only |
| Programme governance decision authority | ChatGPT / Kevin | `governance/evidence/` (Governance Decision only) |

**Approved Codex artefact path:** `begb0037admin/command-centre/docs/project/generated/`

**Approved Codex artefacts:**
- `PHASE_X_CHALLENGE_REPORT.md`
- `PHASE_X_REMEDIATION_REQUEST.md`
- `PHASE_X_VALIDATION_REPORT.md`
- `PHASE_X_GOVERNANCE_REVIEW_REQUEST.md`

**Codex must not write, modify, or commit:** governance standards, templates, implementation files, production files, operational files, application code, backups, remediation evidence, HANDOVER.md (unless explicitly authorised).

**Files updated in this correction:**

| File | Content SHA |
|------|-------------|
| `governance/GOVERNANCE_WORKFLOW_STANDARD.md` | `493c93d7abb3d89f4efa770a5430ebd693a29511` |
| `governance/templates/PHASE_REVIEW_REQUEST_TEMPLATE.md` | `bcc71e7708a6a86f89ee37a76fad380f6527c881` |
| `governance/templates/PHASE_CHALLENGE_REPORT_TEMPLATE.md` | `1f77c00bb35a397037cc18ad0d0b759ad289ba4d8acf` |
| `governance/templates/PHASE_REMEDIATION_REQUEST_TEMPLATE.md` | `74407d59ecaac165c48e6094d27894164ec33f8c` |
| `governance/templates/PHASE_VALIDATION_REQUEST_TEMPLATE.md` | `d370ba3b58cc1611b0bb95467c6e6ebe3a3cd4e3` |
| `governance/templates/PHASE_VALIDATION_REPORT_TEMPLATE.md` | `c49e079346ad6fc025423b0f58c8e5a0c96f209c` |
| `governance/templates/PHASE_GOVERNANCE_REVIEW_REQUEST_TEMPLATE.md` | `8f9752f267b5162a680c80d75531181dbd76e4d1` |

**Workflow/template correction commit SHA:** `65b753b5cf5242307786dda0eca09c766812878d`

**All 7 files GET-verified at that commit SHA.**

### Template Index

| Template | Path | Stage |
|----------|------|-------|
| Evidence Package | `governance/templates/PHASE_EVIDENCE_PACKAGE_TEMPLATE.md` | 2 |
| Review Request | `governance/templates/PHASE_REVIEW_REQUEST_TEMPLATE.md` | 3 |
| Challenge Report | `governance/templates/PHASE_CHALLENGE_REPORT_TEMPLATE.md` | 3 |
| Remediation Request | `governance/templates/PHASE_REMEDIATION_REQUEST_TEMPLATE.md` | 4 |
| Remediation Evidence | `governance/templates/PHASE_REMEDIATION_EVIDENCE_TEMPLATE.md` | 4 |
| Validation Request | `governance/templates/PHASE_VALIDATION_REQUEST_TEMPLATE.md` | 5 |
| Validation Report | `governance/templates/PHASE_VALIDATION_REPORT_TEMPLATE.md` | 5 |
| Governance Review Request | `governance/templates/PHASE_GOVERNANCE_REVIEW_REQUEST_TEMPLATE.md` | 6 |
| Governance Decision | `governance/templates/PHASE_GOVERNANCE_DECISION_TEMPLATE.md` | 6 |

### Workflow Summary (corrected v1.1)
| Stage | Action | Produced by | Path |
|-------|--------|-------------|------|
| 1 — Execute | Perform approved writes | Claude Code | Various repos |
| 2 — Evidence | Evidence Package | Claude Code | `governance/evidence/` |
| 3 — Challenge | Review Request | Claude Code | `governance/evidence/` |
| 3 — Challenge | Challenge Report + Remediation Request | Codex | `docs/project/generated/` |
| 4 — Remediation | Remediation Evidence | Claude Code | `governance/evidence/` |
| 5 — Validation | Validation Request | Claude Code | `governance/evidence/` |
| 5 — Validation | Validation Report | Codex | `docs/project/generated/` |
| 6 — Decision | Governance Review Request | Claude Code | `governance/evidence/` |
| 6 — Decision | Governance Decision | Kevin | `governance/evidence/` |

---

## Phase 1 Governance Artefacts

### Artefacts Committed

| Artefact | Path | Commit SHA | Content SHA | Verified |
|----------|------|------------|-------------|----------|
| PHASE_1_EVIDENCE_PACKAGE.md | `governance/evidence/PHASE_1_EVIDENCE_PACKAGE.md` | `f941af6984664efd70d70e06dccf9b7a8a1dfc2a` | `07449bef60a2e8a5ffa8a17445052c20e0b0a742` | ✅ GET confirmed |
| PHASE_1_REVIEW_REQUEST.md | `governance/evidence/PHASE_1_REVIEW_REQUEST.md` | `f941af6984664efd70d70e06dccf9b7a8a1dfc2a` | `42275d4d7569a988eb75d99e91d96ddff391a71a` | ✅ GET confirmed |
| PHASE_1_CHALLENGE_REPORT.md (Codex Option B) | `docs/project/generated/PHASE_1_CHALLENGE_REPORT.md` | `c2ca67c5d3d8c650d05555f5bd3e2ea3439aca36` | `9c64b8c8ef950d4ffce3bd4f78ce06668bae1d54` | ✅ GET confirmed |
| PHASE_1_REMEDIATION_REQUEST.md (Codex Option B) | `docs/project/generated/PHASE_1_REMEDIATION_REQUEST.md` | `c2ca67c5d3d8c650d05555f5bd3e2ea3439aca36` | `2840d1e2795db082e873d536261e0413655ccfcb` | ✅ GET confirmed |
| PHASE_1_REMEDIATION_EVIDENCE.md | `governance/evidence/PHASE_1_REMEDIATION_EVIDENCE.md` | `d3ac11c585eaccc216f60468178349aa06376f51` | `e30a9dd78474003bdc0f9edc3deb94b9473c8eeb` | ✅ GET confirmed |
| PHASE_1_VALIDATION_REQUEST.md | `governance/evidence/PHASE_1_VALIDATION_REQUEST.md` | `d3ac11c585eaccc216f60468178349aa06376f51` | `fad75a3549923b4a3cc7dfd03b6a08312c3adadd` | ✅ GET confirmed |

### Codex Option B Handoff Record

| Field | Value |
|-------|-------|
| Codex operating mode | Option B — Read-Only Reviewer With Claude Code Commit Handoff |
| Reason | GitHub connector returned expired-token errors; no GH_TOKEN or GITHUB_TOKEN present |
| Artefacts committed by Claude Code | `PHASE_1_CHALLENGE_REPORT.md`; `PHASE_1_REMEDIATION_REQUEST.md` |
| Target path | `docs/project/generated/` |
| Wording preserved | YES — committed exactly as supplied by Codex, no edits |
| Commit SHA | `c2ca67c5d3d8c650d05555f5bd3e2ea3439aca36` |
| Both files GET-verified | YES |

### Phase 1 Workflow Status

| Stage | Status |
|-------|--------|
| Stage 1 — Execute (AGENT_MODEL v2.1 propagation) | ✅ Complete — all 9 repos at v2.1 |
| Stage 2 — Evidence | ✅ Complete |
| Stage 3 — Challenge | ✅ Complete — GAPS FOUND |
| Stage 4 — Remediation | ✅ Complete |
| Stage 5 — Validation | ⏳ Pending — next agent: Codex |
| Stage 6 — Governance Decision | 🔲 Awaiting Kevin |

**Phase 1 Stage 5 entry point:** `governance/evidence/PHASE_1_VALIDATION_REQUEST.md`

### Phase 1 v2.1 Estate — Final State

All 9 governed repositories are now at AGENT_MODEL.md v2.1 (blob `fba303449462c5a1c031cf47010ae8788f8a1db2`).

| Repository | Wave | Backup SHA | Write commit SHA | Verified |
|---|---|---|---|---|
| ag-flexpoints | Wave 1 | `125c2a6c` | `862ace12` | ✅ |
| hris-change-requests | Wave 1 | `69332c44` | `0e371d3d` | ✅ |
| clockify | Wave 2 | `c226199d` | `05755a08` | ✅ |
| hr-fa-knowledge-base | Wave 2 | `c226199d` | `2c386f43` | ✅ |
| hr-projects | Wave 2 | `c226199d` | `3194332c` | ✅ |
| meeting-records | Wave 2 | `f708523d` | `f5b737cf` | ✅ |
| hris-dashboard | Wave 2 | `3855713e` | `439e5b85` | ✅ |
| hris-launcher | Wave 2 | `d15e4b7e` | `9d273455` | ✅ |
| command-centre | Wave 2 | `5d5ff188` — commit `1419d4ad` | `d6febbe5` | ✅ |

---

## CLOUDFLARE_PHASE_SPLIT_MIGRATE — Governance Artefacts

**Status: Phase 3 COMPLETE — cc.lelitte.co.uk and wi.lelitte.co.uk both live. Phase 2 functional equivalence check (browser-level) pending Kevin sign-off (Gate 2.0).**

### Governance Chain

| Stage | Artefact | Commit SHA |
|---|---|---|
| Pre-execution | Plan Review Request | `2ab2dd5563eb1aa4fac42e436ae1efd27687e919` |
| Pre-execution | Seat B Challenge Brief (V2, V6, V7) | `be0a088cf1160cec23f7e8781c331062d9516cb1` |
| Stage 3 | Codex Challenge Report (revised — fallback) | `d6a18be45225cb44d5ec89632cace9071c5950d1` |
| Stage 3 | Codex Remediation Request (revised — fallback) | `d6a18be45225cb44d5ec89632cace9071c5950d1` |
| Stage 4 | Remediated Plan + Remediation Evidence | `96aac2c1c6b6cb7a0df556e411a47c21f7cb79d6` |
| Stage 5 | Validation Request | `63f59a32647096dd2347ddf0d99bd469873b120f` |
| Stage 5 | Codex Validation Report (ALL PASS — fallback) | `57d241bc3bb282ef0569cab9b6395c813e90ad64` |
| Stage 6 | Governance Review Request | `ab7cf77f3f892b3707f537dcea20d574d96b8437` |
| Stage 6 | **Governance Decision — APPROVED** | `8baeecc98302e3f6a988cddda6859ec6046cd4bc` |

### Golden Restore Point (captured at governance approval)

| Item | Value |
|---|---|
| `index.html` blob SHA | `b4e0d5d8d1546c9cc28bb5161fc60b0daebc63cd` |
| `data/tasks.json` blob SHA | `cd0b540cfca6e22426fb2e46335cd8a10c1308d3` |
| Repo HEAD at approval | `8baeecc98302e3f6a988cddda6859ec6046cd4bc` |
| Hosting | GitHub Pages — `begb0037admin.github.io/command-centre/` |
| Worker | `cc-tasks-writer.kevinlelitte.workers.dev` |

*Full baseline capture (exact CORS allowlist, GitHub Pages settings, github-proxy smoke test) is Phase 0.2 of Stage 1 — to be completed at start of next session.*

### Approved Plan Summary

Remediated plan at `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_PLAN_REMEDIATED_20260625.md` (commit `96aac2c1c6b6cb7a0df556e411a47c21f7cb79d6`). Key phases:

- **Phase 0** — Governance baseline, full restore-point capture, governed CLAUDE.md update (Gate 0.3 — Kevin approval required)
- **Phase 1** — File split on GitHub Pages: `index.html` shell + `css/styles.css` + `js/app.js` + `js/api.js` (Gate 1.0 — Kevin approval required)
- **Phase 2** — 25-item functional equivalence verification on GitHub Pages (Gate 2.0 — Kevin sign-off)
- **Phase 3** — Cloudflare Pages migration, dual-origin transition, CORS update (Gates 3.0–3.6 — Kevin approval at each)

Work-inbox followed the identical pattern once command-centre Phase 3 was confirmed stable.

---

## Next Action

**Phase 2 (functional equivalence check) — next:** Browser-level test of `https://cc.lelitte.co.uk`. Check: task load, tier moves, quick-add, notes edit, done state, inbox suggestions (+ tier buttons, dismiss), tier focus mode, sidebar resize, crest. Source-level check passed 2026-06-27 — see session note. Browser sign-off by Kevin closes Gate 2.0.

**After Gate 2.0:** Remaining dashboards custom domain rollout — hris-launcher (`hris.lelitte.co.uk`), hr-fa-knowledge-base (`kb.lelitte.co.uk`), hris-dashboard (`hris-dash.lelitte.co.uk`).

**Parked feature:** "Merge suggestion into existing task" — "+ Add to task" button on suggestion cards appends a dated action entry to an existing task and dismisses the card.

**Phase 1 Stage 5 (outstanding — Codex):**
Codex to validate `PHASE_1_REMEDIATION_EVIDENCE.md` against `PHASE_1_VALIDATION_REQUEST.md` and produce `PHASE_1_VALIDATION_REPORT.md` in `docs/project/generated/`.

---

## Session Notes

### 2026-06-08 — Module 1 build (Hope cross-domain)
- Kevin hit token cap mid-session; Hope completed build under Cross-Domain Code Brief
- Oxford crest: Kevin uploaded OUO.jpg — embedded as base64
- All 13 seed tasks enriched with action bullet arrays from SK 1-1 Granola transcript

### 2026-06-22 — Sidebar styling audit: stale banner, task counts, context bar

**Command Centre:**
- Stale "Watch — stale today" banner moved from sidebar to main content area, above the tier grid. Oxford blue tint (`#eff6ff` / `#bfdbfe` / `#1e3a8a`). Two-column layout: task list with red age pills (left) + stats panel — count, oldest, average age, stalled 2w+ (right). Title and age pills in `#dc2626`. Subtitle: "These tasks have been in your Today list for 3+ days. Move them on, park them, or mark done."
- Live task counts widget added to sidebar (Today / Tomorrow / This week / Actions due). Reads directly from in-memory `tasks` array; updates on every `renderBoard()` call — no fetch, no caching issues.
- Banner and counts are fully dynamic: move a card → banner and sidebar update instantly.
- All changes approved by Kevin and live on main.

**Work Inbox:**
- Context bar restyled to Oxford blue tint matching Command Centre stale banner.
- "Context" label bumped to 17px, colour `#1d4ed8` to stand out.
- Context paragraph split sentence-per-line with red dash bullets.
- Tasks widget: label bumped to 13px, live heartbeat dot (green=success, red=fail), 30s polling via proxy URL.

### 2026-06-22 — Tier focus mode
- Sidebar tier dropdown now filters the board: selecting a tier collapses all others and expands the selected one full-width.
- "All" option added to return to normal four-column view.
- Commit: `f82178e`

### 2026-06-18 — Badge alignment + UI polish
- Badge alignment fixed; badge CSS normalised to match Work Inbox; emoji stripped from Open email buttons.
- Live on main: commit `e7c4b22`.

### 2026-06-21 — Governance Phase 1 complete (execution)
- AGENT_MODEL.md v2.0 propagated to all 7 repositories.
- Datestamped backups created in Archive/ for each repo before every write.
- All 7 v2.0 writes verified by GET; content SHA `05fc8adaab7e5b9524fe2c4f85ace667d7e04801` identical across all repos.
- CONSTITUTION.md v1.0 SHA `a25878b0` confirmed unchanged.

### 2026-06-21 — Governance workflow standard + templates (v1.0 → v1.1)
- `governance/GOVERNANCE_WORKFLOW_STANDARD.md` — 6-stage workflow, 10-artefact set, agent responsibilities, handoff requirements.
- 9 phase templates committed to `governance/templates/`. Correction to v1.1 applied same session.
- Correction commit SHA: `65b753b5cf5242307786dda0eca09c766812878d`.

### 2026-06-21 — Phase 1 Stages 2–4 complete; Stage 5 pending
- Evidence Package, Review Request, Challenge Report (Codex Option B), Remediation Request, Remediation Evidence, Validation Request all committed.
- Wave 1 + Wave 2: all 9 repos updated to v2.1 blob `fba303449462c5a1c031cf47010ae8788f8a1db2`.
- Stage 5 (Codex validation) still pending.

### 2026-06-23 — Cloudflare Worker persistence fix + data restore
- Schema mismatch fixed: `persistTasks()` now sends `{doc:{tasks:[]}}`. Cloudflare secret `HRIS_GITHUB_PAT` added by Kevin.
- Data corruption event recovered: 24 tasks restored from commit `bdc1d42`. Restore commit `cad2a9fb`.
- Save-status toast added. Worker write confirmed working end-to-end by Kevin.

### 2026-06-25 — HR Systems Managers Meeting 24/06 — full task update
- Source: Granola (ID: 36d1c98d-d1ae-4a94-b0df-3c4835b64f57). tasks.json commit `fd675769`. 8 new tasks (t032–t039), 2 deleted, 3 closed, 4 updated.

### 2026-06-25 — CLOUDFLARE_PHASE_SPLIT_MIGRATE governance — APPROVED

**Objective:** Split 65KB `index.html` monolith into `index.html` shell + `css/styles.css` + `js/app.js` + `js/api.js`. Migrate hosting from GitHub Pages to Cloudflare Pages. Repeat for work-inbox once proven.

**Governance cycle completed this session:**

| Stage | Outcome |
|---|---|
| Pre-execution plan challenge (Codex) | GAPS FOUND — 10 items (2 FAIL, 8 PARTIAL) |
| Seat B challenge (Kevin) — V2, V6, V7 | All three accepted by Codex |
| Stage 4 Remediation — R1–R10 | All 10 items addressed in remediated plan |
| Stage 5 Validation (Codex) | ALL PASS |
| Stage 6 Governance Decision | **APPROVED by Kevin** — commit `8baeecc98302e3f6a988cddda6859ec6046cd4bc` |

**Key decisions made:**
- V6: Pre-execution plan challenge is valid as additive governance (not a formal Stage violation)
- V2: `*.pages.dev` preview URL is not a separate approval gate
- V7: `github-proxy` CORS narrowed to smoke-test only; `cc-tasks-writer` is the only CORS-locked Worker
- Repo visibility: default keep public; Kevin decides at Gate 3.6
- CLAUDE.md hard rule update governed at Gate 0.3 before any file split

**Open risks at session close:**
- Full baseline capture (CORS allowlist, GitHub Pages settings) deferred to Phase 0.2 at start of Stage 1
- Phase 1 Stage 5 (Codex validation of AGENT_MODEL v2.1 propagation) still outstanding
- work-inbox migration follows command-centre — not started

**Next session entry point:** Read approved plan, begin Phase 0.1. Gate 0.3 requires Kevin approval before first write.

### 2026-06-27 (continued) — Phase 3 complete: Cloudflare Workers deployment

**Deployed:** `command-centre.kevinlelitte.workers.dev` — Cloudflare Workers static assets deployment connected to `begb0037admin/command-centre` (main branch). Auto-deploys on every push to main.

**CORS updated:** `cc-tasks-writer` `CORS_ORIGINS` set extended to include `https://command-centre.kevinlelitte.workers.dev`. Task saves confirmed working (Saved ✓ toast) from Cloudflare URL.

**Both URLs now live and functional:**
- GitHub Pages: `https://begb0037admin.github.io/command-centre/`
- Cloudflare: `https://command-centre.kevinlelitte.workers.dev`

**Custom domain:** `cc.lelitte.co.uk` — added to Worker Domains, CORS updated in `cc-tasks-writer` (origins now include `https://cc.lelitte.co.uk`). Task saves confirmed working. This is now the primary URL.

**Domain plan (all dashboards):**
| Dashboard | URL |
|---|---|
| Command Centre | `cc.lelitte.co.uk` ✅ live |
| Work Inbox | `wi.lelitte.co.uk` ✅ live |
| HRIS Launcher | `hris.lelitte.co.uk` 🔲 pending |
| HR FA Knowledge Base | `kb.lelitte.co.uk` 🔲 pending |
| HRIS Dashboard | `hris-dash.lelitte.co.uk` 🔲 pending |

**Open risks:**
- Phase 2 sign-off (Gate 2.0) not yet completed — browser-level functional testing needed (Kevin)
- Phase 3 (Cloudflare Pages migration) complete — cc.lelitte.co.uk live ✅
- work-inbox split complete — wi.lelitte.co.uk live ✅

### 2026-06-27 — CLOUDFLARE_PHASE_SPLIT_MIGRATE Stage 1 execution complete

**File split live on GitHub Pages.** 65KB monolithic `index.html` split into 4 files via atomic GitHub Git Tree API commit.

**Gates completed this session:**

| Gate | Action | Commit |
|---|---|---|
| 0.3 | CLAUDE.md architecture update — approved by Kevin | `dc79a95a` |
| 1.0 | File split push — approved by Kevin | `d8c328f7` |

**Archive backups (created before first write):**

| File | Archive path | Backup SHA |
|---|---|---|
| `index.html` | `Archive/index_backup_20260627.html` | `b4e0d5d8d1546c9cc28bb5161fc60b0daebc63cd` |
| `data/tasks.json` | `Archive/tasks_backup_20260627.json` | `9f2dc00346eccc183af18131dc251706b382e460` |
| `js/app.js` | `Archive/app_js_backup_20260627.js` | `1dd68dba33f78ae10000b91a6dd7e19a6234b43d` |

**Live file SHAs post-split:**

| File | SHA |
|---|---|
| `index.html` | `2cd53ad4713ad2ee66366556a65fae9486fae718` |
| `css/styles.css` | `15328f7389ff59d9b4a760370a58bbde23845b37` |
| `js/api.js` | `ed97d9b1` |
| `js/app.js` | `43e54c75bd275f3e0eb5f18b427892adb7e214dd` |

**Fixes applied this session (pre-existing bugs, not caused by split):**

| Fix | Commit |
|---|---|
| `setTier()` — now calls `showView('board')` before `filterBoard()` so tier filter works from inbox view | `aeebd6a4` |
| `badge-inbox` — sidebar nav badge now shows real suggestion count (was stuck at 0) | `aeebd6a4` |
| Suggestion cards — added + Today / + Tomorrow / + This Week buttons (drag hint was non-functional) | `eb964bc4` |

**Phase 2 status:** Kevin confirmed dashboard "looks fine" visually. Full 25-item functional equivalence checklist deferred to next session.

### 2026-06-27 — Cross-domain links, CONSTITUTION.md v2.0, CLAUDE.md effort governance

**Cross-domain links fixed in command-centre/index.html:**
- Sidebar "Work Inbox" nav link: updated from `begb0037admin.github.io/work-inbox/` to `https://wi.lelitte.co.uk/` ✅
- Inbox view "Open full inbox →": updated from `begb0037admin.github.io/work-inbox/` to `https://wi.lelitte.co.uk/` ✅
- Backup before write: `Archive/index_backup_20260627_2138.html` (SHA `f9ef0a99`)
- Post-write SHA: `42ba97f9` (commit `b7fcd77e`)

**work-inbox/js/app.js — CC button in priority cards:** updated from `begb0037admin.github.io/command-centre/` to `https://cc.lelitte.co.uk/` (commit `63205623`).

**CONSTITUTION.md v2.0 — all 7 repos:** Section 10 (Effort Level Governance) added. Reasoning seat must signal before high-effort tasks and wait for Kevin to raise effort level. Never unilateral. Version history updated. Kevin approved 2026-06-27.

**CLAUDE.md — all 7 repos:** Effort Level Governance section added referencing CONSTITUTION.md Section 10 (v2.0, 2026-06-27). Bootstraps every AI session with the principle.

**Source-level equivalence check (2026-06-27):**

| Check | CC (cc.lelitte.co.uk) | WI (wi.lelitte.co.uk) |
|---|---|---|
| HTML shell loads (via GitHub API) | ✅ | ✅ |
| CSS reference correct | ✅ `css/styles.css` | ✅ `css/styles.css` |
| JS load order correct | ✅ `api.js` → `app.js` | ✅ `app.js` (single file) |
| Oxford crest (base64) present | ✅ | ✅ |
| Sidebar structure present | ✅ | ✅ |
| Cross-domain link to wi.lelitte.co.uk | ✅ (nav + inbox toolbar) | n/a |
| Cross-domain link to cc.lelitte.co.uk | n/a | ✅ (CC button in priority cards) |
| Four tier columns present | ✅ | n/a |
| Calendar/absences sidebar | n/a | ✅ |
| Tasks widget + live dot | n/a | ✅ |
| Cache-control meta tags | n/a | ✅ |
| Archive + import panels | n/a | ✅ |
| Save toast element | ✅ | n/a |

Note: Live URL fetch (lelitte.co.uk + GitHub Pages) returned 403 from cloud environment — expected (proxy blocks browser-less fetches). Browser-level Gate 2.0 check requires Kevin to open `https://cc.lelitte.co.uk` and verify task load, tier moves, quick-add, notes edit, done state, suggestions, tier focus mode, sidebar resize.

### 2026-06-28 — Live clock removed from CC sidebar

- Removed `<div class="sb-clock" id="sb-clock">` from `index.html` sidebar (was at bottom of sidebar, before resize handle)
- Removed `/* CLOCK */` block from `js/app.js` (`updateClock()` function + `setInterval`) — clock was displaying HH:MM:SS and day/date at sidebar bottom
- Archive backup stub committed before write: `Archive/index_backup_20260628_0600.txt` (restore point: main SHA `2126c329`)
- Clock functionality relocated to work-inbox sidebar — see work-inbox HANDOVER.md
- Approved by Kevin 2026-06-28. Merged to main via PR #5 (squash commit `e6f8ce64`).

### 2026-06-28 — Sidebar reorder, Oxford crest restored, Daily Focus card margin fix

**Sidebar nav reorder (approved by Kevin):**
- New order: Daily Focus widget → From your inbox → Tasks counts → Links → My Links
- Previous order: From your inbox → Tasks counts → Daily Focus → Links
- Change: HTML-only reorder in `<nav class="sb-nav">` — no JS changes required
- Merged to main via PR #6 (squash commit `dab40e84`)

**Oxford crest restored:**
- Root cause: the base64 JPEG was truncated from 10,416 chars to 8,243 chars during the PR #5 squash merge (clock removal). Truncated JPEG renders as broken/incomplete image.
- Fix: full 10,416-char base64 restored in `index.html`
- The crest now renders correctly — confirmed in screenshot before push

**Daily Focus card margin fix (`css/styles.css`):**
- `.sb-stale-stats` margin changed from `4px 10px 8px` to `4px 0 8px`
- Removes left/right margin so the Daily Focus card aligns flush with sidebar nav link elements (consistent left and right margin across all sidebar items)

**Archive backups created before writes:**
- `Archive/index_backup_20260628_1200.html` — index.html before reorder + crest fix
- `Archive/styles_backup_20260628_1200.css` — styles.css before margin fix
- `Archive/index_backup_20260628_1200_full_crest.html` — reference copy with full crest + new nav order
