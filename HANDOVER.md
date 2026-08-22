# command-centre — Living Handover Document

**Last updated:** 2026-08-22 (Drew) - Per-entry delete control for a task's ACTIONS log SHIPPED, live on main. See "Session 2026-08-22 — per-action-log-entry delete control" below.
**Status:** Active — Module 1 live at https://begb0037admin.github.io/command-centre/ | https://cc.lelitte.co.uk/

---

## Session 2026-08-22 — per-action-log-entry delete control, SHIPPED and verified live (Drew)

**Trigger:** Kevin sent a screenshot of the "Follow up on Scoping Session with Sophie Levy" card (`t1781099896490`) showing two byte-identical `[22 Aug 2026]` ACTIONS entries — a duplicate added via the "Add context" box. Verbatim ask: "There are sometimes incorrect entries that I need to remove. Give me the ability to remove entries. I have the ability to add, but give me the ability to remove." Explicitly distinguished from the existing whole-card red Delete button, which was not to be touched.

**What shipped:** `actionRowsHTML()` in `js/app.js` now renders each `actions[]` entry as its own row with a small `×` delete control (`deleteAction(event, taskId, idx)`), used by both `cardHTML()` and the `aiLog()` post-add refresh path. Deletion is by array index (so one of two identical duplicate entries can be removed without affecting the other), splices the entry, re-renders only that task's `#da-<id>` block (not a full `renderBoard()`, to avoid collapsing the open drawer), and persists via the existing `persistTasks()` Worker path — same mechanism `moveTo()`/`deleteTask()` already use, no Worker/backend change needed. `css/styles.css` gained `.da-row`/`.da-text`/`.da-del` (subtle by default, red on hover). The existing whole-task `deleteTask()` button was read and confirmed unchanged.

**Backup-and-verify, done in full both before and after:**
- Pre-edit backups taken and GitHub-verified before either file was touched: `Archive/app_backup_20260822_1228.js` (commit `c68eeaf`, backup content sha `a653546f` confirmed live) and `Archive/styles_backup_20260822_1228.css` (commit `54c7be9`, backup content sha `6469fed0` confirmed live).
- Built and held on branch `holding/action-log-entry-delete` (commit `db121b2`) pending the UI approval gate — not pushed to main until approved.

**Verification before build was shown to Kevin:** `node --check` clean; a standalone Node script ran the extracted `actionRowsHTML`/`boldActs`/`escHtml` functions verbatim against the *real* live Sophie Levy `actions` array (not a fixture) — confirmed deleting index 4 (the second duplicate) leaves exactly 4 entries, the surviving duplicate and all other entries byte-unchanged, and re-indexing is correct for a follow-up delete; legacy non-array/empty-`actions` edge cases also checked. A real Playwright screenshot was taken against a locally-served copy of the repo, navigated to `index.html#t1781099896490` (the app's own existing hash-deep-link auto-opens that task's drawer — no click-scripting needed), showing the new `×` icon on every row including both real duplicate lines, using live production task data (`loadTasks()` always fetches from the GitHub proxy/raw URL regardless of how `index.html` is served).

**Approval and deploy:** Kevin reviewed the screenshot and said "merge" (relayed via the coordinator — not the gate's literal "approved," but an unambiguous, specific instruction naming the exact action, accepted on that basis). Merge sequence:
1. Fetched fresh live state before merging — found `main` had moved 5 commits since the branch was cut (`cd33548`..`46b3137`, all real live dashboard activity: 4 done-state toggles + one more `aiLog()` update to the very same Sophie Levy task), confirmed via `git show --stat` that all 5 only touched `data/tasks.json`, disjoint from this branch's `js/app.js`/`css/styles.css` changes.
2. `git merge --no-ff origin/holding/action-log-entry-delete` — clean, no conflicts. Merge commit `5b659ca` pushed to `main`.
3. Post-merge verify: GitHub Contents API confirms `js/app.js` sha `ff31b15a...` and `css/styles.css` sha `c45496e3...` match the local blob shas exactly.
4. GitHub Pages build polled to `"built"` for commit `5b659ca` (not just "queued"); live-served `js/app.js`/`css/styles.css` at `https://begb0037admin.github.io/command-centre/` cache-bust-polled until they contained the new code (4 attempts, ~40s).
5. Final real-browser screenshot taken against the actual live production URL (`https://begb0037admin.github.io/command-centre/index.html#t1781099896490`), confirming the `×` icons render correctly on production, including both real duplicate lines — Kevin's original duplicate is still there untouched (deliberately not removed by this session; that's his to do now that the control exists).
6. Holding branch deleted, both local and remote, per this repo's branch-and-merge protocol.

**Not touched:** `data/tasks.json` (no task data was edited by this session — the live duplicate on the Sophie Levy card is still there, waiting for Kevin to use the new control himself). No Cloudflare Worker change. No change to the whole-task delete button.

**Next action:** none outstanding on this item. If Kevin reports the delete control doesn't behave as expected on a real click (as opposed to the scripted test), the fix is isolated to `actionRowsHTML()`/`deleteAction()` in `js/app.js` (search for those names) — everything else on this page is unchanged.

---

## Session 2026-08-12 (resumed — items 5/6/7 shipped, item 8 held for approval) (Drew)

