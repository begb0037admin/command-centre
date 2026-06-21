# PHASE_1_EVIDENCE_PACKAGE.md
# Governance Phase 1 — Evidence Package

---

## Document Information

| Field | Value |
|-------|-------|
| Phase | Phase 1 — AGENT_MODEL.md v2.0 estate-wide propagation |
| Date | 2026-06-21 |
| Produced by | Claude Code (executing agent, session 5cdf4b0d-db13-5236-8b76-3bc923faa760) |
| Governed by | GOVERNANCE_WORKFLOW_STANDARD.md v1.0 (commit `6f6cd8ae31d17c0c3c251f4837724c4279578a4a`) |
| Template used | governance/templates/PHASE_EVIDENCE_PACKAGE_TEMPLATE.md |
| Status | Draft — awaiting challenge (Stage 3) |
| Commit SHA (this document) | `2d781348be9e8d1b76e619a8a1da79d9248f3ea0` |
| Content SHA (this document) | `46ae506b74ed28ba185a889a30a6940583ff0677` |

---

## Scope Reviewed

Phase 1 covers the propagation of AGENT_MODEL.md v2.0 to all repositories in the begb0037admin governance estate that were still carrying v1.0 or v1.1 at the start of the session.

**Phase objective:** Ensure every governed repository holds an identical, verified copy of AGENT_MODEL.md v2.0, making the single-agent Claude Code model the ratified operating model across the full estate.

**Source of truth for v2.0 content:** AGENT_MODEL.md as held in `begb0037admin/command-centre` and `begb0037admin/work-inbox` at the start of the session. Both copies were confirmed to hold SHA `5d5ff18872e803ad5ee8f50639fabed7abc56d06` — byte-for-byte identical — before any propagation write was made.

**Phase scope boundary:** AGENT_MODEL.md only. CONSTITUTION.md was read across all repos and confirmed unchanged (SHA `a25878b0d0833462ed08822f3920c0dbeaa5e6fc`); no writes to CONSTITUTION.md were made or required.

---

## Repositories Reviewed

| Repository | Pre-phase version | Action | Status |
|------------|------------------|--------|--------|
| begb0037admin/command-centre | v2.0 (source of truth) | Read only — source | No write needed |
| begb0037admin/work-inbox | v2.0 (source of truth) | Read only — confirmed identical | No write needed |
| begb0037admin/clockify | v1.0 | Updated to v2.0 | ✅ Written and verified |
| begb0037admin/hr-fa-knowledge-base | v1.0 | Updated to v2.0 | ✅ Written and verified |
| begb0037admin/hr-projects | v1.0 | Updated to v2.0 | ✅ Written and verified |
| begb0037admin/meeting-records | v1.1 | Updated to v2.0 | ✅ Written and verified |
| begb0037admin/hris-dashboard | v1.0 | Updated to v2.0 | ✅ Written and verified |
| begb0037admin/hris-launcher | v1.0 | Updated to v2.0 | ✅ Written and verified |
| begb0037admin/hris-change-requests | v1.0 | Updated to v2.0 | ✅ Written and verified |

**Repos with pre-existing v2.0 (excluded from write scope):** command-centre, work-inbox.  
**Repos written:** 7.  
**Repos verified by GET after write:** 7.

---

## Repositories Excluded

| Repository | Reason for exclusion |
|------------|----------------------|
| begb0037admin/desktop-tutorial | Decommissioned — listed in AGENT_MODEL.md Section 8 as "Deletion pending". No governance writes to decommissioned repos. |
| aimm | Personal domain (Hope). Out of scope for all work sessions per AGENT_MODEL.md Section 6. |
| personal-finance | Personal domain (Hope). Out of scope. |
| begb0037admin/ag-flexpoints | Not present in the MCP session scope list at session start. AGENT_MODEL.md status not checked and not updated. This is an outstanding item — see Outstanding Items section. |

---

## Architecture Evidence

