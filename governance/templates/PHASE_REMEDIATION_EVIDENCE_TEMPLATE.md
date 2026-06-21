# PHASE_[NAME]_REMEDIATION_EVIDENCE_[YYYYMMDD].md
# Phase [Name] — Remediation Evidence

---

## Document Information

| Field | Value |
|-------|-------|
| Phase | [Phase name and number] |
| Date | [YYYY-MM-DD] |
| Produced by | [Executing agent identifier / session ID] |
| Implements | Remediation Request at commit SHA: [SHA] |
| Kevin approval | [Recorded at: timestamp / commit SHA] |
| Governed by | GOVERNANCE_WORKFLOW_STANDARD.md v[X] |
| Status | [Complete — awaiting validation / Partial — gaps remain] |
| Commit SHA (this document) | [SHA — populated after commit] |

---

## Inputs

| Input | Repository path | Commit SHA |
|-------|----------------|------------|
| Remediation Request (approved) | command-centre/governance/evidence/PHASE_[NAME]_REMEDIATION_REQUEST_[YYYYMMDD].md | [SHA] |
| Challenge Report | command-centre/governance/evidence/PHASE_[NAME]_CHALLENGE_REPORT_[YYYYMMDD].md | [SHA] |

---

## Outputs

| Repository | File path | Action | Commit SHA | Content SHA |
|------------|-----------|--------|------------|-------------|
| [owner/repo] | [path] | [created / updated] | [SHA] | [SHA] |

---

## Evidence References

<!-- For every remediation write, paste the API response confirming the commit
     and content SHA. Same standard as the original Evidence Package. -->

### [Repository] — [File path]

```
[Paste API response: sha, commit.sha, commit.message, commit.author.date]
```

---

## Gap Closure Record

For each gap in the Remediation Request, confirm closure.

| Gap ID | Original VT | Closure action | Commit SHA | GET verified | Closed |
|--------|-------------|----------------|------------|--------------|--------|
| GAP-01 | VT-[XX] | [Action taken] | [SHA] | YES | [YES/NO] |
| GAP-02 | VT-[XX] | [Action taken] | [SHA] | YES | [YES/NO] |

---

## Backup Validation (Remediation Writes)

| Repository | Backup file | Backup commit SHA | Backup content SHA | GET verified | Committed before write |
|------------|-------------|-------------------|--------------------|--------------|------------------------|
| [owner/repo] | [Archive/file_backup_YYYYMMDD.md] | [SHA] | [SHA] | YES | YES |

---

## Rollback Claims (Remediation Writes)

| Repository | Rollback method | Backup SHA | Restoration target SHA |
|------------|-----------------|------------|------------------------|
| [owner/repo] | Restore from Archive/[backup] | [SHA] | [SHA before remediation write] |

---

## Assumptions

1. Kevin's approval of the Remediation Request (SHA recorded above) covers all writes listed in this document.
2. [Additional assumptions]

---

## Risks

| Risk | Severity | Note |
|------|----------|------|
| Remediation write did not fully close the gap | MEDIUM | Validation Report will surface this |
| [Additional risk] | [Severity] | [Note] |

---

## NEXT STAGE

**→ Stage 5: Validation**

Executing agent must now produce `PHASE_[NAME]_VALIDATION_REQUEST_[YYYYMMDD].md` and submit it to the challenging agent. The challenger will independently re-verify each previously FAIL/PARTIAL finding against the remediation commits recorded above.

No remediation gap may be declared closed until the Validation Report confirms PASS for that item.

**Validation Request commit SHA:** [populated after commit]