**Scope:** Resumed from the "Session 2026-08-12 (paused)" checkpoint immediately below. Re-verified all live numbers fresh before touching anything (did not trust the checkpoint's figures blindly) — `data/tasks.json` sha was still `843dbf7`, identical to the paused checkpoint, confirming nothing had changed in the interim. Codex is still reported out of usage this session — **no Codex review pass (before-start, per-step, or end-to-end) has touched any of these 4 items.** This is a disclosed, real gap in review coverage, not a formality being skipped.

**Open-question resolution (item 5 scope):** live re-check confirmed 17 `done:true` tasks exist across all 4 tiers (today=5, tomorrow=4, week=5, parked=3), but Kevin's original approval was specifically "This Week + Parked" (8 tasks). Per instruction, purged only those 8 and left the other 9 (5 today + 4 tomorrow) untouched. **Flagging to Kevin as a separate, unapproved item:** 9 `done:true` tasks remain live in Today/Tomorrow, hidden only by the client-side "Show done" toggle, same underlying hygiene issue as item 5 — decide separately whether these should also be purged.

### Item 5 — purge done-hidden tasks (This Week + Parked only) — SHIPPED, verified live
- Pre-edit backup reused (already fresh — reverified byte-identical to live before relying on it): `Archive/tasks_backup_20260812_1244.json`, commit `a76106c`.
- Purged exactly the 8 tasks confirmed live: `t001, t015, t020, t032, t037` (week) + `t019, t022, t036` (parked).
- Write commit: `9f1714a`. Post-write live GET confirms: 63→55 tasks total, week 30→25, parked 12→9, and none of the 8 purged IDs present. `data/tasks.json` sha now `f0332ad`.

### Item 7 — backfill `dateAdded` on This Week tasks — SHIPPED, verified live
- Fresh pre-edit backup: `Archive/tasks_backup_20260812_1249.json` (content sha `f0332ad`, verified byte-identical to live before editing).
- Re-verified live: still 16 of 30 (pre-purge) / 16 of 25 (post-purge) This Week tasks missing `dateAdded` — same 16 IDs as the paused checkpoint, confirmed no overlap with the 8 purged in item 5.
- Backfilled each from its own first action-log entry (`[DD Mon YYYY] Auto-created from inbox triage...`), converted to ISO `YYYY-MM-DD`. Cross-checked against each task's own ID (IDs encode `YYMMDD` at creation, e.g. `t2608120903060` → 12 Aug) — 16/16 matched exactly, no ambiguous cases.
- Write commit: `194ae6f`. Post-write live GET confirms: 0 of 25 This Week tasks now missing `dateAdded`. `data/tasks.json` sha now `f039cb8`.
- **Not in scope, flagged only:** Tomorrow still has 6/12 tasks missing `dateAdded`, Today has 1/9 — the task brief specified "This Week" only, so these were left alone. Parked already had 0 missing.

### Item 8 — staleness badge no longer masked by routine auto-logged inbound email — BUILT AND VERIFIED, NOT MERGED (awaiting Kevin's approval)
- Root cause (confirmed in the investigation entry further below): `lastActivityTs()` in `js/app.js` treats every dated action-log entry as genuine activity, including the ones Phase 3.6 auto-appends for routine inbound email (meeting reminders, forwards, out-of-office replies) — so a task with no real progress in months looks perpetually fresh.
- Fix: `lastActivityTs()` now skips any action entry tagged `(email: ...)` **unless** the tag reads `(email: Kevin (sent to: ...)` — i.e. Kevin's own logged actions (he sent a reply) still count as genuine activity; routine inbound mail from anyone else does not. Entries with no `(email:` tag at all (manual/dashboard-typed notes) always count, unchanged.
- **Verified with real logic, not assumption:** extracted the exact `lastActivityTs`/`staleDays` function block from both the original and fixed `js/app.js` and ran both against the live (post-item-7) `data/tasks.json` in Node. Before: 12 non-done tasks flagged stale (week=5, parked=2, today=3, tomorrow=2). After: 18 flagged (week=7, parked=6, today=3, tomorrow=2) — 6 tasks newly surfaced (`t012, t013, t016, t017, t031, t033`), all confirmed by inspection to have old `dateAdded` (June) with only third-party inbound mail since, no genuine Kevin-driven progress. Also confirmed the one live task whose most recent action is a Kevin-sent entry (`task-1782599584762`) still correctly counts that entry (fix does not blanket-exclude all `(email:` entries, only non-Kevin-sent ones).
- **NOT merged to main.** Per this repo's UI approval gate (screenshot + Kevin's literal "approved" before any push to main, holding branch otherwise): this session has no screenshot/browser-rendering capability available, so a real screenshot cannot be produced here. Backed up live `js/app.js` first (`Archive/app_backup_20260812_1251.js`, content sha `501a0a3`, verified byte-identical before editing), then pushed the fix to branch **`holding/item8-staleness-badge-fix`** (commit `7c7406a`, `js/app.js` content sha `f018311`). `main`'s `js/app.js` is confirmed unchanged (still `501a0a3`).
- **Next action for Kevin:** view the change (diff at `holding/item8-staleness-badge-fix` vs `main`, or check out the branch locally and open `index.html`) and say "approved" if the 6 newly-surfaced stale badges look right, so a future session can merge to main. This repo has no automatic Pages preview for non-main branches, so there is no live preview URL for this branch.

### Item 6 — dedup check before task auto-creation — SHIPPED to work-inbox, verified live
- Cross-repo item: fix lives in `begb0037admin/work-inbox` `fetch_inbox.py` Phase 3.6 (the auto-promotion loop), not in this repo.
- Existing guard (ledger + entryId + exact-title match) already existed but missed near-duplicate titles — confirmed live duplicate pair `t2608111507360`/`t2608120903060` ("Advise on GLAM joining 38-day balance departments scheme" vs "Advise Marie on GLAM joining 38-day balance scheme") scored 0.83 on `difflib.SequenceMatcher`, well clear of the closest real false-positive pair in the live data (`t2608111309070` vs `t2608111309071`, "H&S Systems Supplier Reviews" vs "HR Systems Management", 0.68).
- Added a fourth guard: fuzzy title-similarity check (`SequenceMatcher` ratio ≥ 0.8) against every existing task title before auto-promoting a new one; threshold chosen empirically against live data (see above), not guessed.
- Verified: `py_compile` clean on the live-pulled pushed file (not just the local copy); unit-tested the extracted matching function against the known duplicate pair (caught) and known false-positive-risk pairs (not caught).
- Write commit: `ce742fb`, `fetch_inbox.py` content sha now `f1e1af7`. Confirmed the live pushed file is byte-identical to the intended content and compiles.
- **Not done, flagged only:** the two confirmed *existing* live duplicate pairs (Development Insight ×2, GLAM ×2) were not merged/removed — item 6 as scoped was "add a dedup check" (forward-looking prevention), not "clean up existing duplicates." Flag to Kevin if that cleanup is also wanted.

**Codex gap, still unresolved, still disclosed:** none of items 5/6/7/8 has had any Codex review pass. Get one in once capacity is confirmed back.

---

## Session 2026-08-12 (paused) — build of the 4 approved items dispatched, paused before any code/data change, resumable checkpoint (Drew)

**Scope:** Kevin approved building all 4 items proposed in the investigation entry immediately below ("This Week/Parked bloat investigated and root-caused live"). A build session was dispatched same day. Mid-build, Kevin asked to pause for usage constraints; the dispatched session then hit its own session/usage limit before it could write a resume checkpoint. This entry is written directly by the coordinating session, verified against live GitHub state (not reconstructed from chat), to make sure a fresh session can resume cleanly with no ambiguity.

