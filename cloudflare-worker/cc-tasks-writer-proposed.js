// cc-tasks-writer Worker — corrected source, proposed by Drew, 2 Aug 2026.
// STATUS NOTE (21 Aug 2026): the "NOT YET DEPLOYED" line below is stale --
// this file (with the Phase 2 mergeTicks additions) was confirmed live via
// `wrangler deployments list --name cc-tasks-writer` (version `f597a375`,
// see drew/memory/wi-phase2-silentfail-finish-ticksretry-correction-21aug.md).
// Kept for history; deploy mechanism for code changes (as opposed to secret
// rotation, which is confirmed to go via `wrangler secret put`) is still
// Kevin pasting this file into the Cloudflare dashboard and clicking Save
// and Deploy, per the original instruction just below, unless a future
// session confirms `wrangler deploy` also works for this Worker.
// Kevin deploys manually via Cloudflare dashboard:
// Workers & Pages -> cc-tasks-writer -> Edit code -> replace entire file
// with this -> Save and Deploy.
//
// This is a full-file replacement, not a patch, so it's a clean diff against
// whatever Kevin pastes back in for review. Structure mirrors the original
// source exactly (same function names, same constant names, same route
// order) to keep the diff easy to reason about.
//
// ============================================================================
// SUMMARY OF WHAT CHANGED AND WHY
// ============================================================================
//
// 1. SILENT CLOBBER RISK (the real data-loss issue) — PARTIALLY FIXED here,
//    FULLY fixed only requires a client-side change (see "PHASE 2" below,
//    NOT included in this file, NOT deployed, needs your explicit go-ahead).
//
//    What was actually happening: handleTasks() always re-reads tasks.json
//    fresh, right before writing, and always uses that freshly-read sha.
//    That means GitHub's own optimistic-concurrency check (the sha match)
//    almost never fails — the Worker is never using a stale sha, even when
//    the CLIENT's in-memory tasks array is many minutes stale. So a browser
//    tab open since before fetch_inbox.py's last Phase 3.6 run will, on
//    save, successfully overwrite tasks.json with its stale copy — no error,
//    no 409, nothing — silently discarding whatever Phase 3.6 appended in
//    the meantime. This is a bigger, more active problem than my first pass
//    at this (before seeing the real source) assumed.
//
//    What THIS file fixes without any client change: the one conflict this
//    Worker CAN detect today — a write landing in the split-second between
//    ITS OWN read and ITS OWN write — now merges instead of silently
//    succeeding or opaquely failing. Narrow, but strictly better than today,
//    zero client coordination needed.
//
//    What THIS file does NOT fix: the much larger "client had the page open
//    for minutes, something changed server-side in the meantime" window.
//    Closing that gap requires the CLIENT to tell the Worker what version it
//    started from (a `baseSha` field) so the Worker can tell "nothing changed,
//    safe to write directly" from "something changed, must merge" — see the
//    PHASE 2 section at the bottom of this file for the exact proposed
//    client-side change. NOT deployed. NOT pushed to command-centre. Needs
//    your explicit approval on the approach before any of that goes anywhere
//    near js/api.js or js/app.js.
//
// 2. "Failed to fetch" — FIXED. Root cause: ghGet/ghPut/handleTasks/
//    handleInboxState had no try/catch anywhere, and neither did the
//    top-level fetch handler beyond the JSON.parse call. Any thrown
//    exception (a transient fetch() failure reaching api.github.com, etc.)
//    propagated all the way out of the Worker uncaught. Cloudflare then
//    serves its own generic error page for that, which does NOT carry the
//    CORS headers this code builds (because the code never got to return a
//    Response at all) — and a cross-origin response missing CORS headers is
//    exactly what makes a browser's fetch() reject with the generic
//    "TypeError: Failed to fetch", indistinguishable from a real network
//    failure. Fixed by wrapping the entire top-level handler in try/catch,
//    so literally every code path — success, GitHub error, unexpected
//    exception — returns a real Response with the correct CORS headers.
//
// 3. Blanket 502s masking the real cause — FIXED. ghGet used to collapse
//    every non-2xx GitHub response (401, 403, 404, 5xx, anything) into a
//    bare `null`, and handleTasks/handleInboxState turned that into a fixed
//    "Could not read tasks.json" / "Write failed" 502 with no real status or
//    body. ghGet/ghPut error paths now propagate the actual GitHub status
//    code and response body back to the client, so a future instability
//    episode is actually diagnosable from the toast/console instead of
//    looking like the same unexplained flakiness every time. (Kevin's
//    confirmed the PAT is set to never expire, so 401 here means something
//    else — revoked/wrong token, GitHub-side issue — not expiry; the error
//    message reflects that rather than pointing at expiry.)
//
// 4. Daily backup corruption — FIXED. The backup step did
//    `atob(current.content...)` (turning base64 into a raw-byte string),
//    then handed that to ghPut(), which unconditionally re-encodes its
//    `content` argument as if it were plain Unicode text
//    (`btoa(unescape(encodeURIComponent(content)))`). Running a byte string
//    through that treats each raw byte as its own Unicode codepoint and
//    double-encodes it — every non-ASCII character (£, en/em dash, curly
//    quotes — all present in real task data) comes out corrupted in the
//    backup. Fixed by never decoding the backup content at all: GitHub's GET
//    response already IS valid base64 of the exact bytes we want to copy, so
//    the backup write now passes that base64 straight through unchanged
//    (new `ghPutRaw` helper, used only for this byte-for-byte copy case).
//
// 5. /ai-log CORS reflecting any origin — FIXED. handleAiLog built its own
//    headers with `'Access-Control-Allow-Origin': origin` (whatever Origin
//    header the request sent, no check), instead of using the module-level
//    corsHeaders() function that the other two routes already use, which
//    checks against CORS_ORIGINS. Any website could have called /ai-log and
//    spent Kevin's Anthropic credits. handleAiLog now takes the same `hdrs`
//    the top-level handler already computed via corsHeaders(origin), so all
//    three routes are consistently allow-listed.
//
// 6. Deprecated `unescape`/`escape` — REPLACED with TextEncoder/TextDecoder-
//    based base64 helpers (utf8ToBase64 / decodeBase64Utf8), which are the
//    current standard way to do this in a Workers/browser-like runtime and
//    happen to also be what's used to fix #4 above.
//
// PRESERVED, UNCHANGED: CORS_ORIGINS list itself, only writes data/tasks.json
// (command-centre) and data/ticks.json (work-inbox) via the same two routes,
// daily Archive/ backup still enforced before every tasks.json write, the
// full AI prompt text in handleAiLog (copied verbatim from
// cloudflare-worker/ai-log-endpoint.js in this repo, which I read directly
// this session — Kevin's paste truncated it for brevity but I did not
// reconstruct or guess any of it).
//
// ============================================================================
// PHASE 3 ADDITIONS (21 Aug 2026) — race-window close + done-sync
// ============================================================================
//
// 7. RACE-WINDOW GAP CLOSED FOR ticks.json — handleInboxState now accepts
//    the same optional `baseSha` the client can send that handleTasks
//    already handled (Phase 2, section 1 above), and merges via mergeTicks
//    whenever the client's baseSha is stale relative to the freshly-read
//    remote sha — not just on this Worker's own 409 retry. This closes the
//    same "browser tab open for minutes" gap for ticks.json that PHASE 2
//    at the bottom of this file already documented as open for BOTH
//    routes. Client-side capture/send is now built too (js/api.js this
//    repo, js/app.js work-inbox) — see each file's own comments. Both
//    handleTasks and handleInboxState now also return the new blob `sha`
//    in their success JSON body, so a client never needs a second fetch
//    just to refresh its own baseSha after a save.
//
// 8. DONE-SYNC — marking a task done/undone in command-centre now pushes a
//    matching flag-and-hide (never delete) to work-inbox's ticks.json, and
//    vice versa, for the tiers/items that structurally exist in both
//    systems. See ccDoneSyncKey/syncTaskDoneToTicks (CC->WI) and
//    findTaskByEntryId/findTaskById/syncTickToTaskDone (WI->CC) below for
//    the exact key scheme and the anti-echo/loop-safety argument. This
//    only runs AFTER the primary write for that request has already
//    succeeded, is fully best-effort (a failure here never rolls back or
//    fails the primary write), and only acts on a genuine value TRANSITION
//    relative to the freshest possible remote read — never on the raw
//    payload — which is what makes it loop-safe without needing a separate
//    tag/marker field (booleans have no room for one).
//
// ============================================================================

