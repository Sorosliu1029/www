---
title: Follower Change
tagline: A GitHub Action that tells you who followed you on GitHub — and who unfollowed.
url: https://follower-change.sorosliu.xyz
repo: https://github.com/Sorosliu1029/follower-change
lang: en
year: 2021
tags: [github, github-action, notification]
stack: [TypeScript, GitHub Actions, GraphQL]
draft: false
---

## What it is

A GitHub Action that diffs your followers on a schedule and reports who followed and who unfollowed you, as HTML, Markdown or plain text — ready to drop into an email step. Use it as `Sorosliu1029/follower-change@v2`; setup and inputs are on [follower-change.sorosliu.xyz](https://follower-change.sorosliu.xyz).

## Why I built it

GitHub has no "follow" event, so there's no built-in way to find out when someone follows or unfollows you.

## How it works

Run it as a cron job. Each run fetches your current followers through the GitHub GraphQL API, downloads the previous snapshot saved as a workflow artifact, compares the two to find follow and unfollow events, and uploads the current list as the new snapshot. The HTML email is rendered by [follower-change-email](https://github.com/Sorosliu1029/follower-change-email).
