// Shift greeting: merges turnos/turno2 (select) and turnos/turno1 (typed letter + switch).

(() => {
    const select = document.querySelector('[data-shift-select]');
    const letter = document.querySelector('[data-shift-letter]');
    const result = document.querySelector('[data-shift-result]');

    const greet = (value) => {
        const shift = value.trim().toUpperCase();
        result.className = 'result result--success';

        switch (shift) {
            case 'M':
                result.textContent = `${shift}, Bom dia! ☀️`;
                break;
            case 'V':
                result.textContent = `${shift}, Boa tarde! 🌤️`;
                break;
            case 'N':
                result.textContent = `${shift}, Boa noite! 🌙`;
                break;
            case '':
                result.textContent = '';
                break;
            default:
                result.className = 'result result--error';
                result.textContent = `${value.trim()} não existe`;
        }
    };

    select.addEventListener('change', () => {
        letter.value = '';
        greet(select.value);
    });

    letter.addEventListener('input', () => {
        select.value = '';
        greet(letter.value);
    });
})();
