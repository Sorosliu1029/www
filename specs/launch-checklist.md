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

Every `*.sorosliu.xyz` project currently answers non-browser clients with a Cloudflare managed
challenge (HTTP 403, `cf-mitigated: challenge`). Consequences:

- The deploy's link check reports these URLs as **unverified** (a `?` line in the log) and does
  not block the deploy. The challenge is served by Cloudflare's edge, so a project whose GitHub
  Pages site was deleted would still look "challenged", not broken. To get real checks, add a WAF
  custom rule that skips the challenge when a request carries a secret header, store the secret as
  a repo Actions secret, and have the link check send it.
- `npm run shots` cannot capture screenshots (every capture times out on the challenge page).
- Link previews (Slack, Telegram, X) and search crawlers may also be challenged.

Decide whether you want that. To allow screenshots, either relax the setting (Security → Bots /
Security Level) for the project subdomains, or add a WAF custom rule that skips the challenge for
your own IP while you run `npm run shots`. Or take screenshots by hand: 1280×800, saved as
`public/shots/<slug>.webp`.

## 4. Content

- [x] Review each file in `src/content/projects/`, resolve every `<!-- TODO: verify -->`
  (`grep -rn "TODO" src/content src/pages src/data`), and fill in the empty "Why I built it" sections.
- [x] Write the homepage intro (`src/pages/index.astro`) and the About bio (`src/pages/about.astro`).
- [x] Add Telegram and email to `src/data/links.ts` if you want them.
- [x] Pick `featured: true` projects (currently only SICP).
- [x] Add screenshots (see §3), or keep the generated covers.
- [x] Set `draft: false` on each project you want live. `npm run dev` shows drafts; production hides them.
- [x] Push. The Action runs check → tests → build → link check → deploy.

## 5. Verify

- [ ] `curl -sI https://www.sorosliu.xyz` → `HTTP/2 200`
- [ ] `curl -sI http://sorosliu.xyz/projects/sicp` → `301` with `location: https://www.sorosliu.xyz/projects/sicp`
- [ ] Lighthouse (Chrome DevTools) on the homepage: Performance ≥ 95, Accessibility ≥ 95.
- [ ] Open one `zh` and one `en` project page on a phone, in both light and dark mode.
