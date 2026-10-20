---
title: Bible
tagline: A two-year Bible reading calendar — pick a start date, get a calendar, an .ics file and a printable checklist.
url: https://bible.sorosliu.xyz
repo: https://github.com/Sorosliu1029/Bible
lang: en
year: 2026
tags: [bible, reading-plan, calendar]
stack: [TypeScript, Python, Playwright]
draft: true
---

## What it is

A site for following The Gospel Coalition's Two-Year Bible Reading Plan. Pick a start date and you get the plan three ways: an on-page calendar (a month grid on desktop, a list on phones), a downloadable `.ics` file for Apple, Google or Outlook calendars (all-day, or at a set time with an optional reminder), and a printable three-page checklist.

It is available in English, 简体中文 and 繁體中文, and each day's reading links to the ESV (English) or 和合本 (Chinese) on BibleGateway.

## Why I built it

I wanted a reading plan that fits into the calendar I already use every day, rather than another app to remember to open. <!-- TODO: verify -->

## How it works

The 730 days of readings are extracted once from TGC's PDF by a Python script, which fails loudly on unknown book abbreviations, unparseable references, or a day count other than 730. The site itself is TypeScript, generates calendar files in the browser, and has a Playwright check that the print view stays at exactly three pages on both A4 and Letter in every language.

The reading plan is by The Gospel Coalition; this site is unofficial and not affiliated with TGC.
