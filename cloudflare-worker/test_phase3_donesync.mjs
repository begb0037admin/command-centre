// Synthetic test harness for cc-tasks-writer-proposed.js -- Phase 3 (21 Aug 2026).
// Imports the ACTUAL worker module (the real file being staged, not a
// reimplementation) and drives it against an in-memory fake of the GitHub
// Contents API. No network call ever leaves this process; no live
// tasks.json/ticks.json is read or written anywhere. This is exactly the
// "synthetic/throwaway data" testing the task brief required before any
// live verification.

import assert from 'node:assert/strict';
import fs from 'node:fs';

const WORKER_PATH = process.argv[2];
if (!WORKER_PATH) { console.error('usage: node worker_test_harness.mjs <path-to-worker-file>'); process.exit(1); }

// ---------------------------------------------------------------------------
// Fake GitHub Contents API -- in-memory only.
// ---------------------------------------------------------------------------
function b64(obj) { return Buffer.from(JSON.stringify(obj, null, 2), 'utf8').toString('base64'); }
function sha(content) {
  // Not a real git blob sha (doesn't need to be) -- just a stable, unique
  // fake id per content string, deterministic so assertions can compare it.
  let h = 0; for (let i = 0; i < content.length; i++) { h = (h * 31 + content.charCodeAt(i)) >>> 0; }
  return 'fakesha_' + h.toString(16) + '_' + content.length;
}

class FakeGitHub {
  constructor() {
    this.files = {}; // 'repo/path' -> { content: base64, sha }
    this.log = [];
    // Hook fired right after a GET is served for a given repo/path, BEFORE
    // this same request's own PUT -- used to simulate "someone else wrote
    // in the split-second between my read and my write" races.
    this.interleave = {}; // 'repo/path' -> fn(store) => void, fires once
  }
  key(repo, path) { return repo + '/' + path; }
  seed(repo, path, obj) {
    const content = JSON.stringify(obj, null, 2);
    this.files[this.key(repo, path)] = { content: Buffer.from(content, 'utf8').toString('base64'), sha: sha(content) };
  }
  get(repo, path) {
    const k = this.key(repo, path);
    const f = this.files[k];
    return f ? { ...f } : null;
  }
  put(repo, path, base64Content, expectedSha) {
    const k = this.key(repo, path);
    const existing = this.files[k];
    if (existing && expectedSha && existing.sha !== expectedSha) {
      return { status: 409, conflict: true };
    }
    if (!existing && expectedSha) {
      return { status: 409, conflict: true }; // sha given but file doesn't exist -- also a conflict shape
    }
    const decoded = Buffer.from(base64Content, 'base64').toString('utf8');
    const newSha = sha(decoded);
    this.files[k] = { content: base64Content, sha: newSha };
    this.log.push({ repo, path, sha: newSha });
    return { status: 200, sha: newSha };
  }
  triggerInterleaveAfterNextGet(repo, path, fn) {
    this.interleave[this.key(repo, path)] = fn;
  }
}

const gh = new FakeGitHub();

