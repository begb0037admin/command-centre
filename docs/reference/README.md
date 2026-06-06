# Reference

Stable, slow-moving reference material for this project. Things that get written once and read on demand — not on every session bootstrap.

Examples of what belongs here:
- `glossary.md` — domain terms with definitions
- `runbook.md` — operational procedures (how to deploy, how to roll back, how to rotate keys)
- `schema.md` — data models, API contracts, file layouts
- `architecture.md` — high-level system diagram and component overview
- `style-guide.md` — coding / writing conventions in detail (if `CLAUDE.md`'s one-liner isn't enough)

Examples of what does **not** belong here:
- Current state → `docs/STATUS.md`
- In-flight context → `docs/HANDOVER.md`
- Specific decisions → `docs/decisions/`
- Session logs → `docs/sessions/`

If a piece of content here ever becomes a *decision* with trade-offs, promote it to an ADR.