### Write path used

All governance writes were performed via the MCP GitHub server `push_files` tool, which calls the GitHub Contents API (PUT `/repos/{owner}/{repo}/contents/{path}`). This is the sole write path described in AGENT_MODEL.md Section 4 and Section 7.

No direct git operations, no local clones, and no GitHub CLI `git push` were used. Every write was a single Contents API commit.

### Backup path used

Pre-write backups were created via the same `push_files` tool, writing to `Archive/AGENT_MODEL_backup_20260621.md` in each repository. Where Archive/ did not exist, it was created by the first file pushed to that path (GitHub creates directories implicitly on first file write).

### Verification path used

Post-write GET verification was performed via the MCP GitHub server `get_file_contents` tool, calling GET `/repos/{owner}/{repo}/contents/{path}`. The returned content SHA was compared against the expected SHA `05fc8adaab7e5b9524fe2c4f85ace667d7e04801` for each repo.

---

## Authentication Evidence

### Mechanism identified

Claude Code authenticates via the MCP GitHub server, which uses the `gh` CLI keyring. This is documented in AGENT_MODEL.md v2.0 Section 7:

> “Claude Code authenticates via the gh CLI (keyring; repo, workflow, gist, read:org scopes).”

### GITHUB_PAT environment variable diagnostic

During the pre-execution diagnostic sequence, the `GITHUB_PAT` environment variable was found to be absent (length: 0). Findings:

- The `GITHUB_PAT` env var is the authentication credential for locally-run scripts (`fetch_inbox.py`), not for Claude Code.
- Claude Code’s authentication is the MCP GitHub server / gh CLI keyring, independent of `GITHUB_PAT`.
- The absence of `GITHUB_PAT` is not a blocker for Claude Code governance writes.
- This finding is documented in HANDOVER.md (command-centre, commit `78744371965f1b00f014a59d24f2a446e7281e24`).

### Authentication verification evidence

Authentication was verified to be functioning by successful completion of multiple read operations across 9 repositories before the first write. The first successful write commit is the primary evidence of write authentication.

**Earliest write commit (abbreviated):** `7565ad8d` — clockify, `Archive/AGENT_MODEL_backup_20260621.md`  
**Claim:** This commit was made using MCP GitHub server authentication on 2026-06-21.  
**Challenger action required:** Retrieve full SHA from GitHub API; confirm commit exists and timestamp is consistent with 2026-06-21.

---

## Authorization Evidence

### Approval gate assessment

AGENT_MODEL.md v2.0 Section 2 defines five approval gates requiring Kevin’s explicit confirmation:

| Gate | Triggered? | Reason |
|------|-----------|--------|
| 1 — task tier changes in command-centre | NO | No writes to tasks.json or task tiers |
| 2 — destructive or hard-to-reverse operation | NO | All writes reversible; datestamped backups exist; prior commit SHA is the restore point |
| 3 — publishing beyond begb0037admin | NO | All writes within begb0037admin |
| 4 — amend CONSTITUTION.md | NO | CONSTITUTION.md was read only; zero writes |
| 5 — personal domain action from work session | NO | All repos are work domain |

**Claim:** No approval gate was triggered. Phase 1 propagation was within autonomous execution scope per AGENT_MODEL.md Section 2.

### Files written (claimed)

- `AGENT_MODEL.md` at root of each of the 7 target repos
- `Archive/AGENT_MODEL_backup_20260621.md` at root of each of the 7 target repos

No writes to `data/tasks.json`, `index.html`, or any data file during Phase 1.

---

## Baseline Capture Evidence

Before any write, the pre-phase state of AGENT_MODEL.md was read in each target repository.

