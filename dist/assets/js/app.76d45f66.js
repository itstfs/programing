(() => {
const root = document.documentElement;
const topbar = document.querySelector('.topbar');
if (!topbar) return;
const KEY = 'itstfs-theme';
const COLORS = { dark: '#0e0e13', light: '#fafafc' };
const button = topbar.querySelector('[data-theme-toggle]');
const label = button.querySelector('.theme-toggle__label');
const icons = button.querySelectorAll('[data-theme-icon]');
const meta = document.querySelector('meta[name="theme-color"]');
const currentTheme = () => (root.dataset.theme === 'light' ? 'light' : 'dark');
const renderTheme = (theme) => {
if (theme === 'light') {
root.dataset.theme = 'light';
} else {
delete root.dataset.theme;
}
const next = theme === 'light' ? 'dark' : 'light';
label.textContent = next === 'light' ? 'Tema claro' : 'Tema escuro';
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
}
});
renderTheme(currentTheme());
new ResizeObserver(() => {
root.style.setProperty('--topbar-height', `${topbar.offsetHeight}px`);
}).observe(topbar);
const desktop = window.matchMedia('(min-width: 1024px)');
let lastY = window.scrollY;
let ticking = false;
const setHidden = (hidden) => {
topbar.classList.toggle('topbar--hidden', hidden);
};
const update = () => {
ticking = false;
const y = window.scrollY;
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