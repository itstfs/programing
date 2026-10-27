// Tablists (segmented ".switch" and underlined ".tabs") and lazy loading of original sources.
// Pages load this file directly (no sync needed); tools/build.mjs bundles it in dist/.

const sourceCache = new Map();

// Original files may be UTF-8 or Windows-1252; try the strict one first.
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

    // Nothing to copy until the file is loaded.
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

// "Copiar código": copies the open file, with visible and announced feedback.
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
        // Fallback: select the code so Ctrl+C works.
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

// The active modifier follows the tab's own block: switch__option--active or tabs__button--active.
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

    // Arrow keys move between tabs; Home/End jump to the first/last one.
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
