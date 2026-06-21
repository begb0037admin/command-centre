# PHASE_[NAME]_REMEDIATION_REQUEST_[YYYYMMDD].md
# Phase [Name] — Remediation Request

---

## Document Information

| Field | Value |
|-------|-------|
| Phase | [Phase name and number] |
| Date | [YYYY-MM-DD] |
| Produced by | [Executing agent identifier / session ID] |
| In response to | Challenge Report at commit SHA: [SHA] |
| Governed by | GOVERNANCE_WORKFLOW_STANDARD.md v[X] |
| Status | [Awaiting Kevin approval / Approved / In progress] |
| Commit SHA (this document) | [SHA — populated after commit] |

---

## Inputs

| Input | Repository path | Commit SHA |
|-------|----------------|------------|
| Challenge Report | command-centre/governance/evidence/PHASE_[NAME]_CHALLENGE_REPORT_[YYYYMMDD].md | [SHA] |
| Evidence Package | command-centre/governance/evidence/PHASE_[NAME]_EVIDENCE_PACKAGE_[YYYYMMDD].md | [SHA] |

---

## Outputs

This request, once approved, will result in:

| Output | Type | Notes |
|--------|------|-------|
| Remediation commits (one or more) | GitHub commits to affected repos | Per gap below |
| Remediation Evidence document | `PHASE_[NAME]_REMEDIATION_EVIDENCE_[YYYYMMDD].md` | Produced after remediation complete |

---

## Evidence References

| Reference | Detail |
|-----------|--------|
| Challenge Report gap summary | [Copy the gap descriptions from the Challenge Report here] |

---

## Gap Register

For each FAIL or PARTIAL finding in the Challenge Report, describe the gap and the proposed remediation.

### GAP-01 (from VT-[XX])

**Finding from Challenge Report:** [FAIL/PARTIAL]  
**Gap description:** [What was missing, incorrect, or unverifiable]  
**Root cause:** [Why the gap occurred]  
**Proposed remediation:** [Specific action — e.g., push missing backup to Archive/, re-run GET verification and record SHA, amend Evidence Package with API response]  
**Files affected:** [repo/path]  
**Backup required before remediation write?** [YES/NO — and if YES, confirm backup does not already exist for today]

---

### GAP-02 (from VT-[XX])

**Finding from Challenge Report:** [FAIL/PARTIAL]  
**Gap description:** [Description]  
**Root cause:** [Root cause]  
**Proposed remediation:** [Action]  
**Files affected:** [repo/path]  
**Backup required before remediation write?** [YES/NO]

---

<!-- Add GAP-N sections as required -->

---

## Assumptions

1. Kevin's approval of this Remediation Request constitutes authorization for the writes listed in each gap's proposed remediation.
2. No additional approval gates are triggered by the proposed remediation actions (assess against AGENT_MODEL.md Section 2).
3. [Additional assumptions]

---

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Remediation write introduces new gap not covered by original backup | MEDIUM | New backup taken immediately before each remediation write |
| Gap is architectural (not fixable by re-run) | HIGH | Escalate to Kevin before proceeding |
| [Additional risk] | [Severity] | [Mitigation] |

---

## Kevin Approval Gate

This Remediation Request requires Kevin's explicit approval before any remediation write proceeds.

**Kevin — please confirm:**
- [ ] The gap register accurately describes the gaps found by the challenger.
- [ ] The proposed remediations are appropriate.
- [ ] You authorise the executing agent to proceed with the writes listed above.

**Kevin's approval recorded at:** [timestamp / commit SHA of Kevin's approval message or commit]

---

## NEXT STAGE

**On Kevin approval →** Executing agent implements each gap's proposed remediation under the standard backup-first, GET-verify protocol. On completion, produces `PHASE_[NAME]_REMEDIATION_EVIDENCE_[YYYYMMDD].md`.

**If Kevin rejects or modifies the remediation plan →** Update this document and re-present before proceeding.
