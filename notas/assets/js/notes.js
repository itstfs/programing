// Notes: text search across cards and copy-to-clipboard for snippets.

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

    // Many "Copiar" buttons: each accessible name says what it copies (WCAG 2.4.6).
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
