---
title: jupyterlab-leetcode
tagline: A JupyterLab extension that turns LeetCode questions into notebooks you can run and submit.
url: https://jupyterlab-leetcode.sorosliu.xyz
repo: https://github.com/Sorosliu1029/jupyterlab-leetcode
lang: en
year: 2025
tags: [leetcode, jupyterlab-extension, notebooks]
stack: [TypeScript, React, Python, Jupyter]
draft: false
---

## What it is

A JupyterLab extension that brings LeetCode into Jupyter. You can browse and filter questions, see your profile and submission heatmap, and open any question as a notebook. Each notebook includes the description, the Python starter code, and one cell per example test case. A toolbar button submits your solution and writes the verdict back into the notebook.

Install it with `pip install jupyterlab-leetcode`. It needs JupyterLab 4.

## Why I built it

I already keep my [LeetCode solutions](https://leetcode.sorosliu.xyz) in notebooks. Copying each question from the browser into a new notebook and pasting the solution back to submit was the tedious part, so I let Jupyter do it.

## How it works

There's no separate login. The extension reads your LeetCode session cookie from the browser you're already signed in with. A Jupyter server extension calls LeetCode's GraphQL API, generates the `.ipynb` files, and submits solutions. The React frontend runs inside JupyterLab.
