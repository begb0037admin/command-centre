# PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE - Remediation Request

**Phase:** CLOUDFLARE_PHASE_SPLIT_MIGRATE  
**Date:** 2026-06-25  
**Produced by:** Codex, Challenging Agent  
**Trigger:** Challenge Report verdict GAPS FOUND  
**Revision:** Challenge response applied after Kevin Seat B challenge brief, 2026-06-25

## Required remediation

Before the plan is approved for execution, Claude Code must revise the plan and provide evidence that each item below is addressed.

| ID | Required remediation |
|---|---|
| R1 | Resolve the command-centre CLAUDE.md conflict before Phase 1. Either revise the plan to comply with the current "Single `index.html`" hard rule, or add a governed pre-implementation step to update command-centre CLAUDE.md architecture and hard rules after Kevin approval and before file splitting. |
| R2 | Clarify that this review is an additive pre-execution plan challenge, not formal Stage 3. State explicitly that after implementation the normal GOVERNANCE_WORKFLOW_STANDARD.md sequence still applies in full: Stage 1 Execute, Stage 2 Evidence Package, Stage 3 Review Request and Challenge Report, then remediation/validation/governance as required. |
| R3 | Expand Phase 0 restore-point capture. Required baselines: current `index.html` SHA and Archive backup path, current `data/tasks.json` SHA and Archive backup path, current repo commit SHA, current GitHub Pages source/settings, current Cloudflare Worker CORS allowlist for `cc-tasks-writer`, current `github-proxy` read endpoint behaviour, and any current custom-domain/bookmark state. |
| R4 | Add missing approval gates from AGENT_MODEL.md Section 2. Kevin approval is required before live test writes that create tasks or move tiers, Cloudflare Pages repo connection/GitHub app authorization, Cloudflare build/deployment settings, Worker CORS changes, custom domain/bookmark changes, production cutover, disabling GitHub Pages, and any repo visibility change. A `*.pages.dev` preview of identical already-public content is not a separate approval gate. |
| R5 | Expand Phase 2 functional-equivalence verification. Include dashboard load, CSS/JS asset load with no 404/MIME errors, visual screenshot approval, task load, quick add, move by button, move by drag/drop, rename, delete, notes save, done toggle persistence, show/hide done, suggestion load, suggestion promote-to-task, suggestion dismiss localStorage, openmail link behaviour, custom quick links, sidebar resize, stale banner/action counts, `github-proxy` reads, raw fallback reads, and Worker writes. Use explicit Kevin-approved test data and rollback. |
| R6 | Expand Phase 3 Cloudflare verification. Include `cc-tasks-writer` CORS/origin checks, dual-origin support while GitHub Pages and Cloudflare Pages both exist, cache-busted reads, `github-proxy` read smoke tests from the Pages URL, Worker write round trip from the Pages URL, raw Work Inbox suggestion reads from the Pages URL, custom-domain DNS/TLS checks if used, and Cloudflare Pages automatic deployment rollback. |
| R7 | Add a Work Inbox sequencing section. It must cover shared `cc-tasks-writer` usage, Work Inbox `fetch_inbox.py` Phase 3.6 writes to command-centre `data/tasks.json`, Work Inbox tick sync to `data/ticks.json`, hardcoded links from Work Inbox to command-centre, hardcoded links from command-centre to Work Inbox, and required dual-origin Worker allowances until both migrations are complete. |
| R8 | Add a repository visibility decision point. Because Cloudflare Pages supports private and public GitHub repositories, the plan must decide whether command-centre and work-inbox remain public after GitHub Pages is disabled, and must record the data-exposure decision in each repo's CLAUDE.md as required by AGENT_MODEL.md Section 7. |
| R9 | Expand the DR table to include split-file asset failures, load-order failures, `github-proxy` read/proxy failures, `cc-tasks-writer` CORS failures, Cloudflare GitHub app authorization failure, automatic deployment rollback, custom-domain/DNS/TLS failure, concurrent `tasks.json` writes from Work Inbox, Work Inbox cross-link breakage, and rollback of documentation changes. |
| R10 | Add a session closeout gate. The executing agent must update HANDOVER.md at close with the current state, decisions, artefact chain, open risks, rollback point, and next action. Codex must not perform this update unless explicitly authorised. |

## Acceptance criteria

The remediated plan is ready for re-challenge only when:

1. Every item R1-R10 is addressed in a committed plan update or explicitly deferred by Kevin in writing.
2. The plan states exact approval gates and restore points before any implementation write.
3. The plan no longer conflicts silently with command-centre CLAUDE.md or work-inbox CLAUDE.md.
4. The plan preserves the formal six-stage governance workflow after execution.
5. HANDOVER.md closeout is included as a mandatory executing-agent responsibility.

## Claude Code Commit Handoff

Codex could not write to GitHub. Claude Code should commit this file exactly as supplied to:

`docs/project/generated/PHASE_CLOUDFLARE_PHASE_SPLIT_MIGRATE_REMEDIATION_REQUEST_20260625.md`
