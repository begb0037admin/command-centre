# Command Centre — Claude Bootstrap
Last updated: 2026-06-06

## Identity
- **Project:** Command Centre
- **Purpose:** (1) Master orientation hub for all of Kevin's work projects — repo index, outstanding tasks, session start pattern. (2) Browser-based HTML operations hub — quick-launch buttons for Claude tools (Chrome extension), Granola meeting access, and daily workflow shortcuts.
- **Owner:** Kevin Lelitte — HR Systems Manager/Director
- **GitHub account:** begb0037admin
- **Status:** Active
- **Repository:** C:\Users\begb0037.AD-OAK\Work Folders\Documents\Claude\Projects\Command Centre

## Domain Boundary
**WORK (Kevin's domain):** Clockify, Command Centre, HR Systems Roadmap, DTP1092, DPIA PXD, ORCID in PXD, KPI Agenda, Meeting Reviews, SK Handover, HR FA Knowledge Base, HRIS Dashboard, Work Inbox.

**PERSONAL (Hope's domain):** AIMM (dashboard + YouTube). Never mix domains unless a Cross-Domain Code Brief has been issued.

## Session Start Pattern
1. Load this file (CLAUDE.md) for orientation
2. Load ROADMAP.md for outstanding tasks:
   https://raw.githubusercontent.com/begb0037admin/command-centre/main/ROADMAP.md
3. Load the CLAUDE.md for the specific project you are working on
4. Confirm with Kevin which task to tackle before doing anything

## Bootstrap Order (local app)
1. This file
2. docs\STATUS.md
3. docs\HANDOVER.md

## Repo Index

| Repo | GitHub Pages | CLAUDE.md Quick Load |
|---|---|---|
| clockify | https://begb0037admin.github.io/clockify/ | https://raw.githubusercontent.com/begb0037admin/clockify/main/CLAUDE.md |
| hris-dashboard | https://begb0037admin.github.io/hris-dashboard/ | https://raw.githubusercontent.com/begb0037admin/hris-dashboard/main/CLAUDE.md |
| hris-launcher | — | https://raw.githubusercontent.com/begb0037admin/hris-launcher/main/CLAUDE.md |
| hr-fa-knowledge-base | https://begb0037admin.github.io/hr-fa-knowledge-base/ | https://raw.githubusercontent.com/begb0037admin/hr-fa-knowledge-base/main/CLAUDE.md |
| work-inbox | https://begb0037admin.github.io/work-inbox/ | https://raw.githubusercontent.com/begb0037admin/work-inbox/main/CLAUDE.md |
| hr-projects | — | (see subfolders) |
| meeting-records | — | (see subfolders) |
| command-centre | — | https://raw.githubusercontent.com/begb0037admin/command-centre/main/CLAUDE.md |

## Where Things Live (local app)
| What | Where |
|---|---|
| Main application | command-centre.html (project root) |
| Current state | docs\STATUS.md |
| Latest handover | docs\HANDOVER.md |
| Architecture decisions | docs\decisions\ |
| Framework reference | PROJECT_OS.md |
| Agent roles | AGENT_MODEL.md |
| Rollover procedure | ROLLOVER_SOP.md |

## Seat Model
| Seat | Role | Rule |
|---|---|---|
| A | Claude Chat | Reasons, plans, drafts all briefs. Always first. |
| B | Kevin (local machine) | Runs scripts, pastes output back verbatim. |
| C | Cowork | Disk writes only. No network access to external APIs. |
| D | Chrome | Smoke tests only. Read-only. Last resort. |

## GitHub API — Important Constraints
- Most repos are public. Raw files are fetchable without auth.
- PAT only needed for write operations (PUT/POST to Contents API).
- Current PAT: stored in Kevin's preferences — never hardcode in any committed file.
- Cowork cannot make GitHub API calls — outbound network is disabled in its sandbox.
- All PUT/POST operations must go through Seat B (Kevin's local PowerShell or Python).
- Always use byte-level encoding for GitHub Contents API PUT. Never use PowerShell string conversion (UTF-16 corruption risk).

## Conventions
- Single HTML file — no framework, no build step
- Claude in Chrome extension required for live button actions
- All changes go through Cowork (Seat C)

## Hard Rules
- Single file only — no splitting
- No credentials embedded in HTML
- Never mix work and personal domains in the same session or brief
- One dispatch at a time — wait for result before the next

## Out of Scope
- Project management (individual project folders)
- AIMM (personal project — Hope's domain only)

## Failover Chain
Kevin → Hope
