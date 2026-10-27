// Add a row to the people sheet: port of excel-python/add/main.py.

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
        // Numeric columns (all but "Nome") are right-aligned, header included.
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
        // Same as planilha.loc[qtd_linhas, col] = value: write after the last row.
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