const CORS_ORIGINS = [
  'https://cc.lelitte.co.uk',
  'https://wi.lelitte.co.uk',
  'https://begb0037admin.github.io',
  'https://command-centre.kevinlelitte.workers.dev',
];
const OWNER = 'begb0037admin';
const CC_REPO = 'command-centre';
const WI_REPO = 'work-inbox';

function corsHeaders(origin) {
  const allowed = CORS_ORIGINS.includes(origin) ? origin : CORS_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(status, obj, hdrs) {
  return new Response(JSON.stringify(obj), { status, headers: { ...hdrs, 'Content-Type': 'application/json' } });
}

// GitHub error -> client-facing response. Propagates the real status/body
// instead of a blanket 502, so failures are diagnosable. (PAT is confirmed
// set to never expire, so 401 here is NOT an expiry hint -- something else:
// wrong/revoked token, or a genuine GitHub-side auth hiccup.)
function githubErrorResponse(status, phase, detail, hdrs) {
  const safeDetail = String(detail || '').slice(0, 300);
  if (status === 401) {
    return jsonResponse(502, { error: `GitHub auth failed during ${phase} (401): ${safeDetail}`, githubStatus: 401 }, hdrs);
  }
  if (status === 403) {
    return jsonResponse(502, { error: `GitHub forbidden/rate-limited during ${phase} (403): ${safeDetail}`, githubStatus: 403 }, hdrs);
  }
  return jsonResponse(502, { error: `GitHub error during ${phase}: HTTP ${status} ${safeDetail}`, githubStatus: status }, hdrs);
}

// ---------------------------------------------------------------------------
// Base64 helpers — TextEncoder/TextDecoder based, no deprecated
// escape/unescape. utf8ToBase64 is for encoding genuine Unicode TEXT
// (e.g. JSON.stringify output). decodeBase64Utf8 is for decoding GitHub's
// base64 content back into text when we actually need to read/parse it
// (e.g. for a conflict merge) — NOT used for the backup copy, which passes
// base64 straight through untouched (see ghPutRaw).
// ---------------------------------------------------------------------------
function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function decodeBase64Utf8(b64) {
  const binary = atob(b64.replace(/\n/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

// ---------------------------------------------------------------------------
// GitHub Contents API — GET now returns a result object instead of
// collapsing every failure into `null`, so callers can see and propagate
// the real status.
// ---------------------------------------------------------------------------
async function ghGet(pat, repo, path) {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${repo}/contents/${path}?ref=main`,
    { headers: { Authorization: `token ${pat}`, Accept: 'application/vnd.github.v3+json', 'User-Agent': 'cc-tasks-writer' } }
  );
  if (res.status === 404) return { ok: false, status: 404, error: 'not found', data: null };
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return { ok: false, status: res.status, error: text, data: null };
  }
  const data = await res.json();
  return { ok: true, status: res.status, data };
}

// ghPutRaw: content is ALREADY base64 -- passed straight through. Used for
// the daily backup, which is a byte-for-byte copy of what GitHub already
// gave us (this is what fixes the corruption bug -- no decode/re-encode
// round-trip at all).
async function ghPutRaw(pat, repo, path, base64Content, message, sha) {
  const body = { message, content: base64Content, branch: 'main' };
  if (sha) body.sha = sha;
  return fetch(
    `https://api.github.com/repos/${OWNER}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: { Authorization: `token ${pat}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json', 'User-Agent': 'cc-tasks-writer' },
      body: JSON.stringify(body),
    }
  );
}
// ghPut: content is plain UTF-8 TEXT (e.g. JSON.stringify output) -- encodes
// it safely before writing.
async function ghPut(pat, repo, path, content, message, sha) {
  return ghPutRaw(pat, repo, path, utf8ToBase64(content), message, sha);
}

// ---------------------------------------------------------------------------
// mergeRemote — line-for-line port of js/api.js's mergeRemote() in this
// repo (read live from GitHub this session). If that client function's
// merge rule ever changes, this must be updated to match, or client- and
// Worker-triggered merges will diverge silently. Non-mutating (returns a
// new array) since this runs server-side against data that isn't "ours".
//
// Rule: local (incoming) tasks are the base. For every task in remote: if it
// also exists locally, remote's `actions` win ONLY when longer (crude but
// deliberate "more actions = more complete" heuristic — this only ever
// touches `actions`, nothing else). If remote has a task locally missing
// entirely, it gets appended, never dropped.
//
// KNOWN LIMITATION, stated honestly: this rule cannot distinguish "task
// missing from incoming because the user just deleted it" from "task
// missing from incoming because the client never knew about a concurrent
// addition." It always resolves that ambiguity by keeping the item. That
// means a delete that lands in the exact same narrow window as a concurrent
// remote write to the SAME task could occasionally get silently
// resurrected — visible, obviously-wrong, cheap to fix (delete it again) —
// rather than the current behaviour, which is invisibly and permanently
// losing real Phase 3.6 action-log entries with no trace. Given this
// session's whole thrust has been "never trade a visible error for silent
// data loss," biasing toward "when genuinely uncertain, keep the disputed
// item" is the deliberate choice here, not an oversight.
// ---------------------------------------------------------------------------
function mergeRemote(localTasks, remoteTasks) {
  if (!Array.isArray(remoteTasks)) return localTasks;
  const merged = localTasks.map(t => ({ ...t }));
  const localMap = {};
  merged.forEach(t => { localMap[t.id] = t; });
  remoteTasks.forEach(rt => {
    const lt = localMap[rt.id];
    if (lt) {
      const rtActions = Array.isArray(rt.actions) ? rt.actions.join('') : (rt.actions || '');
      const ltActions = Array.isArray(lt.actions) ? lt.actions.join('') : (lt.actions || '');
      if (rtActions.length > ltActions.length) lt.actions = rt.actions;
    } else {
      const clone = { ...rt };
      merged.push(clone);
      localMap[rt.id] = clone;
    }
  });
  return merged;
}

// ---------------------------------------------------------------------------
// DONE-SYNC — Phase 3 (21 Aug 2026). Marking a task done/undone in either
// command-centre (tasks.json) or work-inbox (ticks.json) reversibly flags
// the same item done/hidden in the other, where a structural counterpart
// exists. Flag-and-hide only, matching how "done" already works in both
// systems today — never deletion.
//
// KEY SCHEME (read live from work-inbox/js/app.js this session, not
// guessed): a WI Priorities-board card's own stable tick key is either
// 'eid_<entry_id>' (a raw-email-sourced item, from _priGetKey()) or
// 'id_<ccTaskId>' (mirrored from a live command-centre task). Confirmed via
// work-inbox/fetch_inbox.py (~line 1574-1580, the "Command Centre loaded"
// block): the mirrored entry it builds for prioritiesToday/Tomorrow/Week
// carries `id` (the CC task's own id) but never `entry_id`/`entryId` — so
// EVERY CC task mirrored into WI's priorities board is keyed 'id_<task.id>'
// there, regardless of whether that task separately also has its own
// `entryId` field (which reflects the last EMAIL to touch the task, not a
// stable link to a specific WI card). Only tasks with tier in
// {today,tomorrow,week} are mirrored at all (fetch_inbox.py ~line
// 1582-1587) — 'parked' has no WI counterpart, so parked tasks are
// structurally out of scope for this sync in both directions (finding 7 of
// the 21 Aug scoping report, drew/memory/wi-cc-phase3-donesync-scoping-21aug.md).
//
// ANTI-ECHO / PING-PONG PREVENTION: not an explicit tag on the data itself
// (done/tick values are plain booleans in both files — no room to attach
// one without a schema change to data Kevin already relies on elsewhere).
// Instead, both sync directions act ONLY on a genuine value TRANSITION
// relative to a freshly-read copy of the OTHER file (read fresh, in this
// same request, immediately before the derived write) — never on the raw
// incoming request payload. Once both files agree, any later request that
// resends the same value is a no-op in both directions, so a loop cannot
// run more than one hop per real user action: this is enforced by
// construction (the derived-write helpers below call a plain internal
// function directly, never the other route's own handler, so there is no
// code path by which a derived write could itself trigger a further
// derived write), not merely something that happens not to occur in
// testing.
// ---------------------------------------------------------------------------
function ccDoneSyncKey(task) {
  if (!task || task.tier === 'parked' || !task.id) return null;
  return 'id_' + task.id;
}

// entry_id -> CC task match, used for the WI->CC 'eid_' direction. 0 or >1
// matches is treated as "no safe counterpart" and skipped, never guessed —
// same "when genuinely uncertain, don't force it" principle already used
// for mergeRemote's own known limitation, further up this file.
function findTaskByEntryId(tasks, entryId) {
  const matches = (tasks || []).filter(t => t && t.entryId === entryId);
  return matches.length === 1 ? matches[0] : null;
}
function findTaskById(tasks, id) {
  return (tasks || []).find(t => t && t.id === id) || null;
}

// CC -> WI: after tasks.json is written, push any done-state TRANSITIONS to
// ticks.json. `beforeTasks` = the tasks array as it stood on GitHub
// immediately before this write (the SAME read this request already did
// for its own sha check — not the client's original baseline, which may be
// stale); `afterTasks` = what was actually just written. Best-effort: any
// failure here is swallowed and reported back, never allowed to undo or
// fail the tasks.json write that already succeeded.
async function syncTaskDoneToTicks(pat, beforeTasks, afterTasks) {
  const beforeMap = {};
  (beforeTasks || []).forEach(t => { if (t && t.id) beforeMap[t.id] = !!t.done; });
  const transitions = [];
  (afterTasks || []).forEach(t => {
    const key = ccDoneSyncKey(t);
    if (!key) return; // parked, or no id at all -- no WI counterpart, skip
    const was = beforeMap.hasOwnProperty(t.id) ? beforeMap[t.id] : false;
    const now = !!t.done;
    if (was !== now) transitions.push({ key, value: now, id: t.id });
  });
  if (!transitions.length) return { synced: [] };

  const MAX_ATTEMPTS = 3; // own bounded retry -- this is a second, independent write in the same request
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const current = await ghGet(pat, WI_REPO, 'data/ticks.json');
    if (!current.ok && current.status !== 404) return { synced: [], error: 'could not read ticks.json for done-sync' };
    let remoteDoc = { ticks: {} };
    if (current.ok) {
      try { remoteDoc = JSON.parse(decodeBase64Utf8(current.data.content)); } catch (e) { return { synced: [], error: 'could not parse ticks.json for done-sync' }; }
    }
    const ticks = { ...(remoteDoc.ticks || {}) };
    transitions.forEach(tr => { ticks[tr.key] = tr.value; });
    const docToWrite = { ...remoteDoc, ticks, updated_at: new Date().toISOString() };
    const sha = current.ok ? current.data.sha : undefined;
    const writeRes = await ghPut(
      pat, WI_REPO, 'data/ticks.json', JSON.stringify(docToWrite, null, 2),
      'Done-sync from command-centre: ' + transitions.map(t => t.id + (t.value ? ' done' : ' undone')).join(', '),
      sha
    );
    if (writeRes.ok) return { synced: transitions.map(t => t.id) };
    if (writeRes.status === 409 || writeRes.status === 422) continue;
    return { synced: [], error: 'ticks.json write failed during done-sync, status ' + writeRes.status };
  }
  return { synced: [], error: 'ticks.json done-sync did not land after retries -- tasks.json write itself already succeeded' };
}

// WI -> CC: after ticks.json is written, push any TRANSITIONS on a
// recognised 'id_'/'eid_' key to command-centre's tasks.json done flag.
// `beforeTicks`/`afterTicks` are plain {key:bool} maps -- before/after the
// SAME write this request already performed. Any other key shape (the
// legacy day-scoped keys, e.g. from renderItems' older cls_i ids) has no CC
// counterpart at all -- not an error, just structurally out of scope, same
// principle as the parked-tier skip above.
async function syncTickToTaskDone(pat, beforeTicks, afterTicks) {
  const before = beforeTicks || {};
  const transitions = [];
  Object.keys(afterTicks || {}).forEach(key => {
    const now = !!afterTicks[key];
    const was = !!before[key];
    if (now === was) return;
    if (key.indexOf('id_') === 0) transitions.push({ matchType: 'id', matchValue: key.slice(3), value: now });
    else if (key.indexOf('eid_') === 0) transitions.push({ matchType: 'entryId', matchValue: key.slice(4), value: now });
  });
  if (!transitions.length) return { synced: [] };

  const MAX_ATTEMPTS = 3;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const current = await ghGet(pat, CC_REPO, 'data/tasks.json');
    if (!current.ok) return { synced: [], error: 'could not read tasks.json for done-sync' };
    let remoteParsed;
    try { remoteParsed = JSON.parse(decodeBase64Utf8(current.data.content)); } catch (e) { return { synced: [], error: 'could not parse tasks.json for done-sync' }; }
    const remoteTasks = Array.isArray(remoteParsed) ? remoteParsed : (remoteParsed.tasks || []);
    const applied = [];
    transitions.forEach(tr => {
      const task = tr.matchType === 'id' ? findTaskById(remoteTasks, tr.matchValue) : findTaskByEntryId(remoteTasks, tr.matchValue);
      if (!task) return; // no structural counterpart (deleted/purged/ambiguous entryId) -- skip, don't force it
      if (!!task.done !== tr.value) { task.done = tr.value; applied.push(task.id); }
    });
    if (!applied.length) return { synced: [] };
    const writeRes = await ghPut(
      pat, CC_REPO, 'data/tasks.json', JSON.stringify(remoteTasks, null, 2),
      'Done-sync from work-inbox: ' + applied.join(', '),
      current.data.sha
    );
    if (writeRes.ok) return { synced: applied };
    if (writeRes.status === 409 || writeRes.status === 422) continue;
    return { synced: [], error: 'tasks.json write failed during done-sync, status ' + writeRes.status };
  }
  return { synced: [], error: 'tasks.json done-sync did not land after retries -- ticks.json write itself already succeeded' };
}

