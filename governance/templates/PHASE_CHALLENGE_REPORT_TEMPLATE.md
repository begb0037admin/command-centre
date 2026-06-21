# PHASE_[NAME]_CHALLENGE_REPORT_[YYYYMMDD].md
# Phase [Name] — Challenge Report

---

## Document Information

| Field | Value |
|-------|-------|
| Phase | [Phase name and number] |
| Date | [YYYY-MM-DD] |
| Produced by | [Challenging agent identifier / session ID] |
| Reviewing | Evidence Package at commit SHA: [SHA] |
| Review Request at | command-centre/governance/evidence/PHASE_[NAME]_REVIEW_REQUEST_[YYYYMMDD].md |
| Governed by | GOVERNANCE_WORKFLOW_STANDARD.md v[X] |
| Status | [Draft / Final] |
| Commit SHA (this document) | [SHA — populated after commit] |

---

## Inputs

| Input | Repository path | Commit SHA used |
|-------|----------------|------------------|
| Evidence Package | command-centre/governance/evidence/PHASE_[NAME]_EVIDENCE_PACKAGE_[YYYYMMDD].md | [SHA] |
| Review Request | command-centre/governance/evidence/PHASE_[NAME]_REVIEW_REQUEST_[YYYYMMDD].md | [SHA] |
| Governance Workflow Standard | command-centre/governance/GOVERNANCE_WORKFLOW_STANDARD.md | [SHA] |

---

## Outputs

| Output | Status |
|--------|--------|
| This Challenge Report | Committed at SHA: [SHA] |
| Overall verdict | [ALL PASS / GAPS FOUND] |
| Next stage | [Stage 6 — Governance Review / Stage 4 — Remediation] |

---

## Evidence References

<!-- Paste the raw API responses or excerpts used to reach each finding.
     Do not summarise — paste the actual data. -->

### API calls made during this challenge

| Call | Endpoint | Response summary |
|------|----------|------------------|
| [1] | GET /repos/begb0037admin/[repo]/contents/[path] | [SHA returned / 404 / other] |
| [2] | GET /repos/begb0037admin/[repo]/git/commits/[sha] | [found / not found] |

---

## Findings

### VT-01 — Repository Scope Completeness

**Finding:** [PASS / PARTIAL / FAIL]

**Evidence:**
```
[Paste API response or state what was found vs. what was claimed]
```

**Gap (if PARTIAL or FAIL):**
[Describe the specific gap — which repository was missing, what was not found, what SHA did not match]

---

### VT-02 — Authentication Verification

**Finding:** [PASS / PARTIAL / FAIL]

**Evidence:**
```
[Paste API response: commit author, timestamp, mechanism]
```

**Gap (if PARTIAL or FAIL):**
[Description]

---

### VT-03 — Authorization Verification

**Finding:** [PASS / PARTIAL / FAIL]

**Evidence:**
```
[List of files written, cross-reference against approval gates]
```

**Gap (if PARTIAL or FAIL):**
[Description]

---

### VT-04 — Backup Validation

**Finding:** [PASS / PARTIAL / FAIL]

**Evidence (per repository):**

| Repository | Backup file | Content SHA (claimed) | Content SHA (actual GET) | Committed before write? | Finding |
|------------|-------------|----------------------|--------------------------|-------------------------|---------|
| [repo] | [path] | [claimed SHA] | [actual SHA] | [YES/NO/CANNOT VERIFY] | [PASS/FAIL] |

**Gap (if PARTIAL or FAIL):**
[Description]

---

### VT-05 — Rollback Claims

**Finding:** [PASS / PARTIAL / FAIL]

**Evidence:**
```
[Confirm backup SHA is retrievable; confirm path is unambiguous]
```

**Gap (if PARTIAL or FAIL):**
[Description]

---

### VT-06 — Governance Assumptions

**Finding:** [PASS / PARTIAL / FAIL]

**Per-assumption assessment:**

| # | Assumption | Assessment | Evidence |
|---|-----------|------------|----------|
| 1 | [text] | [VALID / UNVERIFIABLE / FALSE] | [evidence or statement] |
| 2 | [text] | [VALID / UNVERIFIABLE / FALSE] | [evidence or statement] |

**Gap (if PARTIAL or FAIL):**
[Description]

---

### VT-07 — Estate-Wide Completion

**Finding:** [PASS / PARTIAL / FAIL]

**Live GET results:**

| Repository | File path | Content SHA (claimed) | Content SHA (live GET) | Match |
|------------|-----------|----------------------|------------------------|-------|
| [repo] | [path] | [claimed] | [actual] | [YES/NO] |

**Gap (if PARTIAL or FAIL):**
[Description]

---

## Assumptions

1. The Evidence Package version challenged is the one at the SHA pinned in the Inputs table. Any subsequent edits to the Evidence Package are out of scope for this report.
2. [Any additional assumptions made during the challenge]

---

## Risks

| Risk | Severity | Note |
|------|----------|------|
| [Risk identified during challenge] | [HIGH/MEDIUM/LOW] | [Detail] |

---

## Overall Verdict

**[ALL PASS / GAPS FOUND]**

| Finding ID | Result | Requires remediation |
|------------|--------|-----------------------|
| VT-01 | [PASS/PARTIAL/FAIL] | [YES/NO] |
| VT-02 | [PASS/PARTIAL/FAIL] | [YES/NO] |
| VT-03 | [PASS/PARTIAL/FAIL] | [YES/NO] |
| VT-04 | [PASS/PARTIAL/FAIL] | [YES/NO] |
| VT-05 | [PASS/PARTIAL/FAIL] | [YES/NO] |
| VT-06 | [PASS/PARTIAL/FAIL] | [YES/NO] |
| VT-07 | [PASS/PARTIAL/FAIL] | [YES/NO] |

---

## NEXT STAGE

**If ALL PASS:**
→ Executing agent proceeds to Stage 6. Produce `PHASE_[NAME]_GOVERNANCE_REVIEW_REQUEST_[YYYYMMDD].md`.

**If GAPS FOUND:**
→ Stage 4 is mandatory. Executing agent must produce `PHASE_[NAME]_REMEDIATION_REQUEST_[YYYYMMDD].md` addressing each FAIL/PARTIAL item listed above.

**This report's commit SHA:** [SHA — executing agent records this when reading the report]