| Repository | Pre-phase content SHA (abbreviated) | Version read |
|------------|--------------------------------------|-------------|
| clockify | `c226199d...` | v1.0 |
| hr-fa-knowledge-base | `c226199d...` | v1.0 |
| hr-projects | `c226199d...` | v1.0 |
| meeting-records | `f708523d...` | v1.1 (unique Section 9) |
| hris-dashboard | `3855713e...` | v1.0 |
| hris-launcher | `d15e4b7e...` | v1.0 |
| hris-change-requests | `69332c44...` | v1.0 |

**Note on meeting-records v1.1:** The pre-phase version contained a unique Section 9 (“Git Convention — commit direct to main”) not present in the canonical v2.0. This section is enforced by meeting-records CLAUDE.md (“Branch and Merge Protocol”); removal does not create a governance gap. Original content preserved in backup.

---

## Backup Evidence

A datestamped backup of the pre-write AGENT_MODEL.md was committed to `Archive/AGENT_MODEL_backup_20260621.md` in each repository before the governance write.

| Repository | Backup path | Backup commit SHA (abbrev.) | Backup content SHA (abbrev.) | GET verified (by executing agent) |
|------------|-------------|---------------------------|------------------------------|-----------------------------------|
| clockify | Archive/AGENT_MODEL_backup_20260621.md | `7565ad8d` | `c226199d...` | YES |
| hr-fa-knowledge-base | Archive/AGENT_MODEL_backup_20260621.md | `d40e3dd6` | `c226199d...` | YES |
| hr-projects | Archive/AGENT_MODEL_backup_20260621.md | `3689183e` | `c226199d...` | YES |
| meeting-records | Archive/AGENT_MODEL_backup_20260621.md | `8d9b048d` | `f708523d...` | YES |
| hris-dashboard | Archive/AGENT_MODEL_backup_20260621.md | `78ac3692` | `3855713e...` | YES |
| hris-launcher | Archive/AGENT_MODEL_backup_20260621.md | `f3f9eabe` | `d15e4b7e...` | YES |
| hris-change-requests | Archive/AGENT_MODEL_backup_20260621.md | `5b28fb7f` | `69332c44...` | YES |

**Challenger action required:** All SHAs are abbreviated. Challenger must retrieve full SHAs via live GET and compare against these values.

**Archive/ directory pre-phase status:**
- All 7 target repos: Archive/ did not exist pre-phase. Created implicitly by first backup commit (GitHub creates parent directories on first file write).
- meeting-records: contained `Meeting Archive/` at a different path; root `Archive/` was absent and was created by backup commit.
- command-centre: Archive/ existed with 15 files; no backup write needed (no write to command-centre AGENT_MODEL.md).

---

## Governance Write Evidence

The v2.0 content was written to `AGENT_MODEL.md` at the root of each repository.

| Repository | Write commit SHA (abbrev.) | Post-write content SHA (abbrev.) |
|------------|--------------------------|----------------------------------|
| clockify | `2b49c173` | `05fc8ada...` |
| hr-fa-knowledge-base | `7c5546f6` | `05fc8ada...` |
| hr-projects | `b948dd62` | `05fc8ada...` |
| meeting-records | `ea3a3e3f` | `05fc8ada...` |
| hris-dashboard | `60080061` | `05fc8ada...` |
| hris-launcher | `8b27436e` | `05fc8ada...` |
| hris-change-requests | `3fd7fb15` | `05fc8ada...` |

**Expected full content SHA (all repos):** `05fc8adaab7e5b9524fe2c4f85ace667d7e04801`

**Content SHA consistency claim:** Identical content SHA across all 7 repos indicates byte-for-byte identical v2.0 content. This SHA also matches the source-of-truth at command-centre and work-inbox.

**Challenger action required:** All write commit SHAs are abbreviated. Retrieve full SHAs from the GitHub API before treating any claim in this section as verified.

---

## Verification Evidence

After each write, the executing agent performed a GET to confirm the file was committed and the content SHA matched.

