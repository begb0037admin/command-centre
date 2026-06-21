# Phase 1 Remediation Request

## Document Information

| Field | Value |
|-------|-------|
| Phase | Phase 1 - AGENT_MODEL.md v2.0 estate-wide propagation |
| Date | 2026-06-21 |
| Produced by | Codex, Independent Technical Reviewer |
| Trigger | `PHASE_1_CHALLENGE_REPORT.md` |
| Governed by | `GOVERNANCE_WORKFLOW_STANDARD.md` v1.1 |
| Status | Required |
| Commit SHA (this document) | Not committed by Codex - Option B handoff |

## Reason for Remediation

The Phase 1 challenge review found PARTIAL results for VT-01 through VT-07. Remediation is mandatory before Phase 1 can proceed to validation or governance decision.

## Required Remediation Actions

### RA-01 - Reconcile repository scope

**Finding addressed:** VT-01, VT-07

**Gap:** The public repository inventory, current governed-scope table, and Phase 1 target list do not fully align.

**Required evidence:**
- A reconciled repository inventory covering all visible, governed, excluded, inaccessible, renamed, removed, or private repositories.
- Explicit treatment of `hris-change-requests`.
- Explicit treatment of `ag-flexpoints`.
- Explanation for repositories listed in governance scope but not visible in public API reads, including `desktop-tutorial` and `personal-finance`.
- Updated governed-scope table if required.

### RA-02 - Provide direct authentication diagnostic evidence

**Finding addressed:** VT-02

**Gap:** Successful commits prove authenticated write success but not the credential route.

**Required evidence:**
- Authenticated principal used for Phase 1 writes.
- Credential route used for Phase 1 writes.
- Evidence supporting or correcting the claim that `GITHUB_PAT` was absent and non-blocking.
- Clear separation between authentication evidence and authorization evidence.

### RA-03 - Provide authorization matrix

**Finding addressed:** VT-03

**Gap:** Repository write success is not a permission matrix.

**Required evidence:**
A repository-by-repository authorization matrix for the executing identity or automation path covering:
- `clockify`
- `hr-fa-knowledge-base`
- `hr-projects`
- `meeting-records`
- `hris-dashboard`
- `hris-launcher`
- `hris-change-requests`
- `command-centre`
- `work-inbox`

For each repository, record read/write/admin or equivalent permission evidence.

### RA-04 - Correct backup baseline metadata

**Finding addressed:** VT-04

**Gap:** Backup files exist and backup-before-write is supported, but version metadata is inconsistent.

**Required evidence:**
For each target repository, provide:
- Backup path
- Backup blob SHA
- Backup commit SHA
- Backup commit timestamp
- Version claimed in evidence package
- Version indicated by backup commit message
- Version indicated by backup file content, if present
- Explanation for mismatch

Specific mismatches requiring explanation:
- `hris-dashboard` package says v1.0; backup commit message says v1.1.
- `hris-launcher` package says v1.0; backup commit message says v1.1.
- `hris-change-requests` package says v1.0; backup commit message says v1.1.
- `meeting-records` requires explicit handling of the v1.1 Section 9 claim.

### RA-05 - Demonstrate recovery or downgrade rollback claim

**Finding addressed:** VT-05

**Gap:** Backup retrievability is proven; recovery is not demonstrated.

**Required evidence:**
Either:
- A non-destructive recovery rehearsal, such as restoring one backup to a temporary branch and verifying content SHA; or
- An amended claim stating only that backup sources are retrievable and recovery has not been exercised.

### RA-06 - Correct governance assumption evidence

**Finding addressed:** VT-06

**Gap:** Some assumptions are unverified and one CONSTITUTION.md claim is contradicted.

**Required evidence:**
- Resolve or retire the assumption that `ag-flexpoints` absence is not a completion gap.
- Correct the CONSTITUTION.md estate SHA claim.
- Explain why `hris-dashboard` returned CONSTITUTION blob `6dcffd6dabe9e83ebe293c5cb074af54673a6be9`.
- Explain why `hris-change-requests` returned CONSTITUTION blob `178bc0d9f079ddbb7dd6b6d68b7993d5b2904d1d`.
- State whether Phase 1 completion depends on CONSTITUTION.md integrity claims.

### RA-07 - Re-issue Phase 1 evidence after remediation

**Finding addressed:** VT-07

**Gap:** Phase 1 completion is overstated while evidence gaps remain.

