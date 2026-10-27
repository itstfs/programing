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
;
const sourceCache = new Map();
const decodeSource = (buffer) => {
try {
return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
} catch {
return new TextDecoder('windows-1252').decode(buffer);
}
};
const loadSource = async (viewer, button) => {
const output = viewer.querySelector('.code__content');
const copy = viewer.querySelector('.code__copy');
const path = button.dataset.src;
const fileName = button.textContent.trim();
viewer.querySelectorAll('.code__file').forEach((file) => {
const isActive = file === button;
file.classList.toggle('code__file--active', isActive);
file.setAttribute('aria-pressed', String(isActive));
});
copy.disabled = true;
copy.setAttribute('aria-label', `Copiar código de ${fileName}`);
if (!sourceCache.has(path)) {
output.textContent = 'Carregando…';
try {
const response = await fetch(encodeURI(path));
if (!response.ok) throw new Error(response.status);
sourceCache.set(path, decodeSource(await response.arrayBuffer()));
} catch {
output.textContent = `Não foi possível carregar ${path}.\nAbra o site por um servidor local (ex.: npx serve) — o navegador bloqueia fetch em file://.`;
return;
}
}
output.textContent = sourceCache.get(path);
copy.disabled = false;
};
const copySource = async (viewer) => {
const copy = viewer.querySelector('.code__copy');
const label = copy.querySelector('.code__copy-label');
const status = viewer.querySelector('.code__status');
const output = viewer.querySelector('.code__content');
try {
await navigator.clipboard.writeText(output.textContent);
label.textContent = 'Copiado!';
status.textContent = 'Código copiado para a área de transferência.';
} catch {
const range = document.createRange();
range.selectNodeContents(output);
const selection = window.getSelection();
selection.removeAllRanges();
selection.addRange(range);
label.textContent = 'Use Ctrl+C';
status.textContent = 'Não foi possível copiar automaticamente. O código está selecionado; use Ctrl+C.';
}
copy.classList.add('code__copy--done');
clearTimeout(Number(copy.dataset.timer));
copy.dataset.timer = String(setTimeout(() => {
label.textContent = 'Copiar código';
copy.classList.remove('code__copy--done');
}, 1500));
};
const activeClass = (tab) => `${tab.classList[0]}--active`;
const activateTab = (tabs, tab) => {
tabs.forEach((button) => {
const isActive = button === tab;
const panel = document.getElementById(button.getAttribute('aria-controls'));
button.classList.toggle(activeClass(button), isActive);
button.setAttribute('aria-selected', String(isActive));
button.tabIndex = isActive ? 0 : -1;
panel.hidden = !isActive;
const viewer = panel.querySelector('.code');
if (isActive && viewer && !viewer.dataset.loaded) {
viewer.dataset.loaded = 'true';
loadSource(viewer, viewer.querySelector('.code__file'));
}
});
};
document.querySelectorAll('[role="tablist"]').forEach((tablist) => {
const tabs = [...tablist.querySelectorAll('[role="tab"]')];
tablist.addEventListener('click', (event) => {
const tab = event.target.closest('[role="tab"]');
if (tab) activateTab(tabs, tab);
});
tablist.addEventListener('keydown', (event) => {
const current = tabs.indexOf(document.activeElement);
const targets = {
ArrowRight: tabs[(current + 1) % tabs.length],
ArrowLeft: tabs[(current - 1 + tabs.length) % tabs.length],
Home: tabs[0],
End: tabs[tabs.length - 1],
};
const next = targets[event.key];
if (!next || current === -1) return;
event.preventDefault();
next.focus();
activateTab(tabs, next);
});
});
document.querySelectorAll('.code').forEach((viewer) => {
viewer.addEventListener('click', (event) => {
const file = event.target.closest('.code__file');
if (file) loadSource(viewer, file);
if (event.target.closest('.code__copy')) copySource(viewer);
});
});
;
(() => {
const search = document.querySelector('[data-notes-search]');
const count = document.querySelector('[data-notes-count]');
const empty = document.querySelector('[data-notes-empty]');
const notes = [...document.querySelectorAll('[data-note]')];
const normalize = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const index = notes.map((note) => normalize(note.textContent));
let timer = 0;
search.addEventListener('input', () => {
clearTimeout(timer);
timer = setTimeout(() => {
const query = normalize(search.value.trim());
let shown = 0;
notes.forEach((note, i) => {
const match = !query || index[i].includes(query);
note.hidden = !match;
if (match) shown += 1;
});
count.textContent = query ? `${shown} de ${notes.length} notas` : `${notes.length} notas`;
empty.hidden = shown > 0;
}, 120);
});
document.querySelectorAll('.snippet__copy').forEach((button) => {
const code = button.parentElement.querySelector('.snippet__code').textContent.split('\n')[0];
button.setAttribute('aria-label', `Copiar: ${code.length > 60 ? `${code.slice(0, 60)}…` : code}`);
});
document.addEventListener('click', async (event) => {
const button = event.target.closest('.snippet__copy');
if (!button) return;
const text = button.parentElement.querySelector('.snippet__code').textContent;
try {
await navigator.clipboard.writeText(text);
button.textContent = 'Copiado!';
} catch {
button.textContent = 'Erro';
}
button.classList.add('snippet__copy--done');
setTimeout(() => {
button.textContent = 'Copiar';
button.classList.remove('snippet__copy--done');
}, 1500);
});
})();