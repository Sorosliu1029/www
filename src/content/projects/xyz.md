---
title: 光锥
tagline: 非官方的小宇宙桌面网页端 —— 在电脑浏览器里听播客，看评论热力图与逐字文稿。
url: https://xyz.sorosliu.xyz
lang: zh
year: 2026
tags: [podcast, web-app, browser-extension]
stack: [TypeScript, React, Cloudflare Workers]
draft: false
featured: true
---

## 是什么

光锥是[小宇宙](https://www.xiaoyuzhoufm.com/)播客的非官方网页端：用小宇宙 App 扫码登录，在电脑浏览器里订阅、播放、评论，与 App 同步。它还有一些只有大屏放得下的功能：

- **评论热力图**：进度条上能看到大家在哪里鼓掌、在哪里留言，点一下就跳过去。
- **逐字文稿**：播放时逐字高亮，可以搜索，点任意一句从那里开始听。
- **星图**：以一档节目或一期单集为中心，展开与它相近的节目。
- **虫洞**：随机跳进一期你没听过、大家正在热聊的单集；按住不放还能盲盒收听。
- **星屑**：收听时一键收藏此刻，自动附上那段文稿，可以写笔记、导出 Markdown。

## 为什么做

小宇宙只有手机 App。坐在电脑前工作时，我想直接在浏览器里听，也想借大屏幕把评论和文稿看得更清楚。

## 怎么做的

前端是 React 单页应用。Cloudflare Worker 负责托管页面并转发小宇宙的接口，登录凭证只存在 HttpOnly Cookie 里，网页脚本读不到。可选的浏览器插件「光锥引擎」（Chromium 系浏览器与 Firefox）让接口请求从你自己的浏览器直接发往小宇宙，不占服务器额度。
