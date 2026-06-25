# CLOUDFLARE_PHASE_SPLIT_MIGRATE — Remediated Plan

**Phase:** CLOUDFLARE_PHASE_SPLIT_MIGRATE  
**Status:** Stage 4 — Remediation (addresses R1–R10 from Codex Remediation Request)  
**Date:** 2026-06-25  
**Produced by:** Claude Code (Executing Agent — Seats A/C)  
**Governed by:** CONSTITUTION.md v1.0, AGENT_MODEL.md v2.0, GOVERNANCE_WORKFLOW_STANDARD.md v1.1  

---

## Note on governance workflow (R2)

This plan was subject to an additive pre-execution plan challenge before Stage 1 begins. This is not formal Stage 3 under GOVERNANCE_WORKFLOW_STANDARD.md. It is an extra governance gate applied before any implementation write, aligned with CONSTITUTION.md Section 4 (Rollback Before Change).

The full six-stage GOVERNANCE_WORKFLOW_STANDARD.md workflow still runs in full after Stage 1 execution:
- Stage 1 — Execute
- Stage 2 — Evidence Package
- Stage 3 — Review Request + Codex Challenge Report
- Stage 4 — Remediation (if gaps found)
- Stage 5 — Validation (if gaps found)
- Stage 6 — Governance Decision (Kevin)

No stage is skipped. This pre-execution review is additive only.

---

## Objective

Break the single 65KB `index.html` in command-centre into governed, individually-editable files. Migrate hosting from GitHub Pages to Cloudflare Pages. Repeat for work-inbox once command-centre is proven stable. Eliminate the structural root cause of recurring dashboard breakage caused by AI token limits on single-file edits.

---

## Phase 0 — Pre-work: governance baseline, restore points, and CLAUDE.md update

### 0.1 — Governance review
1. Read `AGENT_MODEL.md` in command-centre.
2. Read `CONSTITUTION.md` in command-centre.
3. Confirm all approval gates that apply to this phase.
4. Confirm working surface is GitHub-only.

### 0.2 — Restore point capture (R3)

Before any file is changed, capture and record the following baselines:

| Baseline | What to capture |
|---|---|
| `index.html` | Current commit SHA, content SHA, confirm Archive backup created with timestamp |
| `data/tasks.json` | Current commit SHA, content SHA, confirm Archive backup created with timestamp |
| Repo state | Current HEAD commit SHA of command-centre main |
| GitHub Pages settings | Source branch, source directory, custom domain if any, HTTPS enforced state |
| `cc-tasks-writer` CORS | Current allowed origins list — record verbatim before any change |
| `github-proxy` | Confirm read endpoint behaviour — smoke test a known file read |
| Bookmarks / links | Record any known bookmark or shared link to `begb0037admin.github.io/command-centre/` |

All baselines must be recorded in the Remediation Evidence document before Phase 1 begins. If any baseline cannot be captured, stop and report to Kevin.

This constitutes the **golden restore point** for the entire phase. In the event of any failure at any stage, restore to this point before attempting any fix.

### 0.3 — CLAUDE.md architecture update (R1)

The current command-centre CLAUDE.md hard rule states: *"Single `index.html` — no framework, no build step."*

The file split intentionally replaces the single-file architecture. This conflict must be resolved before any file is split. The resolution is a governed CLAUDE.md update:

1. Kevin approves the new architecture (file split + Cloudflare Pages) — explicit confirmation required.
2. Claude Code updates command-centre CLAUDE.md:
   - Architecture section updated to reflect `index.html` (shell) + `css/styles.css` + `js/app.js` + `js/api.js`
   - Hard rule updated from "Single `index.html`" to "No framework, no build step — static files only"
   - Hosting section updated to reflect Cloudflare Pages (replacing GitHub Pages)
3. Commit the CLAUDE.md update to main.
4. GET-verify the commit before proceeding.

**This is the first write of the phase. It requires Kevin approval (Approval Gate 0.3).**

### 0.4 — Freeze

No other changes to command-centre during the migration. Tasks.json writes via cc-tasks-writer continue as normal — the Worker is untouched until Phase 3.

---

## Approval gates summary (R4)

Kevin's explicit confirmation is required at each gate below before the associated action proceeds.