// ---------------------------------------------------------------------------
// handleTasks — command-centre's data/tasks.json write path.
// ---------------------------------------------------------------------------
async function handleTasks(body, env, hdrs) {
  const pat = env.HRIS_GITHUB_PAT;
  const { doc, message, baseSha } = body;
  // baseSha is NEW and OPTIONAL. Today's actual client does not send it, so
  // it will be undefined -- everything below still works without it, just
  // with narrower conflict detection (see PHASE 2 at the bottom of this
  // file for what sending it would unlock).
  if (!doc || !Array.isArray(doc.tasks)) {
    return jsonResponse(400, { error: 'Missing doc.tasks' }, hdrs);
  }

  const MAX_ATTEMPTS = 3; // bounded -- give up and report rather than loop forever under sustained contention
  let attempt = 0;
  let backedUpToday = false;

  while (attempt < MAX_ATTEMPTS) {
    attempt++;

    const current = await ghGet(pat, CC_REPO, 'data/tasks.json');
    if (!current.ok) {
      return githubErrorResponse(current.status, 'read tasks.json', current.error, hdrs);
    }

    if (!backedUpToday) {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const backupPath = `Archive/tasks_backup_${today}.json`;
      const existingBackup = await ghGet(pat, CC_REPO, backupPath);
      if (existingBackup.status === 404) {
        // No backup yet today -- straight base64 passthrough, no decode/
        // re-encode (that round-trip was the corruption bug).
        await ghPutRaw(pat, CC_REPO, backupPath, current.data.content.replace(/\n/g, ''), `Daily backup ${today}`, null);
      }
      // Otherwise: backup already exists (200) or the check itself failed
      // for some other reason. Either way, do not block the real tasks.json
      // write over the backup step -- losing the actual save because the
      // backup probe had a bad moment would be a worse outcome than a
      // missed backup on this one attempt.
      backedUpToday = true;
    }

    // Decide whether to merge before writing.
    //  - knownStaleClient: the client told us (via baseSha) that its copy is
    //    already older than what's on GitHub right now. Only possible if the
    //    client sends baseSha -- see PHASE 2.
    //  - attempt > 1: our own previous PUT this request hit a 409/422 --
    //    i.e. something wrote in the split-second between OUR read and OUR
    //    write. This is the one conflict shape detectable with ZERO client
    //    changes, and is handled below regardless of baseSha.
    let tasksToWrite = doc.tasks;
    const knownStaleClient = typeof baseSha === 'string' && baseSha !== current.data.sha;
    if (knownStaleClient || attempt > 1) {
      let remoteTasks;
      try {
        remoteTasks = JSON.parse(decodeBase64Utf8(current.data.content));
      } catch (e) {
        return jsonResponse(500, { error: 'Could not parse remote tasks.json during conflict merge: ' + e.message }, hdrs);
      }
      tasksToWrite = mergeRemote(doc.tasks, remoteTasks);
    }

    const writeRes = await ghPut(pat, CC_REPO, 'data/tasks.json', JSON.stringify(tasksToWrite, null, 2), message || 'Update tasks', current.data.sha);

    if (writeRes.ok) {
      const putBody = await writeRes.json().catch(() => null);
      const newSha = putBody && putBody.content && putBody.content.sha;

      // Done-sync (Phase 3, best-effort, never allowed to fail this write):
      // compare the remote tasks this request already read (before) against
      // what was just written (after) and push any done-state transition to
      // work-inbox's ticks.json. See the DONE-SYNC block above for the full
      // key scheme and loop-safety argument.
      let doneSynced = [], doneSyncError;
      try {
        const beforeParsed = JSON.parse(decodeBase64Utf8(current.data.content));
        const beforeTasks = Array.isArray(beforeParsed) ? beforeParsed : (beforeParsed.tasks || []);
        const syncResult = await syncTaskDoneToTicks(pat, beforeTasks, tasksToWrite);
        doneSynced = syncResult.synced || [];
        doneSyncError = syncResult.error;
      } catch (e) {
        doneSyncError = 'done-sync threw: ' + (e && e.message ? e.message : String(e));
      }

      return jsonResponse(200, { ok: true, merged: knownStaleClient || attempt > 1, attempts: attempt, sha: newSha, doneSynced, doneSyncError }, hdrs);
    }

    // 409 = stale sha (GitHub's documented conflict signal). 422 handled the
    // same way defensively -- sha-mismatch has historically surfaced as 422
    // in some edge cases. This is the ONE case we retry.
    if (writeRes.status === 409 || writeRes.status === 422) continue;

    const errText = await writeRes.text().catch(() => '');
    return githubErrorResponse(writeRes.status, 'write tasks.json', errText, hdrs);
  }

  return jsonResponse(409, {
    ok: false,
    error: `Gave up after ${MAX_ATTEMPTS} attempts -- tasks.json is under sustained concurrent writes. No write was made with a stale version, so nothing was overwritten incorrectly, but this write did not land. Safe to retry.`,
  }, hdrs);
}

