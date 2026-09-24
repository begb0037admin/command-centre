# Codex brief — command-centre: 3-column x 2-row action grid (Kevin's final mock-up, 24 Sep)

Branch `drew/cc-grid-row3` (HEAD `8716033`). Only touch `js/app.js`, `css/styles.css`,
`HANDOVER.md`. Don't read/print `data/`, `Archive/`, `js/vendor/`, `cloudflare-worker/`. Work in
C:/Users/admin/github/command-centre. Commit locally; no push.

SUPERSEDES the 3-row layout in `8716033`. The action grid is 3 columns x 2 rows, 26px cells,
same gap:
- Row 1: › chevron | Archive (Restore on done cards) | Delete
- Row 2: empty placeholder (reserved for a future Tracker jump-link icon) | Email (placeholder if
  none) | Edit
i.e. DOM order: chevron, archive, delete, placeholder, email, edit; `.card-action-grid`
`grid-template-columns:repeat(3,26px)`. Title/meta keep all remaining width. Keep the <600px rule.
Update the HANDOVER line. `node --check js/app.js`; both tests in `tests/`.
