/**
 * DarkModeToggle Web Component
 *
 * A self-contained toggle switch for implementing a dark mode theme on a website.
 * It respects the user's OS-level color scheme preference and saves their
 * choice in localStorage for persistence.
 *
 * @element dark-mode-toggle
 * @cssprop --track-width - The width of the toggle track.
 * @cssprop --track-height - The height of the toggle track.
 * @cssprop --track-bg-light - Background color of the track in light mode.
 * @cssprop --thumb-bg - Background color of the sliding thumb in light mode.
 * @cssprop --icon-sun-color - Color of the sun icon in light mode.
 * @cssprop --icon-moon-color - Color of the moon icon in light mode.
 * @cssprop --track-bg-dark - Background color of the track in dark mode.
 * @cssprop --thumb-bg-dark - Background color of the sliding thumb in dark mode.
 * @cssprop --icon-sun-color-inactive - Color of the sun icon in dark mode.
 * @cssprop --icon-moon-color-active - Color of the moon icon in dark mode.
 */
class DarkModeToggle extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    vertical-align: middle;
                }

                .track {
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: space-around;
                    padding: 0 4px;
                    width: var(--track-width, 60px);
                    height: var(--track-height, 30px);
                    background-color: var(--track-bg-light, #E9E9EA);
                    border-radius: 30px;
                    position: relative;
                    transition: background-color 0.3s;
                }

                .thumb {
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: calc(var(--track-height, 30px) - 4px);
                    height: calc(var(--track-height, 30px) - 4px);
                    background-color: var(--thumb-bg, white);
                    border-radius: 50%;
                    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                }

                .icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: calc(var(--track-height, 30px) - 8px);
                    height: calc(var(--track-height, 30px) - 8px);
                    z-index: 1;
                    pointer-events: none;
                }
                
                .icon svg {
                    width: 100%;
                    height: 100%;
                    transition: fill 0.3s;
                }
                
                .sun svg {
                    fill: var(--icon-sun-color, black);
                }

                .moon svg {
                    fill: var(--icon-moon-color, #8E8E93);
                }

                #toggle-input {
                    display: none;
                }

                #toggle-input:checked + .track {
                    background-color: var(--track-bg-dark, #4D4D52);
                }

                #toggle-input:checked + .track .thumb {
                    transform: translateX(calc(var(--track-width, 60px) - var(--track-height, 30px)));
                    background-color: var(--thumb-bg-dark, #6E6E73);
                }
                
                #toggle-input:checked + .track .sun svg {
                    fill: var(--icon-sun-color-inactive, #8E8E93);
                }

                #toggle-input:checked + .track .moon svg {
                    fill: var(--icon-moon-color-active, white);
                }
            </style>

            <input type="checkbox" id="toggle-input" aria-label="Toggle dark mode">
            <label for="toggle-input" class="track">
                <span class="icon sun">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C12.8284 4.5 13.5 5.17157 13.5 6V7.5C13.5 8.32843 12.8284 9 12 9C11.1716 9 10.5 8.32843 10.5 7.5V6C10.5 5.17157 11.1716 4.5 12 4.5Z M12 15C12.8284 15 13.5 15.6716 13.5 16.5V18C13.5 18.8284 12.8284 19.5 12 19.5C11.1716 19.5 10.5 18.8284 10.5 18V16.5C10.5 15.6716 11.1716 15 12 15Z M18 10.5C18.8284 10.5 19.5 11.1716 19.5 12C19.5 12.8284 18.8284 13.5 18 13.5H16.5C15.6716 13.5 15 12.8284 15 12C15 11.1716 15.6716 10.5 16.5 10.5H18Z M7.5 10.5C8.32843 10.5 9 11.1716 9 12C9 12.8284 8.32843 13.5 7.5 13.5H6C5.17157 13.5 4.5 12.8284 4.5 12C4.5 11.1716 5.17157 10.5 6 10.5H7.5Z M16.2426 6.34315C16.8284 5.75736 17.7782 5.75736 18.364 6.34315C18.9497 6.92893 18.9497 7.87868 18.364 8.46447L17.2929 9.53553C16.7071 10.1213 15.7574 10.1213 15.1716 9.53553C14.5858 8.94975 14.5858 8.00000 15.1716 7.41421L16.2426 6.34315Z M6.34315 16.2426C6.92893 15.6569 7.87868 15.6569 8.46447 16.2426L9.53553 17.2929C10.1213 17.8787 10.1213 18.8284 9.53553 19.4142C8.94975 20.0000 8.00000 20.0000 7.41421 19.4142L6.34315 18.3640C5.75736 17.7782 5.75736 16.8284 6.34315 16.2426Z M8.46447 7.41421C7.87868 8.00000 6.92893 8.00000 6.34315 7.41421L5.27208 6.34315C4.68629 5.75736 4.68629 4.80761 5.27208 4.22183C5.85786 3.63604 6.80761 3.63604 7.39340 4.22183L8.46447 5.29289C9.05025 5.87868 9.05025 6.82843 8.46447 7.41421Z M16.2426 18.3640C16.8284 17.7782 17.7782 17.7782 18.3640 18.3640C18.9497 18.9497 18.9497 19.8995 18.3640 20.4853C17.7782 21.0711 16.8284 21.0711 16.2426 20.4853L15.1716 19.4142C14.5858 18.8284 14.5858 17.8787 15.1716 17.2929L16.2426 16.2426C16.8284 15.6569 17.7782 15.6569 18.3640 16.2426L16.2426 18.3640Z"/></svg>
                </span>
                <span class="icon moon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M11.5804 2.1508C7.5752 2.1508 4.30078 5.42522 4.30078 9.43041C4.30078 12.3333 6.03233 14.8643 8.65345 16.1002C9.04333 16.2901 9.48934 16.0343 9.61051 15.6175C9.73168 15.2007 9.49984 14.7439 9.08202 14.6335C7.22194 14.1338 5.80078 12.3643 5.80078 9.43041C5.80078 6.26249 8.41169 3.65158 11.5804 3.65158C14.7483 3.65158 17.3592 6.26249 17.3592 9.43041C17.3592 12.3382 15.9863 14.0934 14.1623 14.6217C13.7374 14.7436 13.5073 15.2019 13.6285 15.6187C13.7496 16.0355 14.2079 16.2895 14.6151 16.1002C17.1352 14.8996 18.8592 12.3832 18.8592 9.43041C18.8592 5.42522 15.5848 2.1508 11.5804 2.1508Z" clip-rule="evenodd"/></svg>
                </span>
                <span class="thumb"></span>
            </label>
        `;

        this.checkbox = this.shadowRoot.querySelector('#toggle-input');
        this.htmlEl = document.documentElement;
    }

    connectedCallback() {
        this.initTheme();
        this.checkbox.addEventListener('change', () => {
            const newTheme = this.checkbox.checked ? 'dark' : 'light';
            this.setTheme(newTheme);
        });
    }

    initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        this.setTheme(initialTheme);
    }

    setTheme(theme) {
        const isDark = theme === 'dark';
        if (isDark) {
            this.htmlEl.setAttribute('data-theme', 'dark');
        } else {
            this.htmlEl.removeAttribute('data-theme');
        }
        this.checkbox.checked = isDark;
        localStorage.setItem('theme', theme);
    }
}

customElements.define('dark-mode-toggle', DarkModeToggle);

