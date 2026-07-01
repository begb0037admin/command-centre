# Daily Focus / Cross-Dashboard Sidebar Redesign — Approved Spec

**Status:** Mockups approved by Kevin (via Hope, failover session) 2026-07-01. **Not yet implemented.** This doc is the single source of truth for the implementation phase — do not re-derive from chat history.
**Repos affected:** `command-centre` (this repo) and `work-inbox`.
**Mockup artefacts (approved, final):** `docs/mockups/cc-full-v5.html` (this repo), `work-inbox/docs/mockups/wi-full-v5.html`.
**Origin:** A prior session (Kevin) designed this with Claude and hit a token limit before committing anything — nothing existed in either repo's history before this doc. Rebuilt from a pasted chat transcript, then corrected against live code, then iterated to final approval with Hope (Kevin unavailable — failover per AGENT_MODEL.md Section 6).

---

## 1. What this is

Both dashboards move to one shared "house style" sidebar template — byte-identical structure and CSS on both apps. The only thing that differs between the two sidebars is the data fed into it. Main-area content (task board on CC, inbox briefing on WI) is unchanged from each app's own approved mockup and is a separate, larger piece of work (see Section 5).

## 2. Sidebar structure (identical order, both apps)

1. Crest + "University of Oxford" + app name (Command Centre / Work Inbox)
2. User block — `kevin.lelitte@admin.ox.ac.uk`
3. Live clock + date
4. "All tiers" filter dropdown (`<select>`) — Today / Tomorrow / This week / Parked / All tiers
5. **Daily Focus ticker** — see Section 3 (this is the cross-dashboard part)
6. **Absences** — own section, see Section 4
7. **From your inbox** — badge widget, see Section 4
8. Links

## 3. Daily Focus ticker — the cross-dashboard swap

**This is the core of the feature: each dashboard's Daily Focus widget shows the *other* dashboard's data, not its own.**

- **Command Centre's Daily Focus widget shows Work Inbox data.**
- **Work Inbox's Daily Focus widget shows Command Centre data.**

### Top row — 4 stats, same on both (Today / Tomorrow / This week / Parked, red/gold/green/grey)

| Widget | Source | Field mapping |
|---|---|---|
| CC sidebar (shows WI data) | `work-inbox/data/briefing.json` | Today = `prioritiesToday.length`, Tomorrow = `prioritiesTomorrow.length`, This week = `prioritiesWeek.length`, Parked = `fyi.length` |
| WI sidebar (shows CC data) | `command-centre/data/tasks.json` | Count of tasks per `tier` field: today/tomorrow/week/parked |

### Sub-metric rows below the divider — **different per widget, this is deliberate, not an oversight**

**WI sidebar (shows CC data) — 4 rows, reuses CC's existing stalled-task logic verbatim:**
- Source: already implemented and live today at `command-centre/js/app.js:157-178` (`renderStaleBanner`) — tasks where `tier==='today'`, not done, `dateAdded` more than 3 days old.
- Rows: "Stalled in Today" (count) / "Oldest" (days) / "Avg age" (days) / "2+ weeks" (count of items ≥14 days old)
- No new logic needed — this calculation exists; just needs to also render into the WI sidebar.

