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
          gallery: ["arq-01.jpg", "arq-02.jpg", "arq-03.jpg"].map(file => `assets/arquitetura/${file}`)
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
          gallery: ["arq-04.jpg", "arq-05.jpg", "arq-06.jpg"].map(file => `assets/arquitetura/${file}`)
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
          gallery: ["arq-07.jpg", "arq-08.jpg", "arq-09.jpg", "arq-10.jpg"].map(file => `assets/arquitetura/${file}`)
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
          gallery: Array.from({ length: 15 }, (_, index) => `assets/gastronomia/cochicho-cafe/cochicho-cafe-${String(index + 1).padStart(2, "0")}.jpg`)
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
          gallery: Array.from({ length: 5 }, (_, index) => `assets/gastronomia/caprese/caprese-${String(index + 1).padStart(2, "0")}.jpg`)
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
          gallery: Array.from({ length: 8 }, (_, index) => `assets/gastronomia/tagate/tagate-${String(index + 1).padStart(2, "0")}.jpg`)
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
          gallery: Array.from({ length: 4 }, (_, index) => `assets/gastronomia/pain-au-chocolat/pain-au-chocolat-${String(index + 1).padStart(2, "0")}.jpg`)
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
          gallery: [1, 2, 3, 4].map(number => `assets/retratos/kenji/kenji-${String(number).padStart(2, "0")}.jpg`)
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
          gallery: [5, 6, 7, 8].map(number => `assets/retratos/kenji/kenji-${String(number).padStart(2, "0")}.jpg`)
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
          gallery: [9, 10, 11, 12].map(number => `assets/retratos/kenji/kenji-${String(number).padStart(2, "0")}.jpg`)
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
          gallery: ["waves-01.jpg", "waves-02.jpg", "waves-03.jpg"].map(file => `assets/autorais/${file}`)
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
          gallery: Array.from({ length: 5 }, (_, index) => `assets/autorais/buenos-aires-2022/buenos-aires-${String(index + 1).padStart(2, "0")}.jpg`)
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
          gallery: Array.from({ length: 9 }, (_, index) => `assets/autorais/portra-160/portra160-${String(index + 1).padStart(2, "0")}.jpg`)
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
          gallery: Array.from({ length: 17 }, (_, index) => `assets/autorais/kodak-gold-200/kodak-gold200-${String(index + 1).padStart(2, "0")}.jpg`)
        }
      ]
    }
  };

  const category = categories[activeCategory];
  const project = category?.projects.find(item => item.slug === activeProject) || category?.projects[0];

  const projectHref = item => `projeto.html?categoria=${encodeURIComponent(activeCategory)}&projeto=${encodeURIComponent(item.slug)}`;
  const isVideo = src => /\.(mp4|webm|mov)$/i.test(src);
  const mediaType = src => isVideo(src) ? "video" : "image";

  const renderMedia = (src, index) => {
    const className = index % 7 === 0 ? "gallery__item gallery__item--wide" : index % 5 === 0 ? "gallery__item gallery__item--tall" : "gallery__item";
    const media = isVideo(src)
      ? `<video src="${src}" muted playsinline preload="metadata"></video>`
      : `<img src="${src}" alt="${project.title} - imagem ${index + 1}" loading="lazy" />`;

    return `
      <button class="${className}" type="button" data-src="${src}" data-type="${mediaType(src)}" data-alt="${project.title} - imagem ${index + 1}">
        ${media}
      </button>
    `;
  };

  if (!category || !project) {
    app.innerHTML = `
      <main class="not-found">
        <p class="eyebrow">Projeto não encontrado</p>
        <a href="index.html">Voltar ao início</a>
      </main>
    `;
    return;
  }

  const projectIndex = category.projects.map(item => `
    <a class="${item.slug === project.slug ? "is-current" : ""}" href="${projectHref(item)}">${item.title}</a>
  `).join("");

  document.title = `${project.title} - Vitor Mateus`;

  app.innerHTML = `
    <div class="page">
      <header class="topbar">
        <a class="topbar__brand" href="index.html">Vitor Mateus</a>
        <nav class="topbar__nav" aria-label="Categorias">
          <a href="arquitetura.html">Arquitetura</a>
          <a href="gastronomia.html">Gastronomia</a>
          <a href="retratos.html">Retratos</a>
          <a href="autoriais.html">Autorais</a>
        </nav>
        <a class="topbar__home" href="${category.href}">Voltar</a>
      </header>

      <main>
        <section class="project-hero">
          <div class="project-hero__title">
            <p class="eyebrow">${category.label}</p>
            <h1>${project.title}</h1>
            <p>${project.description}</p>
          </div>

          <dl class="technical-sheet" aria-label="Ficha técnica">
            <div>
              <dt>Cliente</dt>
              <dd>${project.client}</dd>
            </div>
            <div>
              <dt>Data</dt>
              <dd>${project.date}</dd>
            </div>
            <div>
              <dt>Local</dt>
              <dd>${project.location}</dd>
            </div>
            <div>
              <dt>Tipo</dt>
              <dd>${project.type}</dd>
            </div>
          </dl>

          <div class="project-hero__cover">
            <img src="${project.cover}" alt="${project.title}" />
          </div>
        </section>

        <section class="gallery-head">
          <p class="eyebrow">Galeria</p>
          <nav aria-label="Projetos em ${category.label}">
            ${projectIndex}
          </nav>
        </section>

        <section class="gallery" aria-label="Galeria de ${project.title}">
          ${project.gallery.map(renderMedia).join("")}
        </section>
      </main>
    </div>

    <div class="lightbox" aria-hidden="true">
      <button class="lightbox__close eyebrow" type="button">Fechar</button>
      <div class="lightbox__media"></div>
    </div>
  `;

  const lightbox = document.querySelector(".lightbox");
  const lightboxMedia = document.querySelector(".lightbox__media");
  const closeButton = document.querySelector(".lightbox__close");

  const openLightbox = (src, alt, type) => {
    lightboxMedia.innerHTML = type === "video"
      ? `<video src="${src}" controls autoplay playsinline></video>`
      : `<img src="${src}" alt="${alt}" />`;
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

  app.addEventListener("click", event => {
    const trigger = event.target.closest("[data-src]");
    if (!trigger) return;
    openLightbox(trigger.dataset.src, trigger.dataset.alt || "", trigger.dataset.type || "image");
  });

  closeButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeLightbox();
  });
})();
