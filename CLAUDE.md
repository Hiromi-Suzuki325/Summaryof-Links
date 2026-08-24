# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
日本語で全て応答してください

## Project Overview

This is a personal linktree-style website for Hiromi Suzuki featuring two versions (V1 and V2) of the same design. The project is a static website that dynamically loads profile information and social links from a JSON configuration file.

## Architecture

The project consists of two parallel implementations in separate directories:

- **V1/**: Complete linktree implementation with animated gradient background and floating circles
- **V2/**: Identical copy of V1 implementation

Each version contains:

- `index.html`: Main HTML structure with header, links container, and footer
- `script.js`: JavaScript that fetches `links.json` and dynamically generates link buttons
- `style.css`: CSS with CSS custom properties for theming, animated backgrounds, and responsive design
- `links.json`: Configuration file containing profile data and social media links
- `avatar.JPG`: Profile image

## Key Technical Details

### Dynamic Content Loading

- Profile information (avatar, title, bio) and links are loaded from `links.json`
- Link buttons are dynamically generated with emoji support
- Footer automatically displays current year

### Styling System

- Uses CSS custom properties for light/dark theme support via `prefers-color-scheme`
- Animated gradient background with `background-position` animation
- Floating circles animation with staggered timing
- Responsive design with mobile-first approach

### Security Features

- External links use `target="_blank"` with `rel="noopener"` for security
- No build process or dependencies - pure vanilla HTML/CSS/JS

## Development Commands

This is a static website with no build process. To work with the project:

- Open `index.html` directly in a browser, or
- Serve locally with any static file server (e.g., `python -m http.server` or `npx serve`)

## File Structure

```
V1/                    # Version 1 implementation
├── index.html         # Main HTML file
├── script.js          # JavaScript for dynamic content
├── style.css          # Styles with animations and theming
├── links.json         # Profile and links configuration
└── avatar.JPG         # Profile image

V2/                    # Version 2 implementation (identical to V1)
├── index.html
├── script.js
├── style.css
├── links.json
└── avatar.JPG
```

## Configuration

To modify the website content, edit the `links.json` file in the respective version directory. The JSON structure includes:

- `avatar`: Path to profile image
- `title`: Display name
- `bio`: Brief description
- `links`: Array of social media links with label, URL, and emoji

## 作業ログ

- 作業毎にログを記載する。
- ログはmdファイルで一日1ファイル。
- 保存場所は `log/`。
