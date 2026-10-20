# www.sorosliu.xyz Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a static Astro site at `https://www.sorosliu.xyz` presenting each `*.sorosliu.xyz` project as a homepage card plus a detail page.

**Architecture:** An Astro 5 static site. Projects are a content collection of Markdown files, checked by a zod schema. Pure logic (schema, sorting, visibility, covers, link checking, screenshot planning) lives in `src/lib/` and `scripts/lib/` and is unit-tested with Vitest. Pages are tested by building against a fixture content directory and asserting on the generated HTML. GitHub Actions builds, link-checks and deploys to GitHub Pages.

**Tech Stack:** Astro 5, TypeScript, plain CSS, Vitest, node-html-parser (tests), Playwright (screenshots only), @astrojs/sitemap, GitHub Actions, Node 22, npm.

**Spec:** `specs/2026-10-20-www-showcase-design.md`

## Global Constraints

- Static output only; no client-side JavaScript shipped by our code.
- `site: "https://www.sorosliu.xyz"`; `public/CNAME` contains exactly `www.sorosliu.xyz`.
- Interface labels are in English; `<html lang>` on detail pages = the project's `lang` (`zh` | `en`), otherwise `en`.
- Font stack: `-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif`. No web-font downloads.
- Light/dark via `prefers-color-scheme`, all colours as CSS custom properties.
- Covers are 16:10; screenshots are 1280×800 `.webp` at `public/shots/<slug>.webp`.
- Drafts (`draft: true`) appear in `astro dev`, never in production builds.
- Homepage order: `featured` desc → `year` desc → `title` asc.
- Grid: 3 cols ≥1024px, 2 cols ≥640px, else 1. Detail two-column ≥900px.
- No horizontal scroll at 360px width.
- The content directory is overridable with env `PROJECTS_DIR` (default `src/content/projects`) so tests build against fixtures.

## Review Focus

1. Every project marked draft (the initial state after Task 9) → the production build must still succeed and the homepage must show an empty-state line, not crash or render an empty grid. *(Test in Task 4.)*
2. Long Chinese tagline without spaces → the card must wrap (`overflow-wrap: anywhere`), not overflow at 360px. *(Fixture + CSS assertion in Task 4.)*
3. A `cover` value pointing to a missing file → falls back to the placeholder instead of a broken `<img>`. *(Test in Task 2.)*
4. A project `url` that redirects (301 → 200) → the link checker treats it as alive; only a final 4xx/5xx or network error fails. *(Test in Task 8.)*
5. Two slugs whose hash collides in hue → placeholder gradients still differ (the hash also drives the angle). *(Test in Task 2.)*

---

### Task 1: Scaffold, schema and test harness

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `src/content.config.ts`, `src/lib/schema.ts`, `public/CNAME`, `public/favicon.svg`, `tests/schema.test.ts`, `tests/fixtures/projects/{alpha,beta,gamma,draft-one}.md`
- Modify: `.gitignore` (add `node_modules/`, `dist/`, `.astro/`, `test-dist/`)

**Interfaces:**
- Produces: `projectSchema` (zod object, from `astro/zod`) and type `Project = z.infer<typeof projectSchema>` in `src/lib/schema.ts`; collection name `projects`.
- Produces: npm scripts `dev`, `build`, `check` (`astro check`), `test` (`vitest run`), `shots`, `links`.

- [ ] **Step 1:** Initialise with `npm create astro@latest . -- --template minimal --typescript strict --no-git --install`, then `npm i -D vitest node-html-parser @astrojs/check typescript` and `npm i @astrojs/sitemap`. Set `"engines": {"node": ">=22"}`.
- [ ] **Step 2: Write failing tests** in `tests/schema.test.ts`:
  - `accepts a minimal valid project` → parse `{title:"SICP", tagline:"Notes", url:"https://sicp.sorosliu.xyz", lang:"en", year:2024}` succeeds and the defaults are `tags:[]`, `stack:[]`, `featured:false`, `draft:false`.
  - `rejects tagline over 120 chars` → `"x".repeat(121)` fails.
  - `rejects unknown lang` → `lang:"fr"` fails.
  - `rejects non-URL url` → `url:"sicp"` fails.
  - `rejects non-integer year` → `year:2024.5` fails.
