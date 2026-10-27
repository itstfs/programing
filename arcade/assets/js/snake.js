// Snake: port of minigame/snake/main.py (pygame) to canvas.
// Same colors and speed (10 steps/s); adds wall/self collision, score and touch controls.

(() => {
    const canvas = document.querySelector('[data-snake-board]');
    const context = canvas.getContext('2d');
    const scoreOutput = document.querySelector('[data-snake-score]');
    const bestOutput = document.querySelector('[data-snake-best]');
    const status = document.querySelector('[data-snake-status]');
    const startButton = document.querySelector('[data-snake-start]');
    const pauseButton = document.querySelector('[data-snake-pause]');
    const pad = document.querySelector('.snake__pad');

    const CELL = 20;
    const GRID = canvas.width / CELL;
    const STEP_MS = 100;
    const SNAKE_COLOR = '#ff69b4';
    const FRUIT_COLOR = '#00ff00';
    const BEST_KEY = 'arcade-snake-best';
    const DIRECTIONS = {
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
    };
    const KEYS = {
        ArrowUp: 'up', KeyW: 'up',
        ArrowDown: 'down', KeyS: 'down',
        ArrowLeft: 'left', KeyA: 'left',
        ArrowRight: 'right', KeyD: 'right',
    };

    let snake = [];
    let fruit = null;
    let direction = DIRECTIONS.left;
    let queuedDirection = direction;
    let score = 0;
    let best = 0;
    let running = false;
    let paused = false;
    let visible = true;
    let lastStep = 0;
    let frameId = 0;

    try {
        best = Number(localStorage.getItem(BEST_KEY)) || 0;
    } catch {
        best = 0;
    }
    bestOutput.textContent = best;

    const randomCell = () => {
        let cell;
        do {
            cell = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
        } while (snake.some((part) => part.x === cell.x && part.y === cell.y));
        return cell;
    };

    const draw = () => {
        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvas.width, canvas.height);

        if (fruit) {
            context.fillStyle = FRUIT_COLOR;
            context.fillRect(fruit.x * CELL + 2, fruit.y * CELL + 2, CELL - 4, CELL - 4);
        }

        context.fillStyle = SNAKE_COLOR;
        snake.forEach((part) => {
            context.fillRect(part.x * CELL + 1, part.y * CELL + 1, CELL - 2, CELL - 2);
        });
    };

    const setStatus = (text) => {
        status.textContent = text;
    };

    const gameOver = () => {
        running = false;
        cancelAnimationFrame(frameId);
        pauseButton.disabled = true;
        startButton.textContent = 'Jogar de novo';

        if (score > best) {
            best = score;
            bestOutput.textContent = best;
            try {
                localStorage.setItem(BEST_KEY, String(best));
            } catch {
                // Storage unavailable: the record lasts only for this visit.
            }
            setStatus(`Fim de jogo — novo recorde: ${score}!`);
            return;
        }
        setStatus(`Fim de jogo — ${score} ponto${score === 1 ? '' : 's'}.`);
    };

    const step = () => {
        direction = queuedDirection;
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
        const hitsWall = head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID;
        const hitsBody = snake.some((part) => part.x === head.x && part.y === head.y);

        if (hitsWall || hitsBody) {
            gameOver();
            return;
        }

        snake.unshift(head);

        if (head.x === fruit.x && head.y === fruit.y) {
            score += 1;
            scoreOutput.textContent = score;
            fruit = randomCell();
        } else {
            snake.pop();
        }
    };

    const loop = (time) => {
        if (!running || paused || !visible) return;

        if (time - lastStep >= STEP_MS) {
            lastStep = time;
            step();
            draw();
        }

        if (running) frameId = requestAnimationFrame(loop);
    };

    const resume = () => {
        cancelAnimationFrame(frameId);
        lastStep = performance.now();
        frameId = requestAnimationFrame(loop);
    };

    const start = () => {
        const middle = Math.floor(GRID / 2);
        snake = [{ x: middle, y: middle }, { x: middle + 1, y: middle }, { x: middle + 2, y: middle }];
        direction = DIRECTIONS.left;
        queuedDirection = direction;
        fruit = randomCell();
        score = 0;
        scoreOutput.textContent = score;
        running = true;
        paused = false;
        startButton.textContent = 'Reiniciar';
        pauseButton.disabled = false;
        pauseButton.textContent = 'Pausar';
        setStatus('Valendo!');
        draw();
        resume();
    };

    const togglePause = () => {
        if (!running) return;
        paused = !paused;
        pauseButton.textContent = paused ? 'Continuar' : 'Pausar';
        setStatus(paused ? 'Pausado.' : 'Valendo!');
        if (!paused) resume();
    };

    const turn = (name) => {
        const next = DIRECTIONS[name];
        // Block 180° turns, which would make the snake hit itself immediately.
        if (!next || (next.x === -direction.x && next.y === -direction.y)) return;
        queuedDirection = next;
    };

    startButton.addEventListener('click', start);
    pauseButton.addEventListener('click', togglePause);

    pad.addEventListener('click', (event) => {
        const key = event.target.closest('[data-direction]');
        if (key) turn(key.dataset.direction);
    });

    document.addEventListener('keydown', (event) => {
        if (!running || event.target.closest('input, select, textarea')) return;
        if (event.code === 'Space' || event.code === 'KeyP') {
            event.preventDefault();
            togglePause();
            return;
        }
        if (KEYS[event.code]) {
            event.preventDefault();
            turn(KEYS[event.code]);
        }
    });

    let touchStart = null;
    canvas.addEventListener('touchstart', (event) => {
        touchStart = event.changedTouches[0];
    }, { passive: true });

    canvas.addEventListener('touchend', (event) => {
        if (!touchStart) return;
        const end = event.changedTouches[0];
        const dx = end.clientX - touchStart.clientX;
        const dy = end.clientY - touchStart.clientY;
        touchStart = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
        if (Math.abs(dx) > Math.abs(dy)) {
            turn(dx > 0 ? 'right' : 'left');
        } else {
            turn(dy > 0 ? 'down' : 'up');
        }
    }, { passive: true });

    // Pause automatically when the board leaves the screen or the tab is hidden.
    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && running && !paused) resume();
    }).observe(canvas);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && running && !paused) togglePause();
    });

    draw();
})();
