# PHASE_[NAME]_EVIDENCE_PACKAGE_[YYYYMMDD].md
# Phase [Name] — Evidence Package

---

## Document Information

| Field | Value |
|-------|-------|
| Phase | [Phase name and number] |
| Date | [YYYY-MM-DD] |
| Produced by | [Agent identifier / session ID] |
| Governed by | GOVERNANCE_WORKFLOW_STANDARD.md v[X] |
| Status | Draft — awaiting challenge |
| Commit SHA (this document) | [SHA — populated after commit] |

---

## Inputs

<!-- List every input that informed the execution: approved task descriptions, prior
     artefacts, source files, Granola transcripts, inbox items. Include repo paths
     and commit SHAs where applicable. -->

| Input | Source | SHA / reference |
|-------|--------|-----------------|
| [Input 1] | [repo/path] | [SHA] |
| [Input 2] | [repo/path] | [SHA] |

---

## Outputs

<!-- List every file written, every commit made, and every repository affected.
     This section is the primary claim set that the challenging agent must verify. -->

| Repository | File path | Action | Commit SHA | Content SHA |
|------------|-----------|--------|------------|-------------|
| [owner/repo] | [path] | [created / updated / deleted] | [SHA] | [SHA] |

---

## Evidence References

<!-- For every output claimed above, provide the primary evidence. Primary evidence
     is a direct GitHub API response excerpt — not an assertion by the executing agent.
     Paste the relevant fields (sha, content sha, commit message, timestamp). -->

### [Repository 1] — [File path]

```
[Paste API response excerpt: sha, commit.sha, commit.message, commit.author.date]
```

### [Repository 2] — [File path]

```
[Paste API response excerpt]
```

---

## Backup Validation

<!-- For every governed file modified, record the backup created before the write.
     Include: backup file path, backup commit SHA, backup content SHA, and the
     GET verification result confirming the backup exists at that SHA. -->

| Repository | Backup file | Backup commit SHA | Backup content SHA | GET verified |
|------------|-------------|-------------------|--------------------|---------------|
| [owner/repo] | [Archive/file_backup_YYYYMMDD.md] | [SHA] | [SHA] | [YES / NO] |

---

## Rollback Claims

<!-- State the rollback path for each repository. The rollback path must be
     independently executable from the information in this document alone. -->

| Repository | Rollback method | Backup SHA to restore | Restoration commit would overwrite |
|------------|-----------------|----------------------|---------------------------------|
| [owner/repo] | Restore from Archive/[backup file] | [content SHA] | [current SHA after write] |

---

## Repository Scope

<!-- List every repository in governance scope at the time of this operation.
     For each, state whether it was in scope for this phase and the action taken.
     Repositories not in scope must still be listed with reason excluded. -->

| Repository | In scope this phase | Action taken | Reason if excluded |
|------------|---------------------|--------------|--------------------|
| begb0037admin/command-centre | [YES/NO] | [action] | [—] |
| begb0037admin/work-inbox | [YES/NO] | [action] | [—] |
| begb0037admin/clockify | [YES/NO] | [action] | [—] |
| begb0037admin/meeting-records | [YES/NO] | [action] | [—] |
| begb0037admin/hris-dashboard | [YES/NO] | [action] | [—] |
| begb0037admin/hris-launcher | [YES/NO] | [action] | [—] |
| begb0037admin/hr-fa-knowledge-base | [YES/NO] | [action] | [—] |
| begb0037admin/hr-projects | [YES/NO] | [action] | [—] |
| begb0037admin/hris-change-requests | [YES/NO] | [action] | [—] |
| begb0037admin/ag-flexpoints | [YES/NO] | [action] | [—] |

---

## Authentication and Authorization

<!-- Record the authentication mechanism used and the evidence that it was
     functioning at the time of execution. Do not record PAT values. -->

| Item | Evidence |
|------|----------|
| Authentication mechanism | [e.g., MCP GitHub server / gh CLI keyring] |
| Auth verified by | [e.g., successful GET of private API endpoint at HH:MM] |
| Write authorization evidence | [first successful PUT commit SHA and timestamp] |
| Rate limit status at execution | [remaining / limit, or N/A] |

---

## Assumptions

<!-- List every assumption made during execution that, if wrong, would invalidate
     a claim in this package. Be explicit. -->

1. [Assumption 1]
2. [Assumption 2]

---

## Risks

<!-- Identify residual risks: claims that could not be fully verified, dependencies
     on external systems, time-sensitive elements, or items deferred to a future phase. -->

| Risk | Severity | Mitigation or deferral |
|------|----------|------------------------|
| [Risk 1] | [HIGH / MEDIUM / LOW] | [Mitigation] |

---

## NEXT STAGE

**→ Stage 3: Challenge**

The executing agent must now produce `PHASE_[NAME]_REVIEW_REQUEST_[YYYYMMDD].md` and commit it to `governance/evidence/` in command-centre. The Review Request must reference this Evidence Package by its commit SHA and instruct the challenging agent to treat every claim in this document as unverified until independently confirmed.

The challenging agent must not begin work until the Review Request is committed and its SHA recorded here:

**Review Request commit SHA:** [populated after commit]