| Repository | GET performed (claimed) | Content SHA returned (claimed) | Matched expected (claimed) |
|------------|------------------------|-------------------------------|----------------------------|
| clockify | YES | `05fc8ada...` | YES |
| hr-fa-knowledge-base | YES | `05fc8ada...` | YES |
| hr-projects | YES | `05fc8ada...` | YES |
| meeting-records | YES | `05fc8ada...` | YES |
| hris-dashboard | YES | `05fc8ada...` | YES |
| hris-launcher | YES | `05fc8ada...` | YES |
| hris-change-requests | YES | `05fc8ada...` | YES |

**Important caveat:** These GET verifications were performed by the executing agent and recorded in session memory. The session transcript is local to the execution environment and not independently accessible. All claimed verifications in this table are assertions by the executing agent — not independently witnessed evidence. The challenger must re-run all GETs independently.

---

## HANDOVER Evidence

| Document | Repository | Commit SHA | Content summary |
|----------|-----------|------------|------------------|
| HANDOVER.md (Phase 1 record) | command-centre | `78744371965f1b00f014a59d24f2a446e7281e24` | Records all 7 backup and write commit SHAs; authentication diagnostic findings; ag-flexpoints outstanding item |
| HANDOVER.md (governance workflow record) | command-centre | `63fda3e983668eb085f0a984fc8b09a911c07dad` | Records governance workflow standard implementation; template locations; commit references |

HANDOVER.md update is required at session close by CONSTITUTION.md Section 5 and AGENT_MODEL.md Section 5.

---

## Exceptions

| ID | Description | Impact | Resolution |
|----|-------------|--------|------------|
| EX-01 | GITHUB_PAT environment variable absent | None — not Claude Code’s authentication mechanism | Non-blocker; documented in diagnostic and HANDOVER.md |
| EX-02 | ag-flexpoints not in MCP session scope | AGENT_MODEL.md status unknown | Outstanding item OI-01 |
| EX-03 | meeting-records was v1.1, not v1.0 | v1.1 contained unique Section 9 absent from canonical v2.0 | Section 9 redundant with CLAUDE.md; no governance gap; original preserved in backup |
| EX-04 | Archive/ absent in all 7 target repos pre-phase | No pre-existing Archive/ directory | Created implicitly by first backup commit; creation confirmed by successful commit |
| EX-05 | meeting-records Archive/ path ambiguity | Repo contained “Meeting Archive/” — MCP tool initially partial-matched | Correctly interpreted as absent root Archive/; root Archive/ created by backup commit |

---

## Claims Made

| ID | Claim | Type | Evidence cited |
|----|-------|------|----------------|
| C-01 | All 7 target repos updated to AGENT_MODEL.md v2.0 | Estate-wide completion | Write commit SHAs in Governance Write Evidence |
| C-02 | All 7 writes produced content SHA `05fc8adaab7e5b9524fe2c4f85ace667d7e04801` | Content integrity | GET verifications in Verification Evidence (agent-reported) |
| C-03 | Datestamped backups exist at Archive/AGENT_MODEL_backup_20260621.md in all 7 repos | Backup existence | Backup commit SHAs in Backup Evidence |
| C-04 | Each backup was committed before the corresponding governance write | Backup ordering | Commit timestamps — not captured as explicit comparison in this package |
| C-05 | No approval gate (AGENT_MODEL.md Section 2) was triggered | Authorization | Authorization Evidence table |
| C-06 | Authentication used: MCP GitHub server / gh CLI keyring (not GITHUB_PAT) | Authentication | Diagnostic finding; first write commit |
| C-07 | CONSTITUTION.md SHA `a25878b0d0833462ed08822f3920c0dbeaa5e6fc` unchanged across all repos | Constitution integrity | Session read — no API response captured |
| C-08 | command-centre and work-inbox AGENT_MODEL.md were byte-for-byte identical before propagation | Source-of-truth integrity | SHA `5d5ff18872e803ad5ee8f50639fabed7abc56d06` in both repos |
| C-09 | ag-flexpoints was not in scope; its AGENT_MODEL.md status is unknown | Scope boundary | Absence from MCP session scope list |

