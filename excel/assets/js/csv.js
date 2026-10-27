// Minimal ";"-separated CSV helpers shared by the sheet trainings (no libraries).

window.Csv = (() => {
    // Original exports are Latin-1; detect by trying strict UTF-8 first.
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

    // Parses in chunks and yields to the main thread so big files don't freeze the page.
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

    // Adds a BOM so Excel opens accents correctly.
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
