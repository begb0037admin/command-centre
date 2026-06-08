# command-centre

**Live dashboard:** https://begb0037admin.github.io/command-centre/

Weekly task dashboard for Kevin Lelitte, HR Systems, University of Oxford. Three priority tiers (Today / This Week / Parked), collapsible task drawers with action detail, persistent done-state via localStorage.

---

## Quick Load

Paste into Claude chat to load project context:

| File | URL |
|---|---|
| `CLAUDE.md` | https://raw.githubusercontent.com/begb0037admin/command-centre/main/CLAUDE.md |
| `HANDOVER.md` | https://raw.githubusercontent.com/begb0037admin/command-centre/main/HANDOVER.md |
| `ROADMAP.md` | https://raw.githubusercontent.com/begb0037admin/command-centre/main/ROADMAP.md |

---

## Architecture

| File | Purpose |
|---|---|
| `index.html` | Single-file dashboard — no framework, no build step. Oxford navy sidebar, three-tier task list, collapsible drawers. |
| `data/tasks.json` | Task data — tier, title, source, email ref, notes, action bullets, date added. |
| `CLAUDE.md` | AI bootstrap entry point. Read first every session. |
| `HANDOVER.md` | Living state document — what's working, what's next. |
| `ROADMAP.md` | Outstanding items and future module plan. |
| `AGENT_MODEL.md` | Runtime operating model — seat roles and dispatch rules. |
| `CONSTITUTION.md` | Enduring operating principles. Governs all repos. |

---

## Seat Model

| Seat | Role |
|---|---|
| A — Claude Chat | Reasons, plans, writes all code and briefs |
| B — Kevin | Runs scripts, pastes output back verbatim |
| C — Cowork | Disk writes only — no GitHub API access |
| D — Chrome | Smoke-test only — read-only |

GitHub writes via PAT (Contents API). PAT stored in Kevin's preferences — never in any committed file.
