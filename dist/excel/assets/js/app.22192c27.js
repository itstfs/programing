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
window.Csv = (() => {
const decode = (buffer) => {
try {
return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
} catch {
return new TextDecoder('windows-1252').decode(buffer);
}
};
const parseLine = (line) => {
if (!line.includes('"')) return line.split(';');
const cells = [];
let cell = '';
let quoted = false;
for (let i = 0; i < line.length; i++) {
const char = line[i];
if (char === '"' && line[i + 1] === '"' && quoted) {
cell += '"';
i++;
} else if (char === '"') {
quoted = !quoted;
} else if (char === ';' && !quoted) {
cells.push(cell);
cell = '';
} else {
cell += char;
}
}
cells.push(cell);
return cells;
};
const parse = async (text, onProgress) => {
const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
const headers = parseLine(lines[0]).map((header) => header.trim().replace(/^﻿/, ''));
const rows = [];
const CHUNK = 20000;
for (let start = 1; start < lines.length; start += CHUNK) {
const end = Math.min(start + CHUNK, lines.length);
for (let i = start; i < end; i++) rows.push(parseLine(lines[i]));
if (onProgress) onProgress(end - 1, lines.length - 1);
await new Promise((resolve) => setTimeout(resolve, 0));
}
return { headers, rows };
};
const escape = (value) => {
const text = String(value ?? '');
return /[;"\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const download = (filename, headers, rows) => {
const content = [headers, ...rows].map((row) => row.map(escape).join(';')).join('\r\n');
const url = URL.createObjectURL(new Blob(['﻿', content], { type: 'text/csv;charset=utf-8' }));
const link = document.createElement('a');
link.href = url;
link.download = filename;
link.click();
setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const load = async (url) => {
const response = await fetch(url);
if (!response.ok) throw new Error(response.status);
return parse(decode(await response.arrayBuffer()));
};
return { decode, parse, download, load };
})();
;
(() => {
const form = document.querySelector('[data-people-form]');
const table = document.querySelector('[data-people-table]');
const exportButton = document.querySelector('[data-people-export]');
const result = document.querySelector('[data-people-result]');
let sheet = { headers: ['ID', 'Nome', 'Idade', 'Peso'], rows: [] };
let newRowIndex = -1;
const cell = (tag, className, text) => {
const element = document.createElement(tag);
element.className = className;
element.textContent = text;
return element;
};
const render = () => {
const head = document.createElement('thead');
const headRow = document.createElement('tr');
sheet.headers.forEach((header, column) => headRow.append(cell('th', column === 1 ? 'sheet__head' : 'sheet__head sheet__head--number', header)));
head.append(headRow);
const body = document.createElement('tbody');
sheet.rows.forEach((row, index) => {
const tr = document.createElement('tr');
tr.className = index === newRowIndex ? 'sheet__row sheet__row--new' : 'sheet__row';
row.forEach((value, column) => {
tr.append(cell('td', column === 1 ? 'sheet__cell' : 'sheet__cell sheet__cell--number', value));
});
body.append(tr);
});
table.replaceChildren(head, body);
};
form.addEventListener('submit', (event) => {
event.preventDefault();
sheet.rows.push([form.personId.value, form.personName.value.trim().toUpperCase(), form.age.value, form.weight.value]);
newRowIndex = sheet.rows.length - 1;
render();
result.className = 'result result--success';
result.textContent = `Pessoa adicionada na linha ${sheet.rows.length + 1} (contando o cabeçalho). Para guardar, use Exportar CSV.`;
form.reset();
table.closest('.sheet').scrollTop = table.scrollHeight;
});
exportButton.addEventListener('click', () => Csv.download('pessoas.csv', sheet.headers, sheet.rows));
Csv.load('assets/data/pessoas.csv')
.then((data) => {
sheet = data;
render();
})
.catch(() => {
render();
result.className = 'result result--warning';
result.textContent = 'Não foi possível carregar pessoas.csv. Abra o site por um servidor local; você ainda pode adicionar pessoas.';
});
})();
;
(() => {
const SAMPLE_URL = 'assets/data/servidores-sample.csv';
const PAGE_SIZE = 20;
const DISPLAY = ['masp', 'nome', 'descsitser', 'nmefet', 'descinst', 'carga_hora', 'remuner', 'ferias', 'teto', 'judic', 'eventual', 'ir', 'prev', 'rem_pos'];
const NUMERIC = new Set(['masp', 'carga_hora', 'remuner', 'ferias', 'teto', 'eventual', 'ir', 'prev', 'rem_pos']);
const DELETABLE = ['teto', 'judic', 'eventual', 'ir', 'prev', 'rem_pos'];
const MONEY = new Set(['remuner', 'teto', 'eventual', 'ir', 'prev', 'rem_pos']);
const LABELS = {
masp: 'MASP',
nome: 'Nome',
descsitser: 'Situação',
nmefet: 'Cargo',
descinst: 'Instituição',
carga_hora: 'Carga horária',
remuner: 'Remuneração',
ferias: 'Férias (dias)',
teto: 'Teto',
judic: 'Judicial',
eventual: 'Eventual',
ir: 'IR',
prev: 'Previdência',
rem_pos: 'Líquido',
};
const WORDS = { nao: 'não', servico: 'serviço', estao: 'estão', sisap: 'SISAP' };
const $ = (selector) => document.querySelector(selector);
const table = $('[data-servers-table]');
const status = $('[data-servers-status]');
const result = $('[data-servers-result]');
const searchName = $('[data-search-name]');
const searchStatus = $('[data-search-status]');
const chart = $('[data-chart]');
const chartTotal = $('[data-chart-total]');
const pageInfo = $('[data-page-info]');
const prevButton = $('[data-page-prev]');
const nextButton = $('[data-page-next]');
const insertForm = $('[data-insert-form]');
const updateForm = $('[data-update-form]');
const deleteForm = $('[data-delete-form]');
const deleteSelect = $('[data-delete-column]');
const roleList = $('[data-role-list]');
let headers = [];
let rows = [];
let filtered = [];
let page = 0;
let headerColor = 'default';
let unsaved = 0;
const newRows = new WeakSet();
const col = (name) => headers.indexOf(name);
const normalize = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
const COUNT_FORMAT = new Intl.NumberFormat('pt-BR');
const MONEY_FORMAT = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const PERCENT_FORMAT = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const formatCount = (value) => COUNT_FORMAT.format(value);
const label = (name) => LABELS[name] || name;
const sentenceCase = (text) => {
const words = text.toLowerCase().split(' ').map((word) => word.split('/').map((part) => WORDS[part] || part).join('/'));
const sentence = words.join(' ');
return sentence.charAt(0).toUpperCase() + sentence.slice(1);
};
const formatCell = (name, value) => {
if (!MONEY.has(name) || value === '' || value == null) return value ?? '';
const number = Number(String(value).replace(',', '.'));
return Number.isFinite(number) ? MONEY_FORMAT.format(number) : value;
};
const say = (modifier, text, undo) => {
result.className = `result result--${modifier}`;
result.textContent = text;
if (!undo) return;
const button = document.createElement('button');
button.className = 'result__action';
button.type = 'button';
button.textContent = 'Desfazer';
button.addEventListener('click', () => {
undo();
unsaved = Math.max(0, unsaved - 1);
refreshAll();
say('success', 'Ação desfeita.');
});
result.append(' ', button);
};
const markChanged = () => {
unsaved += 1;
};
const renderTable = () => {
const visible = DISPLAY.filter((name) => col(name) !== -1);
const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
page = Math.min(page, pages - 1);
const headRow = document.createElement('tr');
[...visible, ''].forEach((name) => {
const th = document.createElement('th');
const classes = ['sheet__head'];
if (NUMERIC.has(name)) classes.push('sheet__head--number');
if (headerColor !== 'default') classes.push(`sheet__head--${headerColor}`);
th.className = classes.join(' ');
th.scope = 'col';
th.textContent = label(name);
if (name) th.title = name === 'masp' ? 'Matrícula do servidor (coluna original: masp)' : `Coluna original: ${name}`;
if (!name) th.append(Object.assign(document.createElement('span'), { className: 'visually-hidden', textContent: 'Ações' }));
headRow.append(th);
});
const body = document.createElement('tbody');
const slice = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
if (!slice.length) {
const td = Object.assign(document.createElement('td'), {
className: 'sheet__cell sheet__cell--empty',
colSpan: visible.length + 1,
textContent: 'Nenhuma linha encontrada.',
});
body.append(Object.assign(document.createElement('tr'), { className: 'sheet__row' }));
body.lastElementChild.append(td);
}
slice.forEach((row) => {
const tr = document.createElement('tr');
tr.className = newRows.has(row) ? 'sheet__row sheet__row--new' : 'sheet__row';
visible.forEach((name) => {
const td = document.createElement('td');
td.className = NUMERIC.has(name) ? 'sheet__cell sheet__cell--number' : 'sheet__cell';
td.textContent = formatCell(name, row[col(name)]);
tr.append(td);
});
if (newRows.has(row)) {
tr.firstElementChild.append(Object.assign(document.createElement('span'), { className: 'visually-hidden', textContent: ' (nova)' }));
}
const actions = document.createElement('td');
actions.className = 'sheet__cell';
const remove = document.createElement('button');
remove.className = 'sheet__remove';
remove.type = 'button';
remove.textContent = '✕';
remove.setAttribute('aria-label', `Excluir ${row[col('nome')]}`);
remove.addEventListener('click', () => removeRow(row));
actions.append(remove);
tr.append(actions);
body.append(tr);
});
const head = document.createElement('thead');
head.append(headRow);
table.replaceChildren(head, body);
pageInfo.textContent = `Página ${page + 1} de ${pages} · ${formatCount(filtered.length)} linha${filtered.length === 1 ? '' : 's'}`;
prevButton.disabled = page === 0;
nextButton.disabled = page >= pages - 1;
};
const renderChart = () => {
const statusCol = col('descsitser');
const counts = new Map();
rows.forEach((row) => counts.set(row[statusCol], (counts.get(row[statusCol]) || 0) + 1));
const entries = [...counts].sort((a, b) => b[1] - a[1]);
const max = entries.length ? entries[0][1] : 1;
chartTotal.textContent = `· ${formatCount(rows.length)} no total`;
chart.replaceChildren(...entries.map(([label, count]) => {
const percent = PERCENT_FORMAT.format((count / rows.length) * 100);
const item = document.createElement('li');
item.className = 'chart__item';
item.title = `${label}: ${formatCount(count)} (${percent}%)`;
item.innerHTML = `
<span class="chart__label"></span>
<span class="chart__track">
<span class="chart__bar-wrap"><span class="chart__bar" style="width: ${Math.max((count / max) * 100, 0.4)}%"></span></span>
<span class="chart__value">${formatCount(count)} · ${percent}%</span>
</span>`;
item.querySelector('.chart__label').textContent = label ? sentenceCase(label) : '(vazio)';
return item;
}));
const current = searchStatus.value;
searchStatus.replaceChildren(new Option('Todas', ''), ...entries.map(([value]) => new Option(sentenceCase(value), value)));
searchStatus.value = counts.has(current) ? current : '';
};
const renderDeleteOptions = () => {
const available = DELETABLE.filter((name) => col(name) !== -1);
deleteSelect.replaceChildren(...available.map((name) => new Option(`${label(name)} (${name})`, name)));
deleteForm.querySelector('button').disabled = !available.length;
if (!available.length) deleteSelect.append(new Option('Nenhuma coluna para excluir', ''));
};
const renderRoles = () => {
const roleCol = col('nmefet');
const roles = [...new Set(rows.slice(0, 5000).map((row) => row[roleCol]))].filter(Boolean).sort().slice(0, 40);
roleList.replaceChildren(...roles.map((role) => new Option(role)));
};
const applyFilter = () => {
const name = normalize(searchName.value);
const wanted = searchStatus.value;
const nameCol = col('nome');
const statusCol = col('descsitser');
filtered = rows.filter((row) => (!wanted || row[statusCol] === wanted) && (!name || normalize(row[nameCol] || '').includes(name)));
renderTable();
};
const refreshAll = () => {
renderChart();
renderDeleteOptions();
renderRoles();
applyFilter();
const pending = unsaved ? ` · ${unsaved} alteraç${unsaved === 1 ? 'ão' : 'ões'} não exportada${unsaved === 1 ? '' : 's'}` : '';
status.textContent = `${formatCount(rows.length)} linhas · ${headers.length} colunas${pending}`;
};
const setData = (data) => {
if (!data.headers.includes('nome') || !data.headers.includes('descsitser')) {
throw new Error('O CSV precisa ter as colunas "nome" e "descsitser" (separadas por ;).');
}
headers = data.headers;
rows = data.rows;
page = 0;
unsaved = 0;
refreshAll();
};
const removeRow = (row) => {
const index = rows.indexOf(row);
rows.splice(index, 1);
markChanged();
refreshAll();
say('success', `${row[col('nome')]} excluído(a) da planilha.`, () => rows.splice(index, 0, row));
};
let searchTimer = 0;
searchName.addEventListener('input', () => {
clearTimeout(searchTimer);
searchTimer = setTimeout(() => {
page = 0;
applyFilter();
}, 150);
});
searchStatus.addEventListener('change', () => {
page = 0;
applyFilter();
});
prevButton.addEventListener('click', () => {
page -= 1;
renderTable();
});
nextButton.addEventListener('click', () => {
page += 1;
renderTable();
});
insertForm.addEventListener('submit', (event) => {
event.preventDefault();
const fields = insertForm.elements;
const row = headers.map((name) => (NUMERIC.has(name) ? '0' : ''));
['masp', 'nome', 'descsitser', 'nmefet', 'descinst'].forEach((name) => {
if (col(name) !== -1) row[col(name)] = fields.namedItem(name).value.trim().toUpperCase();
});
const salary = Number(fields.namedItem('remuner').value || 0);
if (col('remuner') !== -1) row[col('remuner')] = salary.toFixed(2).replace('.', ',');
rows.push(row);
newRows.add(row);
markChanged();
searchName.value = '';
searchStatus.value = '';
refreshAll();
page = Math.ceil(filtered.length / PAGE_SIZE) - 1;
renderTable();
say('success', `${row[col('nome')]} adicionado(a) no fim da planilha — a linha está destacada na tabela.`, () => rows.splice(rows.indexOf(row), 1));
insertForm.reset();
});
updateForm.addEventListener('submit', (event) => {
event.preventDefault();
const role = updateForm.elements.namedItem('role').value;
const days = updateForm.elements.namedItem('days').value;
const roleCol = col('nmefet');
const vacationCol = col('ferias');
const previous = [];
rows.forEach((row) => {
if (row[roleCol] === role) {
previous.push([row, row[vacationCol]]);
row[vacationCol] = days;
}
});
const message = previous.length ? `Férias atualizadas para ${days} dias em ${formatCount(previous.length)} servidor(es) com o cargo ${sentenceCase(role)}.` : `Nenhum servidor com o cargo ${sentenceCase(role)} nesta planilha.`;
if (!previous.length) {
say('warning', message);
return;
}
markChanged();
refreshAll();
say('success', message, () => previous.forEach(([row, value]) => {
row[vacationCol] = value;
}));
});
deleteForm.addEventListener('submit', (event) => {
event.preventDefault();
const name = deleteSelect.value;
const index = col(name);
if (index === -1) return;
const values = rows.map((row) => row.splice(index, 1)[0]);
headers.splice(index, 1);
markChanged();
refreshAll();
say('success', `Coluna "${label(name)}" excluída.`, () => {
headers.splice(index, 0, name);
rows.forEach((row, i) => row.splice(index, 0, values[i]));
});
});
$('[data-color-options]').addEventListener('change', (event) => {
headerColor = event.target.value;
renderTable();
say('success', 'Cor do cabeçalho alterada.');
});
const loadSample = async () => {
status.textContent = 'Carregando dados de exemplo…';
try {
setData(await Csv.load(SAMPLE_URL));
} catch {
status.textContent = 'Não foi possível carregar os dados de exemplo. Abra o site por um servidor local (ex.: npx serve).';
}
};
$('[data-servers-import]').addEventListener('change', async (event) => {
const file = event.target.files[0];
if (!file) return;
status.textContent = `Lendo ${file.name}…`;
try {
const text = Csv.decode(await file.arrayBuffer());
const data = await Csv.parse(text, (done, total) => {
status.textContent = `Processando ${formatCount(done)} de ${formatCount(total)} linhas…`;
});
setData(data);
say('success', `${file.name} importado: ${formatCount(rows.length)} linhas.`);
} catch (error) {
say('error', error.message || 'Não foi possível ler esse arquivo. Confira se é um CSV separado por ponto e vírgula.');
status.textContent = `${formatCount(rows.length)} linhas · ${headers.length} colunas`;
}
event.target.value = '';
});
$('[data-servers-export]').addEventListener('click', () => {
Csv.download('servidores.csv', headers, rows);
unsaved = 0;
refreshAll();
say('success', 'servidores.csv exportado.');
});
$('[data-servers-reset]').addEventListener('click', async () => {
if (unsaved && !window.confirm(`Você tem ${unsaved} alteração(ões) não exportada(s). Restaurar os dados de exemplo vai descartá-las. Continuar?`)) return;
await loadSample();
say('success', 'Dados de exemplo restaurados.');
});
loadSample();
})();