# BRANDING.md - Lelitte HR Systems Dashboard Branding Standard
> Canonical branding reference for University of Oxford HR Systems dashboards.
> v2.0 - 4 July 2026

## Purpose

Every AI session working in any dashboard repo must read this document before making a visual change. Deviations require explicit Kevin approval.

Applies to: `command-centre`, `work-inbox`, `hris-launcher`, `hris-dashboard`, `hr-fa-knowledge-base`, `AG-FlexPoints`.

## Decision

The Oxford crest is a normal image file in every dashboard repo:

```html
<img class="sidebar-crest" src="images/oxford-crest.jpg" alt="University of Oxford crest">
```

Base64-embedded crest data is retired. Do not add it back.

## Design Tokens

| Token | Value |
|---|---|
| Oxford Navy | `#002147` |
| Main background | `#f5f7fb` |
| Card background | `#ffffff` |
| Font | `Inter (Google Fonts)` |
| Sidebar width | `340px` |

## Sidebar Brand Block

```html
<div class="sidebar-logo">
  <img class="sidebar-crest" src="images/oxford-crest.jpg" alt="University of Oxford crest">
  <div class="sidebar-brand-text">
    <span class="sb-univ-of">University of</span>
    <span class="sb-oxford">Oxford</span>
    <span class="sb-app-name">[APP NAME]</span>
  </div>
</div>
```

## Required CSS Values

```css
--sidebar-width: 340px;

.sidebar-logo {
  padding: 20px 20px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.sidebar-crest {
  width: 80px;
  height: 80px;
  object-fit: contain;
  flex-shrink: 0;
}

.sidebar-brand-text {
  display: inline-flex;
  flex-direction: column;
}

.sb-univ-of {
  font-size: 9.5px;
  font-weight: 400;
  letter-spacing: 0.30em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.70);
  line-height: 1.5;
  white-space: nowrap;
}

.sb-oxford {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #ffffff;
  line-height: 1.1;
  white-space: nowrap;
}

.sb-app-name {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #ffffff;
  margin-top: 4px;
  line-height: 1.4;
}

.date-block {
  padding: 12px 22px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.sb-section {
  padding: 14px 22px 6px;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 0.09em;
}
```

## Hard Rules

1. Never embed the Oxford crest as base64.
2. Never delete, move, rename, or replace `images/oxford-crest.jpg` without Kevin approval.
3. Never change `.sidebar-crest` to a rounded or circular image.
4. Never reduce the crest display size below `80px x 80px`.
5. Use the canonical class names in this file for the brand block.
6. Any visual change requires a screenshot/artifact and Kevin approval before pushing to `main`.