// ---------------------------------------------------------------------------
// Mock global fetch -- intercepts exactly the calls the worker makes
// (api.github.com Contents API GET/PUT). Anything else (e.g. the
// Anthropic call in handleAiLog) is untouched by these tests since they
// never hit that route.
// ---------------------------------------------------------------------------
global.fetch = async (url, opts = {}) => {
  const u = new URL(url);
  if (u.hostname !== 'api.github.com') {
    throw new Error('Unexpected fetch to non-GitHub host in test: ' + url);
  }
  const m = u.pathname.match(/^\/repos\/([^/]+)\/([^/]+)\/contents\/(.+)$/);
  if (!m) throw new Error('Unrecognised GitHub API path in test: ' + u.pathname);
  const repo = m[2];
  const path = decodeURIComponent(m[3]);
  const method = opts.method || 'GET';

  if (method === 'GET') {
    // Fire any configured interleave BEFORE returning this GET's result, to
    // simulate "another writer landed between my read and my write" for
    // race tests -- the interleave itself mutates `gh.files` directly, as
    // if a totally separate request had already completed.
    const key = gh.key(repo, path);
    const fn = gh.interleave[key];
    if (fn) { delete gh.interleave[key]; }
    const f = gh.get(repo, path);
    if (!f) return { ok: false, status: 404, json: async () => ({}), text: async () => 'not found' };
    if (fn) fn(gh); // interleave applied AFTER this GET is captured, so THIS request still reads the pre-interleave state, matching a real race
    return { ok: true, status: 200, json: async () => ({ content: f.content, sha: f.sha }), text: async () => '' };
  }
  if (method === 'PUT') {
    const body = JSON.parse(opts.body);
    const result = gh.put(repo, path, body.content, body.sha);
    if (result.status === 409) {
      return { ok: false, status: 409, json: async () => ({ message: 'Conflict' }), text: async () => 'Conflict: sha mismatch' };
    }
    return { ok: true, status: 200, json: async () => ({ content: { sha: result.sha }, commit: { sha: result.sha } }), text: async () => '' };
  }
  throw new Error('Unexpected method in test: ' + method);
};

// ---------------------------------------------------------------------------
// Import the real worker module under test.
// ---------------------------------------------------------------------------
const workerUrl = 'file:///' + WORKER_PATH.replace(/\\/g, '/');
const worker = (await import(workerUrl)).default;
const env = { HRIS_GITHUB_PAT: 'fake-pat-not-real', ANTHROPIC_API_KEY: 'fake-not-real' };

function req(bodyObj) {
  return new Request('https://cc-tasks-writer.kevinlelitte.workers.dev/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://cc.lelitte.co.uk' },
    body: JSON.stringify(bodyObj),
  });
}

let passed = 0, failed = 0;
async function test(name, fn) {
  try {
    await fn();
    console.log('PASS -', name);
    passed++;
  } catch (e) {
    console.log('FAIL -', name, '--', e.message);
    failed++;
  }
}

// ===========================================================================
// TEST 1 -- basic done-sync, CC -> WI, today-tier task
// ===========================================================================
await test('CC task marked done (tier=today) syncs a matching id_ tick to WI ticks.json', async () => {
  gh.seed('command-centre', 'data/tasks.json', [
    { id: 'tTEST1', title: 'Synthetic today task', tier: 'today', done: false, entryId: '' },
  ]);
  gh.seed('command-centre', `Archive/tasks_backup_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.json`, [{id:'placeholder'}]); // backup already exists today -> skip re-backup path
  gh.seed('work-inbox', 'data/ticks.json', { ticks: {}, updated_at: '2026-01-01T00:00:00Z' });

  const doc = { tasks: [{ id: 'tTEST1', title: 'Synthetic today task', tier: 'today', done: true, entryId: '' }] };
  const res = await worker.fetch(req({ doc, message: 'Done state: tTEST1 checked' }), env);
  const json = await res.json();
  assert.equal(res.status, 200);
  assert.equal(json.ok, true);
  assert.deepEqual(json.doneSynced, ['tTEST1']);

  const ticksNow = JSON.parse(Buffer.from(gh.get('work-inbox', 'data/ticks.json').content, 'base64').toString('utf8'));
  assert.equal(ticksNow.ticks['id_tTEST1'], true, 'expected id_tTEST1 tick to be set true in ticks.json');
});

// ===========================================================================
// TEST 2 -- parked tier is out of scope, no WI counterpart, no tick written
// ===========================================================================
await test('CC task marked done (tier=parked) does NOT sync -- no WI counterpart exists', async () => {
  gh.seed('command-centre', 'data/tasks.json', [
    { id: 'tTEST2', title: 'Synthetic parked task', tier: 'parked', done: false, entryId: '' },
  ]);
  gh.seed('command-centre', `Archive/tasks_backup_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.json`, [{id:'placeholder'}]);
  gh.seed('work-inbox', 'data/ticks.json', { ticks: {}, updated_at: '2026-01-01T00:00:00Z' });

  const doc = { tasks: [{ id: 'tTEST2', title: 'Synthetic parked task', tier: 'parked', done: true, entryId: '' }] };
  const res = await worker.fetch(req({ doc, message: 'Done state: tTEST2 checked' }), env);
  const json = await res.json();
  assert.equal(json.ok, true);
  assert.deepEqual(json.doneSynced, [], 'parked-tier task must not produce any WI sync target');

  const ticksNow = JSON.parse(Buffer.from(gh.get('work-inbox', 'data/ticks.json').content, 'base64').toString('utf8'));
  assert.deepEqual(ticksNow.ticks, {}, 'ticks.json must be untouched for a parked-tier task');
});

