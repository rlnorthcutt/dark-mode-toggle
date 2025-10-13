# 🌗 Dark Mode Toggle Web Component

A **lightweight**, **self-contained**, and **accessible** web component for toggling dark mode on any website or app.
It supports both `data-theme` **and** `.dark` class strategies, honors the user’s system preference (`prefers-color-scheme`), persists user choices via `localStorage`, and keeps all instances synchronized — across tabs, windows, and even within the same page.

---

## 🚀 Features

* ⚡ **Zero dependencies** — pure native Web Component (~2 KB minified).
* 🌓 **Automatic theme detection** (`light`, `dark`, or `auto`).
* 💾 **Persistent preference** via `localStorage` (optional).
* 🔄 **Syncs everywhere** — across tabs, same page, and OS preference changes.
* 🎯 **Flexible strategies** — toggle `data-theme="dark"` or a `.dark` class.
* 🧩 **Scoped control** — target any root element (`<html>`, `#app`, etc.).
* 🎨 **Customizable** — use CSS variables or slotted icons.
* ♿ **Accessible** — `role="switch"`, `aria-checked`, keyboard support, focus-visible.
* 🌐 **Framework-agnostic** — works in plain HTML, React, Vue, Svelte, etc.
* 🪶 **Color-scheme aware** — sets `color-scheme` on both the root and `<html>` for accurate native UI rendering.

---

## 📦 Installation

### Option 1 – Direct include

```html
<script type="module" src="dark-mode-toggle.js"></script>
```

### Option 2 – NPM (optional)

```bash
npm install @yourname/dark-mode-toggle
```

Then:

```js
import 'dark-mode-toggle';
```

---

## 💡 Basic Usage

```html
<!-- Include the component -->
<script type="module" src="dark-mode-toggle.js"></script>

<!-- Add the toggle -->
<dark-mode-toggle theme="auto"></dark-mode-toggle>
```

The component automatically:

* Reads the user’s OS and stored theme preference,
* Applies the correct mode to `<html data-theme="dark">`,
* Updates the color scheme for consistent rendering.

---

### 🧠 Tailwind Users

If you’re using Tailwind with `darkMode: 'class'`, switch strategy:

```html
<dark-mode-toggle strategy="class" theme="auto"></dark-mode-toggle>
```

---

## ⚡ Prevent the “flash of wrong theme”

Place this inline script **before CSS loads** in your `<head>`:

```html
<script>
/*! Dark mode prepaint */
(() => {
  const KEY = 'dm:theme';
  const root = document.documentElement;
  const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
  let mode;
  try { mode = localStorage.getItem(KEY); } catch {}
  if (!mode) mode = (root.getAttribute('data-theme')==='dark'||root.classList.contains('dark'))?'dark':null;
  if (!mode) mode = prefersDark ? 'dark' : 'light';
  root.style.colorScheme = mode;
  if (mode === 'dark') root.setAttribute('data-theme','dark');
})();
</script>
```

This prevents a white flash by applying the correct theme before paint.

---

## ⚙️ Attributes

| Attribute    | Values                  | Default            | Description                                                  |
| ------------ | ----------------------- | ------------------ | ------------------------------------------------------------ |
| `theme`      | `auto`, `light`, `dark` | `auto`             | Sets mode. `auto` follows stored → existing → OS preference. |
| `strategy`   | `attr`, `class`         | `attr`             | Use `data-theme="dark"` or a `.dark` class toggle.           |
| `root`       | CSS selector            | `html`             | Root element to toggle (e.g., `#app` for scoped dark mode).  |
| `dark-class` | string                  | `dark`             | Class name used when `strategy="class"`.                     |
| `persist`    | `off`                   | *(enabled)*        | Disable persistence with `persist="off"`.                    |
| `label`      | string                  | `Toggle dark mode` | Custom accessible label (`aria-label`).                      |
| `disabled`   | boolean                 | —                  | Disables interactions (`aria-disabled="true"`).              |

---

## 🎨 CSS Custom Properties

