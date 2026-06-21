# PHASE_1_REVIEW_REQUEST.md
# Governance Phase 1 — Review Request

---

## Document Information

| Field | Value |
|-------|-------|
| Phase | Phase 1 — AGENT_MODEL.md v2.0 estate-wide propagation |
| Date | 2026-06-21 |
| Produced by | Claude Code (executing agent, session 5cdf4b0d-db13-5236-8b76-3bc923faa760) |
| Addressed to | **Codex** (independent challenging agent) |
| Governed by | GOVERNANCE_WORKFLOW_STANDARD.md v1.0 (commit `6f6cd8ae31d17c0c3c251f4837724c4279578a4a`) |
| Template used | governance/templates/PHASE_REVIEW_REQUEST_TEMPLATE.md |
| Status | Open — awaiting Challenge Report |
| Commit SHA (this document) | `2d781348be9e8d1b76e619a8a1da79d9248f3ea0` |
| Content SHA (this document) | `d3df3f62bb704f25d3a2336fce8176ef4a847c73` |

---

## Inputs

| Input | Repository path | Commit SHA |
|-------|----------------|------------|
| Evidence Package | begb0037admin/command-centre — governance/evidence/PHASE_1_EVIDENCE_PACKAGE.md | `2d781348be9e8d1b76e619a8a1da79d9248f3ea0` |
| Governance Workflow Standard | begb0037admin/command-centre — governance/GOVERNANCE_WORKFLOW_STANDARD.md | `6f6cd8ae31d17c0c3c251f4837724c4279578a4a` |
| Phase templates | begb0037admin/command-centre — governance/templates/ | `6f6cd8ae31d17c0c3c251f4837724c4279578a4a` |
| AGENT_MODEL.md (source of truth) | begb0037admin/command-centre — AGENT_MODEL.md | current HEAD |
| HANDOVER.md (Phase 1 record) | begb0037admin/command-centre — HANDOVER.md | `63fda3e983668eb085f0a984fc8b09a911c07dad` |

---

## Purpose

This request commissions Codex to independently challenge the claims made in `PHASE_1_EVIDENCE_PACKAGE.md`. The purpose is to identify gaps, errors, unverifiable claims, and missing evidence before the phase proceeds to governance decision (Stage 6).

---

## Critical Instructions for Codex

Read all instructions before beginning any verification task.

### 1. The Evidence Package is an unverified claim set

`governance/evidence/PHASE_1_EVIDENCE_PACKAGE.md` is a document produced by the executing agent describing what it claims to have done. It is not an authoritative record. Every claim in it must be independently confirmed before you mark it PASS. Internal consistency and plausibility are not evidence.

### 2. Reports are not authoritative evidence

HANDOVER.md, session summaries, and any other document produced by the executing agent are not evidence. Evidence is a live GitHub API response: a commit record, a file content SHA, a file list — data retrieved by you, not stated by the executing agent.

### 3. Inspect repository state directly where available

For every repository and file listed in the Evidence Package, make a live GET call to verify current state. Do not infer state from the Evidence Package. Do not assume a file exists at a claimed SHA without retrieving it.

### 4. Inspect commit history directly where available

For claims about ordering (backup before write), timestamps (execution on 2026-06-21), and file scope (only governance files modified), retrieve the commit records from the GitHub API and read the actual metadata. Do not accept the executing agent’s characterisation of commit contents.

### 5. Distinguish evidence you directly inspected from evidence merely reported by Claude Code

In your Challenge Report, every finding must clearly state whether the underlying data was:
- **Directly inspected:** You retrieved it from GitHub API and are reporting what you received.
- **Reported by Claude Code:** You are relaying what the Evidence Package says, without independent verification.

Do not mark any item PASS on the basis of reported evidence. PASS requires direct inspection.

### 6. Actively seek contradictory evidence

This is not a confirmation exercise. For each claim, ask: what would falsify this? Then check. Examples:
- Does the backup commit timestamp predate the write commit timestamp? Compare both.
- Does the content SHA match in every repo, or only in some? Check each individually.
- Is the file at the path claimed, or at a different path?
- Does the commit exist at GitHub, or does the API return 404?
- Are there repos in scope that the Evidence Package did not account for?

### 7. No silent passes

Every VT item below must receive a finding (PASS, PARTIAL, or FAIL). An absent finding is treated as FAIL by the executing agent.

### 8. PARTIAL vs FAIL

- **FAIL:** The claim is demonstrably false, or the required evidence was sought and not found.
- **PARTIAL:** The claim cannot be fully verified from the available evidence (e.g., an assumption cannot be confirmed after the fact), but no contradictory evidence was found either.
- **PASS:** You directly inspected the relevant API response and it supports the claim.

---

## Evidence References

