---
title: Anki Eudic
tagline: A terminal app that turns your Eudic study lists into Anki decks — with Longman definitions and audio.
url: https://anki-eudic.sorosliu.xyz
repo: https://github.com/Sorosliu1029/Anki-Eudic
lang: en
year: 2026
tags: [anki, eudic, vocabulary, tui]
stack: [Python, Textual]
draft: false
---

## What it is

A keyboard-driven terminal app that downloads a study list from [Eudic](https://www.eudic.net/) and exports it as an Anki deck (`.apkg`). With a local *Longman Dictionary of Contemporary English* (LDOCE5++), each card also gets English definitions with Chinese translations, examples, and British and American pronunciation audio. Install it with `uv tool install anki-eudic` or `pipx install anki-eudic`.

## Why I built it

I look words up in Eudic, but review them in Anki. Moving unfamiliar words across by hand was tedious, and Eudic's own explanations are thinner than a proper learner's dictionary.

## How it works

It fetches every page of a study list through the Eudic Open API, looks each word up in the LDOCE5++ MDict files with its own reader, and writes the notes straight into an `.apkg` — no Anki add-on, and Anki needn't be running. Notes are keyed by word, so re-exporting a list updates existing cards and keeps their review progress. The API token lives only in the OS credential store.