| Gate | Point | Action requiring approval |
|---|---|---|
| 0.3 | Phase 0 | CLAUDE.md architecture update — approve new file structure and hard rule change |
| 1.0 | Phase 1 | Approve final file split structure before any file is written |
| 2.0 | Phase 2 | Sign off all functional-equivalence checks (full list — see Phase 2) |
| 2.1 | Phase 2 | Any live test write that creates a task or changes a task tier |
| 3.0 | Phase 3 | Cloudflare Pages repo connection and GitHub app authorization |
| 3.1 | Phase 3 | Cloudflare build/deployment settings |
| 3.2 | Phase 3 | `cc-tasks-writer` CORS update to add Cloudflare Pages origin |
| 3.3 | Phase 3 | Production cutover — confirm all checks pass on Pages URL |
| 3.4 | Phase 3 | Custom domain or bookmark update (if applicable) |
| 3.5 | Phase 3 | Disabling GitHub Pages |
| 3.6 | Phase 3 | Any repo visibility change (public → private or vice versa) |

---

## Phase 1 — File split (GitHub Pages, no hosting change yet)

### 1.1 — Target file structure

```
command-centre/
├── index.html          ← shell only: <head>, layout divs, <script src> and <link> tags
├── css/
│   └── styles.css      ← all styles extracted from index.html
├── js/
│   ├── app.js          ← UI logic: task rendering, tier management, drag/drop, done state,
│   │                      suggestions panel, sidebar, openmail links, quick links
│   └── api.js          ← all GitHub API calls: tasks.json read/write via cc-tasks-writer,
│                          github-proxy reads, inbox_suggestions.json reads
├── data/
│   └── tasks.json      ← unchanged
└── Archive/            ← unchanged
```

### 1.2 — Rules
- Pure extraction — no logic changes, identical behaviour
- No inline `<script>` or `<style>` blocks remain in index.html after split
- Load order in index.html: `styles.css` → `api.js` → `app.js` (api.js must be available before app.js initialises)
- All files served with correct MIME types by GitHub Pages (no `.htaccess` needed — GitHub Pages serves `.js` as `application/javascript` and `.css` as `text/css` by default)
- Kevin approves the split structure at Gate 1.0 before any file is written

### 1.3 — DR — Phase 1 rollback

If the split breaks the dashboard:
1. Restore `index.html` from the Phase 0 golden Archive backup (single PUT to Contents API)
2. Delete `css/` and `js/` directories
3. Verify dashboard loads from GitHub Pages URL
4. Do not proceed to Phase 2 until root cause is identified

---

## Phase 2 — Functional equivalence verification on GitHub Pages

All checks must pass before Phase 3 begins. Kevin signs off at Gate 2.0.

### 2.1 — Asset and load checks
- [ ] Dashboard loads from `begb0037admin.github.io/command-centre/` with no console errors
- [ ] `styles.css` loads with HTTP 200, MIME type `text/css`
- [ ] `app.js` loads with HTTP 200, MIME type `application/javascript`
- [ ] `api.js` loads with HTTP 200, MIME type `application/javascript`
- [ ] No 404 errors for any asset
- [ ] Visual screenshot — Kevin approves appearance matches pre-split state

### 2.2 — Data load
- [ ] Tasks load from `data/tasks.json` (cache-busted)
- [ ] Correct number of tasks and tiers displayed
- [ ] Stale banner / last-updated timestamp correct

### 2.3 — Task operations (Gate 2.1 required for any write that creates or moves tasks)
- [ ] Quick add — new task created, persisted to tasks.json via cc-tasks-writer
- [ ] Move task by button — tier change persisted
- [ ] Move task by drag/drop — tier change persisted
- [ ] Rename task — persisted
- [ ] Delete task — persisted
- [ ] Notes save — persisted

### 2.4 — Done state
- [ ] Done toggle — task marked done, state persisted to tasks.json
- [ ] Show/hide done — localStorage state persists across page reload

### 2.5 — Suggestions panel
- [ ] Suggestions load from work-inbox `data/inbox_suggestions.json` via github-proxy
- [ ] Suggestion promoted to task — appears in correct tier, persisted to tasks.json
- [ ] Suggestion dismissed — dismissal persists in localStorage across reload

### 2.6 — Navigation and UI
- [ ] Openmail links open correct email in Outlook (or confirm protocol handler behaviour)
- [ ] Custom quick links navigate correctly
- [ ] Sidebar resize works and persists
- [ ] Action counts and stale banners display correctly

### 2.7 — Reads and fallbacks
- [ ] `github-proxy` reads (tasks.json, inbox_suggestions.json) confirmed working
- [ ] Raw GitHub fallback read confirmed working
- [ ] Cache-busted reads return current data

### 2.8 — Worker writes
- [ ] Worker write round trip: add task → read back → confirm SHA matches

### DR — Phase 2 failure

If any check fails: stop, do not proceed to Phase 3. Identify root cause. If unfixable within the split architecture, restore from Phase 0 golden backup.

