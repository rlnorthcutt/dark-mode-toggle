Dark Mode Toggle Web ComponentA simple, self-contained, and stylable web component for adding a dark mode toggle to your website.This component automatically detects the user's system preference (prefers-color-scheme) and saves their choice in localStorage for future visits.UsageInclude the JavaScript file in your HTML page. It's best to place it at the end of the <body> or in the <head> with defer.<script src="dark-mode-toggle.js" defer></script>
Add the component tag where you want the toggle to appear.<dark-mode-toggle></dark-mode-toggle>
Set up your CSS to respond to the data-theme attribute that the component adds to the <html> tag./* 1. Light theme (default) */
:root {
    --bg-color: #f8f9fa;
    --text-color: #212529;
}

/* 2. Dark theme styles */
html[data-theme="dark"] {
    --bg-color: #212529;
    --text-color: #f8f9fa;
}

/* 3. Apply variables */
body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}
StylingYou can easily customize the appearance of the toggle from your own stylesheet by overriding its CSS variables.dark-mode-toggle {
    --track-width: 60px;
    --track-height: 30px;
    
    /* Light Mode Colors */
    --track-bg-light: #E9E9EA;
    --thumb-bg: white;
    --icon-sun-color: black;
    --icon-moon-color: #8E8E93;

    /* Dark Mode Colors */
    --track-bg-dark: #4D4D52;
    --thumb-bg-dark: #6E6E73;
    --icon-sun-color-inactive: #8E8E93;
    --icon-moon-color-active: white;
}
