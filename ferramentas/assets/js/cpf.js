// CPF validator: port of cpf-validator/calc-cpf.java.
// 9 digits -> computes both check digits; 10 -> checks the 1st; 11 -> checks both.

(() => {
    const form = document.querySelector('[data-cpf-form]');
    const input = form.cpf;
    const result = document.querySelector('[data-cpf-result]');

    const format = (cpf) => `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;

    // Weighted sum from (length + 1) down to 2, then 11 - (sum % 11); above 9 becomes 0.
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

    // Light mask while typing: 000.000.000-00
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

        // Not in the original: sequences like 111.111.111-11 pass the math but are invalid.
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
