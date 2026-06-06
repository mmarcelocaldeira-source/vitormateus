# Design System — Vitor Mateus
**Inspired by Studio Ahremark** (https://www.studioahremark.com/)

Source extracted from `wp-content/themes/studio-ahremark/dist/css/style.css?ver=23d` (1MB).

---

## Files

| File | Purpose |
|------|---------|
| `Designsystem.html` | Live, interactive style guide. Open in browser to preview tokens, type, components. |
| `tokens.css` | Pure design tokens (CSS custom properties). Drop into project to inherit system. |
| `patterns.md` | Component patterns + scroll choreography (sticky footer trick, next-case reveal). |

---

## Source mapping (Ahremark → Vitor)

| Ahremark token | Value | Our equivalent |
|----------------|-------|----------------|
| `--font-heading` | `'Plain'` Thin 300 (Optimo, paid) | `'Plus Jakarta Sans'` 300 (Google) — variable 200-800 + italic |
| `--font-body` | `'Plain'` Light 400 | `'Plus Jakarta Sans'` 400 |
| `--font-size-huge` | `4.25rem` desktop | `clamp(56px, 8.5vw, 140px)` |
| `--color-background` | `#f6f6f6` (gray-1) | `#f4f1eb` (paper) |
| `--color-text` | `#000` | `#11110f` (ink) |
| `--transition` | `0.4s cubic-bezier(0.36, 0.64, 0.23, 0.94)` | same |
| `--row-height` | `1rem` (baseline) | `1rem` |
| `--gap-section` | `var(--row-4)` (4rem) | `var(--row-4)` |

## Key insights

1. **Baseline grid** — All vertical rhythm = `1rem` rows. Sections snap to `--row-{1..20}`.
2. **Sticky footer reveal** — `.l-site-footer` is `position: sticky; bottom: 0; z-index: 0`. Main content scrolls *over* it. Footer slowly emerges as you reach end of page. Hovering it intensifies media opacity from 0.7 → 1.
3. **Next-case** — Lives inside footer. Title with `padding-bottom: 50vh` makes it stretch. Image behind reveals on scroll. Click navigates.
4. **Lightweight typography** — All headings `font-weight: 300`. Body 400. No bold.
5. **`b-*` blocks vs `c-*` components** — Blocks are large composition (image-full, case-description). Components are reusable (button, list, social).