// ---------------------------------------------------------------------------
// mergeTicks -- ticks.json's own conflict-merge, added Phase 2 (20 Aug 2026)
// to bring handleInboxState up to the same protection level as handleTasks
// below (3-attempt retry, merge-on-409/422). This was previously flagged
// here as a "similar-shaped, lower-priority residual risk, not fixing it
// here" -- now in scope because command-centre's own syncDoneToInbox() adds
// a genuine second concurrent writer against work-inbox's own dashboard
// (see js/api.js), not just two work-inbox browser tabs.
//
// Deliberately NOT a straight boolean-union merge: work-inbox's toggleTick()
// (js/app.js) is a real toggle (ticks[k] = !ticks[k]), and purgeOldTicks()
// genuinely deletes keys -- both real user actions this route must not
// silently undo by resurrecting a stale `true`. Ticks carry no per-key
// timestamp, so true last-writer-wins per key isn't possible from this data
// alone. Instead: remote is the base, the incoming request's own ticks win
// on top of it for any key it actually carries (so THIS request's own most
// recent action always lands as written, including an explicit false), and
// any key present ONLY in remote (added by a different session in the
// split-second between THIS request's own read and write) is kept rather
// than dropped -- the same "when genuinely uncertain, keep the disputed
// item, visible and correctable, over silently and permanently losing it"
// bias already established and shipped for mergeRemote() (tasks.json)
// above. Matching known limitation, stated the same way: a delete/purge on
// the incoming side cannot override a key that still exists on the remote
// side in this exact race window, since "absent" and "never seen" look
// identical with no per-key tombstone. Same accepted trade-off, not a new
// one -- and the same narrow scope as handleTasks' own fix: this closes the
// Worker's own GET-to-PUT race, not the much larger "browser tab open for
// minutes" window (that still needs client baseSha, per the PHASE 2 section
// at the bottom of this file, not built for either route).
// ---------------------------------------------------------------------------
function mergeTicks(localDoc, remoteDoc) {
  const remoteTicks = (remoteDoc && typeof remoteDoc === 'object' && remoteDoc.ticks) || {};
  const localTicks = (localDoc && typeof localDoc === 'object' && localDoc.ticks) || {};
  return {
    ...localDoc,
    ticks: { ...remoteTicks, ...localTicks },
    updated_at: localDoc.updated_at || new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// handleInboxState — work-inbox's data/ticks.json write path. Same retry/
// merge shape as handleTasks: up to 3 attempts, bounded so sustained
// contention reports rather than loops forever; merges (via mergeTicks
// above) on attempt > 1, i.e. only after this Worker's own PUT has already
// hit a 409/422 -- the one conflict shape detectable with zero client
// changes, same as handleTasks.
// ---------------------------------------------------------------------------
async function handleInboxState(body, env, hdrs) {
  const pat = env.HRIS_GITHUB_PAT;
  const { doc, message, baseSha } = body;
  // baseSha is NEW (Phase 3, 21 Aug 2026) and OPTIONAL, mirroring handleTasks
  // above. Today's client now sends it (js/app.js this repo -- see
  // refreshTicksBaseSha/_ticksBaseSha), closing the same "browser tab open
  // for minutes" gap for ticks.json that was previously only closed for
  // tasks.json. Without it, everything below still works exactly as before,
  // just with narrower conflict detection (only this Worker's own
  // GET-to-PUT race, via attempt>1).
  if (!doc) return jsonResponse(400, { error: 'Missing doc' }, hdrs);

  const MAX_ATTEMPTS = 3;
  let attempt = 0;

  while (attempt < MAX_ATTEMPTS) {
    attempt++;

    const current = await ghGet(pat, WI_REPO, 'data/ticks.json');
    if (!current.ok && current.status !== 404) {
      return githubErrorResponse(current.status, 'read ticks.json', current.error, hdrs);
    }
    const sha = current.ok ? current.data.sha : undefined;

    const knownStaleClient = typeof baseSha === 'string' && current.ok && baseSha !== current.data.sha;
    let docToWrite = doc;
    if ((knownStaleClient || attempt > 1) && current.ok) {
      let remoteDoc;
      try {
        remoteDoc = JSON.parse(decodeBase64Utf8(current.data.content));
      } catch (e) {
        return jsonResponse(500, { error: 'Could not parse remote ticks.json during conflict merge: ' + e.message }, hdrs);
      }
      docToWrite = mergeTicks(doc, remoteDoc);
    }

    const writeRes = await ghPut(pat, WI_REPO, 'data/ticks.json', JSON.stringify(docToWrite, null, 2), message || 'Tick sync', sha);

    if (writeRes.ok) {
      const putBody = await writeRes.json().catch(() => null);
      const newSha = putBody && putBody.content && putBody.content.sha;

      // Done-sync (Phase 3, best-effort, never allowed to fail this write):
      // compare the remote ticks this request already read (before) against
      // what was just written (after) and push any 'id_'/'eid_' transition
      // to command-centre's tasks.json done flag.
      let doneSynced = [], doneSyncError;
      try {
        const beforeTicks = current.ok ? ((JSON.parse(decodeBase64Utf8(current.data.content)).ticks) || {}) : {};
        const afterTicks = docToWrite.ticks || {};
        const syncResult = await syncTickToTaskDone(pat, beforeTicks, afterTicks);
        doneSynced = syncResult.synced || [];
        doneSyncError = syncResult.error;
      } catch (e) {
        doneSyncError = 'done-sync threw: ' + (e && e.message ? e.message : String(e));
      }

      return jsonResponse(200, { ok: true, merged: knownStaleClient || attempt > 1, attempts: attempt, sha: newSha, doneSynced, doneSyncError }, hdrs);
    }

    if (writeRes.status === 409 || writeRes.status === 422) continue;

    const errText = await writeRes.text().catch(() => '');
    return githubErrorResponse(writeRes.status, 'write ticks.json', errText, hdrs);
  }

  return jsonResponse(409, {
    ok: false,
    error: `Gave up after ${MAX_ATTEMPTS} attempts -- ticks.json is under sustained concurrent writes. No write was made with a stale version, so nothing was overwritten incorrectly, but this write did not land. Safe to retry.`,
  }, hdrs);
}

// ---------------------------------------------------------------------------
// handleAiLog — /ai-log route. Prompt text copied verbatim from
// cloudflare-worker/ai-log-endpoint.js in this repo (read directly this
// session, not reconstructed). Only change from the live source: takes the
// shared allow-listed `hdrs` from the caller instead of building its own
// reflect-any-origin headers (fix #5), and drops its own OPTIONS check,
// which was unreachable dead code -- the top-level handler already
// short-circuits OPTIONS before routing to /ai-log.
// ---------------------------------------------------------------------------
async function handleAiLog(request, env, hdrs) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: hdrs });

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON' }, hdrs);
  }

  const { taskTitle, taskDescription, existingActions, rawText } = body;
  if (!rawText || !taskTitle) {
    return jsonResponse(400, { error: 'Missing taskTitle or rawText' }, hdrs);
  }

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const prompt = `You are helping Kevin Lelitte update his task action log at the University of Oxford HR Systems team.

Task: ${taskTitle}
Description: ${taskDescription || '(none)'}
Existing actions:
${(existingActions || []).join('\n') || '(none)'}

Kevin has pasted the following new information:
---
${rawText}
---

Write a single dated action log entry summarising what this information means for the task. Use this exact format and nothing else:
[${today}] Your summary here.

Rules:
- One to three sentences maximum
- Focus on what happened or what needs to happen next
- Do not add any prefix, explanation, or commentary — output only the dated entry
- Match the tone and style of the existing actions above`;

  const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!aiRes.ok) {
    const errText = await aiRes.text().catch(() => '');
    return jsonResponse(502, { error: 'AI API error: ' + errText }, hdrs);
  }

  const aiData = await aiRes.json();
  const entry = (aiData.content && aiData.content[0] && aiData.content[0].text || '').trim();
  return jsonResponse(200, { entry }, hdrs);
}

