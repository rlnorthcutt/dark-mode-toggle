/*!
 * Dark Mode Toggle Web Element
 * Version: 1.0.0
 * URL: https://github.com/rlnorthcutt/dark-mode-toggle
 * License: MIT (https://opensource.org/licenses/MIT)
 */

/** Usage):
 *  - dark-mode-toggle theme="auto|light|dark">  (default: auto)
 *  Adds/removes data-theme="dark" on <html> and persists user choice.
 *  Lightweight, accessible, and syncs across tabs. 
 */

<script>
(() => {
  const TPL = document.createElement('template');
  TPL.innerHTML = `
    <button part="button" class="track" type="button" role="switch" aria-checked="false" aria-label="Toggle dark mode">
      <span class="icon sun" part="sun" aria-hidden="true">
        <slot name="sun">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5a1.5 1.5 0 0 1 1.5 1.5v1.5a1.5 1.5 0 1 1-3 0V6A1.5 1.5 0 0 1 12 4.5Zm0 10.5a1.5 1.5 0 0 1 1.5 1.5V18a1.5 1.5 0 1 1-3 0v-1.5A1.5 1.5 0 0 1 12 15ZM18 10.5A1.5 1.5 0 0 1 19.5 12 1.5 1.5 0 0 1 18 13.5H16.5A1.5 1.5 0 0 1 15 12a1.5 1.5 0 0 1 1.5-1.5H18ZM7.5 10.5A1.5 1.5 0 0 1 9 12a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 12 1.5 1.5 0 0 1 6 10.5h1.5Z"/></svg>
        </slot>
      </span>
      <span class="icon moon" part="moon" aria-hidden="true">
        <slot name="moon">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M11.58 2.151a7.28 7.28 0 1 0 7.279 7.279A7.279 7.279 0 0 0 11.58 2.151Z" clip-rule="evenodd"/></svg>
        </slot>
      </span>
      <span class="thumb" part="thumb" aria-hidden="true"></span>
    </button>
  `;

  const CSS = `
    :host { display:inline-block; vertical-align:middle; color-scheme: light dark; }
    .track{cursor:pointer;display:flex;align-items:center;justify-content:space-around;padding:0 4px;
      width:var(--track-width,60px);height:var(--track-height,30px);
      background:var(--track-bg-light,#E9E9EA);border-radius:30px;position:relative;border:0;outline:none;
      transition: background-color .25s ease;
    }
    .track:focus-visible{ outline:2px solid color-mix(in oklab, CanvasText 30%, transparent); outline-offset:2px; }
    .thumb{position:absolute;top:2px;left:2px;width:calc(var(--track-height,30px) - 4px);height:calc(var(--track-height,30px) - 4px);
      background:var(--thumb-bg,white);border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,.2);
      transition: transform .25s cubic-bezier(.25,.46,.45,.94), background-color .25s ease;
    }
    .icon{display:inline-flex;align-items:center;justify-content:center;
      width:calc(var(--track-height,30px) - 8px);height:calc(var(--track-height,30px) - 8px);
      pointer-events:none; z-index:1;
    }
    .icon svg{width:100%;height:100%;fill:currentColor; transition: color .25s ease, fill .25s ease;}
    .sun{ color: var(--icon-sun-color, #000); }
    .moon{ color: var(--icon-moon-color, #8E8E93); }

    :host([_state="dark"]) .track{ background:var(--track-bg-dark,#4D4D52); }
    :host([_state="dark"]) .thumb{ transform: translateX(calc(var(--track-width,60px) - var(--track-height,30px))); background:var(--thumb-bg-dark,#6E6E73);}
    :host([_state="dark"]) .sun{ color: var(--icon-sun-color-inactive,#8E8E93);}
    :host([_state="dark"]) .moon{ color: var(--icon-moon-color-active,#fff);}

    @media (prefers-reduced-motion: reduce){
      .thumb, .track, .icon svg{ transition:none }
    }
  `;

  const sheet = new CSSStyleSheet();
  sheet.replaceSync(CSS);

  const STORAGE_KEY = 'dm:theme'; // 'light' | 'dark' | 'auto'
  const MQ = matchMedia('(prefers-color-scheme: dark)');
  const isDarkOS = () => MQ.matches;

  // Cross-context channel (same-tab + other tabs)
  const CH_NAME = 'dm:theme';
  let bc;
  try { bc = new BroadcastChannel(CH_NAME); } catch {}

  function getRoot(sel) {
    if (!sel || sel === 'html') return document.documentElement;
    const el = document.querySelector(sel);
    return el || document.documentElement;
  }

  class DarkModeToggle extends HTMLElement {
    static get observedAttributes() {
      return ['theme','strategy','root','dark-class','persist'];
    }
    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open', delegatesFocus: true });
      root.adoptedStyleSheets = [sheet];
      root.appendChild(TPL.content.cloneNode(true));

      this._btn = root.querySelector('button');
      this._onClick = this._onClick.bind(this);
      this._onKey = this._onKey.bind(this);
      this._onStorage = this._onStorage.bind(this);
      this._onMQ = () => this._apply(); // react in auto mode
      this._onBC = (e) => { if (e?.data?.type === 'themechange') this._applyFromExternal(e.data.mode); };

      // Observe external toggles on the root (class or attribute)
      this._mo = new MutationObserver(() => this._reflectFromRoot());
    }

    connectedCallback() {
      if (!this.hasAttribute('theme')) this.setAttribute('theme', 'auto');
      if (!this.hasAttribute('strategy')) this.setAttribute('strategy', 'attr'); // 'attr' | 'class'
      if (!this.hasAttribute('dark-class')) this.setAttribute('dark-class', 'dark');

      this._btn.addEventListener('click', this._onClick);
      this._btn.addEventListener('keydown', this._onKey);
      window.addEventListener('storage', this._onStorage);
      MQ.addEventListener?.('change', this._onMQ);
      bc?.addEventListener?.('message', this._onBC);

      // Initialize from existing root state if present
      this._initFromRootOrStorage();
      this._apply();

      // Start observing the root for outside changes
      this._observeRoot(true);
    }

    disconnectedCallback() {
      this._btn.removeEventListener('click', this._onClick);
      this._btn.removeEventListener('keydown', this._onKey);
      window.removeEventListener('storage', this._onStorage);
      MQ.removeEventListener?.('change', this._onMQ);
      bc?.removeEventListener?.('message', this._onBC);
      this._observeRoot(false);
    }

    attributeChangedCallback() { this._apply(); }

    // Public API
    get theme(){ return (this.getAttribute('theme') || 'auto').toLowerCase(); }
    set theme(v){ this.setAttribute('theme', v); }

    get strategy(){ return (this.getAttribute('strategy') || 'attr').toLowerCase(); } // 'attr' | 'class'
    get rootSelector(){ return this.getAttribute('root') || 'html'; }
    get darkClass(){ return this.getAttribute('dark-class') || 'dark'; }
    get persist(){ return this.getAttribute('persist') !== 'off'; }

    _onClick() {
      const next = this._current() === 'dark' ? 'light' : 'dark';
      this.theme = next; // user override (away from auto)
      if (this.persist) { try { localStorage.setItem(STORAGE_KEY, next); } catch {} }
      this._broadcast(next);
      this._apply();
    }

    _onKey(e){
      if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); this._onClick(); }
    }

    _onStorage(e){
      if (e.key === STORAGE_KEY){
        // reflect storage change (including clear -> null)
        const val = e.newValue; // 'light' | 'dark' | null
        this.theme = val ?? 'auto';
      }
    }

    _broadcast(mode){
      // Same-tab + other tabs
      try { bc?.postMessage({ type:'themechange', mode }); } catch {}
      window.dispatchEvent(new CustomEvent('themechange', { detail: { mode } }));
    }

    _current(){
      // Resolve effective theme
      const attr = this.theme; // 'auto'|'light'|'dark'
      if (attr === 'light' || attr === 'dark') return attr;

      // auto: prefer storage if present
      try{
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') return stored;
      }catch{}

      // then infer from root (attr/class) if page already set something
      const root = getRoot(this.rootSelector);
      if (this.strategy === 'class') {
        if (root.classList.contains(this.darkClass)) return 'dark';
      } else {
        if (root.getAttribute('data-theme') === 'dark') return 'dark';
      }

      // fallback to OS
      return isDarkOS() ? 'dark' : 'light';
    }

    _apply(){
      const mode = this._current();
      // Reflect internal state for CSS
      this.toggleAttribute('_state', false);
      this.setAttribute('_state', mode);

      // A11y state
      this._btn.setAttribute('aria-checked', String(mode === 'dark'));

      // Update root attribute/class + color-scheme
      const root = getRoot(this.rootSelector);
      if (this.strategy === 'class') {
        root.classList.toggle(this.darkClass, mode === 'dark');
        // Clear data-theme if we’re using class strategy (avoid conflicts)
        if (root !== document.documentElement) {
          // no-op
        } else {
          document.documentElement.removeAttribute('data-theme');
        }
      } else {
        if (mode === 'dark') root.setAttribute('data-theme','dark');
        else root.removeAttribute('data-theme');
        // Also ensure we don't accidentally leave a leftover class
        root.classList.remove(this.darkClass);
      }

      // Hint UA widgets
      if (root === document.documentElement) {
        document.documentElement.style.colorScheme = mode;
      }

      // Fire a lightweight event for consumers
      this.dispatchEvent(new CustomEvent('change', { detail: { mode } }));
    }

    _applyFromExternal(mode){
      // External signal prefers explicit mode; keep attribute coherent unless user chose auto explicitly
      if (mode === 'light' || mode === 'dark') {
        this.theme = mode;
        if (this.persist) { try { localStorage.setItem(STORAGE_KEY, mode); } catch {} }
      }
      this._apply();
    }

    _initFromRootOrStorage(){
      // If page already set a theme (via SSR, early script, or CSS), prefer that signal
      const root = getRoot(this.rootSelector);
      let found;
      if (this.strategy === 'class') {
        found = root.classList.contains(this.darkClass) ? 'dark' : null;
      } else {
        found = root.getAttribute('data-theme') === 'dark' ? 'dark' : null;
      }
      if (found) {
        // keep 'auto' but reflect effective dark/light through storage (optional)
        if (this.persist) { try { localStorage.setItem(STORAGE_KEY, found); } catch {} }
      }
    }

    _observeRoot(enable){
      const root = getRoot(this.rootSelector);
      if (!root) return;
      if (enable) {
        this._mo.observe(root, { attributes: true, attributeFilter: this.strategy === 'class'
          ? ['class'] : ['data-theme'] });
      } else {
        this._mo.disconnect();
      }
    }

    _reflectFromRoot(){
      const root = getRoot(this.rootSelector);
      const externalDark = this.strategy === 'class'
        ? root.classList.contains(this.darkClass)
        : root.getAttribute('data-theme') === 'dark';

      // Only reflect when in auto (so external systems can drive the UI)
      if (this.theme === 'auto') {
        this.setAttribute('_state', externalDark ? 'dark' : 'light');
        this._btn.setAttribute('aria-checked', String(externalDark));
        if (root === document.documentElement) {
          document.documentElement.style.colorScheme = externalDark ? 'dark' : 'light';
        }
      }
    }
  }

  customElements.define('dark-mode-toggle', DarkModeToggle);
})();
</script>
