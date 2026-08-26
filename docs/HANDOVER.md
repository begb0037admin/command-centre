# Handover — 26 August 2026, ~19:30 UTC (Drew) — `sourceType` field: opener routing separated from `source` provenance — MERGED, DEPLOYED, LIVE

**UPDATE ~20:05 UTC — Kevin approved ("Approved."), merged and deployed.**
- **Merge commit:** `986584e140aec3e65257ca6bf30ee38523f10d4f` on `main` (`--no-ff`-style merge via the GitHub Merges API of `drew/cc-sourcetype-field-26aug`; two parents confirmed — mainline `d759f6c8` [pre-merge `main`, unmoved since the branch was cut] and branch tip `5d2673c0`). Files changed: `js/app.js`, `docs/HANDOVER.md`, `Archive/app_backup_20260826_1917.js`. `data/tasks.json` untouched and verified byte-identical (content sha `f9272cbe…`, 176687 bytes, same before and after the merge) — no migration performed, exactly as designed.
- **Deploy verified:** GitHub Pages build for `986584e1` polled to `built` (4 polls, ~24s). Live-served `https://begb0037admin.github.io/command-centre/js/app.js` fetched fresh (cache-busted) and byte-diffed (`cmp` + sha1) **identical** to the approved branch-tip content — both 48088 bytes, sha1 `11dd264b…`; Contents API confirms `js/app.js` on `main` now content sha `397e6d6e4870aa91403efa0aa8fc30647a1abd9b`, matching the reviewed/approved file exactly.
- **Production behaviour re-checked live** (Playwright against the real deployed URL, no fixture): board renders (46 cards in default "done hidden" view) with **zero page errors**.
- **Branch `drew/cc-sourcetype-field-26aug` deleted** — remote confirmed gone (404 on the ref). No local clone of this repo ever had the branch checked out (this session worked entirely via the GitHub Contents/Git API from a scratch directory), so there was nothing to delete locally.
- **Revert path if ever needed:** `git revert -m 1 986584e1` (mainline = pre-merge `main` `d759f6c8`, `js/app.js` blob `c222a2b3…`), or restore `js/app.js` from `Archive/app_backup_20260826_1917.js`.

**Next action for a cold session:** nothing outstanding on this fix — it is live and verified, and the field-name collision flagged in the codex-graph opener entry below is now fully closed. Do **not** start Phase 2 / any Codex task-writer without its own fresh brief from Kevin. The research doc's own checkpoint is on `begb0037admin/work-inbox` PR #29 branch `claude/outlook-codecs-connector-upgrade-fe3dgf` — see that document's Section 9 for the merged/deployed status.

---

## Original entry (branch stage) — Handover — 26 August 2026, ~19:30 UTC (Drew) — `sourceType` field: opener routing separated from `source` provenance

