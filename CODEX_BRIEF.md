# Codex brief — command-centre: SortableJS drag, card actions, expand/collapse (Kevin, 24 Sep 2026)

Repo: this working tree, branch `drew/sortable-card-actions-24sep` (already checked out). Kevin
approved build + deploy. You implement; Drew reviews, browser-tests and deploys. **Do not push,
do not deploy, do not touch `data/`, `Archive/`, `cloudflare-worker/`, `images/` (never touch
`images/oxford-crest.jpg`).** Commit locally when done. Do not search or print `js/vendor/`.

Kevin's instruction: **no layout changes** — keep tiers, sections, columns, card look and styling
exactly as they are. Port ONLY these behaviours from `C:\Users\admin\github\kevin-task-tracker\public\app.js`
(read-only reference): SortableJS drag, card action icons, expand/collapse.

Files you may change: `index.html` (script tag + any dialog markup), `css/styles.css` (additive
rules only), `js/app.js`, `js/api.js`. Load order stays `styles.css` → `js/vendor/Sortable.min.js`
→ `api.js` → `app.js`. No framework, no build step, plain ES5-style JS like the existing code.
Keep every other feature working exactly as now (drawer contents, AI log bar, move buttons, rename,
quick add, filters, focus panel, stale banner, inbox suggestions, open-email).

## 1. Drag → SortableJS (`js/vendor/Sortable.min.js` is already vendored, v1.15.6)

- Replace the hand-rolled HTML5 task drag (`onCardDragStart/End`, `onCardDragOver/Leave`,
  `onCardDropOnCard`, `placeDraggedTaskFromDom`, `draggable="true"` and the `ondragover/ondrop`
  attributes on `.task-card`, the dragstart/dragend listeners added in `renderBoard()`) with one
  Sortable per `#list-<tier>`: shared `group: 'cc-tiers'`, `animation:150`, `forceFallback:true`,
  `fallbackOnBody:true`, `ghostClass`/`chosenClass`/`dragClass` styled like the tracker (placeholder
  = dashed faded gap; the fallback clone solid white, blue 2px border, shadow — reuse existing
  `.task-card.dragging` look), `handle` = the existing `.card-drag` grip AND the card row (use
  `filter` for buttons, inputs, `.task-drawer`, the chevron, with `preventOnFilter:false`), touch:
  `delay:150, delayOnTouchOnly:true`. Destroy old instances before re-creating on every render.
- **Within-tier order is not user-controlled here**: `renderBoard()` sorts each tier by source
  date (`sortBySourceDate`, Kevin's 1 Sep decision). Keep that sort unchanged and set
  `sort:false` on the lists so Sortable only offers moves ACROSS tiers (no misleading
  within-list placeholder). Empty tiers must still accept drops (min-height drop zone).
- On a cross-tier drop: set `task.tier`, re-render, save via the existing `persistTasks()` path
  (keep its merge/baseSha behaviour). Saves strictly serial (queue). Toast "Moved to <Tier>" with
  an **Undo** button (moves it back + saves). If the save fails: reload tasks from remote
  (`loadTasks()`), re-render, show a plain-English error toast ("Move not saved — the board has
  been reloaded. Please try again."). Never lose a move silently. Defer any board re-render
  requested while a drag is in progress until `onEnd` (the tracker has this pattern).
- Keep the **inbox-suggestion** drag working: `.sg-card` stays native HTML5 draggable with
  `sgDragStart/sgDragEnd`, and the tier containers `#tier-<tier>` keep their
  `ondragover/ondragleave/ondrop` for suggestion drops (`onDragOver/onDrop` can drop the task-drag
  branches). Keep the `+ Today/+ Tomorrow/+ This Week` buttons.

## 2. Card actions

- Remove the `.card-done` circle button from cards (the "dot" that makes a card vanish).
- `.card-actions` shows, in fixed positions on every card: [open-email icon, only when present —
  existing behaviour] then **Edit** (pencil — calls the existing `startRename`), **Archive**
  (box icon; on an archived/done card this becomes **Restore**, curved-arrow icon) and **Delete**
  (trash icon). Inline SVG icons, 26px `.card-icon` buttons, `aria-label`s, title tooltips.
- Archive = set `t.done=true` and save through `persistTasks()` (server-side via the existing
  cc-tasks-writer Worker, which also runs the existing done-sync — do not change that) → toast
  "Archived" + Undo (sets `done=false`, saves). Restore = `done=false`, save, toast.
- Delete = in-page confirm (a small `<dialog>` or inline confirm bar, text "Delete permanently?",
  buttons Cancel / Delete) — never `window.confirm()`. On confirm remove the task, save, toast
  "Deleted" + Undo (re-insert the same task object at its previous array index, save). Apply the
  same in-page confirm to the drawer's existing Delete button and to `deleteAction()` (log entry
  removal) — no native `confirm()` left in the file.
- Keep the existing "Show done (N)" / "Hide done" toggle as the archived view; archived cards
  shown there carry Restore + Delete.
- Extend `showSaveToast` in `js/api.js` (or add `showUndoToast`) to support an optional action
  button (label + callback), ~10 s timeout; later toasts replace earlier ones.

## 3. Expand / collapse (match the tracker)

- Every card with a description or at least one action gets a chevron `<button>` (▸/▾ or rotating
  SVG) in a fixed position (e.g. first item in `.card-actions`), `aria-expanded`, `aria-controls`
  = drawer id, `aria-label` "Expand"/"Collapse". It toggles the existing drawer (`toggleDrawer`).
  Clicking the card body keeps toggling it as today. Neither may start a drag, open rename, or fire
  within ~250 ms after a drag ends. Keyboard Enter/Space work and focus stays on the chevron.
- The drawer shows the full description with paragraph breaks (`.dv` is already `pre-wrap`; keep
  escaping via `escHtml`) and the action log as today.
- Remember expanded card ids in `localStorage` key `cc_expanded_v1` (JSON array); every
  localStorage read/write in the file you touch goes through try/catch helpers so blocked storage
  never breaks the page. `renderBoard()` must re-apply open drawers after every render.
- "Expand all / Collapse all" small text button inside each `.sec-head` (stopPropagation so it
  doesn't collapse the section); label reflects state.

## 4. Checks

- `node --check js/app.js js/api.js`.
- `node tests/staleness_parity_test.js` must still pass (it extracts functions from `js/app.js` by
  source — don't rename `lastActivityTs`/`staleDays`).
- Add a short section at the top of `HANDOVER.md` (what changed, checks run, exact next action =
  Drew's browser verification). Keep your final message short.
