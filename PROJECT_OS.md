# Project Operating System (Project-OS)

A reusable operating framework for long-running, AI-assisted projects. Designed for collaboration across Claude, OpenAI, and human operators, with disposable sessions and canonical documents as the unit of continuity.

This is **not** a project. It is a template you clone into any new project so that the first hour of work is structured and the hundredth handover is still cheap.

---

## How to use this template

1. Copy the entire `project-os-template/` folder into your new project's directory.
2. Rename it to match your project, OR move its contents up one level so `CLAUDE.md` sits at the project root and `docs/` sits beside it.
3. Open `CLAUDE.md` and fill in the bracketed slots (project name, purpose, owner, conventions).
4. Bump the dates in `docs/STATUS.md` and write a one-line first handover in `docs/HANDOVER.md`.
5. Delete `docs/ROADMAP.md`, `docs/RISKS.md`, `docs/sessions/`, or `docs/reference/` if you don't need them yet — add them back when their absence starts to hurt.
6. Start a new AI session by pointing it at `CLAUDE.md`. That's the bootstrap.

Keep `PROJECT_OS.md` (this file) and `ROLLOVER_SOP.md` in every project. They are the framework reference — short enough that they don't cost you anything to carry around.

---

## 1. Philosophy

Seven lessons drive every design choice in this system:

1. **Conversational memory is fragile.** Anything that matters must live in a file.
2. **Documents are canonical, sessions are disposable.** A session is a 30-minute-to-3-hour edit window on the docs.
3. **Bootstrap should cost almost nothing.** A new session/clone should be productive within ~2,000 tokens.
4. **Handovers shrink over time.** A good handover today is shorter than a good handover six months ago, because the docs absorb the durable knowledge.
5. **Architecture persists outside chat.** No design decision is "real" until it is an ADR.
6. **Single source of truth per fact.** Cross-reference, never duplicate.
7. **Human-readable first, AI-readable as a happy consequence.** Markdown, tables, short headings, predictable layout.

---

## 2. Directory Structure

```
<project-root>/
├── CLAUDE.md                       # AI bootstrap entry point (≤200 lines)
├── PROJECT_OS.md                   # This framework reference
├── ROLLOVER_SOP.md                 # One-page rollover procedure
├── README.md                       # (Optional) human-facing project intro
├── docs/
│   ├── STATUS.md                   # Current state (the "where are we" page)
│   ├── HANDOVER.md                 # Latest session handover (REPLACED each session)
│   ├── OPEN_QUESTIONS.md           # Unresolved decisions
│   ├── RISKS.md                    # Risk register
│   ├── ROADMAP.md                  # Forward plan
│   ├── decisions/                  # ADRs — one file per decision
│   │   ├── 0000-ADR-template.md    # Copy this when writing a new ADR
│   │   └── 0001-*.md               # Real ADRs go here
│   ├── sessions/                   # Session logs (archive — not read on bootstrap)
│   │   └── _SESSION_TEMPLATE.md
│   └── reference/                  # Stable reference (glossary, runbook, schema)
└── src/                            # Implementation
```

---

## 3. Documentation Hierarchy

Documents are sorted into three tiers by **how often they are read** and **how often they change**.

**Tier 1 — Hot. Read every session, updated almost every session.**
- `CLAUDE.md` (changes rarely after week 1)
- `docs/STATUS.md` (changes every session)
- `docs/HANDOVER.md` (replaced every session)

**Tier 2 — Warm. Read on demand, updated when something happens.**
- `docs/OPEN_QUESTIONS.md`
- `docs/RISKS.md`
- `docs/ROADMAP.md`

**Tier 3 — Cold. Written once, read when relevant.**
- ADRs (`docs/decisions/*.md`)
- Session logs (`docs/sessions/*.md`)
- Reference material (`docs/reference/*.md`)

The bootstrap order respects this: Tier 1 always, Tier 2 only when the task touches it, Tier 3 only when explicitly referenced.

---

## 4. Bootstrap Process

When a new session starts (human + AI), the AI reads in this order:

1. `CLAUDE.md` — identity, conventions, where things live
2. `docs/STATUS.md` — current phase, what's in-progress, what's blocked
3. `docs/HANDOVER.md` — the in-flight context from the last session

That is the **minimum viable bootstrap**, usually 1,000–2,500 tokens. After this the AI is oriented enough to do useful work.

Further reading is **lazy and task-driven**:
- Touching architecture? Read the relevant ADRs.
- Resolving a question? Read `OPEN_QUESTIONS.md`.
- Doing risk-affecting work? Read `RISKS.md`.
- Planning multi-week work? Read `ROADMAP.md`.

Session logs are **never** read on bootstrap. They exist as an audit trail for humans, not as memory for AI.

---

## 5. Session Lifecycle

