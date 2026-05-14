(() => {
  const data = window.PAGE_DATA;
  const app = document.getElementById("app");
  const isFolderPage = location.pathname.endsWith("/");
  const homeHref = isFolderPage ? "../index.html" : "index.html";
  const categorySlug = data.path.replace("/", "");
  const categoryHref = name => (isFolderPage ? `../${name}/` : `${name}.html`);
  const projectHref = project => `projeto.html?categoria=${encodeURIComponent(categorySlug)}&projeto=${encodeURIComponent(project.slug)}`;
  const firstProject = data.projects[0];

  const pad = value => String(value + 1).padStart(2, "0");

  const renderNavLink = (slug, label) => `
    <a class="topbar__link ${categorySlug === slug ? "is-current" : ""}" href="${categoryHref(slug)}">${label}</a>
  `;

  const renderIndexRow = (project, index) => `
    <a
      class="project-index__row ${index === 0 ? "is-active" : ""}"
      href="${projectHref(project)}"
      data-preview-src="${project.cover}"
      data-preview-alt="${project.coverAlt || project.title}"
      data-preview-title="${project.title}"
      data-preview-client="${project.client}"
      data-preview-href="${projectHref(project)}"
    >
      <span>${pad(index)}</span>
      <strong>${project.title}</strong>
      <em>${project.client}</em>
    </a>
  `;

  const stats = data.stats.map(text => `<span>${text}</span>`).join("");

  app.innerHTML = `
    <div class="page">
      <header class="topbar">
        <a class="topbar__brand" href="${homeHref}">Vitor Mateus</a>
        <nav class="topbar__nav" aria-label="Categorias">
          ${renderNavLink("arquitetura", "Arquitetura")}
          ${renderNavLink("gastronomia", "Gastronomia")}
          ${renderNavLink("retratos", "Retratos")}
          ${renderNavLink("autoriais", "Autorais")}
        </nav>
        <a class="topbar__home" href="${homeHref}">Home</a>
      </header>

      <main>
        <section class="category-hero" aria-labelledby="categoryTitle">
          <div class="category-hero__text">
            <p class="eyebrow">Portfólio por categoria</p>
            <h1 id="categoryTitle">${data.title}<span>${data.subtitle}</span></h1>
            <p class="category-hero__copy">${data.intro}</p>
            <div class="category-hero__stats">${stats}</div>
          </div>

          <div class="category-hero__visual">
            <a class="preview" href="${projectHref(firstProject)}" data-preview-link>
              <img src="${firstProject.cover}" alt="${firstProject.coverAlt || firstProject.title}" data-preview-image />
              <span class="preview__caption">
                <strong data-preview-title>${firstProject.title}</strong>
                <em data-preview-client>${firstProject.client}</em>
              </span>
            </a>
            <nav class="project-index" aria-label="Projetos de ${data.label}">
              ${data.projects.map(renderIndexRow).join("")}
            </nav>
          </div>
        </section>
      </main>
    </div>
  `;

  const previewImage = document.querySelector("[data-preview-image]");
  const previewTitle = document.querySelector("[data-preview-title]");
  const previewClient = document.querySelector("[data-preview-client]");
  const previewLink = document.querySelector("[data-preview-link]");
  const indexRows = [...document.querySelectorAll(".project-index__row")];

  const setPreview = row => {
    indexRows.forEach(item => item.classList.remove("is-active"));
    row.classList.add("is-active");
    previewImage.src = row.dataset.previewSrc;
    previewImage.alt = row.dataset.previewAlt;
    previewTitle.textContent = row.dataset.previewTitle;
    previewClient.textContent = row.dataset.previewClient;
    previewLink.href = row.dataset.previewHref;
  };

  indexRows.forEach(row => {
    row.addEventListener("mouseenter", () => setPreview(row));
    row.addEventListener("focus", () => setPreview(row));
  });
})();