// ===========================================================================
// TEST 3 -- WI tick (id_ scheme) -> CC task done, direct match
// ===========================================================================
await test('WI tick on id_<taskId> syncs CC task done=true, direct id match', async () => {
  gh.seed('work-inbox', 'data/ticks.json', { ticks: {}, updated_at: '2026-01-01T00:00:00Z' });
  gh.seed('command-centre', 'data/tasks.json', [
    { id: 'tTEST3', title: 'Synthetic week task', tier: 'week', done: false, entryId: '' },
  ]);

  const doc = { ticks: { 'id_tTEST3': true }, updated_at: new Date().toISOString() };
  const res = await worker.fetch(req({ target: 'inbox-state', doc, message: 'tick sync' }), env);
  const json = await res.json();
  assert.equal(json.ok, true);
  assert.deepEqual(json.doneSynced, ['tTEST3']);

  const tasksNow = JSON.parse(Buffer.from(gh.get('command-centre', 'data/tasks.json').content, 'base64').toString('utf8'));
  assert.equal(tasksNow.find(t => t.id === 'tTEST3').done, true);
});

// ===========================================================================
// TEST 4 -- WI tick (eid_ scheme) -> CC task done, entry_id match
// ===========================================================================
await test('WI tick on eid_<entryId> syncs the CC task carrying that entryId', async () => {
  gh.seed('work-inbox', 'data/ticks.json', { ticks: {}, updated_at: '2026-01-01T00:00:00Z' });
  gh.seed('command-centre', 'data/tasks.json', [
    { id: 'tTEST4', title: 'Synthetic today task from email', tier: 'today', done: false, entryId: 'OUTLOOK_ENTRYID_ABC123' },
  ]);

  const doc = { ticks: { 'eid_OUTLOOK_ENTRYID_ABC123': true }, updated_at: new Date().toISOString() };
  const res = await worker.fetch(req({ target: 'inbox-state', doc, message: 'tick sync' }), env);
  const json = await res.json();
  assert.equal(json.ok, true);
  assert.deepEqual(json.doneSynced, ['tTEST4']);

  const tasksNow = JSON.parse(Buffer.from(gh.get('command-centre', 'data/tasks.json').content, 'base64').toString('utf8'));
  assert.equal(tasksNow.find(t => t.id === 'tTEST4').done, true);
});

// ===========================================================================
// TEST 5 -- ambiguous entry_id match (2 tasks share it) -> skipped, not guessed
// ===========================================================================
await test('WI tick on eid_ with 2 matching CC tasks is skipped, not guessed', async () => {
  gh.seed('work-inbox', 'data/ticks.json', { ticks: {}, updated_at: '2026-01-01T00:00:00Z' });
  gh.seed('command-centre', 'data/tasks.json', [
    { id: 'tTEST5a', title: 'Task A', tier: 'today', done: false, entryId: 'DUPLICATE_EID' },
    { id: 'tTEST5b', title: 'Task B', tier: 'today', done: false, entryId: 'DUPLICATE_EID' },
  ]);

  const doc = { ticks: { 'eid_DUPLICATE_EID': true }, updated_at: new Date().toISOString() };
  const res = await worker.fetch(req({ target: 'inbox-state', doc, message: 'tick sync' }), env);
  const json = await res.json();
  assert.equal(json.ok, true);
  assert.deepEqual(json.doneSynced, [], 'ambiguous entryId match must not force a sync onto either task');

  const tasksNow = JSON.parse(Buffer.from(gh.get('command-centre', 'data/tasks.json').content, 'base64').toString('utf8'));
  assert.equal(tasksNow.find(t => t.id === 'tTEST5a').done, false);
  assert.equal(tasksNow.find(t => t.id === 'tTEST5b').done, false);
});

