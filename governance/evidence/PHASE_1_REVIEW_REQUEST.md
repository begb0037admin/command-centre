# PHASE_1_REVIEW_REQUEST.md
# Governance Phase 1 — Review Request

---

## Document Information

| Field | Value |
|-------|-------|
| Phase | Phase 1 — AGENT_MODEL.md v2.0 estate-wide propagation |
| Date | 2026-06-21 |
| Produced by | Claude Code (executing agent, session 5cdf4b0d-db13-5236-8b76-3bc923faa760) |
| Addressed to | **Codex** (challenging agent — independent session, no memory of execution) |
| Governed by | GOVERNANCE_WORKFLOW_STANDARD.md v1.0 (commit `6f6cd8ae`) |
| Template used | governance/templates/PHASE_REVIEW_REQUEST_TEMPLATE.md |
| Status | Open — Stage 3, awaiting Challenge Report |
| Commit SHA (this document) | [populated after commit] |

---

## Inputs

| Input | Repository path | Commit SHA |
|-------|----------------|------------|
| Evidence Package | begb0037admin/command-centre / governance/evidence/PHASE_1_EVIDENCE_PACKAGE.md | [SHA — see verification section below] |
| Governance Workflow Standard | begb0037admin/command-centre / governance/GOVERNANCE_WORKFLOW_STANDARD.md | `6f6cd8ae` |
| Governance workflow templates | begb0037admin/command-centre / governance/templates/ | `6f6cd8ae` |
| AGENT_MODEL.md (command-centre, source of truth) | begb0037admin/command-centre / AGENT_MODEL.md | current HEAD |
| HANDOVER.md (Phase 1 record) | begb0037admin/command-centre / HANDOVER.md | `63fda3e9` |

---

## Outputs Required

This request requires Codex to produce the following artefacts and commit them to `begb0037admin/command-centre/governance/evidence/` on branch `main`:

| Output | Filename | Stage |
|--------|----------|-------|
| Challenge Report | `PHASE_1_CHALLENGE_REPORT.md` | Stage 3 output |
| Remediation Request | `PHASE_1_REMEDIATION_REQUEST.md` | Stage 4 input (required if any finding is FAIL or PARTIAL) |

The Remediation Request is only populated if the Challenge Report finds FAIL or PARTIAL items. If all findings are PASS, Codex notes this in the Challenge Report and the executing agent proceeds directly to Stage 6.

---

## Critical Instructions for Codex

Read these instructions in full before beginning any verification task.

### 1. You are an independent challenger

You have no memory of the execution session that produced the Phase 1 work. You did not observe the writes. You cannot verify what the executing agent claims to have done by reading the executing agent's own statements.

### 2. The Evidence Package is an unverified claim set

The file `governance/evidence/PHASE_1_EVIDENCE_PACKAGE.md` contains the executing agent's account of what was done. **It is not an authoritative record.** Every claim in that document must be independently confirmed before you mark it PASS. A claim that sounds plausible, internally consistent, or well-documented is still unverified until you have retrieved supporting data from GitHub directly.

### 3. Reports are not authoritative evidence

HANDOVER.md, session summaries, and any other document produced by the executing agent are not evidence. They are claims. Evidence is a live GitHub API response, a commit record, a file content SHA returned by a GET — data retrieved by you, not stated by the executing agent.

### 4. Inspect repository state directly where available

For every repository listed in the Evidence Package, you must make a live GET call to verify the current state. Do not infer state from the Evidence Package. Do not assume that because the Evidence Package says a file exists at a given SHA, it actually does.

### 5. Actively seek contradictory evidence

Do not approach this as a confirmation exercise. Your task is to find gaps, errors, and inconsistencies. For each claim, ask: what would falsify this? Then check for it. Specific examples:
- Does the backup commit predate the write commit? Check both timestamps.
- Does the content SHA match in every repo, or only in some?
- Is the file at the path the Evidence Package claims, or at a different path?
- Does the commit exist, or does the GitHub API return 404?
- Are there repos in scope that the Evidence Package did not account for?

### 6. Record your findings with primary evidence

For each verification task, paste the relevant portion of the GitHub API response that supports your finding. Do not summarise. If you cannot retrieve evidence for a claim, record the item as PARTIAL or FAIL with an explanation of what you attempted and what you received.

### 7. No silent passes

Every verification task listed below must receive a finding. VT items with no finding are treated as FAIL by the executing agent.

---

## Evidence References

