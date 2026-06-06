# AGENT_MODEL.md

> Which seat does what, where the handoffs are, and who is allowed to
> write to disk. Read this when you need to know who should be doing
> what — not what the work is.

This file lives in every project root and in project-os-template/.
It changes rarely. Per-project state lives in STATUS.md and HANDOVER.md.

---

## 1. The Four Seats

### Seat A — Project Claude (Architecture, Reasoning, Routing)

- **Where it runs:** Claude.ai Project, in the project workspace.
- **What it owns:**
  - All reasoning, architecture, and trade-off analysis.
  - Drafting ADRs, updating OPEN_QUESTIONS.md, ROADMAP.md, RISKS.md.
  - Writing RUN SCRIPT commands for Kev to execute.
  - Writing COWORK BRIEFs for Kev to paste into Cowork.
  - Writing CHROME BRIEFs for Kev to paste into Chrome.
  - Every session starts here. No other seat opens without a
    dispatch command from this seat.
- **What it does not own:**
  - Does not write to disk.
  - Does not run terminal commands.
  - Does not open Cowork or Chrome directly — issues briefs for Kev
    to action.

---

### Seat B — Kev + VS Code Terminal (Script Execution)

- **Where it runs:** VS Code integrated terminal, on the project machine.
- **What it owns:**
  - Running 🔵 RUN SCRIPT commands issued by Seat A exactly as given.
  - Pasting results back to Seat A exactly as returned — no
    interpretation, no summarising.
  - Pasting 🟡 COWORK BRIEF blocks into Cowork exactly as written.
  - Pasting 🔴 CHROME BRIEF blocks into Chrome exactly as written.
- **What it does not own:**
  - Never interprets, rewrites, or summarises a brief before pasting.
  - Never makes file edits directly — all writes go through Seat C.
  - RUN SCRIPTs are always read-only. Any script that would modify
    disk is a mistake — push back to Seat A.

---

### Seat C — Cowork (Disk Writes, Git, Verification)

- **Where it runs:** Cowork, with file tools and bash shell pointed
  at the project folder.
- **What it owns:**
  - All file writes to the project on disk. This is the only seat
    with that authority.
  - Applying edits drafted by Seat A — code changes, doc updates,
    ADR files, STATUS.md, HANDOVER.md.
  - Running verification commands: node audit/verify.mjs, git status,
    git add, git commit.
  - Reporting results back exactly — output verbatim, no editorialising.
- **What it does not own:**
  - Does not invent architecture or make decisions. If something
    unexpected requires a decision, it stops and reports back.
  - Does not validate live UI behaviour — that is Seat D.
  - **Stop-and-report rule:** if anything unexpected is encountered
    mid-task — a file that doesn't match, a test that fails — Cowork
    stops immediately, reports the exact error back to Kev, and waits.
    It does not attempt to solve the problem itself.
- **Brief format rule:**
  - COWORK BRIEFs contain commands only. No prose lines mixed in.
    PowerShell executes every line — prose causes errors.

---

### Seat D — Chrome Claude (Browser Smoke-Test)

- **Where it runs:** Claude in Chrome extension, against the live
  prototype at localhost or a deployed URL.
- **What it owns:**
  - Driving the running prototype as a user would.
  - Smoke-testing newly-shipped behaviour end-to-end.
  - Reading DOM, console messages, network requests.
  - Reporting findings verbatim — what it sees, not what it expects.
- **What it does not own:**
  - No disk read or write.
  - No terminal, no git, no node.
  - No code edits — not even one-line fixes.
  - No project documentation — Chrome reads the live page only.
  - Cannot drop files onto the page itself — asks Kev to do it.
- **Brief format rule:**
  - CHROME BRIEFs are numbered checklists with specific expected
    outputs. No vague instructions. Chrome reports exactly what
    it sees against each numbered step.

---

## 2. Dispatch Language

Every time Seat A finishes reasoning it ends with one of these —
labelled, ready to act on, no ambiguity about who acts next.

| Signal | Who acts | Used for |
|---|---|---|
| 🔵 RUN SCRIPT | Kev + VS Code | Read-only terminal commands. Run exactly, paste output back. |
| 🟡 COWORK BRIEF | Cowork via Kev | Write to disk, git operations. Commands only, no prose. |
| 🔴 CHROME BRIEF | Chrome via Kev | Browser smoke-test. Numbered checklist, specific expected outputs. |

**Routing rules:**
- Seat A always goes first. No other seat opens without a dispatch
  command.
- One dispatch at a time. Wait for the result before issuing the next.
- If Cowork reports something unexpected, bring it back to Seat A
  before issuing any further briefs.

---

## 3. Handoff Triggers

| From | To | Trigger |
|---|---|---|
| Seat A | Seat B (RUN SCRIPT) | Need to read disk, run a test, check git state |
| Seat A | Seat B (COWORK BRIEF) | Edit is fully designed, exact change known |
| Seat A | Seat B (CHROME BRIEF) | Commit landed, behaviour needs browser verification |
| Seat C | Seat A (via Kev) | Unexpected finding mid-task |
| Seat D | Seat A (via Kev) | Defect needs a decision |
| Seat D | Seat C (via Seat A) | Defect has a mechanical fix |

---

## 4. Cold-Start Order

Every seat, every session, reads in this order:

1. `CLAUDE.md` — project identity, rules, what's in and out of scope
2. `STATUS.md` — current phase and next step
3. `HANDOVER.md` — what the last session did and what's next

That is the entire bootstrap. No fourth file unless HANDOVER.md
specifically directs it. No human recap required if the handover
was written correctly.

**Cowork cold-start exception:** Cowork receives HANDOVER.md only,
plus the COWORK BRIEF. It does not receive CLAUDE.md or STATUS.md —
those invite architectural reasoning Cowork should not be doing.

**Chrome cold-start exception:** Chrome receives the CHROME BRIEF
only. No project docs.

---

## 5. Rollover and End-of-Session Discipline

**Trigger:** roll at ~70% context. Don't wait for the cap.

**Before any session closes:**

1. Stop new work.
2. Replace HANDOVER.md — never append. Write: TL;DR, state of play,
   next concrete action, watch-outs.
3. Bump STATUS.md — only the lines that changed.
4. Promote in-flight decisions to ADRs.
5. Commit everything.

Chat history is disposable. The docs are the memory.
A HANDOVER.md that grows session over session means durable knowledge
isn't being promoted. Keep it small.

---

## 6. Disk-Write Authority

**Cowork is the only seat that writes files to disk.**

No exceptions. If Seat A or Seat D believes a file needs to change,
the output is a handoff to Seat C — not an edit attempt.

---

## 7. Quick Reference

| Seat | Surface | Reads | Writes | Terminal |
|---|---|---|---|---|
| A — Project Claude | Claude.ai Project | Uploaded docs | Nothing on disk | None |
| B — Kev + VS Code | VS Code terminal | Terminal output | Nothing directly | Runs scripts |
| C — Cowork | Cowork + bash | All docs + source | Everything | git, node, bash |
| D — Chrome | Chrome extension | Live page DOM only | Nothing on disk | None |

---

## Last updated

2026-05-18 — Four-seat model. Seat B (Kev + VS Code) added as
formal execution seat. Dispatch language formalised. ChatGPT
removed. Stop-and-report rule locked for Cowork.
