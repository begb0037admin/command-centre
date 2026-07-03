# command-centre — Roadmap

**Last updated:** 2026-07-03
**Module 1 status:** ✅ Complete and live

---

## Module 1 — To-Do Dashboard ✅

- [x] Single-file `index.html` — no framework, no build step
- [x] Oxford navy sidebar (340px) — crest, branding, live task counts, week summary, Add Task
- [x] Three priority tiers: Today 🔴 / This Week 🟡 / Parked ⚪
- [x] Task cards with collapsible drawers — action bullets, source badge, email ref, editable notes, Move To controls
- [x] Quick-add panel — title, tier picker, source, email ref, notes
- [x] Done state — checkbox fade/strikethrough, persists in localStorage
- [x] Hide/Show Done toggle
- [x] Seed data — 13 tasks from SK 1-1 08/06, enriched with action detail from Granola transcript
- [x] GitHub Pages live — `begb0037admin.github.io/command-centre/`
- [x] Repo standardised — CLAUDE.md, HANDOVER.md, ROADMAP.md, README.md, AGENT_MODEL.md, CONSTITUTION.md

---

## Next — Module 1 Automation

### Priority 0 — Cloudflare Worker persistence ✅ Resolved — 2026-06-23

Two root causes identified and fixed:

1. **Schema mismatch** — `persistTasks()` was sending `{content:{tasks:[]}}` but the Worker reads `{doc}`. Fixed: dashboard now sends `{doc:{tasks:[]}}` (commit `0641890`).
2. **Cloudflare secret name mismatch** — Worker code reads `env.HRIS_GITHUB_PAT` but the secret was stored as `GITHUB_PAT`. Fixed: Kevin added `HRIS_GITHUB_PAT` to Cloudflare Worker secrets (2026-06-23).

**Also added:** Save-status toast in `persistTasks()` — "Saving…" (blue), "Saved ✓" (green, 3s auto-dismiss), "Save failed ✗ (HTTP XXX)" (red, tap to dismiss). Sidebar "Last save" row.

Confirmed working 2026-06-23: card moves, tier changes, notes edits, and inbox suggestion drags all persist across page refresh.

### Priority 1 — Granola → Task write-back
Wire Granola meeting review → Kevin approves extracted actions → push approved actions to `data/tasks.json` via GitHub Contents API. This is the core automation loop. Also resolves the manual-task persistence limitation in v1.

### Priority 2 — Link tasks to work-inbox
Surface email references on task cards as clickable `openmail://` links, pulling from `work-inbox/data/briefing.json` by subject match or case number.

### Priority 3 — Persistent manual tasks
Until Granola write-back is live, add GitHub API write-on-add for tasks created via the quick-add panel. Requires PAT prompt on page load (same pattern as hris-dashboard).

---

## Module 1.5 — AI Chat Panel ⏳ Planned (post-migration)

**Prerequisite:** File split & Cloudflare Pages migration complete (see migration plan dated 2026-06-25). Do not begin this module until migration is confirmed stable.

**Summary:** Replace the unused "From your inbox" suggestions panel with an embedded AI chat interface. Kevin types freeform notes and updates in the dashboard; Claude processes them and appends properly dated action entries to the relevant task — no separate Claude session required.

### What gets built