---

## Phase 3 — Cloudflare Pages migration

### 3.1 — Cloudflare Pages setup (Gate 3.0 + Gate 3.1)
1. Kevin connects `begb0037admin/command-centre` repo to Cloudflare Pages in Kevin's Cloudflare account (Gate 3.0 — repo connection and GitHub app authorization)
2. Build config: no build command, output directory `/`, no environment variables required (Gate 3.1 — build/deployment settings)
3. Cloudflare Pages assigns a `*.pages.dev` URL — note it for testing

### 3.2 — Dual-origin baseline (before any CORS change)

While both GitHub Pages and Cloudflare Pages are live simultaneously:
- GitHub Pages URL remains production — no users affected
- `*.pages.dev` URL is test-only at this point
- `cc-tasks-writer` CORS currently allows GitHub Pages origin only — do NOT change yet
- Test all read operations from `*.pages.dev` URL:
  - [ ] Dashboard loads
  - [ ] `github-proxy` reads work (no origin restriction expected)
  - [ ] Smoke test: fetch a known file via `github-proxy` from the Pages URL
  - [ ] `data/tasks.json` loads
  - [ ] `data/inbox_suggestions.json` loads
- Worker writes from `*.pages.dev` will fail CORS at this point — expected and acceptable

### 3.3 — CORS update (Gate 3.2)

Kevin approves at Gate 3.2 before this step.

1. Record current `cc-tasks-writer` CORS allowed origins verbatim (golden restore point for CORS)
2. Add Cloudflare Pages origin to `cc-tasks-writer` allowed origins
3. Verify Worker write round trip from `*.pages.dev`:
   - [ ] Add task → read back → SHA matches
   - [ ] Tier move → read back → confirmed
4. Confirm GitHub Pages origin still works (dual-origin active)

### 3.4 — Full verification on Cloudflare Pages URL

Run all Phase 2 checks (2.1–2.8) against the `*.pages.dev` URL. All must pass.

Additional Cloudflare-specific checks:
- [ ] Cloudflare Pages automatic deployment rollback confirmed available in Pages dashboard
- [ ] Cache-busted reads return current data from Pages URL
- [ ] Raw Work Inbox suggestion reads work from Pages URL
- [ ] If custom domain used: DNS resolves, TLS certificate issued and valid

### 3.5 — Production cutover (Gate 3.3)

Kevin signs off at Gate 3.3 — all checks pass, approve cutover.

1. Update any internal links in command-centre that hardcode `begb0037admin.github.io/command-centre/` to use new URL
2. Confirm work-inbox links to command-centre — update if needed (see Work Inbox Sequencing section)
3. Update bookmarks and shared links (Gate 3.4)
4. Disable GitHub Pages (Gate 3.5) — do not disable until all links and Workers confirmed updated

### DR — Phase 3 rollback

| Scenario | Recovery |
|---|---|
| Cloudflare Pages deploy fails | GitHub Pages still live — no user impact. Debug Pages config. |
| CORS wrong after cc-tasks-writer update | Revert CORS to recorded golden baseline — < 2 minutes |
| Cloudflare GitHub app authorization fails | Re-authorize in GitHub → Settings → Applications; or disconnect and reconnect in Pages |
| Custom domain DNS/TLS fails | Remove custom domain from Pages, revert DNS records; GitHub Pages still live |
| Full rollback | Re-enable GitHub Pages (single toggle), revert cc-tasks-writer CORS, revert any link changes |

---

## Work Inbox sequencing (R7)

work-inbox and command-centre share infrastructure. The following dependencies must be managed before GitHub Pages is disabled for command-centre.

| Dependency | Required action before cutover |
|---|---|
| `cc-tasks-writer` — shared Worker | CORS update must add both command-centre Pages URL and (when work-inbox migrates) work-inbox Pages URL. During transition, both GitHub Pages and Pages URLs must be in the allowed origins list. |
| `fetch_inbox.py` Phase 3.6 — writes to command-centre `data/tasks.json` | No change needed — writes via GitHub Contents API, not tied to hosting URL |
| Work Inbox tick sync to `data/ticks.json` | Uses cc-tasks-writer — covered by CORS update above |
| Hardcoded link in work-inbox to `https://begb0037admin.github.io/command-centre/` | Must be updated in work-inbox `index.html` before or at command-centre cutover |
| Hardcoded links in command-centre to work-inbox GitHub Pages URL | Must be updated in command-centre `js/app.js` if work-inbox migrates later |
| Sequencing rule | Disable command-centre GitHub Pages only after work-inbox cross-link is updated. Do not disable work-inbox GitHub Pages until command-centre cross-link is updated. |