| Variable                    | Description            | Default   |
| --------------------------- | ---------------------- | --------- |
| `--track-width`             | Toggle width           | `60px`    |
| `--track-height`            | Toggle height          | `30px`    |
| `--track-bg-light`          | Track color (light)    | `#E9E9EA` |
| `--track-bg-dark`           | Track color (dark)     | `#4D4D52` |
| `--thumb-bg`                | Thumb color (light)    | `white`   |
| `--thumb-bg-dark`           | Thumb color (dark)     | `#6E6E73` |
| `--icon-sun-color`          | Sun icon (light mode)  | `black`   |
| `--icon-moon-color`         | Moon icon (light mode) | `#8E8E93` |
| `--icon-sun-color-inactive` | Sun icon (dark mode)   | `#8E8E93` |
| `--icon-moon-color-active`  | Moon icon (dark mode)  | `white`   |

**Example**

```css
dark-mode-toggle {
  --track-width: 70px;
  --track-bg-light: #ddd;
  --track-bg-dark: #333;
  --thumb-bg: #fff;
  --thumb-bg-dark: #666;
}
```

---

## 🧩 Slots (Custom Icons)

You can override the built-in icons via slots:

```html
<dark-mode-toggle>
  <svg slot="sun" viewBox="0 0 24 24">…</svg>
  <svg slot="moon" viewBox="0 0 24 24">…</svg>
</dark-mode-toggle>
```

---

## 🧠 Events

### 1️⃣ Element-level

```js
document.querySelector('dark-mode-toggle')
  .addEventListener('change', e => {
    console.log('Theme toggled to:', e.detail.mode);
  });
```

### 2️⃣ Global (window-level)

```js
window.addEventListener('themechange', e => {
  console.log('Theme changed globally:', e.detail.mode);
});
```

Events propagate when:

* Another tab toggles (via `localStorage` sync)
* Another toggle on the same page changes (via `BroadcastChannel`)
* The OS preference flips (`prefers-color-scheme`)
* Your app directly modifies `data-theme` or `.dark`

---

## ♿ Accessibility

* Fully keyboard accessible (`Tab`, `Space`, `Enter`).
* Uses proper `role="switch"`, `aria-checked`, and `aria-disabled`.
* Honors `prefers-reduced-motion` for smooth UX.
* Auto color-scheme alignment ensures native scrollbars and form controls match.
* Visible, theme-aware focus outline.

---

## 🧰 Integration Examples

**React**

```jsx
useEffect(() => import('dark-mode-toggle'), []);
return <dark-mode-toggle strategy="class" theme="auto" />;
```

**Svelte**

```svelte
<script>
  import 'dark-mode-toggle';
</script>

<dark-mode-toggle theme="auto" />
```

**Scoped Dark Mode**

```html
<div id="app">
  <p>Inside app container</p>
</div>

<dark-mode-toggle strategy="class" root="#app" dark-class="dark-mode"></dark-mode-toggle>
```

---

## 🔁 Multiple Toggles Stay in Sync

All toggles share a single state across:

* Multiple instances on one page
* Multiple open tabs/windows

```html
<header><dark-mode-toggle></dark-mode-toggle></header>
<footer><dark-mode-toggle></dark-mode-toggle></footer>
```

---

## 🧪 Development

```bash
git clone https://github.com/yourname/dark-mode-toggle.git
cd dark-mode-toggle
npm install
npm run dev
```

Then open `index.html` in your browser.

---

## 🧱 Build Output

| File                           | Description                                  |
| ------------------------------ | -------------------------------------------- |
| `dist/dark-mode-toggle.js`     | ES module build                              |
| `dist/dark-mode-toggle.min.js` | Minified build (auto-generated via workflow) |
| `dark-mode-toggle.iife.min.js` | IIFE build for direct `<script src>` use     |

---

## 🧩 Version History

| Version   | Highlights                                                                                                                                                                  |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1.1.0** | Added `disabled` + `label` attributes, improved vertical centering, color-scheme sync to scoped root, observer re-wire when `strategy` or `root` changes, and small polish. |
| **1.0.1** | Explicitly sets both `data-theme="dark"` / `light`, color-scheme hint, a11y and broadcast improvements.                                                                     |
| **1.0.0** | Initial release.                                                                                                                                                            |

---

## 📄 License

**MIT License** © Ron Northcutt
Free for personal + commercial use. Attribution appreciated!