// ===========================================================================
// TEST 6 -- reversibility: un-ticking flips CC task back to not-done
// ===========================================================================
await test('Un-ticking id_<taskId> in WI flips the CC task back to done=false (reversible)', async () => {
  gh.seed('work-inbox', 'data/ticks.json', { ticks: { 'id_tTEST6': true }, updated_at: '2026-01-01T00:00:00Z' });
  gh.seed('command-centre', 'data/tasks.json', [
    { id: 'tTEST6', title: 'Synthetic task', tier: 'tomorrow', done: true, entryId: '' },
  ]);

  const doc = { ticks: { 'id_tTEST6': false }, updated_at: new Date().toISOString() };
  const res = await worker.fetch(req({ target: 'inbox-state', doc, message: 'tick sync' }), env);
  const json = await res.json();
  assert.equal(json.ok, true);
  assert.deepEqual(json.doneSynced, ['tTEST6']);

  const tasksNow = JSON.parse(Buffer.from(gh.get('command-centre', 'data/tasks.json').content, 'base64').toString('utf8'));
  assert.equal(tasksNow.find(t => t.id === 'tTEST6').done, false, 'un-tick must reverse the done flag, never delete the task');
  assert.ok(tasksNow.find(t => t.id === 'tTEST6'), 'task must still exist -- flag-and-hide, never deletion');
});

// ===========================================================================
// RACE TEST 7 -- ticks.json "browser tab open for minutes" gap, now closed
// via baseSha. Client's baseSha is stale (a real concurrent writer landed
// in between); the OLD code (no baseSha handling in handleInboxState) would
// have silently overwritten and lost that concurrent write. Confirm the
// NEW code detects staleness and merges instead.
// ===========================================================================
await test('RACE: stale client baseSha on ticks.json triggers merge, does not clobber a concurrent write', async () => {
  gh.seed('work-inbox', 'data/ticks.json', { ticks: { 'id_existing': true }, updated_at: '2026-01-01T00:00:00Z' });
  const staleBaseSha = gh.get('work-inbox', 'data/ticks.json').sha;

  // Simulate a second, independent writer landing AFTER the stale client
  // loaded its baseSha but BEFORE the stale client's own request arrives --
  // exactly the "page open for minutes" scenario, not this Worker's own
  // millisecond GET-to-PUT window.
  const concurrentContent = JSON.stringify({ ticks: { 'id_existing': true, 'id_addedByOtherWriter': true }, updated_at: '2026-01-01T00:05:00Z' }, null, 2);
  gh.files[gh.key('work-inbox', 'data/ticks.json')] = { content: Buffer.from(concurrentContent, 'utf8').toString('base64'), sha: sha(concurrentContent) };

  // The stale client's own payload does NOT know about id_addedByOtherWriter
  // at all (its in-memory copy predates it), and separately un-ticks
  // id_existing.
  const doc = { ticks: { 'id_existing': false }, updated_at: new Date().toISOString() };
  const res = await worker.fetch(req({ target: 'inbox-state', doc, message: 'tick sync', baseSha: staleBaseSha }), env);
  const json = await res.json();
  assert.equal(json.ok, true);
  assert.equal(json.merged, true, 'a stale baseSha must trigger a merge, not a direct overwrite');

  const ticksNow = JSON.parse(Buffer.from(gh.get('work-inbox', 'data/ticks.json').content, 'base64').toString('utf8'));
  assert.equal(ticksNow.ticks['id_addedByOtherWriter'], true, 'the concurrent writer\'s key must survive the merge, not be silently lost');
  assert.equal(ticksNow.ticks['id_existing'], false, 'the stale client\'s OWN explicit action (the un-tick) must still win for the key it actually carried');
});