```
┌──────────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  BOOTSTRAP   │ -> │   WORK   │ -> │ HANDOVER │ -> │  CLOSE   │
└──────────────┘    └──────────┘    └──────────┘    └──────────┘
   ~2k tokens         varies          ~500 tokens    disposable
```

**Bootstrap** — Read Tier 1. State the goal of the session in one sentence. Confirm understanding.

**Work** — Do the thing. Light-touch updates to `STATUS.md` as facts change. Don't try to keep `STATUS.md` perfect mid-flight; that's a close-out job.

**Handover** — Before the session ends (or rolls):
1. Replace `HANDOVER.md` with a fresh, small note (TL;DR + 5 bullets + next action).
2. Bump `STATUS.md`'s "Last updated" and refresh the In-Progress / Blocked / Up Next sections.
3. Log any new ADRs to `docs/decisions/`.
4. Update `OPEN_QUESTIONS.md` / `RISKS.md` if anything changed there.
5. Optionally write a session log to `docs/sessions/` (recommended for substantive sessions).

**Close** — Commit the docs. The session is now disposable. The next session will rebuild context from files alone.

---

## 6. Handover Process

The handover is the single highest-leverage artifact in the system. Rules:

- **`HANDOVER.md` is REPLACED, never appended.** Old context dies; durable state has already been promoted to STATUS / ADRs / OPEN_QUESTIONS.
- **Aim for ≤500 tokens.** A handover longer than that means context didn't get promoted.
- **Lead with TL;DR.** First three sentences must be enough to start work.
- **End with one concrete next action.** Not "continue feature X" — "run `pytest tests/billing/` and fix the assertion at line 47 of `test_invoice.py`."

A good handover is small because the surrounding documents are doing their job. Over the life of a project, handovers should trend smaller, not larger.

---

## 7. ADR Workflow

Architecture Decision Records capture **why** a decision was made, in a form that survives the people who made it.

- One file per decision, sequentially numbered: `docs/decisions/0001-<short-slug>.md`.
- Copy `docs/decisions/0000-ADR-template.md` to start a new ADR.
- Status lifecycle: `Proposed → Accepted → (Superseded | Deprecated)`. Never delete an ADR — supersede it.
- An ADR is created when:
  - A choice has trade-offs and future contributors will ask "why did you do it that way?"
  - A question in `OPEN_QUESTIONS.md` is closed in an architecturally-significant way.
- An ADR is **not** needed for: routine implementation details, reversible style choices, bug fixes.

Cross-reference: `OPEN_QUESTIONS.md` rows that became ADRs should link the ADR in their "Promoted to" column.

---

## 8. Risk Management

`RISKS.md` is a living register. Each risk has an ID, a one-line description, Likelihood (L/M/H), Impact (L/M/H), a mitigation, an owner, and a status.

- **New risks** are added the moment they're spotted, by whoever spots them. No approval gate.
- **Review cadence:** start of every work week, or at the start of a session if the work touches the risky area.
- **Retired risks** move to the "Retired" section. They are not deleted — the audit trail matters.

The "Top 3 active risks" should be linked from `STATUS.md`.

---

## 9. Open-Question Management

`OPEN_QUESTIONS.md` is the queue of unresolved decisions.

- One row per question. Columns: ID, Question, Context (one line), Options, Owner, Due.
- Closed questions move to the "Closed" section with a Resolution and (if applicable) a link to the ADR they became.
- A question hanging in the open table for more than two weeks is a flag — either it doesn't actually matter (close it) or it's blocking work (escalate).

---

## 10. When to Start a New Session

Start a new session when **any** of these are true:

