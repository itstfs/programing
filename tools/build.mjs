// Production build (no dependencies): node tools/build.mjs
// Turns each page into a self-contained folder in dist/ (publish dist/<interface> on its own URL):
// - runs tools/sync.mjs first, so the shared partials are up to date;
// - merges every stylesheet the page links (shared/css layers + site.css), minified, into one inline <style>;
// - concatenates every deferred script (shared/js + the page's own) into one hashed app.<hash>.js;
// - copies the images from shared/img/ into the page's assets/img/ and rewrites the paths;
// - copies the page's data and original sources.

import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PAGES, ROOT, sync } from './sync.mjs';

const DIST = join(ROOT, 'dist');
const SHARED_IMG = join(ROOT, 'shared', 'img');
// Images the pages actually use (logo.jpg is only the original the others were made from).
const PAGE_IMAGES = ['logo-64.webp', 'logo-128.webp', 'favicon-32.png', 'apple-touch-icon-180.png'];

const minifyCss = (css) => css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();

// Conservative on purpose: drops whole-line comments, indentation and blank lines,
// keeping line breaks so automatic semicolon insertion still behaves the same.
const minifyJs = (js) => js
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('//'))
    .join('\n');

const hash = (text) => createHash('sha256').update(text).digest('hex').slice(0, 8);

// Too big to publish (66 MB); the site ships a sample and can import the full file.
const EXCLUDED = ['servidores.csv'];

const copyIfExists = (from, to) => {
    if (existsSync(from)) {
        cpSync(from, to, { recursive: true, filter: (src) => !EXCLUDED.some((name) => src.endsWith(name)) });
    }
};

// Shared partials first, so dist/ never ships a stale header or footer.
const synced = sync();
if (synced.length) console.log(`sync: ${synced.length} arquivo(s) atualizados`);

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

const report = [];

for (const { id, dir, root } of PAGES) {
    const from = join(ROOT, dir);
    const to = join(DIST, dir);
    mkdirSync(to, { recursive: true });

    let html = readFileSync(join(from, 'index.html'), 'utf8');
    // All stylesheet links (shared layers + site.css), in order, become one inline <style>.
    const links = [...html.matchAll(/ *<link rel="stylesheet" href="([^"]+\.css)">\n/g)];
    const css = minifyCss(links.map(([, href]) => readFileSync(join(from, href), 'utf8')).join('\n'));
    links.forEach(([tag], index) => {
        html = html.replace(tag, index === 0 ? `    <style>${css}</style>\n` : '');
    });
    // The sync markers are only useful in the source.
    html = html.replace(/ *<!-- \/?shared:[a-z]+ -->\n/g, '');

    // Images: shared/img/ → the page's own assets/img/, so the folder works alone.
    mkdirSync(join(to, 'assets', 'img'), { recursive: true });
    PAGE_IMAGES.forEach((name) => cpSync(join(SHARED_IMG, name), join(to, 'assets', 'img', name)));
    html = html.replaceAll(`${root}shared/img/`, 'assets/img/');

    const scripts = [...html.matchAll(/ *<script src="([^"]+\.js)" defer><\/script>\n/g)];
    let bundle = '';
    if (scripts.length) {
        bundle = scripts
            .map(([, src]) => minifyJs(readFileSync(join(from, src), 'utf8')))
            .join('\n;\n');
        const bundleName = `app.${hash(bundle)}.js`;
        mkdirSync(join(to, 'assets', 'js'), { recursive: true });
        writeFileSync(join(to, 'assets', 'js', bundleName), bundle);
        scripts.forEach(([tag], index) => {
            html = html.replace(tag, index === 0 ? `    <script src="assets/js/${bundleName}" defer></script>\n` : '');
        });
    }
    if (html.includes('shared/')) throw new Error(`${id}: ainda há caminho para shared/ no HTML final`);
    writeFileSync(join(to, 'index.html'), html);

    if (dir) {
        copyIfExists(join(from, 'assets', 'data'), join(to, 'assets', 'data'));
        copyIfExists(join(from, 'source'), join(to, 'source'));
    }

    report.push(`${id.padEnd(12)} css ${(css.length / 1024).toFixed(1)} KB inline · js ${(bundle.length / 1024).toFixed(1)} KB (${scripts.length} → ${scripts.length ? 1 : 0} arquivo)`);
}

console.log(`dist/ gerado em ${DIST}\n${report.join('\n')}`);
