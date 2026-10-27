// Global header behavior: theme toggle + fixed header that hides on mobile while scrolling down.
// shared/partials/head.html applies a saved "light" theme before the first paint (no flash).
// Pages load this file directly (no sync needed); tools/build.mjs bundles it in dist/.

(() => {
    const root = document.documentElement;
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;

    // --- Theme: dark by default, light on request, remembered -------------------

    const KEY = 'itstfs-theme';
    const COLORS = { dark: '#0e0e13', light: '#fafafc' };
    const button = topbar.querySelector('[data-theme-toggle]');
    const label = button.querySelector('.theme-toggle__label');
    const icons = button.querySelectorAll('[data-theme-icon]');
    const meta = document.querySelector('meta[name="theme-color"]');

    const currentTheme = () => (root.dataset.theme === 'light' ? 'light' : 'dark');

    // The button always offers the other theme: its text names the action.
    const renderTheme = (theme) => {
        if (theme === 'light') {
            root.dataset.theme = 'light';
        } else {
            delete root.dataset.theme;
        }
        const next = theme === 'light' ? 'dark' : 'light';
        label.textContent = next === 'light' ? 'Tema claro' : 'Tema escuro';
        // <svg> has no .hidden property (HTML elements only), so set the attribute.
        icons.forEach((icon) => {
            icon.toggleAttribute('hidden', icon.dataset.themeIcon !== next);
        });
        if (meta) meta.content = COLORS[theme];
    };

    button.addEventListener('click', () => {
        const theme = currentTheme() === 'light' ? 'dark' : 'light';
        renderTheme(theme);
        try {
            localStorage.setItem(KEY, theme);
        } catch {
            // Storage unavailable: the theme lasts only for this page view.
        }
    });

    renderTheme(currentTheme());

    // --- Header height for scroll-padding (anchors/focus never hide under it) -----

    new ResizeObserver(() => {
        root.style.setProperty('--topbar-height', `${topbar.offsetHeight}px`);
    }).observe(topbar);

    // --- Mobile: hide while scrolling down, show again when scrolling up ----------

    const desktop = window.matchMedia('(min-width: 1024px)');
    let lastY = window.scrollY;
    let ticking = false;

    const setHidden = (hidden) => {
        topbar.classList.toggle('topbar--hidden', hidden);
    };

    const update = () => {
        ticking = false;
        const y = window.scrollY;
        // Never hide on desktop, near the top, or while keyboard focus is inside the header (WCAG 2.4.11).
        if (desktop.matches || y <= topbar.offsetHeight || topbar.contains(document.activeElement)) {
            setHidden(false);
        } else if (Math.abs(y - lastY) > 4) {
            setHidden(y > lastY);
        }
        lastY = y;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }, { passive: true });

    topbar.addEventListener('focusin', () => setHidden(false));
    desktop.addEventListener('change', () => setHidden(false));
})();
