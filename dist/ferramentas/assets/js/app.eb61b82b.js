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
const form = document.querySelector('[data-imc-form]');
const result = document.querySelector('[data-imc-result]');
const RANGES = [
{ max: 18.49, text: 'Isso significa que você está abaixo do peso. 😦', modifier: 'warning' },
{ max: 24.99, text: 'Seu IMC é considerado "Normal". 😄', modifier: 'success' },
{ max: 29.99, text: 'Isso significa "Pré-obesidade". 😕', modifier: 'warning' },
{ max: 34.99, text: 'Você é considerado "Obeso de Grau 1". 😯', modifier: 'error' },
{ max: 39.99, text: 'Você é considerado "Obeso de Grau 2". 😯', modifier: 'error' },
{ max: Infinity, text: 'Sua classificação é "Obesidade grave, grau 3". 😰', modifier: 'error' },
];
form.addEventListener('submit', (event) => {
event.preventDefault();
const height = Number(form.height.value);
const weight = Number(form.weight.value);
const imc = Number((weight / (height * height)).toFixed(2));
if (!Number.isFinite(imc) || imc <= 0) {
result.className = 'result result--error';
result.innerHTML = 'Seu IMC é de: <strong class="highlight">0</strong> — Algo de errado não está certo... 😜';
return;
}
const range = RANGES.find((item) => imc <= item.max);
result.className = `result result--${range.modifier}`;
result.innerHTML = `Seu IMC é de: <strong class="highlight">${imc.toLocaleString('pt-BR')}</strong> — ${range.text}`;
});
})();
;
(() => {
const form = document.querySelector('[data-cpf-form]');
const input = form.cpf;
const result = document.querySelector('[data-cpf-result]');
const format = (cpf) => `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
const checkDigit = (digits) => {
let weight = digits.length + 1;
let sum = 0;
for (const digit of digits) {
sum += Number(digit) * weight;
weight--;
}
const value = 11 - (sum % 11);
return { sum, digit: value > 9 ? 0 : value };
};
const render = (modifier, message, steps = []) => {
result.className = `result cpf__result result--${modifier}`;
result.innerHTML = `<p class="cpf__message">${message}</p>`;
if (steps.length) {
result.insertAdjacentHTML('beforeend', `<ol class="cpf__steps">${steps.map((step) => `<li>${step}</li>`).join('')}</ol>`);
}
};
input.addEventListener('input', () => {
const digits = input.value.replace(/\D/g, '').slice(0, 11);
input.value = digits
.replace(/^(\d{3})(\d)/, '$1.$2')
.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
.replace(/\.(\d{3})(\d)/, '.$1-$2');
});
form.addEventListener('submit', (event) => {
event.preventDefault();
const typed = input.value.replace(/[^0-9]/g, '');
if (![9, 10, 11].includes(typed.length)) {
render('warning', `Digite 9, 10 ou 11 dígitos (você digitou ${typed.length}).`);
return;
}
const base = typed.slice(0, 9);
const first = checkDigit(base);
const second = checkDigit(base + first.digit);
const cpf = `${base}${first.digit}${second.digit}`;
const steps = [
`D1: soma ${first.sum} → 11 − (${first.sum} % 11) = ${11 - (first.sum % 11)} → ${first.digit}`,
`D2: soma ${second.sum} → 11 − (${second.sum} % 11) = ${11 - (second.sum % 11)} → ${second.digit}`,
];
if (/^(\d)\1{8}$/.test(base)) {
render('error', 'CPF inválido: sequências de dígitos repetidos não são aceitas.', steps);
return;
}
if (typed.length === 9) {
render('success', `Dígitos verificadores: <strong class="highlight">${first.digit}${second.digit}</strong> → ${format(cpf)}`, steps);
return;
}
const expected = typed.length === 10 ? String(first.digit) : `${first.digit}${second.digit}`;
const received = typed.slice(9);
if (expected !== received) {
render('error', `CPF inválido. Esperado <strong class="highlight">${expected}</strong>, recebido <strong class="highlight highlight--warning">${received}</strong>.`, steps);
return;
}
render('success', `CPF válido! <strong class="highlight">${format(cpf)}</strong>`, steps);
});
})();
;
(() => {
const form = document.querySelector('[data-password-form]');
const output = document.querySelector('[data-password-output]');
const lengthSelect = document.querySelector('[data-password-length]');
const numbersButton = document.querySelector('[data-password-numbers]');
const copyButton = document.querySelector('[data-password-copy]');
const result = document.querySelector('[data-password-result]');
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()';
const CHARSETS = {
low: LOWER,
medium: UPPER + LOWER,
strong: UPPER + LOWER + DIGITS + SYMBOLS,
};
for (let size = 8; size <= 32; size++) {
lengthSelect.add(new Option(String(size), String(size)));
}
const randomIndex = (max) => {
const limit = Math.floor(0x100000000 / max) * max;
const buffer = new Uint32Array(1);
do {
crypto.getRandomValues(buffer);
} while (buffer[0] >= limit);
return buffer[0] % max;
};
const generate = (charset) => {
const length = Number(lengthSelect.value);
let password = '';
for (let i = 0; i < length; i++) {
password += charset[randomIndex(charset.length)];
}
output.value = password;
result.textContent = '';
};
form.addEventListener('submit', (event) => {
event.preventDefault();
generate(CHARSETS[form.strength.value]);
});
numbersButton.addEventListener('click', () => generate(DIGITS));
copyButton.addEventListener('click', async () => {
if (!output.value) {
result.className = 'result result--warning';
result.textContent = 'Gere uma senha antes de copiar.';
return;
}
try {
await navigator.clipboard.writeText(output.value);
result.className = 'result result--success';
result.textContent = 'Senha copiada!';
} catch {
output.select();
result.className = 'result result--warning';
result.textContent = 'Não consegui copiar automaticamente — a senha está selecionada, use Ctrl+C.';
}
});
})();
;
(() => {
const select = document.querySelector('[data-shift-select]');
const letter = document.querySelector('[data-shift-letter]');
const result = document.querySelector('[data-shift-result]');
const greet = (value) => {
const shift = value.trim().toUpperCase();
result.className = 'result result--success';
switch (shift) {
case 'M':
result.textContent = `${shift}, Bom dia! ☀️`;
break;
case 'V':
result.textContent = `${shift}, Boa tarde! 🌤️`;
break;
case 'N':
result.textContent = `${shift}, Boa noite! 🌙`;
break;
case '':
result.textContent = '';
break;
default:
result.className = 'result result--error';
result.textContent = `${value.trim()} não existe`;
}
};
select.addEventListener('change', () => {
letter.value = '';
greet(select.value);
});
letter.addEventListener('input', () => {
select.value = '';
greet(letter.value);
});
})();
;
(() => {
const form = document.querySelector('[data-time-form]');
const task = document.querySelector('[data-time-task]');
const amount = document.querySelector('[data-time-amount]');
const label = document.querySelector('[data-time-label]');
const runButton = document.querySelector('[data-time-run]');
const output = document.querySelector('[data-time-output]');
const history = document.querySelector('[data-time-history]');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const TASKS = {
sleep: {
label: 'Segundos de espera (até 10)',
defaultValue: 3,
max: 10,
describe: (n) => `escrever texto + esperar ${n}s`,
run: async (n) => {
let file = '';
file += 'Funcionou! - teste';
await sleep(n * 1000);
return file.length;
},
},
sum: {
label: 'Somar de 1 até (máx. 100.000.000)',
defaultValue: 10000000,
max: 100000000,
describe: (n) => `somar 1..${n.toLocaleString('pt-BR')}`,
run: (n) => {
let total = 0;
for (let i = 1; i <= n; i++) total += i;
return total;
},
},
sort: {
label: 'Quantidade de números (até 2.000.000)',
defaultValue: 500000,
max: 2000000,
describe: (n) => `ordenar ${n.toLocaleString('pt-BR')} números`,
run: (n) => {
const numbers = Float64Array.from({ length: n }, Math.random);
return numbers.sort().length;
},
},
};
task.addEventListener('change', () => {
const current = TASKS[task.value];
label.textContent = current.label;
amount.value = current.defaultValue;
});
form.addEventListener('submit', async (event) => {
event.preventDefault();
const current = TASKS[task.value];
const n = Math.min(Math.max(Number(amount.value) || 0, 0), current.max);
amount.value = n;
runButton.disabled = true;
output.className = 'result code-time__output result--warning';
output.textContent = 'Executando…';
await sleep(50);
const start = performance.now();
await current.run(n);
const delta = (performance.now() - start) / 1000;
const line = '=-'.repeat(15);
output.className = 'result code-time__output result--success';
output.textContent = `${line}\nTempo de execução: ${delta.toFixed(2)}s (${(delta * 1000).toFixed(1)} ms)\n${line}`;
const item = document.createElement('li');
item.textContent = `${current.describe(n)} → ${delta.toFixed(3)}s`;
history.prepend(item);
while (history.children.length > 5) history.lastElementChild.remove();
runButton.disabled = false;
});
})();
;
(() => {
const fileInput = document.querySelector('[data-crop-file]');
const sampleButton = document.querySelector('[data-crop-sample]');
const form = document.querySelector('[data-crop-form]');
const runButton = document.querySelector('[data-crop-run]');
const download = document.querySelector('[data-crop-download]');
const preview = document.querySelector('[data-crop-preview]');
const output = document.querySelector('[data-crop-output]');
const sizeCaption = document.querySelector('[data-crop-size]');
const result = document.querySelector('[data-crop-result]');
const clearButton = document.querySelector('[data-crop-clear]');
const labels = document.querySelectorAll('[data-crop-label]');
const previewContext = preview.getContext('2d');
const outputContext = output.getContext('2d');
let source = null;
let downloadUrl = '';
const readBox = () => {
const box = {
left: Number(form.left.value) || 0,
top: Number(form.top.value) || 0,
right: Number(form.right.value) || 0,
bottom: Number(form.bottom.value) || 0,
};
box.left = Math.min(Math.max(box.left, 0), source.width);
box.right = Math.min(Math.max(box.right, 0), source.width);
box.top = Math.min(Math.max(box.top, 0), source.height);
box.bottom = Math.min(Math.max(box.bottom, 0), source.height);
return box;
};
const drawPreview = () => {
if (!source) return;
preview.width = source.width;
preview.height = source.height;
previewContext.drawImage(source, 0, 0);
const box = readBox();
const lineWidth = Math.max(2, Math.round(source.width / 300));
previewContext.fillStyle = 'rgba(0, 0, 0, 0.55)';
previewContext.fillRect(0, 0, source.width, box.top);
previewContext.fillRect(0, box.bottom, source.width, source.height - box.bottom);
previewContext.fillRect(0, box.top, box.left, box.bottom - box.top);
previewContext.fillRect(box.right, box.top, source.width - box.right, box.bottom - box.top);
previewContext.strokeStyle = '#ff3d9e';
previewContext.lineWidth = lineWidth;
previewContext.strokeRect(box.left, box.top, box.right - box.left, box.bottom - box.top);
};
const setLimits = (width, height) => {
labels.forEach((label) => {
const input = document.getElementById(label.htmlFor);
const max = input.name === 'left' || input.name === 'right' ? width : height;
input.max = max ?? '';
label.textContent = max ? `${label.dataset.cropLabel} (até ${max} px)` : label.dataset.cropLabel;
});
};
const setSource = (image, name) => {
source = image;
sizeCaption.textContent = `Original — ${name} (${image.width} × ${image.height}px)`;
runButton.disabled = false;
clearButton.hidden = false;
result.textContent = '';
setLimits(image.width, image.height);
drawPreview();
};
clearButton.addEventListener('click', () => {
source = null;
fileInput.value = '';
[preview, output].forEach((canvas) => {
canvas.width = 300;
canvas.height = 150;
});
sizeCaption.textContent = 'Original';
runButton.disabled = true;
clearButton.hidden = true;
download.hidden = true;
setLimits(null, null);
result.className = 'result result--success';
result.textContent = 'Imagem removida.';
});
const makeSample = () => {
const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 700;
const context = canvas.getContext('2d');
const gradient = context.createLinearGradient(0, 0, 800, 700);
gradient.addColorStop(0, '#2b1055');
gradient.addColorStop(1, '#ff1493');
context.fillStyle = gradient;
context.fillRect(0, 0, 800, 700);
context.fillStyle = 'rgba(255, 255, 255, 0.12)';
for (let x = 0; x <= 800; x += 100) context.fillRect(x, 0, 2, 700);
for (let y = 0; y <= 700; y += 100) context.fillRect(0, y, 800, 2);
context.font = '220px serif';
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText('🐶', 400, 340);
context.font = 'bold 28px monospace';
context.fillStyle = '#ffffff';
context.fillText('dog.jpg (exemplo) · grade de 100px', 400, 640);
return canvas;
};
fileInput.addEventListener('change', async () => {
const file = fileInput.files[0];
if (!file) return;
const url = URL.createObjectURL(file);
const image = new Image();
image.src = url;
try {
await image.decode();
setSource(image, file.name);
} catch {
result.className = 'result result--error';
result.textContent = 'Não consegui abrir esse arquivo como imagem.';
} finally {
URL.revokeObjectURL(url);
}
});
sampleButton.addEventListener('click', () => setSource(makeSample(), 'exemplo'));
form.addEventListener('input', drawPreview);
form.addEventListener('submit', (event) => {
event.preventDefault();
if (!source) return;
const box = readBox();
const width = box.right - box.left;
const height = box.bottom - box.top;
if (width <= 0 || height <= 0) {
result.className = 'result result--error';
result.textContent = 'A direita precisa ser maior que a esquerda, e baixo maior que cima.';
return;
}
output.width = width;
output.height = height;
outputContext.drawImage(source, box.left, box.top, width, height, 0, 0, width, height);
result.className = 'result result--success';
result.textContent = `Recorte de ${width} × ${height}px pronto.`;
output.toBlob((blob) => {
if (downloadUrl) URL.revokeObjectURL(downloadUrl);
downloadUrl = URL.createObjectURL(blob);
download.href = downloadUrl;
download.hidden = false;
}, 'image/png');
});
})();