- [ ] **Step 3:** Run `npx vitest run tests/schema.test.ts`. Expected: FAIL (module not found).
- [ ] **Step 4:** Implement `projectSchema` in `src/lib/schema.ts` with the fields from spec §4 (`repo` optional URL, `cover` optional string). In `src/content.config.ts`, define `projects` with `glob({ pattern: "**/*.md", base: process.env.PROJECTS_DIR ?? "./src/content/projects" })` and `schema: projectSchema`.
- [ ] **Step 5:** Run `npx vitest run`. Expected: PASS.
- [ ] **Step 6:** Write four fixtures:
  - `alpha`: en, 2024, featured, has `repo`, has `stack`.
  - `beta`: zh, 2023, with a 60-character Chinese tagline that has no spaces.
  - `gamma`: en, 2024, no `repo`, `cover: shots/missing.webp`.
  - `draft-one`: `draft: true`.

  Configure `astro.config.mjs` with `site`, `output: "static"`, the sitemap integration and `outDir: process.env.OUT_DIR ?? "dist"`. Add `.gitkeep` to `src/content/projects/`.
- [ ] **Step 7:** Run `npm run check && PROJECTS_DIR=tests/fixtures/projects npm run build`. Expected: both exit 0.
- [ ] **Step 8: Commit** `feat: scaffold Astro site with project schema`

### Task 2: Project logic library

**Files:**
- Create: `src/lib/projects.ts`, `tests/projects.test.ts`

**Interfaces:**
- Consumes: `Project` from Task 1.
- Produces:
  - `sortProjects<T extends {data: Pick<Project,"featured"|"year"|"title">}>(items: T[]): T[]` (does not mutate its input)
  - `isPublished(p: {data:{draft:boolean}}, prod: boolean): boolean`
  - `placeholderGradient(slug: string): { from: string; to: string; angle: number }` (colours as `hsl(...)` strings)
  - `resolveCover(slug: string, cover: string | undefined, exists: (publicPath: string) => boolean): string | null`. Returns a site-absolute path like `/shots/sicp.webp`, or `null` when the placeholder should be used.

- [ ] **Step 1: Write failing tests:**
  - `sortProjects orders featured, then year desc, then title asc`: input years/titles `[{B,2023},{A,2024},{C,2024,featured}]` → `C, A, B`.
  - `sortProjects does not mutate input`.
  - `isPublished hides drafts only in prod`: `(draft,true)→false`, `(draft,false)→true`, `(published,true)→true`.
  - `placeholderGradient is deterministic`: same slug gives deep-equal results.
  - `placeholderGradient differs across slugs`: the results for all 10 README slugs are pairwise different (compare JSON).
  - `resolveCover uses explicit cover when it exists`: `("x","shots/a.webp", ()=>true)` → `"/shots/a.webp"`.
  - `resolveCover falls back to shots/<slug>.webp`: cover undefined, exists only for `shots/x.webp` → `"/shots/x.webp"`.
  - `resolveCover returns null when nothing exists`, including when an explicit cover is missing.
- [ ] **Step 2:** Run `npx vitest run tests/projects.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement. For `placeholderGradient`: take an FNV-1a 32-bit hash `h` of the slug. Then `hue = h % 360`, `to` hue = `(hue + 40 + (h >>> 9) % 60) % 360`, `angle = 90 + (h >>> 17) % 90`. Saturation is 70% and lightness 85%. Dark-mode adjustment is done in CSS with `filter`, not here.
- [ ] **Step 4:** Run `npx vitest run`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: add project sorting, visibility and cover helpers`

### Task 3: Base layout, theme, header/footer, 404 and the build-output harness

**Files:**
- Create: `src/styles/global.css`, `src/layouts/Base.astro`, `src/pages/404.astro`, `tests/helpers/build.ts`, `tests/layout.test.ts`
- Modify: `vitest.config.ts` (`globalSetup: "tests/helpers/build.ts"`)

**Interfaces:**
- Produces:
  - `Base.astro` props: `{ title: string; description: string; lang?: "zh" | "en"; ogImage?: string }`. The `<title>` is `"{title} · Soros Liu"`, except `"Soros Liu"` when `title` is empty.
  - `tests/helpers/build.ts`: a global setup that runs `astro build` once with `PROJECTS_DIR=tests/fixtures/projects` and `OUT_DIR=test-dist`.
  - `loadPage(route: string): HTMLElement` (from node-html-parser). `"/"` maps to `test-dist/index.html` and `"/projects/alpha"` to `test-dist/projects/alpha/index.html`.
  - `readCss(): string`, which concatenates the built CSS under `test-dist/_astro/`.