| Reference | Path | Note |
|-----------|------|------|
| Evidence Package | begb0037admin/command-centre / governance/evidence/PHASE_1_EVIDENCE_PACKAGE.md | Treat as unverified |
| Governance Workflow Standard | begb0037admin/command-centre / governance/GOVERNANCE_WORKFLOW_STANDARD.md | Reference for estate scope |
| AGENT_MODEL.md Section 8 | begb0037admin/command-centre / AGENT_MODEL.md | Authoritative repo scope list |
| HANDOVER.md | begb0037admin/command-centre / HANDOVER.md | Treat as claim, not evidence |

---

## Verification Tasks

### VT-01 — Repository Scope Completeness

**Claim being verified:** The Evidence Package accounts for every repository in the begb0037admin governance estate. Every in-scope repository either has a recorded write commit or a stated reason for exclusion.

**Directly inspect:**
1. Retrieve AGENT_MODEL.md from `begb0037admin/command-centre`. Read Section 8 (Repository Scope table). This is the authoritative list.
2. For each repository in Section 8, check whether the Evidence Package addresses it: updated, excluded with reason, or out-of-scope.
3. Identify any Section 8 repository the Evidence Package does not mention.
4. Specifically for `begb0037admin/ag-flexpoints`: the Evidence Package states this was not in session scope. Attempt to retrieve AGENT_MODEL.md from this repo. Record the result (content and version, or 404/access-denied).
5. Check whether any repositories exist under begb0037admin that do not appear in the Section 8 table.

**Required evidence:** Section 8 table content (directly retrieved); GitHub API response for ag-flexpoints AGENT_MODEL.md; any additional repos found.

---

### VT-02 — Authentication Verification

**Claim being verified:** All governance writes were performed using the MCP GitHub server / gh CLI keyring. The GITHUB_PAT env var was absent but correctly identified as non-blocking (not Claude Code’s auth mechanism).

**Directly inspect:**
1. Retrieve the commit record for the earliest write commit: abbreviated `7565ad8d` (clockify Archive/AGENT_MODEL_backup_20260621.md). Confirm: full SHA, date is 2026-06-21, committer identity.
2. Retrieve AGENT_MODEL.md Section 7. Record what it states about authentication mechanisms.
3. Assess whether the committer identity in the commit record is consistent with the authentication mechanism described in Section 7.

**Required evidence:** GitHub API commit detail (full SHA, author, committer, date, message); AGENT_MODEL.md Section 7 text — both directly retrieved.

---

### VT-03 — Authorization Verification

**Claim being verified:** No approval gate (AGENT_MODEL.md v2.0 Section 2) was triggered. All writes were to governance files only (AGENT_MODEL.md and Archive/ backups). No writes touched data/tasks.json, index.html, or any data file.

**Directly inspect:**
1. Retrieve the commit detail (file list) for each of the 14 claimed commits (7 backup commits + 7 write commits). For each commit, record exactly which files were modified.
2. Retrieve AGENT_MODEL.md Section 2 approval gates. Record the five gate definitions.
3. For each gate: assess whether any write in the 14 commits touches a file or action in scope of that gate.
4. Flag any commit that modified a file not described in the Evidence Package.

**Required evidence:** GitHub API commit detail with file list for all 14 commits; AGENT_MODEL.md Section 2 text — all directly retrieved.

---

### VT-04 — Backup Validation

**Claim being verified:** A datestamped backup exists at `Archive/AGENT_MODEL_backup_20260621.md` in all 7 target repositories, committed before the governance write, with content SHA matching the pre-write baseline.

**Directly inspect:**
1. For each of the 7 repositories, perform GET on `Archive/AGENT_MODEL_backup_20260621.md`. Record the returned content SHA.
2. Compare returned content SHA against the value claimed in the Evidence Package Backup Evidence table.
3. Retrieve commit timestamps for each backup commit and its corresponding write commit. Confirm backup timestamp < write timestamp.
4. Retrieve and attempt to decode the backup file content. Confirm it is non-empty and contains AGENT_MODEL.md text.

**Required evidence:** GitHub Contents API GET for Archive/AGENT_MODEL_backup_20260621.md in each of the 7 repos (content SHA field); commit timestamps for backup and write commits — all directly retrieved.

---

### VT-05 — Rollback / Recovery Claims

**Claim being verified:** The rollback path is independently executable from the information in the Evidence Package alone. Backup data is present and decodeable.

**Directly inspect:**
1. For each of the 7 repositories: confirm Archive/AGENT_MODEL_backup_20260621.md is retrievable via GET and decodeable (non-empty base64 content).
2. Confirm the backup content SHA returned by live GET matches the SHA claimed in the Evidence Package.
3. Assess whether the Evidence Package provides sufficient information (repo, path, SHA) for a different agent to execute a rollback without any additional context.
4. Note: do not execute a rollback write. Confirm recoverability only.

**Required evidence:** GitHub Contents API GET for each backup file confirming SHA and decodeable content — directly retrieved.

---

### VT-06 — Governance Assumptions

**Claim being verified:** The assumptions listed in the Evidence Package are valid, or where they cannot be verified after the fact, this is stated as PARTIAL with explanation.

