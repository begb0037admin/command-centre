# PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE — Plan Review Request

**Phase:** CLOUDFLARE_PHASE_SPLIT_MIGRATE  
**Stage:** Pre-Execution Plan Review (adapted Stage 3 — plan review before Stage 1 begins)  
**Date:** 2026-06-25  
**Produced by:** Claude Code (Executing Agent — Seat A/C)  
**Addressed to:** Codex (Challenging Agent)  
**Governed by:** GOVERNANCE_WORKFLOW_STANDARD.md v1.1, CONSTITUTION.md v1.0  
**Repository:** begb0037admin/command-centre  

---

## 1. Purpose of This Request

This is a pre-execution plan review. No implementation has begun. The artefact being challenged is the architecture and migration plan for CLOUDFLARE_PHASE_SPLIT_MIGRATE, produced by the executing agent and approved for challenge by Kevin Lelitte (Seat B) on 2026-06-25.

Codex is asked to independently review the plan for:
- Compliance with CONSTITUTION.md
- Compliance with GOVERNANCE_WORKFLOW_STANDARD.md
- Completeness of governance gates
- Adequacy of DR and rollback coverage
- Architectural soundness of the file split and Cloudflare Pages migration approach
- Any gaps, risks, or conflicts not accounted for in the plan

This request is adapted from the standard Stage 3 Review Request. Because no Stage 1 execution has occurred, there is no Evidence Package. The plan document below is the sole artefact under review.

---

## 2. Instruction to Codex

Treat the plan below as an **unverified design proposal** — not an authoritative record. You are not being asked to rubber-stamp it. You are being asked to find what is wrong, missing, or insufficiently governed before a single file is written.

For each verification task in Section 4:
- Record your finding as **PASS**, **PARTIAL**, or **FAIL**
- State the specific gap for any PARTIAL or FAIL
- Do not accept the executing agent's own assertions as evidence
- Where a claim can be verified against CONSTITUTION.md, AGENT_MODEL.md, or GOVERNANCE_WORKFLOW_STANDARD.md, verify it directly against those documents

**Overall verdict must be one of:**
- `ALL PASS` — plan may proceed to Kevin approval and Stage 1
- `GAPS FOUND` — gaps must be resolved before plan is approved

---

## 3. The Plan Under Review

### Objective

Break the single 65KB `index.html` in command-centre into governed, individually-editable files. Migrate hosting from GitHub Pages to Cloudflare Pages. Repeat for work-inbox once command-centre is proven. Eliminate the structural root cause of recurring dashboard breakage caused by AI token limits on single-file edits.

---

### Phase 0 — Pre-work (governance and DR baseline)

Before a single file is touched:

1. Full backup — Archive `index.html` and `data/tasks.json` with timestamp. SHA verified against live repo. This becomes the golden restore point for the entire migration.
2. Constitution review — Read `AGENT_MODEL.md` and `CONSTITUTION.md`. Confirm all approval gates that apply.
3. Freeze — No other changes to command-centre during the migration. Tasks.json writes via cc-tasks-writer continue as normal (Worker is untouched until Phase 3).

---

### Phase 1 — File split (GitHub Pages, no hosting change yet)

**Target file structure:**

```
command-centre/
├── index.html          ← shell only: <head>, layout divs, <script src> tags
├── css/
│   └── styles.css      ← all styles extracted from index.html
├── js/
│   ├── app.js          ← UI logic, task rendering, tier management
│   └── api.js          ← all GitHub API calls (tasks.json read/write)
├── data/
│   └── tasks.json      ← unchanged
└── Archive/            ← unchanged
```

Rules:
- Each file independently readable by AI (all well under token limits)
- No logic changes — pure extraction, identical behaviour
- `index.html` becomes a thin shell with `<link>` and `<script>` references only
- Hosted on GitHub Pages throughout Phase 1 — no hosting change yet
- Kevin approves the split structure before any file is written

Governance gate: Kevin reviews and confirms the target structure before Phase 1 begins.

DR — Phase 1 rollback: Restore `index.html` from the Phase 0 golden backup. Single-file operation, immediate.

---

### Phase 2 — Verification on GitHub Pages

Before touching Cloudflare:

1. Dashboard loads correctly from `begb0037admin.github.io/command-centre/`
2. Tasks load from tasks.json
3. Task writes (add, tier move, notes) round-trip correctly via cc-tasks-writer Worker
4. 'From your inbox' panel loads suggestions from work-inbox
5. Tick state persists via cc-tasks-writer

Kevin signs off all five checks. If any fail — rollback to Phase 0 golden backup before proceeding.

This gate is mandatory. Phase 3 does not begin until Phase 2 is clean.

---

### Phase 3 — Cloudflare Pages migration

Steps:
1. Connect `begb0037admin/command-centre` repo to Cloudflare Pages in Kevin's Cloudflare account
2. Set build config: no build command, output directory = `/` (static files, no framework)
3. Cloudflare Pages assigns a `*.pages.dev` URL — test against that first
4. Update CORS on `cc-tasks-writer` Worker to allow the new Pages domain
5. Confirm all five Phase 2 checks pass on the Pages URL
6. Point custom domain (if desired) or update any bookmarks
7. Disable GitHub Pages once Cloudflare Pages is confirmed live

