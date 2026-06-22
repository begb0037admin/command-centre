# command-centre — Roadmap

**Last updated:** 2026-06-22
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

### Priority 0 — Cloudflare Worker PAT refresh (BLOCKING)
Card moves, tier changes, notes edits, and inbox suggestion drags do not persist across page refresh. Root cause: `persistTasks()` in `index.html` calls the Cloudflare Worker (`cc-tasks-writer.kevinlelitte.workers.dev`) which holds a fine-grained GitHub PAT as a server-side secret. That PAT has almost certainly expired. Symptoms: UI updates instantly (in-memory), but on refresh `tasks.json` is unchanged.

**Fix required (Kevin action):**
1. Log in to Cloudflare dashboard → Workers → `cc-tasks-writer` → Settings → Variables and Secrets
2. Rotate the fine-grained GitHub PAT (Contents: Read & Write on `command-centre` + `work-inbox`)
3. Replace the secret value — no code change needed

**Next Claude action (once PAT confirmed refreshed):**
- Add visible save-status feedback to `persistTasks()` — a toast showing "Saved ✓" or "Save failed ✗ (HTTP XXX)" so failures surface immediately in future.

### Priority 1 — Granola → Task write-back
Wire Granola meeting review → Kevin approves extracted actions → push approved actions to `data/tasks.json` via GitHub Contents API. This is the core automation loop. Also resolves the manual-task persistence limitation in v1.

### Priority 2 — Link tasks to work-inbox
Surface email references on task cards as clickable `openmail://` links, pulling from `work-inbox/data/briefing.json` by subject match or case number.

### Priority 3 — Persistent manual tasks
Until Granola write-back is live, add GitHub API write-on-add for tasks created via the quick-add panel. Requires PAT prompt on page load (same pattern as hris-dashboard).

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
