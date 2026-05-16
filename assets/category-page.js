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
              data-transition
              aria-label="${project.title} — ${project.client}"
            >
              <div class="cat-card__media">
                <img src="${project.cover}" alt="${project.coverAlt || project.title}" ${i > 1 ? 'loading="lazy"' : ""} />
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
