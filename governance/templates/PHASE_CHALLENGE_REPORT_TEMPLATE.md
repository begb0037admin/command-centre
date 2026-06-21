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

## Codex Operating Mode Declaration

Before producing findings, Codex declares its operating mode for this session:

**Operating mode:** [Option A — Controlled GitHub Artefact Writer / Option B — Read-Only Reviewer With Claude Code Commit Handoff]

**Write access verified:** [YES — successfully read docs/project/generated/ or confirmed write capability / NO — write access failed on first attempt; switching to Option B]

**Artefact destination:** `begb0037admin/command-centre/docs/project/generated/`

**Write boundary confirmed:** Codex will write only to `docs/project/generated/`. No modifications will be made to governance standards, templates, implementation files, production files, operational files, application code, backups, remediation evidence, or HANDOVER.md.

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
| This Challenge Report | Committed at SHA: [SHA] / Output in chat for Claude Code to commit |
| Overall verdict | [ALL PASS / GAPS FOUND] |
| Next stage | [Stage 6 — Governance Review / Stage 4 — Remediation] |

---

## Evidence References

<!-- Paste the raw API responses or excerpts used to reach each finding.
     Do not summarise — paste the actual data. -->

### API calls made during this challenge

| Call | Endpoint | Response summary | Evidence type |
|------|----------|------------------|---------------|
| [1] | GET /repos/begb0037admin/[repo]/contents/[path] | [SHA returned / 404 / other] | [Directly inspected / Reported] |
| [2] | GET /repos/begb0037admin/[repo]/git/commits/[sha] | [found / not found] | [Directly inspected / Reported] |

---

## Findings

For each finding, state whether evidence was **Directly inspected** (retrieved from GitHub API in this session) or **Reported by executing agent** (stated in the Evidence Package). PASS requires direct inspection.

### VT-01 — Repository Scope Completeness

**Finding:** [PASS / PARTIAL / FAIL]  
**Evidence type:** [Directly inspected / Reported by executing agent]

**Evidence:**
```
[Paste API response or state what was found vs. what was claimed]
```

**Gap (if PARTIAL or FAIL):**
[Describe the specific gap — which repository was missing, what was not found, what SHA did not match]

---

### VT-02 — Authentication Verification

**Finding:** [PASS / PARTIAL / FAIL]  
**Evidence type:** [Directly inspected / Reported by executing agent]

**Evidence:**
```
[Paste API response: commit author, timestamp, mechanism]
```

**Gap (if PARTIAL or FAIL):**
[Description]

---

### VT-03 — Authorization Verification

**Finding:** [PASS / PARTIAL / FAIL]  
**Evidence type:** [Directly inspected / Reported by executing agent]

**Evidence:**
```
[List of files written, cross-reference against approval gates]
```

**Gap (if PARTIAL or FAIL):**
[Description]

---

### VT-04 — Backup Validation

**Finding:** [PASS / PARTIAL / FAIL]  
**Evidence type:** [Directly inspected / Reported by executing agent]

**Evidence (per repository):**

| Repository | Backup file | Content SHA (claimed) | Content SHA (actual GET) | Committed before write? | Finding |
|------------|-------------|----------------------|--------------------------|-------------------------|---------|
| [repo] | [path] | [claimed SHA] | [actual SHA] | [YES/NO/CANNOT VERIFY] | [PASS/FAIL] |

**Gap (if PARTIAL or FAIL):**
[Description]

---

### VT-05 — Rollback Claims

**Finding:** [PASS / PARTIAL / FAIL]  
**Evidence type:** [Directly inspected / Reported by executing agent]

**Evidence:**
```
[Confirm backup SHA is retrievable; confirm path is unambiguous]
```

**Gap (if PARTIAL or FAIL):**
[Description]

---

### VT-06 — Governance Assumptions

**Finding:** [PASS / PARTIAL / FAIL]  
**Evidence type:** [Directly inspected / Reported by executing agent]

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
**Evidence type:** [Directly inspected / Reported by executing agent]

**Live GET results:**

| Repository | File path | Content SHA (claimed) | Content SHA (live GET) | Match |
|------------|-----------|-----------------------|------------------------|-------|
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
→ Stage 4 is mandatory. See Remediation Request committed alongside this report (or output below in Claude Code Commit Handoff section).

**This report's commit SHA:** [SHA — executing agent records this when reading the report]

---

## Claude Code Commit Handoff

*This section is required when Codex is in Option B (Read-Only Reviewer With Claude Code Commit Handoff). If Codex committed directly (Option A), record the commit SHA above and omit the Markdown content block below.*

| Field | Value |
|-------|-------|
| Artefacts to commit | This Challenge Report; Remediation Request (if GAPS FOUND) |
| Exact filenames | `PHASE_[NAME]_CHALLENGE_REPORT_[YYYYMMDD].md`; `PHASE_[NAME]_REMEDIATION_REQUEST_[YYYYMMDD].md` |
| Repository target path | `begb0037admin/command-centre/docs/project/generated/` |
| Wording preservation | Claude Code must commit this content exactly as supplied — no edits, no reformatting, no omissions |
| Required verification | After each commit: retrieve file via GitHub Contents API and confirm content SHA matches |
| Required HANDOVER.md update | Claude Code must update HANDOVER.md with: artefact paths, commit SHAs, verification results, Codex operating mode (Option B), and next workflow stage |

**Full artefact Markdown for Claude Code to commit (Option B only):**

[Codex: paste the complete Markdown content of this document here, and the Remediation Request below, so Claude Code can commit them verbatim.]
