# dark-mode-toggle — Onboarding Guide

## Purpose

`dark-mode-toggle` is a lightweight, zero-dependency Web Component (`<dark-mode-toggle>`) that provides an accessible toggle switch for switching between dark and light color schemes. It handles OS preference detection, user preference persistence, and cross-tab synchronization out of the box.

---

## Architecture

The project is minimal by design:

```
dark-mode-toggle/
├── dark-mode-toggle.js        # Source — the custom element definition
├── docs/
│   ├── dark-mode-toggle.min.js  # Minified build (served via GitHub Pages)
│   └── index.html               # Live demo / documentation page
└── .github/workflows/
    └── minify-js.yml            # CI: auto-minifies on push to main
```

**Core component** (`dark-mode-toggle.js`) — A single-file custom element extending `HTMLElement`. It uses:
- **Shadow DOM** with constructable stylesheets for style encapsulation
- **Slots** for user-provided SVG icons (sun/moon)
- **`localStorage`** for persisting user preference across sessions
- **`BroadcastChannel`** + `storage` events for syncing state across tabs
- **`prefers-color-scheme` media query** as the default when no stored preference exists

**Theming strategies** — The component supports two strategies for applying the theme to the document, controlled via an attribute:
- `data-theme` attribute on a target root element (default)
- CSS class toggling (e.g., Tailwind's `dark` class)

**CI/CD** — A GitHub Actions workflow (`minify-js.yml`) runs Terser on `dark-mode-toggle.js` and auto-commits the minified output to `docs/dark-mode-toggle.min.js` on every push to `main`. The `docs/` directory doubles as the GitHub Pages demo site.

---

## Key Patterns

- **Vanilla custom elements, no framework.** No build step is required to use the component. The source is a single ES module-style file you can drop in a `<script>` tag.
- **Flash-of-incorrect-theme (FOIT) prevention.** The demo `index.html` includes an inline `<script>` before any CSS that reads `localStorage` and applies the theme class/attribute synchronously, preventing a visible flicker on page load. This pattern should be replicated in any consuming application.
- **Scoped roots.** The component accepts a `root` attribute pointing to any element (not just `document`), enabling scoped theming for embedded widgets or micro-frontends.
- **Progressive enhancement via slots.** Icons are entirely optional and slottable, keeping the component usable without any configuration while still allowing full customization.
- **Auto-committed build artifacts.** The minified file is committed directly to the repo (into `docs/`) rather than published to a registry. Distribution is via CDN links pointing at the GitHub Pages URL or the raw file.

---

## Getting Started

1. **Read `dark-mode-toggle.js` first.** It's the entire implementation in one file. Understand the constructor (Shadow DOM setup, stylesheet injection), `connectedCallback` (initial theme resolution), and the event wiring (`BroadcastChannel`, `storage`, `change`).

2. **Open `docs/index.html` in a browser** (or visit the GitHub Pages URL). It demonstrates every supported configuration — attribute strategy, class strategy, scoped roots, custom icons, disabled state, and event handling — making it the fastest way to see what the component can do.

3. **Check `README.md`** for the full attribute/property/event API reference and copy-paste integration examples for React and Svelte.

4. **Note the FOIT pattern** in `docs/index.html` (the inline `<script>` near the top of `<head>`). Any real application integrating this component should include an equivalent snippet before stylesheets load.

## Repository Statistics

- **Total files:** 5
- **Total lines:** 925

| Language | Files | Lines | % |
|----------|------:|------:|--:|
| JavaScript | 2 | 360 | 38.9% |
| Markdown | 1 | 274 | 29.6% |
| HTML | 1 | 252 | 27.2% |
| YAML | 1 | 39 | 4.2% |

## Documentation Library

- `README.md` — Project overview and getting started guide

## File Tree

```
dark-mode-toggle/
├── .github/
│   └── workflows/
│       └── minify-js.yml
├── README.md
├── dark-mode-toggle.js
└── docs/
    ├── dark-mode-toggle.min.js
    └── index.html
```
