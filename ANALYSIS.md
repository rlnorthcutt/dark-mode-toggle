# File Summaries

## [core] Core

### `dark-mode-toggle.js`

A dependency-free custom HTML element (`<dark-mode-toggle>`) that provides an accessible toggle switch for dark/light mode. It supports two theming strategies (data attribute or CSS class), persists user preference via localStorage, syncs across tabs using BroadcastChannel and storage events, and respects OS color scheme preference. The component uses Shadow DOM with constructable stylesheets and slottable SVG icons.

**Suggestions:**

- [!] **security:** The `root` attribute is passed directly to `document.querySelector()` without sanitization. A malicious or user-controlled attribute value could cause unexpected DOM traversal or errors. Validate the selector string (e.g., allow only simple selectors like `#id`, `.class`, or element names) before passing it to `querySelector`.
- [+] **improvement:** The `_onBC` handler only checks `e?.data?.type === 'themechange'` but does not validate that `e.data.mode` is one of the expected values (`'light'` or `'dark'`). Add explicit validation before calling `_applyFromExternal` to prevent unexpected state from malformed or spoofed BroadcastChannel messages.
- [>] **performance:** The MutationObserver (`this._mo`) is created in the constructor but its observed target and configuration are not shown. Ensure it is disconnected in `disconnectedCallback` to avoid memory leaks when the element is removed from the DOM.
- [+] **improvement:** The `localStorage` read/write calls are not wrapped in try/catch. In private browsing modes or when storage is blocked by browser policy, these calls throw a `SecurityError`, which would silently break persistence. Wrap all `localStorage` access in a try/catch with a graceful fallback.
- [d] **docs:** The inline usage comment mentions a FOUC mitigation snippet should be added to `<head>`, but no example is provided. Include a concrete, copy-pasteable pre-paint script snippet in the file header or a linked README so consumers can easily implement it.

---

## [build] Build

### `.github/workflows/minify-js.yml`

GitHub Actions workflow that automatically minifies `dark-mode-toggle.js` using Terser whenever it is pushed to the main branch. The minified output is written to `dist/dark-mode-toggle.min.js` and committed back to the repository using an auto-commit action. It can also be triggered manually via `workflow_dispatch`.

**Suggestions:**

- [!] **security:** Pin third-party actions (stefanzweifel/git-auto-commit-action@v5) to a specific commit SHA instead of a mutable tag to prevent supply chain attacks from tag reassignment.
- [+] **improvement:** Cache the npx/terser download using `actions/cache` or install terser as a dev dependency with a lockfile to make the workflow faster and more reproducible.
- [+] **improvement:** Add a sourcemap output flag (`--source-map`) to Terser so the minified file can be debugged in production browser devtools.
- [~] **refactor:** Consider generating a content hash or version in the minified filename (e.g., `dark-mode-toggle.min.js`) alongside a manifest file, to support cache-busting without requiring consumers to manually track changes.

---

## [docs] Docs

### `README.md`

Documentation for a lightweight, zero-dependency dark mode toggle web component. Covers installation, usage, attributes, CSS custom properties, slots, events, accessibility, and integration examples for frameworks like React and Svelte. Also includes build output descriptions and version history.

**Suggestions:**

- [d] **docs:** The version history table is truncated in the source — ensure the full changelog is preserved and visible in the rendered README.
- [+] **improvement:** Add a live demo link or screenshot/GIF near the top so users can quickly evaluate the component before reading the full documentation.
- [d] **docs:** The NPM install option uses a placeholder '@yourname/dark-mode-toggle' — replace with the actual published package name or remove the NPM section until it is published.

---

### `docs/dark-mode-toggle.min.js`

Minified source file for a Dark Mode Toggle web component (version 1.1.0) that renders a toggle button switching between light and dark themes. It uses Shadow DOM with scoped CSS, supports multiple strategies (CSS class or data-theme attribute), persists preference via localStorage, and syncs across tabs via BroadcastChannel and storage events. The component is published to the docs directory, likely for a GitHub Pages demo site.

**Suggestions:**

- [d] **docs:** Include an unminified source map or link to the unminified source alongside this file so contributors and debuggers can trace issues back to readable code.
- [+] **improvement:** The _state attribute is toggled off then immediately set, which causes two attribute mutations and two MutationObserver callbacks per apply; replace the toggleAttribute+setAttribute pair with a single setAttribute call.
- [!] **security:** Values read from localStorage and BroadcastChannel are used to set the theme without strict allowlist validation beyond simple equality checks; ensure all external inputs are validated against the exact set ['light', 'dark', 'auto'] before use to prevent unexpected state injection.
- [>] **performance:** The MutationObserver on the root element calls _reflectFromRoot on every attribute/class mutation, which could cause excessive re-renders on pages that frequently modify the root element; add a check to bail early if the relevant attribute or class has not actually changed.

---

### `docs/index.html`

Demo page for a dark-mode-toggle Web Component showcasing multiple usage patterns including attribute strategy, class strategy (Tailwind-style), scoped roots, custom icons, disabled state, and event handling. It includes a pre-paint inline script to prevent flash of incorrect theme before CSS loads. The page uses the Ivy classless CSS framework and serves as living documentation for the component.

**Suggestions:**

- [!] **security:** The pre-paint inline script catches localStorage errors silently with an empty catch block — add at minimum a no-op comment or log to prevent silent failures from masking storage quota or security errors in development.
- [>] **performance:** The Ivy CSS is loaded from a CDN (cdn.jsdelivr.net) with no integrity attribute; add a `crossorigin` and `integrity` (SRI hash) attribute to prevent supply-chain attacks and enable caching guarantees.
- [+] **improvement:** The component script path `./dist/dark-mode-toggle.min.js` uses a relative path that may break depending on how the docs are served; consider documenting or providing a CDN fallback with a commented example similar to the IIFE comment already present.
- [d] **docs:** Add a visible attribute/API reference table on the page listing all supported attributes (strategy, theme, root, dark-class, persist, disabled, label) so developers can use the demo page as a self-contained reference without needing the README.
- [+] **improvement:** The truncated portion of the file likely includes JS for the events demo; ensure the live-mode status bar script also listens for the `prefers-color-scheme` media query change event to reflect OS-level changes without requiring a page toggle.

---

