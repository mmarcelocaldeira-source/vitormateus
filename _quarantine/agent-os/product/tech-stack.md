# Tech Stack

## Frontend

- Vanilla HTML5, CSS3, JavaScript (ES6+) — no framework, no build step
- CSS custom properties for design tokens (`design-system/tokens.css`)
- IIFE modules per page (`assets/category-page.js`, `assets/project-page.js`)

## Backend

N/A — fully static

## Data

- JSON files in `data/categories/` — one file per category
- Edited via Decap CMS (GitHub backend); changes auto-deploy via Vercel

## CMS

- **Decap CMS** — Git-backed headless CMS, admin at `/admin/`
- **Cloudflare Workers** — OAuth proxy for GitHub authentication (`admin/cloudflare-worker-oauth.js`)

## Hosting & Deployment

- **Vercel** — static hosting, auto-deploy on push to `main`
- Domain: `vitormateus.studio`
- No CI pipeline — Vercel handles deploy on every commit
