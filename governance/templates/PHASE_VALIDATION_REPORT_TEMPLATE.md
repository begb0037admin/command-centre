# PHASE_[NAME]_VALIDATION_REPORT_[YYYYMMDD].md
# Phase [Name] — Validation Report

---

## Document Information

| Field | Value |
|-------|-------|
| Phase | [Phase name and number] |
| Date | [YYYY-MM-DD] |
| Produced by | [Challenging agent identifier / session ID] |
| Validates | Remediation Evidence at commit SHA: [SHA] |
| Against | Challenge Report at commit SHA: [SHA] |
| Governed by | GOVERNANCE_WORKFLOW_STANDARD.md v[X] |
| Status | [Final] |
| Commit SHA (this document) | [SHA — populated after commit] |

---

## Inputs

| Input | Repository path | Commit SHA used |
|-------|----------------|------------------|
| Validation Request | command-centre/governance/evidence/PHASE_[NAME]_VALIDATION_REQUEST_[YYYYMMDD].md | [SHA] |
| Remediation Evidence | command-centre/governance/evidence/PHASE_[NAME]_REMEDIATION_EVIDENCE_[YYYYMMDD].md | [SHA] |
| Original Challenge Report | command-centre/governance/evidence/PHASE_[NAME]_CHALLENGE_REPORT_[YYYYMMDD].md | [SHA] |

---

## Outputs

| Output | Status |
|--------|--------|
| This Validation Report | Committed at SHA: [SHA] |
| Overall validation verdict | [ALL CLOSED / GAPS REMAIN] |
| Next stage | [Stage 6 — Governance Review / Return to Stage 4 — Revised Remediation] |

---

## Evidence References

### API calls made during validation

| Call | Endpoint | Response summary |
|------|----------|------------------|
| [1] | GET /repos/begb0037admin/[repo]/contents/[path] | [SHA returned / 404] |

---

## Validation Findings

For each gap from the Remediation Request, record the revised finding.

| Gap ID | Original VT | Original finding | Remediation commit SHA | Actual content SHA (live GET) | Expected content SHA | Revised finding |
|--------|-------------|-----------------|------------------------|-------------------------------|----------------------|-----------------|
| GAP-01 | VT-[XX] | [FAIL/PARTIAL] | [SHA] | [SHA from GET] | [SHA] | [PASS/PARTIAL/FAIL] |
| GAP-02 | VT-[XX] | [FAIL/PARTIAL] | [SHA] | [SHA from GET] | [SHA] | [PASS/PARTIAL/FAIL] |

---

## Detailed Findings

### GAP-01 — [Brief description]

**Revised finding:** [PASS / PARTIAL / FAIL]

**Evidence:**
```
[Paste live GET response]
```

**Notes:** [Any observations, including new issues spotted but not in scope]

---

### GAP-02 — [Brief description]

**Revised finding:** [PASS / PARTIAL / FAIL]

**Evidence:**
```
[Paste live GET response]
```

**Notes:** [Observations]

---

## Assumptions

1. All validation calls were made after the remediation commits (timestamps available in API responses).
2. [Additional assumptions]

---

## Risks

| Risk | Severity | Note |
|------|----------|------|
| New gaps identified during validation (out of scope for this report) | MEDIUM | Listed in Notes above; executing agent should assess |

---

## Overall Validation Verdict

**[ALL CLOSED / GAPS REMAIN]**

| Gap ID | Revised finding |
|--------|-----------------|
| GAP-01 | [PASS/PARTIAL/FAIL] |
| GAP-02 | [PASS/PARTIAL/FAIL] |

---

## NEXT STAGE

**If ALL CLOSED (all revised findings are PASS):**
→ Executing agent proceeds to Stage 6. Produce `PHASE_[NAME]_GOVERNANCE_REVIEW_REQUEST_[YYYYMMDD].md`.

**If GAPS REMAIN:**
→ Executing agent must produce a revised Remediation Request for Kevin's approval before re-submitting for validation. Do not proceed to Stage 6 until all items reach PASS.
