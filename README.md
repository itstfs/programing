# Treinos de programação

Exercícios feitos para aprender linguagens novas (Python, Java, JavaScript, SQL…), organizados em **5 interfaces web independentes**. Cada interface recria os treinos em **HTML, CSS e JavaScript puro** para rodar no navegador e mantém o **código original** na pasta `source/`, visível na aba “Código original” de cada treino.

Cada arquivo existe **uma vez só** no código-fonte. A versão publicada fica em `dist/`, onde cada interface é **autocontida** (não depende de nenhuma outra pasta) e pode ir para uma URL própria.

## Pastas

Cada pasta tem o próprio README com os detalhes.

| Pasta | O que tem |
|---|---|
| [`arcade/`](arcade/README.md) | Adivinhe o número, Snake e Matrix |
| [`ferramentas/`](ferramentas/README.md) | IMC, CPF, gerador de senha, turnos, tempo de execução e recorte de imagem |
| [`excel/`](excel/README.md) | Planilhas com Python: adicionar linha e CRUD de servidores |
| [`poo/`](poo/README.md) | Orientação a objetos: sistema escolar (Java) e computador/ambiente (Python) |
| [`notas/`](notas/README.md) | Resumos de banco de dados, MySQL, Django, React, mobile e Discord |
| [`shared/`](shared/README.md) | Tudo que é comum às páginas: header, footer, CSS, JS, imagens, tema e sistema de interface |
| [`tools/`](tools/README.md) | Ferramentas Node do projeto: `sync` e `build` (não vão para o site) |
| `dist/` | **Gerado** pelo build; é daqui que se publica |

Na raiz ficam só o hub (`index.html`, a página inicial) e o CSS dele (`assets/css/site.css`).

```
index.html              ← página inicial (hub)
assets/css/site.css     ← CSS só do hub
shared/                 ← comum a todas as páginas (edite aqui)
tools/                  ← sync.mjs · build.mjs
arcade/ ferramentas/ excel/ poo/ notas/   ← as 5 interfaces
dist/                   ← gerado — publicar daqui
```

Toda interface tem a mesma estrutura, só com o que é dela:

```
<interface>/
    index.html
    assets/css/site.css       ← CSS só desta interface
    assets/js/<treino>.js     ← um arquivo por treino
    assets/data/              ← dados de exemplo (Excel)
    source/                   ← código original, sem alterações
```

**JS do site × ferramentas:** `shared/js/` e `<interface>/assets/js/` rodam **no navegador**; `tools/` roda **no seu computador** (Node) para montar as páginas e o `dist/`, e nunca é publicado.

## O que editar em cada lugar

| Quero mudar… | Edite | Depois rode |
|---|---|---|
| Header, footer, favicon | `shared/partials/` | `node tools/sync.mjs` |
| Visual comum (cores, botões, campos…) | `shared/css/` | nada — recarregue a página |
| Tema, header fixo, abas, copiar código | `shared/js/` | nada — recarregue a página |
| Visual ou lógica de uma interface | `<interface>/assets/css/site.css` ou `assets/js/` | nada |
| Publicar | — | `node tools/build.mjs` |

## Como rodar

O visualizador de código original usa `fetch`, que o navegador bloqueia em `file://`. Use um servidor local **na raiz do projeto** (as páginas buscam arquivos em `shared/`):

```bash
npx serve .
# ou, com Python instalado:
python -m http.server
```

Depois abra `http://localhost:3000` (serve) ou `http://localhost:8000` (Python).

Os originais rodam a partir da própria pasta em `source/`; as dependências de cada um estão no README da interface.

