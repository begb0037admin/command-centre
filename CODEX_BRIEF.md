# Codex brief — command-centre round 2b (review fixes, small)

Branch `drew/cc-order-and-icons-24sep` (HEAD `311e3c5`). Same rules as round 2 (only `js/app.js`,
`tests/tier_order_test.js`, `HANDOVER.md`; no push/deploy; don't touch/print `data/`, `Archive/`,
`js/vendor/`; commit locally; short final message).

1. **Stale rank on non-drag tier moves.** `moveTaskToTier()` (Move buttons, drawer moves) changes
   `tier` but leaves the card's old `tierRank` from the previous tier, so the card lands at that
   rank in the new tier instead of slotting in by source date. On a non-drag tier change, delete
   `tierRank` (remember the old value; Undo restores both `tier` and `tierRank`). Same for any other
   non-drag path that changes an existing task's tier.
2. **No-op drops must not write.** In the Sortable `onEnd`, if `evt.from === evt.to` and
   `evt.oldIndex === evt.newIndex`, just clear the drag state and re-render — no rank write, no save,
   no toast.
3. Add a test in `tests/tier_order_test.js`: a card with a stale high rank removed (`tierRank`
   deleted) slots by date among ranked cards. Run `node --check js/app.js`,
   `node tests/staleness_parity_test.js`, `node tests/tier_order_test.js`.