work-inbox migration follows the identical phase structure once command-centre Phase 3 is confirmed stable.

---

## Repository visibility decision (R8)

Current state: both command-centre and work-inbox are public. The original reason for public visibility was GitHub Pages hosting requirement on the current GitHub plan.

Cloudflare Pages supports both public and private repositories. Once GitHub Pages is disabled, the forcing function for public visibility is removed.

**Decision required from Kevin before Phase 3 step 3.5 (disabling GitHub Pages):**

- Keep repositories public (no change — simpler, no access management needed)
- Make repositories private (additional data protection, requires Cloudflare Pages GitHub app re-authorization for private repo access)

Whichever decision is made must be recorded in each repo's CLAUDE.md (AGENT_MODEL.md Section 7 requirement).

**Default: keep public unless Kevin instructs otherwise.** This decision is Gate 3.6.

---

## Expanded DR table (R9)

| Scenario | Recovery action | Time to restore |
|---|---|---|
| Bad file split breaks dashboard | Restore index.html from Phase 0 golden backup | < 5 minutes |
| CSS/JS asset 404 or MIME error | Fix path in index.html shell or rename file; roll back to monolith if unfixable | < 10 minutes |
| Load-order failure (app.js runs before api.js ready) | Fix script order in index.html; roll back to monolith if unfixable | < 10 minutes |
| Cloudflare Pages deploy fails | GitHub Pages still live — no user impact; debug Pages config | Immediate |
| Cloudflare GitHub app authorization fails | Re-authorize in GitHub Settings; GitHub Pages still live | < 5 minutes |
| Pages automatic deployment broken | Use manual deploy in Cloudflare dashboard; or roll back via Pages deployment history | < 5 minutes |
| cc-tasks-writer CORS wrong | Revert CORS setting to golden baseline | < 2 minutes |
| github-proxy read failure | Smoke test from another origin to isolate; Worker is estate-wide, not origin-locked | < 5 minutes |
| Stale cache / proxy read | Cache-bust all reads with `?t=<timestamp>`; force Pages cache purge in Cloudflare dashboard | < 5 minutes |
| Custom domain DNS/TLS failure | Remove custom domain from Pages; revert DNS; GitHub Pages still live | < 15 minutes |
| Dual-origin CORS conflict during transition | Both origins must be in cc-tasks-writer allowlist simultaneously; confirm before cutover | < 2 minutes |
| Concurrent tasks.json write from fetch_inbox.py | Contents API 409 conflict — fetch_inbox.py retries on 409; no data loss | Automatic |
| Work Inbox cross-link breakage after command-centre cutover | Update work-inbox index.html link to new URL; push to main | < 10 minutes |
| tasks.json corrupted during migration | Restore from Archive/ backup | < 5 minutes |
| CLAUDE.md update wrong | Restore from git history; re-commit correct version | < 5 minutes |
| HANDOVER.md not updated at session close | Retrieve from git history; re-commit correct state | < 5 minutes |
| Full rollback — any stage | Re-enable GitHub Pages, revert cc-tasks-writer CORS, restore index.html from golden backup | < 10 minutes |

---

## Session closeout gate (R10)

At the close of every session in this phase, the executing agent must:

1. Update `HANDOVER.md` in command-centre with:
   - Current phase and stage reached
   - All decisions made this session
   - Full artefact chain with repository paths and commit SHAs
   - Open risks and unresolved items
   - Current golden restore point (index.html SHA, tasks.json SHA, repo HEAD SHA)
   - Next action
2. Commit the HANDOVER.md update to main before closing
3. GET-verify the commit

Codex must not update HANDOVER.md unless explicitly authorised by Kevin (GOVERNANCE_WORKFLOW_STANDARD.md Section 9).

---

## Governance workflow after execution

Once Stage 1 execution begins, the full GOVERNANCE_WORKFLOW_STANDARD.md six-stage process applies:

1. Stage 1 — Execute (implementation under this plan)
2. Stage 2 — Evidence Package produced by Claude Code, committed to `governance/evidence/`
3. Stage 3 — Review Request to Codex; Codex Challenge Report
4. Stage 4 — Remediation if gaps found
5. Stage 5 — Validation if gaps found
6. Stage 6 — Governance Decision by Kevin

No stage is skipped. The Governance Decision (Kevin APPROVED) closes the phase.

---

*Produced by Claude Code — Executing Agent (Seats A/C)*  
*Phase: CLOUDFLARE_PHASE_SPLIT_MIGRATE — Stage 4 Remediation*  
*Date: 2026-06-25*
