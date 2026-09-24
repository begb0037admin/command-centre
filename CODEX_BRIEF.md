# Codex brief — command-centre round 2: tracker-identical drag + persisted within-tier order + icon arrangement (Kevin, 24 Sep 2026)

Branch `drew/cc-order-and-icons-24sep` (checked out, off `main`). Kevin approved build + deploy.
You implement; Drew reviews, browser-tests, deploys. Same rules as last round: change only
`index.html`, `css/styles.css` (additive), `js/app.js`, `js/api.js`; never touch `data/`,
`Archive/`, `cloudflare-worker/`, `images/`; don't search/print `js/vendor/`, `data/`, `Archive/`;
no framework/build step; commit locally; no push/deploy; short final message.

## 1. Drag must behave EXACTLY like the tracker (Kevin: "when I drag the cards they don't move at all")
Cause: `js/app.js` ~line 742 creates Sortable with `sort:false`. Align every option with the
tracker (`C:\Users\admin\github\kevin-task-tracker\public\app.js`, `new Sortable(...)`):
`sort` true (default — remove `sort:false`), `animation:150`, `forceFallback:true`,
`fallbackOnBody:true`, `ghostClass:'sortable-ghost'`, `chosenClass:'sortable-chosen'`,
`dragClass:'sortable-fallback'` (rename the CSS rule accordingly), **no `handle`** (whole card
draggable, like the tracker), `filter:'button,input,textarea,.task-drawer,.drawer-chevron'`
(documented reason for the extras: the drawer holds inputs and the AI bar),
`preventOnFilter:false`, `delay:150`, `delayOnTouchOnly:true`. Cards must visibly move aside
during a within-tier drag and the drop must stay where the placeholder was.

## 2. Persisted manual order within a tier (supersedes Kevin's 1 Sep pure date-sort rule)
Rule (Kevin, 24 Sep): new cards take their place by source date; once Kevin drags a card within a
tier, that position is saved and stays put, even when new date-sorted cards arrive around it.
Simplest robust approach — implement exactly this:
- Each task may carry an integer `tierRank` (stored in tasks.json via the existing
  `persistTasks()` → cc-tasks-writer path; the Worker's merge keeps local task objects so the
  field survives; the pipeline appends actions and leaves unknown fields alone).
- Render order per tier (pure function `orderTier(tasks)` — make it unit-testable):
  1. Ranked tasks (finite `tierRank`) in ascending rank order form the backbone.
  2. Unranked tasks are sorted by the existing `cardSourceTs` (newest first), then each is inserted
     into the backbone just before the first ranked task whose `cardSourceTs` is OLDER than it
     (or at the end if none) — i.e. new cards slot in by date relative to their neighbours
     without moving any ranked card relative to another ranked card.
  3. With no ranked tasks the result equals today's `sortBySourceDate` (so nothing changes until
     Kevin drags).
- On any drop (within-tier or cross-tier): read the DOM order of every affected tier and write
  `tierRank = 1..n` on every card in those tiers (so the whole tier becomes explicitly ordered),
  set `tier` for a cross-tier move, re-render, save once via the serial queue. Undo restores the
  previous `tier` + `tierRank` values of all affected cards and saves.
- Keep the stale/focus/intel panels as they are (they don't depend on card order).
- Add `tests/tier_order_test.js` (Node, no deps, same style as `tests/staleness_parity_test.js`):
  extract `orderTier` (and the `cardSourceTs`/`sourceDateFromText` helpers it needs) from
  `js/app.js` by source and test: no ranks → pure date order; ranked backbone preserved; a new
  unranked newest card lands at the top; a new unranked card dated between two ranked cards lands
  between them; a dragged card keeps its position after a newer card arrives.

## 3. Card icon arrangement (Kevin's mock-up) — arrangement only
Do NOT change button size or spacing (keep the current 26px `.card-icon` buttons and current
gap). Only the arrangement changes: the expand chevron `›` sits on its own to the left of the
action group, with the current gap between; the actions form a **2×2 grid**: top row
**Archive, Delete**; bottom row **Email ✉, Edit ✎**. On a card with no email link keep the grid
shape by leaving the email slot empty (an invisible placeholder of the same size) so every card
aligns. On archived cards Restore takes Archive's slot. Card text must not be squeezed — the grid is
2 buttons wide instead of 4-5, so the text column gets wider; below 600px width move the chevron +
grid under the title row, right-aligned.

## 4. Checks + record
`node --check js/app.js js/api.js`; `node tests/staleness_parity_test.js`;
`node tests/tier_order_test.js`. Add a short section at the top of `HANDOVER.md` recording the new
ordering rule and that it **supersedes the 1 Sep pure source-date sort**, and update the comment
block above `sourceDateFromText`/`sortBySourceDate` in `js/app.js` that says the date sort
"supersedes manual intra-tier drag order" so it states the new rule instead.