| Reference | Path in begb0037admin/command-centre | Note |
|-----------|--------------------------------------|------|
| Evidence Package | governance/evidence/PHASE_1_EVIDENCE_PACKAGE.md | Primary claim set — treat as unverified |
| Governance Workflow Standard | governance/GOVERNANCE_WORKFLOW_STANDARD.md | Defines scope of estate and verification requirements |
| AGENT_MODEL.md Section 8 | AGENT_MODEL.md | Defines repository governance scope |
| HANDOVER.md | HANDOVER.md | Session close-out record — treat as claim, not evidence |

---

## Verification Tasks

### VT-01 — Repository Scope Completeness

**Claim being verified:** The Evidence Package accounts for every repository in the begb0037admin governance estate. Every in-scope repository either has a recorded write commit or a stated reason for exclusion.

**What to check:**
1. Retrieve the current AGENT_MODEL.md from `begb0037admin/command-centre`. Read Section 8 (Repository Scope table). This is the authoritative list of governed repositories.
2. For each repository in that table, check whether the Evidence Package addresses it: updated, excluded with reason, or out-of-scope.
3. Identify any repository in the Section 8 table that the Evidence Package does not mention at all.
4. Pay particular attention to `begb0037admin/ag-flexpoints` — the Evidence Package claims this was not in MCP session scope and was therefore not inspected. Verify whether this repo exists and, if it does, retrieve its AGENT_MODEL.md and record the version.
5. Check whether there are any repositories under begb0037admin that do not appear in the AGENT_MODEL.md Section 8 table and are not mentioned in the Evidence Package.

**Required evidence:** GitHub API response listing AGENT_MODEL.md Section 8 table content; GitHub API response for AGENT_MODEL.md in ag-flexpoints (or 404 if it does not exist); any additional repos found under begb0037admin not in scope table.

**Finding:** [PASS / PARTIAL / FAIL]

---

### VT-02 — Authentication Verification

**Claim being verified:** All governance writes were performed using the MCP GitHub server / gh CLI keyring mechanism. The GITHUB_PAT environment variable was absent but this was correctly identified as non-blocking because it is not Claude Code's authentication mechanism.

**What to check:**
1. Retrieve the commit record for the earliest write commit claimed in the Evidence Package (clockify backup, commit `7565ad8d` abbreviated). Confirm: the commit exists, it is dated 2026-06-21, and the committer identity is consistent with automated GitHub API writes (not a user push).
2. Confirm that the claim about GITHUB_PAT is consistent with AGENT_MODEL.md Section 7. Read Section 7 and record what it says about authentication.
3. Assess whether the authentication mechanism described is consistent with the commit metadata returned by the API.

**Required evidence:** GitHub API commit detail for earliest write commit (full SHA, author, committer, date, message); AGENT_MODEL.md Section 7 text.

**Finding:** [PASS / PARTIAL / FAIL]

---

### VT-03 — Authorization Verification

**Claim being verified:** No approval gate (AGENT_MODEL.md v2.0 Section 2) was triggered by Phase 1 writes. All writes were to governance files only (AGENT_MODEL.md and Archive/ backups). No writes were made to data/tasks.json, index.html, or any file requiring a separate approval gate.

**What to check:**
1. Retrieve the file list for each write commit claimed in the Evidence Package. For each commit, confirm that only the expected files were modified (AGENT_MODEL.md or Archive/AGENT_MODEL_backup_20260621.md).
2. Read AGENT_MODEL.md v2.0 Section 2 approval gates. Confirm that AGENT_MODEL.md propagation does not trigger any of the five listed gates.
3. Check whether any write commit also touched files not listed in the Evidence Package.

**Required evidence:** GitHub API commit detail (files changed) for each of the 14 commits (7 backups + 7 writes); AGENT_MODEL.md Section 2 text.

**Finding:** [PASS / PARTIAL / FAIL]

---

### VT-04 — Backup Validation

**Claim being verified:** A datestamped backup of the pre-write AGENT_MODEL.md exists at `Archive/AGENT_MODEL_backup_20260621.md` in all 7 target repositories. Each backup was committed before the corresponding governance write. Each backup content SHA matches the pre-write baseline SHA recorded in the Evidence Package.

