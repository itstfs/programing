// Writes the shared partials into every page (no dependencies): node tools/sync.mjs
// shared/ is the single source for everything common to the pages:
//   shared/partials/  head.html · header.html · footer.html
//   shared/css/       CSS layers 01–07
//   shared/js/        header.js · tabs.js
//   shared/img/       logo, favicon and touch icon
// This script only renders shared/partials/ and the list of shared <link>/<script> tags
// between the markers of each index.html. Nothing is copied: in development the pages
// point straight to shared/. tools/build.mjs makes each interface self-contained in dist/.
//
// Why a script: CLAUDE.md forbids @import (request chains) and the project has no bundler,
// so the common HTML has to be written into each page.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PARTIALS = join(ROOT, 'shared', 'partials');

// CSS layers, in cascade order (see shared/css/). The order of these lists is the cascade order:
// file names carry no number, so a new layer goes in the right position here.
const ALL_CSS = ['settings', 'base', 'layout', 'navigation', 'forms', 'feedback', 'code'];
const HUB_CSS = ['settings', 'base', 'layout', 'navigation'];

// root: path from the page to the project root. css/js: what the page needs from shared/
// (the hub has no forms, messages, source viewer or tabs).
export const PAGES = [
    { id: 'home', dir: '', root: '', css: HUB_CSS, js: ['header'] },
    { id: 'arcade', dir: 'arcade', root: '../', css: ALL_CSS, js: ['header', 'tabs'] },
    { id: 'ferramentas', dir: 'ferramentas', root: '../', css: ALL_CSS, js: ['header', 'tabs'] },
    { id: 'excel', dir: 'excel', root: '../', css: ALL_CSS, js: ['header', 'tabs'] },
    { id: 'poo', dir: 'poo', root: '../', css: ALL_CSS, js: ['header', 'tabs'] },
    { id: 'notas', dir: 'notas', root: '../', css: ALL_CSS, js: ['header', 'tabs'] },
];

const read = (path) => readFileSync(path, 'utf8');

const render = (template, page, indent) => template
    .trimEnd()
    .replaceAll('{{shared}}', `${page.root}shared/`)
    .replaceAll('{{root}}', page.root)
    .replace(/\{\{current:([a-z]+)\}\}/g, (_, id) => (id === page.id ? ' aria-current="page"' : ''))
    .split('\n')
    .map((line) => (line ? indent + line : line))
    .join('\n');

const replaceBlock = (html, name, content, file) => {
    const pattern = new RegExp(`( *)<!-- shared:${name} -->[\\s\\S]*?<!-- /shared:${name} -->`);
    const match = html.match(pattern);
    if (!match) throw new Error(`${file}: marcadores <!-- shared:${name} --> não encontrados`);
    const indent = match[1];
    return html.replace(pattern, `${indent}<!-- shared:${name} -->\n${content}\n${indent}<!-- /shared:${name} -->`);
};

// Shared CSS layers, then the page's own site.css, then the shared scripts.
const assetsBlock = (page) => [
    ...page.css.map((name) => `<link rel="stylesheet" href="${page.root}shared/css/${name}.css">`),
    '<link rel="stylesheet" href="assets/css/site.css">',
    ...page.js.map((name) => `<script src="${page.root}shared/js/${name}.js" defer></script>`),
].map((line) => `    ${line}`).join('\n');

export const sync = () => {
    const head = read(join(PARTIALS, 'head.html'));
    const header = read(join(PARTIALS, 'header.html'));
    const footer = read(join(PARTIALS, 'footer.html'));
    const changes = [];

    for (const page of PAGES) {
        const file = join(ROOT, page.dir, 'index.html');
        const before = read(file);
        let html = before;
        html = replaceBlock(html, 'head', render(head, page, '    '), file);
        html = replaceBlock(html, 'assets', assetsBlock(page), file);
        html = replaceBlock(html, 'header', render(header, page, '    '), file);
        html = replaceBlock(html, 'footer', render(footer, page, '    '), file);
        if (html !== before) {
            writeFileSync(file, html);
            changes.push(page.dir ? `${page.dir}/index.html` : 'index.html');
        }
    }

    return changes;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    const changes = sync();
    console.log(changes.length ? `Atualizados:\n  ${changes.join('\n  ')}` : 'Tudo sincronizado — nada mudou.');
}
