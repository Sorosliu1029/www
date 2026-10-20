# www.sorosliu.xyz — Project Showcase Design

Date: 2026-10-20
Status: Draft, awaiting review

## 1. Goal

`www.sorosliu.xyz` is the front door to Soros Liu's project work. It presents the
projects hosted on `*.sorosliu.xyz` subdomains: each one gets a card on the homepage
and a detail page, and every page sends visitors on to the live project.

Success means:

- Every subdomain project listed in `README.md` has a published card and detail page.
- A visitor can get from the homepage to any live project in two clicks.
- Adding a project means adding one Markdown file and, optionally, a screenshot.
- Adding a writing section later needs no restructuring.

### In scope

- Homepage: short intro, then a grid of project cards
- Project detail pages
- About page
- Automated deploy to GitHub Pages on the custom domain
- Screenshot capture script
- First drafts of all project copy

### Out of scope (later phases)

- Writing/essays section (the structure leaves room: `/writing`, `/writing/<slug>`)
- Telegram channel integration
- Full zh/en translation or a language toggle
- Search, analytics, comments

## 2. Stack

- **Astro**, static output, with content collections for type-checked project data.
- Plain CSS (custom properties for theming), no UI framework. No client-side
  JavaScript except what Astro emits by default (none).
- Node LTS; package manager: npm.
- **Playwright** (dev dependency only) for screenshots.

## 3. Repository layout

```
www/
  src/
    content/
      projects/<slug>.md       one file per project
    content.config.ts          project collection schema
    layouts/Base.astro         <html>, head, header, footer, theme
    components/
      ProjectCard.astro        homepage card
      FactsSidebar.astro       detail-page facts panel
      Placeholder.astro        generated cover when no screenshot exists
    pages/
      index.astro              intro + project grid
      projects/[slug].astro    detail page
      about.astro
      404.astro
    styles/global.css          tokens, typography, light/dark
  public/
    shots/<slug>.webp          committed screenshots
    CNAME                      www.sorosliu.xyz
    favicon.svg
  scripts/
    shots.ts                   Playwright screenshot capture
  .github/workflows/deploy.yml
  specs/                       design docs (this file)
  README.md                    list of subdomains (existing)
```

## 4. Content model

Collection `projects`, one file per project at `src/content/projects/<slug>.md`.
The slug is the subdomain name (`sicp`, `jike-metro`, …).

| Field      | Type                    | Required | Notes |
|------------|-------------------------|----------|-------|
| `title`    | string                  | yes      | Display name |
| `tagline`  | string (≤ 120 chars)    | yes      | One sentence; shown on the card |
| `url`      | URL                     | yes      | Live project, e.g. `https://sicp.sorosliu.xyz` |
| `repo`     | URL                     | no       | Source code link |
| `lang`     | `"zh"` \| `"en"`        | yes      | Language of this page's body; sets `<html lang>` |
| `year`     | integer                 | yes      | Used for sorting |
| `tags`     | string[]                | no       | Default `[]` |
| `stack`    | string[]                | no       | Default `[]`; shown in the sidebar |
| `featured` | boolean                 | no       | Default `false`; featured projects sort first |
| `cover`    | string                  | no       | Path under `public/`; defaults to `shots/<slug>.webp` if that file exists |
| `draft`    | boolean                 | no       | Default `false`; drafts appear in `astro dev` only, never in production builds |

The body is Markdown with three headings by convention: **What it is**, **Why I built
it**, **How it works**. Headings are written in the page's own language.

A schema violation fails the build.

**Sort order** (homepage): `featured` first, then `year` descending, then `title`
ascending.

## 5. Pages and visual design

### Visual direction: minimal grid

- Clean sans-serif: system UI stack (`-apple-system, "Inter", "Segoe UI", …`) with
  CJK fallbacks `"PingFang SC", "Noto Sans SC", "Microsoft YaHei"`. No web-font download.
- Neutral palette, a single accent colour, generous whitespace, cards with 1px border
  and ~10px radius.
- Light and dark themes via `prefers-color-scheme`, defined as CSS custom properties.
- Chinese-language pages get a slightly larger line-height (`lang="zh"` selector).
- Responsive, mobile-first; no horizontal scroll at 360px width.

### Shared header and footer

- Header: site name `sorosliu.xyz` (links home) · nav: Projects, About. A Writing link
  is added in a later phase.
- Footer: © year, GitHub link.

### Homepage `/`

- Intro: name plus 1–2 sentence description (placeholder text for Soros to write).
- Project grid: 3 columns ≥ 1024px, 2 columns ≥ 640px, 1 column below that.
- Each card shows the cover image (16:10), title, tagline and up to 3 tags. The whole
  card links to `/projects/<slug>`.

