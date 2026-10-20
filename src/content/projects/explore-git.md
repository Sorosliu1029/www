---
title: Explore Git
tagline: How does Git actually work? A hands-on walk through Git's internals — objects, the index and refs.
url: https://explore-git.sorosliu.xyz
repo: https://github.com/Sorosliu1029/Explore-Git
lang: en
year: 2021
tags: [git, internals, talk]
stack: [Python, Jupyter, Docker]
draft: false
---

## What it is

An explanation of how Git works under the hood, written as executable notebooks, plus a [slide deck](https://explore-git.sorosliu.xyz/mock.slides.html) from a talk I gave in October 2021.

## Why I built it

I use Git every day and was curious what really happens on disk when I commit, branch or stage a file.

## How it works

The notebooks poke directly at a repository's `.git` directory to show Git's building blocks: how objects are stored byte by byte, what the index file contains, and how commits, trees and blobs link together.

It draws on Pro Git's *Git Internals* chapter, the Git user manual's object-storage format, the index-format documentation, and Tom Preston-Werner's *The Git Parable* — which designs a version control system from scratch to explain the philosophy behind Git.
