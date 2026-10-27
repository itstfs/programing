# tools

Ferramentas Node do projeto, sem dependências (só precisa do Node instalado). Rodam **no seu computador** para montar as páginas e o `dist/`; nunca vão para o site.

[← Voltar ao README do projeto](../README.md)

| Comando | Quando rodar | O que faz |
|---|---|---|
| `node tools/sync.mjs` | depois de editar `shared/partials/` | escreve head, header, footer e a lista de CSS/JS comuns em cada `index.html` |
| `node tools/build.mjs` | para publicar | roda o sync e gera `dist/` |

## Por que existem os scripts

- **No código-fonte**, as páginas apontam direto para `shared/` (`../shared/css/…`): nada é copiado, e editar um CSS comum já vale para todas.
- **O `CLAUDE.md` proíbe `@import`** (cadeia de requisições) e o projeto não usa bundler, então o HTML comum (header, footer) precisa ser escrito em cada página — é o que o `sync` faz. Ele só escreve entre os marcadores `<!-- shared:… -->` e só grava as páginas que mudaram.
- **Na publicação**, cada interface precisa funcionar sozinha — é o que o `build` resolve.

## sync.mjs

- A lista `PAGES` define cada página: pasta, caminho até a raiz e quais camadas de CSS e scripts de `shared/` ela usa (o hub usa as camadas settings, base, layout e navigation e só o `header.js`).
- Para adicionar uma interface nova: crie a pasta com um `index.html` contendo os quatro pares de marcadores, adicione uma linha em `PAGES` e rode o sync.

## build.mjs — publicar

```bash
node tools/build.mjs
```

Gera `dist/` com uma pasta **autocontida** por página (publique cada `dist/<interface>/` na própria URL):

- CSS de cada página (camadas de `shared/css/` + `site.css`) **minificado e inline** no `<head>` — nenhuma requisição bloqueando a renderização. O hub fica com ~11 KB de CSS e as interfaces com ~17–20 KB (cerca de 4 KB com gzip).
- JS de cada página **concatenado em um único `app.<hash>.js`** com `defer` (o hash no nome permite cache longo).
- Copia as imagens de `shared/img/` para `assets/img/` de cada página e reescreve os caminhos; falha se sobrar algum caminho para `shared/`.
- Copia `assets/data/` e `source/`; **não** copia o `servidores.csv` de 66 MB (a interface usa a amostra e o arquivo completo pode ser importado).

Recomendações para o servidor: Brotli/Gzip, HTTPS com HTTP/2 e `Cache-Control: max-age=31536000, immutable` para `assets/js/app.*.js` e `assets/img/`.

## Resultado medido no `dist/` (Lighthouse 12, local)

| Página | Mobile (perf / a11y / bp / seo) | Desktop |
|---|---|---|
| Hub | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Arcade | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Ferramentas | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Excel | 95 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| POO | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Notas | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
