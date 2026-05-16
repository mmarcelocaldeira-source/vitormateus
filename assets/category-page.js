(() => {
  const data = window.PAGE_DATA;
  const app = document.getElementById("app");
  const isFolderPage = location.pathname.endsWith("/");
  const homeHref = isFolderPage ? "../index.html" : "index.html";
  const categorySlug = data.path.replace("/", "");
  const categoryHref = name => isFolderPage ? `../${name}/` : `${name}.html`;
  const projectHref = project =>
    `projeto.html?categoria=${encodeURIComponent(categorySlug)}&projeto=${encodeURIComponent(project.slug)}`;

  const pad = i => String(i + 1).padStart(2, "0");
  const navLinks = ["arquitetura", "gastronomia", "retratos", "autoriais"];
  const navLabels = { arquitetura: "Arquitetura", gastronomia: "Gastronomia", retratos: "Retratos", autoriais: "Autorais" };

  // Build gallery paths per project (mirror project-page.js logic)
  const galleryMap = {
    arquitetura: {
      "casa-linha": ["arq-01.jpg", "arq-02.jpg", "arq-03.jpg"].map(f => `assets/arquitetura/${f}`),
      "escada-norte": ["arq-04.jpg", "arq-05.jpg", "arq-06.jpg"].map(f => `assets/arquitetura/${f}`),
      "patio-monolito": ["arq-07.jpg", "arq-08.jpg", "arq-09.jpg", "arq-10.jpg"].map(f => `assets/arquitetura/${f}`),
    },
    gastronomia: {
      "cochicho-cafe": Array.from({ length: 15 }, (_, i) => `assets/gastronomia/cochicho-cafe/cochicho-cafe-${String(i + 1).padStart(2, "0")}.jpg`),
      "caprese": Array.from({ length: 5 }, (_, i) => `assets/gastronomia/caprese/caprese-${String(i + 1).padStart(2, "0")}.jpg`),
      "tagate": Array.from({ length: 8 }, (_, i) => `assets/gastronomia/tagate/tagate-${String(i + 1).padStart(2, "0")}.jpg`),
      "pain-au-chocolat": Array.from({ length: 4 }, (_, i) => `assets/gastronomia/pain-au-chocolat/pain-au-chocolat-${String(i + 1).padStart(2, "0")}.jpg`),
    },
    retratos: {
      "kenji-01": [1, 2, 3, 4].map(n => `assets/retratos/kenji/kenji-${String(n).padStart(2, "0")}.jpg`),
      "kenji-02": [5, 6, 7, 8].map(n => `assets/retratos/kenji/kenji-${String(n).padStart(2, "0")}.jpg`),
      "kenji-03": [9, 10, 11, 12].map(n => `assets/retratos/kenji/kenji-${String(n).padStart(2, "0")}.jpg`),
    },
    autoriais: {
      "waves": ["waves-01.jpg", "waves-02.jpg", "waves-03.jpg"].map(f => `assets/autorais/${f}`),
      "buenos-aires-2022": Array.from({ length: 5 }, (_, i) => `assets/autorais/buenos-aires-2022/buenos-aires-${String(i + 1).padStart(2, "0")}.jpg`),
      "portra-160": Array.from({ length: 9 }, (_, i) => `assets/autorais/portra-160/portra160-${String(i + 1).padStart(2, "0")}.jpg`),
      "kodak-gold-200": Array.from({ length: 17 }, (_, i) => `assets/autorais/kodak-gold-200/kodak-gold200-${String(i + 1).padStart(2, "0")}.jpg`),
    }
  };

  const getGallery = slug => (galleryMap[categorySlug] && galleryMap[categorySlug][slug]) || [];

  const renderNavLink = slug =>
    `<a class="topbar__link${categorySlug === slug ? " is-current" : ""}" href="${categoryHref(slug)}" data-transition>${navLabels[slug]}</a>`;

  const total = data.projects.length;

  app.innerHTML = `
    <div class="page-transition"></div>

    <header class="topbar">
      <a class="topbar__brand" href="${homeHref}" data-transition>Vitor Mateus</a>
      <nav class="topbar__nav" aria-label="Categorias">
        ${navLinks.map(renderNavLink).join("")}
      </nav>
      <a class="topbar__home" href="${homeHref}" data-transition>← Início</a>
    </header>

    <main>
      <header class="cat-header reveal-init">
        <p class="eyebrow">Portfólio — ${data.label}</p>
        <h1 class="cat-title">${data.title}</h1>
      </header>

      <div class="cat-layout">
        <div class="cat-stack">
          ${data.projects.map((project, i) => {
            const meta = [project.date, project.location, project.note].filter(Boolean);
            return `
            <a
              class="cat-card"
              href="${projectHref(project)}"
              data-index="${i}"
              data-slug="${project.slug}"
              data-transition
              aria-label="${project.title} — ${project.client}"
            >
              <div class="cat-card__media">
                <img data-layer="base" src="${project.cover}" alt="${project.coverAlt || project.title}" ${i > 1 ? 'loading="lazy"' : ""} />
                <img data-layer="swap" src="${project.cover}" alt="" aria-hidden="true" loading="lazy" />
              </div>
              <div class="cat-card__caption">
                <h3 class="cat-card__title">${project.title}</h3>
                <div class="cat-card__meta">
                  ${meta.map(m => `<span>${m}</span>`).join("")}
                </div>
              </div>
            </a>
          `;}).join("")}

          <div class="cat-stack__end">
            <p>Fim da seleção — ${data.label}</p>
            <a href="${homeHref}" data-transition>Voltar ao início ↗</a>
          </div>
        </div>
      </div>
    </main>
  `;

  const cards = [...document.querySelectorAll(".cat-card")];

  // ─── Reveal cards on scroll ───
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -80px 0px" });

  cards.forEach(card => revealObserver.observe(card));

  // ─── Hover swap: random gallery image, never repeats previous ───
  cards.forEach(card => {
    const slug = card.dataset.slug;
    const pool = getGallery(slug);
    if (pool.length < 2) return;

    const baseImg = card.querySelector('[data-layer="base"]');
    const swapImg = card.querySelector('[data-layer="swap"]');
    let lastIndex = -1;
    let isSwapped = false;

    // Pre-warm: load a different image right away
    const pickNext = () => {
      if (pool.length === 1) return 0;
      let idx;
      let attempts = 0;
      do {
        idx = Math.floor(Math.random() * pool.length);
        attempts++;
      } while ((idx === lastIndex || pool[idx] === baseImg.getAttribute("src") || pool[idx] === swapImg.getAttribute("src")) && attempts < 12);
      return idx;
    };

    card.addEventListener("mouseenter", () => {
      const nextIdx = pickNext();
      lastIndex = nextIdx;
      const nextSrc = pool[nextIdx];

      // Decide which layer becomes the new visible one
      const hiddenLayer = isSwapped ? baseImg : swapImg;
      hiddenLayer.src = nextSrc;

      // After image is ready, toggle
      const reveal = () => {
        isSwapped = !isSwapped;
        card.classList.toggle("is-swapped", isSwapped);
      };
      if (hiddenLayer.complete && hiddenLayer.naturalWidth > 0) {
        reveal();
      } else {
        hiddenLayer.addEventListener("load", reveal, { once: true });
      }
    });
  });

  // ─── Page Transitions ───
  const transition = document.querySelector(".page-transition");

  const navigateTo = href => {
    transition.classList.add("is-entering");
    transition.addEventListener("animationend", () => {
      window.location.href = href;
    }, { once: true });
  };

  document.querySelectorAll("[data-transition]").forEach(link => {
    link.addEventListener("click", e => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();
      navigateTo(href);
    });
  });

  // Reveal header on load
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelector(".cat-header")?.classList.add("is-visible");
    }, 80);
  });

})();
