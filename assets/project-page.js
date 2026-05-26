(() => {
  const app = document.getElementById("app");
  const params = new URLSearchParams(location.search);
  const activeCategory = params.get("categoria") || "gastronomia";
  const activeProject = params.get("projeto") || "";

  const categorySlugs = ["arquitetura", "gastronomia", "retratos", "autoriais"];

  const labelByPath = path => {
    const slug = path.replace("/", "");
    return slug.charAt(0).toUpperCase() + slug.slice(1);
  };

  Promise.all(
    categorySlugs.map(slug =>
      fetch(`data/categories/${slug}.json`, { cache: "no-store" }).then(r => r.json()).then(d => [slug, d])
    )
  )
    .then(entries => {
      const categories = {};
      entries.forEach(([slug, data]) => {
        categories[slug] = {
          label: data.label || labelByPath(data.path || `/${slug}`),
          href: `${slug}.html`,
          projects: data.projects || []
        };
      });
      render(categories);
    })
    .catch(err => {
      console.error("project-page: failed to load category data", err);
      app.innerHTML = `<main class="not-found"><p class="eyebrow">Erro ao carregar projeto</p><a href="index.html">← Voltar ao início</a></main>`;
    });

  function render(categories) {
    const category = categories[activeCategory];
    const project = category?.projects.find(p => p.slug === activeProject) || category?.projects[0];

    if (!category || !project) {
      app.innerHTML = `
        <main class="not-found">
          <p class="eyebrow">Projeto não encontrado</p>
          <a href="index.html">← Voltar ao início</a>
        </main>`;
      return;
    }

    const projectHref = item =>
      `projeto.html?categoria=${encodeURIComponent(activeCategory)}&projeto=${encodeURIComponent(item.slug)}`;

    const isVideo = src => /\.(mp4|webm|mov)$/i.test(src);

    const layoutPatterns = [
      "gallery__item gallery__item--wide",
      "gallery__item",
      "gallery__item",
      "gallery__item gallery__item--full",
      "gallery__item",
      "gallery__item gallery__item--wide",
      "gallery__item",
      "gallery__item",
      "gallery__item gallery__item--half",
      "gallery__item gallery__item--half",
    ];

    const getClass = index => layoutPatterns[index % layoutPatterns.length];

    const renderMedia = (src, index) => {
      const cls = getClass(index);
      const media = isVideo(src)
        ? `<video src="${src}" muted playsinline preload="metadata"></video>`
        : `<img src="${src}" alt="${project.title} — ${index + 1}" loading="${index < 3 ? "eager" : "lazy"}" />`;

      return `
        <button class="${cls}" type="button" data-src="${src}" data-type="${isVideo(src) ? "video" : "image"}" data-index="${index}" aria-label="Abrir imagem ${index + 1}">
          ${media}
        </button>
      `;
    };

    document.title = `${project.title} — Vitor Mateus`;

    const projectType = project.type || project.note || "";
    const gallery = project.gallery || [];
    const projectIndex = Math.max(0, category.projects.findIndex(p => p.slug === project.slug));
    const nextProject = category.projects[(projectIndex + 1) % category.projects.length];

    app.innerHTML = `
      <div class="page-transition"></div>

      <header class="topbar">
        <a class="topbar__brand" href="index.html" data-transition>Vitor Mateus</a>
        <nav class="topbar__nav" aria-label="Categorias">
          <a href="arquitetura.html" data-transition>Arquitetura</a>
          <a href="gastronomia.html" data-transition>Gastronomia</a>
          <a href="retratos.html" data-transition>Retratos</a>
          <a href="autoriais.html" data-transition>Autorais</a>
        </nav>
        <a class="topbar__back" href="${category.href}" data-transition>← ${category.label}</a>
      </header>

      <main>
        <section class="project-hero">
          <div class="project-hero__title">
            <p class="eyebrow">${category.label} — ${projectType}</p>
            <h1>${project.title}</h1>
            <p class="project-hero__desc">${project.description || ""}</p>
          </div>

          <dl class="technical-sheet" aria-label="Ficha técnica">
            <div><dt>Cliente</dt><dd>${project.client || ""}</dd></div>
            <div><dt>Data</dt><dd>${project.date || ""}</dd></div>
            <div><dt>Local</dt><dd>${project.location || ""}</dd></div>
            <div><dt>Tipo</dt><dd>${projectType}</dd></div>
          </dl>
        </section>

        <section class="gallery" aria-label="Galeria de ${project.title}">
          ${gallery.map(renderMedia).join("")}
        </section>

        <a class="next-project" href="${projectHref(nextProject)}" data-transition aria-label="Próximo projeto: ${nextProject.title}">
          <img class="next-project__bg" src="${nextProject.cover}" alt="" />
          <div class="next-project__inner">
            <p class="eyebrow">Próximo projeto</p>
            <h2 class="next-project__title">${nextProject.title}</h2>
            <span class="next-project__cue eyebrow">Ver projeto →</span>
          </div>
        </a>
      </main>

      <div class="lightbox" aria-hidden="true" role="dialog" aria-label="Visualização ampliada">
        <button class="lightbox__close eyebrow" type="button">Fechar</button>
        <button class="lightbox__prev" type="button" aria-label="Imagem anterior">&#8592;</button>
        <button class="lightbox__next" type="button" aria-label="Próxima imagem">&#8594;</button>
        <div class="lightbox__media"></div>
        <span class="lightbox__count"></span>
      </div>
    `;

    const lightbox = document.querySelector(".lightbox");
    const lightboxMedia = document.querySelector(".lightbox__media");
    const closeBtn = document.querySelector(".lightbox__close");
    const prevBtn = document.querySelector(".lightbox__prev");
    const nextBtn = document.querySelector(".lightbox__next");
    const countEl = document.querySelector(".lightbox__count");

    let currentIndex = 0;

    const showSlide = index => {
      const total = gallery.length;
      currentIndex = (index + total) % total;
      const src = gallery[currentIndex];
      const isVid = isVideo(src);
      lightboxMedia.innerHTML = isVid
        ? `<video src="${src}" controls autoplay playsinline></video>`
        : `<img src="${src}" alt="${project.title} — ${currentIndex + 1}" />`;
      countEl.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
    };

    const openLightbox = index => {
      showSlide(index);
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      lightboxMedia.innerHTML = "";
      document.body.style.overflow = "";
    };

    app.addEventListener("click", e => {
      const trigger = e.target.closest("[data-src]");
      if (!trigger) return;
      openLightbox(parseInt(trigger.dataset.index, 10) || 0);
    });

    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", () => showSlide(currentIndex - 1));
    nextBtn.addEventListener("click", () => showSlide(currentIndex + 1));

    lightbox.addEventListener("click", e => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", e => {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showSlide(currentIndex - 1);
      if (e.key === "ArrowRight") showSlide(currentIndex + 1);
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
  }
})();
