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
class Member {
#cpf;
#name;
#age;
#email;
constructor(cpf, name, age, email) {
this.#cpf = cpf;
this.#name = name;
this.#age = age;
this.#email = email;
}
get cpf() { return this.#cpf; }
get name() { return this.#name; }
get age() { return this.#age; }
get email() { return this.#email; }
}
class Learner extends Member {}
class Student extends Learner {
#grades;
#attendance;
#average = 0;
#approved = false;
#listeners = [];
constructor(cpf, name, age, email, grades, attendance) {
super(cpf, name, age, email);
this.#grades = grades;
this.#attendance = attendance;
this.#calcAverage();
this.#calcApproved();
}
addListener(listener) {
if (!this.#listeners.includes(listener)) this.#listeners.push(listener);
}
#notify() {
this.#listeners.forEach((listener) => listener.onStudentChange());
}
#calcAverage() {
this.#average = this.#grades.reduce((total, grade) => total + grade, 0) / this.#grades.length;
this.#notify();
}
#calcApproved() {
this.#approved = this.#average >= 5 && this.#attendance >= 75;
this.#notify();
}
get grades() { return [...this.#grades]; }
get attendance() { return this.#attendance; }
get average() { return this.#average; }
get approved() { return this.#approved; }
set grades(grades) {
this.#grades = grades;
this.#calcAverage();
this.#calcApproved();
}
set attendance(value) {
this.#attendance = value;
this.#calcApproved();
}
}
class Monitor extends Learner {
static role = 'Monitor';
#salary = 2000;
#year;
#scholarship;
constructor(cpf, name, age, email, year, scholarship) {
super(cpf, name, age, email);
this.#year = year;
this.#scholarship = scholarship;
}
get salary() { return this.#salary; }
get detail() { return `Ano ${this.#year} · bolsa ${this.#scholarship}`; }
raise() { return this.#salary * 1.05; }
discount() { return this.#salary * 0.95; }
}
class Staff extends Member {
static role = 'Docente';
static salary = 0;
static raiseRate = 1;
static discountRate = 1;
get salary() { return this.constructor.salary; }
raise() { return this.salary * this.constructor.raiseRate; }
discount() { return this.salary * this.constructor.discountRate; }
}
class Teacher extends Staff {
static role = 'Professor';
static salary = 7000;
static raiseRate = 1.10;
static discountRate = 0.85;
#course;
constructor(cpf, name, age, email, course) {
super(cpf, name, age, email);
this.#course = course;
}
get detail() { return this.#course; }
}
class Coordinator extends Staff {
static role = 'Coordenador';
static salary = 11000;
static raiseRate = 1.15;
static discountRate = 0.75;
get detail() { return `${this.age} anos`; }
}
class Director extends Staff {
static role = 'Diretor';
static salary = 16000;
static raiseRate = 1.20;
static discountRate = 0.70;
get detail() { return `${this.age} anos`; }
}
class Subject {
#name;
#students;
#staff;
#monitors;
#approvalRate = 0;
#onChange;
constructor(name, students, staff, monitors, onChange) {
this.#name = name;
this.#students = students;
this.#staff = staff;
this.#monitors = monitors;
this.#onChange = onChange;
this.#students.forEach((student) => student.addListener(this));
this.calculateApproval();
}
get name() { return this.#name; }
get students() { return [...this.#students]; }
get team() { return [...this.#staff, ...this.#monitors]; }
get approvalRate() { return this.#approvalRate; }
get adjustment() {
if (this.#approvalRate >= 60) return 'raise';
if (this.#approvalRate < 50) return 'discount';
return 'none';
}
addStudent(student, index = this.#students.length) {
student.addListener(this);
this.#students.splice(index, 0, student);
this.calculateApproval();
}
removeStudent(student) {
const index = this.#students.indexOf(student);
this.#students.splice(index, 1);
this.calculateApproval();
return index;
}
calculateApproval() {
const approved = this.#students.filter((student) => student.approved).length;
this.#approvalRate = this.#students.length ? (approved / this.#students.length) * 100 : 0;
if (this.#onChange) this.#onChange(this);
}
onStudentChange() {
this.calculateApproval();
}
}
(() => {
const studentsBody = document.querySelector('[data-school-students]');
const staffBody = document.querySelector('[data-school-staff]');
const rateOutput = document.querySelector('[data-school-rate]');
const rule = document.querySelector('[data-school-rule]');
const form = document.querySelector('[data-school-form]');
const newStudents = new WeakSet();
const MONEY_FORMAT = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const DECIMAL_FORMAT = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
const money = (value) => MONEY_FORMAT.format(value);
const decimal = (value) => DECIMAL_FORMAT.format(value);
const cell = (text, modifier = '') => {
const td = document.createElement('td');
td.className = modifier ? `sheet__cell sheet__cell--${modifier}` : 'sheet__cell';
td.textContent = text;
return td;
};
const badge = (text, modifier) => {
const td = cell('');
const span = document.createElement('span');
span.className = `badge badge--${modifier}`;
span.textContent = text;
td.append(span);
return td;
};
let subject = null;
const feedback = document.querySelector('[data-school-result]');
const removeWithUndo = (current, student) => {
const index = current.removeStudent(student);
feedback.className = 'result result--success';
feedback.textContent = `${student.name} removido(a) da turma.`;
const undo = document.createElement('button');
undo.className = 'result__action';
undo.type = 'button';
undo.textContent = 'Desfazer';
undo.addEventListener('click', () => {
current.addStudent(student, index);
feedback.textContent = `${student.name} voltou para a turma.`;
});
feedback.append(' ', undo);
};
const render = (current) => {
const rate = current.approvalRate;
rateOutput.textContent = `${decimal(rate)}%`;
const messages = {
raise: ['success', 'Aumento: 60% ou mais da turma foi aprovada — toda a equipe recebe reajuste para cima.'],
discount: ['error', 'Foram descontados: menos de 50% da turma foi aprovada.'],
none: ['warning', 'Entre 50% e 60% de aprovação: salários sem alteração.'],
};
const [modifier, text] = messages[current.adjustment];
rule.className = `result result--${modifier}`;
rule.textContent = text;
studentsBody.replaceChildren(...current.students.map((student) => {
const tr = document.createElement('tr');
tr.className = newStudents.has(student) ? 'sheet__row sheet__row--new' : 'sheet__row';
const remove = document.createElement('button');
remove.className = 'sheet__remove';
remove.type = 'button';
remove.textContent = '✕';
remove.setAttribute('aria-label', `Remover ${student.name} da turma`);
remove.addEventListener('click', () => removeWithUndo(current, student));
const actions = cell('');
actions.append(remove);
const nameCell = cell(student.name);
if (newStudents.has(student)) {
nameCell.append(Object.assign(document.createElement('span'), { className: 'visually-hidden', textContent: ' (novo)' }));
}
tr.append(
nameCell,
cell(student.email),
cell(student.grades.map(decimal).join(' · '), 'number'),
cell(decimal(student.average), 'number'),
cell(`${student.attendance}%`, 'number'),
student.approved ? badge('Aprovado', 'success') : badge('Reprovado', 'danger'),
actions,
);
return tr;
}));
staffBody.replaceChildren(...current.team.map((member) => {
const tr = document.createElement('tr');
tr.className = 'sheet__row';
const adjusted = { raise: member.raise(), discount: member.discount(), none: member.salary }[current.adjustment];
tr.append(
cell(member.constructor.role),
cell(member.name),
cell(member.detail),
cell(money(member.salary), 'number'),
cell(money(adjusted), 'number'),
);
return tr;
}));
};
const students = [
new Student(123456789, 'Bi', 28, 'hotops@gmail.com', [3, 2], 10),
new Student(987425511, 'Thai', 15, 'thai.f@gmail.com', [10, 10], 75),
new Student(715486513, 'Euzébio', 16, 'zeze@gmail.com', [5, 1], 50),
new Student(715486514, 'Claudinei', 17, 'meninoNey@gmail.com', [5, 1], 50),
];
const staff = [
new Teacher(1234567, 'Francis', 20, 'francisQuini@gmail.com', 'Matemática'),
new Teacher(1234568, 'Maria-de-Lurdes', 55, 'maria.lurdes@gmail.com', 'Inglês'),
new Teacher(1234569, 'Isaque', 30, 'isaque@gmail.com', 'Geografia'),
new Coordinator(3461572, 'Christiane', 51, 'chrisflor@gmail.com'),
new Coordinator(4478152, 'Marta', 47, 'martinha@gmail.com'),
new Coordinator(3465197, 'Julia', 29, 'julinha@gmail.com'),
];
const monitors = [
new Monitor(3512469, 'jubileu', 37, 'jubinho@gmail.com', 2010, 30),
new Monitor(7845946, 'Claudete', 45, 'cladetelindinha@gmail.com', 2018, 60),
new Monitor(2541364, 'Clóvis', 33, 'clovinho@gmail.com', 2014, 80),
];
subject = new Subject('porcentagem aprovada', students, staff, monitors, render);
form.addEventListener('submit', (event) => {
event.preventDefault();
const fields = form.elements;
const student = new Student(
Date.now(),
fields.namedItem('studentName').value.trim(),
Number(fields.namedItem('studentAge').value),
fields.namedItem('studentEmail').value.trim(),
[Number(fields.namedItem('grade1').value), Number(fields.namedItem('grade2').value)],
Number(fields.namedItem('attendance').value),
);
newStudents.add(student);
subject.addStudent(student);
form.reset();
});
})();
;
class Computer {
#processor = '';
#graphicsCard = '';
#powerSupply = '';
#motherboard = '';
get processor() { return this.#processor; }
set processor(value) { this.#processor = value; }
get graphicsCard() { return this.#graphicsCard; }
set graphicsCard(value) { this.#graphicsCard = value; }
get powerSupply() { return this.#powerSupply; }
set powerSupply(value) { this.#powerSupply = value; }
get motherboard() { return this.#motherboard; }
set motherboard(value) { this.#motherboard = value; }
speak() {
return 'Listando...';
}
}
class Room {
#sound = '';
#lighting = '';
get sound() { return this.#sound; }
set sound(value) { this.#sound = value; }
get lighting() { return this.#lighting; }
set lighting(value) { this.#lighting = value; }
speak() {
return 'PREPARANDO O AMBIENTE. . . . .';
}
}
(() => {
const screen = document.querySelector('[data-terminal]');
const roomForm = document.querySelector('[data-room-form]');
const focusField = document.querySelector('[data-room-focus]');
const computerForm = document.querySelector('[data-computer-form]');
const parts = document.querySelector('[data-computer-parts]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, reducedMotion ? 0 : ms));
let running = false;
const print = (text, color = '') => {
const line = document.createElement('p');
line.className = color ? `terminal__line terminal__line--${color}` : 'terminal__line';
line.textContent = text;
screen.append(line);
screen.scrollTop = screen.scrollHeight;
};
const clear = () => screen.replaceChildren();
const progress = async (steps, stepMs) => {
const row = document.createElement('div');
row.className = 'terminal__progress';
row.innerHTML = '<span class="terminal__track"><span class="terminal__fill"></span></span><span class="terminal__line"></span>';
const fill = row.querySelector('.terminal__fill');
const label = row.querySelector('.terminal__line');
screen.append(row);
for (let i = 1; i <= steps; i++) {
await sleep(stepMs);
fill.style.transform = `scaleX(${i / steps})`;
label.textContent = `${Math.round((i / steps) * 100)}% ${i}/${steps}`;
}
};
const run = async (task) => {
if (running) return;
running = true;
clear();
await task();
running = false;
};
roomForm.addEventListener('change', (event) => {
if (event.target.name === 'sound') {
focusField.hidden = event.target.value !== 'Mediano';
}
});
roomForm.addEventListener('submit', (event) => {
event.preventDefault();
const sound = roomForm.elements.namedItem('sound').value;
const focus = roomForm.elements.namedItem('focus').value;
if (sound === 'Mediano' && !focus) {
focusField.querySelector('input').focus();
return;
}
run(async () => {
const room = new Room();
print(room.speak(), 'yellow');
await progress(5, 200);
await sleep(500);
clear();
room.sound = sound;
print(`? Como está o som do ambiente? ${sound}`, 'magenta');
if (sound === 'Barulheira') {
print('Você não irá conseguir se concentrar! Espere tudo ficar mais calmo');
} else if (sound === 'Silêncio') {
print('Colocando um lofi . . .', 'magenta');
await sleep(500);
print('Pronto para programar!@~');
} else if (focus === 'yes') {
print('Você vai conseguir se concentrar na programação? [1] Sim', 'magenta');
print(`Som ao redor: ${room.sound}.`, 'green');
await sleep(1000);
print('Começando a codar. . .');
} else {
print('Você vai conseguir se concentrar na programação? [2] Não', 'magenta');
await sleep(1000);
print('Espere um pouco para começar, programe com vontade, paciência e calma.');
}
});
});
computerForm.addEventListener('change', (event) => {
if (event.target.name === 'power') {
parts.hidden = event.target.value === 'off';
}
});
computerForm.addEventListener('submit', (event) => {
event.preventDefault();
const fields = computerForm.elements;
run(async () => {
print(`? Computador: ${fields.namedItem('power').value}`, 'magenta');
if (fields.namedItem('power').value === 'off') {
print('Computador desligado.');
return;
}
print('Ligando computador..');
await sleep(800);
const computer = new Computer();
computer.processor = fields.namedItem('processor').value.trim() || '(não informado)';
computer.graphicsCard = fields.namedItem('graphicsCard').value.trim() || '(não informado)';
computer.powerSupply = fields.namedItem('powerSupply').value.trim() || '(não informado)';
computer.motherboard = fields.namedItem('motherboard').value.trim() || '(não informado)';
print(computer.speak(), 'yellow');
await sleep(1000);
print('📋 Itens:');
print(`    ✒️ Processador: ${computer.processor}`);
print(`    ✒️ Placa de Vídeo: ${computer.graphicsCard}`);
print(`    ✒️ Fonte para o computador: ${computer.powerSupply}`);
print(`    ✒️ Placa Mãe: ${computer.motherboard}`);
});
});
})();