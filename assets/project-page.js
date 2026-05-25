(() => {
  const app = document.getElementById("app");
  const params = new URLSearchParams(location.search);
  const activeCategory = params.get("categoria") || "gastronomia";
  const activeProject = params.get("projeto") || "";

  const categories = {
    arquitetura: {
      label: "Arquitetura",
      href: "arquitetura.html",
      projects: [
        {
          slug: "casa-linha",
          title: "Casa Linha",
          client: "Estúdio Linha",
          date: "2025",
          location: "São Paulo, BR",
          type: "residencial",
          description: "Ensaio de residência contemporânea com ênfase em circulação, luz lateral e acabamento.",
          cover: "assets/arquitetura/arq-01.jpg",
          gallery: ["arq-01.jpg", "arq-02.jpg", "arq-03.jpg"].map(f => `assets/arquitetura/${f}`)
        },
        {
          slug: "escada-norte",
          title: "Escada Norte",
          client: "Projeto Editorial",
          date: "2024",
          location: "Curitiba, BR",
          type: "circulação",
          description: "Uma sequência sobre eixo vertical, ritmo e silêncio visual em ambiente interno.",
          cover: "assets/arquitetura/arq-04.jpg",
          gallery: ["arq-04.jpg", "arq-05.jpg", "arq-06.jpg"].map(f => `assets/arquitetura/${f}`)
        },
        {
          slug: "patio-monolito",
          title: "Pátio Monolito",
          client: "Incorporadora Soma",
          date: "2024",
          location: "Belo Horizonte, BR",
          type: "textura e massa",
          description: "Blocos, cortes de sombra e materialidade em uma leitura mais gráfica da arquitetura.",
          cover: "assets/arquitetura/arq-07.jpg",
          gallery: ["arq-07.jpg", "arq-08.jpg", "arq-09.jpg", "arq-10.jpg"].map(f => `assets/arquitetura/${f}`)
        }
      ]
    },
    gastronomia: {
      label: "Gastronomia",
      href: "gastronomia.html",
      projects: [
        {
          slug: "cochicho-cafe",
          title: "Cochicho Café",
          client: "Cochicho Café",
          date: "2025",
          location: "São Paulo, BR",
          type: "campanha",
          description: "Série de campanha com close, vapor, crema e composição de bancada.",
          cover: "assets/gastronomia/cochicho-cafe/cochicho-cafe-01.jpg",
          gallery: Array.from({ length: 15 }, (_, i) => `assets/gastronomia/cochicho-cafe/cochicho-cafe-${String(i + 1).padStart(2, "0")}.jpg`)
        },
        {
          slug: "caprese",
          title: "Caprese",
          client: "Estúdio de Conteúdo",
          date: "2024",
          location: "Rio de Janeiro, BR",
          type: "food styling",
          description: "Uma leitura mais gráfica e limpa da mesa, com cor e repetição de forma.",
          cover: "assets/gastronomia/caprese/caprese-01.jpg",
          gallery: Array.from({ length: 5 }, (_, i) => `assets/gastronomia/caprese/caprese-${String(i + 1).padStart(2, "0")}.jpg`)
        },
        {
          slug: "tagate",
          title: "Tagaté",
          client: "Tagaté",
          date: "2024",
          location: "São Paulo, BR",
          type: "menu visual",
          description: "Projeto mais amplo, com sequência de produto, mesa e leitura de marca.",
          cover: "assets/gastronomia/tagate/tagate-01.jpg",
          gallery: Array.from({ length: 8 }, (_, i) => `assets/gastronomia/tagate/tagate-${String(i + 1).padStart(2, "0")}.jpg`)
        },
        {
          slug: "pain-au-chocolat",
          title: "Pain au Chocolat",
          client: "Bauducco",
          date: "2024",
          location: "São Paulo, BR",
          type: "produto",
          description: "Linha curta e elegante para um produto com foco em crocância, brilho e repetição.",
          cover: "assets/gastronomia/pain-au-chocolat/pain-au-chocolat-01.jpg",
          gallery: Array.from({ length: 4 }, (_, i) => `assets/gastronomia/pain-au-chocolat/pain-au-chocolat-${String(i + 1).padStart(2, "0")}.jpg`)
        }
      ]
    },
    retratos: {
      label: "Retratos",
      href: "retratos.html",
      projects: [
        {
          slug: "kenji-01",
          title: "Kenji I",
          client: "Pessoal",
          date: "2025",
          location: "São Paulo, BR",
          type: "estudo de rosto",
          description: "Primeira sequência com leitura mais contida, fundo simples e foco na expressão.",
          cover: "assets/retratos/kenji/kenji-01.jpg",
          gallery: [1, 2, 3, 4].map(n => `assets/retratos/kenji/kenji-${String(n).padStart(2, "0")}.jpg`)
        },
        {
          slug: "kenji-02",
          title: "Kenji II",
          client: "Pessoal",
          date: "2025",
          location: "São Paulo, BR",
          type: "movimento",
          description: "Mais gesto, mais deslocamento e uma aproximação editorial da figura.",
          cover: "assets/retratos/kenji/kenji-05.jpg",
          gallery: [5, 6, 7, 8].map(n => `assets/retratos/kenji/kenji-${String(n).padStart(2, "0")}.jpg`)
        },
        {
          slug: "kenji-03",
          title: "Kenji III",
          client: "Pessoal",
          date: "2025",
          location: "São Paulo, BR",
          type: "fechamento",
          description: "Uma série de fechamento mais limpa e direta, com foco em textura e postura.",
          cover: "assets/retratos/kenji/kenji-09.jpg",
          gallery: [9, 10, 11, 12].map(n => `assets/retratos/kenji/kenji-${String(n).padStart(2, "0")}.jpg`)
        }
      ]
    },
    autoriais: {
      label: "Autorais",
      href: "autoriais.html",
      projects: [
        {
          slug: "waves",
          title: "Waves",
          client: "Série pessoal",
          date: "2024",
          location: "Brasil",
          type: "repetição",
          description: "Exploração de forma e movimento com pouca informação e uma leitura quase abstrata.",
          cover: "assets/autorais/waves-01.jpg",
          gallery: ["waves-01.jpg", "waves-02.jpg", "waves-03.jpg"].map(f => `assets/autorais/${f}`)
        },
        {
          slug: "buenos-aires-2022",
          title: "Buenos Aires 2022",
          client: "Série pessoal",
          date: "2022",
          location: "Buenos Aires, AR",
          type: "cidade",
          description: "Cenas urbanas com luz de rua, deslocamento e uma sensação documental mais aberta.",
          cover: "assets/autorais/buenos-aires-2022/buenos-aires-01.jpg",
          gallery: Array.from({ length: 5 }, (_, i) => `assets/autorais/buenos-aires-2022/buenos-aires-${String(i + 1).padStart(2, "0")}.jpg`)
        },
        {
          slug: "portra-160",
          title: "Portra 160",
          client: "Série pessoal",
          date: "2023",
          location: "Brasil",
          type: "filme",
          description: "Uma sequência mais suave, com clima de memória e granulação discreta.",
          cover: "assets/autorais/portra-160/portra160-01.jpg",
          gallery: Array.from({ length: 9 }, (_, i) => `assets/autorais/portra-160/portra160-${String(i + 1).padStart(2, "0")}.jpg`)
        },
        {
          slug: "kodak-gold-200",
          title: "Kodak Gold 200",
          client: "Série pessoal",
          date: "2024",
          location: "Brasil",
          type: "cor",
          description: "Linguagem mais quente e solar, com foco em cor, recorte e atmosfera.",
          cover: "assets/autorais/kodak-gold-200/kodak-gold200-01.jpg",
          gallery: Array.from({ length: 17 }, (_, i) => `assets/autorais/kodak-gold-200/kodak-gold200-${String(i + 1).padStart(2, "0")}.jpg`)
        }
      ]
    }
  };

  const category = categories[activeCategory];
  const project = category?.projects.find(p => p.slug === activeProject) || category?.projects[0];

  const projectHref = item =>
    `projeto.html?categoria=${encodeURIComponent(activeCategory)}&projeto=${encodeURIComponent(item.slug)}`;

  const isVideo = src => /\.(mp4|webm|mov)$/i.test(src);

  // Gallery layout: editorial rhythm
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

  if (!category || !project) {
    app.innerHTML = `
      <main class="not-found">
        <p class="eyebrow">Projeto não encontrado</p>
        <a href="index.html">← Voltar ao início</a>
      </main>`;
    return;
  }

  document.title = `${project.title} — Vitor Mateus`;

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
          <p class="eyebrow">${category.label} — ${project.type}</p>
          <h1>${project.title}</h1>
          <p class="project-hero__desc">${project.description}</p>
        </div>

        <dl class="technical-sheet" aria-label="Ficha técnica">
          <div><dt>Cliente</dt><dd>${project.client}</dd></div>
          <div><dt>Data</dt><dd>${project.date}</dd></div>
          <div><dt>Local</dt><dd>${project.location}</dd></div>
          <div><dt>Tipo</dt><dd>${project.type}</dd></div>
        </dl>
      </section>

      <section class="gallery" aria-label="Galeria de ${project.title}">
        ${project.gallery.map(renderMedia).join("")}
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

  // ─── Lightbox ───
  const lightbox = document.querySelector(".lightbox");
  const lightboxMedia = document.querySelector(".lightbox__media");
  const closeBtn = document.querySelector(".lightbox__close");
  const prevBtn = document.querySelector(".lightbox__prev");
  const nextBtn = document.querySelector(".lightbox__next");
  const countEl = document.querySelector(".lightbox__count");
  const galleryItems = [...document.querySelectorAll(".gallery__item")];

  let currentIndex = 0;

  const showSlide = index => {
    const total = project.gallery.length;
    currentIndex = (index + total) % total;
    const src = project.gallery[currentIndex];
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

})();
