# Patterns — Vitor Mateus Studio
Adapted from Studio Ahremark (https://www.studioahremark.com).

---

## 1. Sticky-Footer / Next-Case Reveal — THE signature trick

**What:** Footer sits behind main content as scroll proxy. Main scrolls *over* it. When scroll reaches end of page, footer (which contains next-case preview) is fully revealed.

**Ahremark CSS (extracted from `style.css?ver=23d`):**

```css
.l-site-footer {
  position: sticky;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 0;                          /* behind main */
  background: var(--color-gray-4);     /* dark surface */
  color: var(--color-white);
  clip-path: inset(0);                 /* prevent paint leak */
  padding-bottom: var(--row-1);
  overflow: hidden;
}

.l-site-footer.has-media {             /* when bg image attached */
  --color-background: var(--color-gray-4);
  --color-text: var(--color-white);
}

.l-site-footer__media {
  position: absolute;
  inset: 0;
  opacity: 0.7;
  transition: opacity 0.5s linear;
}
.l-site-footer__media img,
.l-site-footer__media video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.l-site-footer:hover .l-site-footer__media { opacity: 1; }

.l-site-footer--case .l-site-footer__column--title {
  padding-bottom: 50vh;                /* gives the next-case title big breathing room */
}
```

**Main content needs:**
```css
.main {
  position: relative;
  z-index: 1;
  background: var(--color-background);
}
```

**Markup skeleton:**
```html
<main class="main">
  <!-- case content -->
</main>
<footer class="l-site-footer l-site-footer--case has-media">
  <div class="l-site-footer__media l-site-footer__media--desktop">
    <img src="next-case-cover.jpg" alt="" loading="lazy" />
  </div>
  <div class="l-site-footer__grid">
    <div class="l-site-footer__column l-site-footer__column--title">
      <a class="l-site-footer__link l-site-footer__link--title" href="/case/next">
        Next case →
      </a>
    </div>
    <!-- other columns: copyright, menu, social -->
  </div>
</footer>
```

**Why it works:**
- No JS required.
- Performant: just CSS sticky.
- Creates anticipation: user feels next case "rising up" from behind.
- Hover increases media opacity = invitation.

---

## 2. Case Study Page Structure (Estrid extracted)

DOM order on `/work/estrid`:

```
<body class="single single-case has-media">
  <header class="l-site-header">
    <a class="c-logo">Studio Ahremark</a>
    <nav class="c-menu">[Work] [Studio] [Menu]</nav>
  </header>

  <main class="main">

    <!-- 1. Page header (hero) -->
    <section class="c-page-header c-page-header--case">
      <div class="c-page-header__media">
        <div class="c-page-header__slider c-slider">
          <div class="c-page-header__slide c-slider__item is-active">
            <img alt="" src="..." />
          </div>
          <div class="c-page-header__slide c-slider__item">...</div>
        </div>
      </div>
      <div class="c-page-header__inner">
        <div class="c-page-header__header">
          <ul class="c-page-header__list">
            <li>Brand Identity</li>
            <li>Web Design</li>
            <li>Packaging</li>
          </ul>
          <a class="c-page-header__link" href="#case-content">Read ↓</a>
        </div>
        <h1 class="c-page-header__title">Estrid Skincare</h1>
        <ul class="c-navigation">[← prev] [next →]</ul>
        <ul class="c-navigator">[01] [02] [03]</ul>  <!-- slide dots -->
      </div>
    </section>

    <!-- 2. Description (sticky aside left + paragraphs right) -->
    <section class="b-case-description">
      <div class="b-case-description__grid">
        <div class="b-case-description__column b-case-description__column--medium">
          <h2 class="b-case-description__title">Branding</h2>
        </div>
        <div class="b-case-description__column">
          <div class="b-case-description__text">
            <p class="b-case-description__text-item">Estrid asked us to evolve their brand...</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Image-full (full-bleed photo) -->
    <section class="b-image-full">
      <div class="b-image-full__inner">
        <img class="b-image-full__image b-image-full__image--desktop" src="..." />
        <img class="b-image-full__image b-image-full__image--mobile"  src="..." />
      </div>
    </section>

    <!-- 4. Image grid (2-up or 6-up) -->
    <section class="b-image-grid">
      <div class="c-image-grid c-image-grid--2 c-image-grid--standard">
        <div class="c-image-grid__grid">
          <div class="c-image-grid__item"><img /></div>
          <div class="c-image-grid__item"><img /></div>
        </div>
      </div>
    </section>

    <!-- 5. Image + Text alternating -->
    <section class="b-image"><div class="b-image__inner"><img class="b-image__image" /></div></section>
    <section class="b-case-description">...</section>
    <section class="b-image-full">...</section>

    <!-- 6. Final CTA (centered) -->
    <section class="b-cta b-cta--center">
      <div class="b-cta__grid">
        <div class="b-cta__column--label"><span class="b-cta__label">(05) — Want similar?</span></div>
        <div class="b-cta__column--content">
          <h2 class="b-cta__title">Let's build your brand.</h2>
          <a class="c-button" href="/contact">Get in touch</a>
        </div>
      </div>
    </section>

  </main>

  <!-- 7. STICKY FOOTER with next case -->
  <footer class="l-site-footer l-site-footer--case has-media">
    <div class="l-site-footer__media">
      <img src="next-case-cover.jpg" />
    </div>
    <div class="l-site-footer__grid">
      <div class="l-site-footer__column--title">
        <a class="l-site-footer__link--title" href="/case/wecreate">WeCreate →</a>
      </div>
      <div class="l-site-footer__column--menu">[...nav]</div>
      <div class="l-site-footer__column--copyright">© 2025</div>
    </div>
  </footer>
</body>
```

**Rhythm pattern:**
`hero → text → full-bleed image → 2-up grid → text → image → full-bleed → cta → next-case sticky`

Sections breathe with `--gap-section` = `var(--row-4)` mobile, `var(--row-6)` desktop.

---

## 3. Block (`b-*`) vs Component (`c-*`) Naming

Ahremark uses two prefixes:

- `b-*` — **Block**: large composition (page section). Carries `js-scrollspy` for reveal observer.
  Examples: `b-case-description`, `b-image-full`, `b-image-grid`, `b-cta`, `b-page-header-case`, `b-contact`
- `c-*` — **Component**: reusable atomic. Reused across blocks.
  Examples: `c-button`, `c-list`, `c-social`, `c-image-grid` (inside `b-image-grid`), `c-page-header`, `c-menu`, `c-logo`, `c-jumbling-logo`
- `l-*` — **Layout**: structural wrappers.
  Examples: `l-site-header`, `l-site-footer`, `l-site-footer__grid`

**Apply to our project:**
- Sections → `b-hero`, `b-works`, `b-about`, `b-contact`, `b-case-description`
- Reusable → `c-button`, `c-work-row`, `c-eyebrow`, `c-menu`
- Wrappers → `l-page`, `l-site-header`, `l-site-footer`

---

## 4. Numbered Modal Menu

When user clicks "Menu" in header, modal slides in with numbered links:

```
01  Work
02  Studio
03  Contact
04  Instagram
```

Each item Fraunces 300, huge (~64-92px). Hover italic.

**Pattern:**
```html
<nav class="c-menu-modal">
  <ul>
    <li class="c-menu-modal__item">
      <a class="c-menu-modal__link" href="/work">
        <span class="c-menu-modal__num">01</span>
        <span class="c-menu-modal__label">Trabalhos</span>
      </a>
    </li>
    ...
  </ul>
</nav>
```

---

## 5. Hero typography pattern

```html
<section class="b-page-header">
  <span class="c-eyebrow">— Photography &amp; direction</span>
  <h1 class="b-page-header__title">
    Precisão na luz,
    <em>presença na imagem.</em>
  </h1>
</section>
```

```css
.b-page-header__title {
  font-family: var(--font-heading);
  font-size: var(--font-size-huge);      /* 4.25rem desktop */
  line-height: var(--line-height-huge);  /* 3.85rem desktop */
  font-weight: 300;
  letter-spacing: -0.035em;
  font-variation-settings: "opsz" 144;
}
.b-page-header__title em {
  font-style: italic;
  font-weight: 300;
  color: var(--color-muted);             /* italic accent always muted */
}
```

**Rule:** italic = secondary thought. Color drops to muted. Same weight (300).

---

## 6. Work list / index (replaces our `category-rail`)

```html
<section class="b-works">
  <header class="b-works__head">
    <span class="c-eyebrow">(02) — Trabalhos</span>
    <h2 class="b-works__headline">Quatro territórios, uma <em>mesma direção visual.</em></h2>
  </header>
  <ol class="c-list">
    <li class="c-list__row">
      <a href="/arquitetura" data-preview="img1,img2,img3">
        <span class="c-list__num">01 / 04</span>
        <span class="c-list__title">Arquitetura</span>
        <span class="c-list__meta">Espaços · 2024 — 2025 · 3 projetos</span>
      </a>
    </li>
  </ol>
  <div class="c-list-preview" id="listPreview"></div>  <!-- cursor-following thumb -->
</section>
```

```css
.c-list { border-top: 1px solid var(--color-line-strong); }
.c-list__row {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: clamp(20px, 4vw, 60px);
  align-items: baseline;
  padding: clamp(30px, 3.4vw, 48px) 0;
  border-bottom: 1px solid var(--color-line-strong);
  position: relative;
}
.c-list__row::before {                /* underline that sweeps left→right */
  content: "";
  position: absolute;
  left: 0; bottom: -1px;
  width: 0; height: 1px;
  background: var(--color-text);
  transition: width 0.76s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.c-list__row:hover::before { width: 100%; }
.c-list__row:hover .c-list__title { font-style: italic; color: var(--color-muted); }
```

**Cursor-following preview** (JS):
- `mousemove` updates fixed-positioned floating img position.
- `setInterval(cycle, 1200)` rotates 3-4 images of that category.
- Disabled on `(hover: none)` and `(max-width: 720px)`.

---

## 7. Animations: scroll-spy + letter-delay

Ahremark uses `js-scrollspy` on every block. On enter viewport, applies stagger via inline CSS variable:

```html
<div class="c-list__row" data-letter-item="0" style="--letter-item-delay: calc(var(--letter-delay) * 0)">
<div class="c-list__row" data-letter-item="1" style="--letter-item-delay: calc(var(--letter-delay) * 5)">
<div class="c-list__row" data-letter-item="2" style="--letter-item-delay: calc(var(--letter-delay) * 10)">
```

Each row staggers by multiplier × `--letter-delay` (default `1.25s` per letter cycle).

For us: IntersectionObserver + `transition-delay` calc on `--index`.

---

## 8. Cookie-free, JS-light philosophy

Ahremark avoids heavy JS for choreography. Most magic is CSS sticky + IntersectionObserver. We follow same:
- No GSAP / lenis / Locomotive.
- Native CSS `position: sticky` for parallax effect.
- IntersectionObserver for `.is-visible` reveal class.
- `prefers-reduced-motion` always respected.

---

## 9. Forbidden (per project direction)

- ❌ Border-radius on media (`<img>`, `<video>`, image containers). Always flat / square.
- ❌ Custom cursor (dot/ring). Native cursor only.
- ❌ Emoji icons. Use SVG or text.
- ❌ Hover-to-expand category panels. Use editorial list instead.
- ❌ Bold weights. Max 400 body, 300 display.

---

## 10. Migration plan

1. Drop `tokens.css` into project (replace existing `:root` vars in `index.html`, `category-page.css`, `project-page.css`).
2. Refactor sections → `b-*` block naming.
3. Build sticky footer with next-category preview on category pages.
4. Build sticky footer with next-project on `projeto.html`.
5. Add modal numbered menu (replace mobile-menu).
6. Apply baseline grid `--row-*` to all section padding.
