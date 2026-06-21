# command-centre — Living Handover Document

**Last updated:** 2026-06-21 (Phase 1 Stage 4 remediation complete — Stage 5 validation pending)
**Status:** Active — Module 1 live at https://begb0037admin.github.io/command-centre/

---

## Architecture

| Component | Description |
|---|---|
| `index.html` | Single-file dashboard. Oxford navy sidebar (320px), blue-grey main (#f5f7fb), Inter font. No framework, no build step. |
| `data/tasks.json` | Task data. Fields: id, title, tier (today/week/parked), source, emailRef, notes, actions[], dateAdded. |
| `governance/` | Governance workflow standard (v1.1), phase templates, and phase evidence artefacts. |
| `docs/project/generated/` | Approved Codex artefact path. All Codex-produced review artefacts are committed here. |

---

## Current State (fully working as of 2026-06-18)

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
- Cloudflare Worker write-back (`cc-tasks-writer.kevinlelitte.workers.dev`) — PAT held server-side; tasks.json writes, tier moves, notes edits and suggestion drags all persist from any machine/browser
- 'From your inbox' suggestion panel — drags AI-proposed tasks into tier lists; dismissals persist in localStorage
- **Badge alignment fixed** — `.task-card-top` has `width: 100%` so NEW/UPDATED badges always appear at far right
- **Badge CSS normalised** — NEW (green) and UPDATED (blue) badges match Work Inbox exactly
- **Emoji removed** from all three "Open email" button locations

### Known Limitations (by design — v1)
- Manual tasks added via quick-add panel persist via Cloudflare Worker write-back.
- Done state in localStorage is keyed by task ID — if `tasks.json` is regenerated with new IDs, done state resets.

### GitHub Pages
- Enabled manually by Kevin after first push (Settings → Pages → main / root)
- Deploy time ~1 min after push to main

---

## File Locations

| File | Path |
|---|---|
| Dashboard | `index.html` (repo root) |
| Task data | `data/tasks.json` |
| Oxford crest | Embedded as base64 in `index.html` (source: OUO.jpg) |
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
| `governance/templates/PHASE_CHALLENGE_REPORT_TEMPLATE.md` | `1f77c00bb35a397037cc21db759ad289ba4d8acf` |
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

### Current Workflow Status

| Stage | Status |
|-------|--------|
| Stage 1 — Execute (AGENT_MODEL v2.0 propagation) | ✅ Complete (7 repos) — EXCEPTION: ag-flexpoints not updated |
| Stage 2 — Evidence (Evidence Package + Review Request) | ✅ Complete |
| Stage 3 — Challenge (Codex, Option B) | ✅ Complete — GAPS FOUND (VT-01 through VT-07 all PARTIAL) |
| Stage 4 — Remediation (RA-01 through RA-07) | ✅ Complete — 2 outstanding items pending Kevin approval |
| Stage 5 — Validation | ⏳ Pending — **Next agent: Codex** |
| Stage 6 — Governance Decision | 🔲 Awaiting Kevin |

### Next Agent: Codex (Stage 5 — Validation)

**Action required:** Codex must re-assess VT-01 through VT-07 against `PHASE_1_REMEDIATION_EVIDENCE.md` and produce `PHASE_1_VALIDATION_REPORT.md`.

**Codex entry point:** `governance/evidence/PHASE_1_VALIDATION_REQUEST.md`

**Codex operating mode:** Codex must declare Option A or B. If Option B, output full Markdown in chat; Claude Code commits.

**Outstanding items requiring Kevin approval before Phase 1 can be PASS:**
1. ag-flexpoints AGENT_MODEL.md update — v1.1 → v2.0
2. v2.0 content correction — add hris-change-requests and ag-flexpoints to Section 8 scope table, re-propagate across all repos

**These items must not be executed without Kevin's explicit approval.**

### Key Findings from Remediation

| Finding | Detail |
|---|---|
| ag-flexpoints completion gap | Repo confirmed Active at `begb0037admin/ag-flexpoints`; AGENT_MODEL.md still v1.1 (blob `d7bbc192`); not updated in Phase 1 |
| hris-change-requests scope table defect | v2.0 content does not list hris-change-requests in Section 8; defect in source content, not in propagation |
| Backup version metadata corrected | hris-dashboard, hris-launcher, hris-change-requests were v1.1 before Phase 1 (not v1.0 as evidence package stated) |
| CONSTITUTION.md three-blob estate | 6 repos: `a25878b0`; hris-dashboard: `6dcffd6d`; hris-change-requests: `178bc0d9`; Phase 1 completion independent of CONSTITUTION.md |
| Authentication confirmed | Principal `begb0037admin` (ID `267986202`); gh CLI keyring via MCP GitHub server |
| Authorization confirmed | Account owner — full admin/write/read on all repos |

---

## Next Action

**Governance:** Codex to validate remediation evidence (`PHASE_1_REMEDIATION_EVIDENCE.md`) and produce `PHASE_1_VALIDATION_REPORT.md` in `docs/project/generated/`. Claude Code will then (subject to Kevin approval) execute outstanding Phase 1 items and prepare governance decision request.

**Kevin approval required:** ag-flexpoints AGENT_MODEL.md update + v2.0 scope table correction + re-propagation.

**ROADMAP item 1:** Wire Granola meeting review → Kevin approves extracted actions → push approved actions to `data/tasks.json` via GitHub Contents API.

---

## Session Notes

### 2026-06-08 — Module 1 build (Hope cross-domain)
- Kevin hit token cap mid-session; Hope completed build under Cross-Domain Code Brief
- Oxford crest: Kevin uploaded OUO.jpg — embedded as base64
- All 13 seed tasks enriched with action bullet arrays from SK 1-1 Granola transcript

### 2026-06-18 — Badge alignment + UI polish
- Badge alignment fixed; badge CSS normalised to match Work Inbox; emoji stripped from Open email buttons.
- Live on main: commit `e7c4b22`.

### 2026-06-21 — Governance Phase 1 complete (execution)
- AGENT_MODEL.md v2.0 propagated to all 7 repositories (clockify, hr-fa-knowledge-base, hr-projects, meeting-records, hris-dashboard, hris-launcher, hris-change-requests).
- Datestamped backups created in Archive/ for each repo before every write.
- All 7 v2.0 writes verified by GET; content SHA `05fc8adaab7e5b9524fe2c4f85ace667d7e04801` identical across all repos.
- CONSTITUTION.md v1.0 SHA `a25878b0` confirmed unchanged; no propagation needed.
- Authentication diagnostic: GITHUB_PAT env var absent but confirmed not Claude Code's auth mechanism (gh CLI keyring).
- Pending: ag-flexpoints AGENT_MODEL.md status unverified (not in MCP scope this session).

### 2026-06-21 — Governance workflow standard + templates (v1.0)
- `governance/GOVERNANCE_WORKFLOW_STANDARD.md` — 6-stage workflow, 10-artefact set, agent responsibilities, handoff requirements.
- 9 phase templates committed to `governance/templates/`. All verified by directory GET.
- Commit SHA: `6f6cd8ae31d17c0c3c251f4837724c4279578a4a`.

### 2026-06-21 — Phase 1 governance artefacts committed (Stage 2 complete)
- `governance/evidence/PHASE_1_EVIDENCE_PACKAGE.md` — full Phase 1 execution evidence.
- `governance/evidence/PHASE_1_REVIEW_REQUEST.md` — addressed to Codex; VT-01 through VT-07; NEXT STAGE section confirmed.
- Commit SHA (artefacts): `f941af6984664efd70d70e06dccf9b7a8a1dfc2a`.
- Both artefacts verified by GET at that commit.
- **Workflow was at Stage 3 — Codex action required.**

### 2026-06-21 — Governance workflow correction (v1.1)
- **Problem:** Codex attempted Stage 3 commit without a defined write role; produced local file paths as outputs.
- **Correction:** GOVERNANCE_WORKFLOW_STANDARD.md updated to v1.1. Section 9 (Codex Controlled Write Constraint) added. 6 Codex-facing templates updated with Codex Operating Mode and Claude Code Commit Handoff sections.
- **Approved Codex write path:** `docs/project/generated/`
- **Codex write boundary:** Challenge Report, Remediation Request, Validation Report, Governance Review Request only. No other files.
- **Fallback rule:** If Codex cannot write, Codex outputs full Markdown in chat; Claude Code commits exactly as supplied.
- **Correction commit SHA:** `65b753b5cf5242307786dda0eca09c766812878d`
- **All 7 changed files GET-verified at that commit.**

### 2026-06-21 — Stage 3 Challenge complete (Codex Option B handoff)
- Codex operated in Option B (expired token; no GH_TOKEN).
- Challenge Report and Remediation Request delivered in chat; committed by Claude Code exactly as supplied.
- `docs/project/generated/PHASE_1_CHALLENGE_REPORT.md` — commit `c2ca67c5`; blob `9c64b8c8` ✅
- `docs/project/generated/PHASE_1_REMEDIATION_REQUEST.md` — commit `c2ca67c5`; blob `2840d1e2` ✅
- Overall verdict: GAPS FOUND. All VT-01 through VT-07 PARTIAL.

### 2026-06-21 — Stage 4 Remediation complete (RA-01 through RA-07)
- All seven remediation actions completed. Key findings:
  - **ag-flexpoints**: Confirmed Active at v1.1 — completion gap. Phase 1 NOT complete.
  - **hris-change-requests**: Updated to v2.0 but absent from v2.0 Section 8 scope table — content defect.
  - **Backup metadata**: hris-dashboard, hris-launcher, hris-change-requests correctly v1.1 (not v1.0 as evidence package stated).
  - **CONSTITUTION.md**: Three-blob estate (6 × `a25878b0`, hris-dashboard `6dcffd6d`, hris-change-requests `178bc0d9`). Phase 1 completion independent.
  - **Authentication**: Principal `begb0037admin`; gh CLI keyring confirmed.
  - **Authorization**: Account owner — all repos.
- `governance/evidence/PHASE_1_REMEDIATION_EVIDENCE.md` — commit `d3ac11c5`; blob `e30a9dd7` ✅
- `governance/evidence/PHASE_1_VALIDATION_REQUEST.md` — commit `d3ac11c5`; blob `fad75a35` ✅
- **Workflow is at Stage 5 — Codex validation required.**
- **Two outstanding items require Kevin approval before Phase 1 governance decision.**
