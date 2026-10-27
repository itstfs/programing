# Excel com Python

Treinos de manipulação de planilhas com pandas e openpyxl, recriados como tabelas interativas no navegador.

[← Voltar ao README do projeto](../README.md)

## Treinos

| Treino | Original | O que a versão web faz |
|---|---|---|
| Adicionar linha | `source/excel-python/add/` | Tabela de `pessoas.xlsx` (convertida para `assets/data/pessoas.csv`); adiciona ID/Nome/Idade/Peso na última linha e exporta CSV. Explica por que o `Series.append` do original não altera a planilha. |
| CRUD de servidores | `source/excel-python/CRUD/` | Menu do original em abas: **Buscar** (nome + situação, com gráfico de barras por situação no lugar da pizza do matplotlib), **Adicionar**, **Atualizar férias** por cargo, **Excluir coluna** (teto, judic, eventual, ir, prev, rem_pos) e **Cor do cabeçalho** (padrão, cinza, ciano, vermelho, pink). Colunas com nomes legíveis (o nome original fica no tooltip e no CSV exportado), valores em R$, exclusão de linhas com desfazer, paginação, importação e exportação de CSV separado por `;`. |

## Arquivos

```
index.html
assets/css/site.css             ← tabela, paginação, gráfico de barras
assets/js/csv.js                ← leitura e escrita de CSV (comum aos dois treinos)
assets/js/people.js             ← Adicionar linha
assets/js/servers.js            ← CRUD de servidores
assets/data/pessoas.csv         ← dados de pessoas.xlsx
assets/data/servidores-sample.csv ← dados de exemplo (156 linhas)
source/                         ← originais, sem alterações
```

O header, o footer e o CSS/JS comuns vêm de [`../shared/`](../shared/README.md).

## Dados

- A interface começa com uma **amostra de 156 linhas** (`assets/data/servidores-sample.csv`, UTF-8).
- O arquivo completo `source/excel-python/CRUD/servidores.csv` (**66 MB, ~320 mil linhas**, Latin-1) pode ser importado pelo botão “Importar CSV”. Ele **não** vai para o `dist/`, por causa do tamanho.
- A exportação gera CSV com BOM, para o Excel abrir os acentos corretamente.

## Rodar os originais

```bash
pip install pandas openpyxl inquirer tqdm matplotlib win10toast
```

Detalhes do CRUD em [`source/excel-python/CRUD/README.md`](source/excel-python/CRUD/README.md).
