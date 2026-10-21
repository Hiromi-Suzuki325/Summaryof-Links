# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
日本語で全て応答してください

## Project Overview

Personal linktree-style website for Hiromi Suzuki. A static site (no build process, no dependencies) that loads profile information and links from `links.json`. Hosted on Cloudflare Workers (Static Assets), deployed directly from the local folder with `wrangler`.

## Architecture

All files live at the repository root:

- `index.html`: Header (avatar, title, bio, icon row), links container, footer
- `script.js`: Fetches `links.json` and generates the icon row and link buttons
- `style.css`: Light-only theme built on CSS custom properties
- `links.json`: Profile data and links
- `avatar.jpg`: Profile image
- `icons/*.svg`: Brand icons, applied via CSS `mask`
- `wrangler.jsonc`: Cloudflare Workers config (assets-only, no Worker script)
- `.assetsignore`: Files excluded from deployment (`.git`, `log`, `CLAUDE.md`, etc.)

## Key Technical Details

### Dynamic Content Loading

- `iconLinks` render as round icon-only links under the bio
- `links` render as labeled buttons; an entry with `split` renders one card holding several links
- Icons are chosen by URL hostname (`BRAND_ICONS` in `script.js`); unknown hosts fall back to `emoji` or the label
- Footer displays the current year

### Security

- External links use `target="_blank"` with `rel="noopener"`

## Development Commands

- Local preview: `npx wrangler dev` (http://localhost:8787), or any static server (`python -m http.server`)
- First deploy: `npx wrangler login`, then `npx wrangler deploy`
- Update: edit files, then `npx wrangler deploy`

When adding a file that must not be public, add it to `.assetsignore`.

## Configuration

Edit `links.json`:

- `avatar`: Path to profile image
- `title`: Display name
- `bio`: Brief description
- `iconLinks`: Array of `{ label, url }` shown as icons
- `links`: Array of `{ label, url, emoji? }` or `{ label, split: [{ label, url }] }`

## 作業ログ

- 作業毎にログを記載する。
- ログはmdファイルで一日1ファイル。
- 保存場所は `log/`。
