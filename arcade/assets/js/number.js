// Guess the number: port of minigame/number/main.py.

(() => {
    const form = document.querySelector('[data-number-form]');
    const result = document.querySelector('[data-number-result]');
    const score = document.querySelector('[data-number-score]');
    const reset = document.querySelector('[data-number-reset]');
    const MAX = 5;
    let attempts = 0;
    let hits = 0;

    const showResult = (html, modifier) => {
        result.className = `result result--${modifier}`;
        result.innerHTML = html;
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const guess = Number(form.guess.value);

        if (!Number.isInteger(guess) || guess < 0 || guess > MAX) {
            showResult(`Você é louco? Digite um número entre 0 a ${MAX}.`, 'warning');
            return;
        }

        const computer = Math.floor(Math.random() * (MAX + 1));
        attempts += 1;

        if (computer === guess) {
            hits += 1;
            showResult(`Parabéns, o número que você digitou foi <span class="highlight">${guess}</span>, e o número que pensei foi <span class="highlight highlight--warning">${computer}</span>.`, 'success');
        } else {
            showResult(`Que triste, você errou. Você digitou <span class="highlight">${guess}</span> e eu pensei no número <span class="highlight highlight--warning">${computer}</span>.`, 'error');
        }

        score.textContent = `Acertos: ${hits} de ${attempts} tentativa${attempts === 1 ? '' : 's'}`;
        reset.hidden = false;
        form.guess.select();
    });

    // User control: start the score over without reloading the page.
    reset.addEventListener('click', () => {
        attempts = 0;
        hits = 0;
        score.textContent = 'Acertos: 0 de 0 tentativas';
        result.textContent = '';
        reset.hidden = true;
        form.guess.focus();
    });
})();
