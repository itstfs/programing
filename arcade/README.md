# Arcade

Joguinhos feitos para treinar lógica, laços e desenho na tela: um minigame de adivinhação, o Snake e a chuva do Matrix.

[← Voltar ao README do projeto](../README.md)

## Treinos

| Treino | Original | Linguagem | O que a versão web faz |
|---|---|---|---|
| Adivinhe o número | `source/minigame/number/main.py` | Python | Chute de 0 a 5 contra um número aleatório, com placar de acertos e “Zerar placar”. |
| Snake | `source/minigame/snake/main.py` | Python + pygame | Snake em `<canvas>` com as mesmas cores e velocidade (10 passos/s). Adiciona colisão com parede e corpo, pontuação, recorde, pausa e controles por toque (botões e deslizar). |
| Matrix | `source/matrix/` | JavaScript | Chuva de katakanas em `<canvas>`, com palavra e cor personalizáveis. Pausa fora da tela e respeita `prefers-reduced-motion`. |

## Arquivos

```
index.html
assets/css/site.css     ← visual do placar, canvas e controles de toque
assets/js/number.js     ← Adivinhe o número
assets/js/snake.js      ← Snake
assets/js/matrix.js     ← Matrix
source/                 ← originais, sem alterações
```

O header, o footer e o CSS/JS comuns vêm de [`../shared/`](../shared/README.md).

## Rodar os originais

```bash
pip install pygame
python source/minigame/number/main.py
python source/minigame/snake/main.py
```

O Snake precisa de uma imagem `cobraa.png` na pasta para o ícone da janela. O Matrix é HTML: abra `source/matrix/index.html` no navegador.

## Notas

- Os canvas do Snake e do Matrix ficam escuros nos dois temas, porque representam uma tela.