**Evidence Package assumptions to assess:**
1. MCP GitHub server held valid write credentials at execution time.
2. GitHub’s Contents API returned accurate SHAs — no false positive from caching.
3. Source-of-truth AGENT_MODEL.md in command-centre and work-inbox (SHA `5d5ff18872e803ad5ee8f50639fabed7abc56d06`) was the correct current v2.0.
4. meeting-records v1.1 Section 9 removal creates no governance gap.
5. ag-flexpoints absence from session scope does not constitute a Phase 1 completion gap.
6. No subsequent commits to any target repo’s AGENT_MODEL.md occurred between the write session and this Evidence Package.

**Directly inspect:**
- **Assumption 3:** GET AGENT_MODEL.md from command-centre and work-inbox. Record current content SHA. If it is no longer `5d5ff18...`, record as FAIL.
- **Assumption 4:** Retrieve meeting-records CLAUDE.md. Confirm whether Branch and Merge Protocol text is present.
- **Assumption 6:** GET AGENT_MODEL.md from each of the 7 target repos. If current content SHA is no longer `05fc8adaab7e5b9524fe2c4f85ace667d7e04801`, investigate commit history to determine whether a subsequent write has occurred.
- **Assumptions 1, 2, 5:** Cannot be verified after the fact. Record each as PARTIAL with explanation.

**Required evidence:** GET responses from command-centre, work-inbox, and all 7 target repos; meeting-records CLAUDE.md content — all directly retrieved.

---

### VT-07 — Estate-Wide Completion Claims

**Claim being verified:** Every repository identified as requiring a v2.0 update has been updated. Current live state of AGENT_MODEL.md in all 7 target repos is v2.0, content SHA `05fc8adaab7e5b9524fe2c4f85ace667d7e04801`.

**Directly inspect:**
1. For each of the 7 target repositories (clockify, hr-fa-knowledge-base, hr-projects, meeting-records, hris-dashboard, hris-launcher, hris-change-requests): perform a live GET on AGENT_MODEL.md. Record the returned content SHA.
2. Compare each SHA against the expected value `05fc8adaab7e5b9524fe2c4f85ace667d7e04801`.
3. For any mismatch: retrieve the file and inspect for `Version : 2.0`. A mismatch may indicate a subsequent benign edit or a write failure — check commit history to distinguish.
4. Confirm the version line reads `Version : 2.0` in at least one directly-retrieved file excerpt.
5. Verify the estate count: number of repos updated + number excluded with stated reason = total repos in Section 8 scope table.

**Required evidence:** Live GitHub Contents API GET for AGENT_MODEL.md in each of the 7 target repos; version line excerpt; estate count cross-reference — all directly retrieved.

---

## Assumptions (about this Review Request)

1. The Evidence Package Codex challenges is the version at commit `2d781348be9e8d1b76e619a8a1da79d9248f3ea0`. Later amendments are out of scope.
2. Codex has independent read access to all begb0037admin repositories via the GitHub MCP tools.
3. Codex does not have access to the executing agent’s session transcript. All verification must use live GitHub API calls.

---

## Risks

| Risk | Severity | Note |
|------|----------|------|
| Codex cannot access GitHub API | HIGH | Record all VT items as PARTIAL; do not mark PASS. Report the access failure explicitly. |
| Evidence Package amended after this Review Request was committed | MEDIUM | Retrieve Evidence Package at commit `2d781348`, not at HEAD |
| Subsequent writes to target repos between execution and challenge | MEDIUM | VT-07 content SHA mismatch does not automatically mean write failed — check commit history |
| ag-flexpoints inaccessible to Codex | LOW | Attempt GET; record 404 or access-denied explicitly; feeds into VT-01 |

---

## NEXT STAGE

**Target Agent:** Codex

**Required Inputs:**
- `begb0037admin/command-centre / governance/evidence/PHASE_1_EVIDENCE_PACKAGE.md`
- `begb0037admin/command-centre / governance/evidence/PHASE_1_REVIEW_REQUEST.md`
- `begb0037admin/command-centre / governance/GOVERNANCE_WORKFLOW_STANDARD.md`
- `begb0037admin/command-centre / governance/templates/`

**Required Outputs:**
- `PHASE_1_CHALLENGE_REPORT.md` — committed to `begb0037admin/command-centre/governance/evidence/` on branch `main`
- `PHASE_1_REMEDIATION_REQUEST.md` — committed to the same path (required if any VT finding is FAIL or PARTIAL)

**Workflow Status:**
Stage 1 Complete / Stage 2 Pending

**Handoff Instructions:**
Codex should read the committed repository artefacts directly from GitHub, independently verify the evidence where access allows, challenge unsupported or overstated claims, and produce the required challenge and remediation artefacts.

For each VT item, Codex must clearly distinguish between evidence it directly inspected (retrieved from GitHub API in this session) and evidence merely reported by Claude Code (stated in the Evidence Package or HANDOVER.md). A finding of PASS requires direct inspection. Every VT item must receive a finding — no silent passes.
