# POO

Treinos de programação orientada a objetos (herança, encapsulamento, getters/setters e observadores) em Java e Python.

[← Voltar ao README do projeto](../README.md)

## Treinos

| Treino | Original | Linguagem | O que a versão web faz |
|---|---|---|---|
| Sistema escolar | `source/java/` | Java | Mesma hierarquia em classes JS com campos privados: Membro → Discente → Aluno/Monitor; Membro → Docente → Professor/Coordenador/Diretor. A Disciplina “escuta” os alunos (como a interface `AlunoList`): ≥ 60% de aprovação dá aumento, < 50% dá desconto. Dá para matricular e remover alunos (com desfazer) e ver o reajuste mudar na hora. |
| Computador e ambiente | `source/inquirer/` | Python + inquirer + tqdm | Classes `Computer` e `Room` com getters/setters; formulários no lugar dos menus do inquirer e um “terminal” que reproduz a saída, incluindo a barra de progresso do tqdm. |

## Arquivos

```
index.html
assets/css/site.css     ← tabelas da turma, selos de status e terminal
assets/js/school.js     ← Sistema escolar
assets/js/setup.js      ← Computador e ambiente
source/                 ← originais, sem alterações
```

O header, o footer e o CSS/JS comuns vêm de [`../shared/`](../shared/README.md).

## Rodar os originais

```bash
pip install inquirer tqdm
python source/inquirer/main.py
```

**Java:** compile `source/java` respeitando os pacotes `App` e `Classes`.

## Notas

- O terminal do treino “Computador e ambiente” fica escuro nos dois temas, porque representa uma tela.