- [ ] **Step 1: Write failing tests** in `tests/layout.test.ts`, against `/404`:
  - `html lang defaults to en`.
  - `header links home and to /about`: `header a[href="/"]` has the text `sorosliu.xyz`, and `header nav a[href="/about"]` exists.
  - `footer has GitHub link`: `footer a[href^="https://github.com/"]`.
  - `404 links home`: `main a[href="/"]`.
  - `css defines dark scheme`: `readCss()` matches `/prefers-color-scheme:\s*dark/`.
- [ ] **Step 2:** Run `npx vitest run tests/layout.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `global.css`:
  - Tokens `--bg --fg --muted --border --accent --card-bg`, with a dark override block.
  - The font stack from Global Constraints.
  - `:lang(zh) { line-height: 1.8 }`, against a default of 1.6.
  - `.container { max-width: 1100px; padding-inline: 16px }`.

  Then implement `Base.astro`: meta description, Open Graph tags (`og:title`, `og:description`, `og:image` when given, made absolute using `Astro.site`), the favicon, and the header and footer from spec §5. Nav is "Projects" pointing to `/` and "About" pointing to `/about`. The footer shows `© <current year> Soros Liu` and GitHub. Then implement the 404 page.
- [ ] **Step 4:** Run `npx vitest run`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: add base layout, theme and 404`

### Task 4: Homepage, ProjectCard and Placeholder

**Files:**
- Create: `src/components/ProjectCard.astro`, `src/components/Placeholder.astro`, `src/lib/collection.ts`, `src/pages/index.astro`, `tests/home.test.ts`

**Interfaces:**
- Consumes: `sortProjects`, `isPublished`, `resolveCover`, `placeholderGradient` (Task 2); `Base.astro` (Task 3).
- Produces:
  - `type VisibleProject = { entry: CollectionEntry<"projects">; cover: string | null }` and `getVisibleProjects(): Promise<VisibleProject[]>` in `src/lib/collection.ts`. It filters with `isPublished(p, import.meta.env.PROD)`, sorts with `sortProjects`, and calls `resolveCover` with `exists = (p) => fs.existsSync(path.join("public", p))`.
  - `Placeholder.astro` props: `{ slug: string; title: string }`.
  - `ProjectCard.astro` props: `{ project: VisibleProject }`.

- [ ] **Step 1: Write failing tests** in `tests/home.test.ts`, against `/`:
  - `lists published projects in order`: the `a.card` hrefs equal `["/projects/alpha", "/projects/gamma", "/projects/beta"]`.
  - `excludes drafts`: no href contains `draft-one`.
  - `card shows title, tagline, max 3 tags`: alpha's card contains its title and tagline, and has ≤ 3 `.tag` elements.
  - `missing cover renders placeholder`: gamma's card has `.placeholder` and no `img`.
  - `intro present`: `main .intro` exists.
  - `long CJK tagline can wrap`: `readCss()` matches `/overflow-wrap:\s*anywhere/`.
  - `empty state`: a second build with `PROJECTS_DIR=tests/fixtures/empty` (a directory holding only a draft project) contains `.empty` with the text `Projects coming soon.` and no `.grid`. Add the fixture dir and a second-build helper `buildInto(dir, projectsDir)` in `tests/helpers/build.ts`.
- [ ] **Step 2:** Run `npx vitest run tests/home.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement:
  - `index.astro`: the intro, using placeholder copy wrapped in `<!-- TODO(soros): write intro -->`; then `.grid` or `.empty`.
  - The grid breakpoints from Global Constraints.
  - `ProjectCard`: cover `<img loading="lazy" width="1280" height="800" alt="Screenshot of {title}">` or a `Placeholder`, then title, tagline and the first 3 tags. The whole card is an `<a class="card">`.
  - `Placeholder`: a div with inline `background: linear-gradient(...)` and the title centred over it.
  - Both cover kinds use `aspect-ratio: 16/10`.
- [ ] **Step 4:** Run `npx vitest run`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: add homepage project grid`

### Task 5: Project detail page and FactsSidebar

**Files:**
- Create: `src/pages/projects/[slug].astro`, `src/components/FactsSidebar.astro`, `tests/detail.test.ts`

**Interfaces:**
- Consumes: `getVisibleProjects`, `VisibleProject` (Task 4); `Placeholder` (Task 4); `Base.astro` (Task 3).
- Produces: `FactsSidebar.astro` props: `{ data: Project }`.

