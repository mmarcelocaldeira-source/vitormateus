(() => {
  const navLinks = ["arquitetura", "gastronomia", "retratos", "autoriais"];
  const navLabels = { arquitetura: "Arquitetura", gastronomia: "Gastronomia", retratos: "Retratos", autoriais: "Autorais" };

  const isFolderPage = location.pathname.endsWith("/");
  const homeHref = isFolderPage ? "../index.html" : "index.html";
  const categoryHref = name => isFolderPage ? `../${name}/` : `${name}.html`;

  const app = document.getElementById("app");
  const cache = {};

  const fetchCategory = slug => {
    if (cache[slug]) return Promise.resolve(cache[slug]);
    return fetch(`data/categories/${slug}.json`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => { cache[slug] = d; return d; });
  };

  const renderNavLink = (slug, currentSlug) =>
    `<a class="topbar__link${currentSlug === slug ? " is-current" : ""}" href="${categoryHref(slug)}" data-cat="${slug}">${navLabels[slug]}</a>`;

  const renderShell = currentSlug => `
    <div class="page-transition"></div>

    <header class="topbar">
      <a class="topbar__brand" href="${homeHref}" data-transition>Vitor Mateus</a>
      <nav class="topbar__nav" aria-label="Categorias">
        ${navLinks.map(s => renderNavLink(s, currentSlug)).join("")}
      </nav>
      <a class="topbar__home" href="${homeHref}" data-transition>← Início</a>
    </header>

    <main id="cat-main"></main>
  `;

  const renderMain = (data, slug) => {
    const projectHref = project =>
      `projeto.html?categoria=${encodeURIComponent(slug)}&projeto=${encodeURIComponent(project.slug)}`;

    return `
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
              aria-label="${project.title} — ${project.client || ""}"
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
    `;
  };

  const wireMainBehavior = (data, slug) => {
    const main = document.getElementById("cat-main");
    const cards = [...main.querySelectorAll(".cat-card")];

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
      const slugCard = card.dataset.slug;
      const project = data.projects.find(p => p.slug === slugCard);
      const pool = (project && project.gallery) || [];
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

    requestAnimationFrame(() => {
      setTimeout(() => {
        main.querySelector(".cat-header")?.classList.add("is-visible");
      }, 80);
    });
  };

  const switchCategory = (slug, opts = {}) => {
    const main = document.getElementById("cat-main");
    if (!main) return;

    const linkEls = document.querySelectorAll(".topbar__link");
    linkEls.forEach(el => el.classList.toggle("is-current", el.dataset.cat === slug));

    main.classList.add("is-leaving");

    return fetchCategory(slug).then(data => {
      setTimeout(() => {
        main.innerHTML = renderMain(data, slug);
        main.classList.remove("is-leaving");
        main.classList.add("is-entering");
        document.title = `${data.label} — Vitor Mateus`;
        wireMainBehavior(data, slug);
        window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
        if (!opts.replace) {
          history.pushState({ slug }, "", categoryHref(slug));
        }
        requestAnimationFrame(() => {
          requestAnimationFrame(() => main.classList.remove("is-entering"));
        });
      }, 180);
    });
  };

  const wireGlobalNav = () => {
    document.querySelectorAll(".topbar__link").forEach(link => {
      link.addEventListener("click", e => {
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        const slug = link.dataset.cat;
        switchCategory(slug);
      });
    });

    document.querySelectorAll("[data-transition]").forEach(link => {
      link.addEventListener("click", e => {
        const href = link.getAttribute("href");
        if (!href || href.startsWith("#") || e.ctrlKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        const transition = document.querySelector(".page-transition");
        transition.classList.add("is-entering");
        transition.addEventListener("animationend", () => {
          window.location.href = href;
        }, { once: true });
      });
    });
  };

  window.addEventListener("popstate", e => {
    const slug = (e.state && e.state.slug) || inferSlugFromURL();
    if (slug && navLinks.includes(slug)) {
      switchCategory(slug, { replace: true });
    }
  });

  const inferSlugFromURL = () => {
    const m = location.pathname.match(/\/([a-z-]+)\.html$/i) || location.pathname.match(/\/([a-z-]+)\/?$/i);
    if (m && navLinks.includes(m[1].toLowerCase())) return m[1].toLowerCase();
    return null;
  };

  const start = () => {
    const slug = (window.PAGE_CATEGORY || inferSlugFromURL() || "").trim();
    if (!slug) return console.error("category-page: missing PAGE_CATEGORY");

    app.style.visibility = "visible";
    app.innerHTML = renderShell(slug);

    fetchCategory(slug).then(data => {
      document.getElementById("cat-main").innerHTML = renderMain(data, slug);
      document.title = `${data.label} — Vitor Mateus`;
      wireMainBehavior(data, slug);
      history.replaceState({ slug }, "", location.pathname);
      wireGlobalNav();
      // Preload other categories so subsequent switches are instant
      navLinks.filter(s => s !== slug).forEach(s => fetchCategory(s));
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
