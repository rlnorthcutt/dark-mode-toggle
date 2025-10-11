<script>
/*!
 * Dark Mode Toggle Web Element
 * Version: 1.0.0
 * URL: https://github.com/rlnorthcutt/dark-mode-toggle
 * License: MIT (https://opensource.org/licenses/MIT)
 */

/** Usage:
 *  <dark-mode-toggle theme="auto|light|dark" strategy="attr|class" root="#app" dark-class="dark" persist="off"></dark-mode-toggle>
 *  - Default toggles html[data-theme="dark"] ("attr" strategy). Use strategy="class" for Tailwind-style .dark class.
 *  - Persists user choice to localStorage (key: "dm:theme") unless persist="off".
 *  - Respects OS preference and existing page state; syncs across tabs and same page.
 */

(() => {
  'use strict';

  /* ---------------- Icons (default slotted content; override via <svg slot="sun|moon">) ---------------- */
  const SUN_ICON = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.1 5.1c0 .3-.1.6-.3.9l-1.4 1.4-.9-.8 2.2-2.2c.3.1.4.4.4.7zm-.5 5.3h3.2c0 .3-.1.6-.4.9s-.5.4-.8.4h-2v-1.3zm-6.2-5V2.2c.3 0 .6.1.9.4s.4.5.4.8v2h-1.3zm6.4 11.7c-.3 0-.6-.1-.8-.3l-1.4-1.4.8-.8 2.2 2.2c-.2.2-.5.3-.8.3zM6.2 4.9c.3 0 .6.1.8.3l1.4 1.4-.8.9-2.2-2.3c.2-.2.5-.3.8-.3zm5.2 11.7h1.2v3.2c-.3 0-.6-.1-.9-.4s-.4-.5-.4-.8l.1-2zm-7-6.2h2v1.2H3.2c0-.3.1-.6.4-.9s.5-.3.8-.3zM6.2 16l1.4-1.4.8.8-2.2 2.2c-.2-.2-.3-.5-.3-.8s.1-.6.3-.8z"/>
      <circle cx="12" cy="11" r="4"/>
    </svg>
  `;
  const MOON_ICON = `
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M17.39 15.14A7.33 7.33 0 0 1 11.75 1.6c.23-.11.56-.23.79-.34a8.19 8.19 0 0 0-5.41.45 9 9 0 1 0 7 16.58 8.42 8.42 0 0 0 4.29-3.84 5.3 5.3 0 0 1-1.03.69z"/>
    </svg>
  `;

  /* ---------------- Template & Styles (single source; adoptedStyleSheets for perf) ---------------- */
  const TPL = document.createElement('template');
  TPL.innerHTML = `
    <button part="button" class="track" type="button" role="switch" aria-checked="false" aria-label="Toggle dark mode">
      <span class="icon sun" part="sun" aria-hidden="true"><slot name="sun">${SUN_ICON}</slot></span>
      <span class="icon moon" part="moon" aria-hidden="true"><slot name="moon">${MOON_ICON}</slot></span>
      <span class="thumb" part="thumb" aria-hidden="true"></span>
    </button>
  `;

  const CSS = `
    :host{display:inline-block;vertical-align:middle;color-scheme:light dark}
    .track{cursor:pointer;display:flex;align-items:center;justify-content:space-around;padding:0 4px;
      width:var(--track-width,60px);height:var(--track-height,30px);background:var(--track-bg-light,#E9E9EA);
      border-radius:30px;position:relative;border:0;outline:none;transition:background-color .25s ease}
    .track:focus-visible{outline:2px solid color-mix(in oklab, CanvasText 30%, transparent);outline-offset:2px}
    .thumb{position:absolute;top:2px;left:2px;width:calc(var(--track-height,30px) - 4px);height:calc(var(--track-height,30px) - 4px);
      background:var(--thumb-bg,#fff);border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,.2);
      transition:transform .25s cubic-bezier(.25,.46,.45,.94),background-color .25s ease}
    .icon{display:inline-flex;align-items:center;justify-content:center;
      width:calc(var(--track-height,30px) - 8px);height:calc(var(--track-height,30px) - 8px);pointer-events:none;z-index:1}
    .icon svg{width:100%;height:100%;fill:currentColor;transition:color .25s ease,fill .25s ease}
    .sun{color:var(--icon-sun-color,#000)}
    .moon{color:var(--icon-moon-color,#8E8E93)}
    :host([_state="dark"]) .track{background:var(--track-bg-dark,#4D4D52)}
    :host([_state="dark"]) .thumb{transform:translateX(calc(var(--track-width,60px) - var(--track-height,30px)));background:var(--thumb-bg-dark,#6E6E73)}
    :host([_state="dark"]) .sun{color:var(--icon-sun-color-inactive,#8E8E93)}
    :host([_state="dark"]) .moon{color:var(--icon-moon-color-active,#fff)}
    @media (prefers-reduced-motion:reduce){.thumb,.track,.icon svg{transition:none}}
  `;
  const sheet = new CSSStyleSheet(); sheet.replaceSync(CSS);

  /* ---------------- Constants / helpers ---------------- */
  const KEY = 'dm:theme';                             // localStorage key
  const CH_NAME = KEY;                                // BroadcastChannel name
  const MQ = matchMedia('(prefers-color-scheme: dark)');
  const isDarkOS = () => MQ.matches;
  const getRoot = (sel) => (sel && sel !== 'html') ? (document.querySelector(sel) || document.documentElement) : document.documentElement;

  // Cross-context channel (same-tab sync). Optional in older browsers.
  let bc; try { bc = new BroadcastChannel(CH_NAME); } catch {}

  /* ---------------- Custom Element ---------------- */
  class DarkModeToggle extends HTMLElement {
    // Observed attributes form the public API (minifier-safe surface)
    static get observedAttributes() { return ['theme','strategy','root','dark-class','persist']; }

    constructor(){
      super();
      // Shadow DOM for encapsulated template/styles; delegatesFocus for nicer keyboard UX
      const root = this.attachShadow({ mode:'open', delegatesFocus:true });
      root.adoptedStyleSheets = [sheet];
      root.appendChild(TPL.content.cloneNode(true));

      // Cache references / pre-bind handlers to avoid re-allocations
      this._btn = root.querySelector('button');
      this._mo = new MutationObserver(() => this._reflectFromRoot());
      this._onClick = this._onClick.bind(this);
      this._onKey = this._onKey.bind(this);
      this._onStorage = this._onStorage.bind(this);
      this._onMQ = () => this._apply();
      this._onBC = (e) => { if (e?.data?.type === 'themechange') this._applyFromExternal(e.data.mode); };
    }

    /* ---- Lifecycle ---- */
    connectedCallback(){
      // Attribute defaults (kept on element so they’re observable and serializable)
      if (!this.hasAttribute('theme')) this.setAttribute('theme','auto');
      if (!this.hasAttribute('strategy')) this.setAttribute('strategy','attr'); // 'attr'|'class'
      if (!this.hasAttribute('dark-class')) this.setAttribute('dark-class','dark');

      // Event wiring
      this._btn.addEventListener('click', this._onClick);
      this._btn.addEventListener('keydown', this._onKey);
      window.addEventListener('storage', this._onStorage);
      MQ.addEventListener?.('change', this._onMQ);
      bc?.addEventListener?.('message', this._onBC);

      // Initial resolve prefers: stored → existing root state → OS
      this._initFromRootOrStorage();
      this._apply();
      this._observeRoot(true);
    }

    disconnectedCallback(){
      this._btn.removeEventListener('click', this._onClick);
      this._btn.removeEventListener('keydown', this._onKey);
      window.removeEventListener('storage', this._onStorage);
      MQ.removeEventListener?.('change', this._onMQ);
      bc?.removeEventListener?.('message', this._onBC);
      this._observeRoot(false);
    }

    attributeChangedCallback(){ this._apply(); }

    /* ---- Public API (properties mirror attributes) ---- */
    get theme(){ return (this.getAttribute('theme') || 'auto').toLowerCase(); }
    set theme(v){ this.setAttribute('theme', v); }

    get strategy(){ return (this.getAttribute('strategy') || 'attr').toLowerCase(); }
    get rootSelector(){ return this.getAttribute('root') || 'html'; }
    get darkClass(){ return this.getAttribute('dark-class') || 'dark'; }
    get persist(){ return this.getAttribute('persist') !== 'off'; }

    /* ---- Event handlers ---- */
    _onClick(){
      const next = this._current() === 'dark' ? 'light' : 'dark';
      this.theme = next; // user intent overrides auto
      if (this.persist) { try { localStorage.setItem(KEY, next); } catch {} }
      this._broadcast(next);
      this._apply();
    }
    _onKey(e){ if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); this._onClick(); } }
    _onStorage(e){ if (e.key === KEY) this.theme = e.newValue ?? 'auto'; }

    /* ---- Resolve effective mode ---- */
    _current(){
      const attr = this.theme;
      if (attr === 'light' || attr === 'dark') return attr;

      // Prefer stored choice if present
      try {
        const stored = localStorage.getItem(KEY);
        if (stored === 'light' || stored === 'dark') return stored;
      } catch {}

      // Respect pre-existing page state (SSR/early script)
      const root = getRoot(this.rootSelector);
      if (this.strategy === 'class') {
        if (root.classList.contains(this.darkClass)) return 'dark';
      } else if (root.getAttribute('data-theme') === 'dark') {
        return 'dark';
      }

      // Fallback to OS
      return isDarkOS() ? 'dark' : 'light';
    }

    /* ---- Apply effective mode to DOM (single write path) ---- */
    _apply(){
      const mode = this._current();

      // Reflect internal state for component styling + a11y
      this.toggleAttribute('_state', false);
      this.setAttribute('_state', mode);
      this._btn.setAttribute('aria-checked', String(mode === 'dark'));

      // Flip root class/attr depending on strategy
      const root = getRoot(this.rootSelector);
      if (this.strategy === 'class') {
        root.classList.toggle(this.darkClass, mode === 'dark');
        if (root === document.documentElement) document.documentElement.removeAttribute('data-theme');
      } else {
        if (mode === 'dark') root.setAttribute('data-theme','dark'); else root.removeAttribute('data-theme');
        root.classList.remove(this.darkClass);
      }

      // Hint UA widgets (form controls) for correct rendering
      if (root === document.documentElement) document.documentElement.style.colorScheme = mode;

      // Element-level change event for local listeners
      this.dispatchEvent(new CustomEvent('change', { detail:{ mode } }));
    }

    /* ---- Cross-context sync ---- */
    _broadcast(mode){
      // Same-tab + other tabs
      try { bc?.postMessage({ type:'themechange', mode }); } catch {}
      window.dispatchEvent(new CustomEvent('themechange', { detail:{ mode } }));
    }
    _applyFromExternal(mode){
      if (mode === 'light' || mode === 'dark') {
        this.theme = mode;
        if (this.persist) { try { localStorage.setItem(KEY, mode); } catch {} }
      }
      this._apply();
    }

    /* ---- Respect existing state on load; optionally persist ---- */
    _initFromRootOrStorage(){
      const root = getRoot(this.rootSelector);
      let found = null;
      if (this.strategy === 'class') {
        if (root.classList.contains(this.darkClass)) found = 'dark';
      } else {
        if (root.getAttribute('data-theme') === 'dark') found = 'dark';
      }
      if (found && this.persist) { try { localStorage.setItem(KEY, found); } catch {} }
    }

    /* ---- Observe external toggles on the root, reflect when theme="auto" ---- */
    _observeRoot(enable){
      const root = getRoot(this.rootSelector);
      if (!root) return;
      if (enable) {
        this._mo.observe(root, { attributes:true, attributeFilter: this.strategy === 'class' ? ['class'] : ['data-theme'] });
      } else {
        this._mo.disconnect();
      }
    }
    _reflectFromRoot(){
      if (this.theme !== 'auto') return;
      const root = getRoot(this.rootSelector);
      const externalDark = this.strategy === 'class'
        ? root.classList.contains(this.darkClass)
        : root.getAttribute('data-theme') === 'dark';

      this.setAttribute('_state', externalDark ? 'dark' : 'light');
      this._btn.setAttribute('aria-checked', String(externalDark));
      if (root === document.documentElement) document.documentElement.style.colorScheme = externalDark ? 'dark' : 'light';
    }
  }

  /* ---------------- Register element ---------------- */
  customElements.define('dark-mode-toggle', DarkModeToggle);
})();
</script>