| Component | Detail |
|---|---|
| "Ask Claude" nav item | Replaces "From your inbox" in the sidebar nav |
| Chat panel (main area) | Multi-turn conversational UI — same view-switching pattern as existing panels |
| `js/chat.js` | Chat UI logic and thread management (clean new file in modular codebase) |
| Worker `/chat` route | New route on `cc-tasks-writer` — receives message + tasks context, calls Anthropic API, returns reply + action entries to append |
| `data/chat_history.json` | Persistent rolling conversation history (~20 exchanges). Loaded on panel open, saved after each exchange. GitHub-backed — works from any browser/machine. |
| `ANTHROPIC_API_KEY` | New secret on `cc-tasks-writer` Worker (Kevin's Cloudflare account) |

### Behaviour — Phase 1 (actions only)

- **Freeform input** — type anything; Claude asks clarifying questions if the task or intent is unclear
- **Actions-only writes** — Claude appends `[DD Mon YYYY]` dated entries to `tasks[].actions[]` only. No tier changes, no summary edits in Phase 1.
- **Multi-turn** — full conversation thread passed with each API call; Claude retains context within the session
- **Persistent memory** — last ~20 exchanges stored in `data/chat_history.json`; loaded on next visit so Claude remembers recent context across sessions
- **Clear history** — manual reset button in the chat panel

### Also removed in this phase

- "From your inbox" nav item, panel HTML, and all inbox suggestions JS/fetch logic
- Phase 3.5 of `fetch_inbox.py` (inbox suggestions generation — confirmed unused in practice)
- `data/inbox_suggestions.json` archived

### Governance gates

| Gate | Requirement |
|---|---|
| Before build | Migration confirmed stable on Cloudflare Pages |
| UI change | Screenshot of chat panel approved by Kevin before push to main |
| Worker change | Kevin approves `/chat` route addition and `ANTHROPIC_API_KEY` secret |
| Phase 2 (future) | Expand chat authority to tier changes and summary edits — separate planning session |

### Combined with work-inbox

The same chat feature is planned for the work-inbox dashboard in parallel — same Worker route, same `ANTHROPIC_API_KEY` secret, separate `data/chat_history.json` per repo. Both dashboards form a unified AI assistant accessible from either screen. See `work-inbox/ROADMAP.md`.

---

## Module 2 — Command Centre Wrapper (future)

A second panel or tab giving:
- Repo index — live links to all GitHub Pages deployments
- ROADMAP view — outstanding items across all repos at a glance
- Quick Load URLs — one-click copy per project
- Last commit date per repo (GitHub API)

---

## Module 3 — Calendar Integration (future)

Pull today's calendar events from Granola or Outlook COM and display in sidebar below the task counts. Surface meeting-sourced tasks automatically.

---

## Cross-Project Backlog

### ⚠️ URGENT — hr-fa-knowledge-base: KB Regression + Access Group Guide PDF Scrape

**The KB is currently broken and must be fixed before any other KB work.**

#### Step 1 — Fix the regression (do this first)

The KB has regressed from **2,303 → 2,208 documents** due to a failed guide PDF scrape attempt that overwrote `downloads/manifest.csv` with 0 rows. The PDFs are still physically present — only the manifest references were lost.

Fix:
1. Restore `downloads/manifest.csv` from git commit `2a574d8` (944 rows, all collection PDFs)
2. Rebuild the index — no re-scraping needed, PDFs are already there
3. Verify `data/kb.json` returns to 2,303+ documents before proceeding

#### Step 2 — Resume guide PDF scrape (after regression fixed)

**Goal:** Download individual step-by-step PDF guides from 11 PeopleXD module guide index articles and index them — so Kevin can ask "how do I configure the Organisational Structure?" and get actual guide content.

**Why previous attempts failed:** The DOM structure of the guide index articles was never inspected before writing selectors. Three attempts, 0 PDFs downloaded.

**How to proceed correctly:**
- Run the diagnostic print block in `scrapers/access_group_scraper.py` (`harvest_guide_pdfs()`) with `--guides-only --limit 1`
- Read the output to determine actual link patterns before writing any selector
- Full diagnostic code and failure analysis in `begb0037admin/hr-fa-knowledge-base/HANDOVER.md`

**Key facts:**
- Scraper infrastructure (`harvest_guide_pdfs()`, `--guides`, `--guides-only` flags) already in place
- 11 guide index article IDs already in `GUIDE_INDEX_ARTICLES` in the scraper
- Estimated 50–150 additional documents once working
- Self-hosted runner required (cloud agents cannot reach Access Group portal)

**Detail:** `begb0037admin/hr-fa-knowledge-base/HANDOVER.md`

---

### hris-dashboard — Linda Voice (TTS + STT) 🎤

Add voice input and output to the Linda AI panel in the HRIS Team Open Tickets dashboard.

- **STT (Speech-to-Text):** Mic button → Scribe v2 via `/stt` route on `hr-kb-ai.kevinlelitte.workers.dev`
- **TTS (Text-to-Speech):** Linda responses read aloud via ElevenLabs `/tts` route on same Worker
- **No new Worker or secrets needed** — both routes and `ELEVENLABS_API_KEY` already live in `hr-kb-ai` (used by HR FA Knowledge Base)
- **Reference implementation:** `begb0037admin/hr-fa-knowledge-base/index.html` — mic + listen button pattern to port across
- **Detail:** `begb0037admin/hris-dashboard/ROADMAP.md`

---

## Repo Index (for reference)

| Repo | GitHub Pages | CLAUDE.md |
|---|---|---|
| command-centre | https://begb0037admin.github.io/command-centre/ | https://raw.githubusercontent.com/begb0037admin/command-centre/main/CLAUDE.md |
| clockify | https://begb0037admin.github.io/clockify/ | https://raw.githubusercontent.com/begb0037admin/clockify/main/CLAUDE.md |
| work-inbox | https://begb0037admin.github.io/work-inbox/ | https://raw.githubusercontent.com/begb0037admin/work-inbox/main/CLAUDE.md |
| hris-launcher | https://begb0037admin.github.io/hris-launcher/ | — |
| hr-fa-knowledge-base | https://begb0037admin.github.io/hr-fa-knowledge-base/ | https://raw.githubusercontent.com/begb0037admin/hr-fa-knowledge-base/main/CLAUDE.md |
| hris-dashboard | https://begb0037admin.github.io/hris-dashboard/ | https://raw.githubusercontent.com/begb0037admin/hris-dashboard/main/CLAUDE.md |

## Standards Update — 08 Jun 2026
- Task field `notes` renamed to `description` across tasks.json and index.html
- New standard: description = context/history/background; actions = dated log of done/todo/awaiting
- Backup of pre-change tasks.json: Archive/tasks_backup_20260608.json
- All 14 existing tasks restructured to new standard
