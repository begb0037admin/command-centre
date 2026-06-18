# command-centre — Living Handover Document

**Last updated:** 2026-06-18 (badge alignment + UI polish)
**Status:** Active — Module 1 live at https://begb0037admin.github.io/command-centre/

---

## Architecture

| Component | Description |
|---|---|
| `index.html` | Single-file dashboard. Oxford navy sidebar (320px), blue-grey main (#f5f7fb), Inter font. No framework, no build step. |
| `data/tasks.json` | Task data. Fields: id, title, tier (today/week/parked), source, emailRef, notes, actions[], dateAdded. |

---

## Current State (fully working as of 2026-06-18)

### Working
- GitHub Pages live — `begb0037admin.github.io/command-centre/`
- `data/tasks.json` loads on page open (cache-busted with `?_=Date.now()`)
- Three priority tiers: Today / Tomorrow / This Week / Parked
- Sidebar: Oxford navy, 320px, real OUO.jpg crest (base64), live task counts per tier, week-start date, Add Task button
- Collapsible task drawers: chevron toggle, action bullet list (→), source/emailRef/date metadata grid, editable notes with Save button, Move To tier controls
- Quick-add panel: floating, title + tier picker + source + emailRef + notes, defaults source to "Manual", Esc to close
- Done state: checkbox tick fades + strikes through card, persists in localStorage (`commandCentre_done_v1`)
- Hide/Show Done toggle in header
- Time-aware greeting: Good morning / afternoon / evening, Kevin
- Cloudflare Worker write-back (`cc-tasks-writer.kevinlelitte.workers.dev`) — PAT held server-side; tasks.json writes, tier moves, notes edits and suggestion drags all persist from any machine/browser
- 'From your inbox' suggestion panel — drags AI-proposed tasks into tier lists; dismissals persist in localStorage
- **Badge alignment fixed** — `.task-card-top` has `width: 100%` so NEW/UPDATED badges always appear at far right, not adjacent to title text
- **Badge CSS normalised** — NEW (green) and UPDATED (blue) badges now identical to Work Inbox: 11px / 600wt / 3px 8px padding / 5px radius / coloured borders (`.task-badge`, `.task-badge-new`, `.task-badge-updated`)
- **Emoji removed** from all three "Open email" button locations (task card header, drawer, suggestion panel)

### Known Limitations (by design — v1)
- Manual tasks added via quick-add panel persist via Cloudflare Worker write-back (added after v1).
- Done state in localStorage is keyed by task ID — if `tasks.json` is regenerated with new IDs, done state resets.

### GitHub Pages
- Enabled manually by Kevin after first push (Settings → Pages → main / root)
- Deploy time ~1 min after push to main

---

## File Locations

| File | Path |
|---|---|
| Dashboard | `index.html` (repo root) |
| Task data | `data/tasks.json` |
| Oxford crest | Embedded as base64 in `index.html` (source: OUO.jpg) |
| Inbox suggestions | `data/inbox_suggestions.json` (written by work-inbox fetch_inbox.py Phase 3.5) |
| Triage ledger | `data/triage_ledger.json` (dedup tracker for Phase 3.6 auto-updates) |
| Archive | `Archive/tasks_backup_YYYYMMDD.json` (auto-created before every write) |

---

## Next Action

**ROADMAP item 1:** Wire Granola meeting review → Kevin approves extracted actions → push approved actions to `data/tasks.json` via GitHub Contents API. This is the core automation loop.

---

## Session Notes

### 2026-06-08 — Module 1 build (Hope cross-domain)
- Kevin hit token cap mid-session; Hope completed build under Cross-Domain Code Brief
- Design sourced from hris-launcher (colour vars) and work-inbox (card/checkbox patterns)
- Oxford crest: Kevin uploaded OUO.jpg — embedded as base64, replacing SVG approximation
- Sidebar scaled to 320px to match HRIS Launcher; font sizes increased throughout
- All 13 seed tasks enriched with action bullet arrays from SK 1-1 Granola transcript
- Domain boundary resumed on return Code Brief

### 2026-06-18 — Badge alignment + UI polish
- **Badge alignment fixed** — badges were appearing adjacent to title text. Fix: added `width: 100%` to `.task-card-top` so flexbox pushes badge to far right.
- **Badge CSS normalised** — updated `.task-badge`, `.task-badge-new`, `.task-badge-updated` to match Work Inbox exactly (11px / 600wt / 3px 8px / 5px radius / coloured borders).
- **Emoji removed** — stripped from all three "Open email" button instances in index.html.
- Live on main: commit `e7c4b22`. Changes pushed directly to main.