## What this is
Resolves the field-name collision flagged in the prior entry below (and in the Codex Connector Migration research doc, `begb0037admin/work-inbox` PR #29 branch `claude/outlook-codecs-connector-upgrade-fe3dgf`, Section 9 "Field-name collision found"): the Open-email opener used to key on `t.source==='codex-graph'`, but `source` is a pre-existing human-readable provenance string already populated on all 82 live tasks (drives the card's source badge). Left as-is, a future Phase 2 Codex task-writer setting `source:"codex-graph"` for provenance would have silently also flipped the opener AND clobbered every affected card's badge to the literal text "codex-graph".

## The fix
`js/app.js`'s opener now keys on a new, dedicated, optional field: `t.sourceType==='codex-graph'`. `source` is untouched by opener logic and goes back to being pure human-readable provenance/badge text.

## Field design decision (documented per the task brief)
**`sourceType` is optional; absent means legacy.** No `tasks.json` migration was performed or is needed — this mirrors exactly how `source` itself was originally introduced without back-filling every existing task. Only a future Phase 2 Codex task-writer would ever explicitly set `sourceType:"codex-graph"`. The alternative (writing an explicit `sourceType:"outlook-com"` default onto all 82 live tasks today) was rejected: it would be a `tasks.json` migration for zero behavioural gain, since "absent" and "outlook-com" both currently mean exactly the same thing to the opener, and it would touch a data file the brief explicitly asked to leave alone if reasonably possible.

## Scope guardrails honoured
Schema + opener-logic change only. `fetch_inbox.py` not touched. No Phase 2 / Codex task-writer scoped or started. No task in `data/tasks.json` was given a `sourceType` value or a `source:"codex-graph"` value — confirmed both before and after the change (below).

## State
- **Branch:** `drew/cc-sourcetype-field-26aug` (pushed off `main` at `d759f6c8`). **NOT merged, `main` untouched.**
- **Commits:** `d439b072` (pre-edit backup `Archive/app_backup_20260826_1917.js`, byte-verified identical to live `js/app.js` before any edit — sha `c222a2b3…`, 46612 bytes) → `84c9bffd` (the change: `js/app.js` content sha `397e6d6e4870aa91403efa0aa8fc30647a1abd9b`, 48088 bytes). Pushed content independently re-fetched and byte/sha1-diffed identical to the local edited file before treating the write as confirmed (known `gh api -f content=@file` base64-mangling gotcha worked around via a direct Python `urllib.request` PUT, per `begb0037admin/drew` confirmed-fact memory).
- **Diff:** one file (`js/app.js`), two logic-relevant lines changed (`if(t.source===...)` → `if(t.sourceType===...)`, and the doc-comment line referencing it), plus expanded explanatory comments on both the `emailIcon` assignment and the `openEmailWeb()` doc-comment recording the collision and the fix for a future cold session. `data/tasks.json` untouched — no migration performed.

## Verification (all real, all live-data-based)
1. **Live data check, before the edit:** pulled live `data/tasks.json` fresh from `main` (82 tasks) — 0 have `sourceType`, 0 have `source==='codex-graph'`, all 82 have a `source` value.
2. `node --check js/app.js` — clean, both before and after.
3. **Full DOM-level before/after diff — the actual no-op proof, not an assertion.** Served the *original* (pre-this-change, matching what's currently live on `main`) and the *new* `js/app.js` from two separate local HTTP servers against the identical real 82-task live `tasks.json` (no synthetic data). Rendered both, toggled "Show done" so every task renders, then diffed each of the 82 real tasks' `outerHTML` by `data-id`. **Result: 82/82 byte-identical, 0 differences, 0 console/page errors on either side.** This is the full live population, not a sample.
4. **Synthetic fixture test** (82 real live tasks + 2 synthetic-only test cards, never written to the live file): one card with `sourceType:"codex-graph"` + a `web_link`, one legacy card with only an `entryId`.
   - Codex-graph card: source badge renders the literal provenance text `"Inbox - Test Sender, 2026-08-26 19:00"` — **not** the string "codex-graph" — confirming `source` stayed pure badge text. Clicking its email icon called `window.open(url,'_blank','noopener')` with exactly the stored `web_link`, no page navigation, icon not visually degraded (valid link).
   - Legacy card: icon `onclick="openEmail(event,'<entryId>')"` unchanged; clicking it did **not** call `window.open`, only attempted the (locally unregistered, silently no-op'd) `openmail://<entryId>` navigation — identical to today's live production behaviour.
   - Screenshots: `C:\Users\admin\Downloads\cc-sourcetype-field-26aug\` — `01_real_82_live_tasks_new_appjs.png` (full live board, new code, all 82 real tasks, "Show done" on), `02_fixture_board_today_tier.png` (fixture board default view), `03_codex_graph_synthetic_card.png`, `04_legacy_synthetic_card.png`, `behaviour_proof.json` (the intercepted `window.open` call + badge-text assertions, machine-readable).

## Codex review (mandatory 3-touchpoint, per `agent-commons/operating-model/COORDINATOR_AND_CODEX_POLICY.md`)
Config/rules write-path state re-verified first (per the 26 Aug 2026 audit): `C:\Users\admin\.codex\config.toml` still has no live `[mcp_servers.github]`/`[apps.*]` write path; `C:\Users\admin\.codex\rules\default.rules` still 116 lines with neither of the two bare `git push origin main` / `gh api --method PUT` auto-approve rules present. Holds, not re-litigated.
1. **Plan + diff** — approved, no functional blocker. Independently re-verified the live-data no-op claim itself (its own PowerShell/node check against the live `tasks.json`: 82 total, 0 `sourceType`, 0 `codex-graph` source). 2 non-blocking wording refinements on the code comments — adopted (precision only, no logic change).
2. **End-to-end** — given the full verification evidence above plus a direct re-read of the final file, confirmed independently that the local reviewed file's blob hash matched the pushed branch content sha (`397e6d6e…`). Verdict: **"Yes — safe to merge as-is."** No defect or regression found; noted one minor, non-material methodology point (the DOM-diff doesn't literally click all 82 legacy icons) which direct code reading closes (their handler, `openEmail(event,entryId)`, is untouched and was click-tested via the fixture's legacy card).
3. **Confirmation re-review** — final full re-read of the changed file. **CLEAN, no new findings.**

## Next action for a cold session
1. **Kevin's call:** review the 4 screenshots in `C:\Users\admin\Downloads\cc-sourcetype-field-26aug\` (paths above). If he says "approved"/"merge", merge `drew/cc-sourcetype-field-26aug` → `main` following this repo's established branch-and-merge + Pages-poll + live-byte-diff routine (see the 22 Aug Sophie Levy entry or the 26 Aug opener-merge entry below for the exact sequence), then delete the branch.
2. The doc-side checkpoint (Section 9 append) is committed on `begb0037admin/work-inbox` branch `claude/outlook-codecs-connector-upgrade-fe3dgf` (PR #29) — see that commit for the SHA.
3. Once merged and live, the collision flagged in the entry below is fully closed. Phase 2 / any Codex task-writer still needs its own fresh brief from Kevin before starting — unchanged by this work.

---

# Handover — 26 August 2026, ~10:25 UTC (Drew) — Open-email opener: per-task `source` branch for Codex-connector tasks — MERGED, DEPLOYED, LIVE

**UPDATE ~10:25 UTC — Kevin approved ("Approved - I'm happy with this. Please continue."), merged and deployed.**
- **Merge commit:** `5054906ccfdb9d7ea07d0308b68cf372c0c4a3c2` on `main` (`--no-ff` merge of `drew/cc-codex-graph-opener-26aug`; `main` had not moved since the branch was cut, clean merge, 3 files: `js/app.js` +42/-1, `docs/HANDOVER.md`, `Archive/app_backup_20260826_0910.js`). `data/tasks.json` untouched.
- **Deploy verified:** GitHub Pages build for `5054906` polled to `built`. Live-served `https://begb0037admin.github.io/command-centre/js/app.js` fetched and **`cmp`-checked byte-for-byte identical** to the approved branch-tip content (both 46612 bytes / 1015 CR; Contents API `js/app.js` sha `c222a2b306e7d813a4ad92347da11492a8370bd8` = branch-tip blob = approved). New `openEmailWeb` + `source==='codex-graph'` branch + host allowlist all present in the served file; legacy `openEmail(e,entryId)` → `window.location.href='openmail://'+entryId` byte-unchanged in the served file.
- **Production behaviour re-checked live** (Playwright against the deployed URL, fixture `tasks.json` route-injected onto the production-served code): codex-graph + web_link → `window.open('https://outlook.office.com/owa/?ItemID=…','_blank','noopener')`; codex-graph + no link → the explanatory alert; real production board (no fixture) renders with zero page errors. Screenshots `04_prod_live_board.png`, `05_prod_code_codex_cards.png` in `C:\Users\admin\Downloads\cc-codex-opener-26aug\`.
- **Branch `drew/cc-codex-graph-opener-26aug` deleted** — local and remote.
- **Revert path if ever needed:** `git revert -m 1 5054906` (mainline = pre-merge `main` `08bd346`, `js/app.js` blob `ff31b15a…`), or restore `js/app.js` from `Archive/app_backup_20260826_0910.js`.

**Next action for a cold session:** nothing outstanding on the opener itself — it is live and verified. Do **not** start Phase 2 / any Codex task-writer. The `source`-field collision (below) must be resolved first, and Phase 2 needs its own fresh brief from Kevin. The research doc's own checkpoint is on `begb0037admin/work-inbox` PR #29 branch `claude/outlook-codecs-connector-upgrade-fe3dgf`, Section 9 "Step 1 status".

---

## Original entry (branch stage) — Handover — 26 August 2026, ~09:30 UTC (Drew) — Open-email opener: per-task `source` branch for Codex-connector tasks

## What this is
First "Next Step" from the Codex Connector Migration research doc (`begb0037admin/work-inbox` PR #29, `docs/CODEX_CONNECTOR_MIGRATION_RESEARCH.md`), Section 5 opener design. Command Centre's per-task **Open-email** button now branches on the task's `source`:
- **No `source` / `source:"outlook-com"` / any other value** — completely unchanged. Still `onclick="openEmail(event,'<entryId>')"` → `openmail://<entryId>` → `open_email.py` → Outlook COM `GetItemFromID`. `openEmail()` in `js/app.js` is byte-for-byte the original.
- **`source:"codex-graph"`** (set only by future Codex task-creation logic — nothing writes it today) — new `openEmailWeb()` opens the connector's `web_link` (snake_case; `display_url` as fallback) as a plain new-tab hyperlink to Outlook Web Access. `GetItemFromID` is never called for these.
  - each candidate link validated independently; only `https://` on `outlook.office.com` / `outlook.office365.com` is followed
  - missing / non-https / unrecognised-host / no-link → visibly de-emphasised button (`opacity:.45`) + explanatory `alert()` on click. Never a silent no-op, never a throw.
  - task id read from the card's `data-id` via the clicked element — nothing task-controlled is interpolated into the inline handler.

## Scope guardrails honoured
Purely additive, parallel coexistence. **No** cutover, **no** removal of the COM path, **no** `data/tasks.json` migration (no task gets a `source` value written by this work), **no** `fetch_inbox.py` change, **no** AI-triage / Phase 2 work. One file touched: `js/app.js`.

## Known data-model wrinkle flagged for Phase 2 (NOT fixed here — out of scope)
`source` is **already** a populated field on all 80 live tasks — a human-readable provenance string ("Inbox - Simon Burford, 2026-08-19 15:51", "manual", "H&S Roadmap 08/06", …) that also drives the small source badge on each card. The research doc Section 5 assumed `source` was a *new* field. The opener keys strictly on `source === "codex-graph"` (0 of 80 existing tasks have that value — verified), so the opener itself is regression-safe. But when a Codex task-writer goes live and sets `source:"codex-graph"`, that task loses its human-readable provenance badge (or the badge renders the literal text "codex-graph"). **Before any Codex task-creation logic ships, Phase 2 must separate the machine routing discriminator from the human-readable provenance** — e.g. a dedicated `mailOpener`/`sourceType` field, or move provenance to `emailRef`/`origin`. Recommendation only; Kevin/Lauren's call.

## State
- **Branch:** `drew/cc-codex-graph-opener-26aug` (pushed). **NOT merged. `main` is untouched** — `js/app.js` on `main` still content sha `ff31b15a…`, size 44238.
- **Commits:** `0e937b1` (pre-edit backup `Archive/app_backup_20260826_0910.js`) → `ad571b2` (the change). Pushed `js/app.js` content sha `c222a2b3…`, size 46612 — verified equal to the local blob.
- **Backup-and-verify:** done in full. Pre-edit backup `Archive/app_backup_20260826_0910.js` committed (`0e937b1`) and byte-verified (sha1 `6f76f64c…`, identical to the pre-change `js/app.js`) before any edit.

## Verification run (all green)
- `node --check js/app.js` — clean.
- **33/33 logic assertions** (`opener_logic_test.js`) — extracts the *real* `openEmail`/`openEmailWeb` bodies and the *real* `emailIcon` render snippet from `js/app.js`, asserts every branch: legacy path byte-unchanged for descriptive-source / explicit-`outlook-com` / no-`source` / empty-`source` tasks; codex-graph web_link + display_url fallback; invalid `web_link` no longer suppresses a valid `display_url`; `javascript:` and non-allowlisted https hosts (userinfo spoof `outlook.office.com@evil.example`, subdomain spoof, path spoof, plain http) all rejected → alert; missing card / null `closest()` safe no-op; hostile task id cannot appear in the handler.
- **Live Playwright run** against the real edited file with a fixture `tasks.json` (request-intercepted), 6 cards: existing descriptive-source and explicit `outlook-com` tasks → no `window.open`, no navigation (legacy `openmail://` path); codex-graph + web_link → `window.open(<OWA email URL>, '_blank', 'noopener')`; codex-graph + display_url only → `window.open(<OWA calendar URL>, …)`; codex-graph no link → native alert, no tab, no throw, button `opacity:.45`; codex-graph non-allowlisted host → native alert, rejected.
- **Screenshots** (Kevin approves from these): `01_board_overview.png` (whole dashboard renders fine with the fixture), `02_today_cards.png` (the 6 cards; degraded button visibly faded), `03_behaviour_proof.png` (rendered board + a table of what every button did on click). Saved outside the repo — see the session checkpoint for the exact path.

## Codex review (mandatory 3-touchpoint, per `agent-commons/operating-model/COORDINATOR_AND_CODEX_POLICY.md`)
Config write-path safety re-verified first: both paths from the 2026-08-25 incident (`[mcp_servers.github]`, `apps.connector_76869538…` auto-approvals) still commented out in `C:\Users\admin\.codex\config.toml`. 3 passes, `codex exec -s read-only`:
1. **Plan + diff** — 4 findings. F1 validate Graph URL before `window.open` → adopted (https-only + host allowlist). F2 keep the legacy opener literally, separate handler for codex-graph → adopted (`openEmail` restored verbatim, new `openEmailWeb`). F3 honest semantics for the unavailable control → partially adopted (de-emphasised + clickable + explanatory alert, not fully-disabled; reasoned: minimal-footprint task). F4 CRLF "trailing whitespace" on added lines → not a defect (the file is CRLF-committed — blob `ff31b15a` has 973 CR for 973 lines; added lines match; `git diff --check` flags every existing line the same way).
2. **End-to-end** — 3 findings, all adopted: task-id injection via inline `onclick` (blocker) → id no longer interpolated, read from `data-id` via `this`; invalid `web_link` suppressing a valid `display_url` → each candidate validated independently; https guard allowed arbitrary hosts → exact-hostname allowlist.
3. **Confirmation re-review** — all 3 resolved, no new regression, 33/33 + `node --check` confirmed. Clean.

## Next action for a cold session
1. **Kevin's call:** review `03_behaviour_proof.png` + `02_today_cards.png`. If he says "approved"/"merge", merge `drew/cc-codex-graph-opener-26aug` → `main` following this repo's branch-and-merge + Pages-poll + live-byte-diff routine (see the 22 Aug Sophie Levy entry for the exact sequence), then delete the branch.
2. The doc-side checkpoint (Section 9 status) is committed on `begb0037admin/work-inbox` branch `claude/outlook-codecs-connector-upgrade-fe3dgf` (PR #29) — see the session checkpoint for the SHA.
3. **Do not** start Phase 2 / any Codex task-writer. The `source`-field collision above must be resolved first, and Phase 2 needs its own fresh brief from Kevin (research doc is explicit).

---

# Handover — 25 August 2026, ~11:20 UTC (Drew) — 2 tasks added from Sickness Absence Data Catch-up (21 Aug 2026 Granola meeting)

## What this was
Kevin flagged that two action items from the Sickness Absence Data Catch-up (21 Aug 2026 Granola meeting) were never added to command-centre, which is why they never surfaced in a "This Week" view. Added both as new tasks in `data/tasks.json`, tier `week`:
1. `task-1787652746063` — "Confirm approximate FA validation effort per department with Michael (capacity check)". Owner Kevin, Michael as dependency/collaborator. Was logged in the Granola meeting as pending until Michael's return; Michael was due back Tue 25 Aug 2026, so as of today it's actionable, not a placeholder. Feeds into Marie/Ant's BA-effort estimate and David White's funding ask for department-by-department validation.
2. `task-1787652746064` — "Check project folders for unhanded-over WFM/SBS 'second batch' sickness data files (Smith's School, Geography)". Owner Kevin. Open since the 11 Aug 2026 working group, no hard date, due this week per Kevin's flag.

## Process followed
Full backup-and-verify sequence: live GET of `data/tasks.json` (77 tasks, 165084 bytes, sha `7d79e390...`) confirmed non-zero; new `Archive/tasks_backup_20260825_1011.json` backup committed and independently re-verified by SHA (today's earlier `tasks_backup_20260825_0808.json` predated the same-day PDR task addition and was no longer an accurate restore point for this write, so a fresh one was taken rather than relying on the "one per day" default).

This was also the first real end-to-end run of the local-render-then-screenshot-then-hold-for-approval procedure designed earlier today (see `docs/HANDOVER.md`'s prior PDR-task entry below and `begb0037admin/drew` confirmed-fact memory `2026-08-25-command-centre-local-render-screenshot-procedure-verified-working`): fetched live `index.html`/`css/styles.css`/`js/api.js`/`js/app.js` into scratch, patched a scratch-only copy of `api.js` so `loadTasks()`/`fetchTasksRemote()` resolved to a local draft `data/tasks.json` (79 tasks) instead of the live GitHub URLs, served it locally, and screenshotted with headless Chrome (`--window-size` set tall enough to capture the full This Week column without scrolling) plus a DOM-dump grep as a second, non-visual confirmation. This Week counter read 31 in the draft render (29 live + 2 new), matching expectation.

Kevin required the actual screenshot file path, not a description, before approving (per his standing accessibility requirement) — gave the coordinator the exact scratch PNG paths, which were relayed to him directly. Only after his literal "approved" did the sha-guarded PUT run against the live repo; fresh sha re-checked immediately before the write (unchanged from the backup step — confirmed no other write landed in between), post-write sha (`7246cd0...`) re-verified independently via a fresh GET, and both task ids confirmed present via a cache-busted `raw.githubusercontent.com` fetch (same source api.js's `fetchTasksRemote()` hits).

## Next action
None outstanding for this task — both tasks are live and confirmed on `begb0037admin.github.io/command-centre/` (This Week tier). Note in passing: the PDR-task session earlier today (below) does not appear to have updated this file at the time — flagging for awareness, not backfilled here since it's out of this task's scope.

---

# Handover — 21 August 2026, ~17:13 UTC (Drew) — Duplicate-pair data cleanup — final item of stability plan, CLOSED

## What this was
The last outstanding item from the very first exhaustive sweep (originally scoped "Phase 3 (Low)"): merge the 2 confirmed genuine duplicate task pairs in `data/tasks.json`. A one-time data cleanup, not a code change — no `index.html`/`css/styles.css`/`js/app.js`/`js/api.js` touched. This closes out the whole work-inbox/command-centre stability plan (Phase 1 scroll-out/drag-drop, Phase 2 silent-failure toasts/race-fix/staleness-clock, Phase 3 done-sync — all already merged/deployed/verified per prior entries above).

## Re-verification (done live before touching anything, not assumed from the original sweep)
Pulled live `data/tasks.json` fresh (sha `780bb7123e5f1c774e04a0279231a7ccbb0cb307`) and re-read full descriptions, not just titles:
1. **"Review outstanding Development Insight reports actions with Julie"** — `task-1785700344174` (dateAdded 02 Aug) and `task-1785704715215` (dateAdded 02 Aug). Descriptions byte-identical. Confirmed still a genuine duplicate.
2. **GLAM 38-day-balance pair** — `t2608111507360` ("Advise on GLAM joining 38-day balance departments scheme", dateAdded 11 Aug) and `t2608120903060` ("Advise Marie on GLAM joining 38-day balance scheme", dateAdded 12 Aug). Descriptions byte-identical. Same IDs already named in `begb0037admin/drew` `memory/cc-cleanup-items-5-8-build-12aug.md` (item 6, 12 Aug) as the live duplicate pair used to calibrate the fuzzy-title dedup guard added to `fetch_inbox.py` that day — confirmed still present, unmerged, exactly as that entry left them.

No other duplicate titles found anywhere else in the file (checked programmatically across all 77 live tasks before editing).

## Tick/done-state check before merging (Phase 3 done-sync is live — checked for real, not assumed safe)
Pulled live `work-inbox/data/ticks.json` (`updated_at: 2026-08-21T12:16:04.250Z`) and checked all 4 candidate task IDs and their `entryId`s against every `id_`/`eid_` key present:
- `task-1785700344174` — no `entryId` field, no `id_task-1785700344174` key in ticks.json. No tick reference. Safe to remove.
- `task-1785704715215` — **carries a live tick**: `eid_...7ADFE8F410000` (its own `entryId`, unique to this task — no other live task shares it) is `true` in ticks.json. This predates the Phase 3 done-sync deploy (ticks.json's `updated_at` 12:16 UTC vs. the Worker deploy ~17:00 UTC same day), so it's a pre-existing WI-side "done" state never synced back to `tasks.json.done` — unrelated to this cleanup, not fixed here (out of scope), but the important thing for this task: **kept this record and its exact `entryId` unchanged**, so the tick reference is not orphaned.
- `t2608111507360` and `t2608120903060` — neither's `entryId` nor `id_`/`eid_` form appears anywhere in ticks.json. No tick state either side. Safe to merge/remove.
- Neither task in either pair had `"done": true` in `tasks.json` itself.

## What was kept vs. removed, and why
1. **Development Insight pair** — kept `task-1785704715215`, removed `task-1785700344174`.
   - Reason: more actions (3 vs 3, but more recent — latest action 21 Aug vs 20 Aug), its first action correctly sources the actual originating email (Julie Hickman's own "Re: My Development Insight reports"), and its `entryId` is the target of the live tick above — keeping it avoids orphaning that state.
   - The two actions unique to the removed task (Lindsey Spriggs' CDR/PD reminder, the KPI-presentation share) were **merged in**, not lost — appended to the kept task's `actions[]` in chronological order, plus a new dated action recording the merge itself for audit trail.
2. **GLAM pair** — kept `t2608111507360`, removed `t2608120903060`.
   - Reason: 5 actions vs. 2, most recent action 18 Aug vs. 12 Aug. The removed task's 2 actions were the same 11–12 Aug email thread already fully captured (one day later, narrated from Marie's side instead of Julie's) — no new information, so nothing to merge in beyond a dated audit-trail note.

`tasks.json` count: 77 → 75.

## Backup-and-verify sequence (full mandatory protocol, both files)
| File | Pre-edit live SHA | Backup path | Backup SHA re-verified |
|---|---|---|---|
| `data/tasks.json` | `780bb7123e5f1c774e04a0279231a7ccbb0cb307` (161983 bytes) | `Archive/tasks_backup_20260821_1713.json` | `780bb712...` (byte-identical, re-GET confirmed) |
| `docs/HANDOVER.md` | `1bd854aea3265cd9e5a1c2ff184f3da642a070f8` (83835 bytes) | `Archive/HANDOVER_backup_20260821_1713.md` | `1bd854ae...` (byte-identical, re-GET confirmed) |

`data/tasks.json` write: sha-guarded PUT against the confirmed-fresh sha above → new sha `10d3c6090331998be62e70255b26dfb0c5a733a2`, commit `dbb248a39b3b11ad03fa7d1d9f2aaac8cab982f6`.

## Live verification after write
- Re-GET of `data/tasks.json` via the Contents API: 75 tasks, both removed IDs absent, both kept tasks present and intact (kept Dev-Insight task has 6 actions — 5 substantive + 1 merge-audit note; kept GLAM task has 6 actions — 5 + 1 merge-audit note), zero duplicate titles anywhere in the file.
- **Live proxy check** (`https://github-proxy.lelitte.co.uk/command-centre/data/tasks.json`, cache-busted) — the actual endpoint the dashboard's JS fetches from: 75 tasks, same result confirmed independently of the raw Contents API.
- **Live dashboard screenshot** (`https://begb0037admin.github.io/command-centre/`, headless Chrome, real render): "Review outstanding Development Insight reports actions with Julie" appears exactly once under This Week. Header tier counts (Today 5 / Tomorrow 9 / Week 32 / Parked 9 = 55 shown, "Show done (20)") reconcile exactly against the raw done/non-done split in the merged file (12/15/38/10 raw = 75 total, minus 20 done = 55) — confirms the merge didn't disturb done-state counting anywhere.
- **work-inbox side**: `data/briefing.json` (last refreshed 21 Aug 18:02, i.e. *before* this edit) still contains both removed IDs and both duplicate titles in its Priorities-board mirror. **This is expected, pre-existing propagation behaviour, not a break introduced here** — the WI-side title mirror is regenerated fresh from `tasks.json` by `fetch_inbox.py`'s CC-mirror block on its own schedule (6×/day), not live-pushed on a CC edit (that's a separate, narrower mechanism — the Phase 3 done/tick sync via the Worker — which has no bearing on these 4 IDs, confirmed above). It will self-correct at the next scheduled pipeline run with no action needed. Did not trigger an out-of-cycle pipeline run for this — a full 6-phase Outlook COM re-triage is a materially bigger, unrelated action than a low-risk data cleanup calls for.

## Revert plan
`Archive/tasks_backup_20260821_1713.json` is a byte-identical snapshot of live `tasks.json` immediately before this edit (verified above). To revert: GET this repo's current `data/tasks.json` sha, then `PUT` the Archive file's content back onto `data/tasks.json` against that sha. This restores both duplicate pairs exactly as they were, including `task-1785700344174`'s original 3 actions and `t2608120903060`'s original 2 actions — nothing was destructively altered before the backup was taken and verified. No Worker/code change was involved, so no `wrangler rollback` or client-code revert applies here.

## Not done / next action
Nothing outstanding. This was the last item of the stability plan Kevin approved. work-inbox's `briefing.json` mirror will pick up the corrected task list at its next scheduled `fetch_inbox.py` run (self-correcting, no manual step needed).

---

# Handover — 21 August 2026, ~17:05 UTC (Drew) — Phase 3 MERGED + Worker DEPLOYED, verified live

## What shipped
- Merged `phase3-donesync-21aug` (tip `c25eadf5f`) into `main` — merge commit `8f782c7e0f32fd35c9a1dfbfbbc0d8ca4fa7f587`. Touched `js/api.js`, `cloudflare-worker/cc-tasks-writer-proposed.js`, `cloudflare-worker/test_phase3_donesync.mjs`, `docs/HANDOVER.md`.
- Deployed the merged `cc-tasks-writer-proposed.js` to the live Cloudflare Worker `cc-tasks-writer` via `wrangler deploy` — new version `d50c44a6-fdd8-4063-9c42-f1a0ac761c68`, message "Phase 3: baseSha race-fix for handleInboxState (ticks.json) + bidirectional done-sync...".

## Worker deploy mechanism — resolved, not previously confirmed
Kevin's question: does `wrangler deploy` actually work for CODE on this Worker (only secret rotation had been confirmed before today), or is manual dashboard paste still required? **Resolved with real evidence, not assumption:**
1. The Worker's OWN live script (fetched via `GET /accounts/.../workers/scripts/cc-tasks-writer` before touching anything) already carried esbuild `__name`/`__defProp` bundling artifacts on the "Phase 2" version deployed 20 Aug — circumstantial evidence a wrangler deploy had already happened, not conclusive on its own.
2. **Decisive test, zero risk to production**: built a disposable throwaway Worker (`drew-wrangler-secret-test`), set a test secret via `wrangler secret put`, confirmed it functional, then deployed a SECOND, different script body via `wrangler deploy` with no `wrangler.toml` and no bindings declared on the command line. The secret survived BOTH in `wrangler secret list` AND functionally (worker returned the exact 18-char secret value unchanged) after the code-only redeploy. Deleted the throwaway worker once proven.
3. Confirmed this Worker (`cc-tasks-writer`) has exactly 2 bindings, both secrets (`ANTHROPIC_API_KEY`, `HRIS_GITHUB_PAT`), no KV/D1/other bindings a bare `wrangler deploy` could silently drop — checked via the Cloudflare API's script-settings endpoint before deploying.
4. Deployed for real: `wrangler deploy cloudflare-worker/cc-tasks-writer-proposed.js --name cc-tasks-writer --compatibility-date 2024-09-01 --message "..."`. Post-deploy, both secrets confirmed still present (`wrangler secret list`) and functionally verified via the live round-trip tests below.

**Conclusion for future sessions: `wrangler deploy --name cc-tasks-writer --compatibility-date 2024-09-01` is a confirmed-working, safe path for future code-only deploys to this Worker.** No `wrangler.toml` exists or is needed; don't create one casually — a toml declaring an empty binding list could behave differently to a bare CLI deploy. This session only confirmed the no-toml, bare-CLI path.

## Live verification, not just "it deployed"
- `wrangler deployments list --name cc-tasks-writer` shows the new version at 100%, dated 2026-08-21T17:00:56Z, message intact.
- Fetched the live served script content directly (`GET /workers/scripts/cc-tasks-writer`) post-deploy: confirmed `knownStaleClient`/`baseSha` handling present in BOTH `handleTasks` and `handleInboxState`, and confirmed it differs (byte-diff) from the pre-deploy restore-point bundle.
- **Live functional round-trip, both routes, non-destructive** (same pattern as the 16 Aug PAT-rotation verification):
  - `data/tasks.json` (command-centre): GET live (77 tasks, sha `f1bda744...`), POSTed back through `handleTasks` with matching `baseSha` → `{"ok":true,"merged":false,"attempts":1,"sha":"780bb712...","doneSynced":[]}`. Real new commit landed: `39b7d0dd`, correct isolated identity `kevinlelitteadmin`.
  - `data/ticks.json` (work-inbox): GET live (sha `1fc9b147...`), POSTed back through the `inbox-state` route with matching `baseSha` → `{"ok":true,"merged":false,"attempts":1,"sha":"1fc9b147...","doneSynced":[]}`. Sha came back unchanged because the content round-tripped byte-identical — GitHub's Contents API made no new commit for a genuinely no-op write (contrast with the CC side, which DID produce a new commit due to JSON re-serialization differences) — both are the expected outcome for their respective inputs, not a stub response.
  - **Checked before running the ticks.json round-trip**: `ticks.json` already carried real `id_t002`/`id_t006`/`id_t016`/`id_t031` keys (true) from Kevin's own live activity earlier today (12:13–12:16 UTC), matching the 21 Aug scoping report's finding #5. Confirmed all four tasks are ALREADY `done:true` in live `tasks.json` before running the test, so the round-trip's `doneSynced:[]` result is a genuine no-op (no fresh transition to sync), not a masked side effect.

## Backup-and-verify sequence, this session
| File | Pre-merge live SHA | Backup path | Backup SHA re-verified |
|---|---|---|---|
| `js/api.js` | `463e42d1fc3a678b495819119a94051bc3ac5424` (4789 bytes) | `Archive/api_backup_20260821_1425.js` | byte-identical, re-GET confirmed |
| `cloudflare-worker/cc-tasks-writer-proposed.js` | `b2c4753951ad288811e8e0d932275e802a31f22a` (30681 bytes) | `Archive/cc-tasks-writer-proposed_backup_20260821_1425.js` | byte-identical, re-GET confirmed |
| `docs/HANDOVER.md` | `33b1fe8d2e81bc7ae0c5f8a215064b9a9216500a` (64059 bytes) | `Archive/HANDOVER_backup_20260821_1425.md` | byte-identical, re-GET confirmed |

Plus the Worker's own pre-deploy live bundle saved locally this session (`RESTORE_POINT_pre-phase3-live-bundle.js`, scratchpad only, not committed — the Archive backup above is the durable copy of the source; the served bundle is regenerable from it via the same `wrangler deploy` command).

## Revert plan — two independent paths, both validated
1. **Worker code only**: `wrangler rollback --name cc-tasks-writer --version-id f597a375-ef5b-4448-b594-802e7412f713` — one command, restores the exact pre-Phase-3 "Phase 2" version. Command syntax confirmed available (`wrangler rollback --help`) but not executed (nothing to roll back from as of this entry).
2. **Repo code**: `git revert` of merge commit `8f782c7e0f32fd35c9a1dfbfbbc0d8ca4fa7f587` on `main`, or a sha-guarded PUT of `Archive/api_backup_20260821_1425.js`'s content back onto `js/api.js`. Reverting the client (`js/api.js`) alone without rolling back the Worker is safe — the Worker already treats a missing `baseSha` as "no staleness check possible" (its pre-Phase-3 behaviour).
3. Reverting the Worker alone without touching client code is also safe — an old client simply never sends `baseSha`, which the current (or rolled-back) Worker both handle as optional/absent.

## Branch cleanup
`phase3-donesync-21aug` deleted from both `command-centre` and `work-inbox` after this entry, now that main is confirmed live and matches in both repos.

---

# Handover — 21 August 2026, ~15:15 UTC (Drew) — Phase 3: ticks.json race-window closed + bidirectional done-sync — STAGED, NOT MERGED

## Scope
Kevin's work-inbox/command-centre stability plan, Phase 3, following his sign-off on the design questions raised in the 21 Aug scoping report (`begb0037admin/drew` `memory/wi-cc-phase3-donesync-scoping-21aug.md`). Two things, built in the required order (race-fix first, done-sync on top):

1. **Closed the ticks.json race-window gap.** Phase 2 (20 Aug) closed this Worker's own millisecond GET-to-PUT race for both `tasks.json` (`handleTasks`) and `ticks.json` (`handleInboxState`, via `mergeTicks`), but the much larger "a browser tab was open for minutes while something else wrote in the meantime" gap only ever had a server-side `baseSha` check for `tasks.json` — the client-side half was written for `tasks.json` alone. `handleInboxState` now accepts the same optional `baseSha` and merges via `mergeTicks` whenever it's stale relative to the freshly-read remote sha, and both routes now return the new blob `sha` in their success response.
2. **Bidirectional done-sync.** Marking a task done/undone in either system now reversibly flags it done/hidden in the other, for the tiers/items that structurally exist in both. Flag-and-hide only — never deletion, matching how "done" already works in both systems.

## What shipped (all on branch `phase3-donesync-21aug`, NOT merged to main)

### `cloudflare-worker/cc-tasks-writer-proposed.js` — this IS the live-deployed source
Confirmed via a prior session's `wrangler deployments list` (see `drew/memory/wi-phase2-silentfail-finish-ticksretry-correction-21aug.md`) that this file, not just its stale 2 Aug "NOT YET DEPLOYED" header comment, is what's actually running — updated that header note in the same commit.

- `handleInboxState` gained the `baseSha` parameter and `knownStaleClient` check, mirroring `handleTasks`. Both routes now also return `sha` (the new blob sha) in their `200` response.
- New: `ccDoneSyncKey`, `findTaskByEntryId`, `findTaskById`, `syncTaskDoneToTicks` (CC→WI), `syncTickToTaskDone` (WI→CC). Full key-scheme and loop-safety reasoning is in the code comments immediately above `handleTasks` — not repeated here. Short version:
  - **Key scheme** (read live from work-inbox's `_priGetKey()`, not guessed): a WI Priorities-board card is keyed `'id_<ccTaskId>'` if mirrored from a live CC task (fetch_inbox.py's CC-mirror block never carries `entry_id`/`entryId`, only `id` — confirmed by reading that code directly), or `'eid_<entry_id>'` for a raw-email-sourced item. CC→WI sync always targets `id_<task.id>`, skipped entirely when `tier==='parked'` (no WI counterpart exists — finding 7 of the scoping report). WI→CC sync parses the tick key's own prefix: `id_` → direct task-id match; `eid_` → match on `task.entryId`, skipped (not guessed) if 0 or >1 tasks share that entryId.
  - **Anti-echo/ping-pong prevention**: not a tag on the data (booleans have no room for one) — both directions act only on a genuine value TRANSITION versus a freshly-read copy of the *other* file, read fresh in the same request immediately before the derived write. Once both files agree, a resend of the same value is a no-op in both directions; the derived-write helpers call a plain internal function directly, never the other route's own handler, so there is no code path for a derived write to trigger a further derived write. Loop-safe by construction, not just by luck — see the ping-pong test below.
  - Both sync helpers are best-effort with their own bounded 3-attempt retry, and can never fail or roll back the primary write that already succeeded.

### `js/api.js`
- `_tasksBaseSha` / `refreshTasksBaseSha()`: one direct, unauthenticated GitHub Contents API call per page load (inside `loadTasks()`, not on any poll) to capture sha+content together. **Verified live this session, not assumed:** `curl -I` against `raw.githubusercontent.com/.../data/tasks.json` returns an `ETag` that is a 64-hex-char SHA-256 of the raw bytes — NOT GitHub's 40-hex-char blob SHA-1 that the Contents API's `sha` field and PUT conflict-check actually use. The two are computed differently and are not interchangeable, so the originally-sketched "cheap" option (a) in the Worker file's own PHASE 2 notes does not work; option (b) (direct Contents API call) is what's built.
- `persistTasks()` now sends `baseSha` and updates `_tasksBaseSha` from the Worker's own returned `sha` afterwards (no second fetch needed).
- **`syncDoneToInbox()` removed, not repaired** (decision documented in the commit body and inline in the file): it computed WI tick keys via the pre-17-Aug date-scoped position scheme (`dateKey+'_pri_'+tier+'_'+i`), which work-inbox moved away from specifically because it silently detaches from its card on any reorder (the 17 Aug tick-resurrection incident) — reviving it as-is would have re-shipped that exact bug for every sync-driven tick. It was also already dead code (confirmed live: `toggleDone()` never called it). Repairing it would have meant rewriting it entirely against the current `eid_`/`id_` scheme — which is exactly what the Worker-side `syncTaskDoneToTicks()` now does instead, from one place shared by both repos' write paths, rather than a second, divergence-prone client implementation that also depended on a fragile direct cross-origin fetch of work-inbox's `briefing.json` from this page.

## Verification
**Synthetic only, per the task's explicit constraint — no live `tasks.json`/`ticks.json` read or written by any of this testing.** `cloudflare-worker/test_phase3_donesync.mjs` (committed to this branch) imports the actual `cc-tasks-writer-proposed.js` — not a reimplementation — against an in-memory fake of the GitHub Contents API. 9/9 passing:
1. CC task done (tier=today) → WI tick `id_<id>` set true.
2. CC task done (tier=parked) → **no** sync target, ticks.json untouched (confirms the tier-scoping is real, not just asserted).
3. WI tick `id_<taskId>` → CC task `done=true`, direct match.
4. WI tick `eid_<entryId>` → CC task carrying that `entryId` → `done=true`.
5. WI tick `eid_` matching 2 CC tasks → skipped, neither task touched (ambiguity handled, not guessed).
6. Un-ticking `id_<taskId>` in WI → CC task flips back to `done=false`, task still exists (reversible, never deleted).
7. **RACE**: a client with a stale `baseSha` for `ticks.json`, where a second writer landed in between → `merged:true`, the concurrent writer's key survives, the stale client's own explicit action still lands.
8. **RACE**: same for `tasks.json` (a concurrent Phase 3.6 auto-add survives a stale-client merge), plus confirms done-sync still fires correctly off the merged result.
9. **PING-PONG SAFETY**: resending an already-synced value (`true→true`) produces zero further writes — `tasks.json`'s blob sha is confirmed byte-for-byte unchanged.

**Visual before/after, screenshotted and shown to Kevin for sign-off** (not yet given as of this entry): a local static-file harness (live `index.html`/`css/styles.css`/`js/app.js`/`js/api.js`, `PROXY` pointed at a local relative path, synthetic `data/tasks.json` only — command-centre's live data was never read or written by this harness) plus the equivalent work-inbox harness (`BRIEFING_API`/`TICKS_URL` pointed at local files, synthetic `briefing.json`), served via `python -m http.server` and screenshotted with real headless Chrome (`--headless=new --virtual-time-budget=6000`, matching the method established in the 21 Aug tier-grid session). Two synthetic demo tasks (`tDEMO001`/`tDEMO002`, tier `week`) mirrored into both harnesses:
- **Before**: both cards visible/unchecked in both dashboards.
- **After**: `data/tasks.json` in the CC harness set `tDEMO001.done=true` (simulating Kevin clicking done in command-centre); `data/ticks.json` in the WI harness set to **exactly** the content `syncTaskDoneToTicks()` is proven (by test 1 above) to produce (`{"id_tDEMO001":true}`) — i.e. the WI-side "after" state shown is the Worker's actual verified output, not a hand-guessed mockup. Result: `tDEMO001`'s card disappears from "Priority Actions – This Week" in work-inbox, exactly as `isTicked()`'s existing hide logic already does for any other tick — while `tDEMO002` stays untouched in both. CC's own "This Week" tier count and "Show done (1)" toggle updates correctly.

**Observed, out of scope, not touched:** the WI Priorities-board header count next to "PRIORITY ACTIONS – THIS WEEK" is the raw `priSecs.pw.length` (`renderPriorityCards` caller, ~line 1049) — it does **not** subtract ticked/hidden items, unlike command-centre's own tier header (which does filter `done` tasks). This is pre-existing behaviour, unrelated to this session's change (confirmed by reading the render code — the count was never wired to tick state at all), and out of the scope Kevin asked for here. Flagging only, not fixed.

**Interaction with the existing "done tasks aren't re-mirrored" behaviour**: `fetch_inbox.py`'s CC-mirror block already skips `done:true` tasks when building `prioritiesToday/Tomorrow/Week` (~line 1571). This session's sync is a genuinely separate, complementary mechanism — it makes the *already-open* WI page reflect a CC-side done action immediately (via ticks.json), whereas the fetch_inbox.py skip only takes effect the next time the pipeline runs (6×/day) and the page is reloaded. Both can be true at once with no conflict.

## Backup-and-verify (both files, full mandatory sequence)
| File | Pre-edit live SHA | Backup path | Backup commit | Backup SHA re-verified |
|---|---|---|---|---|
| `js/api.js` | `463e42d1fc3a678b495819119a94051bc3ac5424` (4789 bytes) | `Archive/api_backup_20260821_1404.js` | `2f74585de0725ac33813df8b43d4d8c823492fb0` | `463e42d1...` (byte-identical, re-GET confirmed) |
| `cloudflare-worker/cc-tasks-writer-proposed.js` | `b2c4753951ad288811e8e0d932275e802a31f22a` (30681 bytes) | `Archive/cc-tasks-writer-proposed_backup_20260821_1404.js` | `57936ad62c0162eb61d6e2150f1309f272e6b35c` | `b2c4753951...` (byte-identical, re-GET confirmed) |

Both backup commits landed directly on `main` (pure additions, no risk), per this repo's established practice of committing backups immediately while the actual edit goes to a holding branch. **`main`'s own copies of both files re-verified unchanged after the branch push**: `js/api.js` still `463e42d1...`, worker file still `b2c4753951...` — confirmed via a fresh GET, not assumed.

## Branch / merge status
Staged on `phase3-donesync-21aug` (this repo) — tip `b0c0a9facd432c19ad5b99f700e908230cec5cf3` — and the matching branch of the same name in `work-inbox` — tip `bc41de4f08ead5bffaf6f5b95c3ed7554f8da1e5`. **NOT merged to main in either repo.** Per this repo's UI approval gate, waiting on Kevin's literal "approved" on the before/after screenshots before any merge.

## Revert plan — validated, not just described
If Kevin does not approve, or a live problem is found after merge: sha-guarded `PUT` of `Archive/api_backup_20260821_1404.js`'s content back onto `js/api.js`, and `Archive/cc-tasks-writer-proposed_backup_20260821_1404.js`'s content back onto `cloudflare-worker/cc-tasks-writer-proposed.js`, each against `main`'s then-current sha. Both backups are confirmed byte-identical to the exact pre-change live content (see table above), so this is a clean revert with no partial-state risk. **If already deployed to the live Worker** (deployment itself is a separate manual step — see the file's own header note on the deploy mechanism): re-paste the reverted file content into the Cloudflare dashboard and redeploy, or `wrangler secret put`-style rollback does not apply here since no secret changed, only code — a straight redeploy of the reverted file is the correct path.

## Not done / next action
- Screenshots taken and described above; **awaiting Kevin's literal "approved"** before merging either branch to main or deploying the Worker change live.
- No live `tasks.json`/`ticks.json` write of any kind was made by this session — everything above is either a branch commit or a synthetic/local test.
- Once approved: merge both branches, then Kevin (or a session with confirmed `wrangler deploy` access for this Worker) deploys the updated `cc-tasks-writer-proposed.js` content live — the client-side `js/api.js`/`js/app.js` changes take effect immediately on merge (static GitHub Pages), but the *server-side* baseSha/done-sync logic needs that separate deploy step to actually run.



## What shipped
Kevin approved this UI change directly to the coordinator earlier in the day (screenshots shown, he typed "yes"); a prior Drew session designed/tested/screenshotted it but expired before pushing. This session rebuilt it from scratch against current live state (re-verified `#tierGrid`, the four `.sec-head` divs, and `toggleFocusZone` still existed as described — they did) and shipped it. Not a re-negotiation of the design — only re-verified against live code before writing.

Two pieces, both live on `main` now:
1. **2x2 grid** — `#tierGrid{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}` (+ `@media(max-width:1024px)` single-column fallback), mirroring work-inbox's own `.inbox-grid` rule byte-for-byte on the grid properties. Today/Tomorrow now sit side by side on top, This Week/Parked side by side underneath. No markup reordering needed — `#tierGrid`'s four `.tier-section` children were already in that DOM order.
2. **Collapse/expand per tier** — each `.sec-head` (Today/Tomorrow/This Week/Parked) got an `id`, `onclick="toggleTierSection('<tier>')"`, and a trailing `.sec-chevron` span, mirroring the existing `toggleFocusZone`/`.focus-chevron` sidebar pattern. New `js/app.js` functions `getTierCollapseState`/`applyTierCollapse`/`toggleTierSection`/`initTierCollapse`, localStorage key `commandCentre_tierCollapse_v1` (`{today,tomorrow,week,parked}` booleans), same var/get/save shape as `DONE_KEY`/`QL_KEY`. Collapse hides the card body via `.tier-section.sec-collapsed>[id^="tier-"]{display:none}` — a CSS rule keyed off a class toggled on the `.tier-section` wrapper (`#sec-wrap-<tier>`), **not** on the drop-zone divs themselves, so `#tier-today` etc. (and their `ondragover`/`ondragleave`/`ondrop` handlers) stay byte-identical to before. `initTierCollapse()` called once in the INIT block, after `renderCustomLinks()`, before `loadTasks()`.

## Live-state drift caught mid-task
Bootstrap fetch of `js/app.js` predated this session's own Phase 2 item 3 merge (see entry below) landing on `main`. Built the tier-collapse edit against the stale copy first, then re-GET'd `js/app.js` immediately before backup/write, found the SHA had moved (`3eea204c...`, 42098 bytes, containing the staleness-clock fix), and rebuilt the same two edits (TIER SECTION COLLAPSE block + `initTierCollapse()` call) on top of the *current* content instead of overwriting it. Diffed the rebased file against the fresh live pull before shipping — confirmed the diff contained only the two intended insertions, nothing else touched, no regression of the just-landed staleness fix.

## Verification before shipping
Local static-file test build (live `index.html`/`css/styles.css`/`js/app.js` pulled via Contents API into scratchpad, real live `data/tasks.json` loaded over the network — never written back), served via `python -m http.server`, screenshotted with real (non-fake) headless Chrome (`--headless=new --virtual-time-budget=6000` to let the async task fetch complete before capture — a plain `--screenshot` with no time budget captures before `loadTasks()` resolves, giving false all-zero counts).
- **2x2 grid confirmed** with real live data (Today 6 cards / Tomorrow 9 / This Week 39 / Parked 9) — Today+Tomorrow row 1, This Week+Parked row 2, matching work-inbox's Priorities-tab layout.
- **Collapse + chevron rotation confirmed** — toggled Tomorrow and Parked via a temporary local-preview-only inline script (never touching the real repo), screenshotted, chevron for Today (expanded) points down, Tomorrow (collapsed) points right (rotated -90deg) — pixel-zoomed crop confirms both states clearly.
- **localStorage persistence confirmed** — used a persistent `--user-data-dir` across two *separate* headless Chrome invocations: run 1 set the collapsed state via the demo script; the demo script was then removed from `index.html` (reverted to the exact production HTML being shipped) and run 2, with no toggle call at all, still rendered Tomorrow collapsed — proving `initTierCollapse()` alone restores state from `commandCentre_tierCollapse_v1` on a cold page load, not just the demo script's own toggle.
- **`.intel-panel` (WATCH/ACT NOW/WAITING ON) confirmed untouched** — visually identical across every screenshot; `diff` of the shipped `styles.css` against the pre-change live pull shows the only content-bearing hunk is the 4 lines inserted in the `/* V5 TIER SECTIONS */` block — the apparent second diff hunk further down is a pure line-number shift (identical text on both sides), not a change; `.intel-panel`'s own rules were never in the diff at all.
- **Drop-zone divs (`#tier-today` etc.) confirmed byte-identical** — `diff` of shipped `index.html` against the pre-change live pull shows only the 4 `.sec-head` lines changed (id/onclick/chevron added); the `ondragover`/`ondragleave`/`ondrop` divs and their children are untouched in the diff output.

## Backup-and-verify protocol (per this repo's CLAUDE.md, one file at a time)
All three files backed up to `Archive/` immediately before their write, backup SHA verified against a fresh live GET before editing, and post-write SHA verified by reading the file back and diffing against the intended content — no assumptions at any step.

| File | Pre-change live SHA | Backup commit | Backup file | Write commit | Post-write SHA |
|---|---|---|---|---|---|
| `index.html` | `025af1b5...` (7741 bytes) | `51a850a0` | `Archive/index_backup_20260821_0900.html` | `e656847a` | `fac59a94...` |
| `css/styles.css` | `5bcf4ec2...` (31290 bytes) | `05df328a` | `Archive/styles_backup_20260821_0900.css` | `8c216dfc` | `29b91953...` |
| `js/app.js` | `3eea204c...` (42098 bytes, current post-Phase-2-item-3 content) | `28a136c1` | `Archive/app_backup_20260821_0900.js` | `0b4ffb5d` | `13683bec...` |

All three post-write SHAs verified by a direct GET-and-diff against the exact intended content — byte-identical, confirmed, not assumed.

## Revert plan
Sha-guarded `PUT` of each `Archive/*_backup_20260821_0900.*` file's content back onto its corresponding live file, in the same one-file-at-a-time order as above.

## Next
Report back to the coordinator with commit SHAs and verification summary. No further action pending on this item — Kevin's approval was already given on the design; this session only rebuilt and shipped what he'd already seen.

---

# Handover — 21 August 2026, ~09:00 UTC (Drew) — Phase 2 item 3 MERGED to main, verified live — PHASE 2 CLOSED IN FULL

## What shipped
Kevin reviewed the staged before/after screenshots himself and gave literal approval to merge. Branch `phase2-item3-staleness-fix-21aug` (commit `1a79b25929742208c206c2b4c71074d76fbfb542`) merged into `main` — the staleness-clock root fix (see the 21 Aug ~08:50 entry immediately below for the full root-cause/fix writeup, not repeated here).

## Pre-merge verification (this repo's own mandatory backup-and-verify protocol)
- Fresh GET of live `main` `js/app.js` immediately before merging: sha `501a0a3477d02373d058409eea8d8a5837902474`, 40371 bytes — unchanged since the branch was staged (matches the pre-change sha recorded in the ~08:50 entry), confirming no drift and that the existing backup is still the correct restore point.
- `compare/main...phase2-item3-staleness-fix-21aug`: branch 1 ahead / 2 behind main ("diverged"). Checked what the 2 extra main commits touched before merging (`compare/phase2-item3-staleness-fix-21aug...main --jq '.files[].filename'`): `data/tasks.json` (an automated inbox task update) and `docs/HANDOVER.md` (this file's own staging entry) — neither touches `js/app.js`, so no conflict risk.
- Re-verified `Archive/app_backup_20260821_0750.js` (commit `dab76fdc4702667bc1a3c3a848612bb3422af4fc`) live: sha `501a0a3477d02373d058409eea8d8a5837902474`, byte-identical to pre-merge `main`.

## Merge
GitHub Merges API, `base=main`, `head=phase2-item3-staleness-fix-21aug` → merge commit `4467e25a88ab4351452274d80a19eb5bf2603d76`. Post-merge `main`'s `js/app.js` sha confirmed via direct GET: `3eea204c50e8d1fcf135eacaaf515a613212b512`, 42098 bytes — exact match to the branch's staged content.

## Live deploy verification — byte-diff, not just "merge succeeded" or a status field
Per agent-commons' documented cache-trap gotcha (raw.githubusercontent.com and `/pages/builds/latest` can serve/report stale right after a real change), did not stop at the Pages status:
1. Polled `pages/builds/latest` — `building` → `built` (commit `4467e25a88ab4351452274d80a19eb5bf2603d76`) within ~50s of the merge.
2. Downloaded the **actual served file** — `curl https://begb0037admin.github.io/command-centre/js/app.js?t=<cache-buster>` — and diffed it directly against the merged git blob (`contents/js/app.js?ref=main`, base64-decoded): `cmp` reports 0 byte differences, SHA-256 identical (`7bab5554...`) on both sides.
3. Confirmed `lastActivityTs` present in the live served file (sanity grep).

## Backup location
`Archive/app_backup_20260821_0750.js` (commit `dab76fdc4702667bc1a3c3a848612bb3422af4fc`) — pre-fix `js/app.js`, sha `501a0a3477d02373d058409eea8d8a5837902474`, 40371 bytes. Correct restore point for this specific change.

## Revert plan — validated against current live data this session, not just described
If a live problem is reported: fetch current `main` sha for `js/app.js`, sha-guarded `PUT` of `Archive/app_backup_20260821_0750.js`'s content back onto `js/app.js`, commit message `"Revert to pre-Phase2-item3 staleness logic"`.
**Validated, not just asserted:** extracted the exact pre-fix `lastActivityTs()`/`staleDays()` function pair from the backup and ran it in Node against a **fresh pull of today's actual live `data/tasks.json`** (76 tasks — not the dataset the original fix was verified against) — 0 exceptions thrown, executes cleanly end-to-end, flags 16 tasks stale under the old (reverted) logic. Confirms the revert path is safe to execute right now against real current data; it would silently reintroduce the known routine-inbound-email-masks-staleness bug, the expected tradeoff of reverting, not a new failure mode.

## Branch cleanup
`phase2-item3-staleness-fix-21aug` deleted after all of the above was confirmed. The change is carried forward permanently via merge commit `4467e25a88ab4351452274d80a19eb5bf2603d76`; the branch's original tip (`1a79b25929742208c206c2b4c71074d76fbfb542`) remains reachable through that commit's parent history for full traceability.

## Phase 2 status
This was the last open Phase 2 item. **Phase 2 is closed in full on this repo's side.** Work-inbox's matching half of the same fix is documented in that repo's own `HANDOVER.md`, same session, same verification standard. Reporting back to Kevin per his own instruction — this closes Phase 2 overall, triggering his stock-take before Phase 3 (merging the 2 duplicate task pairs; the original item8 concern is not separately open, superseded by this change).

---

# Handover — 21 August 2026, ~08:50 UTC (Drew) — Phase 2 item 3 CLOSED: staleness-clock root bug fixed, shared definition with work-inbox, STAGED pending screenshot approval

## What this closes
Kevin's work-inbox stability plan, Phase 2 (Medium), item 3 — the last open item. Kevin chose option 3: fix the underlying staleness-clock bug first, then apply one consistent staleness definition across both dashboards, rather than building an auto-hide or manual-badge feature on top of an unfixed bug.

## Root cause, confirmed live (not re-assumed from the 12 Aug investigation)
`lastActivityTs()` in `js/app.js` treats every dated `[DD Mon YYYY]` entry in a task's `actions[]` log as genuine activity — including routine inbound email that `fetch_inbox.py` Phase 3.5/3.6 auto-appends for every related message on a thread (reminders, forwards, chasing replies, OOO notices), tagged `(email: <sender> - <subject>)`. A task that receives passive mail forever never goes stale, no matter how long Kevin has actually ignored it.

## Fix
An action entry tagged `(email: ...)` now only counts as genuine activity when it's Kevin's own sent reply, tagged `(email: Kevin (sent to: ...)` by the same pipeline (`fetch_inbox.py`'s sent-email handling, confirmed live by reading the actual tag-construction code, not assumed). Untagged entries (manual dashboard notes/edits) still always count, unchanged.

**A second, real edge case found via live verification, not present in the 12 Aug branch's fix:** a task whose ENTIRE action history is routine inbound mail (never once actioned by Kevin) and has no `dateAdded`/`lastUpdated` field returns zero genuine signal under the tag-filter alone — the worst case (Kevin has never touched it) would silently vanish from staleness tracking rather than being flagged. Fixed with a fallback to the earliest dated entry (a creation-date proxy), so such a task still ages from when it first appeared. Caught this by running the fix against real live `data/tasks.json`, not by inspection — one real task (`t2608071501072`, "tomorrow" tier, 14 days old) flipped from flagged-under-old-logic to silently-unflagged-under-a-naive-tag-filter before this fallback was added; after the fallback, it's correctly flagged again and nothing that was previously flagged is ever un-flagged.

## Decision: `holding/item8-staleness-badge-fix` (12 Aug, commit `7c7406a`) — SUPERSEDED, not resumed as-is, branch deleted
Compared directly (`git compare main...holding/item8-staleness-badge-fix`): 94 commits behind current `main`, 1 ahead, single file (`js/app.js`) touched, and — checked byte-for-byte — the branch's entire file content differs from current live `main` by exactly the one `lastActivityTs()` hunk. The core regex logic (skip `(email:...)` unless `(email: Kevin (sent to:...`) was re-verified against the CURRENT `fetch_inbox.py` tag-construction code (lines ~1642–1860) and still matches exactly — it was sound, not stale.

Reworked rather than merged, for two reasons: (1) the branch never handled the all-inbound-history-no-dateAdded edge case above, found only through today's live-data verification — porting it as-is would have re-shipped that gap; (2) this fix is now deliberately paired with a new equivalent in work-inbox (see below) sharing one documented definition — writing both today, on current `main`, keeps that pairing coherent rather than reviving a 9-day-old lone CC-only branch and bolting a second repo's logic on separately. The branch's tip (`7c7406af36fcc05f237a7d4f5fd4c15176048bf5`) is recorded here for full recoverability and has been deleted — its content is fully absorbed and improved upon by this change, and per this repo's own Branch and Merge Protocol, files should not sit on an abandoned branch indefinitely.

## Shared definition (also see work-inbox's own HANDOVER.md entry, same day)
"Genuine activity" = (a) any action-log entry without an `(email:...)` tag (manual dashboard notes/edits), (b) an entry tagged as Kevin's own sent reply, or (c) an explicit `dateAdded`/`lastUpdated` field. Routine inbound email logged automatically by the triage pipeline does not, by itself, reset the clock. Thresholds unchanged and now explicitly shared: `today`/`tomorrow` 7 days, `week` 21 days, `parked` 45 days (`CC_STALE_DAYS`) — work-inbox's new "Priorities This Week" badge reuses the `week` threshold (21 days) exactly, since it mirrors these same `tier:'week'` tasks.

## Live verification against real data (not synthetic), before writing anything
Extracted the exact function block from the intended edit and ran it in Node against a fresh pull of live `data/tasks.json` (63 non-done tasks):
- OLD (current live) logic: 7 tasks flagged stale (`today`:2, `tomorrow`:1, `week`:2, `parked`:2).
- NEW (fixed) logic: 20 tasks flagged stale (`today`:2, `tomorrow`:5, `week`:6, `parked`:7).
- 13 newly flagged, **0 previously-flagged tasks lost their flag** (monotonic, confirmed by explicit diff of the two id sets) — the fallback above is what keeps this true.
- `week` tier specifically (mirrors work-inbox's "Priorities This Week" default contents): 2 → 6.

## Screenshot verification (UI approval gate, staged not merged)
Built a local before/after test harness (live `index.html`/`css/styles.css`/`js/api.js`/`data/tasks.json`, swapping only `js/app.js`), served locally, screenshotted via Playwright (installed locally, no dedicated tool available this session). Confirmed visually: This Week/Parked cards that were previously silent (e.g. "Vacancy alert email retest -- case 68388326", "Insight module update -- Lindsey Spriggs", "Follow up on Scoping Session with Sophie Levy") now correctly show `XXD QUIET` red badges reflecting real weeks/months of silence, while genuinely recent items remain unbadged. No other visual element changed.

## Backup-and-verify sequence, run in full (this repo's own mandatory protocol)
1. Fresh GET of live `js/app.js` — sha `501a0a3477d02373d058409eea8d8a5837902474`, 40371 bytes, non-zero, confirmed.
2. Timestamped backup pushed first (to `main`, per convention): `Archive/app_backup_20260821_0750.js`, commit `dab76fdc4702667bc1a3c3a848612bb3422af4fc` — content sha `501a0a3477d02373d058409eea8d8a5837902474`, byte-identical to the live pre-change file, confirmed via independent re-GET.
3. Race-guard re-GET of live `js/app.js` immediately before the edit — unchanged (`501a0a34...`).
4. Edit applied to `lastActivityTs()` only (see full new function body in the file itself; comment block documents the fix and both edge cases).
5. Pushed to a NEW branch `phase2-item3-staleness-fix-21aug` (not `main`), sha-guarded against the pre-change sha above — commit `1a79b25929742208c206c2b4c71074d76fbfb542`, new content sha `3eea204c50e8d1fcf135eacaaf515a613212b512`, 42098 bytes.
6. Fresh post-push GET from the branch: byte-identical to the intended edit, confirmed. `node --check` clean. `main`'s `js/app.js` confirmed still at the pre-change sha — untouched.

## NOT merged to main — UI approval gate
This is a visible dashboard change (new `XXD QUIET` badges can now appear on more tasks). Per this repo's mandatory UI approval gate, it is staged on branch `phase2-item3-staleness-fix-21aug` (commit `1a79b259`) with before/after screenshots ready, awaiting Kevin's literal **"approved"** before merging to `main`. This is the same "commit to a holding branch rather than push to main" fallback the 12 Aug session used for the same reason (no interactive screenshot channel to Kevin mid-session).

## Revert plan (once merged — currently N/A since nothing is on main yet)
If merged and a live problem is reported: restore `js/app.js` from `Archive/app_backup_20260821_0750.js` (content sha `501a0a3477d02373d058409eea8d8a5837902474`) via a sha-guarded PUT against whatever `main`'s tip is at that time — same pattern as every other revert in this file. Until merged, reverting is simply not merging the branch; `main` is untouched.

## Next action
Show Kevin the before/after screenshots (both repos, same session — see work-inbox's own HANDOVER.md entry). On his literal "approved": merge `phase2-item3-staleness-fix-21aug` into `main` (GitHub Merges API, checking for divergence first, same as every prior merge this week), poll Pages build to `built`, byte-diff the live served file against the merged blob, then this Phase 2 item — and Phase 2 overall — is closed. Report back to Kevin per his own instruction: this closes Phase 2, triggering his stock-take before Phase 3 (merging the 2 duplicate task pairs, and reassessing whether the original item8 branch's specific concern is still separately open — it isn't; this change supersedes it).

---

# Handover — 21 August 2026, ~06:56 UTC (Drew) — Scrollbar-styling fix, Kevin-approved, DEPLOYED

## What was done
Replaced default browser scrollbars with a thin, low-contrast style matching hris-dashboard's existing scrollbar CSS (copied values, not invented), across every scrollable container in this dashboard: `.sidebar`, `html` (outer page scroll), and `.intel-scroll` (shared by the WATCH / ACT NOW / WAITING ON panels — the only inner-panel scroll container found via a full grep audit of this repo's CSS/JS/HTML). Companion fix landed in `begb0037admin/work-inbox` in the same session (its own scrollable containers: `.sidebar`, `html`, `.cal-col-body`, `.archive-panel`).

Kevin reviewed before/after screenshots and approved directly in a Claude Code coordinator session ("great apprvoed"), then gave standing AFK authorization to proceed without further per-step check-ins. A prior Drew session did the design/audit/screenshot work; this session picked up execution only, after independently re-verifying the live CSS still matched the audited state before writing (see below).

## Pre-write verification (live-state check, not assumed)
Live `.intel-scroll` already carried some scrollbar styling (`scrollbar-width:thin`, `#cbd5e1`, 7px, hover-darken to `#94a3b8`) — introduced back in commit `c148ad478` (3 Jul 2026, Stage 2 Intel panel), not a recent drift. Checked full commit history on `css/styles.css`: nothing since has touched `.intel-scroll` specifically (last two touches, 20 Aug, were unrelated mobile-width fixes). Confirmed no pre-existing `.sidebar`/`html` scrollbar-width/color rules anywhere in the file (append-only, no collision). Since this is a full property-replace (not a diff), the end visual state is deterministic from the new CSS regardless of what was there before — proceeded.

## Backup-and-verify sequence, run in full (command-centre CLAUDE.md mandatory protocol)
1. Fresh GET of live `css/styles.css` — sha `f692aa97b315a3b5b0a6dfa51978ffb4356b3d56`, 30986 bytes, non-zero, confirmed.
2. Timestamped backup pushed first: `Archive/styles_backup_20260821_0656.css`, commit `2d06b7ca36f3e791c2bf6b54422f0a4a1d2dfe77` — content sha `f692aa97b315a3b5b0a6dfa51978ffb4356b3d56`, byte-identical to live pre-change file, confirmed via independent re-GET.
3. Edit applied: replaced `.intel-scroll` block (4 rules, dropped the hover-darken variant per the approved CSS), appended `.sidebar`/`html` scrollbar rules at end of file.
4. sha-guarded `PUT`, commit `2e61df4e24d6e141caab8d0921193c8f6389daa9`, new content sha `5bcf4ec27f8733357d41a086a06aa089949e483c`, 31290 bytes.
5. Fresh post-push GET: sha matches PUT response exactly, `.intel-scroll` and appended rules both confirmed present verbatim in the live file.

## Next action
None outstanding on this fix — done and verified live on both repos. UI approval gate already satisfied (Kevin approved via screenshots before this write); no further screenshot/re-approval needed per his explicit instruction.

---

# Handover — 20 August 2026, ~14:54 (Drew) — task-1787072363309 fixed: title-squeeze render bug + stale DRAFT status, Kevin-approved, DEPLOYED

## What was reported
Kevin flagged a rendering bug on the "URGENT -- Organisational Structure Update - August 2026 - DRAFT (Simon Burford / Sarah Rowles thread)" card on the live dashboard.

## Root cause, confirmed live (headless Playwright against the production Pages URL)
Not a JS error, not malformed JSON -- pure CSS layout squeeze. `css/styles.css` gives `.card-title-pills` (the source badge) `flex-shrink:0` and `.badge{white-space:nowrap}`, while `.card-title-text` (the title) has `min-width:0` so it absorbs all the shrinkage. This task's `source` field was 116 characters (`"orgstructure@admin.ox.ac.uk / Simon Burford (HR Systems Analysis and Insights Manager) / Sarah Rowles -- email thread"`) -- far longer than the short-label convention every other task uses -- so the unwrapping badge claimed ~500px of an ~840px row, squeezing the title into a single-word-per-line vertical column. Verified precisely via DOM measurement (pills 503.8px / title 321.2px on an 837px row) and reproduced/fixed client-side-only in a headless browser before writing anything, screenshotted before/after for Kevin's approval gate.

## Second issue surfaced mid-investigation, Kevin gave direction to fix too
Flagged that the task's `actions` log already showed a FINAL org-structure version was received 19 Aug, but the title/summary/description still framed it as an open 12 Aug DRAFT with an "upcoming" 19 Aug deadline -- stale as of today (20 Aug). Kevin forwarded the actual FINAL email content (Katherine Corr, orgstructure@admin.ox.ac.uk, 19 Aug 16:36, subject "RE: Organisational Structure Update - August 2026 - FINAL") and asked for the task to be brought current.

## Fix, approved by Kevin via two screenshot rounds (v1 then v2) before any write
1. `title`: dropped the redundant `(Simon Burford / Sarah Rowles thread)` parenthetical (already conveyed by the source badge) and DRAFT -> FINAL: now `"URGENT -- Organisational Structure Update - August 2026 - FINAL"`.
2. `source`: shortened to `"orgstructure@admin.ox.ac.uk / Simon Burford / Sarah Rowles -- email thread"` (77 chars, drops only the parenthetical job title) -- this is what actually fixes the render; kept deliberately short rather than adding Katherine Corr to avoid re-triggering the same overflow.
3. `description`: original 12/17 Aug narrative kept intact for history, FINAL content appended as a second paragraph (FINAL sent by Katherine Corr 19 Aug 16:36, effective through 19 Aug, one correction -- duplicate Oxuniprint Ltd subsidiary entity XP removed, minor name changes to 8HP0/E7, full schedule covers Medical Sciences/UAS/Colleges&Halls L2->L3 plus Subsidiary Companies cleanup, file migrated to SharePoint on the intranet, local system owners -- card database, Salto, Oracle etc. -- need to reflect changes and log via the Teams group). Also honestly notes Simon Burford's PeopleXD/H&S-dashboard question and Sarah Rowles' HESA go-live question remained unanswered in-thread as of the FINAL circulation -- not fabricated as resolved.
4. `summary`: rewritten to the same FINAL content, condensed (898 chars). Confirmed via grep of `js/app.js` that `summary` is not rendered anywhere in the UI -- updated anyway since it's part of the task's data record.
5. `actions` and `notes` left untouched (the 19 Aug FINAL-received/maintenance-notice entries already logged by an earlier session stay as-is, not duplicated).

## Backup-and-verify sequence, run in full (command-centre CLAUDE.md mandatory protocol)
1. Fresh GET of live `data/tasks.json` -- sha `066c021fdfc7ab6c2a9ee9ebdfc253d7340ea4e3`, 154497 bytes, non-zero, 74 tasks, confirmed.
2. Timestamped backup pushed first: `Archive/tasks_backup_20260820_1453.json`, commit `aa5a25789cbe84938f39fe5ada5a559f22c06ff7` -- content sha `066c021fdfc7ab6c2a9ee9ebdfc253d7340ea4e3`, byte-identical to the live pre-change file (git content-addressing on the unchanged bytes, confirmed independently via a fresh GET-back).
3. Race-guard re-GET of live sha immediately before the real write -- unchanged (`066c021f...`).
4. Verified the edit was scoped to exactly this one task before writing: loaded the live JSON with Python, confirmed `json.dumps(data, indent=2, ensure_ascii=False)` round-trips the *unmodified* file byte-for-byte identical to the original (154497 == 154497, confirmed), then applied only the 4 field changes and re-diffed -- single unified-diff hunk, nothing else in the 74-task array touched.
5. sha-guarded `PUT`, commit `99c9dc47f20784877f6e38545b8bf6d3af3ad8e0`, new content sha `5d9ecdad94a0a8814af96dd8b4c25743516f6570`, 155501 bytes.
6. Fresh post-push GET: byte-identical to the intended write, live file sha confirmed matches the PUT response's content sha exactly (`5d9ecdad...`), task count still 74 (no drift), target task's title/source/description-length/summary-length all verified present exactly as pushed.

## Also found, not fixed -- flagged to Kevin, no action taken without his direction
Four different tasks now reference "organisational structure" (`task-1787072363309`, `t046`, `t2608121801282`, `t2608200721490`) across 3 tiers, one marked done. Data-hygiene/dedup question, not a rendering bug -- not touched.

## Next action
None outstanding on this fix -- done and verified live. The underlying dedup question above is Kevin's call if he wants it actioned.

---

# Handover — 18 August 2026, ~21:30 (Drew) — HIGH PRIORITY / URGENT: task `t2608111331410` escalated, "Cority - Applicant Data Import file" thread (James Salas Guillen / Simon Burford)

## Scope
Kevin asked for full retrieval/unpack of this thread (same treatment as the Organisational Structure Update item earlier this session), then mid-task escalated it to HIGH PRIORITY/URGENT and asked for everything — full content, all attachments opened and read, all correspondents, full history. Adam separately found the existing auto-created task `t2608111331410` (11 Aug 2026, tier `week`) before a duplicate was created, so this session **updated that task in place** rather than creating a new one. Full chronological unpack and all 5 verbatim message bodies live in this repo's own `data/tasks.json` task `t2608111331410` (`description` field); matching entry in work-inbox's `HANDOVER.md` (commit `cc0ebdab25ddd1d533e794a16edeaf55045f9873`) has the same narrative.

## What was done here
Full mandatory backup-and-verify sequence run for `data/tasks.json`: GET live file (non-zero, 121082 bytes, 69 tasks, sha `cd75197f`) → timestamped backup `Archive/tasks_backup_20260818_2025.json` (commit `de0a8e5519e34fb5ccd7ffac4614fa9744cd6365`) → backup re-fetched, sha confirmed `cd75197f09bffafa9f2162b069e35415a2bf8cf6` matching the pre-write live file exactly → only then wrote the update using that fresh sha (commit `126165de444337c780abd9b469c3c96798ac9532`, new content sha `df75cb7d24297477453a008632b8b25b9edbb429`) → live file re-fetched afterward, confirmed 69 tasks (no count drift), title/tier/priority/description/actions on `t2608111331410` all verified present exactly as pushed.

Task changes: title prefixed `URGENT --`; `tier` changed `week` → `today`; new `priority: "urgent"` field added (this task's schema previously had no priority field — this is the first use of one on this task, added per Kevin's explicit instruction, not a repo-wide schema change); `summary` and `description` fully rewritten with all 5 verbatim message bodies (James Salas Guillen / Simon Burford, 11–18 Aug 2026) plus attachment findings; `actions` appended (not overwritten) with the escalation record, a `[TODO]` for Kevin's two open items from Simon's final message, and a `[MONITOR]` noting Adam's separate cross-reference against CORITY-FEASIBILITY.md.

## Attachment handling — real data-sensitivity note
One attachment across the thread (`image004.png` on Simon Burford's first reply) is a screenshot of the actual live `RECSUP20_Applicant Cority Interface File_V1.csv` open in Notepad++, showing real applicant personal data (names, DOB, addresses, phone numbers, emails) in production, not test data. Opened and viewed directly to confirm this. Deliberately **not reproduced verbatim** in either this file or `data/tasks.json` — duplicating real applicants' PII into a second data store was judged unnecessary exposure risk with no added decision value. Flagged as a fact for Kevin/Adam's awareness; not assessed as a compliance question here — outside Drew's retrieval-only scope.

## Not done
No reply drafted or sent (Lauren's parallel task). No Cority H&S feasibility assessment made — Adam's cross-reference against CORITY-FEASIBILITY.md is a separate dispatch, not started here.

## Next action
Kevin to answer Simon Burford's two open questions (null-value export format, UTF-8 encoding) and what he knows of Lee's handover regarding this report's undocumented origin. Adam to cross-reference once dispatched. No further command-centre or work-inbox engineering action required on this item.

---

# Handover — 18 August 2026 (Drew) — HIGH PRIORITY / URGENT: task-1787072363309 logged, "Organisational Structure Update - August 2026 - DRAFT" thread (Simon Burford / Sarah Rowles)

## Scope
Kevin flagged this thread "ultra urgent" directly. Retrieval and logging only — no reply drafted or sent. Full chronological unpack and command-centre write-up live in this repo's own `data/tasks.json` task `task-1787072363309`; matching entry in work-inbox's `HANDOVER.md` (commit `91ce237b737cf72038c7fea01f1b0d4d4474cdee`) has the full narrative.

## What was done here
Full mandatory backup-and-verify sequence run for `data/tasks.json`: GET live file (non-zero, 116038 bytes, 68 tasks) → timestamped backup `Archive/tasks_backup_20260818_1758.json` (commit `9e619ec975dfee46a4b9c50a4fff4bc18ffcb741`) → backup GET-back and SHA-verified (`ca4b7a86f8b72ce30f4f6ae3032c8ddd540f9529`, byte-identical to pre-change live file) → edit applied (new task prepended, tier `today` given the 19 Aug deadline in the thread) → PUT (commit `16bf87f8dd06947df0c8a671628d41b31e338eba`) → post-change GET and byte-for-byte verification against the intended write (SHA `ead84bc710efc7a5c729c16f5223ce8c8efa18e4`, confirmed 69 tasks, new task present).

## Status
Thread is OPEN, time-sensitive (errors/omissions deadline 19 Aug 2026, tomorrow). No reply from Kevin found in Sent Items as of this live search. Only one Simon in this thread (Simon Burford, simon.burford@admin.ox.ac.uk) — no ambiguity.

## Next action
Kevin's own decision how/whether to respond before the 19 Aug deadline. No further engineering action needed on this item.

---

# Handover — 18 August 2026 (Drew) — outstanding item logged: task-1787044968753, Laura Porter / auto job-alert notification email text changes

## Scope
Kevin pasted a full email thread directly in chat and asked for it to be logged as an outstanding, pending-on-us item in both work-inbox and command-centre. This entry covers the command-centre side; see work-inbox's own `HANDOVER.md` (18 Aug 2026 entry) for that repo's matching log.

## What was added
New task `task-1787044968753`, tier `week`, title "Auto job-alert notification email -- text changes (Laura Porter)". Full backup-and-verify sequence followed in full for `data/tasks.json`:
1. Fresh GET of live file — sha `e387fabb1df0b4b19e106eacf1014aed81c9fca8`, 105671 bytes, non-zero, confirmed.
2. Timestamped backup pushed first: `Archive/tasks_backup_20260818_0921.json`, commit `a73aa64d`, content sha `e387fabb...` — confirmed byte-identical to the live pre-change file.
3. Backup re-GET verified — sha matched.
4. Race-guard re-GET of live sha immediately before the real write — unchanged (`e387fabb...`).
5. sha-guarded `PUT` of the new 64-task array, commit `5ca8e4ad`, new content sha `2b7070bd...`.
6. Fresh post-push GET, byte-diffed clean against the intended target content; confirmed all 63 pre-existing tasks structurally unchanged, only the new task appended.

An Outlook EntryID was found and included (not left blank): searched the live Outlook inbox for the "Auto job alert notification email - text changes" subject, found the real thread (2 messages, Laura Porter, 2 Jul and 8 Jul 2026), used the most recent message's EntryID per the schema's own "most recent linked email" convention.

## Why this task, this tier
Laura/Phil approved the wording changes in Feb 2026. Implementation has been stuck since 8 Jul 2026 on an Access Group backend config issue that wouldn't apply to outgoing emails despite saving correctly. Kevin raised a fresh Access Group ticket, took 2 weeks' leave, told Laura "end of July" — that self-imposed date has now passed with no visible follow-up. Laura's own last message set no deadline and she is not the blocker; logged as `[TODO]` (pending on Kevin's own follow-up — check the ticket, get Laura the screenshot), not `[AWAITING]`. Tiered `week` rather than `parked`: this is stalled on Kevin's own action, not blocked on someone else, so it belongs with active-attention items rather than the passive/blocked-on-others tier `parked` is generally used for in this data (cf. `t009`, blocked on Marie's signature).

## Work-inbox side
Same outstanding item also logged as a new dated entry prepended to work-inbox's own `HANDOVER.md` (18 Aug 2026), following that repo's own established convention — confirmed live by reading its last dozen entries that the active mechanism is a dated prose entry at the top of the file, not a separate JSON/tracking file. No new persistence mechanism was built in either repo; Phase 3.9 (work-inbox's prior carry-forward attempt, reverted 17 Aug 2026 at Kevin's request) was deliberately not touched or resurrected.

## Next action
None outstanding for this logging task itself — done and verified live in both repos. The actual underlying item (`task-1787044968753`) needs Kevin's own follow-up: check the Access Group ticket, confirm the fix works, send Laura the screenshot.

---

# Handover — 16 August 2026 (Drew) — cc-tasks-writer GitHub-identity isolation, CUTOVER COMPLETE

## TL;DR
Kevin gave explicit go-ahead the same day, supplied a fresh fine-grained `kevinlelitteadmin` token (confirmed write access to both `command-centre` and `work-inbox`, repo scope, fresh rate-limit bucket). Rotation done, verified live end-to-end through the actual production write paths, not just "the command exited 0." Old shared `begb0037admin` token intentionally left valid as a grace-period fallback, per the same discipline Zara used for `kevin-finance-ai`.

## What was done, in order
1. Confirmed baseline live version matched Kevin's stated restore point exactly: `69edef7c-562e-4580-9088-6d3f46dda7b4` (100%, created `2026-08-02T21:44:56.932Z`) via `wrangler deployments list --name cc-tasks-writer`.
2. Confirmed `HRIS_GITHUB_PAT` present via `wrangler secret list --name cc-tasks-writer`.
3. Ran `wrangler secret put HRIS_GITHUB_PAT --name cc-tasks-writer` with the new token piped via stdin (never echoed to a file or committed).
4. Verified the rotation registered as its own deployment: version `61d6d5c8-c5ce-49bb-9d2f-2b88954c428b`, `Source: Secret Change`, 100%, created `2026-08-16T13:52:58.207Z` — immediately after the prior baseline, no other version in between.
5. **Real functional check, both write paths the Worker serves** (not a synthetic test — actual POSTs to the live production Worker URL, same route the dashboard/work-inbox client code calls):
   - `command-centre`: fetched live `data/tasks.json` (sha `eea8e24a...`, 61 tasks), POSTed the exact same tasks array straight back through `handleTasks` with message `"cc-tasks-writer PAT rotation verification (no data change) - 16 Aug 2026"`. Worker returned `{"ok":true,"merged":false,"attempts":1}` HTTP 200. Confirmed live: new commit `72f3f05` landed with that exact message, **and** the Worker's own daily-backup step fired for the first time today — `Archive/tasks_backup_20260816.json` created, commit `c9cc1df`, message `"Daily backup 20260816"`.
   - `work-inbox`: same pattern against `data/ticks.json` via the `inbox-state` route — commit `38eff03` landed, message `"cc-tasks-writer PAT rotation verification (work-inbox side, no data change)"`.
   - **Identity proof, the actual point of this cutover:** both new commits show `committer_login: kevinlelitteadmin` / `author_email: 201231673+kevinlelitteadmin@users.noreply.github.com` — directly contrasted against the immediately preceding commits on both repos, which show `committer_login: begb0037admin` / `author_email: begb0037@ox.ac.uk`. The identity split is live and real, not just "the secret changed."

## Rollback path
Old shared `begb0037admin` PAT is untouched and still valid — recommend Kevin leave it live for a few days as fallback, same as the finance Worker cutover. If the new token needs to be backed out: `wrangler secret put HRIS_GITHUB_PAT --name cc-tasks-writer` again with the old token value. This is a secret-only rollback, not a code rollback — the Worker code itself (`cc-tasks-writer-proposed.js`, live version `69edef7c...` prior to the secret change, now superseded by `61d6d5c8...` which is the same code with only the secret changed) was never touched.

## Gotcha found this session, also pushed to Drew's confirmed-fact memory + agent-commons
`wrangler` via this machine's Git Bash resolves its config/token store differently than the working PowerShell session that did the earlier audit. Git Bash sets `HOME=/c/Users/admin`, which some of wrangler's path resolution follows down a POSIX-style `$HOME/.wrangler` path — but the real, actively-refreshed OAuth token lives at `%APPDATA%\xdg.config\.wrangler\config\default.toml` (i.e. `AppData\Roaming`, not `$HOME/.wrangler`). Git Bash `wrangler whoami`/`wrangler deployments list` failed with "not authenticated" despite a valid, non-expired token sitting one directory tree over. Fixed by copying `default.toml` into the `$HOME/.wrangler/config/` path Git Bash's wrangler actually checks. Anyone running `wrangler` via Git Bash on this machine (not PowerShell) should expect this and check both locations before assuming a real login is needed.

---

# Handover — 16 August 2026 (Drew) — cc-tasks-writer GitHub-identity isolation, AUDIT ONLY, cutover not yet started

## TL;DR
Same-day sibling to Zara's `kevin-finance-ai` dedicated-token cutover (`begb0037admin/zara/memory/note_2026-08-16_dedicated_github_token_cutover_deployed.md`) — a repo-wide audit found `cc-tasks-writer` has the identical exposure: it writes `data/tasks.json` (command-centre) and (less obviously) also work-inbox, live, on the same shared `begb0037admin` GitHub API budget that took down kevin-personal-finance earlier today. Kevin approved doing the same isolation work here ("may be worth it for command centre"). This session did the full audit and found the GitHub-side setup is **already done** — nobody just noticed. Cutover itself (secret rotation) has **not** been run; needs Kevin's identity-approach decision + a token + explicit go-ahead, same discipline Zara used.

## Confirmed live, not assumed from docs

**Which Worker file is actually live:** `cloudflare-worker/cc-tasks-writer-proposed.js` (commit `4ef2fbf5e`, committed 2026-08-02T21:38:00Z) — the fix the 2 Aug HANDOVER entry described as "proposed, not deployed" **was in fact deployed shortly after**, same evening. Confirmed via `wrangler deployments list --name cc-tasks-writer`: current 100% live version is `69edef7c-562e-4580-9088-6d3f46dda7b4`, created `2026-08-02T21:44:56.932Z` — timestamp sits between the proposed-fix commit (21:38) and the `cc-tasks-writer-PREVIOUS.js` backup commit (21:52, whose own message says "the patched Worker was deployed... reconstructs [the prior code] from the full source Kevin pasted into the session immediately beforehand"). No deployment newer than 69edef7c exists. `cc-tasks-writer-PREVIOUS.js` is the pre-patch rollback reference, not live.

**This is the restore point for any rollback:** live Worker version `69edef7c-562e-4580-9088-6d3f46dda7b4` (100%), code = `cc-tasks-writer-proposed.js`. A secret-only rotation doesn't create a new code version (per Zara's finding on the finance Worker — secret changes do version separately, `Source: Secret Change`), so rollback of a bad secret swap means re-`wrangler secret put`-ing the old value, not a code rollback.

**Which secret carries the shared identity:** `env.HRIS_GITHUB_PAT` (confirmed via `wrangler secret list --name cc-tasks-writer`, two secrets present: `ANTHROPIC_API_KEY`, `HRIS_GITHUB_PAT`; confirmed via source grep, `cc-tasks-writer-proposed.js` lines 259/350 read `env.HRIS_GITHUB_PAT` for both the read and write GitHub Contents API calls).

**Blast radius is wider than command-centre alone:** the Worker's own constants (`cc-tasks-writer-proposed.js` lines 115-117) are `OWNER='begb0037admin'`, `CC_REPO='command-centre'`, `WI_REPO='work-inbox'` — this one Worker, one secret, writes to **both** repos (matches CLAUDE.md's description of the PAT as "Contents RW, command-centre + work-inbox only"). Isolating this secret protects both dashboards' write path from the shared-budget problem, not just command-centre's.

**GitHub-side isolation setup is already complete — found, not built:** `kevinlelitteadmin` (the same collaborator account Zara used for kevin-personal-finance) is **already an accepted collaborator with `write`/`push:true` on both `command-centre` and `work-inbox`** (confirmed live via `GET /repos/begb0037admin/{repo}/collaborators` on both repos; zero pending invitations on either). Nobody had to add it — either Kevin did this proactively or it happened as a side effect of other work. This means the only remaining step is a token + the `wrangler secret put HRIS_GITHUB_PAT --name cc-tasks-writer` rotation — no collaborator invite step needed.

**Shared `begb0037admin` budget right now:** `GET /rate_limit` → `limit 5000, remaining 4991, used 9` — healthy at audit time (today's earlier incident was on kevin-personal-finance, not this Worker), but that's exactly the shared bucket this isolation removes as a future single point of failure for command-centre/work-inbox too.

## Decision point for Kevin — not yet decided

Two valid options for the actual token, judgement call flagged rather than picked unilaterally:
1. **Reuse the exact classic PAT Zara validated for kevin-finance-ai** (`kevinlelitteadmin`, scope `repo`, ~90-day expiry). Classic PAT scope isn't repo-limited — it already covers every repo the account can access, which as of this audit includes both command-centre and work-inbox. Zero new token generation, fastest path.
2. **Generate a separate token under the same `kevinlelitteadmin` account**, scoped narrower (fine-grained, Contents RW, command-centre + work-inbox only) — mirrors the existing `HRIS_GITHUB_PAT`'s own scope discipline more closely, and keeps kevin-finance-ai's credential and cc-tasks-writer's credential independently revocable/auditable even though both sit under the same collaborator identity. Costs Kevin one more manual PAT-generation step (same as before — inherently a human-only GitHub UI action, no agent can do it).

Recommendation: option 2, for blast-radius/audit-clarity reasons, but option 1 is a legitimate zero-setup alternative if Kevin would rather not generate another token today. Either way this needs Kevin's explicit choice before proceeding — not decided by this session.

## What has NOT been done
- No token received or validated against the GitHub API yet.
- No `wrangler secret put` run — production `HRIS_GITHUB_PAT` on `cc-tasks-writer` is untouched.
- No dry-run performed yet (blocked on having a token to validate).
- Old shared PAT should stay unrevoked for a grace period after cutover, same as Zara's recommendation for finance.

## Next action
Get Kevin's decision (reuse vs new token) and the token value (pasted in-session only, same as Zara's pattern — never written to a file or committed). Then: validate the token live against the GitHub API (identity, scope, push:true on both repos, fresh rate-limit bucket) exactly as Zara did before it goes near the Worker secret. State the restore point again at that moment. Get Kevin's fresh explicit go-ahead for the specific `wrangler secret put HRIS_GITHUB_PAT --name cc-tasks-writer` cutover. Run it. Verify with `wrangler deployments list --name cc-tasks-writer` (new Secret Change version at 100%) plus a live functional check — e.g. make a real quick-add/tier-move on the dashboard and confirm it round-trips into `data/tasks.json`, not just that the command exited 0.

---



## TL;DR
Continued from the `cc-cleanup-items-5-8-build-12aug` checkpoint (commit `e672a94`), which purged done:true tasks from This Week + Parked (8 tasks, per Kevin's original approval scope) but flagged 9 more done tasks outside that scope: 5 in Today, 4 in Tomorrow. Kevin has now approved purging those too. Done, verified live, pushed.

## Live re-verification before touching anything
Did not trust the e672a94 checkpoint's 5+4 count blindly. Fetched `data/tasks.json` fresh via GitHub Contents API (sha `f039cb89...`, size 89,293 bytes, non-zero, confirmed before proceeding) and independently recounted `done:true` per tier from that fresh pull:
- **Today: 5 done** — `t005`, `t024`, `t027`, `task-1782599630157`, `t014`
- **Tomorrow: 4 done** — `t003`, `t021`, `t025`, `t040`
- Week: 0 done, Parked: 0 done (confirms the earlier item-5 purge is still intact, no regression)

Matched the checkpoint's count exactly — no drift since 12 Aug. Total live tasks before edit: 55 (tier counts: today=9, tomorrow=12, week=25, parked=9).

## Backup-and-verify sequence (command-centre CLAUDE.md mandatory protocol, followed in full)
1. GET live file — sha `f039cb895e595738c4b7ea71ceb4a32f04eeb258`, size 89,293 bytes, confirmed non-zero.
2. Backup created: `Archive/tasks_backup_20260812_1403.json` — commit `e859a64` (content sha identical to live file's sha, confirming byte-for-byte backup).
3. Backup verified live via a fresh GET after commit: sha and size matched exactly before any edit was made.
4. Edit made and pushed — see below.
5. Post-change sha verified live via a fresh GET after push.

**Windows text-mode CRLF gotcha hit and caught mid-task** (per `drew/memory/windows-text-mode-write-crlf-corruption.md`): first attempt wrote the edited JSON with Python's text-mode `'w'`, which silently converted `
`→`
` and added a trailing newline not present in the original (89,293-byte original ends `}
]` with no trailing newline; the corrupted draft ended `}
]
`). Caught by comparing raw tail bytes before pushing, not after — rebuilt using binary `'wb'` mode, confirmed zero `
` bytes and exact original ending (`}
]`) before the PUT.

## Edit
Removed the 9 confirmed `done:true` tasks from Today (5) and Tomorrow (4) only — This Week and Parked untouched (already clean from the prior purge), no other tier touched. Sanity-asserted in code that every removed ID was actually `done:true` and actually in `today`/`tomorrow` before allowing the write.

**Before → after counts (independently re-verified via a fresh GitHub re-pull post-push, not from local memory of the edit):**
- Total tasks: 55 → 46
- Today: 9 (5 done) → 4 (0 done)
- Tomorrow: 12 (4 done) → 8 (0 done)
- Week: 25 (0 done, unchanged) — untouched
- Parked: 9 (0 done, unchanged) — untouched
- Confirmed none of the 9 removed IDs present in the fresh post-push pull.

**Write commit:** `0bf382a` — `data/tasks.json` sha `f039cb89...` → `1a2bf1f5...`, size 89,293 → 73,135 bytes. Post-change sha verified live matches the PUT response exactly.

## Codex status — DISCLOSED, NOT SKIPPED SILENTLY
Probed Codex CLI (`codex exec -s read-only`) before starting the edit. Still out of usage: `ERROR: You've hit your usage limit... try again at Aug 18th, 2026 7:28 AM.` No Codex review pass (before-start, per-step, or end-to-end) touched this change. Same gap as the `cc-cleanup-items-5-8-build-12aug` session earlier the same day — not yet resolved, will still be out until 18 Aug per the error message.

## Now-clean state
All 4 tiers (Today, Tomorrow, This Week, Parked) show 0 `done:true` tasks in live `data/tasks.json` as of this checkpoint. The done-task-hygiene item from the `cc-this-week-parked-bloat-investigation-12aug` proposal (finding #1) is now fully addressed across all tiers, not just Week/Parked.

## Next action
None outstanding from this specific purge — all originally-flagged 17 done tasks across all 4 tiers are now clean. Remaining open items from the same 12 Aug investigation/build session, not part of this task's scope:
- Item 8 (staleness-badge fix, `lastActivityTs()` ignoring routine inbound-email masking) — built and logic-verified but sitting on holding branch `holding/item8-staleness-badge-fix` (commit `7c7406a`), blocked on Kevin's screenshot approval (no screenshot tool available in recent sessions — check again with a fresh session before assuming still blocked).
- Duplicate-task cleanup (existing live duplicates: Development Insight ×2, GLAM ×2) — item 6 only added prevention (fuzzy-dedup guard in `fetch_inbox.py`), did not merge/clean the existing pairs; still open if Kevin wants it done.
- Once Codex usage resets (~18 Aug 2026), worth a retroactive read-only Codex pass over this session's `data/tasks.json` diff and the held item-8 `js/app.js` diff, given both shipped without one.

---

# Handover — 02 August 2026, continued (Drew) — cc-tasks-writer Worker fix, PROPOSED NOT DEPLOYED

## TL;DR (this addendum)
Kevin asked for the Cloudflare Worker patch for the 502 / "Failed to fetch" instability. Got the real Worker source from Kevin (it's not in any repo). Found the actual bug is worse than the working hypothesis: `handleTasks()` always re-reads tasks.json fresh immediately before writing, so GitHub's sha-based conflict check almost never fires — meaning the Worker isn't failing to save on conflict, it's **silently succeeding and overwriting** whatever `fetch_inbox.py`'s Phase 3.6 wrote in the minutes since the browser tab last loaded. Also found and fixed: an active bug corrupting every daily `Archive/` backup for non-ASCII characters (£, en/em dash, curly quotes), an unhandled-exception path that's the likely real cause of "Failed to fetch", blanket 502s masking the actual GitHub error, and `/ai-log` reflecting any Origin instead of using the CORS allow-list. Full corrected source committed as a reference copy — **not deployed**, Kevin deploys manually via the Cloudflare dashboard (neither Drew nor the coordinator has Cloudflare access).

**File:** `cloudflare-worker/cc-tasks-writer-proposed.js` (commit `4ef2fbf5e`) — read the header comment block for the full change list and reasoning; don't just diff it blind.

**Deployment (Kevin, manual):** Cloudflare dashboard → Workers & Pages → cc-tasks-writer → Edit code → replace entire file with `cc-tasks-writer-proposed.js` → Save and Deploy. Structure mirrors the original exactly (same function/constant names) so it's an easy side-by-side diff, not a from-scratch rewrite to review.

**Verified independently (Node, not just read-through):** the diagnosed backup-corruption bug reproduces exactly as described with the old code's decode/re-encode pattern, and the fix (straight base64 passthrough, no round-trip) produces clean output. `mergeRemote()`'s three cases (remote-longer-actions-wins, local-longer-kept, remote-only-task-appended) all verified against a hand-built test case. Full corrected file passes `node --check` as valid ES module syntax.

**What this fixes without any client change:** the daily backup corruption, the unhandled-exception → "Failed to fetch" path, blanket 502s, `/ai-log` CORS. Also narrows (but does not close) the silent-clobber window: the Worker's own GET-to-PUT race (a few hundred ms) is now caught and merged instead of silently overwriting.

**What this does NOT fix without a further, NOT-YET-APPROVED client-side change:** the much larger "browser tab open for minutes, fetch_inbox.py wrote in the meantime" clobber window — closing that needs the client to send a `baseSha` (the sha of the tasks.json version its in-memory copy is based on) so the Worker can detect staleness before writing rather than reacting to a conflict that, per the finding above, essentially never occurs today. The Worker-side half of this is already written and live in the proposed file (`body.baseSha`, inert/no-op if absent) — only the client half (`js/api.js`, `js/app.js`) is outstanding, deliberately not written or pushed, since this is an architecture change needing Kevin's explicit go-ahead, not a bug fix. Full proposal sketch is in the `PHASE 2` comment block at the bottom of the proposed Worker file.

**Also flagged, not fixed (out of scope, lower stakes):** `handleInboxState` (ticks.json) has the same fresh-GET-then-PUT shape as `handleTasks` did, so two browser tabs syncing ticks around the same time could plausibly clobber each other the same way. Ticks are booleans though — much lower stakes than losing a real action-log entry — and this wasn't reported as broken, so left alone.

**Honest unverified list:** none of this has run against the real Worker — no Cloudflare access this session, same as always. The working hypothesis behind the whole fix (that `fetch_inbox.py`'s direct-to-GitHub writes are the concurrent writer causing the clobber) is still a hypothesis, not proven — strong circumstantial support (timing correlation with auto-promotion/triage-cap changes, and `fetch_inbox.py` demonstrably bypasses this Worker entirely per its own CLAUDE.md), but nobody has caught a live 409 or a live clobber in the act. Kevin confirmed the `HRIS_GITHUB_PAT` is set to never expire, so that's ruled out as a cause. The `baseSha`-via-ETag idea in the Phase 2 sketch is unverified — don't assume `github-proxy.lelitte.co.uk` forwards GitHub's ETag header until checked live.

---

# Handover — 02 August 2026 (Drew)

## TL;DR
Fixed two bugs Kevin hit while using the "From your inbox" suggestions panel: (1) no way back to the Task Board once you clicked into the inbox view — permanent nav link added; (2) `promoteSuggestion()` could silently lose a promoted task if the save to `cc-tasks-writer` failed (502 or a network-level "Failed to fetch"), because the suggestion was dismissed client-side before the save was confirmed. Both fixed, live on main, verified against the real production origin (`begb0037admin.github.io/command-centre`), not just the diff.

## What happened this session

**Bug 1 — stuck on inbox view, no way back except F5.**
- Root cause: `showView('inbox')` is wired from the sidebar's inbox widget; `showView('board')` was only ever called from a `setTier()` function whose markup (`qa-tier-wrap` etc. — an old quick-add tier dropdown) no longer exists in `index.html`. The only path back was orphaned.
- Fix (commit `9cf6adff9`): added a permanent `← Task Board` link to `.inbox-toolbar` in `index.html` (reuses existing `.inbox-toolbar a` styling, no new CSS), calling `showView('board')`.
- Also added: `promoteSuggestion()` now calls `showView('board')` automatically after a successful save (see below), so a completed promote returns you to the board without needing the manual link.
- Screenshotted on a holding branch (`preview-nav-fix`, previewed via raw.githack.com against the already-live production JS/CSS) before pushing. **Kevin approval: "approved."** Pushed to main, holding branch deleted.
- Live-verified end-to-end on the real production origin after push: clicked into inbox view, confirmed the link renders, clicked it, confirmed it returns to the board. Also caught and worked around a GitHub Pages CDN propagation lag during verification (page briefly served the pre-fix version for less than a minute after a successful deploy) — confirmed via direct `curl` bypassing all caches before re-testing in the browser once genuinely propagated.

**Bug 2 — promoted suggestions could be silently lost on a failed save.**
- Root cause: `promoteSuggestion()` in `js/app.js` called `dismissSuggestion()` (a `localStorage` flag) *before* `persistTasks()` even attempted the write to `cc-tasks-writer`, and regardless of whether that write succeeded. If the Worker returned a bad status (502) or the `fetch()` itself threw (`TypeError: Failed to fetch` — a network-level failure, distinct from a bad HTTP response), the new task never reached `data/tasks.json`, but the suggestion was already hidden going forward — dismissed client-side and filtered out of future suggestion loads. The task vanished with only a small dismissable toast as evidence.
- Fix (commits `9002432a1`, `708747fcd`):
  - `js/api.js`: `persistTasks()` now returns `true`/`false` explicitly from both the `res.ok === false` branch and the `catch(e)` branch (network-level failures), instead of returning nothing.
  - `js/app.js`: `promoteSuggestion()` now pushes the new task and calls `persistTasks()` first, checks its return value, and only calls `dismissSuggestion()` (+ the new `showView('board')` auto-return) on confirmed success. On failure, it rolls the in-memory task back out of `tasks` and re-renders, so the suggestion is never marked covered/dismissed and correctly reappears.
  - Verified explicitly that the rollback covers **both** failure modes — re-fetched the live pushed code and confirmed `catch(e)` returns `false` (not `undefined`, doesn't let the exception propagate), so `promoteSuggestion()`'s `if(ok)` check behaves identically whether the Worker responds with a bad status or is unreachable outright.
- Investigated whether "Failed to fetch" was specific to the "This Week" tier (Kevin's report): no — all three promote buttons call the identical function/fetch, tier is just a data field in the payload, no tier-specific code path exists. Live-probed `cc-tasks-writer` from the real production origin (3× OPTIONS + 3× GET, no writes) — 6/6 clean responses, no fetch failures. Conclusion: most likely the same intermittent Worker flakiness as the 502, a different failure symptom, not a distinct bug — but not fully root-caused, since Cloudflare Worker logs aren't reachable from this session.
- Behavioural fix only, no visual change — pushed without a screenshot gate per CLAUDE.md (only visual changes require one).

**Backups:** `Archive/index_backup_20260802_2137.html`, `Archive/app_backup_20260802_2137.js`, `Archive/api_backup_20260802_2137.js` — all taken and SHA-verified before any edit, per the mandatory backup-and-verify protocol.

**Test data left in place (not mine — added by the coordinating session so Kevin could exercise the promote flow):** two throwaway suggestions in `work-inbox/data/inbox_suggestions.json`, `entry_id` `TEST-PROMOTE-0001` (tier: week) and `TEST-PROMOTE-0002` (tier: today), both labelled "safe to delete." Their `entry_id`s aren't real Outlook IDs so "Open email" won't resolve on them — that's expected, not a bug. Safe to leave for Kevin to clear whenever.

## Known issues (unchanged, not touched this session)
- Drag reorder has no visual animation (work-inbox, tracked there)
- `cc-tasks-writer` Worker is intermittently unreliable (502 and now confirmed "Failed to fetch" as a second symptom) — root cause not yet confirmed, needs Cloudflare dashboard/log access this session didn't have

## Next action
None outstanding from this session. If the Worker flakiness recurs, worth a follow-up with actual Cloudflare Worker log access to root-cause it properly rather than continuing to infer from client-side symptoms alone.

---

# Handover — 08 June 2026

## TL;DR
Kevin is on phased return (4hrs/day, full remote). Today's session established a new task data standard (description/actions separation) and applied it to all 14 tasks. Two new tasks added: Chemistry bulk delete (t014) and smart notes escalation (t002 updated). Backup in place.

## What happened this session
- Chemistry bulk delete (case 68974493) investigated — ball was in Oxford's court since 3 Jun, not AG's. Julie Hickman is the contact for appraisal cycle details. Draft reply to Julie prepared.
- Smart notes escalation (Cority 00476764 / CCC-19664) — escalation comment submitted via ticket. Quality PUG 16 June identified as second pressure point.
- Command centre task data standard established: description = context/history; actions = dated log (done/todo/awaiting). All 14 tasks restructured.
- Field renamed from `notes` to `description` in tasks.json and index.html.
- Backup: Archive/tasks_backup_20260608.json

## Awaiting
- Julie Hickman reply (Chemistry bulk delete details)
- Freeda Franks reply (smart notes escalation)
- Simon to send Athena's email (flex points)
- Marie's return (DPIA sign-off, Odyssey review, flex points plan)

## Next action
Brief team Tuesday 9 June. Monitor DSC upload and HWP check Wednesday 10 June.
