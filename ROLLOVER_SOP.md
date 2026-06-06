# Rollover SOP

> One page. Keep this in front of you when the context window starts to fill.

## When to roll
- Context > ~70% full
- Topic has shifted meaningfully
- Natural day/week boundary
- Session is becoming circular or confused

## When NOT to roll (yet)
- Mid-edit with uncommitted in-flight changes
- Debugging where the working hypothesis matters
- < 10 minutes from a natural stopping point
→ Finish the micro-step, *then* roll.

---

## The Rollover Procedure (5 steps, ~1500 tokens of writes)

**1. STOP.** Acknowledge: "okay, rolling now." No new investigation.

**2. WRITE `HANDOVER.md` FIRST.** Replace the file (do not append). Format:
```
# HANDOVER — YYYY-MM-DD

## TL;DR
[1–3 sentences. Could a stranger start work from this?]

## State of Play
- (≤5 bullets)

## Next Concrete Action
[One specific sentence. File + line if possible.]

## Watch Out For
- [Traps, half-finished things]
```

**3. UPDATE `STATUS.md`.** Only the lines that changed:
- Bump "Last updated"
- Refresh In Progress / Blocked / Up Next
- Update Top-3 risks / questions if they shifted

**4. LOG DELTAS.** If anything changed since bootstrap:
- New ADR? → write it in `docs/decisions/`
- New / closed question? → edit `OPEN_QUESTIONS.md`
- New / retired risk? → edit `RISKS.md`

**5. (OPTIONAL) SESSION LOG.** If tokens allow, drop a short log in `docs/sessions/YYYY-MM-DD-<label>.md`. If tokens are tight, skip — it's recoverable from git.

**Commit.** `git add docs/ && git commit -m "session rollover YYYY-MM-DD"`.

---

## Clone Bootstrap (next session)
1. Read `CLAUDE.md`
2. Read `docs/STATUS.md`
3. Read `docs/HANDOVER.md`
4. State the session goal. Begin work.

That's it.

---

## Hard Rules
- HANDOVER is REPLACED, never appended.
- No catch-up reading of chat logs or session archives.
- Decisions worth keeping become ADRs before the session ends.
- One fact, one place.