**CC sidebar (shows WI data) — 3 rows** (fewer, because "stalled" doesn't map cleanly onto inbox items — this was an explicit decision, not left over from indecision):
- "Last refreshed" — from `briefing.json`'s `refreshed_at`, reformatted to **`Weds 1 July 12:00`** style (short weekday, day, month, 24h time — no comma, no year). Do not use the raw `refreshed_at` string format as-is.
- "Urgent" — `urgent.length` from briefing.json, displayed as **"N emails"** (e.g. "5 emails"), red.
- "Needs action" — `needs.length` from briefing.json, displayed as **"N emails"** (e.g. "6 emails"), gold.

## 4. Absences and From-your-inbox widgets

- **Absences** — own section, not merged into any ticker. Header "Absences" + either a bulleted list (`.abs-list`, gold/yellow `#eab308` text, bullet `•` in `rgba(255,255,255,.4)`) or, when empty, italic muted "None recorded" (`.abs-none`).
  - Source: `work-inbox/data/briefing.json`'s `absences` array — plain strings, name + return date already combined by the triage pipeline (e.g. `"James Salas Guillen - returns Thursday 5 June"`). No parsing needed, render each string as one `<li>`.
  - Shown identically on **both** sidebars (it's Work-Inbox-sourced data either way — CC doesn't have its own absence concept).
  - This widget already existed on Work Inbox before this redesign (`work-inbox/index.html` current `#absencesSidebar` / `work-inbox/js/app.js:445-447`) — it is being restored to its own section (it was nearly folded into the Daily Focus ticker during scoping, then explicitly un-folded back out — see decision log below) and additionally added to Command Centre's sidebar.
- **From your inbox** — badge widget ("3 new suggestions" style), sourced from `command-centre/data/inbox_suggestions.json` (same source, same count, both sidebars). Already exists on CC today as a nav link+badge (`command-centre/index.html:49-52`); needs adding to WI's sidebar as a new widget (WI has never had this before).

## 5. Main-area layout — separate, larger work, not covered by this doc's approval

The mockups (`cc-full-v5.html` / `wi-full-v5.html`) also carry a full main-area restyle inherited from the originally-uploaded `ccmockup_v4.html` / `wimockup_v.4.html`:
- **CC**: the existing 4-column kanban board (`tier-grid`) is replaced with a 3-panel "Intelligence" strip (Watch stale / Act now / Waiting on — this already exists live as `#stale-banner`, just needs restyling to the new `.intel-panel` markup) above a single-column, full-width stacked list of tier sections, using a new card style (drag handle `⠿`, circular done-checkbox, coloured badges) that replaces CC's current inline checkbox+strikethrough done-state.
- **WI**: gains a new 3-block calendar strip (Today / Tomorrow / mini month-calendar for current+next month) at the top of the main area — WI's calendar currently only exists in the sidebar, never as a main-area grid. Priority cards move to the same new card style as CC.

**This main-area work was confirmed in scope by the mockups being approved as full pages, but was not separately walked through decision-by-decision the way the sidebar was.** Flag to Kevin before starting this part specifically — it's a materially bigger, more structurally invasive change than the sidebar, and per CONSTITUTION.md Section 10 (Effort Level Governance) this is exactly the kind of multi-file, cross-system change that warrants signalling for a higher effort level before starting, not just proceeding at whatever level is currently set.

## 6. Bug fix carried in the approved mockup (not a design decision, just a fix)

`.intel-item` needs `padding: 6px 8px 6px 15px` (was `6px 8px`) for breathing room between the coloured left-border highlight and the text, on hover and on click-select. The four "Waiting on" items had a hardcoded inline `style="display:block; padding:5px 0"` that overrode this — inline padding overrides must be removed (just `style="display:block"`) so all three intel blocks (Watch/Act now/Waiting on) render identically. Verified by direct `getComputedStyle` measurement, not just visual comparison — all three now compute to 15px padding-left / 18px text offset from the block edge.

## 7. Explicitly deferred / not yet decided

- **Live data wiring** — every number in both mockups is a placeholder. No fetch code exists yet for CC to read `work-inbox/data/briefing.json`, or for WI to read the format described above. Real implementation must add these fetches (both files are already public GitHub JSON, cache-busted, same pattern as WI's existing `loadTasksWidget()` in `work-inbox/js/app.js:542-586`, which already fetches `command-centre/data/tasks.json` today — the CC→WI direction is new).
- **Real Oxford crest** — mockups use a placeholder circle + 🎓 emoji. Implementation must use the real embedded base64 JPEG crest already in both live `index.html` files.
- Whether the filter dropdown / Daily Focus click-to-select interaction (see mockup JS `applyFilter()` / `clickStat()`) needs any changes beyond what's in the mockup — not raised as an issue, assume as-is unless flagged.

## 8. Decision log (for anyone wondering why the doc reads this way)

- First attempt (this session) added a "Work Inbox Daily Focus" widget to CC *alongside* CC's existing stalled-stats widget and Tasks panel, guessing at additive placement. **Wrong** — Kevin corrected this hard; the whole thing needed to be built from what he actually shows in screenshots/files, not inferred from an incomplete pasted transcript.
- Second attempt merged Absences into the Daily Focus ticker's sub-metric rows as a 4th CC-side row. Kevin explicitly asked for it back out as its own separate widget, referencing the original `wimockup_v.4.html` — confirmed that file already had a standalone Absences section, restored verbatim.
- Absences widget position: originally placed above "From your inbox", moved to below it per Kevin's explicit instruction.
