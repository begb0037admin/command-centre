# Codex brief — command-centre: chevron into a 3rd grid row (Kevin, 24 Sep, small)

Branch `drew/cc-grid-row3` off main. Only touch `js/app.js`, `css/styles.css`, `HANDOVER.md`.
Don't read/print `data/`, `Archive/`, `js/vendor/`, `cloudflare-worker/`. Commit locally; no push.

Kevin wants the same 3-row action grid on every board. Today `cardHTML()` renders the chevron on
its own left of `.card-action-grid` (2x2). Change to ONE grid, two 26px columns, same gap, three
rows:
- Row 1: Archive | Delete (Restore on done cards)
- Row 2: Email | Edit (empty-slot placeholder when no email)
- Row 3: › chevron | empty placeholder (reserved for a future Tracker jump-link icon)
Keep sizes, aria attributes and behaviour. Title/meta keep the full remaining width. Keep the
<600px rule working (grid under the title row, right-aligned). `node --check js/app.js`;
`node tests/tier_order_test.js`; `node tests/staleness_parity_test.js`. Top-of-HANDOVER line.
