# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Deployment

The site is deployed on **Vercel** (project: `nakatomi`). There is no build step — HTML files are served statically and `api/` functions run as Vercel serverless functions. Push to `main` triggers automatic deployment.

To run locally with serverless functions:
```
npx vercel dev
```

## Architecture

**Static HTML site** — no framework, no bundler. Each page is a self-contained `.html` file with all CSS inlined in `<style>` tags and JavaScript at the bottom in `<script>` tags.

**Serverless API** (`api/` directory) — Vercel Edge/Node functions that proxy external APIs to keep secrets server-side:
- `api/valuta.js` — proxies [frankfurter.app](https://frankfurter.app) for live exchange rates
- `api/strava-token.js` — exchanges Strava OAuth code for tokens
- `api/strava-refresh.js` — refreshes Strava access tokens

Secrets (`STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`) are set as Vercel environment variables, never in code.

## Design system

All pages share a consistent visual language — replicate it exactly when adding pages:

- **Background:** `#0a0a0a` body, `#141414` cards
- **Borders:** `#222` default, `#e63946` (red) on hover/active
- **Accent color:** `#e63946` (red) for interactive elements and logo highlights
- **Font:** `'Segoe UI', system-ui, sans-serif`
- **Language:** Norwegian (`lang="no"`)

**Page structure** (every subpage except `index.html`):
```html
<body>  <!-- padding: 2rem 1.5rem 4rem -->
  <header>  <!-- display:flex; align-items:center; gap:1rem; margin-bottom:2.5rem -->
    <a class="back" href="/">← Nakatomi</a>
    <h1>Page<span>Title</span></h1>  <!-- span gets color:#e63946 -->
  </header>
  ...content...
</header>
```

`index.html` uses its own centered layout with logo + cards grid — do not apply the header pattern there.