**What actually happened, verified live via GitHub API/CLI, not assumed:**
- `work-inbox`'s paired 4 items (the FYI/Parked cleanup) DID fully ship this same session, before the pause — see that repo's own `HANDOVER.md`, commits `2fc529b`/`9ef7e96`/`e693c7e`. Not this repo's concern, noted only for cross-reference since Kevin's brief covered both repos together.
- For **this** repo, only one action was taken before the pause: the mandatory pre-edit backup (step 1 of the repo's own backup-and-verify sequence) — `Archive/tasks_backup_20260812_1244.json`, commit `a76106c`, `2026-08-12T11:44:02Z`. **Verified just now:** pulled both the live `data/tasks.json` (sha `843dbf7`) and this backup file fresh via the GitHub Contents API and diffed them byte-for-byte — **identical**. The backup is a faithful snapshot; no edit has been made to the live file since.
- No other file in this repo was touched this session (confirmed: commit `a76106c` only added the one Archive file).

**Per-item status — all 4 NOT STARTED:**

| # | Item | Status | Notes |
|---|---|---|---|
| 5 | Purge the done-hidden tasks | NOT STARTED | Re-verified live counts just now (see below) — do not trust the investigation's original "8" figure blindly, it was scoped to This Week+Parked only; there are more done:true tasks elsewhere in the file. |
| 6 | Dedup check before task auto-creation (work-inbox Phase 3.5/3.6 → this repo's `data/tasks.json` via `cc-tasks-writer`) | NOT STARTED | The fix belongs in `work-inbox/fetch_inbox.py` Phase 3.5/3.6, not in this repo's own files — cross-repo item, needs work-inbox touched too. |
| 7 | Backfill/fix missing `dateAdded` on This Week tasks | NOT STARTED | Re-verified live just now: **16 of 30 This Week tasks (53%) missing `dateAdded`** — close to, but not identical to, the investigation's original 57% figure (data has moved slightly since; re-verify again on resume, don't reuse this number without a fresh check). |
| 8 | Fix staleness badge masking by routine auto-logged inbound email | NOT STARTED | Root cause already identified in the investigation entry below (`lastActivityTs()` in `js/app.js` ~line 237, `CC_STALE_DAYS` ~line 260) — design not yet re-validated against today's live data, do that first on resume. |

**Live re-verification done just now (fresh pull, not reused from the earlier investigation):**
- `data/tasks.json`: 63 tasks total, sha `843dbf7`.
- `done:true` tasks by tier: today=5, tomorrow=4, week=5, parked=3 (17 total across all 4 tiers). **The original investigation's "8" figure was This Week+Parked only (5+3=8)** — item 5's scope as Kevin approved it. The other 9 (5 today + 4 tomorrow) are done:true tasks in tiers not covered by the original investigation/approval — flag to Kevin on resume whether item 5 should also cover these, or stay scoped to This Week/Parked as originally proposed.
- This Week (`tier:"week"`) tasks: 30 total, 16 missing `dateAdded` (53%).

**Exact resume steps, in order:**
1. Re-read this checkpoint and the investigation entry below in full before touching anything — don't reconstruct from chat history.
2. Re-verify live `data/tasks.json` state fresh (don't reuse the numbers above without a new pull — time will have passed).
3. Confirm the standing question above with Kevin if not already answered: does item 5's purge cover only This Week/Parked (8, original scope) or all done:true tasks regardless of tier (17, current live count)?
4. Proceed item by item (5, then 7, then 8 — all single-repo; 6 last, since it also requires touching `work-inbox/fetch_inbox.py`), following this repo's own mandatory backup-and-verify sequence in full for every write to `data/tasks.json` or `js/app.js`: GET live file → confirm non-zero size → timestamped `Archive/` backup → commit backup → verify backup SHA → only then edit → verify post-change SHA. The `a76106c` backup above already covers step 1 of this sequence for whichever of items 5/7/8 touches `data/tasks.json` first — re-verify it's still fresh (matches live) before relying on it; if live data has changed since, take a fresh backup instead of reusing this one.
5. Item 8 touches `js/app.js`, which affects visible UI (the staleness badge) — screenshot before pushing and wait for Kevin's literal word "approved," per the repo's UI approval gate. Do not push on "looks right."
6. **Codex gap, carried forward and still unresolved:** none of these 4 items has had any Codex review pass yet (before-start, per-step, or end-to-end) — Codex was out of usage for the whole of today's session. This is a real, disclosed gap in review coverage, not a formality being skipped. Get a Codex pass in before or immediately after building, once capacity is confirmed back, rather than treating today's pause as having quietly closed that gap.

**Not done, on purpose:** no code or data was written for any of the 4 items — this entry is a checkpoint only, deliberately not an attempt to sneak in a fix under time/usage pressure.

---

## Session 2026-08-12 — "This Week"/"Parked" bloat investigated and root-caused live; investigate-and-propose only, nothing built or pushed (Drew)

**Scope:** Kevin asked for the same investigate-first treatment given to work-inbox's FYI bloat the same day — is This Week/Parked growing unbounded, is anything aging out, are there duplicates. Investigate-and-propose only, no build, no push, per Kevin's brief.

**Live numbers** (pulled `data/tasks.json` fresh via GitHub Contents API, 63 tasks total): raw tier counts week=30, tomorrow=12, parked=12, today=9. Excluding `done:true` (hidden from the board by the existing "Show done" toggle): **This Week displays 25, Parked displays 9** — not large in absolute terms, but real hygiene problems explain why Kevin still flagged it:

1. **`done:true` tasks not purged**: 5 in This Week, 3 in Parked, still live in `tasks.json`, hidden only by a client-side toggle — no archiving removes them from the data store.
2. **Duplicate tasks from the inbox auto-creation pipeline** (Phase 3.5/3.6 in `fetch_inbox.py`): 2 confirmed genuine duplicate pairs — "Review outstanding Development Insight reports actions..." created twice from two separate emails on the same topic, and "Advise [Marie] on GLAM joining 38-day balance scheme" created twice a day apart. No dedup check exists before auto-creating a task.
3. **`dateAdded` missing on 17 of 30 This Week tasks (57%)** — the auto-created-by-inbox-pipeline IDs never got this field populated, which would undermine any future age-based cleanup rule for most of This Week's real contents.
4. **A real staleness mechanism already exists** (`js/app.js` line 260: `CC_STALE_DAYS = {today:7, tomorrow:7, week:21, parked:45}`, an "XD QUIET" badge) — not something to build from scratch. Live count: 5 of 25 displayed This Week and 2 of 9 displayed Parked tasks currently show it. It's visual-only; nothing auto-archives once flagged.
5. **That staleness signal is being defeated by routine auto-logged inbound email.** `lastActivityTs()` (`js/app.js` ~line 237) takes the newest of dateAdded/lastUpdated/the latest dated action-log entry — and Phase 3.6 auto-appends every related inbound email as a dated action. A task genuinely static for 2 months but still receiving related mail (meeting reminders, forwards) looks perpetually fresh. Quantified live: 2 old This Week tasks and 7 old Parked tasks are currently kept looking fresh this way.

**Verified live**: full per-task dump of This Week/Parked (id, done, dateAdded, age, last action) against the live file; `lastActivityTs()`/`staleDays()` logic replicated exactly in Python against the same live data; title-word-overlap check across all 63 tasks for duplicates (2 genuine pairs confirmed, 1 heuristic false positive correctly excluded).

**Proposed, not built:** (1) purge/archive `done:true` tasks after a grace period instead of leaving them in the live store; (2) add a dedup check in Phase 3.5/3.6 before auto-creating a task; (3) backfill/enforce `dateAdded` at creation time; (4) Kevin to decide whether the staleness clock should only reset on genuine Kevin-driven progress rather than every auto-logged inbound email; (5) optional manual weekly review ritual as a lighter alternative to auto-archiving.

**Codex note:** Kevin reported Codex out of usage today. Investigate-only, nothing built or pushed, so the mandatory-Codex-on-builds rule wasn't triggered — flagged to Kevin that no Codex pass has reviewed this proposal.

Full detail: `begb0037admin/drew` `memory/cc-this-week-parked-bloat-investigation-12aug.md`.

**Next action:** awaiting Kevin's decision on which cleanup approach(es) to build.

---

## Session 2026-07-04 - Crest standard migration

Kevin approved the permanent crest fix after repeated CRESS/crest breakages: retire embedded base64 and use the normal asset path `images/oxford-crest.jpg` across dashboards.

### Standard now in force

- `BRANDING.md` v2.0 is the canonical dashboard branding source.
- `index.html` uses `<img class="sidebar-crest" src="images/oxford-crest.jpg" ...>`.
- Base64-embedded crest data is retired and must not be reintroduced.
- Sidebar crest classes are standardised around `.sidebar-logo`, `.sidebar-crest`, `.sidebar-brand-text`, `.sb-univ-of`, `.sb-oxford`, and `.sb-app-name`.

### Backups

| File | Backup |
|---|---|
| `HANDOVER.md` | `Archive/HANDOVER_backup_20260704_crest_migration.md` |

---

## Session 2026-07-04 — v5 Stage 3 complete: vertical tier layout + v5 task cards

**All three stages of the v5 redesign are now on main and live.**

Kevin approved the implementation Artifact before merge. Branch `claude/cc-redesign-5zghrg` merged to main via PR #12 on 2026-07-04.

### What changed (Stage 3 — this session)

- **Quick-add form removed** from sidebar (`sb-qa` div removed from `index.html`)
- **Main area restructured**: `main-area` / `top-bar` / `tier-grid` (4-column) replaced with `.main` / `.page-header` + `.page-title` + `.header-date` / vertical `#tierGrid`
- **Vertical tier sections**: Each tier is a `tier-section` with `.sec-head` (coloured dot + label + rule + count). IDs `sec-wrap-today` etc. for filter/scroll. Drop targets remain `id="tier-today"` etc. inside each section.
- **v5 task cards**: `.card-row` flex wrapper with `.card-drag` (⠇ handle), `.card-done` (circle button, goes green ✓), `.card-body` (title + desc, clickable for drawer), `.card-actions` (`.card-icon` 26×26 bordered squares for email/rename)
- **New CSS classes**: `card-row`, `card-drag`, `card-done`, `card-done.done`, `card-body`, `card-title`, `card-title.done`, `card-desc`, `card-actions`, `card-icon`; badge variants `badge-urgent`, `badge-gold`, `badge-mtg`, `badge-email`; `--border` CSS token; `[id^=tier-].drag-over` for vertical layout
- **JS updates**: `cardHTML()` rewrites to v5 structure; `filterBoard()` toggles `sec-wrap-*` visibility; `toggleDone()` uses `.card-done.done` + `.card-title.done`; `scrollToTier()` targets `sec-wrap-*`
- **Inbox-ticker** → card widget style (margin/border/border-radius, gap:0 stats, border-right dividers, 18px nums, `✔ Daily Focus` label)
- **Inbox-widget** → card widget style (blue badge `#3b82f6` not red)
- **Absences** → gold `#eab308` non-bold with bullet points
- **Links** → border-bottom dividers, `#60a5fa` hover

### Backups (Archive/)

| File | Backup |
|---|---|
| `index.html` | `Archive/index_backup_20260704_0900.html` |
| `css/styles.css` | `Archive/styles_backup_20260704_0900.css` |
| `js/app.js` | `Archive/app_backup_20260704_0900.js` |

---

## Session 2026-07-02 — v5 Stages 1–2: sidebar + intel panel

Screenshots approved by Kevin before merge. Work on branch `claude/daily-focus-redesign-9ttqkc`, merged to main 2026-07-02.

### What is live (CC)

- **Sidebar** — Oxford navy, user block, live clock, filter dropdown, Daily Focus ticker card widget (WI briefing data), From your inbox badge, Absences, Links
- **Intel panel** — 3-column `.intel-panel` with Watch / Act now / Waiting on blocks (replaces old stale banner)
- **Board toolbar** — done toggle controls
- **Tier sections** — vertical stacked `.tier-section` cards with `.sec-head > .sec-dot + .sec-lbl + .sec-rule + .sec-count`
- **Task cards** — `.card-row` with drag handle, circle done button, `.card-body` title/desc, `.card-actions` icon buttons; collapsible `.task-drawer` below

### Reference artefacts

- Approved mockup: `docs/mockups/cc-full-v5.html`
- Spec: `docs/DAILY_FOCUS_CROSS_DASHBOARD_REDESIGN.md`
- Pre-v5 backups: `Archive/index_backup_20260701_1544.html`, `styles_backup_20260701_1544.css`, `api_backup_20260701_1544.js`, `app_backup_20260701_1544.js`

---

## Architecture

| Component | Description |
|---|---|
| `index.html` | Shell — HTML structure only. Oxford navy sidebar (340px), file-based Oxford crest, blue-grey main (#f5f7fb), Inter font. No framework, no build step. Loads css/styles.css → js/api.js → js/app.js. |
| `css/styles.css` | All styles extracted from former monolithic index.html. |
| `js/api.js` | Data layer — constants, task state, loadTasks(), fetchTasksRemote(), mergeRemote(), persistTasks(), showSaveToast(). No DOM dependencies at load time. |
| `js/app.js` | UI layer — all rendering, interaction, drag/drop, suggestions, sidebar resize, init. Load order: after api.js. |
| `data/tasks.json` | Task data. Fields: id, title, tier (today/tomorrow/week/parked), source, emailRef, notes, actions[], dateAdded. |
| `governance/` | Governance workflow standard (v1.1), phase templates, and phase evidence artefacts. |
| `docs/project/generated/` | Approved Codex artefact path. All Codex-produced review artefacts are committed here. |

---

## Current State (fully working as of 2026-07-04)

### Working
- GitHub Pages live — `begb0037admin.github.io/command-centre/`
- Cloudflare Workers live — `cc.lelitte.co.uk` (primary URL)
- `data/tasks.json` loads on page open (cache-busted with `?_=Date.now()`)
- Four priority tiers: Today / Tomorrow / This Week / Parked — vertical stacked layout
- Sidebar: Oxford navy, 340px, real Oxford crest loaded from `images/oxford-crest.jpg`, live clock, tier filter dropdown, Daily Focus ticker card widget (task counts + WI briefing stats), From your inbox badge card widget, Absences (gold #eab308), Links with border-bottom dividers, My Links
- Intel panel: 3-column Watch / Act now / Waiting on above the tier board
- Task cards: v5 card-row structure — drag handle, circle done button, title/desc body, icon action buttons (email/rename); collapsible drawer with description, actions, AI input, move/delete controls
- Done state: circle goes green ✓, title strikes through, fades out if "Show done" is off; persists in tasks.json
- Hide/Show Done toggle
- Cloudflare Worker write-back (`cc-tasks-writer.kevinlelitte.workers.dev`) — PAT held server-side ✅ Confirmed working
- 'From your inbox' suggestion panel — drags AI-proposed tasks into tier lists; dismissals persist in localStorage
- **Tier filter** — sidebar dropdown shows/hides `sec-wrap-*` sections; ticker stats are clickable to filter
- **Badge CSS** — NEW (green) and UPDATED (amber) badges; badge variants for urgent/meeting/email context
- **Save-status toast** — blue saving / green saved / red error (tap to dismiss)
- **hashchange listener** — fires `goToCard(id)` when WI's CC→ button updates the URL hash
- **Sidebar resize** — drag handle on right edge of sidebar

### Known Limitations (by design — v1)
- Done state keyed by task ID — if `tasks.json` regenerated with new IDs, done state resets.

### GitHub Pages
- Enabled manually by Kevin (Settings → Pages → main / root)
- Deploy time ~1 min after push to main

---

## File Locations

| File | Path |
|---|---|
| Task data | `data/tasks.json` |
| Dashboard shell | `index.html` (repo root) |
| Styles | `css/styles.css` |
| Data layer | `js/api.js` |
| UI layer | `js/app.js` |
| Oxford crest | `images/oxford-crest.jpg`; embedded base64 is retired and must not be reintroduced |
| Inbox suggestions | `data/inbox_suggestions.json` (written by work-inbox fetch_inbox.py Phase 3.5) |
| Triage ledger | `data/triage_ledger.json` (dedup tracker for Phase 3.6 auto-updates) |
| Archive | `Archive/tasks_backup_YYYYMMDD.json` (auto-created before every write) |
| Approved mockup | `docs/mockups/cc-full-v5.html` |
| Cross-dashboard redesign spec | `docs/DAILY_FOCUS_CROSS_DASHBOARD_REDESIGN.md` |
| Governance standard | `governance/GOVERNANCE_WORKFLOW_STANDARD.md` (v1.1) |
| Phase 1 Evidence Package | `governance/evidence/PHASE_1_EVIDENCE_PACKAGE.md` |
| Phase 1 Review Request | `governance/evidence/PHASE_1_REVIEW_REQUEST.md` |
| Phase 1 Remediation Evidence | `governance/evidence/PHASE_1_REMEDIATION_EVIDENCE.md` |
| Phase 1 Validation Request | `governance/evidence/PHASE_1_VALIDATION_REQUEST.md` |
| Codex artefact path | `docs/project/generated/` |
| Phase 1 Challenge Report (Codex) | `docs/project/generated/PHASE_1_CHALLENGE_REPORT.md` |
| Phase 1 Remediation Request (Codex) | `docs/project/generated/PHASE_1_REMEDIATION_REQUEST.md` |
| CLOUDFLARE Plan Review Request | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_REVIEW_REQUEST_20260625.md` |
| CLOUDFLARE Seat B Challenge Brief | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_GOVERNANCE_CHALLENGE_BRIEF_20260625.md` |
| CLOUDFLARE Codex Challenge Report | `docs/project/generated/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_CHALLENGE_REPORT_20260625.md` |
| CLOUDFLARE Codex Remediation Request | `docs/project/generated/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_REMEDIATION_REQUEST_20260625.md` |
| CLOUDFLARE Remediated Plan | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_PLAN_REMEDIATED_20260625.md` |
| CLOUDFLARE Remediation Evidence | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_REMEDIATION_EVIDENCE_20260625.md` |
| CLOUDFLARE Validation Request | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_VALIDATION_REQUEST_20260625.md` |
| CLOUDFLARE Codex Validation Report | `docs/project/generated/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_VALIDATION_REPORT_20260625.md` |
| CLOUDFLARE Governance Review Request | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_GOVERNANCE_REVIEW_REQUEST_20260625.md` |
| CLOUDFLARE Governance Decision | `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_GOVERNANCE_DECISION_20260625.md` |

---

## Governance Workflow

All multi-repository governance operations follow the 6-stage workflow defined in `governance/GOVERNANCE_WORKFLOW_STANDARD.md` (v1.1, updated 2026-06-21, commit `65b753b5cf5242307786dda0eca09c766812878d`).

### Governance Workflow Correction (2026-06-21)

**Trigger:** Codex attempted to commit review artefacts during Phase 1 Stage 3 without a clearly defined write path, resulting in local file outputs and failed commits.

**Correction applied:**
- GOVERNANCE_WORKFLOW_STANDARD.md updated to v1.1 — Section 9 (Codex Controlled Write Constraint) added.
- Artefact table updated: Codex-produced artefacts (Challenge Report, Remediation Request, Validation Report) now explicitly assigned to `docs/project/generated/`.
- Agent responsibilities updated: Codex write boundary and operating mode verification made mandatory.
- Claude Code fallback obligation made explicit: when Codex cannot write, Claude Code commits Codex artefact content exactly as supplied, no edits.
- 6 Codex-facing templates updated: PHASE_REVIEW_REQUEST, PHASE_CHALLENGE_REPORT, PHASE_REMEDIATION_REQUEST, PHASE_VALIDATION_REQUEST, PHASE_VALIDATION_REPORT, PHASE_GOVERNANCE_REVIEW_REQUEST.
- All updated templates now include: Codex Operating Mode section (Option A / Option B), Claude Code Commit Handoff section with exact filenames, target path, wording preservation requirement, and HANDOVER.md update obligation.

**Codex operating model (corrected):**

| Role | Agent | Write path |
|------|-------|------------|
| Primary implementation and remediation | Claude Code | `governance/evidence/` + all production files |
| Independent technical reviewer | Codex | `docs/project/generated/` only |
| Programme governance decision authority | ChatGPT / Kevin | `governance/evidence/` (Governance Decision only) |

**Approved Codex artefact path:** `begb0037admin/command-centre/docs/project/generated/`

**Approved Codex artefacts:**
- `PHASE_X_CHALLENGE_REPORT.md`
- `PHASE_X_REMEDIATION_REQUEST.md`
- `PHASE_X_VALIDATION_REPORT.md`
- `PHASE_X_GOVERNANCE_REVIEW_REQUEST.md`

**Codex must not write, modify, or commit:** governance standards, templates, implementation files, production files, operational files, application code, backups, remediation evidence, HANDOVER.md (unless explicitly authorised).

**Files updated in this correction:**

| File | Content SHA |
|------|-------------|
| `governance/GOVERNANCE_WORKFLOW_STANDARD.md` | `493c93d7abb3d89f4efa770a5430ebd693a29511` |
| `governance/templates/PHASE_REVIEW_REQUEST_TEMPLATE.md` | `bcc71e7708a6a86f89ee37a76fad380f6527c881` |
| `governance/templates/PHASE_CHALLENGE_REPORT_TEMPLATE.md` | `1f77c00bb35a397037cc18ad0d0b759ad289ba4d8acf` |
| `governance/templates/PHASE_REMEDIATION_REQUEST_TEMPLATE.md` | `74407d59ecaac165c48e6094d27894164ec33f8c` |
| `governance/templates/PHASE_VALIDATION_REQUEST_TEMPLATE.md` | `d370ba3b58cc1611b0bb95467c6e6ebe3a3cd4e3` |
| `governance/templates/PHASE_VALIDATION_REPORT_TEMPLATE.md` | `c49e079346ad6fc025423b0f58c8e5a0c96f209c` |
| `governance/templates/PHASE_GOVERNANCE_REVIEW_REQUEST_TEMPLATE.md` | `8f9752f267b5162a680c80d75531181dbd76e4d1` |

**Workflow/template correction commit SHA:** `65b753b5cf5242307786dda0eca09c766812878d`

**All 7 files GET-verified at that commit SHA.**

### Template Index

| Template | Path | Stage |
|----------|------|-------|
| Evidence Package | `governance/templates/PHASE_EVIDENCE_PACKAGE_TEMPLATE.md` | 2 |
| Review Request | `governance/templates/PHASE_REVIEW_REQUEST_TEMPLATE.md` | 3 |
| Challenge Report | `governance/templates/PHASE_CHALLENGE_REPORT_TEMPLATE.md` | 3 |
| Remediation Request | `governance/templates/PHASE_REMEDIATION_REQUEST_TEMPLATE.md` | 4 |
| Remediation Evidence | `governance/templates/PHASE_REMEDIATION_EVIDENCE_TEMPLATE.md` | 4 |
| Validation Request | `governance/templates/PHASE_VALIDATION_REQUEST_TEMPLATE.md` | 5 |
| Validation Report | `governance/templates/PHASE_VALIDATION_REPORT_TEMPLATE.md` | 5 |
| Governance Review Request | `governance/templates/PHASE_GOVERNANCE_REVIEW_REQUEST_TEMPLATE.md` | 6 |
| Governance Decision | `governance/templates/PHASE_GOVERNANCE_DECISION_TEMPLATE.md` | 6 |

### Workflow Summary (corrected v1.1)
| Stage | Action | Produced by | Path |
|-------|--------|-------------|------|
| 1 — Execute | Perform approved writes | Claude Code | Various repos |
| 2 — Evidence | Evidence Package | Claude Code | `governance/evidence/` |
| 3 — Challenge | Review Request | Claude Code | `governance/evidence/` |
| 3 — Challenge | Challenge Report + Remediation Request | Codex | `docs/project/generated/` |
| 4 — Remediation | Remediation Evidence | Claude Code | `governance/evidence/` |
| 5 — Validation | Validation Request | Claude Code | `governance/evidence/` |
| 5 — Validation | Validation Report | Codex | `docs/project/generated/` |
| 6 — Decision | Governance Review Request | Claude Code | `governance/evidence/` |
| 6 — Decision | Governance Decision | Kevin | `governance/evidence/` |

---

## Phase 1 Governance Artefacts

### Artefacts Committed

| Artefact | Path | Commit SHA | Content SHA | Verified |
|----------|------|------------|-------------|----------|
| PHASE_1_EVIDENCE_PACKAGE.md | `governance/evidence/PHASE_1_EVIDENCE_PACKAGE.md` | `f941af6984664efd70d70e06dccf9b7a8a1dfc2a` | `07449bef60a2e8a5ffa8a17445052c20e0b0a742` | ✅ GET confirmed |
| PHASE_1_REVIEW_REQUEST.md | `governance/evidence/PHASE_1_REVIEW_REQUEST.md` | `f941af6984664efd70d70e06dccf9b7a8a1dfc2a` | `42275d4d7569a988eb75d99e91d96ddff391a71a` | ✅ GET confirmed |
| PHASE_1_CHALLENGE_REPORT.md (Codex Option B) | `docs/project/generated/PHASE_1_CHALLENGE_REPORT.md` | `c2ca67c5d3d8c650d05555f5bd3e2ea3439aca36` | `9c64b8c8ef950d4ffce3bd4f78ce06668bae1d54` | ✅ GET confirmed |
| PHASE_1_REMEDIATION_REQUEST.md (Codex Option B) | `docs/project/generated/PHASE_1_REMEDIATION_REQUEST.md` | `c2ca67c5d3d8c650d05555f5bd3e2ea3439aca36` | `2840d1e2795db082e873d536261e0413655ccfcb` | ✅ GET confirmed |
| PHASE_1_REMEDIATION_EVIDENCE.md | `governance/evidence/PHASE_1_REMEDIATION_EVIDENCE.md` | `d3ac11c585eaccc186178349aa06376f51` | `e30a9dd78474003bdc0f9edc3deb94b9473c8eeb` | ✅ GET confirmed |
| PHASE_1_VALIDATION_REQUEST.md | `governance/evidence/PHASE_1_VALIDATION_REQUEST.md` | `d3ac11c585eaccc186178349aa06376f51` | `fad75a3549923b4a3cc7dfd03b6a08312c3adadd` | ✅ GET confirmed |

### Codex Option B Handoff Record

| Field | Value |
|-------|-------|
| Codex operating mode | Option B — Read-Only Reviewer With Claude Code Commit Handoff |
| Reason | GitHub connector returned expired-token errors; no GH_TOKEN or GITHUB_TOKEN present |
| Artefacts committed by Claude Code | `PHASE_1_CHALLENGE_REPORT.md`; `PHASE_1_REMEDIATION_REQUEST.md` |
| Target path | `docs/project/generated/` |
| Wording preserved | YES — committed exactly as supplied by Codex, no edits |
| Commit SHA | `c2ca67c5d3d8c650d05555f5bd3e2ea3439aca36` |
| Both files GET-verified | YES |

### Phase 1 Workflow Status

| Stage | Status |
|-------|--------|
| Stage 1 — Execute (AGENT_MODEL v2.1 propagation) | ✅ Complete — all 9 repos at v2.1 |
| Stage 2 — Evidence | ✅ Complete |
| Stage 3 — Challenge | ✅ Complete — GAPS FOUND |
| Stage 4 — Remediation | ✅ Complete |
| Stage 5 — Validation | ⏳ Pending — next agent: Codex |
| Stage 6 — Governance Decision | 🔲 Awaiting Kevin |

**Phase 1 Stage 5 entry point:** `governance/evidence/PHASE_1_VALIDATION_REQUEST.md`

### Phase 1 v2.1 Estate — Final State

All 9 governed repositories are now at AGENT_MODEL.md v2.1 (blob `fba303449462c5a1c031cf47010ae8788f8a1db2`).

| Repository | Wave | Backup SHA | Write commit SHA | Verified |
|---|---|---|---|---|
| ag-flexpoints | Wave 1 | `125c2a6c` | `862ace12` | ✅ |
| hris-change-requests | Wave 1 | `69332c44` | `0e371d3d` | ✅ |
| clockify | Wave 2 | `c226199d` | `05755a08` | ✅ |
| hr-fa-knowledge-base | Wave 2 | `c226199d` | `2c386f43` | ✅ |
| hr-projects | Wave 2 | `c226199d` | `3194332c` | ✅ |
| meeting-records | Wave 2 | `f708523d` | `f5b737cf` | ✅ |
| hris-dashboard | Wave 2 | `3855713e` | `439e5b85` | ✅ |
| hris-launcher | Wave 2 | `d15e4b7e` | `9d273455` | ✅ |
| command-centre | Wave 2 | `5d5ff188` — commit `1419d4ad` | `d6febbe5` | ✅ |

---

## CLOUDFLARE_PHASE_SPLIT_MIGRATE — Governance Artefacts

**Status: Phase 3 COMPLETE — cc.lelitte.co.uk and wi.lelitte.co.uk both live. Phase 2 functional equivalence check (browser-level) pending Kevin sign-off (Gate 2.0).**

### Governance Chain

| Stage | Artefact | Commit SHA |
|---|---|---|
| Pre-execution | Plan Review Request | `2ab2dd5563eb1aa4fac42e436ae1efd27687e919` |
| Pre-execution | Seat B Challenge Brief (V2, V6, V7) | `be0a088cf1160cec23f7e8781c331062d9516cb1` |
| Stage 3 | Codex Challenge Report (revised — fallback) | `d6a18be45225cb44d5ec89632cace9071c5950d1` |
| Stage 3 | Codex Remediation Request (revised — fallback) | `d6a18be45225cb44d5ec89632cace9071c5950d1` |
| Stage 4 | Remediated Plan + Remediation Evidence | `96aac2c1c6b6cb7a0df556e411a47c21f7cb79d6` |
| Stage 5 | Validation Request | `63f59a32647096dd2347ddf0d99bd469873b120f` |
| Stage 5 | Codex Validation Report (ALL PASS — fallback) | `57d241bc3bb282ef0569cab9b6395c813e90ad64` |
| Stage 6 | Governance Review Request | `ab7cf77f3f892b3707f537dcea20d574d96b8437` |
| Stage 6 | **Governance Decision — APPROVED** | `8baeecc98302e3f6a988cddda6859ec6046cd4bc` |

### Golden Restore Point (captured at governance approval)

| Item | Value |
|---|---|
| `index.html` blob SHA | `b4e0d5d8d1546c9cc28bb5161fc60b0daebc63cd` |
| `data/tasks.json` blob SHA | `cd0b540cfca6e22426fb2e46335cd8a10c1308d3` |
| Repo HEAD at approval | `8baeecc98302e3f6a988cddda6859ec6046cd4bc` |
| Hosting | GitHub Pages — `begb0037admin.github.io/command-centre/` |
| Worker | `cc-tasks-writer.kevinlelitte.workers.dev` |

### Approved Plan Summary

Remediated plan at `governance/evidence/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_PLAN_REMEDIATED_20260625.md` (commit `96aac2c1c6b6cb7a0df556e411a47c21f7cb79d6`). Key phases:

- **Phase 0** — Governance baseline, full restore-point capture, governed CLAUDE.md update (Gate 0.3 — Kevin approval required)
- **Phase 1** — File split on GitHub Pages: `index.html` shell + `css/styles.css` + `js/app.js` + `js/api.js` (Gate 1.0 — Kevin approval required)
- **Phase 2** — 25-item functional equivalence verification on GitHub Pages (Gate 2.0 — Kevin sign-off)
- **Phase 3** — Cloudflare Pages migration, dual-origin transition, CORS update (Gates 3.0–3.6 — Kevin approval at each)

Work-inbox followed the identical pattern once command-centre Phase 3 was confirmed stable.

---

## Next Action

**Phase 2 (functional equivalence check — Cloudflare migration):** Browser-level test of `https://cc.lelitte.co.uk`. Check: task load, tier moves, quick-add, notes edit, done state, inbox suggestions (+ tier buttons, dismiss), tier focus mode, sidebar resize, crest. Source-level check passed 2026-06-27. Browser sign-off by Kevin closes Gate 2.0.

**After Gate 2.0:** Remaining dashboards custom domain rollout — hris-launcher (`hris.lelitte.co.uk`), hr-fa-knowledge-base (`kb.lelitte.co.uk`), hris-dashboard (`hris-dash.lelitte.co.uk`).

**AI "Update with AI" button — UI live; Worker setup outstanding:** Worker endpoint code committed to `cloudflare-worker/ai-log-endpoint.js` (commit `88490353`). Kevin to: (1) add `handleAiLog` function + `/ai-log` route to cc-tasks-writer in Cloudflare dashboard; (2) add `ANTHROPIC_API_KEY` as Worker secret; (3) test end-to-end.

**Phase 1 Stage 5 (outstanding — Codex):**
Codex to validate `PHASE_1_REMEDIATION_EVIDENCE.md` against `PHASE_1_VALIDATION_REQUEST.md` and produce `PHASE_1_VALIDATION_REPORT.md` in `docs/project/generated/`.

**Automated meeting prep triggers — BROKEN — action required:**
See meeting-records `Meeting Reviews/docs/HANDOVER.md` for full brief. Six triggers exist but failed silently on first run (1 July). Claude_Code_Remote MCP needs re-authorisation before they can be investigated or fixed. Do not rely on triggers until verified working with a confirmed test run.

**Parked feature:** "Merge suggestion into existing task" — "+ Add to task" button on suggestion cards appends a dated action entry to an existing task and dismisses the card.

---

## Session Notes

### 2026-07-04 (Kevin session) — v5 Stage 3: vertical tier layout + v5 task cards

**Changes shipped:**
- Quick-add form (`sb-qa`) removed from sidebar
- 4-column `tier-grid` replaced with vertical `tier-section` layout — `sec-head` (dot + label + rule + count) for each tier
- Task cards rebuilt to v5 spec: `card-row` / `card-drag` / `card-done` (circle, goes green ✓ on done) / `card-body` (title + desc) / `card-actions` (card-icon buttons for email/rename)
- Inbox-ticker → card widget (margin/border/radius); badge changed blue `#3b82f6`
- Absences → gold `#eab308`, non-bold, bullet-prefixed
- Links → border-bottom dividers, `#60a5fa` hover
- CSS additions: `--border` token, `card-row/drag/done/body/title/desc/actions/icon`, `badge-urgent/gold/mtg/email`, `[id^=tier-].drag-over`, `dot-r/g/grn/sl`, `tier-section/sec-head/sec-dot/sec-lbl/sec-rule/sec-count`, `page-header/page-title/header-date`
- JS updates: `cardHTML()`, `filterBoard()`, `toggleDone()`, `scrollToTier()`
- Backups: `Archive/index_backup_20260704_0900.html`, `styles_backup_20260704_0900.css`, `app_backup_20260704_0900.js`
- Branch: `claude/cc-redesign-5zghrg` → PR #12 → merged to main

### 2026-07-01 (Hope session) — Automated meeting prep triggers: created, failed, reviewed

**What was set up:**
Six Claude Code Remote triggers created to fire at 07:00 UTC (08:00 BST) and produce meeting prep documents for begb0037admin/meeting-records:

| Trigger | Cron | Gate |
|---|---|---|
| FA Team Catch-up (Wed+Fri) | `0 7 * * 3,5` | None |
| HR Systems Roadmap (Fri) | `0 7 * * 5` | None |
| H&S Roadmap (Mon) | `0 7 * * 1` | None |
| SK 1-1 (Wed, fortnightly) | `0 7 * * 3` | Calendar — checks calToday |
| HR Systems Managers Meeting (Wed, fortnightly) | `0 7 * * 3` | Calendar — checks calToday |
| KPI Monthly Standing Agenda (Wed, monthly) | `0 7 * * 3` | Calendar — checks calToday |

**What failed:**
All triggers fired at 08:00 BST on 1 July. No documents appeared in the repo. Root cause: triggered sessions do not have `mcp__github__*` or `mcp__Granola__*` tools in their session_context. They fired into a blank environment and failed silently.

**Constitution violations:**
- Assumed triggered sessions had the same MCP access as the interactive session — never tested
- No verification was done to confirm documents appeared before Kevin's meeting
- No failsafe notification if output failed to appear

**Manual prep delivered in chat** for the 09:30 FA Team Catch-up. Not pushed to repo.

**Additional process requirement raised by Kevin:**
Each trigger must read the previous meeting prep doc from the repo AND the previous Granola transcript of the actual meeting. Cross-reference carry-forwards. Cannot rely on MCP tools alone — must be robust to tool availability issues.

**Blocker:** Claude_Code_Remote MCP currently requires OAuth re-authorisation. Triggers cannot be disabled or modified until Kevin authorises via claude.ai connector settings.

**Full brief:** `meeting-records/Meeting Reviews/docs/HANDOVER.md`

### 2026-06-30 (evening) — WI done sync; CC→ button window reuse; hashchange card selection

**CC→WI done sync (WI-side, one-way):**
- WI `js/app.js` polls `data/tasks.json` in command-centre every 30 seconds via the github-proxy Worker.
- When a CC task matching a WI priority item title is found with `done: true`, the WI item is auto-ticked and synced to `data/ticks.json` via cc-tasks-writer.
- One-way only: CC → WI. Confirmed working by Kevin.

**CC→ button window reuse fix (work-inbox/js/app.js):**
- Root cause: `window.open(url, 'command-centre')` only reuses a tab the browser opened via `window.open` — a tab navigated to manually has no window name.
- Fix: module-level `_ccWindow` variable. `openCC(id)` checks `_ccWindow && !_ccWindow.closed`; if true, navigates in place via `_ccWindow.location.href` + `.focus()`; otherwise opens new tab and stores reference.
- Backup before write: `Archive/app_js_backup_20260630_2110.js` (commit `2d9833d5`, SHA `…`)
- work-inbox `js/app.js` SHA after fix: `44867d67`. Confirmed working by Kevin.

**hashchange listener (command-centre/js/app.js):**
- Root cause: CC init block reads `window.location.hash` once on load. Setting `_ccWindow.location.href` fires `hashchange` in the CC tab — but CC had no listener, so `goToCard()` was never called.
- Fix: appended `window.addEventListener('hashchange', function(){ var id=window.location.hash.replace('#',''); if(id) goToCard(id); });` to `js/app.js`.
- Backup before write: `Archive/app_js_backup_20260630_2115.js` (commit `8e3d84dd`)
- New `js/app.js` SHA: `12e0b1be` (commit `8b3c880`). Confirmed working by Kevin.

### 2026-06-30 — t046 added; Cloudflare CI fix; Phase 3.7 flagged; AI Update button scoped

**t046 — PACS org structure — college entities L2 to L3 impact assessment:**
- Backup created before write: `Archive/tasks_backup_20260630_1010.json` (commit `2f7f71a55bf7f1fb72f99ea56e6f36aa027d7843`, SHA `3cda25b7`)
- t046 appended to `data/tasks.json` (commit `050446451eb1d3e155bbdd6f5b81e4138a23ab01`, SHA `8c880247`); tier: week
- Full backup-and-verify protocol followed per CLAUDE.md
- t046 deferred until after fetch_inbox.py Phase 3.6 completed (SHA conflict avoidance)

**Inbox run (2026-06-30 morning):**
- Phase 3.6 applied 4 auto-updates: t015, t024, t014, task-1782599584762
- New task added by Phase 3.6: task-1782599630157 "Review UOX case 69001655 catch-up from Maura McGlynn" (tier: today)

**Cloudflare CI fix:**
- Root cause: "Builds for non-production branches: Enabled" in Cloudflare Workers settings caused `npx wrangler versions upload` to run on every PR branch. PR branches lack `wrangler.jsonc` (only the auto-managed `cloudflare/workers-autoconfig` branch carries it), so every PR deploy failed.
- Fix: Kevin disabled "Builds for non-production branches" via Cloudflare Settings → Branch Control. Confirmed via screenshot.
- Main branch deploys to `cc.lelitte.co.uk` unaffected. No code changes required.
- `wrangler.jsonc` lives on `cloudflare/workers-autoconfig` branch (auto-managed by Cloudflare) — do not modify.

**Phase 3.7 warning (fetch_inbox.py):**
- Terminal output showed WARNING: "Unterminated string starting at: line 15 column 11 (char 3363)" — JSON parse error in AI summaries phase.
- Root cause: AI-generated text likely contains unescaped quotes or special characters breaking JSON serialisation.
- `tasks.json` unaffected — Phase 3.6 writes are separate and working correctly. Flagged for roadmap investigation.

**AI "Update with AI" button — UI half complete (high effort, 2026-06-30 afternoon):**
- Feature: removed Notes field from task cards; replaced with AI text input area. Kevin pastes raw text (Teams message, email, portal update, etc.), clicks "Update with AI"; Worker endpoint calls Claude haiku with task context + raw text → formats as `[DD Mon YYYY] ...` dated action entry → appends to `tasks.json` actions array.
- **UI changes (COMPLETE):** `js/app.js` — `saveNotes()` removed; `aiLog()` added. Backup: `Archive/app_js_backup_20260630_1400.js` (commit `93d3e11d`, SHA `81e3c76c`). New `js/app.js` SHA: `9488e092` (commit `0a77fd40`). `css/styles.css` — `.ai-input`, `.ai-log-btn`, `.ai-log-btn:disabled`, `.ai-status` added. New SHA: `53f7ceb7` (commit `ad95feadf`).
- **Worker endpoint code (committed, not yet live):** `cloudflare-worker/ai-log-endpoint.js` SHA: `58e22a54` (commit `88490353`).
- **Outstanding — Kevin action required:** Cloudflare → Workers → cc-tasks-writer → Edit code → add `handleAiLog` function → add route → add `ANTHROPIC_API_KEY` secret → Save and Deploy.

### 2026-06-08 — Module 1 build (Hope cross-domain)
- Kevin hit token cap mid-session; Hope completed build under Cross-Domain Code Brief
- Oxford crest: Kevin uploaded OUO.jpg — embedded as base64
- All 13 seed tasks enriched with action bullet arrays from SK 1-1 Granola transcript

### 2026-06-22 — Sidebar styling audit: stale banner, task counts, context bar

**Command Centre:**
- Stale "Watch — stale today" banner moved from sidebar to main content area, above the tier grid. Oxford blue tint (`#eff6ff` / `#bfdbfe` / `#1e3a8a`). Two-column layout: task list with red age pills (left) + stats panel — count, oldest, average age, stalled 2w+ (right). Title and age pills in `#dc2626`. Subtitle: "These tasks have been in your Today list for 3+ days. Move them on, park them, or mark done."
- Live task counts widget added to sidebar (Today / Tomorrow / This week / Actions due). Reads directly from in-memory `tasks` array; updates on every `renderBoard()` call — no fetch, no caching issues.
- Banner and counts are fully dynamic: move a card → banner and sidebar update instantly.
- All changes approved by Kevin and live on main.

**Work Inbox:**
- Context bar restyled to Oxford blue tint matching Command Centre stale banner.
- "Context" label bumped to 17px, colour `#1d4ed8` to stand out.
- Context paragraph split sentence-per-line with red dash bullets.
- Tasks widget: label bumped to 13px, live heartbeat dot (green=success, red=fail), 30s polling via proxy URL.

### 2026-06-22 — Tier focus mode
- Sidebar tier dropdown now filters the board: selecting a tier collapses all others and expands the selected one full-width.
- "All" option added to return to normal four-column view.
- Commit: `f82178e`

### 2026-06-18 — Badge alignment + UI polish
- Badge alignment fixed; badge CSS normalised to match Work Inbox; emoji stripped from Open email buttons.
- Live on main: commit `e7c4b22`.

### 2026-06-21 — Governance Phase 1 complete (execution)
- AGENT_MODEL.md v2.0 propagated to all 7 repositories.
- All 7 v2.0 writes verified by GET; content SHA `05fc8adaab7e5b9524fe2c4f85ace667d7e04801` identical across all repos.
- CONSTITUTION.md v1.0 SHA `a25878b0` confirmed unchanged.

### 2026-06-21 — Governance workflow standard + templates (v1.0 → v1.1)
- `governance/GOVERNANCE_WORKFLOW_STANDARD.md` — 6-stage workflow, 10-artefact set, agent responsibilities, handoff requirements.
- 9 phase templates committed to `governance/templates/`. Correction to v1.1 applied same session.
- Correction commit SHA: `65b753b5cf5242307786dda0eca09c766812878d`.

### 2026-06-21 — Phase 1 Stages 2–4 complete; Stage 5 pending
- Evidence Package, Review Request, Challenge Report (Codex Option B), Remediation Request, Remediation Evidence, Validation Request all committed.
- Wave 1 + Wave 2: all 9 repos updated to v2.1 blob `fba303449462c5a1c031cf47010ae8788f8a1db2`.
- Stage 5 (Codex validation) still pending.

### 2026-06-23 — Cloudflare Worker persistence fix + data restore
- Schema mismatch fixed: `persistTasks()` now sends `{doc:{tasks:[]}}`. Cloudflare secret `HRIS_GITHUB_PAT` added by Kevin.
- Data corruption event recovered: 24 tasks restored from commit `bdc1d42`. Restore commit `cad2a9fb`.
- Save-status toast added. Worker write confirmed working end-to-end by Kevin.

### 2026-06-25 — HR Systems Managers Meeting 24/06 — full task update
- Source: Granola (ID: 36d1c98d-d1ae-4a94-b0df-3c4835b64f57). tasks.json commit `fd675769`. 8 new tasks (t032–t039), 2 deleted, 3 closed, 4 updated.

### 2026-06-25 — CLOUDFLARE_PHASE_SPLIT_MIGRATE governance — APPROVED
*(Detail in earlier session notes — see 2026-06-27 entries.)*

### 2026-06-27 (continued) — Phase 3 complete: Cloudflare Workers deployment

**Both URLs now live and functional:**
- GitHub Pages: `https://begb0037admin.github.io/command-centre/`
- Cloudflare: `https://cc.lelitte.co.uk` (primary)

**Domain plan:**
| Dashboard | URL |
|---|---|
| Command Centre | `cc.lelitte.co.uk` ✅ live |
| Work Inbox | `wi.lelitte.co.uk` ✅ live |
| HRIS Launcher | `hris.lelitte.co.uk` 🔲 pending |
| HR FA Knowledge Base | `kb.lelitte.co.uk` 🔲 pending |
| HRIS Dashboard | `hris-dash.lelitte.co.uk` 🔲 pending |

### 2026-06-27 — CLOUDFLARE_PHASE_SPLIT_MIGRATE Stage 1 execution complete

**File split live on GitHub Pages.** 65KB monolithic `index.html` split into 4 files.

**Archive backups:**

| File | Archive path | Backup SHA |
|---|---|---|
| `index.html` | `Archive/index_backup_20260627.html` | `b4e0d5d8d1546c9cc28bb5161fc60b0daebc63cd` |
| `data/tasks.json` | `Archive/tasks_backup_20260627.json` | `9f2dc00346eccc183af18131dc251706b382e460` |
| `js/app.js` | `Archive/app_js_backup_20260627.js` | `1dd68dba33f78ae10000b91a6dd7e19a6234b43d` |

### 2026-06-27 — Cross-domain links, CONSTITUTION.md v2.0, CLAUDE.md effort governance

- Sidebar "Work Inbox" link and inbox toolbar "Open full inbox →" updated to `https://wi.lelitte.co.uk/`
- work-inbox CC button updated to `https://cc.lelitte.co.uk/`
- CONSTITUTION.md v2.0: Section 10 (Effort Level Governance) added to all 7 repos. Kevin approved 2026-06-27.
- CLAUDE.md: Effort Level Governance section added to all 7 repos.

### 2026-06-28 — Live clock removed; sidebar reorder; Oxford crest restored; Daily Focus margin fix

- Clock removed from CC sidebar; relocated to work-inbox sidebar.
- Sidebar nav reorder: Daily Focus → From your inbox → Tasks counts → Links → My Links.
- Oxford crest restored (full 10,416-char base64 — truncated in PR #5 squash).
- Daily Focus card margin fix: flush with sidebar nav elements.
