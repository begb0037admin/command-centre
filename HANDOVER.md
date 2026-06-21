# command-centre — Living Handover Document

**Last updated:** 2026-06-21 (Phase 1 governance artefacts committed — Codex challenge pending)
**Status:** Active — Module 1 live at https://begb0037admin.github.io/command-centre/

---

## Architecture

| Component | Description |
|---|---|
| `index.html` | Single-file dashboard. Oxford navy sidebar (320px), blue-grey main (#f5f7fb), Inter font. No framework, no build step. |
| `data/tasks.json` | Task data. Fields: id, title, tier (today/week/parked), source, emailRef, notes, actions[], dateAdded. |
| `governance/` | Governance workflow standard, phase templates, and phase evidence artefacts (added 2026-06-21). |

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
| Governance standard | `governance/GOVERNANCE_WORKFLOW_STANDARD.md` |
| Phase 1 Evidence Package | `governance/evidence/PHASE_1_EVIDENCE_PACKAGE.md` |
| Phase 1 Review Request | `governance/evidence/PHASE_1_REVIEW_REQUEST.md` |
| Phase templates | `governance/templates/` (9 templates) |

---

## Governance Workflow

All multi-repository governance operations follow the 6-stage workflow defined in `governance/GOVERNANCE_WORKFLOW_STANDARD.md` (committed 2026-06-21, commit `6f6cd8ae31d17c0c3c251f4837724c4279578a4a`).

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

### Workflow Summary
| Stage | Action | Produced by |
|-------|--------|-------------|
| 1 — Execute | Perform approved writes | Claude Code |
| 2 — Evidence | Evidence Package | Claude Code |
| 3 — Challenge | Review Request + Challenge Report | Claude Code / Challenger |
| 4 — Remediation | Remediation Request + Evidence (if gaps) | Claude Code |
| 5 — Validation | Validation Request + Report (if gaps) | Claude Code / Challenger |
| 6 — Decision | Governance Review Request + Decision | Claude Code / Kevin |

---

## Phase 1 Governance Artefacts

### Artefacts Committed

| Artefact | Path | Commit SHA | Content SHA | Verified |
|----------|------|------------|-------------|----------|
| PHASE_1_EVIDENCE_PACKAGE.md | `governance/evidence/PHASE_1_EVIDENCE_PACKAGE.md` | `f941af6984664efd70d70e06dccf9b7a8a1dfc2a` | `07449bef60a2e8a5ffa8a17445052c20e0b0a742` | ✅ GET confirmed |
| PHASE_1_REVIEW_REQUEST.md | `governance/evidence/PHASE_1_REVIEW_REQUEST.md` | `f941af6984664efd70d70e06dccf9b7a8a1dfc2a` | `42275d4d7569a988eb75d99e91d96ddff391a71a` | ✅ GET confirmed |

### Verification Result

Both artefacts retrieved via GET at commit `f941af6984664efd70d70e06dccf9b7a8a1dfc2a`:
- `PHASE_1_EVIDENCE_PACKAGE.md`: present, content SHA `07449bef`, all required sections confirmed.
- `PHASE_1_REVIEW_REQUEST.md`: present, content SHA `42275d4d`, NEXT STAGE section confirmed with correct Target Agent, Required Inputs, Required Outputs, Workflow Status (Stage 1 Complete / Stage 2 Pending), and Handoff Instructions.

### Current Workflow Status

| Stage | Status |
|-------|--------|
| Stage 1 — Execute (AGENT_MODEL v2.0 propagation) | ✅ Complete |
| Stage 2 — Evidence (Evidence Package + Review Request) | ✅ Complete |
| Stage 3 — Challenge | ⏳ Pending — **Next agent: Codex** |
| Stage 4 — Remediation | 🔲 Conditional on Stage 3 |
| Stage 5 — Validation | 🔲 Conditional on Stage 4 |
| Stage 6 — Governance Decision | 🔲 Awaiting Kevin |

### Next Agent: Codex

**Action required:** Codex must independently challenge the Evidence Package (VT-01 through VT-07) and commit its outputs to `governance/evidence/`.

**Required Codex inputs:**
- `governance/evidence/PHASE_1_EVIDENCE_PACKAGE.md`
- `governance/evidence/PHASE_1_REVIEW_REQUEST.md`
- `governance/GOVERNANCE_WORKFLOW_STANDARD.md`
- `governance/templates/`

**Required Codex outputs:**
- `governance/evidence/PHASE_1_CHALLENGE_REPORT.md` — always required
- `governance/evidence/PHASE_1_REMEDIATION_REQUEST.md` — required if any VT finding is FAIL or PARTIAL

**Codex entry point:** Read `governance/evidence/PHASE_1_REVIEW_REQUEST.md` in full first. All instructions are there.

---

## Next Action

**Governance:** Codex to produce `PHASE_1_CHALLENGE_REPORT.md` and (if required) `PHASE_1_REMEDIATION_REQUEST.md` in `governance/evidence/`. Claude Code will read the committed Challenge Report and proceed to Stage 4 or Stage 6 based on the overall verdict.

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

### 2026-06-21 — Governance workflow standard + templates
- `governance/GOVERNANCE_WORKFLOW_STANDARD.md` — 6-stage workflow, 10-artefact set, agent responsibilities, handoff requirements.
- 9 phase templates committed to `governance/templates/`. All verified by directory GET.
- Commit SHA: `6f6cd8ae31d17c0c3c251f4837724c4279578a4a`.

### 2026-06-21 — Phase 1 governance artefacts committed (Stage 2 complete)
- `governance/evidence/PHASE_1_EVIDENCE_PACKAGE.md` — full Phase 1 execution evidence with all required sections: scope, repos reviewed, repos excluded, architecture, authentication, authorization, baseline capture, backup, governance writes, verification, HANDOVER, exceptions, claims, assumptions, risks, outstanding items, evidence summary.
- `governance/evidence/PHASE_1_REVIEW_REQUEST.md` — addressed to Codex; VT-01 through VT-07 verification tasks with direct-inspection instructions; NEXT STAGE section confirmed present with correct workflow status (Stage 1 Complete / Stage 2 Pending).
- Commit SHA (artefacts): `f941af6984664efd70d70e06dccf9b7a8a1dfc2a`.
- Both artefacts verified by GET at that commit.
- **Workflow is now at Stage 3 — Codex action required.**
