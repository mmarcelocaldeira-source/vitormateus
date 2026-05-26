(() => {
  const init = (data) => {
    const app = document.getElementById("app");
    const isFolderPage = location.pathname.endsWith("/");
    const homeHref = isFolderPage ? "../index.html" : "index.html";
    const categorySlug = data.path.replace("/", "");
    const categoryHref = name => isFolderPage ? `../${name}/` : `${name}.html`;
    const projectHref = project =>
      `projeto.html?categoria=${encodeURIComponent(categorySlug)}&projeto=${encodeURIComponent(project.slug)}`;

    const navLinks = ["arquitetura", "gastronomia", "retratos", "autoriais"];
    const navLabels = { arquitetura: "Arquitetura", gastronomia: "Gastronomia", retratos: "Retratos", autoriais: "Autorais" };

    const getGallery = slug => {
      const p = data.projects.find(x => x.slug === slug);
      return (p && p.gallery) || [];
    };

    const renderNavLink = slug =>
      `<a class="topbar__link${categorySlug === slug ? " is-current" : ""}" href="${categoryHref(slug)}" data-transition>${navLabels[slug]}</a>`;

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
              const meta = [project.date, project.location, project.note || project.type].filter(Boolean);
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

    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -80px 0px" });

    cards.forEach(card => revealObserver.observe(card));

    cards.forEach(card => {
      const slug = card.dataset.slug;
      const pool = getGallery(slug);
      if (pool.length < 2) return;

      const baseImg = card.querySelector('[data-layer="base"]');
      const swapImg = card.querySelector('[data-layer="swap"]');
      let lastIndex = -1;
      let isSwapped = false;

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

        const hiddenLayer = isSwapped ? baseImg : swapImg;
        hiddenLayer.src = nextSrc;

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

    requestAnimationFrame(() => {
      setTimeout(() => {
        document.querySelector(".cat-header")?.classList.add("is-visible");
      }, 80);
    });
  };

  const start = () => {
    if (window.PAGE_DATA) return init(window.PAGE_DATA);
    const slug = (window.PAGE_CATEGORY || "").trim();
    if (!slug) return console.error("category-page: missing PAGE_CATEGORY or PAGE_DATA");
    fetch(`data/categories/${slug}.json`, { cache: "no-store" })
      .then(r => r.json())
      .then(init)
      .catch(err => console.error("category-page: failed to load JSON", err));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
