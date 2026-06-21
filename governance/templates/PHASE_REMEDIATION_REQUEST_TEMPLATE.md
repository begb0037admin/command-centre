# PHASE_[NAME]_REMEDIATION_REQUEST_[YYYYMMDD].md
# Phase [Name] — Remediation Request

---

## Document Information

| Field | Value |
|-------|-------|
| Phase | [Phase name and number] |
| Date | [YYYY-MM-DD] |
| Produced by | [Challenging agent (Codex) identifier / session ID] |
| In response to | Challenge Report at commit SHA: [SHA] |
| Governed by | GOVERNANCE_WORKFLOW_STANDARD.md v[X] |
| Status | [Awaiting Claude Code remediation] |
| Commit SHA (this document) | [SHA — populated after commit] |

---

## Codex Operating Mode Declaration

**Operating mode:** [Option A — Controlled GitHub Artefact Writer / Option B — Read-Only Reviewer With Claude Code Commit Handoff]

**Write boundary confirmed:** This Remediation Request identifies gaps and required remediation actions only. Codex does not implement the remediation. Claude Code (executing agent) implements all remediation writes under the standard backup-first, GET-verify protocol.

---

## Inputs

| Input | Repository path | Commit SHA |
|-------|----------------|------------|
| Challenge Report | [docs/project/generated/ or chat output] / PHASE_[NAME]_CHALLENGE_REPORT_[YYYYMMDD].md | [SHA] |
| Evidence Package | command-centre/governance/evidence/PHASE_[NAME]_EVIDENCE_PACKAGE_[YYYYMMDD].md | [SHA] |

---

## Outputs

This document instructs Claude Code (executing agent) to implement the remediations listed below. On completion, Claude Code produces:

| Output | Type | Path |
|--------|------|------|
| Remediation Evidence document | `PHASE_[NAME]_REMEDIATION_EVIDENCE_[YYYYMMDD].md` | `command-centre/governance/evidence/` |

---

## Evidence References

| Reference | Detail |
|-----------|--------|
| Challenge Report gap summary | [Copy the gap descriptions from the Challenge Report here] |

---

## Gap Register

For each FAIL or PARTIAL finding in the Challenge Report, describe the gap and the required remediation action for Claude Code.

### GAP-01 (from VT-[XX])

**Finding from Challenge Report:** [FAIL/PARTIAL]  
**Gap description:** [What was missing, incorrect, or unverifiable]  
**Root cause:** [Why the gap occurred]  
**Required remediation (for Claude Code):** [Specific action — e.g., push missing backup to Archive/, re-run GET verification and record SHA, amend Evidence Package with API response]  
**Files affected:** [repo/path]  
**Backup required before remediation write?** [YES/NO — and if YES, confirm backup does not already exist for today]

---

### GAP-02 (from VT-[XX])

**Finding from Challenge Report:** [FAIL/PARTIAL]  
**Gap description:** [Description]  
**Root cause:** [Root cause]  
**Required remediation (for Claude Code):** [Action]  
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
|------|----------|-----------|
| Remediation write introduces new gap not covered by original backup | MEDIUM | New backup taken immediately before each remediation write |
| Gap is architectural (not fixable by re-run) | HIGH | Escalate to Kevin before proceeding |
| [Additional risk] | [Severity] | [Mitigation] |

---

## Kevin Approval Gate

This Remediation Request requires Kevin's explicit approval before any remediation write proceeds.

**Kevin — please confirm:**
- [ ] The gap register accurately describes the gaps found by the challenger.
- [ ] The proposed remediations are appropriate.
- [ ] You authorise the executing agent (Claude Code) to proceed with the writes listed above.

**Kevin's approval recorded at:** [timestamp / commit SHA of Kevin's approval message or commit]

---

## NEXT STAGE

**Target Agent:** Claude Code

**Required Inputs:**
- `PHASE_[NAME]_EVIDENCE_PACKAGE_[YYYYMMDD].md`
- `PHASE_[NAME]_REVIEW_REQUEST_[YYYYMMDD].md`
- `PHASE_[NAME]_CHALLENGE_REPORT_[YYYYMMDD].md`
- `PHASE_[NAME]_REMEDIATION_REQUEST_[YYYYMMDD].md` (this document)

**Required Outputs:**
- `PHASE_[NAME]_REMEDIATION_EVIDENCE_[YYYYMMDD].md` — committed to `command-centre/governance/evidence/`
- `PHASE_[NAME]_VALIDATION_REQUEST_[YYYYMMDD].md` — committed to `command-centre/governance/evidence/`

**Workflow Status:** Stage 3 Complete / Stage 4 Pending

**Handoff Instructions:** Claude Code must address each gap in the Gap Register above, collect backup and write evidence under the standard backup-first protocol, avoid governance conclusions, and produce the Remediation Evidence and Validation Request artefacts. All remediation writes require Kevin's approval recorded at the approval gate above before proceeding.

---

## Claude Code Commit Handoff

*This section applies when Codex is in Option B (Read-Only Reviewer With Claude Code Commit Handoff). If Codex committed directly (Option A), record the commit SHA above and omit the Markdown content block below.*

| Field | Value |
|-------|-------|
| Artefacts to commit | This Remediation Request |
| Exact filename | `PHASE_[NAME]_REMEDIATION_REQUEST_[YYYYMMDD].md` |
| Repository target path | `begb0037admin/command-centre/docs/project/generated/` |
| Wording preservation | Claude Code must commit this content exactly as supplied — no edits, no reformatting, no omissions |
| Required verification | After commit: retrieve file via GitHub Contents API and confirm content SHA matches |
| Required HANDOVER.md update | Claude Code must update HANDOVER.md with: artefact path, commit SHA, verification result, Codex operating mode (Option B), and next workflow stage (Stage 4 — Remediation, pending Kevin approval) |

**Full artefact Markdown for Claude Code to commit (Option B only):**

[Codex: paste the complete Markdown content of this document here so Claude Code can commit it verbatim.]
