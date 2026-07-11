# Copilot Task Research Routine

## Purpose
Kevin has Microsoft 365 Copilot built into Outlook. It's not wired into any automated
pipeline (wi's `fetch_inbox.py` uses Outlook COM, not Copilot/Graph — see work-inbox
CLAUDE.md "What Was Tried and Abandoned"). Its use case is narrower and manual: **recovering
a specific overlooked task when Kevin knows roughly who it came from but not the exact
email.** Claude drafts the Copilot search brief, Kevin runs it in Outlook and pastes the
result back, Claude turns the output into a properly-formatted Command Centre task.

Do not use this routine for routine inbox triage — that's what the automated wi pipeline
and `docs/INBOX_PICKUP_ROUTINE.md` are for. Reach for this only when a task has genuinely
gone missing and needs manual excavation.

## Trigger Phrases
"copilot brief", "check with copilot", "find this in outlook", "I know the sender but not
the email", "overlooked task" + a sender name. No fixed phrase list — the signal is Kevin
describing a specific known-sender, unknown-email situation.

---

## Step 1 — Draft the Copilot brief (Claude writes it, always)

Kevin should never have to word the Copilot query himself — a vague brief returns a vague,
recency-biased summary (in practice Copilot defaults to whatever thread is most prominent,
e.g. a recurring meeting series, and buries one-off emails). Claude always drafts the exact
text Kevin pastes into Copilot. Default template:

> Search my mailbox (inbox and all subfolders) for every email from **[sender]** in the
> last **[timeframe]**. List every distinct email individually — do not group or collapse
> similar threads. For each one, give me: the exact date received, the exact subject line,
> and a full summary of the body content including any specific requests, deadlines, or
> action items. Do not paraphrase away specifics — keep names, dates, and numbers exact.

Adjust timeframe based on what Kevin knows (default to a few months if unsure — widen
rather than narrow). Do not add exclusions (e.g. "skip meeting invites") unless Kevin
explicitly asks — meeting-only emails can still carry real actions in their body.

## Step 2 — Kevin runs it, pastes the output back

No action needed from Claude except waiting.

## Step 3 — Separate live asks from stale/resolved ones

Read every email Copilot returned. For each one, classify:
- **Live ask** — explicit request/deadline with no visible reply or resolution anywhere
  later in the thread.
- **Resolved** — a later email in the same thread shows a reply, confirmation, or "thank
  you" acknowledging it.
- **Logistics only** — meeting invites, Teams joining details, automatic replies. Not a
  task on their own, but don't discard — read the body for buried asks first.

Only live asks become task candidates. State your reasoning to Kevin plainly (this repo's
task standard requires the underlying "why" to survive in `description`/`actions`, not
just the conclusion).

## Step 4 — Cross-check the HR-FA Knowledge Base

Before proposing the task, check `begb0037admin/hr-fa-knowledge-base` for existing guidance
relevant to the ask — it may already be documented, which changes the task from "figure
this out from scratch" to "here's the how-to."

**Technical gotcha:** `data/kb.json` (~7MB, 2500+ documents) is too large for GitHub's code
search to index — `search_code` with `path:data/kb.json` returns zero hits even for terms
that are definitely in the file. This is a false negative, not confirmation the KB is empty
on that topic. To search it properly:

```bash
curl -sL "https://raw.githubusercontent.com/begb0037admin/hr-fa-knowledge-base/main/data/kb.json?t=$(date +%s)" -o kb.json
python3 -c "
import json
data = json.load(open('kb.json'))
term = 'your search term'.lower()
for d in data:
    blob = ' '.join(str(v) for v in d.values() if isinstance(v, str)).lower()
    if term in blob:
        print(d['t'])
"
```

Each record has `t` (title), `s`/`ss`/`sl` (summary variants), `p` (path/URL), `tp` (topic),
`sy` (system tag). Report back what's genuinely relevant — don't force a match.

## Step 5 — Check for an existing task before creating a new one

Search `command-centre`'s `data/tasks.json` for an existing task on the same topic/module
before proposing a brand new card. If one exists, fold the new information in as dated
`actions` entries rather than duplicating — ask Kevin to confirm which (existing task ID,
or new task + tier) before writing anything.

## Step 6 — Write to tasks.json

Follow command-centre's own **MANDATORY — BACKUP AND VERIFY PROTOCOL** (see main
`CLAUDE.md`) without exception. One added technical note for this environment:

**Technical gotcha:** in a Claude Code on the web / remote-environment session, direct
`PUT` calls to the GitHub Contents API over curl are blocked by the environment's outbound
proxy (`403 Write access to this GitHub API path is not permitted through this proxy`).
The `create_or_update_file` MCP tool still works, but for a file this size (60KB+) typing
its full literal content into a tool-call parameter is a real transcription-risk — a single
dropped character silently corrupts Kevin's live task data.

The reliable path: `git clone` the repo over HTTPS using the session's `$GITHUB_TOKEN` (git
push over HTTPS is *not* blocked by the proxy, only the raw Contents API is), make the edit
locally with normal file tools, commit, and `git push`. Verify integrity by comparing
`git hash-object <file>` locally against the `sha` field the GitHub Contents API reports for
the same path/ref after pushing — an exact match confirms byte-identical content, which is
a stronger check than eyeballing a diff.

```bash
git clone --branch <branch> --single-branch "https://x-access-token:${GITHUB_TOKEN}@github.com/begb0037admin/command-centre.git" repo
# ... edit, backup, commit, push ...
git hash-object data/tasks.json   # compare against the API's "sha" field
```

If this session is on a designated feature branch (see the session's own branch
requirements, if any) rather than pushing straight to `main`, open a draft PR for the
branch once pushed — command-centre's own "push directly to main" rule is written for
normal interactive sessions and doesn't anticipate a branch-per-session harness.

## Step 7 — Confirm with Kevin

Report what was found, what's genuinely a live task vs. resolved, what the KB offered, and
which task/tier it landed in (or was folded into). Don't consider the loop closed until
Kevin has seen the actual change.

---

## Safety Rules

1. Claude always drafts the Copilot brief — never ask Kevin to word his own search.
2. Widen search scope (timeframe, folders) before narrowing — Copilot under-returns by
   default; don't add exclusions unless Kevin asks.
3. Distinguish live asks from resolved threads before proposing a task — don't create a
   task for something already answered.
4. Check the KB (via raw fetch, not code search) before concluding "nothing exists."
5. Check for an existing related task before creating a new one — fold in when the topic
   overlaps.
6. Full backup-and-verify protocol applies to every `tasks.json` write, no exceptions.
7. Verify writes via `git hash-object` vs. the GitHub API's reported `sha` — don't assume a
   tool call succeeded correctly for large files.
