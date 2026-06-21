# Phase 1 Validation Request

## Document Information

| Field | Value |
|-------|-------|
| Phase | Phase 1 - AGENT_MODEL.md v2.0 estate-wide propagation |
| Date | 2026-06-21 |
| Produced by | Claude Code (executing agent) |
| Addressed to | Codex (independent technical reviewer) |
| Governed by | `GOVERNANCE_WORKFLOW_STANDARD.md` v1.1 |
| Status | Submitted for validation |

## Request

Claude Code has completed remediation actions RA-01 through RA-07 as required by the Phase 1 Challenge Report and Remediation Request. Codex is requested to validate the remediation evidence and re-assess VT-01 through VT-07.

## Remediation Inputs

| Artefact | Path | Commit SHA |
|---|---|---|
| Phase 1 Challenge Report (Codex) | `docs/project/generated/PHASE_1_CHALLENGE_REPORT.md` | `c2ca67c5d3d8c650d05555f5bd3e2ea3439aca36` |
| Phase 1 Remediation Request (Codex) | `docs/project/generated/PHASE_1_REMEDIATION_REQUEST.md` | `c2ca67c5d3d8c650d05555f5bd3e2ea3439aca36` |
| Phase 1 Evidence Package (original) | `governance/evidence/PHASE_1_EVIDENCE_PACKAGE.md` | `f941af6984664efd70d70e06dccf9b7a8a1dfc2a` |
| Phase 1 Remediation Evidence (this session) | `governance/evidence/PHASE_1_REMEDIATION_EVIDENCE.md` | See commit SHA in HANDOVER.md |
| Governance Workflow Standard | `governance/GOVERNANCE_WORKFLOW_STANDARD.md` | `65b753b5cf5242307786dda0eca09c766812878d` |

## Summary of Remediation Actions

| RA | Action | Evidence type | Result |
|---|---|---|---|
| RA-01 | Reconcile repository scope | Directly inspected | ag-flexpoints confirmed as completion gap; hris-change-requests scope table defect identified; desktop-tutorial and personal-finance explained |
| RA-02 | Authentication diagnostic | Directly inspected | Principal `begb0037admin`; gh CLI keyring; `GITHUB_PAT` non-blocking explained |
| RA-03 | Authorization matrix | Directly inspected | Account owner access confirmed for all 9 repos |
| RA-04 | Backup baseline metadata correction | Directly inspected | hris-dashboard/hris-launcher/hris-change-requests corrected from v1.0 to v1.1; meeting-records header inconsistency explained |
| RA-05 | Rollback claim amendment | N/A | Recovery not demonstrated; claim amended to backup-retrievable only |
| RA-06 | CONSTITUTION.md correction | Directly inspected | Three-blob estate documented; assumption 5 retired; assumption 7 corrected |
| RA-07 | Re-issued Phase 1 evidence | Directly inspected + above | Two outstanding items identified; Phase 1 NOT complete pending ag-flexpoints update and v2.0 scope table correction |

## Outstanding Items (Not Remediation Failures)

The following items are not remediation failures but genuine Phase 1 completion gaps identified through the remediation process:

1. **ag-flexpoints AGENT_MODEL.md** — still at v1.1; requires update to v2.0 (blob `05fc8ada`); pending Kevin approval
2. **v2.0 content Section 8 scope table** — hris-change-requests absent; ag-flexpoints absent; requires content correction and re-propagation across all governed repos; pending Kevin approval

These items cannot be resolved by Claude Code without Kevin's explicit approval. They are blocking Phase 1 governance decision.

## Requested Validation

Codex is requested to re-assess VT-01 through VT-07 against the remediation evidence in `PHASE_1_REMEDIATION_EVIDENCE.md` and produce a `PHASE_1_VALIDATION_REPORT.md` in `docs/project/generated/`.

Claude Code's expected post-remediation VT assessments:

| VT | Expected post-remediation result | Basis |
|---|---|---|
| VT-01 | PARTIAL — exception outstanding | ag-flexpoints gap + hris-change-requests scope table defect; cannot be PASS until Kevin approves remediation |
| VT-02 | PASS | Principal and credential route directly evidenced |
| VT-03 | PASS | Account owner access confirmed for all repos |
| VT-04 | PASS | All backup metadata corrected or explained |
| VT-05 | PASS (amended claim) | Backup retrievable; amended claim accepted |
| VT-06 | PASS | All assumptions corrected, evidenced, or retired |
| VT-07 | PARTIAL — exception outstanding | Seven write targets confirmed; ag-flexpoints and scope table outstanding |

## Codex Operating Mode

Codex must declare operating mode (Option A or B) before proceeding.

If Codex cannot write to GitHub (Option B), Codex must output full Markdown for the Validation Report in chat. Claude Code will commit it to `docs/project/generated/PHASE_1_VALIDATION_REPORT.md` exactly as supplied, verify by GET, and update HANDOVER.md.

## Next Stage

**Workflow Status:** Stage 4 Remediation Complete / Stage 5 Validation Required

**Target Agent:** Codex

Upon Codex validation:
- If all VT items PASS (excluding outstanding items noted above): Claude Code to produce `PHASE_1_GOVERNANCE_REVIEW_REQUEST.md` addressed to Kevin/ChatGPT.
- If outstanding items are approved by Kevin: Claude Code to execute ag-flexpoints update and v2.0 scope table correction, then re-submit for validation.
- Phase 1 governance decision cannot proceed until all VT items are PASS.
