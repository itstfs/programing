# Ferramentas

Pequenos utilitários feitos para treinar formulários, validação, cálculo e manipulação de imagem.

[← Voltar ao README do projeto](../README.md)

## Treinos

| Treino | Original | Linguagem | O que a versão web faz |
|---|---|---|---|
| Calculadora de IMC | `source/calc-imc/` | HTML/CSS/JS | Mesmas faixas e mensagens do original. |
| Validador de CPF | `source/cpf-validator/` | Java | 11 dígitos valida, 10 confere o 1º dígito, 9 calcula os dois dígitos verificadores. Mostra o passo a passo do módulo 11 e rejeita sequências repetidas (111.111.111-11). |
| Gerador de senha | `source/password-tkinter/main.py` | Python + Tkinter | Comprimento de 8 a 32, força Baixo/Médio/Forte, “Gerar números” e copiar. Usa `crypto.getRandomValues`. |
| Escolha de turno | `source/turnos/turno1` e `turno2` | JavaScript | Une as duas versões: `select` (turno 2) e digitar a letra com `switch` (turno 1). |
| Tempo de execução | `source/calc-code-time/main.py` | Python | Mede com `performance.now()` três tarefas: a do original (escrever + esperar N s), somar 1..N e ordenar N números. |
| Recortar imagem | `source/crop-image/main.py` | Python + Pillow | Envia uma imagem (não sai do navegador), ajusta esquerda/cima/direita/baixo, vê a área marcada, recorta e baixa em PNG. Tem imagem de exemplo e “Remover imagem”. |

## Arquivos

```
index.html
assets/css/site.css     ← visual específico (resultado do CPF, prévia do recorte…)
assets/js/imc.js        ← Calculadora de IMC
assets/js/cpf.js        ← Validador de CPF
assets/js/password.js   ← Gerador de senha
assets/js/shift.js      ← Escolha de turno
assets/js/code-time.js  ← Tempo de execução
assets/js/crop.js       ← Recortar imagem
source/                 ← originais, sem alterações
```

O header, o footer e o CSS/JS comuns vêm de [`../shared/`](../shared/README.md).

## Rodar os originais

```bash
pip install pillow pyperclip
python source/password-tkinter/main.py
python source/calc-code-time/main.py
python source/crop-image/main.py
```

- **Java (CPF):** dentro de `source/cpf-validator/`, rode `javac *.java && java Main`. O arquivo `calc-cpf.java` precisa se chamar `calcCpf.java` para compilar.
- **IMC e turnos:** são HTML; abra o `index.html` de cada pasta no navegador.