- Token usage is approaching the model's context limit (rule of thumb: roll at ~70% to leave room for the rollover write).
- The topic of work has shifted meaningfully (e.g. you were doing architecture, you're now doing implementation).
- A natural day/week boundary.
- The current session has become circular, confused, or repeatedly re-deriving context — that's a signal the context window has gone stale.
- You're switching between projects (always a new session, never share context).

---

## 11. When to Preserve Continuity (Don't Roll Yet)

Hold off rolling if:

- You are mid-edit on a single file with uncommitted changes that are hard to describe in a handover.
- You are debugging something where the AI's working hypothesis matters more than the artifact it produced.
- You are within ~10 minutes of a natural stopping point.

In these cases, **finish the micro-step first**, then write the handover, then roll. Don't roll mid-thought.

---

## 12. Low-Token Handover Procedure

When the context is running low, the handover write itself costs tokens. Optimise:

1. **Stop new work.** Even a one-line "okay I'll stop here" before the handover write.
2. **Write `HANDOVER.md` first**, while the context is still fresh. This is the most important file.
3. **Update `STATUS.md` second.** Just the lines that changed — In Progress, Blocked, Up Next.
4. **Log ADRs / questions / risks third**, but only the deltas.
5. **Skip the session log** if tokens are really tight — it's recoverable from git history; the handover is not.

Total budget for a clean rollover: ~1,500 tokens of output. Keep that in your head as you sense the context filling.

---

## 13. Clone Bootstrap

When a fresh clone (new chat, new agent, different model) starts:

1. Point it at `CLAUDE.md`. That is the **only** thing it needs as input.
2. `CLAUDE.md` instructs it to read `STATUS.md` and `HANDOVER.md` next.
3. By the end of those three reads, the clone is oriented.

A well-designed `CLAUDE.md` makes the model agnostic. Claude Opus, Claude Sonnet, GPT, and a human reading the docs cold should all arrive at the same understanding.

Anti-pattern: **never** ask a clone to read prior chat history or session logs to "catch up." If the file system can't catch it up, the docs are broken — fix the docs.

---

## 14. Minimal Viable Document Sets

Different project sizes need different doc footprints. Don't over-instrument a small project.

**Tiny (≤1 week of work):**
- `CLAUDE.md`
- `docs/STATUS.md`
- `docs/HANDOVER.md`

That's it. Three files.

**Small-to-medium (weeks to a few months):**
- Above plus `OPEN_QUESTIONS.md`, `ROADMAP.md`, and `docs/decisions/` once you've made your first 2–3 architectural choices.

**Large / long-running:**
- All of the above plus `RISKS.md`, `docs/sessions/` archive, and `docs/reference/`.
- Consider per-workstream `STATUS-<stream>.md` files if you have parallel teams.

Start small. Add documents when the *absence* of one causes a real problem, not pre-emptively.

---

## 15. Scaling Patterns

As a project grows, the operating system bends without breaking:

- **Multiple workstreams** → split `STATUS.md` into `STATUS-<stream>.md` and keep a tiny top-level `STATUS.md` that links to them.
- **Multiple sub-projects in a monorepo** → each sub-project gets its own `CLAUDE.md` and `docs/` folder. Top-level `CLAUDE.md` becomes a router.
- **Long session history** → archive sessions older than 60 days to `docs/sessions/archive/`. They stay searchable but out of the way.
- **Stable patterns recur** → promote them from session notes / ADRs to `docs/reference/` (e.g. `docs/reference/runbook.md`, `docs/reference/glossary.md`).
- **Cross-project knowledge** → don't put it in any one project. Lift it out to a personal/team knowledge base and reference it from `CLAUDE.md`.

---

## 16. Anti-Patterns to Avoid

- **Appending to `HANDOVER.md`.** It must be replaced. An ever-growing handover defeats the point.
- **Bootstrapping from chat logs.** If your AI can't get oriented from the docs alone, your docs are wrong.
- **Decisions that exist only in chat.** Every decision worth remembering becomes an ADR or a STATUS line.
- **Long-lived TODOs in `CLAUDE.md`.** It's an orientation doc. Put TODOs in `STATUS.md` / `ROADMAP.md`.
- **Multiple sources of truth.** If a fact lives in two files, one of them is already wrong.
- **"Memory dump" handovers.** A handover is a curated set of pointers, not a transcript.
- **Re-reading reference docs every session.** Trust the bootstrap. Read on demand.
- **ADR for every commit.** ADRs are for choices with consequences. Don't dilute the signal.
- **Session logs as the source of truth.** They're an audit trail, not state.

---

## 17. Preventing Documentation Drift

The biggest long-term risk in any doc-driven system is drift — docs that no longer reflect reality.

Mitigations baked into this system:

1. **End-of-session checklist.** Every session ends with the same five checkboxes. Drift is caught when the operator can't honestly tick them.
2. **`STATUS.md` is dated on every update.** A `STATUS.md` more than a week old is a red flag.
3. **One source of truth per fact.** No duplication means no inconsistency.
4. **Promotion, not duplication.** Closed questions are *moved* to the Closed section, not copied. ADRs *replace* the corresponding question row.
5. **Periodic audit (monthly):** open every Tier 1 and Tier 2 doc, ask "is this true?", and edit ruthlessly. Budget 30 minutes.
6. **Refactor the docs when they hurt.** If `STATUS.md` has become a wall of text, that's a signal — break out a `ROADMAP.md` or split by workstream.

---

## 18. Recommended Operating Workflow

A canonical week in the life of a Project-OS-managed project:

**Monday — start of week**
- Read STATUS.md, scan RISKS.md, scan OPEN_QUESTIONS.md.
- Set 2–3 outcomes for the week. Write them into `STATUS.md` "Up Next."

**Tuesday–Thursday — execution sessions**
- Each session: bootstrap (Tier 1) → work → handover → close.
- Open new ADRs as architectural decisions arise. Close OPEN_QUESTIONS as they resolve.

**Friday — close-out**
- 30-minute audit: are STATUS / HANDOVER / OPEN_QUESTIONS / RISKS all current?
- Archive any session logs older than 60 days.
- Update `ROADMAP.md` if the week's outcomes shifted what's coming.

This rhythm is optional, not required. The lifecycle works at any cadence.