**Required evidence:**
- Updated evidence package or addendum.
- Every VT item explicitly addressed.
- Direct evidence separated from executing-agent reported evidence.
- Remaining assumptions clearly identified.
- Phase status stated as ready for validation only after remediation evidence is committed.

## Acceptance Criteria

Remediation is acceptable only when:
- Repository scope is reconciled.
- Authentication and authorization are separately evidenced.
- Backup metadata is internally consistent or explicitly explained.
- Recovery claim matches the evidence actually demonstrated.
- Governance assumptions are either proven, corrected, or retired.
- Contradicted CONSTITUTION.md claims are corrected.
- Every VT item has sufficient evidence for validation.

## Claude Code Commit Handoff

*This section applies because Codex is in Option B (Read-Only Reviewer With Claude Code Commit Handoff).*

| Field | Value |
|-------|-------|
| Artefacts to commit | This Remediation Request |
| Exact filename | `PHASE_1_REMEDIATION_REQUEST.md` |
| Repository target path | `begb0037admin/command-centre/docs/project/generated/` |
| Wording preservation | Claude Code must commit this content exactly as supplied - no edits, no reformatting, no omissions |
| Required verification | After commit: retrieve file via GitHub Contents API and confirm content SHA matches |
| Required HANDOVER.md update | Claude Code must update HANDOVER.md with: artefact path, commit SHA, verification result, Codex operating mode (Option B), and next workflow stage (Stage 4 - Remediation, pending Kevin approval) |

**Full artefact Markdown for Claude Code to commit (Option B only):**

This full Markdown content is supplied in chat for Claude Code to commit verbatim.

## NEXT STAGE

**Workflow Status:** Stage 3 Challenge Complete / Stage 4 Remediation Required

**Target Agent:** Claude Code

**Required Inputs:**
- `begb0037admin/command-centre/docs/project/generated/PHASE_1_CHALLENGE_REPORT.md`
- `begb0037admin/command-centre/docs/project/generated/PHASE_1_REMEDIATION_REQUEST.md`
- `begb0037admin/command-centre/governance/evidence/PHASE_1_EVIDENCE_PACKAGE.md`
- `begb0037admin/command-centre/governance/evidence/PHASE_1_REVIEW_REQUEST.md`
- `begb0037admin/command-centre/governance/GOVERNANCE_WORKFLOW_STANDARD.md`

**Required Outputs:**
- Remediation evidence committed under `begb0037admin/command-centre/governance/evidence/`
- Updated or addendum evidence package if needed
- Validation request committed under `begb0037admin/command-centre/governance/evidence/`
- HANDOVER.md update recording Codex Option B handoff, committed artefact paths, commit SHAs, and verification results

**Handoff Instructions:**
Claude Code must first commit the Codex-supplied Challenge Report and Remediation Request exactly as supplied to `docs/project/generated/`, then verify both files by repository read. Claude Code must then complete RA-01 through RA-07 and produce remediation evidence. Phase 1 must not proceed to governance decision until Codex validation confirms all remediated VT items are PASS.

## NEXT STAGE

**Workflow Status:** Stage 3 Challenge Complete / Stage 4 Remediation Required

**Target Agent:** Claude Code

**Required Inputs:**
- `begb0037admin/command-centre/docs/project/generated/PHASE_1_CHALLENGE_REPORT.md`
- `begb0037admin/command-centre/docs/project/generated/PHASE_1_REMEDIATION_REQUEST.md`
- `begb0037admin/command-centre/governance/evidence/PHASE_1_EVIDENCE_PACKAGE.md`
- `begb0037admin/command-centre/governance/evidence/PHASE_1_REVIEW_REQUEST.md`
- `begb0037admin/command-centre/governance/GOVERNANCE_WORKFLOW_STANDARD.md`

**Required Outputs:**
- Remediation evidence committed under `begb0037admin/command-centre/governance/evidence/`
- Updated or addendum evidence package if needed
- Validation request committed under `begb0037admin/command-centre/governance/evidence/`
- HANDOVER.md update recording Codex Option B handoff, committed artefact paths, commit SHAs, and verification results

**Handoff Instructions:**
Claude Code must first commit the Codex-supplied Challenge Report and Remediation Request exactly as supplied to `docs/project/generated/`, then verify both files by repository read. Claude Code must then complete RA-01 through RA-07 and produce remediation evidence. Phase 1 must not proceed to governance decision until Codex validation confirms all remediated VT items are PASS.
