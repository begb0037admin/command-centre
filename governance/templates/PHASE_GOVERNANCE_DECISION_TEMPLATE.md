# PHASE_[NAME]_GOVERNANCE_DECISION_[YYYYMMDD].md
# Phase [Name] — Governance Decision

---

## Document Information

| Field | Value |
|-------|-------|
| Phase | [Phase name and number] |
| Date | [YYYY-MM-DD] |
| Decision authority | Kevin Lelitte, HR Systems Manager/Director, University of Oxford |
| Governed by | GOVERNANCE_WORKFLOW_STANDARD.md v[X] |
| Reviewing | Governance Review Request at commit SHA: [SHA] |
| Status | **[APPROVED / REJECTED / DEFERRED]** |
| Commit SHA (this document) | [SHA — populated after commit] |

---

## Inputs

| Input | Repository path | Commit SHA |
|-------|----------------|------------|
| Governance Review Request | command-centre/governance/evidence/PHASE_[NAME]_GOVERNANCE_REVIEW_REQUEST_[YYYYMMDD].md | [SHA] |
| Challenge Report | command-centre/governance/evidence/PHASE_[NAME]_CHALLENGE_REPORT_[YYYYMMDD].md | [SHA] |
| Validation Report (if applicable) | command-centre/governance/evidence/PHASE_[NAME]_VALIDATION_REPORT_[YYYYMMDD].md | [SHA / N/A] |

---

## Outputs

| Output | Status |
|--------|--------|
| This Governance Decision | **[APPROVED / REJECTED / DEFERRED]** |
| Phase [Name] status | **[CLOSED / REJECTED / OPEN — DEFERRED]** |

---

## Evidence References

| Artefact | Commit SHA | Accepted |
|----------|------------|----------|
| Evidence Package | [SHA] | [YES / NO — with reason] |
| Challenge Report | [SHA] | [YES / NO] |
| Remediation Evidence (if applicable) | [SHA / N/A] | [YES / N/A] |
| Validation Report (if applicable) | [SHA / N/A] | [YES / N/A] |

---

## Kevin's Assessment

<!-- Kevin completes this section. Plain-English notes on the review. -->

[Kevin's notes]

---

## Decision

**[ ] APPROVED** — Phase [Name] is complete. The evidence chain is accepted as the formal record. All residual risks noted in the Governance Review Request are acknowledged. The executing agent may proceed to the next phase.

**[ ] REJECTED** — Phase [Name] is not accepted. Reason: [Kevin's reason]. The executing agent must [restart from Stage X / take specific action] before re-presenting.

**[ ] DEFERRED** — Decision is deferred pending: [Kevin's condition]. The executing agent must [action] before this decision can be made. Re-present by: [date or trigger].

---

## Conditions and Exceptions

<!-- Any conditions attached to an APPROVED decision, or exceptions Kevin is
     granting. Leave blank if unconditional. -->

[Conditions or exceptions, or "None"]

---

## Assumptions

1. Kevin has reviewed the Governance Review Request and the documents linked in the evidence chain above.
2. This decision is made on the basis of the evidence as it stood at the date of the Governance Review Request. Subsequent changes to affected files do not retroactively affect this decision.

---

## Risks

| Risk | Severity | Kevin's acknowledgement |
|------|----------|-------------------------|
| Residual risks listed in Governance Review Request | [Severity] | [Acknowledged / Escalated / Rejected as risk] |

---

## NEXT STAGE

**If APPROVED:**
→ Phase [Name] is closed. The executing agent updates HANDOVER.md in command-centre to record phase closure and commits this Governance Decision SHA as the closure reference. No further artefacts are required for this phase.

**If REJECTED:**
→ The executing agent does not proceed. The reason for rejection and required corrective action are recorded in this document. A new phase may be opened after corrective action is complete.

**If DEFERRED:**
→ The executing agent takes the action specified under DEFERRED above and re-presents the Governance Review Request when the condition is met. This document is superseded by the replacement decision.

---

**Signed:** Kevin Lelitte  
**Date:** [YYYY-MM-DD]  
**Commitment SHA:** [SHA of this committed document]
