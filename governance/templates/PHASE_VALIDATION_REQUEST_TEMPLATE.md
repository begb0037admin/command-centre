# PHASE_[NAME]_VALIDATION_REQUEST_[YYYYMMDD].md
# Phase [Name] — Validation Request

---

## Document Information

| Field | Value |
|-------|-------|
| Phase | [Phase name and number] |
| Date | [YYYY-MM-DD] |
| Produced by | [Executing agent (Claude Code) identifier / session ID] |
| Addressed to | [Challenging agent — same agent that produced the Challenge Report] |
| Governed by | GOVERNANCE_WORKFLOW_STANDARD.md v[X] |
| Status | Open — awaiting Validation Report |
| Commit SHA (this document) | [SHA — populated after commit] |

---

## Codex Operating Mode

Before beginning validation, Codex must re-verify and declare its operating mode for this session:

**Option A — Controlled GitHub Artefact Writer**  
Codex has write access to `begb0037admin/command-centre/docs/project/generated/` and will commit the Validation Report directly.

**Option B — Read-Only Reviewer With Claude Code Commit Handoff**  
Codex does not have write access. Codex will output the full Markdown Validation Report in chat for Claude Code to commit to `begb0037admin/command-centre/docs/project/generated/`.

**Write boundary:** Codex may write only to `docs/project/generated/`. Codex must not modify governance standards, templates, implementation files, production files, operational files, application code, backups, remediation evidence, or HANDOVER.md.

**Operating mode for this session:** [Option A / Option B — Codex declares before producing output]

---

## Inputs

| Input | Repository path | Commit SHA |
|-------|----------------|------------|
| Challenge Report | docs/project/generated/PHASE_[NAME]_CHALLENGE_REPORT_[YYYYMMDD].md | [SHA] |
| Remediation Evidence | command-centre/governance/evidence/PHASE_[NAME]_REMEDIATION_EVIDENCE_[YYYYMMDD].md | [SHA] |
| Remediation Request (approved) | docs/project/generated/PHASE_[NAME]_REMEDIATION_REQUEST_[YYYYMMDD].md | [SHA] |

---

## Outputs

| Output | Filename | Destination |
|--------|----------|-------------|
| Validation Report | `PHASE_[NAME]_VALIDATION_REPORT_[YYYYMMDD].md` | `begb0037admin/command-centre/docs/project/generated/` |

---

## Evidence References

| Reference | Detail |
|-----------|--------|
| Gap Closure Record | See Remediation Evidence document, section "Gap Closure Record" |

---

## Instructions for the Challenging Agent

1. You produced the Challenge Report for this phase. You are re-validating your own findings against the remediation commits.
2. **Do not accept the Remediation Evidence as proof.** The Remediation Evidence is the executing agent's claim that gaps were closed. You must independently verify each claim via live GitHub API calls.
3. For each previously FAIL or PARTIAL item, retrieve the file at the commit SHA claimed in the Remediation Evidence and confirm: content SHA matches, file exists, timestamp is after the original execution window.
4. If a gap is only partially closed, record it as PARTIAL again. Do not promote a PARTIAL to PASS unless the original gap condition is fully resolved.
5. **Distinguish directly inspected from reported evidence.** PASS requires direct inspection. State explicitly for each finding whether you retrieved evidence directly from the GitHub API in this session.
6. **Write boundary.** See Codex Operating Mode above. Commit the Validation Report to `docs/project/generated/` only. If write access is unavailable, output the full Markdown in chat with a Claude Code Commit Handoff section.

---

## Validation Tasks

For each gap listed in the Remediation Request, re-run the relevant VT check:

| Gap ID | Original VT | Remediation commit SHA | Re-verify |
|--------|-------------|------------------------|-----------|
| GAP-01 | VT-[XX] | [SHA] | [Confirm content SHA and existence via GET] |
| GAP-02 | VT-[XX] | [SHA] | [Confirm content SHA and existence via GET] |

---

## Assumptions

1. The Remediation Evidence commit SHA provided above is the definitive version — any later amendments are out of scope for this validation.
2. The challenging agent has independent read access to all affected repositories.

---

## Risks

| Risk | Severity | Note |
|------|----------|------|
| Remediation write introduced a new gap not visible in the original VT checks | MEDIUM | Challenger should note any new issues observed, even if not in scope |
| API unavailable during validation | HIGH | Record all affected items as PARTIAL; do not mark PASS |
| Codex write access unavailable | MEDIUM | Switch to Option B; output full Validation Report Markdown in chat |

---

## NEXT STAGE

**→ Challenging agent produces: `PHASE_[NAME]_VALIDATION_REPORT_[YYYYMMDD].md`**

Commit to `begb0037admin/command-centre/docs/project/generated/` (Option A) or output in chat for Claude Code to commit (Option B).

All previously FAIL/PARTIAL items must reach PASS in the Validation Report before Stage 6 can proceed.

If any item remains FAIL or PARTIAL after validation → the executing agent must produce a revised Remediation Request for Kevin's approval before re-submitting for validation.

**Validation Report commit SHA (recorded by Codex or Claude Code after commit):** [populated after commit]

---

## Claude Code Commit Handoff

*This section applies if Codex is in Option B. If Codex commits directly (Option A), this section is not used.*

| Field | Value |
|-------|-------|
| Artefact to commit | Validation Report |
| Exact filename | `PHASE_[NAME]_VALIDATION_REPORT_[YYYYMMDD].md` |
| Repository target path | `begb0037admin/command-centre/docs/project/generated/` |
| Wording preservation | Claude Code must commit Codex artefact content exactly as supplied — no edits, no reformatting, no omissions |
| Required verification | After commit: retrieve file via GitHub Contents API and confirm content SHA matches |
| Required HANDOVER.md update | Claude Code must update HANDOVER.md with: artefact path, commit SHA, verification result, Codex operating mode, and next workflow stage |