// ---------------------------------------------------------------------------
// Top-level handler. Everything wrapped in try/catch (fix #2) -- every code
// path, including an unexpected exception anywhere downstream, returns a
// real Response with the correct CORS headers. This is what actually closes
// off the "Failed to fetch" failure mode.
// ---------------------------------------------------------------------------
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const hdrs = corsHeaders(origin);
    try {
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: hdrs });
      if (url.pathname === '/ai-log') return await handleAiLog(request, env, hdrs);
      if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: hdrs });

      let body;
      try {
        body = await request.json();
      } catch {
        return jsonResponse(400, { error: 'Invalid JSON' }, hdrs);
      }

      if (body.target === 'inbox-state') return await handleInboxState(body, env, hdrs);
      return await handleTasks(body, env, hdrs);
    } catch (err) {
      return jsonResponse(500, {
        error: 'Unhandled Worker exception: ' + (err && err.message ? err.message : String(err)),
      }, hdrs);
    }
  },
};

// ============================================================================
// PHASE 2 — ORIGINAL PROPOSAL (2 Aug). STATUS UPDATE 21 Aug 2026: the
// client-side half sketched below IS NOW BUILT, for both repos, as part of
// Phase 3 — see command-centre/js/api.js (_tasksBaseSha/refreshTasksBaseSha)
// and work-inbox/js/app.js (_ticksBaseSha/refreshTicksBaseSha). Option (a)
// below (ETag) was live-tested this session and does NOT work: `curl -I`
// against both raw.githubusercontent.com endpoints confirms the ETag is a
// 64-hex-char SHA-256 of the raw bytes, not GitHub's 40-hex-char blob SHA-1
// that the Contents API `sha`/PUT-conflict-check actually uses — the two
// are computed differently and are not interchangeable. Option (b) (direct
// Contents API call) is what was actually built: one extra unauthenticated
// `api.github.com/.../contents/...` call per page load (not per poll) to
// capture sha+content together, refreshed from the Worker's own response
// `sha` field after every successful save so no second fetch is needed
// then. The original sketch (kept below for the reasoning) is otherwise
// unchanged from 2 Aug.
// ============================================================================
//
// To close the LARGER data-loss gap (finding 1's real scope — a browser tab
// open for minutes silently overwriting whatever fetch_inbox.py wrote in
// that window), the client needs to tell the Worker what version of
// tasks.json its in-memory copy is based on, so the Worker can tell "nothing
// changed, safe to write directly" from "something changed, must merge"
// BEFORE attempting the write — not just react to a 409 that, per finding 1,
// almost never actually happens in this scenario.
//
// Server-side (this file): already done above. `handleTasks` already reads
// and acts on `body.baseSha` if present — this file needs NO further changes
// for Phase 2 to work once the client sends it.
//
// Client-side (command-centre/js/api.js, command-centre/js/app.js) — NOW
// BUILT, 21 Aug 2026, per option (b) below (see status update above):
//
//   1. Wherever the client currently loads tasks.json (`loadTasks()`,
//      `fetchTasksRemote()` in js/api.js), it needs to also capture the sha
//      of what it loaded. Two ways to get that, neither verified yet:
//
//      (a) If the existing raw/proxy fetch (github-proxy.lelitte.co.uk, or
//          the raw.githubusercontent.com fallback) passes through GitHub's
//          ETag response header unmodified, `res.headers.get('ETag')`
//          typically carries the blob sha for these endpoints — cheapest
//          option, no endpoint change, but NOT verified against the actual
//          proxy's header-forwarding behaviour. Needs a live check before
//          relying on it.
//
//      (b) Switch to calling the GitHub Contents API directly
//          (api.github.com/repos/.../contents/data/tasks.json), which
//          reliably returns `.sha` in its JSON body — certain to work, but
//          is a different response shape (base64 content needing decode)
//          and subject to GitHub's lower unauthenticated rate limit
//          (60 req/hour/IP), which may or may not matter given how often
//          this page is loaded/polled — not fully assessed here.
//
//   2. Store that sha (e.g. `window._tasksBaseSha`) alongside the `tasks`
//      array whenever it's freshly loaded from remote.
//
//   3. `persistTasks(msg)` in js/api.js sends it: `body: JSON.stringify({
//      doc:{tasks:tasks}, message:msg, baseSha: window._tasksBaseSha })`.
//
//   4. After ANY successful save (including a merged one), refresh
//      `window._tasksBaseSha` to the new sha the Worker's response could
//      return (this file's `handleTasks` would need to start returning the
//      new sha in its success response for this to close the loop cleanly —
//      easy one-line addition here whenever Phase 2 is greenlit).
//
// None of this is required for the Phase-1 fixes in this file to be safe or
// worth deploying now — it's what would additionally be needed to fully
// close the larger gap, and it's deliberately left as a proposal rather than
// code, per the instruction not to touch command-centre's client files
// without Kevin agreeing the approach first.
