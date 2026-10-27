// Computer + room wizards: port of inquirer/computer.py and inquirer/ambiente.py.
// The "terminal" replays the CLI output line by line, including the tqdm progress bar.

class Computer {
    #processor = '';
    #graphicsCard = '';
    #powerSupply = '';
    #motherboard = '';

    get processor() { return this.#processor; }
    set processor(value) { this.#processor = value; }
    get graphicsCard() { return this.#graphicsCard; }
    set graphicsCard(value) { this.#graphicsCard = value; }
    get powerSupply() { return this.#powerSupply; }
    set powerSupply(value) { this.#powerSupply = value; }
    get motherboard() { return this.#motherboard; }
    set motherboard(value) { this.#motherboard = value; }

    speak() {
        return 'Listando...';
    }
}

class Room {
    #sound = '';
    #lighting = '';

    get sound() { return this.#sound; }
    set sound(value) { this.#sound = value; }
    get lighting() { return this.#lighting; }
    set lighting(value) { this.#lighting = value; }

    speak() {
        return 'PREPARANDO O AMBIENTE. . . . .';
    }
}

(() => {
    const screen = document.querySelector('[data-terminal]');
    const roomForm = document.querySelector('[data-room-form]');
    const focusField = document.querySelector('[data-room-focus]');
    const computerForm = document.querySelector('[data-computer-form]');
    const parts = document.querySelector('[data-computer-parts]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, reducedMotion ? 0 : ms));
    let running = false;

    const print = (text, color = '') => {
        const line = document.createElement('p');
        line.className = color ? `terminal__line terminal__line--${color}` : 'terminal__line';
        line.textContent = text;
        screen.append(line);
        screen.scrollTop = screen.scrollHeight;
    };

    const clear = () => screen.replaceChildren();

    // tqdm(range(steps)) look-alike: animates only transform.
    const progress = async (steps, stepMs) => {
        const row = document.createElement('div');
        row.className = 'terminal__progress';
        row.innerHTML = '<span class="terminal__track"><span class="terminal__fill"></span></span><span class="terminal__line"></span>';
        const fill = row.querySelector('.terminal__fill');
        const label = row.querySelector('.terminal__line');
        screen.append(row);
        for (let i = 1; i <= steps; i++) {
            await sleep(stepMs);
            fill.style.transform = `scaleX(${i / steps})`;
            label.textContent = `${Math.round((i / steps) * 100)}% ${i}/${steps}`;
        }
    };

    const run = async (task) => {
        if (running) return;
        running = true;
        clear();
        await task();
        running = false;
    };

    roomForm.addEventListener('change', (event) => {
        if (event.target.name === 'sound') {
            focusField.hidden = event.target.value !== 'Mediano';
        }
    });

    roomForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const sound = roomForm.elements.namedItem('sound').value;
        const focus = roomForm.elements.namedItem('focus').value;

        if (sound === 'Mediano' && !focus) {
            focusField.querySelector('input').focus();
            return;
        }

        run(async () => {
            const room = new Room();
            print(room.speak(), 'yellow');
            await progress(5, 200);
            await sleep(500);
            clear();
            room.sound = sound;
            print(`? Como está o som do ambiente? ${sound}`, 'magenta');

            if (sound === 'Barulheira') {
                print('Você não irá conseguir se concentrar! Espere tudo ficar mais calmo');
            } else if (sound === 'Silêncio') {
                print('Colocando um lofi . . .', 'magenta');
                await sleep(500);
                print('Pronto para programar!@~');
            } else if (focus === 'yes') {
                print('Você vai conseguir se concentrar na programação? [1] Sim', 'magenta');
                print(`Som ao redor: ${room.sound}.`, 'green');
                await sleep(1000);
                print('Começando a codar. . .');
            } else {
                print('Você vai conseguir se concentrar na programação? [2] Não', 'magenta');
                await sleep(1000);
                print('Espere um pouco para começar, programe com vontade, paciência e calma.');
            }
        });
    });

    computerForm.addEventListener('change', (event) => {
        if (event.target.name === 'power') {
            parts.hidden = event.target.value === 'off';
        }
    });

    computerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const fields = computerForm.elements;

        run(async () => {
            print(`? Computador: ${fields.namedItem('power').value}`, 'magenta');

            if (fields.namedItem('power').value === 'off') {
                print('Computador desligado.');
                return;
            }

            print('Ligando computador..');
            await sleep(800);

            const computer = new Computer();
            computer.processor = fields.namedItem('processor').value.trim() || '(não informado)';
            computer.graphicsCard = fields.namedItem('graphicsCard').value.trim() || '(não informado)';
            computer.powerSupply = fields.namedItem('powerSupply').value.trim() || '(não informado)';
            computer.motherboard = fields.namedItem('motherboard').value.trim() || '(não informado)';

            print(computer.speak(), 'yellow');
            await sleep(1000);
            print('📋 Itens:');
            print(`    ✒️ Processador: ${computer.processor}`);
            print(`    ✒️ Placa de Vídeo: ${computer.graphicsCard}`);
            print(`    ✒️ Fonte para o computador: ${computer.powerSupply}`);
            print(`    ✒️ Placa Mãe: ${computer.motherboard}`);
        });
    });
})();