Kevin approves steps 4, 6, and 7 before execution — these touch live infrastructure.

DR — Phase 3 rollback:
- Re-enable GitHub Pages (single toggle in repo settings)
- Revert cc-tasks-writer CORS to previous value
- Dashboard immediately live again on GitHub Pages
- Cloudflare Pages connection can be deleted with no data loss

---

### Disaster Recovery Reference

| Scenario | Recovery action | Time to restore |
|---|---|---|
| Bad file split breaks dashboard | Restore index.html from Phase 0 golden backup | < 5 minutes |
| Cloudflare Pages deploy fails | GitHub Pages still live — no user impact | Immediate |
| cc-tasks-writer CORS wrong | Revert CORS setting in Cloudflare Worker | < 2 minutes |
| tasks.json corrupted during migration | Restore from Archive/ backup | < 5 minutes |
| Full rollback needed | GitHub Pages re-enable + restore index.html | < 10 minutes |

---

### Governance touchpoints

| Point | Gate | Who approves |
|---|---|---|
| Start Phase 0 | Backup confirmed, constitution read | Claude confirms to Kevin |
| Phase 1 structure | File split layout approved | Kevin |
| Phase 2 complete | All 5 checks signed off | Kevin |
| Phase 3 step 4 | CORS change on live Worker | Kevin |
| Phase 3 step 6 | Custom domain / bookmark update | Kevin |
| Phase 3 step 7 | GitHub Pages disabled | Kevin |

---

## 4. Verification Tasks for Codex

For each item below, record PASS / PARTIAL / FAIL with evidence or gap statement.

| # | Verification task | Reference |
|---|---|---|
| V1 | Does Phase 0 satisfy CONSTITUTION.md Section 4 (Rollback Before Change)? Is the golden restore point sufficiently defined? | CONSTITUTION.md §4 |
| V2 | Are all approval gates correctly identified against AGENT_MODEL.md Section 2 (approval gate list)? Are any gates missing? | AGENT_MODEL.md §2 |
| V3 | Does the file split approach (Phase 1) comply with command-centre CLAUDE.md hard rules (single index.html rule)? If it conflicts, is that conflict acknowledged and governed? | command-centre CLAUDE.md |
| V4 | Is the Phase 2 verification checklist sufficient to confirm functional equivalence before hosting migration? Are there missing checks? | Plan §Phase 2 |
| V5 | Is the DR table complete? Does it cover all plausible failure modes introduced by this migration? | Plan §DR Reference |
| V6 | Does the plan correctly apply the GOVERNANCE_WORKFLOW_STANDARD.md 6-stage process to itself? Is the adapted pre-execution review approach (Stage 3 before Stage 1) valid under the standard? | GOVERNANCE_WORKFLOW_STANDARD.md |
| V7 | Is the Cloudflare Pages migration approach (Phase 3) architecturally consistent with the existing Worker setup (cc-tasks-writer, github-proxy)? Are there dependency or CORS risks not covered? | Plan §Phase 3; command-centre CLAUDE.md |
| V8 | Does the plan account for work-inbox as a second migration? Are there sequencing risks if command-centre and work-inbox share Workers (cc-tasks-writer)? | Plan §Objective; work-inbox CLAUDE.md |
| V9 | Is the AGENT_MODEL.md Section 7 note about repository visibility (public — required for GitHub Pages) addressed? Does migrating to Cloudflare Pages change the repo visibility requirement? | AGENT_MODEL.md §7 |
| V10 | Is session discipline (CONSTITUTION.md Section 5) adequately planned for? Does the plan include a HANDOVER.md update requirement at close? | CONSTITUTION.md §5 |

---

## 5. What Codex Must NOT Accept as Evidence

- The executing agent's own assertions in this document
- Session memory or prior conversation history
- Undocumented assumptions
- Claims not verifiable against the committed governance documents in begb0037admin/command-centre

---

## 6. Codex Write Instructions

Approved write path: `docs/project/generated/` in `begb0037admin/command-centre`

Artefacts to produce:
- `PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_CHALLENGE_REPORT_20260625.md`
- `PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_REMEDIATION_REQUEST_20260625.md` (conditional — only if GAPS FOUND)

If GitHub write access is unavailable, output full Markdown artefact contents in chat for Claude Code to commit.

---

## 7. References

| Document | Repository path |
|---|---|
| CONSTITUTION.md | begb0037admin/command-centre/CONSTITUTION.md |
| AGENT_MODEL.md | begb0037admin/command-centre/AGENT_MODEL.md |
| GOVERNANCE_WORKFLOW_STANDARD.md | begb0037admin/command-centre/governance/GOVERNANCE_WORKFLOW_STANDARD.md |
| command-centre CLAUDE.md | begb0037admin/command-centre/CLAUDE.md |
| work-inbox CLAUDE.md | begb0037admin/work-inbox/CLAUDE.md |

---

*Produced by Claude Code — Executing Agent (Seats A/C)*  
*Phase: CLOUDFLARE_PHASE_SPLIT_MIGRATE*  
*Date: 2026-06-25*
