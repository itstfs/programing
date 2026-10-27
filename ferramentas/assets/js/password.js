// Password generator: port of password-tkinter/main.py.
// Uses crypto.getRandomValues instead of Math.random for unbiased, secure picks.

(() => {
    const form = document.querySelector('[data-password-form]');
    const output = document.querySelector('[data-password-output]');
    const lengthSelect = document.querySelector('[data-password-length]');
    const numbersButton = document.querySelector('[data-password-numbers]');
    const copyButton = document.querySelector('[data-password-copy]');
    const result = document.querySelector('[data-password-result]');

    const LOWER = 'abcdefghijklmnopqrstuvwxyz';
    const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const DIGITS = '0123456789';
    const SYMBOLS = '!@#$%^&*()';
    const CHARSETS = {
        low: LOWER,
        medium: UPPER + LOWER,
        strong: UPPER + LOWER + DIGITS + SYMBOLS,
    };

    for (let size = 8; size <= 32; size++) {
        lengthSelect.add(new Option(String(size), String(size)));
    }

    const randomIndex = (max) => {
        // Rejection sampling keeps every character equally likely.
        const limit = Math.floor(0x100000000 / max) * max;
        const buffer = new Uint32Array(1);
        do {
            crypto.getRandomValues(buffer);
        } while (buffer[0] >= limit);
        return buffer[0] % max;
    };

    const generate = (charset) => {
        const length = Number(lengthSelect.value);
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset[randomIndex(charset.length)];
        }
        output.value = password;
        result.textContent = '';
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        generate(CHARSETS[form.strength.value]);
    });

    numbersButton.addEventListener('click', () => generate(DIGITS));

    copyButton.addEventListener('click', async () => {
        if (!output.value) {
            result.className = 'result result--warning';
            result.textContent = 'Gere uma senha antes de copiar.';
            return;
        }
        try {
            await navigator.clipboard.writeText(output.value);
            result.className = 'result result--success';
            result.textContent = 'Senha copiada!';
        } catch {
            output.select();
            result.className = 'result result--warning';
            result.textContent = 'Não consegui copiar automaticamente — a senha está selecionada, use Ctrl+C.';
        }
    });
})();
