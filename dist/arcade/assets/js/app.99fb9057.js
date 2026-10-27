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
const form = document.querySelector('[data-number-form]');
const result = document.querySelector('[data-number-result]');
const score = document.querySelector('[data-number-score]');
const reset = document.querySelector('[data-number-reset]');
const MAX = 5;
let attempts = 0;
let hits = 0;
const showResult = (html, modifier) => {
result.className = `result result--${modifier}`;
result.innerHTML = html;
};
form.addEventListener('submit', (event) => {
event.preventDefault();
const guess = Number(form.guess.value);
if (!Number.isInteger(guess) || guess < 0 || guess > MAX) {
showResult(`Você é louco? Digite um número entre 0 a ${MAX}.`, 'warning');
return;
}
const computer = Math.floor(Math.random() * (MAX + 1));
attempts += 1;
if (computer === guess) {
hits += 1;
showResult(`Parabéns, o número que você digitou foi <span class="highlight">${guess}</span>, e o número que pensei foi <span class="highlight highlight--warning">${computer}</span>.`, 'success');
} else {
showResult(`Que triste, você errou. Você digitou <span class="highlight">${guess}</span> e eu pensei no número <span class="highlight highlight--warning">${computer}</span>.`, 'error');
}
score.textContent = `Acertos: ${hits} de ${attempts} tentativa${attempts === 1 ? '' : 's'}`;
reset.hidden = false;
form.guess.select();
});
reset.addEventListener('click', () => {
attempts = 0;
hits = 0;
score.textContent = 'Acertos: 0 de 0 tentativas';
result.textContent = '';
reset.hidden = true;
form.guess.focus();
});
})();
;
(() => {
const canvas = document.querySelector('[data-snake-board]');
const context = canvas.getContext('2d');
const scoreOutput = document.querySelector('[data-snake-score]');
const bestOutput = document.querySelector('[data-snake-best]');
const status = document.querySelector('[data-snake-status]');
const startButton = document.querySelector('[data-snake-start]');
const pauseButton = document.querySelector('[data-snake-pause]');
const pad = document.querySelector('.snake__pad');
const CELL = 20;
const GRID = canvas.width / CELL;
const STEP_MS = 100;
const SNAKE_COLOR = '#ff69b4';
const FRUIT_COLOR = '#00ff00';
const BEST_KEY = 'arcade-snake-best';
const DIRECTIONS = {
up: { x: 0, y: -1 },
down: { x: 0, y: 1 },
left: { x: -1, y: 0 },
right: { x: 1, y: 0 },
};
const KEYS = {
ArrowUp: 'up', KeyW: 'up',
ArrowDown: 'down', KeyS: 'down',
ArrowLeft: 'left', KeyA: 'left',
ArrowRight: 'right', KeyD: 'right',
};
let snake = [];
let fruit = null;
let direction = DIRECTIONS.left;
let queuedDirection = direction;
let score = 0;
let best = 0;
let running = false;
let paused = false;
let visible = true;
let lastStep = 0;
let frameId = 0;
try {
best = Number(localStorage.getItem(BEST_KEY)) || 0;
} catch {
best = 0;
}
bestOutput.textContent = best;
const randomCell = () => {
let cell;
do {
cell = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
} while (snake.some((part) => part.x === cell.x && part.y === cell.y));
return cell;
};
const draw = () => {
context.fillStyle = '#000000';
context.fillRect(0, 0, canvas.width, canvas.height);
if (fruit) {
context.fillStyle = FRUIT_COLOR;
context.fillRect(fruit.x * CELL + 2, fruit.y * CELL + 2, CELL - 4, CELL - 4);
}
context.fillStyle = SNAKE_COLOR;
snake.forEach((part) => {
context.fillRect(part.x * CELL + 1, part.y * CELL + 1, CELL - 2, CELL - 2);
});
};
const setStatus = (text) => {
status.textContent = text;
};
const gameOver = () => {
running = false;
cancelAnimationFrame(frameId);
pauseButton.disabled = true;
startButton.textContent = 'Jogar de novo';
if (score > best) {
best = score;
bestOutput.textContent = best;
try {
localStorage.setItem(BEST_KEY, String(best));
} catch {
}
setStatus(`Fim de jogo — novo recorde: ${score}!`);
return;
}
setStatus(`Fim de jogo — ${score} ponto${score === 1 ? '' : 's'}.`);
};
const step = () => {
direction = queuedDirection;
const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
const hitsWall = head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID;
const hitsBody = snake.some((part) => part.x === head.x && part.y === head.y);
if (hitsWall || hitsBody) {
gameOver();
return;
}
snake.unshift(head);
if (head.x === fruit.x && head.y === fruit.y) {
score += 1;
scoreOutput.textContent = score;
fruit = randomCell();
} else {
snake.pop();
}
};
const loop = (time) => {
if (!running || paused || !visible) return;
if (time - lastStep >= STEP_MS) {
lastStep = time;
step();
draw();
}
if (running) frameId = requestAnimationFrame(loop);
};
const resume = () => {
cancelAnimationFrame(frameId);
lastStep = performance.now();
frameId = requestAnimationFrame(loop);
};
const start = () => {
const middle = Math.floor(GRID / 2);
snake = [{ x: middle, y: middle }, { x: middle + 1, y: middle }, { x: middle + 2, y: middle }];
direction = DIRECTIONS.left;
queuedDirection = direction;
fruit = randomCell();
score = 0;
scoreOutput.textContent = score;
running = true;
paused = false;
startButton.textContent = 'Reiniciar';
pauseButton.disabled = false;
pauseButton.textContent = 'Pausar';
setStatus('Valendo!');
draw();
resume();
};
const togglePause = () => {
if (!running) return;
paused = !paused;
pauseButton.textContent = paused ? 'Continuar' : 'Pausar';
setStatus(paused ? 'Pausado.' : 'Valendo!');
if (!paused) resume();
};
const turn = (name) => {
const next = DIRECTIONS[name];
if (!next || (next.x === -direction.x && next.y === -direction.y)) return;
queuedDirection = next;
};
startButton.addEventListener('click', start);
pauseButton.addEventListener('click', togglePause);
pad.addEventListener('click', (event) => {
const key = event.target.closest('[data-direction]');
if (key) turn(key.dataset.direction);
});
document.addEventListener('keydown', (event) => {
if (!running || event.target.closest('input, select, textarea')) return;
if (event.code === 'Space' || event.code === 'KeyP') {
event.preventDefault();
togglePause();
return;
}
if (KEYS[event.code]) {
event.preventDefault();
turn(KEYS[event.code]);
}
});
let touchStart = null;
canvas.addEventListener('touchstart', (event) => {
touchStart = event.changedTouches[0];
}, { passive: true });
canvas.addEventListener('touchend', (event) => {
if (!touchStart) return;
const end = event.changedTouches[0];
const dx = end.clientX - touchStart.clientX;
const dy = end.clientY - touchStart.clientY;
touchStart = null;
if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
if (Math.abs(dx) > Math.abs(dy)) {
turn(dx > 0 ? 'right' : 'left');
} else {
turn(dy > 0 ? 'down' : 'up');
}
}, { passive: true });
new IntersectionObserver(([entry]) => {
visible = entry.isIntersecting;
if (visible && running && !paused) resume();
}).observe(canvas);
document.addEventListener('visibilitychange', () => {
if (document.hidden && running && !paused) togglePause();
});
draw();
})();
;
(() => {
const canvas = document.querySelector('[data-matrix-canvas]');
const context = canvas.getContext('2d');
const wordInput = document.querySelector('[data-matrix-word]');
const colorInput = document.querySelector('[data-matrix-color]');
const toggleButton = document.querySelector('[data-matrix-toggle]');
const status = document.querySelector('[data-matrix-status]');
const KATAKANA = '❤︎アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
const NUMS = '0123456789';
const FONT_SIZE = 16;
const FRAME_MS = 30;
let alphabet = '';
let rainDrops = [];
let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let visible = false;
let lastFrame = 0;
let frameId = 0;
const buildAlphabet = () => {
alphabet = [...(KATAKANA + wordInput.value.toUpperCase() + NUMS)];
};
const resize = () => {
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
context.fillStyle = '#000000';
context.fillRect(0, 0, canvas.width, canvas.height);
rainDrops = Array.from({ length: Math.ceil(canvas.width / FONT_SIZE) }, () => 1);
if (!playing) {
for (let i = 0; i < 40; i++) draw();
}
};
const draw = () => {
context.fillStyle = 'rgba(0, 0, 0, 0.05)';
context.fillRect(0, 0, canvas.width, canvas.height);
context.fillStyle = colorInput.value;
context.font = `${FONT_SIZE}px monospace`;
for (let i = 0; i < rainDrops.length; i++) {
const text = alphabet[Math.floor(Math.random() * alphabet.length)];
context.fillText(text, i * FONT_SIZE, rainDrops[i] * FONT_SIZE);
if (rainDrops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) {
rainDrops[i] = 0;
}
rainDrops[i]++;
}
};
const loop = (time) => {
if (!playing || !visible) return;
if (time - lastFrame >= FRAME_MS) {
lastFrame = time;
draw();
}
frameId = requestAnimationFrame(loop);
};
const start = () => {
cancelAnimationFrame(frameId);
if (playing && visible) frameId = requestAnimationFrame(loop);
};
const updateToggle = () => {
toggleButton.textContent = playing ? 'Pausar' : 'Reproduzir';
};
toggleButton.addEventListener('click', () => {
playing = !playing;
updateToggle();
status.textContent = playing ? 'Animação em andamento.' : 'Animação pausada.';
start();
});
wordInput.addEventListener('input', buildAlphabet);
new ResizeObserver(resize).observe(canvas);
new IntersectionObserver(([entry]) => {
visible = entry.isIntersecting;
start();
}).observe(canvas);
buildAlphabet();
updateToggle();
})();