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
