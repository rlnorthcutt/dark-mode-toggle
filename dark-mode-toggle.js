// <dark-mode-toggle theme="auto|light|dark">  (default: auto)
// Adds/removes data-theme="dark" on <html> and persists user choice.
// Lightweight, accessible, and syncs across tabs.

(() => {
  const TPL = document.createElement('template');
  TPL.innerHTML = `
    <button part="button" class="track" type="button" aria-pressed="false" aria-label="Toggle dark mode">
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
      background:var(--track-bg-light,#E9E9EA);border-radius:30px;position:relative;
      border:0;outline:none;
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

  const STORAGE_KEY = 'theme'; // 'light' | 'dark' | null (auto)
  const isDarkOS = () => matchMedia('(prefers-color-scheme: dark)').matches;

  class DarkModeToggle extends HTMLElement {
    static get observedAttributes() { return ['theme']; } // public API: auto|light|dark
    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open', delegatesFocus: true });
      root.adoptedStyleSheets = [sheet];
      root.appendChild(TPL.content.cloneNode(true));

      this._btn = root.querySelector('button');
      this._onClick = this._onClick.bind(this);
      this._onKey = this._onKey.bind(this);
      this._onStorage = this._onStorage.bind(this);
      this._mq = matchMedia('(prefers-color-scheme: dark)');
      this._onMQ = () => this._apply(); // react in auto mode
    }

    connectedCallback() {
      // Initialize from attribute -> storage -> OS
      if (!this.hasAttribute('theme')) this.setAttribute('theme', 'auto');
      this._btn.addEventListener('click', this._onClick);
      this._btn.addEventListener('keydown', this._onKey);
      window.addEventListener('storage', this._onStorage);
      this._mq.addEventListener?.('change', this._onMQ);
      this._apply();
    }

    disconnectedCallback() {
      this._btn.removeEventListener('click', this._onClick);
      this._btn.removeEventListener('keydown', this._onKey);
      window.removeEventListener('storage', this._onStorage);
      this._mq.removeEventListener?.('change', this._onMQ);
    }

    attributeChangedCallback(name) {
      if (name === 'theme') this._apply();
    }

    // Public API
    get theme(){ return this.getAttribute('theme') || 'auto'; }
    set theme(v){ this.setAttribute('theme', v); }

    _onClick() {
      const current = this._current();
      const next = current === 'dark' ? 'light' : 'dark';
      // user overrides -> set attribute away from auto
      this.theme = next;
      try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      this._apply();
    }

    _onKey(e){
      if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); this._onClick(); }
    }

    _onStorage(e){
      if (e.key === STORAGE_KEY){
        // If another tab changed it, reflect here; keep attribute coherent.
        const val = e.newValue; // 'light' | 'dark' | null
        this.theme = val ?? 'auto';
      }
    }

    _current(){
      // Resolve effective theme given attribute + storage + OS
      const attr = (this.getAttribute('theme') || 'auto').toLowerCase();
      if (attr === 'light' || attr === 'dark') return attr;
      // theme="auto": prefer explicit storage if present, else OS
      try{
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') return stored;
      }catch{}
      return isDarkOS() ? 'dark' : 'light';
    }

    _apply(){
      const mode = this._current();
      // Reflect internal state for CSS
      this.toggleAttribute('_state', false); // clear
      this.setAttribute('_state', mode);
      // Update button pressed for a11y
      this.shadowRoot.querySelector('button')?.setAttribute('aria-pressed', String(mode === 'dark'));
      // Update root attribute
      const html = document.documentElement;
      if (mode === 'dark') html.setAttribute('data-theme','dark');
      else html.removeAttribute('data-theme');
    }
  }

  customElements.define('dark-mode-toggle', DarkModeToggle);
})();
