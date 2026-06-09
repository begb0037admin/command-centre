# CLAUDE.md — command-centre
> AI bootstrap entry point. Read this first.
> Keep this file under 200 lines. Push details to linked docs.

## Identity
- **Project:** Command Centre — To-Do Dashboard (Module 1)
- **Purpose:** Weekly task dashboard for Kevin Lelitte. Three priority tiers (Today / This Week / Parked). Tasks sourced from meeting notes and Granola transcripts. Collapsible drawers show action detail, source, notes, and tier-move controls.
- **Owner:** Kevin Lelitte, HR Systems Manager/Director, University of Oxford
- **Status:** Active — Module 1 live
- **Repo:** https://github.com/begb0037admin/command-centre
- **Live dashboard:** https://begb0037admin.github.io/command-centre/
- **Last updated:** 2026-06-08 (v1.0 — Module 1 complete)

## Bootstrap Order
1. This file (orientation)
2. `HANDOVER.md` (current state, known issues, next action)
3. `ROADMAP.md` (outstanding items and future modules)
4. Confirm with Kevin which task to tackle before doing anything

## Architecture
| Component | Description |
|---|---|
| `index.html` | Single-file dashboard. Oxford navy sidebar (320px), blue-grey main area (#f5f7fb). No framework, no build step. |
| `data/tasks.json` | Task data store. Fields: id, title, tier, source, emailRef, notes, actions[], dateAdded. |

## Data Flow
Tasks load from `data/tasks.json` on page open (cache-busted). Done-state persists in `localStorage` (key: `commandCentre_done_v1`). Manual tasks added via quick-add panel exist in memory only — lost on refresh. Persistent manual tasks require GitHub write-back (ROADMAP item 1).

## Design System
- Oxford navy sidebar: `#002147`
- Main background: `#f5f7fb` (matches hris-launcher)
- Font: Inter (Google Fonts)
- Tier colours: Today `#ef4444` / This Week `#f59e0b` / Parked `#94a3b8`
- Oxford crest embedded as base64 JPEG (OUO.jpg)

## GitHub
- **Repo:** `begb0037admin/command-centre`
- **Branch:** `main`
- **Pages:** enabled — deploys from root of main
- **Proxy reads:** `https://github-proxy.lelitte.co.uk/command-centre/`
- **API writes:** `https://api.github.com/repos/begb0037admin/command-centre/contents/{path}?ref=main`
- PAT stored in Kevin's preferences — never commit to any file

## Seat Model
| Seat | Role | Rule |
|---|---|---|
| A | Claude Chat | Reasons, plans, writes all code and briefs. Always first. |
| B | Kevin | Runs scripts, pastes output back verbatim. |
| C | Cowork | Disk writes only. No GitHub API access. |
| D | Chrome | Smoke-test only. Read-only. Last resort. |

## Hard Rules
- Single `index.html` — no framework, no build step
- No credentials in any committed file
- All GitHub writes via Seat B (Contents API + PAT)
- One dispatch at a time — wait for result before next
- tasks.json is the source of truth for task content — not session memory

## Domain
**WORK (Kevin's domain).** Do not mix with Hope's personal domain (AIMM, Personal Finance) unless a Cross-Domain Code Brief has been issued.

## Failover
Kevin → Hope (Cross-Domain Code Brief required)

## Task Data Standard (established 08 Jun 2026)
Each task in data/tasks.json follows this structure:
- **description** — the issue, background, context, history, dependencies. What it is and why it matters.
- **actions** — a dated log of everything done and everything still to do. Format: [DD Mon YYYY] for completed. [TODO] for pending. [AWAITING] for blocked on someone else. [MONITOR] for passive watch items.
- Never put actions in description. Never put context or history in actions.
- Rollback: Archive/tasks_backup_20260608.json contains pre-standard snapshot.

---

## Backup and Recovery Procedures

### Auto-backup rule — mandatory before every write

Before any write to `data/tasks.json` or `index.html`, Seat A MUST:
1. Check whether a backup for today's date already exists in `Archive/`
2. If not, fetch the current file and push it to `Archive/` with a datestamped filename:
   - `Archive/tasks_backup_YYYYMMDD.json`
   - `Archive/index_backup_YYYYMMDD.html`
3. Only then proceed with the intended write

No exceptions — single-task updates, bulk changes, and UI edits alike.
If a backup for today's date already exists in Archive/, skip — it is already taken.

### Rollback procedure

If a bad push is made, restore as follows:

Step 1 — Find the last good commit:
GET https://api.github.com/repos/begb0037admin/command-centre/commits?path=data/tasks.json&per_page=5
Identify the commit SHA immediately before the bad one.

Step 2 — Fetch the file at that commit:
GET https://api.github.com/repos/begb0037admin/command-centre/contents/data/tasks.json?ref=COMMIT_SHA
Decode the base64 content field.

Step 3 — Restore via PUT with the old content and message 'Rollback to COMMIT_SHA'.

Alternative — restore from Archive/: fetch tasks_backup_YYYYMMDD.json for the nearest date
and PUT it back. For index.html use index_backup_YYYYMMDD.html.

### Staleness guard — inbox pickup routine

When running the inbox pickup routine (docs/INBOX_PICKUP_ROUTINE.md):
- Read refreshed_at from briefing.json
- If the timestamp is more than 24 hours old, STOP and warn Kevin before proceeding
- Never auto-update tasks from stale briefing data without Kevin explicit confirmation
