// cc-tasks-writer — PREVIOUS PRODUCTION VERSION (pre 2 Aug 2026 patch)
//
// PROVENANCE / ACCURACY WARNING — read before relying on this for rollback:
// This is NOT a byte-exact capture taken from the Cloudflare dashboard. It was
// reconstructed from the source Kevin pasted into a Claude Code session on
// 2 Aug 2026, shortly before the patched Worker was deployed. He pasted it in
// full (including the complete handleAiLog prompt), so it is believed complete
// and faithful, but no diff against the real deployed code was ever possible —
// the original was replaced in the dashboard without a backup being taken.
//
// If you need a guaranteed-accurate rollback, prefer Cloudflare's own version
// history (Workers & Pages > cc-tasks-writer > Deployments), which retains
// previous deployments and is authoritative. Use this file as a secondary
// reference, or if that history has aged out.
//
// KNOWN BUGS IN THIS VERSION — do not redeploy without understanding these:
//  1. Daily Archive backup corrupts non-ASCII characters. The backup path does
//     atob(current.content) then ghPut re-encodes with
//     btoa(unescape(encodeURIComponent(...))), double-encoding every non-ASCII
//     byte. Confirmed in the wild: Archive/tasks_backup_20260705.json and
//     _20260706.json (a Saturday and Sunday, when fetch_inbox.py does not run
//     so this Worker wrote the backup first) contain mojibake, while weekday
//     backups written by fetch_inbox.py are clean.
//  2. No try/catch anywhere. An exception escapes to Cloudflare, which returns
//     its own error page WITHOUT CORS headers, so the browser reports an opaque
//     "TypeError: Failed to fetch" instead of a readable status.
//  3. Both 502 returns are catch-alls that discard the real GitHub status and
//     body, making failures undiagnosable.
//  4. handleAiLog reflects ANY Origin (no allow-list check, unlike corsHeaders),
//     so any website could invoke /ai-log and burn Anthropic API credits.
//  5. handleTasks re-reads tasks.json immediately before writing and uses that
//     fresh sha, which defeats GitHub's optimistic concurrency. The client's
//     stale task array is force-written over anything fetch_inbox.py wrote
//     since the page loaded — silent data loss, no error shown.
//
// Superseded by cloudflare-worker/cc-tasks-writer-proposed.js (deployed
// 2 Aug 2026), which fixes 1-4 and narrows 5.

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

async function ghGet(pat, repo, path) {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${repo}/contents/${path}?ref=main`,
    { headers: { Authorization: `token ${pat}`, Accept: 'application/vnd.github.v3+json', 'User-Agent': 'cc-tasks-writer' } }
  );
  if (!res.ok) return null;
  return res.json();
}

async function ghPut(pat, repo, path, content, message, sha) {
  const encoded = btoa(unescape(encodeURIComponent(content)));
  const body = { message, content: encoded, branch: 'main' };
  if (sha) body.sha = sha;
  return fetch(
    `https://api.github.com/repos/${OWNER}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${pat}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'cc-tasks-writer',
      },
      body: JSON.stringify(body),
    }
  );
}

async function handleTasks(body, env, hdrs) {
  const pat = env.HRIS_GITHUB_PAT;
  const { doc, message } = body;
  if (!doc || !Array.isArray(doc.tasks)) {
    return new Response(JSON.stringify({ error: 'Missing doc.tasks' }), { status: 400, headers: { ...hdrs, 'Content-Type': 'application/json' } });
  }

  const current = await ghGet(pat, CC_REPO, 'data/tasks.json');
  if (!current) {
    return new Response(JSON.stringify({ error: 'Could not read tasks.json' }), { status: 502, headers: { ...hdrs, 'Content-Type': 'application/json' } });
  }

  // Daily Archive backup
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const backupPath = `Archive/tasks_backup_${today}.json`;
  const existingBackup = await ghGet(pat, CC_REPO, backupPath);
  if (!existingBackup) {
    await ghPut(pat, CC_REPO, backupPath, atob(current.content.replace(/\n/g, '')), `Daily backup ${today}`, null);
  }

  const writeRes = await ghPut(pat, CC_REPO, 'data/tasks.json', JSON.stringify(doc.tasks, null, 2), message || 'Update tasks', current.sha);
  if (!writeRes.ok) {
    const err = await writeRes.text();
    return new Response(JSON.stringify({ error: 'Write failed: ' + err }), { status: 502, headers: { ...hdrs, 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...hdrs, 'Content-Type': 'application/json' } });
}

async function handleInboxState(body, env, hdrs) {
  const pat = env.HRIS_GITHUB_PAT;
  const { doc, message } = body;
  if (!doc) {
    return new Response(JSON.stringify({ error: 'Missing doc' }), { status: 400, headers: { ...hdrs, 'Content-Type': 'application/json' } });
  }
  const current = await ghGet(pat, WI_REPO, 'data/ticks.json');
  const sha = current ? current.sha : undefined;
  const writeRes = await ghPut(pat, WI_REPO, 'data/ticks.json', JSON.stringify(doc, null, 2), message || 'Tick sync', sha);
  if (!writeRes.ok) {
    const err = await writeRes.text();
    return new Response(JSON.stringify({ error: 'Write failed: ' + err }), { status: 502, headers: { ...hdrs, 'Content-Type': 'application/json' } });
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...hdrs, 'Content-Type': 'application/json' } });
}

async function handleAiLog(request, env) {
  const origin = request.headers.get('Origin') || '';
  const hdrs = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: hdrs });
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: hdrs });

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { ...hdrs, 'Content-Type': 'application/json' } });
  }

  const { taskTitle, taskDescription, existingActions, rawText } = body;
  if (!rawText || !taskTitle) {
    return new Response(JSON.stringify({ error: 'Missing taskTitle or rawText' }), { status: 400, headers: { ...hdrs, 'Content-Type': 'application/json' } });
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
    headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 300, messages: [{ role: 'user', content: prompt }] })
  });

  if (!aiRes.ok) {
    const errText = await aiRes.text();
    return new Response(JSON.stringify({ error: 'AI API error: ' + errText }), { status: 502, headers: { ...hdrs, 'Content-Type': 'application/json' } });
  }

  const aiData = await aiRes.json();
  const entry = (aiData.content && aiData.content[0] && aiData.content[0].text || '').trim();
  return new Response(JSON.stringify({ entry }), { status: 200, headers: { ...hdrs, 'Content-Type': 'application/json' } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const hdrs = corsHeaders(origin);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: hdrs });

    if (url.pathname === '/ai-log') return handleAiLog(request, env);

    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: hdrs });

    let body;
    try { body = await request.json(); } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { ...hdrs, 'Content-Type': 'application/json' } });
    }

    if (body.target === 'inbox-state') return handleInboxState(body, env, hdrs);
    return handleTasks(body, env, hdrs);
  }
};
