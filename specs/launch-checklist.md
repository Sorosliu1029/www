# Launch checklist — www.sorosliu.xyz

Manual steps that need your GitHub and Cloudflare accounts. Work through them in order.

## 1. GitHub repository

- [x] Create the repo `Sorosliu1029/www` (public; any name works, it doesn't affect the domain).
- [x] Repo → Settings → Pages → **Source: GitHub Actions**. Do this before the first push,
  otherwise the first deploy run fails.
- [x] Same page → **Custom domain:** `www.sorosliu.xyz`, then Save.
- [x] Add the remote and push `master`:
  ```sh
  git remote add origin git@github.com:Sorosliu1029/www.git
  git push -u origin master
  ```

## 2. Cloudflare DNS

- [x] Add `CNAME  www  →  sorosliu1029.github.io` with **Proxy status: DNS only** (grey cloud).
  GitHub can only issue the HTTPS certificate while the record is not proxied.
- [x] Redirect the apex: add a proxied placeholder record `A  @  192.0.2.1` (orange cloud), then
  Rules → Redirect Rules → Create:
  - When: Hostname equals `sorosliu.xyz`
  - Then: Dynamic, expression `concat("https://www.sorosliu.xyz", http.request.uri.path)`, status **301**, preserve query string.
- [x] Wait for GitHub Pages to show the certificate as issued (minutes to an hour), then tick **Enforce HTTPS**.
- [x] Optional, later: switch `www` to proxied (orange cloud) with SSL/TLS mode **Full**.

## 3. Cloudflare bot challenge on the project subdomains

- [x] Turn off **Bot Fight Mode** (Security → Bots). Done 2026-10-20.

With Bot Fight Mode on, every `*.sorosliu.xyz` project answered non-browser clients with a
Cloudflare managed challenge (HTTP 403, `cf-mitigated: challenge`). `npm run shots` timed out on
every site, link previews and search crawlers were challenged, and the deploy's link check could
only report the project URLs as **unverified**. With it off, all of these work, and the link check
reports `0 unverified`.

If `?` (unverified) lines come back in the deploy log, or `npm run shots` starts timing out,
something has turned the challenge on again: check Bot Fight Mode and Security Level first.

## 4. Content

- [x] Review each file in `src/content/projects/`, resolve every `<!-- TODO: verify -->`
  (`grep -rn "TODO" src/content src/pages src/data`), and fill in the empty "Why I built it" sections.
- [x] Write the homepage intro (`src/pages/index.astro`) and the About bio (`src/pages/about.astro`).
- [x] Add Telegram and email to `src/data/links.ts` if you want them.
- [x] Pick `featured: true` projects (currently only SICP).
- [x] Add screenshots: `npm run shots`, then commit `public/shots/` (PR #4). Re-run it to refresh them.
- [x] Set `draft: false` on each project you want live. `npm run dev` shows drafts; production hides them.
- [x] Push. The Action runs check → tests → build → link check → deploy.

## 5. Verify

- [ ] `curl -sI https://www.sorosliu.xyz` → `HTTP/2 200`
- [ ] `curl -sI http://sorosliu.xyz/projects/sicp` → `301` with `location: https://www.sorosliu.xyz/projects/sicp`
- [ ] Lighthouse (Chrome DevTools) on the homepage: Performance ≥ 95, Accessibility ≥ 95.
- [ ] Open one `zh` and one `en` project page on a phone, in both light and dark mode.
