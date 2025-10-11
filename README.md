# 🌗 Dark Mode Toggle Web Component

A **lightweight**, **self-contained**, and **accessible** web component for toggling dark mode on your website.
It supports both `data-theme` **and** `.dark` class strategies, respects the user’s system preference (`prefers-color-scheme`), persists choices in `localStorage`, and updates instantly across tabs — even within the same page.

---

## 🚀 Features

* ⚡ **Zero dependencies** – native Custom Element, ~2KB minified.
* 🌓 **Automatic theme detection** (`light`, `dark`, or `auto` mode).
* 💾 **Persistent user preference** using `localStorage` (optional).
* 🔄 **Syncs everywhere** – across tabs, same tab, and OS changes.
* 🎯 **Flexible strategies** – toggle `data-theme="dark"` or `.dark` class.
* 🧩 **Scoped control** – target any root element (`<html>`, `#app`, etc.).
* 🎨 **Fully customizable** with CSS variables or slotted icons.
* ♿ **Accessible** – `role="switch"`, `aria-checked`, keyboard support.
* 🌐 **Framework-agnostic** – works in plain HTML, React, Vue, Svelte, etc.

---

## 📦 Installation

### Option 1: Direct include

```html
<script type="module" src="dark-mode-toggle.js"></script>
```

### Option 2: NPM (optional)

```bash
npm install @yourname/dark-mode-toggle
```

Then:

```js
import 'dark-mode-toggle';
```

---

## 💡 Usage

```html
<!-- Include the component -->
<script type="module" src="dark-mode-toggle.js"></script>

<!-- Add the toggle to your page -->
<dark-mode-toggle theme="auto"></dark-mode-toggle>
```

The component automatically:

* Checks your OS theme,
* Applies stored user preference,
* Updates `<html data-theme="dark">` by default.

### 🧠 Tailwind users

If you’re using Tailwind with `darkMode: 'class'`, just switch strategy:

```html
<dark-mode-toggle strategy="class" theme="auto"></dark-mode-toggle>
```

---

## 🪄 Prevent the “flash of wrong theme”

Add this **inline script** in your `<head>` before loading CSS:

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

This prevents a white flash before JS runs by setting the correct `data-theme` or `.dark` class early.

---

## ⚙️ Attributes

| Attribute    | Values                  | Default     | Description                                                         |
| ------------ | ----------------------- | ----------- | ------------------------------------------------------------------- |
| `theme`      | `auto`, `light`, `dark` | `auto`      | Sets the current mode. `auto` follows stored value → OS preference. |
| `strategy`   | `attr`, `class`         | `attr`      | Whether to use `data-theme="dark"` or a `.dark` class toggle.       |
| `root`       | CSS selector            | `html`      | Root element to toggle (e.g. `#app` for scoped dark mode).          |
| `dark-class` | string                  | `dark`      | Class to add/remove when `strategy="class"`.                        |
| `persist`    | `off`                   | *(enabled)* | Disable persistence with `persist="off"`.                           |

---

## 🎨 CSS Custom Properties

You can customize the look with CSS variables:

| Variable                    | Description         | Default   |
| --------------------------- | ------------------- | --------- |
| `--track-width`             | Width of toggle     | `60px`    |
| `--track-height`            | Height of toggle    | `30px`    |
| `--track-bg-light`          | Track color (light) | `#E9E9EA` |
| `--track-bg-dark`           | Track color (dark)  | `#4D4D52` |
| `--thumb-bg`                | Thumb color (light) | `white`   |
| `--thumb-bg-dark`           | Thumb color (dark)  | `#6E6E73` |
| `--icon-sun-color`          | Sun icon (light)    | `black`   |
| `--icon-moon-color`         | Moon icon (light)   | `#8E8E93` |
| `--icon-sun-color-inactive` | Sun icon (dark)     | `#8E8E93` |
| `--icon-moon-color-active`  | Moon icon (dark)    | `white`   |

Example:

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

Replace the default sun/moon icons with your own:

```html
<dark-mode-toggle>
  <svg slot="sun" viewBox="0 0 24 24">…</svg>
  <svg slot="moon" viewBox="0 0 24 24">…</svg>
</dark-mode-toggle>
```

---

## 🧠 Events

The toggle dispatches two event types for easy integration.

**1. Element-level**

```js
document.querySelector('dark-mode-toggle')
  .addEventListener('change', e => {
    console.log('Toggled theme:', e.detail.mode);
  });
```

**2. Global (window-level)**

```js
window.addEventListener('themechange', e => {
  console.log('Theme changed globally to:', e.detail.mode);
});
```

Works across:

* Tabs (`localStorage` sync)
* Same-page components (`BroadcastChannel` + custom event)
* External mutations (if your app toggles classes or attributes directly)

---

## ♿ Accessibility

* Fully keyboard accessible (`Tab`, `Space`, `Enter`).
* Uses `role="switch"` and `aria-checked`.
* Automatically respects `prefers-reduced-motion`.
* Focus ring is visible and theme-aware.

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

**Scoped dark mode (custom root):**

```html
<div id="app">
  <p>Inside app container</p>
</div>

<dark-mode-toggle strategy="class" root="#app" dark-class="dark-mode"></dark-mode-toggle>
```

---

## 🧩 Multiple Toggles Stay in Sync

Place toggles anywhere (e.g. header/footer) — all stay synchronized automatically.

```html
<header><dark-mode-toggle></dark-mode-toggle></header>
<footer><dark-mode-toggle></dark-mode-toggle></footer>
```

---

## 🧪 Development

Clone and run locally:

```bash
git clone https://github.com/yourname/dark-mode-toggle.git
cd dark-mode-toggle
npm install
npm run dev
```

Then open `index.html` in your browser.

---

## 🧱 Build Output

* `dist/dark-mode-toggle.js` — full build
* `dist/dark-mode-toggle.min.js` — minified (auto-generated via workflow)
* `dark-mode-toggle.iife.min.js` — global script for `<script src=…>` usage

---

## 📄 License

MIT License © Ron Northcutt
Feel free to fork, remix, and use commercially with attribution.
