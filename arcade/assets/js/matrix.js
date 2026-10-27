// Matrix rain: port of matrix/index.js, sized to its frame instead of the whole window.

(() => {
    const canvas = document.querySelector('[data-matrix-canvas]');
    const context = canvas.getContext('2d');
    const wordInput = document.querySelector('[data-matrix-word]');
    const colorInput = document.querySelector('[data-matrix-color]');
    const toggleButton = document.querySelector('[data-matrix-toggle]');
    const status = document.querySelector('[data-matrix-status]');

    const KATAKANA = '❤︎アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const NUMS = '0123456789';
    const FONT_SIZE = 16;
    const FRAME_MS = 30;

    let alphabet = '';
    let rainDrops = [];
    let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let visible = false;
    let lastFrame = 0;
    let frameId = 0;

    const buildAlphabet = () => {
        alphabet = [...(KATAKANA + wordInput.value.toUpperCase() + NUMS)];
    };

    const resize = () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        rainDrops = Array.from({ length: Math.ceil(canvas.width / FONT_SIZE) }, () => 1);

        // Paused (e.g. reduced motion): paint a static frame so the canvas is not empty.
        if (!playing) {
            for (let i = 0; i < 40; i++) draw();
        }
    };

    const draw = () => {
        context.fillStyle = 'rgba(0, 0, 0, 0.05)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = colorInput.value;
        context.font = `${FONT_SIZE}px monospace`;

        for (let i = 0; i < rainDrops.length; i++) {
            const text = alphabet[Math.floor(Math.random() * alphabet.length)];
            context.fillText(text, i * FONT_SIZE, rainDrops[i] * FONT_SIZE);

            if (rainDrops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) {
                rainDrops[i] = 0;
            }
            rainDrops[i]++;
        }
    };

    const loop = (time) => {
        if (!playing || !visible) return;
        if (time - lastFrame >= FRAME_MS) {
            lastFrame = time;
            draw();
        }
        frameId = requestAnimationFrame(loop);
    };

    const start = () => {
        cancelAnimationFrame(frameId);
        if (playing && visible) frameId = requestAnimationFrame(loop);
    };

    const updateToggle = () => {
        toggleButton.textContent = playing ? 'Pausar' : 'Reproduzir';
    };

    toggleButton.addEventListener('click', () => {
        playing = !playing;
        updateToggle();
        status.textContent = playing ? 'Animação em andamento.' : 'Animação pausada.';
        start();
    });

    wordInput.addEventListener('input', buildAlphabet);

    new ResizeObserver(resize).observe(canvas);

    // Only animate while the canvas is on screen.
    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        start();
    }).observe(canvas);

    buildAlphabet();
    updateToggle();
})();
