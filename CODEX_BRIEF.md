# Codex brief — command-centre: only the last jumped-to card is highlighted (Kevin bug, small)

Branch `drew/cc-single-highlight` off main. Work only in C:/Users/admin/github/command-centre.
Only touch `js/app.js`, `HANDOVER.md`. Don't read/print `data/`, `Archive/`, `js/vendor/`,
`cloudflare-worker/`. Commit locally; no push.

Bug: every top-panel click (Watch / Act now / Waiting on) calls `goToCard(id)` (~line 948), which
adds `deep-linked-<tier>` and opens the drawer, but never clears previous jumps — so several cards
stay red-bordered and open.
Fix in `goToCard`:
- Before highlighting the target, remove `deep-linked-today/-tomorrow/-week/-parked` from EVERY
  `.task-card`.
- Track drawers opened BY a jump (module-level `var jumpOpenedDrawers=[]`): when goToCard opens a
  drawer that was closed, record its id. On the next goToCard, close the recorded drawers (only if
  still open, and not the new target) via the existing `toggleDrawer` path so expanded-state
  storage stays consistent, then reset the list. Drawers Kevin opened himself with › are never
  closed (they're not in the list; if Kevin toggles a recorded drawer himself, drop it from the
  list in toggleDrawer).
- Fade: remove the deep-linked class ~4 s after it's added (clear any previous timer).
- Same for the `#<taskId>` hash deep link on load (it goes through goToCard or equivalent).
`node --check js/app.js`; both tests. One HANDOVER line.