- [ ] **Step 1: Write failing tests** in `tests/detail.test.ts`:
  - `zh project sets html lang`: `/projects/beta` → `html[lang="zh"]`; `/projects/alpha` → `en`.
  - `visit button links to url`: `/projects/alpha` → `aside a.visit[href="<alpha url>"]` with the text `Visit ↗`, and it has no `target` attribute.
  - `source link only when repo set`: alpha has `aside a.source`, and gamma does not.
  - `sidebar shows year, stack, tags`: alpha's aside text includes the year and each stack item.
  - `back link`: `a[href="/"]` with the text `← All projects`.
  - `markdown body rendered`: an `article h2` exists, with the fixture alpha having `## What it is`.
  - `meta description is tagline`: `meta[name="description"]` content equals the tagline.
  - `no page for drafts`: `test-dist/projects/draft-one/index.html` does not exist.
- [ ] **Step 2:** Run `npx vitest run tests/detail.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement:
  - `getStaticPaths` from `getVisibleProjects()`.
  - Layout: the full-width cover or placeholder, then `.detail` as a grid of `1fr 260px` at ≥900px, with the sidebar `position: sticky; top: 24px`. Below 900px it's a single column, and the sidebar is placed after the title and tagline and before the article. Use the grid `order`, keeping one DOM order: header, aside, article.
  - Pass `lang` and `ogImage` (the cover, when set) to `Base`.
- [ ] **Step 4:** Run `npx vitest run`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: add project detail page`

### Task 6: About page and sitemap

**Files:**
- Create: `src/pages/about.astro`, `src/data/links.ts`, `tests/about.test.ts`

**Interfaces:**
- Produces: `links: { label: string; href: string }[]` in `src/data/links.ts`. Seed it with GitHub `https://github.com/<user>`, marked `// TODO(soros): confirm handle`, and leave Telegram and email as TODO comments, not entries.

- [ ] **Step 1: Write failing tests:**
  - `about lists links`: each `links` entry renders as `main a[href=…]`.
  - `about has bio placeholder`: `main .bio` exists.
  - `sitemap lists pages`: `test-dist/sitemap-0.xml` contains `https://www.sorosliu.xyz/projects/alpha/` and does not contain `draft-one`.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the page (the bio is a placeholder paragraph with a TODO comment). The sitemap integration is already configured in Task 1.
- [ ] **Step 4:** Run `npx vitest run`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: add about page`

### Task 7: Screenshot script

**Files:**
- Create: `scripts/lib/shots.ts`, `scripts/shots.ts`, `tests/shots.test.ts`

**Interfaces:**
- Produces:
  - `planCaptures(projects: {slug: string; url: string}[], only?: string): {slug: string; url: string; out: string}[]`, with `out = "public/shots/<slug>.webp"`. It throws `Unknown project: <slug>` if `only` matches nothing.
  - `captureAll(plan, capture: (url: string, out: string) => Promise<void>): Promise<{ ok: string[]; failed: string[] }>`. It runs captures one after another, and a capture that throws adds the slug to `failed` and moves on.
  - `npm run shots [-- <slug>]` → `tsx scripts/shots.ts`.

- [ ] **Step 1: Write failing tests:**
  - `plans all projects`: two inputs give two entries with the correct `out` paths.
  - `filters to one slug`.
  - `unknown slug throws`.
  - `captureAll continues after failure`: a fake capture throws for `b`, so the result is `{ok:["a","c"], failed:["b"]}`.
- [ ] **Step 2:** Run `npx vitest run tests/shots.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement the library. Then implement `scripts/shots.ts`:
  - Read the frontmatter of `src/content/projects/*.md` with `gray-matter`, drafts included.
  - Capture with Playwright Chromium at a 1280×800 viewport, using `goto(url, {waitUntil: "networkidle", timeout: 20000})`.
  - Take the screenshot as PNG into memory and convert it to webp with `sharp` (quality 80). Write to a temp file first, then rename it over the real path, so a failed capture leaves the old image in place.
  - Print the ok and failed slugs, and exit with code 1 if any capture failed.

  Install the dev dependencies `playwright tsx gray-matter sharp`.
- [ ] **Step 4:** Run `npx vitest run`. Expected: PASS. Then run `npm run shots -- does-not-exist`. Expected: `Unknown project: does-not-exist`, exit code 1.
- [ ] **Step 5: Commit** `feat: add screenshot capture script`

### Task 8: Link checker and deploy workflow

**Files:**
- Create: `scripts/lib/links.ts`, `scripts/check-links.ts`, `tests/links.test.ts`, `.github/workflows/deploy.yml`