---

## Assumptions

1. The MCP GitHub server held valid write credentials for all begb0037admin repositories at execution time.
2. GitHub’s Contents API returned accurate SHAs in all PUT and GET responses — no caching artefact caused false positive verification.
3. The source-of-truth AGENT_MODEL.md in command-centre and work-inbox (SHA `5d5ff18...`) was the correct current v2.0 — not a draft or intermediate version.
4. meeting-records v1.1 Section 9 is genuinely redundant with the CLAUDE.md Branch and Merge Protocol; its removal creates no governance gap.
5. ag-flexpoints absence from MCP session scope does not constitute a Phase 1 completion gap, because the phase brief was to update repos identified as v1.0/v1.1 — and ag-flexpoints was unavailable for inspection.
6. No subsequent commits to any target repo’s AGENT_MODEL.md occurred between the write session and the production of this Evidence Package.

---

## Risks

| ID | Risk | Severity | Status |
|----|------|----------|--------|
| R-01 | ag-flexpoints AGENT_MODEL.md may be at v1.0 or v1.1 | MEDIUM | Flagged as OI-01; must be investigated in next governance session |
| R-02 | Backup commit SHAs in this package are 8-character abbreviations; full SHAs must be retrieved from GitHub API | LOW | Challenger action required |
| R-03 | Verification GETs were performed by the executing agent only — not independently witnessed | MEDIUM | Challenger must re-run all GETs independently |
| R-04 | Session transcript is local to execution environment; not independently accessible | MEDIUM | Challenger must verify via live GitHub API only |
| R-05 | CONSTITUTION.md verification was read-only in session; no API response captured as evidence | LOW | Challenger must independently GET CONSTITUTION.md in each repo and compare SHA |

---

## Outstanding Items

| ID | Description | Owner | Action required |
|----|-------------|-------|------------------|
| OI-01 | ag-flexpoints AGENT_MODEL.md status unknown | Claude Code | Next governance session: add ag-flexpoints to MCP scope; read AGENT_MODEL.md; if not v2.0, apply Phase 1 process (backup, write, verify) |
| OI-02 | CONSTITUTION.md v1.0 Section 9 gate criteria all met — may warrant a version history note | Kevin | Optional: assess whether a history note is warranted in CONSTITUTION.md |
| OI-03 | Backup commit SHAs in this package are abbreviated | Claude Code | Full SHAs must be confirmed by challenger via live GET before this package is considered complete evidence |

---

## Evidence Summary

| Category | Claim | Evidence quality | Independently verifiable by Codex |
|----------|-------|-----------------|------------------------------------|
| Repository scope | 7 repos updated; 2 as source-of-truth; 4 excluded (decommissioned/personal/out-of-scope) | MEDIUM — ag-flexpoints not inspected | PARTIAL |
| Authentication | MCP GitHub server / gh CLI keyring; GITHUB_PAT absent but non-blocking | MEDIUM — mechanism identified by diagnostic, not captured API auth header | YES — via commit author on earliest write commit |
| Authorization | No approval gate triggered; writes to governance files only | HIGH | YES — inspect file list in each write commit |
| Backup existence | 7 backups committed to Archive/ | HIGH — commit SHAs recorded | YES — live GET |
| Backup ordering | Each backup committed before write | MEDIUM — not captured as explicit timestamp comparison | YES — compare commit timestamps |
| Content integrity | All 7 writes at SHA `05fc8ada...` | HIGH — consistent across all repos (agent-reported) | YES — live GET |
| Rollback viability | Rollback = restore from Archive/ backup at recorded SHA | MEDIUM — not tested | PARTIAL — confirm backup decodeable |
| Constitution integrity | SHA `a25878b0` unchanged | LOW — session assertion; no API response captured | YES — live GET |
| HANDOVER | HANDOVER.md updated at session close | HIGH — commit SHA recorded | YES — live GET |
