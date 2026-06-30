// /ai-log endpoint — add this to the cc-tasks-writer Worker
//
// SETUP (one-time, Kevin):
// 1. Go to Cloudflare dashboard → Workers → cc-tasks-writer → Edit code
// 2. Add the handleAiLog function below
// 3. In the main fetch() handler, add this route BEFORE the existing routes:
//      if (url.pathname === '/ai-log') return handleAiLog(request, env);
// 4. Go to Settings → Variables → add Secret: ANTHROPIC_API_KEY (your Anthropic API key)
// 5. Save and Deploy

async function handleAiLog(request, env) {
  const origin = request.headers.get('Origin') || '';
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { taskTitle, taskDescription, existingActions, rawText } = body;
  if (!rawText || !taskTitle) {
    return new Response(JSON.stringify({ error: 'Missing taskTitle or rawText' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

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
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!aiRes.ok) {
    const errText = await aiRes.text();
    return new Response(JSON.stringify({ error: 'AI API error: ' + errText }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const aiData = await aiRes.json();
  const entry = (aiData.content && aiData.content[0] && aiData.content[0].text || '').trim();

  return new Response(JSON.stringify({ entry }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
