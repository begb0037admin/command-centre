# Handover — 12 August 2026, continued (Drew) — item 5 completion: Today/Tomorrow done-task purge

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
`). Caught by comparing raw tail bytes before pushing, not after — rebuilt using binary `'wb'` mode, confirmed zero `` bytes and exact original ending (`}
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
