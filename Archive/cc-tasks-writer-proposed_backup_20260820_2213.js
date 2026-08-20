// cc-tasks-writer Worker — corrected source, proposed by Drew, 2 Aug 2026.
// NOT YET DEPLOYED. Kevin deploys manually via Cloudflare dashboard:
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
      return jsonResponse(200, { ok: true, merged: knownStaleClient || attempt > 1, attempts: attempt }, hdrs);
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
// handleInboxState — work-inbox's data/ticks.json write path. Scope
// deliberately unchanged beyond the same error-propagation hardening as
// handleTasks: no merge logic added here. Ticks are booleans (idempotent,
// low-stakes vs. losing a real action-log entry) and this path wasn't
// reported as broken. It has the same "fresh GET right before PUT" shape as
// handleTasks did, so it's plausible two browser tabs syncing ticks around
// the same time could clobber each other the same way -- flagging this as a
// similar-shaped, lower-priority residual risk, not fixing it here.
// ---------------------------------------------------------------------------
async function handleInboxState(body, env, hdrs) {
  const pat = env.HRIS_GITHUB_PAT;
  const { doc, message } = body;
  if (!doc) return jsonResponse(400, { error: 'Missing doc' }, hdrs);

  const current = await ghGet(pat, WI_REPO, 'data/ticks.json');
  if (!current.ok && current.status !== 404) {
    return githubErrorResponse(current.status, 'read ticks.json', current.error, hdrs);
  }
  const sha = current.ok ? current.data.sha : undefined;

  const writeRes = await ghPut(pat, WI_REPO, 'data/ticks.json', JSON.stringify(doc, null, 2), message || 'Tick sync', sha);
  if (!writeRes.ok) {
    const errText = await writeRes.text().catch(() => '');
    return githubErrorResponse(writeRes.status, 'write ticks.json', errText, hdrs);
  }
  return jsonResponse(200, { ok: true }, hdrs);
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
// PHASE 2 — PROPOSED, NOT IMPLEMENTED, NOT DEPLOYED. Needs Kevin's explicit
// go-ahead on the approach before any of this touches command-centre.
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
// Client-side (command-centre/js/api.js, command-centre/js/app.js) — NOT
// written or pushed, sketch only:
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
