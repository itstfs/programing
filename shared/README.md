# shared

Tudo que é comum ao hub e às 5 interfaces. **Cada arquivo existe uma vez só, aqui**: as páginas apontam direto para esta pasta (`../shared/css/…`) e o build copia o necessário para dentro de cada interface em `dist/`.

[← Voltar ao README do projeto](../README.md)

```
partials/   head.html · header.html · footer.html
css/        camadas 01–07
js/         header.js (tema + header fixo) · tabs.js (abas + código original)
img/        logo.jpg (original) · logo-64/128.webp · favicon-32.png · apple-touch-icon-180.png
```

| Pasta | Depois de editar |
|---|---|
| `partials/` | rode `node tools/sync.mjs` |
| `css/`, `js/`, `img/` | nada — recarregue a página |

## partials — header e footer únicos

O header fixo (logo **itstfs**, links das interfaces e botão de tema) e o footer (marca, ícones das linguagens usadas, redes, “Voltar ao topo” e copyright) existem **uma vez só**, aqui. O `sync` escreve o HTML real entre os marcadores `<!-- shared:head -->`, `<!-- shared:assets -->`, `<!-- shared:header -->` e `<!-- shared:footer -->` de cada `index.html`, então as páginas funcionam sem build. **Não edite à mão o que está entre os marcadores**: o próximo sync sobrescreve.

Placeholders usados nos parciais:

| Placeholder | Vira |
|---|---|
| `{{root}}` | caminho até a raiz (`""` no hub, `../` nas interfaces) |
| `{{shared}}` | caminho até esta pasta (`shared/` ou `../shared/`) |
| `{{current:id}}` | `aria-current="page"` só na página com esse `id` |

Os links usam caminhos relativos (`../index.html`, `../arcade/`). Se as interfaces forem publicadas em domínios separados, troque os `href` em `header.html` e `footer.html` e rode o sync.

## css — camadas

O CSS comum é dividido em **camadas**, uma por arquivo, na ordem da cascata. A ordem é a da tabela abaixo (definida em `tools/sync.mjs`, já que os nomes não têm número). O hub usa as quatro primeiras; as interfaces, todas.

| Arquivo | O que tem |
|---|---|
| `settings.css` | tokens de cor, espaço, texto e forma; tema claro |
| `base.css` | reset, página, anel de foco, scrollbar neutra, skip link, utilitários |
| `layout.css` | header fixo, hero, footer e containers responsivos |
| `navigation.css` | breadcrumb, “Nesta página”, seletor Testar/Código original, abas, botão de tema |
| `forms.css` | formulário, campos, select, opções de rádio, botões |
| `feedback.css` | mensagens de resultado, callout, destaque |
| `code.css` | seção de treino e visualizador de código (com “Copiar código”) |

## js

| Arquivo | O que faz |
|---|---|
| `header.js` | botão de tema e header fixo (no celular some ao rolar para baixo e volta ao rolar para cima; nunca some com o foco do teclado dentro dele) |
| `tabs.js` | abas acessíveis (setas, Home/End), carrega o código original sob demanda e o botão “Copiar código” |

## Tema claro e escuro

- **Escuro por padrão.** O botão à direita do header alterna para o claro; a escolha fica salva no navegador (`localStorage`, chave `itstfs-theme`) e vale para todas as interfaces.
- `partials/head.html` aplica o tema salvo antes da primeira pintura (sem “piscar”).
- Os dois temas usam os mesmos tokens (`--color-*`) com valores diferentes em `:root[data-theme="light"]`; todas as combinações de texto têm contraste ≥ 4,5:1 e bordas de controles ≥ 3:1.
- Canvas do Snake e do Matrix e o terminal do POO continuam escuros nos dois temas, porque representam telas.

## Sistema de interface

Cada tipo de controle tem um visual próprio, para nunca confundir navegação com ação:

| Função | Componente | Onde aparece |
|---|---|---|
| Alternar a visualização | Segmented control (`.switch`) | Testar / Código original · Resumo / Arquivo original |
| Trocar de operação dentro de uma ferramenta | Abas sublinhadas (`.tabs`) | Buscar · Adicionar · Atualizar férias · Excluir coluna · Cor do cabeçalho |
| Ir para uma seção da página | Índice “Nesta página” (`.toc`) | Topo de cada interface |
| Saber onde está | Breadcrumb (`.breadcrumb`) + link atual marcado no header | Todas as páginas |

Botões: **primário** (rosa preenchido, um por formulário) · **secundário** (borda neutra) · **terciário** (só texto) · **perigo** (vermelho). Mensagens de resultado sempre com ícone e texto (✓ sucesso, ! aviso, ✕ erro), nunca só cor. Espaçamentos e tamanhos de texto vêm das escalas `--space-*` e `--text-*` em `css/settings.css`.

### Vocabulário da interface

| Use | Em vez de | Quando |
|---|---|---|
| **Excluir** | deletar, apagar | apagar um dado (linha, coluna) |
| **Remover** | excluir | tirar algo de um grupo sem apagar o dado (aluno da turma) |
| **Adicionar** | inserir | criar um registro novo (“Adicionar pessoa”, “Adicionar servidor”) |
| **Buscar** | localizar, procurar | filtrar uma lista |
| **Dados de exemplo** | amostra | os dados com que a interface já abre |
| **Resumos** | cheatsheets | as notas de estudo |

Regras: rótulos em caixa de frase, botões com verbo + objeto (“Gerar senha”, “Verificar CPF”), unidade no rótulo (“Peso (kg)”), placeholders com exemplo (“ex.: 70”), campos opcionais marcados “(opcional)” e mensagens que dizem o que aconteceu e o próximo passo.
