# CLAUDE.md

Diretrizes base para este projeto. Siga todas as regras abaixo ao gerar ou editar código.

---

## 1. Idioma

- **Código em inglês**: nomes de classes, variáveis, funções, arquivos, comentários no código e mensagens de commit.
- **Respostas em português**: toda explicação, resumo ou conversa com o usuário deve ser em português (pt-BR).

---

## 2. Nomenclatura de classes (BEM)

Use o padrão **BEM** (Block, Element, Modifier):

| Parte    | Sintaxe                     | Exemplo                 |
|----------|-----------------------------|-------------------------|
| Block    | `.block`                    | `.hero`                 |
| Element  | `.block__element`           | `.hero__title`          |
| Modifier | `.block--modifier`          | `.button--primary`      |
| Element + Modifier | `.block__element--modifier` | `.form__input--ddd` |

Regras:
- Nomes em inglês, minúsculos, palavras separadas por hífen (`.product-card__price`).
- Elementos nunca encadeiam outros elementos (`.card__body__title` ❌ → `.card__title` ✅).
- Modificadores são sempre usados **junto** com a classe base no HTML:
  ```html
  <input class="form__input form__input--ddd" type="text">
  ```

---

## 3. Estrutura obrigatória das seções

Toda seção deve seguir esta estrutura, onde `section-name` é o nome da seção:

```html
<section class="section-name">
    <div class="section-name__container">
        <!-- content -->
    </div>
</section>
```

Exemplo:

```html
<section class="hero">
    <div class="hero__container">
        <h1 class="hero__title">Title</h1>
        <p class="hero__text">Text</p>
    </div>
</section>
```

### 3.1 Comportamento responsivo do `__container`

Abordagem **mobile-first**:

| Resolução        | Regra do `__container`                                        |
|------------------|---------------------------------------------------------------|
| 414px (base)     | `padding-left` / `padding-right`: **4%**                      |
| 768px            | `padding-left` / `padding-right`: **6%**                      |
| Desktop (≥1200px)| `padding-left` / `padding-right`: **0**, `width: 1140px`, centralizado na section |

> O breakpoint desktop usa `1200px` para que o container de 1140px nunca encoste nas bordas nem gere scroll horizontal.

```css
/* Base — 414px */
.hero__container {
    padding-left: 4%;
    padding-right: 4%;
}

/* Tablet — 768px */
@media (min-width: 768px) {
    .hero__container {
        padding-left: 6%;
        padding-right: 6%;
    }
}

/* Desktop */
@media (min-width: 1200px) {
    .hero__container {
        width: 1140px;
        padding-left: 0;
        padding-right: 0;
        margin-left: auto;
        margin-right: auto;
    }
}
```

---

## 4. Regras de CSS

### 4.1 Classes estilizadas separadamente

Cada classe deve ser estilizada **isoladamente**. **Não** use seletores descendentes/combinados entre classes.

❌ **Errado** (classes em conjunto):

```css
.form__row .form__input {
    flex: 1 1 0;
    min-width: 0;
}

.form__row .form__input--ddd {
    max-width: 80px;
}
```

✅ **Correto** (classes separadas):

```css
.form__row {
    display: flex;
    gap: 16px;
}

.form__input {
    flex: 1 1 0;
    min-width: 0;
}

.form__input--ddd {
    max-width: 80px;
}
```

### 4.2 Boas práticas gerais

- Não estilizar por tag (`section h2 {}`) nem por ID (`#hero {}`); sempre por classe BEM.
- Evitar `!important`.
- **Espaçamento entre elementos irmãos via `gap`, nunca `margin-top`/`margin-bottom`**: agrupe os irmãos em uma `div` wrapper (elemento BEM, ex.: `.solutions__content`) com `display: flex` + `gap`. O agrupamento segue os frames de auto-layout do Figma — cada frame com gap vira um wrapper com o mesmo gap.
  ```html
  <div class="solutions__content">
      <h3 class="solutions__card-title">Title</h3>
      <p class="solutions__card-text">Text</p>
  </div>
  ```
  ```css
  .solutions__content {
      display: flex;
      flex-direction: column;
      gap: 8px;
  }
  ```
- Media queries agrupadas por classe ou ao final do arquivo, sempre mobile-first (`min-width`).
- Unidades: `px` para bordas e tamanhos fixos, `%`/`rem` para espaçamentos e fontes quando fizer sentido.
- Uma propriedade por linha, indentação de 4 espaços.

---

## 5. Performance e otimização (meta: PageSpeed ≥ 90/100)

Todo código deve ser escrito pensando em performance, com meta mínima de **90/100 no PageSpeed Insights, tanto em mobile quanto em desktop**. O mobile é o mais exigente e deve ser a prioridade.

### 5.1 Métricas-alvo (Core Web Vitals)

| Métrica | Meta |
|---------|------|
| LCP (Largest Contentful Paint) | ≤ 2.5s |
| CLS (Cumulative Layout Shift) | ≤ 0.1 |
| INP (Interaction to Next Paint) | ≤ 200ms |
| TBT (Total Blocking Time) | ≤ 200ms |
| FCP (First Contentful Paint) | ≤ 1.8s |

### 5.2 HTML

- HTML semântico e enxuto; evitar `div` desnecessárias e aninhamento profundo.
- Declarar `lang`, `charset` e `viewport` no `<head>`:
  ```html
  <html lang="pt-BR">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ```
