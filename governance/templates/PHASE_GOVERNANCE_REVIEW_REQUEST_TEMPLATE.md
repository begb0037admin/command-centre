# PHASE_[NAME]_GOVERNANCE_REVIEW_REQUEST_[YYYYMMDD].md
# Phase [Name] — Governance Review Request

---

## Document Information

| Field | Value |
|-------|-------|
| Phase | [Phase name and number] |
| Date | [YYYY-MM-DD] |
| Produced by | [Executing agent identifier / session ID] |
| Addressed to | Kevin Lelitte |
| Governed by | GOVERNANCE_WORKFLOW_STANDARD.md v[X] |
| Status | Awaiting Kevin's Governance Decision |
| Commit SHA (this document) | [SHA — populated after commit] |

---

## Inputs

| Input | Repository path | Commit SHA |
|-------|----------------|------------|
| Evidence Package | command-centre/governance/evidence/PHASE_[NAME]_EVIDENCE_PACKAGE_[YYYYMMDD].md | [SHA] |
| Review Request | command-centre/governance/evidence/PHASE_[NAME]_REVIEW_REQUEST_[YYYYMMDD].md | [SHA] |
| Challenge Report | command-centre/governance/evidence/PHASE_[NAME]_CHALLENGE_REPORT_[YYYYMMDD].md | [SHA] |
| Remediation Request (if applicable) | command-centre/governance/evidence/PHASE_[NAME]_REMEDIATION_REQUEST_[YYYYMMDD].md | [SHA / N/A] |
| Remediation Evidence (if applicable) | command-centre/governance/evidence/PHASE_[NAME]_REMEDIATION_EVIDENCE_[YYYYMMDD].md | [SHA / N/A] |
| Validation Report (if applicable) | command-centre/governance/evidence/PHASE_[NAME]_VALIDATION_REPORT_[YYYYMMDD].md | [SHA / N/A] |

---

## Outputs

| Output | Produced by | Filename |
|--------|-------------|----------|
| Governance Decision | Kevin | `PHASE_[NAME]_GOVERNANCE_DECISION_[YYYYMMDD].md` |

---

## Evidence References

The full evidence chain is linked in the Inputs table above. This section provides a navigable index.

| Stage | Document | Verdict |
|-------|----------|---------|
| Execute | [list of commit SHAs for execution writes] | Completed |
| Evidence | Evidence Package | Produced |
| Challenge | Challenge Report | [ALL PASS / GAPS FOUND] |
| Remediation | Remediation Evidence | [Completed / N/A] |
| Validation | Validation Report | [ALL CLOSED / N/A] |

---

## Plain-English Summary

<!-- One paragraph. What was done, what was independently verified, and what the
     outcome was. Written for Kevin — no jargon, no assumed prior context. -->

[Summary paragraph]

---

## What Was Done

| Action | Repositories affected | Evidence |
|--------|-----------------------|---------|
| [Action 1] | [repo list] | Commit SHA [SHA] |
| [Action 2] | [repo list] | Commit SHA [SHA] |

---

## What Was Independently Verified

| Verification task | Challenger's finding | Evidence |
|------------------|---------------------|----------|
| VT-01 — Repository scope completeness | [PASS] | Challenge Report VT-01 |
| VT-02 — Authentication | [PASS] | Challenge Report VT-02 |
| VT-03 — Authorization | [PASS] | Challenge Report VT-03 |
| VT-04 — Backup validation | [PASS] | Challenge Report VT-04 |
| VT-05 — Rollback claims | [PASS] | Challenge Report VT-05 |
| VT-06 — Governance assumptions | [PASS] | Challenge Report VT-06 |
| VT-07 — Estate-wide completion | [PASS] | Challenge Report VT-07 |

---

## Residual Risks and Open Items

<!-- List anything not fully resolved, deferred to a future phase, or requiring
     Kevin's awareness after approval. If none, state explicitly. -->

| Item | Risk level | Proposed action |
|------|------------|------------------|
| [Item 1] | [HIGH/MEDIUM/LOW] | [Action or deferral] |

---

## What Kevin is Being Asked to Approve

<!-- Plain statement of the approval decision. Be specific. -->

1. That Phase [Name] ([brief description]) is considered complete.
2. That the evidence chain above is accepted as the formal record.
3. That any residual risks listed above are acknowledged.
4. [Any additional approval items]

---

## Assumptions

1. The evidence chain above is complete and all SHAs are correct as of the date of this document.
2. No further writes to the affected files will occur until Kevin's Governance Decision is committed.

---

## Risks

| Risk | Severity | Note |
|------|----------|------|
| Kevin defers — evidence chain ages and SHAs may be superseded by subsequent commits | LOW | Re-verify SHAs before committing Decision if significant time has elapsed |
| Kevin identifies a gap not caught by the challenger | HIGH | Stage 4 Remediation must be re-opened |

---

## NEXT STAGE

**→ Kevin commits: `PHASE_[NAME]_GOVERNANCE_DECISION_[YYYYMMDD].md`**

The Governance Decision is the final artefact in the phase workflow. Until it is committed with status APPROVED, the phase remains open. The executing agent does not begin any subsequent phase until this decision is committed.

**Kevin — to close this phase, commit the Governance Decision document to `command-centre/governance/evidence/` with your decision and signature.**
