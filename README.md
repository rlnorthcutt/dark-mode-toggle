# 🌗 Dark Mode Toggle Web Component

A **lightweight**, **self-contained**, and **accessible** web component for toggling dark mode on your website.
It respects the user’s system preference (`prefers-color-scheme`), persists choices in `localStorage`, and updates instantly across tabs.

---

## 🚀 Features

* ⚡ **Zero dependencies** – native custom element, under 2KB minified.
* 🌓 **Automatic theme detection** (`light`, `dark`, or `auto` mode).
* 💾 **Persistent theme** using `localStorage`.
* 🔄 **Syncs across tabs** and OS theme changes.
* 🎨 **Fully customizable** via CSS variables or slots.
* ♿ **Accessible** with proper ARIA roles and keyboard support.
* 🔧 **Framework-agnostic** – works in plain HTML, React, Vue, Svelte, etc.

---

## 📦 Installation

### Option 1: Direct script include

```html
<script type="module" src="dark-mode-toggle.js"></script>
```

### Option 2: NPM (optional future support)

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
<!-- Include the script -->
<script type="module" src="dark-mode-toggle.js"></script>

<!-- Add the toggle to your page -->
<dark-mode-toggle theme="auto"></dark-mode-toggle>
```

Add this small inline script to your `<head>` to prevent the “flash of wrong theme” before the component initializes:

```html
<script>
  try {
    let t = localStorage.getItem('theme');
    if (!t && matchMedia('(prefers-color-scheme: dark)').matches) t = 'dark';
    if (t) document.documentElement.setAttribute('data-theme', 'dark');
  } catch(e) {}
</script>
```

---

## ⚙️ Attributes

| Attribute | Values                  | Default | Description                                                    |
| --------- | ----------------------- | ------- | -------------------------------------------------------------- |
| `theme`   | `auto`, `light`, `dark` | `auto`  | Determines the current mode. `auto` follows system preference. |

---

## 🎨 CSS Custom Properties

You can style every aspect of the toggle with CSS variables:

| Variable                    | Description                   | Default   |
| --------------------------- | ----------------------------- | --------- |
| `--track-width`             | Width of the toggle track     | `60px`    |
| `--track-height`            | Height of the toggle track    | `30px`    |
| `--track-bg-light`          | Background color (light mode) | `#E9E9EA` |
| `--track-bg-dark`           | Background color (dark mode)  | `#4D4D52` |
| `--thumb-bg`                | Thumb color (light mode)      | `white`   |
| `--thumb-bg-dark`           | Thumb color (dark mode)       | `#6E6E73` |
| `--icon-sun-color`          | Sun icon color (light mode)   | `black`   |
| `--icon-moon-color`         | Moon icon color (light mode)  | `#8E8E93` |
| `--icon-sun-color-inactive` | Sun icon color (dark mode)    | `#8E8E93` |
| `--icon-moon-color-active`  | Moon icon color (dark mode)   | `white`   |

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

You can replace the default sun/moon icons:

```html
<dark-mode-toggle>
  <svg slot="sun" viewBox="0 0 24 24">…</svg>
  <svg slot="moon" viewBox="0 0 24 24">…</svg>
</dark-mode-toggle>
```

---

## 🧠 Events

The component emits a `themechange` event whenever the theme updates:

```js
document.querySelector('dark-mode-toggle')
  .addEventListener('themechange', e => {
    console.log('Theme changed to:', e.detail.mode);
  });
```

---

## ♿ Accessibility

* Keyboard accessible (`Tab`, `Space`, `Enter`).
* Uses `aria-pressed` and `aria-label`.
* Compatible with `prefers-reduced-motion`.

---

## 🧰 Integration Examples

**In a framework:**

### React

```jsx
useEffect(() => import('dark-mode-toggle'), []);
return <dark-mode-toggle />;
```

### Svelte

```svelte
<script>
  import 'dark-mode-toggle';
</script>

<dark-mode-toggle />
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

## 📄 License

MIT License © Ron Northcutt
Feel free to fork, remix, and use commercially with attribution.