### Project detail `/projects/<slug>`

- "← All projects" back link.
- Cover screenshot, full width, 16:10.
- Two columns ≥ 900px: main content (title, tagline, Markdown body) on the left; facts
  sidebar on the right (sticky on desktop). Below 900px the sidebar moves under the
  title, before the body.
- Facts sidebar: primary **Visit ↗** button (`url`, opens in the same tab), Year,
  Stack, Tags, Source ↗ (`repo`, only if set).
- `<html lang>` follows the project's `lang` field. Interface labels stay in English.

### About `/about`

- Short bio (placeholder for Soros) and a list of links (GitHub, Telegram channel,
  email — values supplied by Soros).

### 404

- Short message and a link home.

### Metadata

- Per-page `<title>` and meta description (the tagline on detail pages).
- Open Graph tags; the detail page's `og:image` is its cover.
- `sitemap.xml` via `@astrojs/sitemap`; `site` set to `https://www.sorosliu.xyz`.

## 6. Covers and screenshots

- `npm run shots` runs `scripts/shots.ts`. For each project (drafts included) it opens
  `url` in headless Chromium at a 1280×800 viewport, waits for network idle (timeout
  20s), and writes `public/shots/<slug>.webp`.
- `npm run shots -- <slug>` captures a single project.
- The script runs locally and by hand; it is not part of CI. Screenshots are committed.
- If a capture fails (timeout or non-2xx), the script logs the slug and continues, and
  any existing screenshot is kept.
- **Placeholder cover:** when no cover image exists, `Placeholder.astro` renders a
  gradient whose colours are derived deterministically from a hash of the slug, with
  the project title over it. The build never fails for a missing image.

## 7. Deployment and DNS

- GitHub repository: `sorosliu/www` (exact name confirmed at setup).
- Workflow `.github/workflows/deploy.yml`, triggered on push to `master` and by manual
  dispatch:
  1. `withastro/action` installs, type-checks (`astro check`) and builds.
  2. Link check over `dist/` for internal links and the project `url`s; a broken
     project URL fails the job.
  3. `actions/deploy-pages` publishes.
- Repository Pages setting: source = GitHub Actions; custom domain
  `www.sorosliu.xyz`; Enforce HTTPS on.
- Cloudflare DNS:
  - `CNAME www → <github-user>.github.io`, **DNS only** (grey cloud) so GitHub can
    issue the certificate. Proxying may be enabled later with SSL mode "Full".
  - Apex `sorosliu.xyz` (currently unused): a placeholder proxied record plus a
    Cloudflare Redirect Rule, 301 to `https://www.sorosliu.xyz/${path}`.
- These DNS and Pages settings are manual steps for Soros, listed in a checklist in
  the implementation plan.

## 8. Drafting the initial copy

For each subdomain in `README.md` (bible, cosmos-wormhole, euler, explore-git, gottee,
jike-metro, leetcode, sicp, slides, wereadou):

1. Read the live site and, if it is public, its GitHub repository and README.
   Read only.
2. Write `src/content/projects/<slug>.md` with `draft: true`, a tagline, tags, stack,
   year (from the first commit when visible) and a 150–300 word body under the three
   standard headings.
3. Language: `zh` if the project's own site is mainly Chinese, otherwise `en`.
4. Anything inferred rather than observed — especially motivation in "Why I built
   it" — is marked `<!-- TODO: verify -->`. If a site is unreachable or too thin, write
   a minimal entry and flag it. Nothing is invented.
5. Soros reviews all drafts, edits them, and flips `draft: false` to publish.

The About page bio and homepage intro are left as clearly marked placeholders.

## 9. Error handling summary

| Situation | Behaviour |
|-----------|-----------|
| Project file breaks the schema | Build fails with Astro's validation error |
| Missing screenshot | Generated placeholder cover |
| Screenshot capture fails | Logged; existing image kept; script continues |
| Project subdomain is down at deploy time | Link check fails the deploy, so it is noticed |
| Unknown route | `404.astro` |

## 10. Testing and verification

- `astro check` (types plus content schema) in CI.
- Link check on the built output in CI.
- Manual pre-launch check: homepage and two detail pages (one `zh`, one `en`) at 360px,
  768px and 1280px, in both light and dark; Lighthouse ≥ 95 on Performance and
  Accessibility for the homepage.
- After DNS setup: `https://www.sorosliu.xyz` serves over HTTPS, and
  `http://sorosliu.xyz/x` redirects to `https://www.sorosliu.xyz/x`.

## 11. Future phase: writing

Add a `writing` collection (title, date, lang, summary, draft) with `/writing` and
`/writing/<slug>`, plus a nav link. The Telegram channel may later feed this section;
that design is deferred.