- Ordem no `<head>`: meta tags → preconnect/preload → CSS crítico → CSS restante → scripts com `defer`.
- Usar `preconnect` para domínios externos essenciais (fontes, CDN):
  ```html
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ```
- Fazer `preload` apenas do recurso do LCP (imagem principal do hero) e da fonte principal — nunca de tudo.

### 5.3 Imagens

- Formatos modernos: **WebP** ou **AVIF**, com fallback quando necessário via `<picture>`.
- Sempre definir `width` e `height` (evita CLS).
- Imagens abaixo da dobra: `loading="lazy"` e `decoding="async"`.
- Imagem do LCP (geralmente o hero): **nunca** lazy; usar `fetchpriority="high"`.
- Servir tamanhos responsivos com `srcset` e `sizes`, alinhados aos breakpoints do projeto (414 / 768 / 1140):
  ```html
  <img
      class="hero__image"
      src="hero-768.webp"
      srcset="hero-414.webp 414w, hero-768.webp 768w, hero-1140.webp 1140w"
      sizes="(min-width: 1200px) 1140px, 100vw"
      width="1140"
      height="640"
      alt="Description"
      fetchpriority="high">
  ```
- Ícones e ilustrações simples em **SVG** (inline quando pequenos e reutilizados poucas vezes).
- Comprimir todas as imagens antes de subir (qualidade ~75–85 para WebP).

### 5.4 Fontes

- Preferir fontes do sistema ou no máximo **2 famílias** e poucos pesos.
- Hospedar localmente em **WOFF2** sempre que possível.
- Usar `font-display: swap`:
  ```css
  @font-face {
      font-family: "Inter";
      src: url("/fonts/inter-400.woff2") format("woff2");
      font-weight: 400;
      font-display: swap;
  }
  ```
- Fazer `preload` só da fonte usada acima da dobra.
- Definir fallback com métricas próximas para reduzir CLS (`size-adjust` quando necessário).

### 5.5 CSS

- CSS crítico (acima da dobra) inline no `<head>`; restante carregado sem bloquear renderização.
- Remover CSS não utilizado; não importar frameworks inteiros para usar poucas classes.
- Minificar em produção.
- Não usar `@import` dentro de CSS (cria cadeia de requisições).
- Animar apenas `transform` e `opacity` (evitar animar `width`, `height`, `top`, `left`, `margin`).
- Reservar espaço para elementos que carregam depois (banners, embeds, imagens) com `aspect-ratio` ou dimensões fixas:
  ```css
  .video__frame {
      aspect-ratio: 16 / 9;
      width: 100%;
  }
  ```
- Usar `content-visibility: auto` em seções longas abaixo da dobra quando fizer sentido:
  ```css
  .testimonials {
      content-visibility: auto;
      contain-intrinsic-size: auto 800px;
  }
  ```

### 5.6 JavaScript

- **JavaScript mínimo**: só usar JS quando HTML/CSS não resolverem.
- **Sempre JavaScript puro (vanilla).** Não usar bibliotecas nem frameworks (jQuery, Swiper, Lodash etc.); toda funcionalidade deve ser implementada em JS nativo.
- Scripts sempre com `defer` (ou `type="module"`); nunca bloqueando o `<head>`.
- Scripts de terceiros (analytics, pixels, chat) carregados de forma tardia, após interação do usuário ou `load`.
- Dividir tarefas longas (> 50ms) para não travar a thread principal.
- Event listeners de `scroll`/`resize` com `{ passive: true }` e, quando possível, trocar por `IntersectionObserver`.
- Minificar e fazer tree-shaking em produção.

### 5.7 Embeds e terceiros

- Vídeos do YouTube/Vimeo com **facade**: exibir uma miniatura e carregar o iframe só no clique.
- Mapas e iframes com `loading="lazy"`.
- Auditar cada script de terceiros; remover o que não for essencial.

### 5.8 Servidor e entrega

- Compressão **Brotli** (ou Gzip) habilitada.
- Cache longo para assets estáticos com hash no nome (`Cache-Control: max-age=31536000, immutable`).
- Servir via HTTPS com HTTP/2 ou HTTP/3 e, se possível, CDN.
- Evitar redirecionamentos encadeados.

### 5.9 Acessibilidade e boas práticas (também contam no PageSpeed)

- Todas as imagens com `alt` descritivo (ou `alt=""` se decorativas).
- Contraste de cores adequado (WCAG AA).
- Botões e links com nome acessível; áreas de toque com no mínimo 48×48px no mobile.
- Hierarquia de títulos correta (`h1` único, sem pular níveis).
- `meta description` e `title` em todas as páginas.

---

## 6. Checklist antes de entregar

- [ ] Código (classes, variáveis, comentários) em inglês.
- [ ] Resposta ao usuário em português.
- [ ] Toda seção tem `section.section-name` + `div.section-name__container`.
- [ ] `__container` com 4% / 6% / 1140px conforme as resoluções.
- [ ] Classes seguem BEM.
- [ ] Nenhum seletor combinando duas classes (`.a .b`).
- [ ] Imagens em WebP/AVIF, com `width`/`height`, `srcset` e lazy load abaixo da dobra.
- [ ] Imagem do LCP sem lazy e com `fetchpriority="high"`.
- [ ] Fontes em WOFF2 com `font-display: swap`.
- [ ] JavaScript 100% puro, sem bibliotecas.
- [ ] Scripts com `defer`; terceiros carregados de forma tardia.
- [ ] CSS e JS minificados, sem código não utilizado.
- [ ] Nenhum elemento causando layout shift (espaço reservado para mídia e embeds).
- [ ] PageSpeed Insights ≥ 90 em mobile e desktop.
