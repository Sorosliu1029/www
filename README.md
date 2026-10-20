# www.sorosliu.xyz

The homepage of [sorosliu.xyz](https://www.sorosliu.xyz). It presents my projects, each living on its own subdomain, as a grid of cards, each with a detail page that links to the project and its source.

## Projects

| Subdomain | What it is |
| --- | --- |
| [bible](https://bible.sorosliu.xyz) | Two-year Bible reading calendar with `.ics` export and a printable checklist |
| [cosmos-wormhole](https://cosmos-wormhole.sorosliu.xyz) | Unofficial Python SDK for the 小宇宙 podcast API |
| [euler](https://euler.sorosliu.xyz) | My Project Euler solutions, in Jupyter notebooks |
| [explore-git](https://explore-git.sorosliu.xyz) | A hands-on walk through Git's internals |
| [gottee](https://gottee.sorosliu.xyz) | My tiny coffee shop in Midtown Atlanta |
| [jike-metro](https://jike-metro.sorosliu.xyz) | Unofficial Python SDK for 即刻 (Jike) |
| [leetcode](https://leetcode.sorosliu.xyz) | My LeetCode solutions and progress overview |
| [sicp](https://sicp.sorosliu.xyz/book/book.html) | Working through *SICP*, 2nd edition, as a book in progress |
| [slides](https://slides.sorosliu.xyz) | Slide decks from talks I've given |
| [wereadou](https://wereadou.sorosliu.xyz) | Browser extension showing WeRead availability on Douban book pages |

## How it works

A static [Astro](https://astro.build) site. Each project is one Markdown file in `src/content/projects/<subdomain>.md`; pushing to `master` tests, builds and deploys it to GitHub Pages.

```sh
npm install
npm run dev     # local preview (drafts visible)
npm test        # unit + build tests
npm run shots   # refresh project screenshots
```

Design notes live in `specs/`.
