# PHASE_[NAME]_REVIEW_REQUEST_[YYYYMMDD].md
# Phase [Name] — Review Request

---

## Document Information

| Field | Value |
|-------|-------|
| Phase | [Phase name and number] |
| Date | [YYYY-MM-DD] |
| Produced by | [Executing agent identifier / session ID] |
| Addressed to | [Challenging agent — e.g., Codex / independent Claude Code session] |
| Governed by | GOVERNANCE_WORKFLOW_STANDARD.md v[X] |
| Status | Open — awaiting Challenge Report |
| Commit SHA (this document) | [SHA — populated after commit] |

---

## Inputs

| Input | Repository path | Commit SHA |
|-------|----------------|------------|
| Evidence Package | command-centre/governance/evidence/PHASE_[NAME]_EVIDENCE_PACKAGE_[YYYYMMDD].md | [SHA] |
| Governance Workflow Standard | command-centre/governance/GOVERNANCE_WORKFLOW_STANDARD.md | [SHA] |

---

## Outputs

This request requires the challenging agent to produce:

| Output | Filename | Destination |
|--------|----------|-------------|
| Challenge Report | `PHASE_[NAME]_CHALLENGE_REPORT_[YYYYMMDD].md` | `command-centre/governance/evidence/` |

---

## Critical Instructions for the Challenging Agent

1. **You are an independent challenger.** You have no memory of the execution session and no prior relationship with the executing agent's claims.

2. **The Evidence Package is an unverified claim set.** Do not treat it as an authoritative record. Every claim must be independently confirmed before you mark it PASS.

3. **Primary evidence only.** A claim is verified only when you have retrieved the supporting data directly from the GitHub API or another authoritative source. The executing agent's assertion is not evidence.

4. **No silent passes.** Every verification task listed below must receive a finding. If you cannot verify a claim — because the API is unreachable, the file does not exist, or the SHA does not match — record it as FAIL or PARTIAL with an explanation.

5. **Do not communicate with the executing agent.** All findings go into the Challenge Report committed to the repository.

---

## Evidence References

| Reference | Path | SHA |
|-----------|------|-----|
| Evidence Package (full text) | command-centre/governance/evidence/PHASE_[NAME]_EVIDENCE_PACKAGE_[YYYYMMDD].md | [SHA] |

---

## Verification Tasks

The challenging agent must independently verify each of the following. Record each as PASS, PARTIAL, or FAIL in the Challenge Report with primary evidence.

### VT-01 — Repository Scope Completeness

Verify that the Evidence Package accounts for every repository in governance scope. For each repository listed in GOVERNANCE_WORKFLOW_STANDARD.md Section 6 (or AGENT_MODEL.md Section 8), confirm:
- The Evidence Package states whether it was in scope.
- If in scope: a write commit SHA is recorded and the commit exists at GitHub.
- If excluded: a reason is given.

Required evidence: GitHub API response confirming each claimed commit SHA exists.

### VT-02 — Authentication Verification

Verify that the authentication mechanism described in the Evidence Package was the actual mechanism used — not an assumed or retrospective claim. Confirm:
- The authentication mechanism is consistent with AGENT_MODEL.md Section 7.
- At least one write commit was successfully made during the execution window (commit timestamp consistent with session date).

Required evidence: GitHub API commit detail for the earliest write commit, confirming author identity and timestamp.

### VT-03 — Authorization Verification

Verify that the writes performed were within the authorized scope. Confirm:
- Each written file is a governance file (not tasks.json, index.html, or any data file requiring a separate approval gate).
- No approval gate from AGENT_MODEL.md Section 2 was triggered without a recorded Kevin approval.

Required evidence: list of files written (from GitHub commit API) cross-referenced against approval gate definitions.

### VT-04 — Backup Validation

For every backup claimed in the Evidence Package:
- Retrieve the backup file via GitHub Contents API.
- Confirm the content SHA matches the claimed backup content SHA.
- Confirm the backup file was committed before the governance write (compare commit timestamps).
- Confirm the backup file path follows the datestamped naming convention.

Required evidence: GitHub Contents API response for each backup file, including SHA and commit timestamp.

### VT-05 — Rollback Claims

Verify that the rollback path described in the Evidence Package is independently executable. Confirm:
- The backup SHA cited in the rollback path exists and is retrievable.
- The file path is correct and unambiguous.
- A rollback PUT using that SHA and that path would restore the pre-write state.

Required evidence: GitHub Contents API response for each backup file confirming SHA and decodeable content.

### VT-06 — Governance Assumptions

Review every assumption listed in the Evidence Package. For each:
- Assess whether the assumption is valid based on independently verifiable evidence.
- If an assumption cannot be verified, record it as PARTIAL.
- If an assumption is demonstrably false, record it as FAIL.

Required evidence: stated per assumption — API response, documentation reference, or explicit statement of inability to verify.

### VT-07 — Estate-Wide Completion

Verify the estate-wide completion claim: that every repository intended to be updated was updated and verified. Confirm:
- The count of repositories updated matches the count claimed.
- For each repository: the claimed post-write content SHA matches the actual content SHA returned by a live GET.
- No repository in scope was silently skipped.

Required evidence: live GitHub Contents API GET for each updated file in each repository, returning current content SHA.

---

## Assumptions

1. The challenging agent has independent read access to all begb0037admin repositories via GitHub API.
2. The Evidence Package commit SHA provided above is the definitive version to challenge — later edits to the Evidence Package invalidate this request.

---

## Risks

| Risk | Severity | Note |
|------|----------|------|
| Challenging agent cannot reach GitHub API | HIGH | Record as PARTIAL for all VT items requiring live API calls; do not mark PASS |
| Evidence Package was amended after this request was committed | MEDIUM | Use the SHA pinned in the Inputs table above, not HEAD |

---

## NEXT STAGE

**→ Challenging agent produces: `PHASE_[NAME]_CHALLENGE_REPORT_[YYYYMMDD].md`**

The Challenge Report must be committed to `command-centre/governance/evidence/` on branch `main`. The executing agent will read it at that path.

If all findings are PASS → the executing agent proceeds to Stage 6 (Governance Review Request).
If any finding is FAIL or PARTIAL → Stage 4 (Remediation) is mandatory before Stage 6.

**Challenge Report commit SHA (to be recorded by challenging agent):** [populated by challenger]
