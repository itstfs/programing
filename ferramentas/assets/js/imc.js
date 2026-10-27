// BMI calculator: port of calc-imc/assets/js/main.js (same ranges and messages).

(() => {
    const form = document.querySelector('[data-imc-form]');
    const result = document.querySelector('[data-imc-result]');

    const RANGES = [
        { max: 18.49, text: 'Isso significa que você está abaixo do peso. 😦', modifier: 'warning' },
        { max: 24.99, text: 'Seu IMC é considerado "Normal". 😄', modifier: 'success' },
        { max: 29.99, text: 'Isso significa "Pré-obesidade". 😕', modifier: 'warning' },
        { max: 34.99, text: 'Você é considerado "Obeso de Grau 1". 😯', modifier: 'error' },
        { max: 39.99, text: 'Você é considerado "Obeso de Grau 2". 😯', modifier: 'error' },
        { max: Infinity, text: 'Sua classificação é "Obesidade grave, grau 3". 😰', modifier: 'error' },
    ];

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const height = Number(form.height.value);
        const weight = Number(form.weight.value);
        const imc = Number((weight / (height * height)).toFixed(2));

        if (!Number.isFinite(imc) || imc <= 0) {
            result.className = 'result result--error';
            result.innerHTML = 'Seu IMC é de: <strong class="highlight">0</strong> — Algo de errado não está certo... 😜';
            return;
        }

        const range = RANGES.find((item) => imc <= item.max);
        result.className = `result result--${range.modifier}`;
        result.innerHTML = `Seu IMC é de: <strong class="highlight">${imc.toLocaleString('pt-BR')}</strong> — ${range.text}`;
    });
})();