**What to check:**
1. For each of the 7 repositories (clockify, hr-fa-knowledge-base, hr-projects, meeting-records, hris-dashboard, hris-launcher, hris-change-requests): perform a GET on `Archive/AGENT_MODEL_backup_20260621.md` and record the returned content SHA.
2. Compare the returned content SHA against the backup content SHA claimed in the Evidence Package Backup Evidence table.
3. For each backup commit and its corresponding write commit: retrieve both commit timestamps and confirm the backup commit timestamp is earlier than the write commit timestamp.
4. Confirm the backup file is not empty and is decodeable (base64 content returns a non-empty AGENT_MODEL.md).

**Required evidence:** GitHub Contents API GET response for Archive/AGENT_MODEL_backup_20260621.md in each of the 7 repos (SHA field); commit timestamps for backup commits and write commits (to confirm ordering).

**Finding:** [PASS / PARTIAL / FAIL]

---

### VT-05 — Rollback / Recovery Claims

**Claim being verified:** The rollback path described in the Evidence Package is independently executable. For each repository, a restore-from-backup operation could return AGENT_MODEL.md to its pre-write state using only the information in this Evidence Package.

**What to check:**
1. For each of the 7 repositories: confirm the backup file at `Archive/AGENT_MODEL_backup_20260621.md` is retrievable via GET and its content is decodeable.
2. Confirm the backup content SHA in the Evidence Package matches the SHA returned by live GET (not just the claim — the actual GET response).
3. Assess whether the rollback path is described with sufficient specificity that a different agent could execute it without additional information: correct file path, correct repo, correct SHA.
4. Note: a rollback PUT would write the backup content back to AGENT_MODEL.md. You are not required to execute the rollback — only to confirm the backup data is present and decodeable.

**Required evidence:** GitHub Contents API GET for each backup file confirming SHA and non-empty decodeable content.

**Finding:** [PASS / PARTIAL / FAIL]

---

### VT-06 — Governance Assumptions

**Claim being verified:** The assumptions listed in the Evidence Package are valid, or where they cannot be verified, this is stated explicitly.

**The Evidence Package lists the following assumptions:**

1. MCP GitHub server held valid write credentials at execution time.
2. GitHub's Contents API returned accurate SHAs — no false positive from caching.
3. Source-of-truth AGENT_MODEL.md in command-centre and work-inbox (SHA `5d5ff18872e803ad5ee8f50639fabed7abc56d06`) was the correct current v2.0.
4. meeting-records v1.1 Section 9 removal creates no governance gap.
5. ag-flexpoints absence from session scope does not constitute a Phase 1 gap.
6. No subsequent commits to any target repo's AGENT_MODEL.md have occurred between the write session and this Evidence Package.

**What to check:**
1. **Assumption 3:** GET AGENT_MODEL.md from command-centre and work-inbox. Confirm current content SHA. If it is no longer `5d5ff18...`, record as FAIL (subsequent modification).
2. **Assumption 4:** Read meeting-records CLAUDE.md and confirm whether Branch and Merge Protocol text is present (making Section 9 genuinely redundant).
3. **Assumption 6:** For each of the 7 target repos, confirm that AGENT_MODEL.md current content SHA is still `05fc8adaab7e5b9524fe2c4f85ace667d7e04801` (i.e., no subsequent write has occurred). If any has changed, record as FAIL.
4. Assumptions 1, 2, and 5 cannot be independently verified after the fact — record these as UNVERIFIABLE with explanation.

**Required evidence:** GET responses for AGENT_MODEL.md in command-centre and work-inbox; meeting-records CLAUDE.md content; current AGENT_MODEL.md content SHA in all 7 target repos.

**Finding:** [PASS / PARTIAL / FAIL]

---

### VT-07 — Estate-Wide Completion Claims

**Claim being verified:** Every repository that was identified as requiring a v2.0 update has been updated. The current live state of AGENT_MODEL.md in all 7 target repositories is v2.0, with content SHA `05fc8adaab7e5b9524fe2c4f85ace667d7e04801`.

**What to check:**
1. For each of the 7 target repositories (clockify, hr-fa-knowledge-base, hr-projects, meeting-records, hris-dashboard, hris-launcher, hris-change-requests): perform a live GET on AGENT_MODEL.md and record the returned content SHA.
2. Compare each returned SHA against the expected SHA `05fc8adaab7e5b9524fe2c4f85ace667d7e04801`.
3. For any repository where the SHA does not match: retrieve and read the file to determine whether it is v2.0 content (SHA mismatch may indicate a benign subsequent edit, or it may indicate the write failed).
4. Confirm that the version line in each file reads `Version : 2.0`.
5. Confirm the estate-wide count: 7 repos updated + 2 excluded as source-of-truth + 4 excluded as out-of-scope/decommissioned = 13 total accounted for (or whatever the full Section 8 table count is).