// ===========================================================================
// RACE TEST 8 -- same gap, tasks.json side (baseSha support already existed
// pre-Phase-3; re-confirmed still correct here since done-sync is now
// layered on top of it in the same code path).
// ===========================================================================
await test('RACE: stale client baseSha on tasks.json triggers merge, does not clobber a concurrent Phase-3.6 write', async () => {
  gh.seed('command-centre', 'data/tasks.json', [{ id: 'tExisting', title: 'Existing', tier: 'today', done: false, entryId: '' }]);
  gh.seed('command-centre', `Archive/tasks_backup_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.json`, [{id:'placeholder'}]);
  gh.seed('work-inbox', 'data/ticks.json', { ticks: {}, updated_at: '2026-01-01T00:00:00Z' });
  const staleBaseSha = gh.get('command-centre', 'data/tasks.json').sha;

  // A concurrent Phase 3.6 auto-apply adds a brand-new task the stale
  // client never saw.
  const concurrentTasks = [
    { id: 'tExisting', title: 'Existing', tier: 'today', done: false, entryId: '' },
    { id: 'tAddedByPhase36', title: 'Auto-added by inbox pipeline', tier: 'today', done: false, entryId: '' },
  ];
  const concurrentContent = JSON.stringify(concurrentTasks, null, 2);
  gh.files[gh.key('command-centre', 'data/tasks.json')] = { content: Buffer.from(concurrentContent, 'utf8').toString('base64'), sha: sha(concurrentContent) };

  // Stale client's own payload only knows about tExisting, and marks it done.
  const doc = { tasks: [{ id: 'tExisting', title: 'Existing', tier: 'today', done: true, entryId: '' }] };
  const res = await worker.fetch(req({ doc, message: 'Done state: tExisting checked', baseSha: staleBaseSha }), env);
  const json = await res.json();
  assert.equal(json.ok, true);
  assert.equal(json.merged, true);

  const tasksNow = JSON.parse(Buffer.from(gh.get('command-centre', 'data/tasks.json').content, 'base64').toString('utf8'));
  assert.ok(tasksNow.find(t => t.id === 'tAddedByPhase36'), 'the concurrently-added task must survive the merge, not be silently dropped');
  assert.equal(tasksNow.find(t => t.id === 'tExisting').done, true, 'the stale client\'s own explicit action must still land');
  // And the done-sync must still have fired off the now-correctly-merged result:
  assert.deepEqual(json.doneSynced, ['tExisting']);
});

// ===========================================================================
// PING-PONG TEST 9 -- once both files agree, a repeat push of the same
// value is a no-op in both directions (loop cannot run more than one hop).
// ===========================================================================
await test('PING-PONG SAFETY: resending an already-synced value produces no further writes', async () => {
  gh.seed('command-centre', 'data/tasks.json', [{ id: 'tTEST9', title: 'Synthetic', tier: 'today', done: true, entryId: '' }]);
  gh.seed('work-inbox', 'data/ticks.json', { ticks: { 'id_tTEST9': true }, updated_at: '2026-01-01T00:00:00Z' });
  const preTasksSha = gh.get('command-centre', 'data/tasks.json').sha;

  // WI client resends its ticks map, unchanged (id_tTEST9 still true) --
  // simulating an unrelated tick toggle elsewhere that happens to resend
  // the whole local map, already containing the earlier sync's result.
  const doc = { ticks: { 'id_tTEST9': true, 'id_unrelated': true }, updated_at: new Date().toISOString() };
  const res = await worker.fetch(req({ target: 'inbox-state', doc, message: 'tick sync' }), env);
  const json = await res.json();
  assert.equal(json.ok, true);
  assert.deepEqual(json.doneSynced, [], 'no transition occurred for id_tTEST9 (true->true), so no CC write should be attempted');

  const tasksAfterSha = gh.get('command-centre', 'data/tasks.json').sha;
  assert.equal(tasksAfterSha, preTasksSha, 'tasks.json must be byte-for-byte untouched -- no redundant write, no ping-pong');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
