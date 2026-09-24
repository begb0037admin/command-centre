# Codex brief — command-centre round 2 on this branch: jump links unfold folded tiers; no openmail

Branch `drew/cc-toggle-style` (HEAD `49fe04a`, keep that work). Work only in
C:/Users/admin/github/command-centre. Only touch `js/app.js`, `css/styles.css`, `HANDOVER.md`.
Don't read/print `data/`, `Archive/`, `js/vendor/`, `cloudflare-worker/`. Commit locally; no push.

1. **Top panels "don't do anything" (Kevin).** `goToCard(id)` scrolls to `#card-<id>`, but when
   the card's tier section is folded the card is hidden, so nothing happens. Fix: find the task's
   tier from `tasks` (not the DOM), and if that tier is folded, unfold it first through the same
   code path as the section toggle (so the "Collapse ▾"/"Expand ▸" label, aria-expanded and the
   remembered state update), then scroll into view, highlight and open the drawer. If the task is
   done and "Show done" is off, turn Show done on first. Same for the `#<taskId>` hash deep link on
   page load (~line 1081) — it must work when the tier is folded. Watch/Act now/Waiting on items:
   `cursor:pointer` and hover underline.
2. **No Outlook Classic.** `openTaskEmail()` (~859) uses `openmail://` for the inbox-suggestion
   "Open email" button. Remove it; that button must use the existing OWA opener (`_owaWebUrl` /
   `openEmailWeb`) with the suggestion's `web_link` if present, else render disabled with tooltip
   "Email link not available". `grep openmail js/app.js` → comments only.
`node --check js/app.js`; both tests. One HANDOVER line.
