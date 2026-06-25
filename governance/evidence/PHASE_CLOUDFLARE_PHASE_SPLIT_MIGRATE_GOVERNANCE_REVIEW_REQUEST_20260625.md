# PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE — Governance Review Request

**Phase:** CLOUDFLARE_PHASE_SPLIT_MIGRATE  
**Stage:** 6 — Governance Decision  
**Date:** 2026-06-25  
**Produced by:** Claude Code (Executing Agent — Seats A/C)  
**Addressed to:** Kevin Lelitte (Seat B — Approval Authority)  

---

## Summary

This phase proposes splitting the command-centre `index.html` monolith (65KB) into four governed static files and migrating hosting from GitHub Pages to Cloudflare Pages. The same pattern will then be applied to work-inbox. The objective is to eliminate the structural root cause of recurring dashboard breakage: AI token limits make safe edits to a 65KB single file impossible.

The plan has completed a full pre-execution governance cycle:
- Pre-execution plan challenge by Codex (additive governance gate)
- Kevin exercised Seat B authority to challenge three findings — all three accepted by Codex
- Stage 4 remediation addressed all 10 gaps identified
- Stage 5 validation by Codex returned ALL PASS

The plan is ready for your Governance Decision.

---

## What you are being asked to approve

Approval of the remediated plan to proceed to Stage 1 execution. Execution does not begin until this Governance Decision is committed as APPROVED.

Key decisions embedded in the plan that will require your explicit confirmation at execution time:

| Gate | Decision |
|---|---|
| 0.3 | Approve CLAUDE.md architecture update (new file structure + hard rule change) |
| 1.0 | Approve final file split structure |
| 2.0 | Sign off full 25-item functional-equivalence checklist |
| 3.0 | Approve Cloudflare Pages repo connection |
| 3.2 | Approve `cc-tasks-writer` CORS update |
| 3.3 | Approve production cutover |
| 3.5 | Approve disabling GitHub Pages |
| 3.6 | Decide: keep repos public or make private |

---

## Full artefact chain

| Stage | Artefact | Path | Commit SHA |
|---|---|---|---|
| Pre-execution | Plan Review Request | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_REVIEW_REQUEST_20260625.md` | `2ab2dd5563eb1aa4fac42e436ae1efd27687e919` |
| Pre-execution | Seat B Challenge Brief | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_GOVERNANCE_CHALLENGE_BRIEF_20260625.md` | `be0a088cf1160cec23f7e8781c331062d9516cb1` |
| Stage 3 | Codex Challenge Report (revised) | `docs/project/generated/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_CHALLENGE_REPORT_20260625.md` | `d6a18be45225cb44d5ec89632cace9071c5950d1` |
| Stage 3 | Codex Remediation Request (revised) | `docs/project/generated/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_REMEDIATION_REQUEST_20260625.md` | `d6a18be45225cb44d5ec89632cace9071c5950d1` |
| Stage 4 | Remediated Plan | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_PLAN_REMEDIATED_20260625.md` | `96aac2c1c6b6cb7a0df556e411a47c21f7cb79d6` |
| Stage 4 | Remediation Evidence | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_REMEDIATION_EVIDENCE_20260625.md` | `96aac2c1c6b6cb7a0df556e411a47c21f7cb79d6` |
| Stage 5 | Validation Request | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_VALIDATION_REQUEST_20260625.md` | `63f59a32647096dd2347ddf0d99bd469873b120f` |
| Stage 5 | Codex Validation Report (ALL PASS) | `docs/project/generated/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_VALIDATION_REPORT_20260625.md` | `57d241bc3bb282ef0569cab9b6395c813e90ad64` |
| Stage 6 | This Governance Review Request | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_GOVERNANCE_REVIEW_REQUEST_20260625.md` | pending |
| Stage 6 | Governance Decision | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_GOVERNANCE_DECISION_20260625.md` | awaiting Kevin |

---

## Residual risks and open items

| Risk | Mitigation in plan |
|---|---|
| File split breaks dashboard on GitHub Pages | Phase 0 golden backup; Phase 1 DR rollback procedure |
| Cloudflare Pages CORS transition breaks writes | Dual-origin baseline (Phase 3.2); CORS golden baseline recorded before any change |
| Work Inbox cross-links break after cutover | Work Inbox sequencing section; sequencing rule enforced before GitHub Pages disabled |
| Repository visibility not yet decided | Kevin decides at Gate 3.6; default is keep public |
| CLAUDE.md hard rule conflict | Resolved at Gate 0.3 before any split |

---

## Governance Decision

Please commit `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_GOVERNANCE_DECISION_20260625.md` with your decision:

- **APPROVED** — plan proceeds to Stage 1 execution
- **REJECTED** — plan does not proceed; state reason
- **DEFERRED** — hold pending stated condition

---

*Produced by Claude Code — Executing Agent (Seats A/C)*  
*Phase: CLOUDFLARE_PHASE_SPLIT_MIGRATE — Stage 6 Governance Review Request*  
*Date: 2026-06-25*
