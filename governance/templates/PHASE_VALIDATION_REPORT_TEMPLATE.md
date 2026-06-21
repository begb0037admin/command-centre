# PHASE_[NAME]_VALIDATION_REPORT_[YYYYMMDD].md
# Phase [Name] — Validation Report

---

## Document Information

| Field | Value |
|-------|-------|
| Phase | [Phase name and number] |
| Date | [YYYY-MM-DD] |
| Produced by | [Challenging agent (Codex) identifier / session ID] |
| Validates | Remediation Evidence at commit SHA: [SHA] |
| Against | Challenge Report at commit SHA: [SHA] |
| Governed by | GOVERNANCE_WORKFLOW_STANDARD.md v[X] |
| Status | [Final] |
| Commit SHA (this document) | [SHA — populated after commit] |

---

## Codex Operating Mode Declaration

**Operating mode:** [Option A — Controlled GitHub Artefact Writer / Option B — Read-Only Reviewer With Claude Code Commit Handoff]

**Write access verified:** [YES — confirmed / NO — write access failed; switching to Option B]

**Artefact destination:** `begb0037admin/command-centre/docs/project/generated/`

**Write boundary confirmed:** Codex has not modified governance standards, templates, implementation files, production files, operational files, application code, backups, remediation evidence, or HANDOVER.md.

---

## Inputs

| Input | Repository path | Commit SHA used |
|-------|----------------|------------------|
| Validation Request | command-centre/governance/evidence/PHASE_[NAME]_VALIDATION_REQUEST_[YYYYMMDD].md | [SHA] |
| Remediation Evidence | command-centre/governance/evidence/PHASE_[NAME]_REMEDIATION_EVIDENCE_[YYYYMMDD].md | [SHA] |
| Original Challenge Report | docs/project/generated/PHASE_[NAME]_CHALLENGE_REPORT_[YYYYMMDD].md | [SHA] |

---

## Outputs

| Output | Status |
|--------|--------|
| This Validation Report | Committed at SHA: [SHA] / Output in chat for Claude Code to commit |
| Overall validation verdict | [ALL CLOSED / GAPS REMAIN] |
| Next stage | [Stage 6 — Governance Review / Return to Stage 4 — Revised Remediation] |

---

## Evidence References

### API calls made during validation

| Call | Endpoint | Response summary | Evidence type |
|------|----------|------------------|---------------|
| [1] | GET /repos/begb0037admin/[repo]/contents/[path] | [SHA returned / 404] | [Directly inspected] |

---

## Validation Findings

For each gap from the Remediation Request, record the revised finding. State whether evidence was **Directly inspected** or **Reported**. PASS requires direct inspection.

| Gap ID | Original VT | Original finding | Remediation commit SHA | Actual content SHA (live GET) | Expected content SHA | Evidence type | Revised finding |
|--------|-------------|-----------------|------------------------|-------------------------------|----------------------|---------------|-----------------|
| GAP-01 | VT-[XX] | [FAIL/PARTIAL] | [SHA] | [SHA from GET] | [SHA] | [Directly inspected] | [PASS/PARTIAL/FAIL] |
| GAP-02 | VT-[XX] | [FAIL/PARTIAL] | [SHA] | [SHA from GET] | [SHA] | [Directly inspected] | [PASS/PARTIAL/FAIL] |

---

## Detailed Findings

### GAP-01 — [Brief description]

**Revised finding:** [PASS / PARTIAL / FAIL]  
**Evidence type:** [Directly inspected / Reported]

**Evidence:**
```
[Paste live GET response]
```

**Notes:** [Any observations, including new issues spotted but not in scope]

---

### GAP-02 — [Brief description]

**Revised finding:** [PASS / PARTIAL / FAIL]  
**Evidence type:** [Directly inspected / Reported]

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
→ Executing agent (Claude Code) proceeds to Stage 6. Produce `PHASE_[NAME]_GOVERNANCE_REVIEW_REQUEST_[YYYYMMDD].md` and commit to `command-centre/governance/evidence/`.

**If GAPS REMAIN:**
→ Executing agent must produce a revised Remediation Request for Kevin's approval before re-submitting for validation. Do not proceed to Stage 6 until all items reach PASS.

---

## Claude Code Commit Handoff

*This section applies when Codex is in Option B (Read-Only Reviewer With Claude Code Commit Handoff). If Codex committed directly (Option A), record the commit SHA above and omit the Markdown content block below.*

| Field | Value |
|-------|-------|
| Artefact to commit | This Validation Report |
| Exact filename | `PHASE_[NAME]_VALIDATION_REPORT_[YYYYMMDD].md` |
| Repository target path | `begb0037admin/command-centre/docs/project/generated/` |
| Wording preservation | Claude Code must commit this content exactly as supplied — no edits, no reformatting, no omissions |
| Required verification | After commit: retrieve file via GitHub Contents API and confirm content SHA matches |
| Required HANDOVER.md update | Claude Code must update HANDOVER.md with: artefact path, commit SHA, verification result, Codex operating mode (Option B), and next workflow stage |

**Full artefact Markdown for Claude Code to commit (Option B only):**

[Codex: paste the complete Markdown content of this document here so Claude Code can commit it verbatim.]
