// Execution timer: port of calc-code-time/main.py using performance.now().

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
        // Let the browser paint "Executando…" before a blocking task starts.
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
