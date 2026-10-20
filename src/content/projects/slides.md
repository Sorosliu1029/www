---
title: Slides
tagline: Slide decks from talks I've given — Git internals, B+ trees, Redis persistence and more.
url: https://slides.sorosliu.xyz
repo: https://github.com/Sorosliu1029/Slides
lang: en
year: 2021
tags: [talks, slides]
stack: [reveal.js, HTML]
draft: false
---

## What it is

A collection of my talks, each published as a web slide deck:

- **Explore Git** (2021-10-25) — how Git works internally; see also [Explore Git](/projects/explore-git)
- **B+ Tree** (2021-09-06) - what is B+ Tree and why it is used in database system
- **Redis 持久化** (2019-04-14) — how Redis persists data
- **如何赚xxd的红包 - 台球篇** (2018-11-26) — a lighter talk about billiards

## Why I built it

Keeping talks as web pages means they stay viewable and linkable long after the event.

## How it works

Each deck is built with reveal.js and lives in its own folder, published to `slides.sorosliu.xyz/<talk>/`. The Explore Git deck is pulled in as a git submodule from its own repository.
