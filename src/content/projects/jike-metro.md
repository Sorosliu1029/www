---
title: Jike Metro
tagline: 即刻镇的地铁工程 —— 一个非官方的即刻 Python SDK。
url: https://jike-metro.sorosliu.xyz
repo: https://github.com/Sorosliu1029/Jike-Metro
lang: zh
year: 2018
tags: [jike, sdk, python]
stack: [Python, requests]
draft: true
---

## 是什么

Jike Metro 🚇 是即刻镇的地铁工程，旨在提高即友的出行游览效率 —— 也就是一个非官方的[即刻](https://web.okjike.com) Python SDK，可以通过 `pip install jike` 安装。

它支持：获取自己的收藏和用户信息；流式获取首页消息和动态；查看某个用户的信息、动态、主题和关注关系；获取评论、主题精选和广场；发布和删除动态（可带图、链接、主题）；点赞、收藏、评论、转发；按关键词搜索主题和自己的收藏。

## 为什么做

作为即刻的重度用户，想用代码来浏览、整理和发布即刻上的内容。<!-- TODO: verify -->

## 怎么做的

基于即刻 Web 版的接口，用 `requests` 封装成一个 `JikeClient`，登录时用 `qrcode` 在终端里生成二维码扫码。详细的乘车指南见 [jike-metro.sorosliu.xyz](https://jike-metro.sorosliu.xyz)。

项目诞生于 2018 年，支持 Python 3.4–3.6；非官方授权，随时可能翻车。
