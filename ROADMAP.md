# Command Centre — Roadmap & Outstanding Items

Last updated: 2026-06-08

## Outstanding Tasks

### work-inbox — Completed 2026-06-08
- [x] Dashboard rebuilt from 2735d43 base — Oxford navy sidebar, light blue main, Inter font
- [x] Time-of-day greeting (Good morning/afternoon/evening) — UK timezone
- [x] GitHub fetch on load — live briefing.json from raw.githubusercontent.com
- [x] Context bar — 5-7 sentence specific briefing, 15px font, no PAT/CI mentions
- [x] Calendar items — specific sub/alert with correct/wrong examples in prompt
- [x] AI cross-references OOO/handover emails to infer absences not in calendar
- [x] Card click-through — whole tile openmail://, hover shadow, checkbox isolated
- [x] Tick to hide — cards and priority rows fade then hide after 1500ms
- [x] Show Done button — reveals hidden items for untick/reference
- [x] Absences — white bullet list, text justified
- [x] Yellow accent for Needs Response section
- [x] Fuzzy EntryID matching + verbatim subject prompt
- [ ] NEXT: Monitor calendar quality over next few runs; multi-machine setup

### High Priority
- [ ] HRIS Dashboard Refresh button broken — 401 error. Root cause: PAT in index.html may not have updated correctly on GitHub. Next session: verify PAT in live index.html on GitHub, fix and confirm Refresh button works. Session ended mid-fix.

- [ ] Add missing CLAUDE.md files to repos that lack them:
  - hr-projects: College Staff in PXD
  - hr-projects: DPIA PXD
  - hr-projects: HR Systems Roadmap
  - hr-projects: ORCID in PXD
  - meeting-records: Meeting Reviews
  - hris-dashboard (local only — HRIS-dashboard-local folder)

### High Priority
- [ ] HRIS Dashboard Refresh button broken — 401 error. Root cause: PAT in index.html may not have updated correctly on GitHub. Next session: verify PAT in live index.html on GitHub, fix and confirm Refresh button works. Session ended mid-fix.

- [ ] Build Command Centre GitHub Pages dashboard — single entry point for all projects. Must include: live links to all repos and GitHub Pages deployments, ROADMAP outstanding tasks visible at a glance, Quick Load URLs per project (one-click copy), last commit date per repo. Dedicated session required.

### Medium Priority
- [ ] Delete desktop-tutorial repo (browser: https://github.com/begb0037admin/desktop-tutorial)
- [ ] HRIS-dashboard-local: push 25 unpushed commits to hris-dashboard after secrets scrub
- [ ] HRIS-dashboard-local: add .gitignore to prevent session.json, saasit_cookies.json being committed
- [ ] Investigate SAASIT session expiry — dashboard requires manual refresh every session

### Personal Domain (pass to Hope)
- [ ] AIMM public repo: confirm no hardcoded ElevenLabs/Anthropic keys in index.html
- [ ] Personal Finance: diff Kevin Lelitte Personal Finance vs Personal Finance — confirm canonical copy, archive legacy folder

## Repo Index

| Repo | URL | Branch | CLAUDE.md Quick Load |
|---|---|---|---|
| clockify | https://github.com/begb0037admin/clockify | main | https://raw.githubusercontent.com/begb0037admin/clockify/main/CLAUDE.md |
| hris-dashboard | https://github.com/begb0037admin/hris-dashboard | main | https://raw.githubusercontent.com/begb0037admin/hris-dashboard/main/CLAUDE.md |
| hris-launcher | https://github.com/begb0037admin/hris-launcher | main | https://raw.githubusercontent.com/begb0037admin/hris-launcher/main/CLAUDE.md |
| hr-fa-knowledge-base | https://github.com/begb0037admin/hr-fa-knowledge-base | main | https://raw.githubusercontent.com/begb0037admin/hr-fa-knowledge-base/main/CLAUDE.md |
| work-inbox | https://github.com/begb0037admin/work-inbox | main | https://raw.githubusercontent.com/begb0037admin/work-inbox/main/CLAUDE.md |
| hr-projects | https://github.com/begb0037admin/hr-projects | main | (see subfolders) |
| meeting-records | https://github.com/begb0037admin/meeting-records | main | (see subfolders) |
| command-centre | https://github.com/begb0037admin/command-centre | main | https://raw.githubusercontent.com/begb0037admin/command-centre/main/CLAUDE.md |

## Session Start — Quick Load URLs

Paste these into Claude at the start of a session to load context:

| Project | URL |
|---|---|
| Command Centre (this file) | https://raw.githubusercontent.com/begb0037admin/command-centre/main/ROADMAP.md |
| Clockify | https://raw.githubusercontent.com/begb0037admin/clockify/main/CLAUDE.md |
| HRIS Dashboard | https://raw.githubusercontent.com/begb0037admin/hris-dashboard/main/CLAUDE.md |
| HR FA Knowledge Base | https://raw.githubusercontent.com/begb0037admin/hr-fa-knowledge-base/main/CLAUDE.md |
| Work Inbox | https://raw.githubusercontent.com/begb0037admin/work-inbox/main/CLAUDE.md |
| Command Centre | https://raw.githubusercontent.com/begb0037admin/command-centre/main/CLAUDE.md |