**Interfaces:**
- Produces:
  - `findBrokenInternal(distDir: string): string[]`. It scans every `dist/**/*.html` for `a[href^="/"]`, `img[src^="/"]` and `link[href^="/"]`, and returns those whose target exists neither as a file nor as `<path>/index.html`.
  - `checkExternal(urls: string[], fetchFn = fetch): Promise<{url: string; status: number | "error"}[]>`, which returns only the failures. It sends a `GET` with `redirect: "follow"` and a 15s timeout. A final status ≥400, or a thrown error, counts as a failure.
  - `npm run links` → `tsx scripts/check-links.ts dist`. It checks internal links plus every `aside a.visit` href, and exits 1 if anything is broken.

- [ ] **Step 1: Write failing tests:**
  - `internal: reports missing target`: a temp dir holds `index.html` with links to `/a` (where `a/index.html` exists) and `/b` (missing) → `["/b"]`.
  - `external: redirect then 200 is ok`: the fake fetch resolves `{status:200}` → `[]`.
  - `external: 404 fails` → `[{url, status:404}]`.
  - `external: network error fails` → `status: "error"`.
- [ ] **Step 2:** Run `npx vitest run tests/links.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement. Then write `deploy.yml`:
  - Trigger on `push` to `master` and on `workflow_dispatch`.
  - Permissions: `pages: write`, `id-token: write`, `contents: read`.
  - Job `build`:
    1. checkout
    2. setup-node 22 with npm cache
    3. `npm ci`
    4. `npm run check`
    5. `npm test`
    6. `npm run build`
    7. `npm run links`
    8. `actions/upload-pages-artifact` with `path: dist`
  - Job `deploy`: needs `build`, environment `github-pages`, runs `actions/deploy-pages`.
  - Use plain steps rather than `withastro/action`, so check, test and links run before the upload.
- [ ] **Step 4:** Run `npx vitest run && npm run build && npm run links`. Expected: PASS. With no projects published yet, only internal links get checked.
- [ ] **Step 5: Commit** `ci: add link checker and GitHub Pages deploy`

### Task 9: Draft project copy (10 projects)

**Files:**
- Create: `src/content/projects/{bible,cosmos-wormhole,euler,explore-git,gottee,jike-metro,leetcode,sicp,slides,wereadou}.md`

- [ ] **Step 1:** For each slug, fetch `https://<slug>.sorosliu.xyz` (read-only) and look for a linked GitHub repo. If there is one, read its README and first commit date.
- [ ] **Step 2:** Write each file following spec §8:
  - `draft: true`
  - `lang` set by the language of the project's own site
  - three body headings in that language: **What it is / Why I built it / How it works** (zh: **是什么 / 为什么做 / 怎么做的**)
  - 150–300 words
  - `<!-- TODO: verify -->` after every inferred claim, and always in "Why I built it"
  - Unreachable or thin sites get a minimal entry plus `<!-- TODO: site unreachable/thin at drafting time -->`.
- [ ] **Step 3:** Run `npm run check && npm run build`. Expected: exit 0, and the homepage shows `Projects coming soon.` because everything is still a draft.
- [ ] **Step 4:** Run `npm run shots`. Expected: a webp for each reachable site; failures are reported, not fatal to the content work.
- [ ] **Step 5:** Run `npm run dev` and visually check the homepage and two detail pages (one zh, one en) at 360, 768 and 1280px, in light and dark.
- [ ] **Step 6: Commit** `content: draft all project pages` (include `public/shots/`)

### Task 10: Launch checklist (manual, for Soros)

These steps need Soros's GitHub and Cloudflare accounts. The executor writes them as `specs/launch-checklist.md` and does not perform them.

- [ ] Create the GitHub repo `sorosliu/www` (confirm the name), add it as `origin`, and push `master`.
- [ ] Repo → Settings → Pages: Source = **GitHub Actions**; Custom domain = `www.sorosliu.xyz`.
- [ ] Cloudflare DNS: `CNAME www → <github-user>.github.io`, **DNS only**.
- [ ] Cloudflare apex: a proxied `A @ 192.0.2.1` record plus a Redirect Rule matching hostname `sorosliu.xyz`, sending a 301 to `concat("https://www.sorosliu.xyz", http.request.uri.path)`.
- [ ] Wait for GitHub to issue the cert, then tick **Enforce HTTPS**.
- [ ] Review the drafts, resolve the TODOs, set `draft: false`, write the intro, bio and links, then push.
- [ ] Verify:
  - `curl -sI https://www.sorosliu.xyz` → 200
  - `curl -sI http://sorosliu.xyz/projects/sicp` → 301 to `https://www.sorosliu.xyz/projects/sicp`
  - Lighthouse on the homepage ≥95 for Performance and Accessibility