**Required evidence:** Live GitHub Contents API GET for AGENT_MODEL.md in each of the 7 repos, returning current content SHA and file excerpt confirming `Version : 2.0`.

**Finding:** [PASS / PARTIAL / FAIL]

---

## Assumptions (about this Review Request)

1. The Evidence Package version that Codex challenges is the one at the commit SHA pinned in the Inputs table above. Any subsequent amendments to the Evidence Package after this Review Request was committed are out of scope.
2. Codex has independent read access to all begb0037admin repositories via the GitHub MCP tools.
3. Codex does not have access to the executing agent's session transcript at `/root/.claude/projects/-home-user/5cdf4b0d-db13-5236-8b76-3bc923faa760.jsonl`. All verification must proceed via live GitHub API calls.

---

## Risks

| Risk | Severity | Note |
|------|----------|------|
| Codex cannot access GitHub API | HIGH | Record all VT items as PARTIAL; do not mark PASS. Report the access failure explicitly. |
| Evidence Package was amended after this Review Request was committed | MEDIUM | Use the Evidence Package SHA pinned in the Inputs table; retrieve it at that SHA, not at HEAD. |
| Subsequent writes to target repos between execution and challenge | MEDIUM | If VT-07 content SHA differs from expected, do not assume the write failed — investigate the commit history to determine whether a subsequent write occurred post-execution. |
| ag-flexpoints may be inaccessible to Codex | LOW | Attempt GET; record 404 or access-denied explicitly; this feeds directly into VT-01 finding. |

---

## NEXT STAGE

**Target Agent:** Codex

**Stage:** 3 — Challenge

**Required Inputs for Codex:**

| Input | Path | Action |
|-------|------|--------|
| This Review Request | `begb0037admin/command-centre/governance/evidence/PHASE_1_REVIEW_REQUEST.md` | Read in full before beginning any verification |
| Evidence Package | `begb0037admin/command-centre/governance/evidence/PHASE_1_EVIDENCE_PACKAGE.md` | Treat as unverified claim set |
| Governance Workflow Standard | `begb0037admin/command-centre/governance/GOVERNANCE_WORKFLOW_STANDARD.md` | Reference for scope definitions and stage requirements |
| Challenge Report Template | `begb0037admin/command-centre/governance/templates/PHASE_CHALLENGE_REPORT_TEMPLATE.md` | Use as the structural template for output |
| Remediation Request Template | `begb0037admin/command-centre/governance/templates/PHASE_REMEDIATION_REQUEST_TEMPLATE.md` | Use if any finding is FAIL or PARTIAL |

**Required Outputs from Codex:**

| Output | Filename | Destination | Required when |
|--------|----------|-------------|---------------|
| Challenge Report | `PHASE_1_CHALLENGE_REPORT.md` | `begb0037admin/command-centre/governance/evidence/` | Always — every VT item must receive a finding |
| Remediation Request | `PHASE_1_REMEDIATION_REQUEST.md` | `begb0037admin/command-centre/governance/evidence/` | Required if any VT finding is FAIL or PARTIAL |

**Workflow Status:**

| Stage | Status |
|-------|--------|
| Stage 1 — Execute | ✅ Complete |
| Stage 2 — Evidence | ✅ Complete (this document + Evidence Package) |
| Stage 3 — Challenge | ⏳ Pending — Codex action required |
| Stage 4 — Remediation | 🔲 Conditional on Stage 3 findings |
| Stage 5 — Validation | 🔲 Conditional on Stage 4 |
| Stage 6 — Governance Decision | 🔲 Awaiting Kevin |

**Codex — your action:**
1. Read this Review Request in full.
2. Read the Evidence Package at the SHA pinned in the Inputs table above.
3. Execute VT-01 through VT-07 independently via live GitHub API calls.
4. Commit `PHASE_1_CHALLENGE_REPORT.md` to `begb0037admin/command-centre/governance/evidence/` on branch `main`.
5. If any finding is FAIL or PARTIAL: also commit `PHASE_1_REMEDIATION_REQUEST.md` to the same path, populated with each gap and proposed remediation action.
6. Record the commit SHA of the Challenge Report in the Challenge Report document itself.
7. Do not contact the executing agent. All output goes into committed documents.

**The executing agent (Claude Code) will read the committed Challenge Report and proceed to Stage 4 or Stage 6 based on the overall verdict.**
