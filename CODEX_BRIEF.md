# Codex brief — command-centre: section toggle style identical to the tracker (small)

Branch `drew/cc-toggle-style` off main. Work only in C:/Users/admin/github/command-centre. Only
touch `index.html`, `js/app.js`, `css/styles.css`, `HANDOVER.md`. Read-only style reference:
`C:/Users/admin/github/kevin-task-tracker/public/style.css` (`.section-toggle-label`). Don't
read/print `data/`, `Archive/`, `js/vendor/`, `cloudflare-worker/`. Commit locally; no push.

The `.section-toggle-btn` label becomes the tracker's style: small muted text, "Collapse ▾" when
open, "Expand ▸" when folded, same font size/colour/weight as the tracker, no border/background.
Update wherever the label is set (index.html initial markup + `applyTierCollapse`). Keep all
behaviour/aria. Also confirm (and keep) that each tier's `#count-<tier>` equals the number of
rendered `.task-card`s in `#list-<tier>` after every render. `node --check js/app.js`; both tests.
One HANDOVER line.
