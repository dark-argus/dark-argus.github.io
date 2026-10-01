# dark-argus

A fast, static, Markdown-driven blog for original security research and CTF / lab writeups.
Neo-brutalist chrome, calm reading surface, zero trackers.

> Named after Argus Panoptes, the hundred-eyed giant. The watcher never blinks.

- **Astro 7** static output, content collections with typed (Zod) frontmatter, MDX
- **Two themes**: `void` (dark, default) and `paper` (light), follows the OS on first visit, toggle in the nav
- **Posts**: sticky TOC with scroll-spy, reading time, Shiki highlighting with a custom palette theme, separate terminal styling (prompts aren't copied), copy buttons, callouts, heading anchors, click-to-zoom screenshots, CVE badges, disclosure timelines, prev/next
- **Indexes**: research / writeups grids with **CSS-only, combinable filters** (tag, platform, category, difficulty), tag pages
- **Search**: Pagefind full-text search in a dialog (`/` or `Ctrl/⌘+K`), with a `/search/` fallback page
- **Feeds & SEO**: RSS (all / research / writeups), sitemap, canonical URLs, Open Graph + Twitter cards, auto-generated OG images, `robots.txt`, `security.txt`
- **Hygiene**: no analytics, no cookies, no third-party requests, no inline scripts, strict `script-src 'self'` CSP
- **Checked**: `astro check` clean, axe-core 0 violations (both themes, with/without reduced motion), Lighthouse 95+ in every category on mobile and desktop

---

## Quick start

Requires **Node 22.12+**.

```sh
npm install
npm run dev        # http://localhost:4321 (search needs a build, see below)
npm run build      # astro check → astro build → pagefind index → ./dist
npm run preview    # serve ./dist locally, search included
```

`npm run build` fails on type errors or invalid frontmatter, which is intentional.

## Make it yours (one file)

Everything personal lives in **`site.config.ts`**. Search it for `TODO` and `[YOUR`:

| Field | What it's for |
| --- | --- |
| `url`, `base` | Production URL and base path (CI overrides both, see [Deploy](#deploy)) |
| `author.*` | Name, handle, bio, location, email |
| `socials` | Footer + About links (rendered with `rel="me noopener noreferrer"`) |
| `disclosure` | Contact, embargo days, `security.txt` expiry (bump it yearly) |
| `about` | `/about` intro, focus areas, "currently" line |
| `hero*`, `accentPhrase`, `tagline`, `ticker` | Homepage headline, handwritten phrase, subhead, ticker topics |

Homepage copy that isn't personal (the "Start here" doors, method steps, FAQ) is in `src/data/home.ts`.

**Content so far:** one writeup (`src/content/writeups/martiniad.md`); the `research/` collection is empty, so the Research index and its RSS feed will show nothing until you add a post there.

---

## Writing a post

Posts are Markdown (`.md`) or MDX (`.mdx`) files. The file name becomes the URL:
`src/content/research/my-finding.md` → `/research/my-finding/`.

### Research: `src/content/research/*.md`

```yaml
---
title: "Pre-auth SSRF in ExampleApp's PDF renderer"
date: 2026-10-01
updated: 2026-10-05            # optional
summary: 'One or two sentences for cards, RSS, search and meta descriptions (≤ 320 chars).'
tags: [web, ssrf]              # kebab-case
cve: [CVE-2026-12345]          # optional → linked NVD badges
cover: ./images/cover.png      # optional (then coverAlt is required)
coverAlt: 'What the cover shows'
disclosure:                    # optional → timeline block + TOC entry
  - date: 2026-07-01
    event: Reported to vendor
  - date: 2026-07-03
    event: Vendor acknowledged
  - date: 2026-09-20
    event: Fix released in 2.4.1
  - date: 2026-10-01
    event: Published
draft: false                   # true = visible in `npm run dev`, excluded from builds
---
```

### Writeups: `src/content/writeups/*.md`

```yaml
---
title: 'Lantern — HTB Hard'
date: 2026-10-02
summary: 'Short summary.'
platform: HTB                  # HTB, THM, or any CTF name ("DEF CON Quals 2026")
category: web                  # web | pwn | reverse | crypto | forensics | misc
difficulty: hard               # easy | medium | hard | insane
tags: [linux, ssti]
cve: []                        # optional
---
```

Invalid values (such as `difficulty: extreme` or a malformed CVE ID) fail the build with a readable error.

### Markdown features

````md
## Headings become the TOC (h2 + h3) and get # permalinks

```python title="exploit.py"      ← source code: language + optional title bar
print("hi")
```

```console                         ← terminal session: "$ " prompts styled, output dimmed,
$ nmap -sV 10.10.10.10             the Copy button copies commands only.
PORT   STATE SERVICE               Lines ending in "\" continue the command.
22/tcp open  ssh
```

```output                          ← plain program output (terminal frame, everything copied)
flag{...}
```

> [!NOTE]                          ← callouts: NOTE, TIP, WARNING, CAUTION, IMPORTANT
> Only test systems you're authorized to test.

![Alt text is required and is also the zoom caption](./images/shot.png "Optional visible caption")
````

- **Images**: put them next to the post (for example `src/content/writeups/images/`) and reference them relatively. Astro converts them to WebP, sets width and height (no layout shift) and lazy-loads them. Readers can click to zoom.
- **Tables** scroll horizontally on small screens and are keyboard-focusable.
- **External links** get `rel="noopener noreferrer"` automatically.
- **Diffs**: use ```` ```diff ````.
- **MDX**: rename to `.mdx` to import components into a post.

---

## Themes & design tokens

All colors, type, spacing, borders, shadows and motion settings live in **`src/styles/tokens.css`**.

- **Default theme**: `void`. First-visit logic is in `public/theme-init.js` (saved choice → OS preference → `void`).
- **Change the palette**: edit the raw `--c-*` values at the top of `tokens.css`. Every component reads the semantic roles (`--bg`, `--ink`, `--line`, `--accent`…), which each theme maps below.
- **Contrast rules the tokens encode**: lime/cyan/orange are never used as text on `paper` (they fail WCAG AA there), so they appear only as fills, borders and shadows with ink text on top. Ultraviolet (`#7C5CFF`) is ≈4.3:1 on both backgrounds, so it's used only for borders, dots, shadows and large text.
- **Inverted band** (`.invert`): always the opposite of the page theme.
- **Fonts** are self-hosted in `src/assets/fonts/` (Anton, Caveat, DM Sans, JetBrains Mono; all OFL, licenses included) and loaded through Astro's Fonts API with metric-matched fallbacks. The `.woff` copies in `src/assets/og/` are only for OG-image generation (Satori can't read woff2).
- **Code blocks** use the custom Shiki theme in `src/lib/markdown/argus-theme.ts` and stay dark in both themes.

## Motion & accessibility

Motion is limited to the ticker, sticker hover, the cursor-tracking eye and button presses. **`prefers-reduced-motion` disables all of it.** The ticker also has a pause button (WCAG 2.2.2). The FAQ, mobile menu, TOC and filters are native HTML (`<details>` and radio inputs), so they work with a keyboard and without JavaScript.

## JavaScript budget

No framework and no inline scripts. Everything is small external modules in `src/scripts/`:

| Script | Loaded on | Purpose |
| --- | --- | --- |
| `public/theme-init.js` | every page (blocking, ~500 B) | set theme before paint, add `html.js` |
| `theme.ts`, `eye-track.ts`, `search.ts` | every page | toggle, eye, search dialog (Pagefind loads on first search) |
| `toc-spy.ts`, `zoom.ts`, `copy.ts` | posts (copy also on home/about) | scroll-spy, image zoom, copy buttons |

Filters, accordion, menu and ticker are CSS-only.

---

## Deploy

### GitHub Pages (workflow included)

1. Push the repo to GitHub (branch `main`).
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. Push. `.github/workflows/deploy.yml` builds and deploys.

The workflow gets the URL and base path from `actions/configure-pages` and passes them in as `SITE_URL` / `BASE_PATH`, so it works unchanged for:

- `https://<user>.github.io/`: a repo named `<user>.github.io`
- `https://<user>.github.io/<repo>/`: any other repo (every link, asset, feed and search result gets the prefix)
- a **custom domain**: set it under Settings → Pages, add `public/CNAME` containing the domain, and put the URL in `site.config.ts` too

To reproduce a project-site build locally:

```sh
BASE_PATH=/dark-argus SITE_URL=https://you.github.io npm run build && npm run preview
```

GitHub Pages can't set response headers, so the CSP is delivered as a `<meta>` tag (see below).

### Cloudflare Pages

- **Build command:** `npm run build`  **Output directory:** `dist`  **Env:** `NODE_VERSION=22`
- `public/_headers` is picked up automatically and adds the CSP as a real header, plus `frame-ancestors 'none'`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP and long-cache headers for hashed assets.

## Security notes

- **CSP** (production builds only; the dev server needs inline HMR scripts), defined in `src/layouts/BaseLayout.astro` and mirrored in `public/_headers`. Keep the two in sync.
  - `script-src 'self' 'wasm-unsafe-eval'`: no inline scripts at all. The WASM allowance is for Pagefind's search index.
  - `style-src 'self' 'unsafe-inline'`: Shiki colors tokens with inline `style=""` attributes and Astro's font loader emits a `<style>`. This allows CSS only, never script execution.
  - `img-src 'self' data:`, `connect-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`.
- No third-party origins, embeds, analytics or cookies. The only `localStorage` key is `theme`.
- `/.well-known/security.txt` (RFC 9116) is generated from `site.config.ts`.

## Project structure

```
site.config.ts              ← your details (single source)
astro.config.ts             ← site/base, fonts, markdown pipeline, sitemap
src/
  content.config.ts         ← Zod schemas for research + writeups
  content/{research,writeups}/
  data/home.ts              ← homepage copy (start here, method, FAQ)
  styles/                   ← tokens.css · global.css · brutal.css · prose.css · code.css
  lib/
    markdown/               ← Shiki theme, terminal transformer, HAST plugins (callouts, frames…)
    posts.ts · taxonomy.ts · feed.ts · url.ts
  components/               ← eye/, ui/, home/, listing/, post/, Nav, Footer, Seo, Search*
  layouts/                  ← BaseLayout (head, CSP, nav/footer) · PostLayout
  pages/                    ← index, research/, writeups/, tags/, about, search, 404,
                              rss.xml, og/[...slug].png, robots.txt, .well-known/
  scripts/                  ← theme, eye-track, search, toc-spy, zoom, copy
public/                     ← theme-init.js, favicon.svg, _headers
.github/workflows/deploy.yml
```

### A note on the Markdown pipeline

Astro 7 uses **Sätteri** as its default Markdown processor, not unified/remark. Custom behavior therefore lives in Sätteri HAST plugins (`src/lib/markdown/plugins.ts`) plus a Shiki transformer (`shiki-frames.ts`), registered in `astro.config.ts` under `markdown.processor`. The same plugins run for `.md` and `.mdx`.

## License

Code: yours to license. Fonts: SIL Open Font License (see `src/assets/fonts/LICENSE-*.txt`).
