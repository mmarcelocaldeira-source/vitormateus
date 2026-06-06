(() => {
  "use strict";

  let home = {};

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, m =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]
    );
  }

  async function loadHome() {
    try {
      const r = await fetch("data/home.json");
      if (!r.ok) return;
      home = await r.json();
    } catch {
      return;
    }
    applyHome();
  }

  function applyHome() {
    // Header note
    const note = document.querySelector(".header-note");
    if (note && home.header_note) note.textContent = home.header_note;

    // Intro
    const introPrimary = document.querySelector(".intro-text");
    const introSecondary = document.querySelector(".intro-small");
    if (introPrimary && home.intro?.primary) introPrimary.innerHTML = home.intro.primary;
    if (introSecondary && home.intro?.secondary) introSecondary.innerHTML = home.intro.secondary;

    // About
    const aboutTitle = document.querySelector(".about-text");
    const aboutList = document.querySelector(".about-list");
    if (aboutTitle && home.about?.title) aboutTitle.textContent = home.about.title;
    if (aboutList && Array.isArray(home.about?.items)) {
      aboutList.innerHTML = home.about.items.map(item => `
        <div class="about-row">
          <p class="meta">${escapeHtml(item.label || "")}</p>
          <p>${escapeHtml(item.text || "")}</p>
        </div>
      `).join("");
    }

    // Contact
    const contactTitle = document.querySelector(".contact-title");
    const contactLinks = document.querySelector(".contact-links");
    if (contactTitle && home.contact?.headline) contactTitle.innerHTML = home.contact.headline;
    if (contactLinks) {
      contactLinks.innerHTML = "";
      if (home.contact?.phone) {
        contactLinks.innerHTML += `<a class="contact-link" href="${escapeAttr(home.contact.phone_href || "")}">${escapeHtml(home.contact.phone)}</a>`;
      }
      if (home.contact?.email) {
        contactLinks.innerHTML += `<a class="contact-link" href="mailto:${escapeAttr(home.contact.email)}">${escapeHtml(home.contact.email)}</a>`;
      }
    }

    // Footer
    const footerSocial = document.querySelector(".social");
    if (footerSocial && home.footer?.social) {
      footerSocial.innerHTML = "";
      for (const [name, url] of Object.entries(home.footer.social)) {
        const a = document.createElement("a");
        a.href = url;
        a.textContent = name.charAt(0).toUpperCase() + name.slice(1);
        footerSocial.appendChild(a);
      }
    }
  }

  function escapeAttr(s) { return String(s ?? "").replace(/"/g, "&quot;"); }

  document.addEventListener("DOMContentLoaded", loadHome);
})();
