(() => {
	"use strict";

	const API_BASE = "https://api.github.com";
	const CONFIG_PATH = "./config.json";

	let state = {
		pat: null,
		owner: null,
		repo: null,
		categories: []
	};

	const $ = (sel, el = document) => el.querySelector(sel);
	const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

	async function loadConfig() {
		const r = await fetch(CONFIG_PATH);
		if (!r.ok) throw new Error("config.json não encontrado");
		const cfg = await r.json();
		state.owner = cfg.github.owner;
		state.repo = cfg.github.repo;
	}

	async function gh(path, opts = {}) {
		const headers = {
			Accept: "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28"
		};
		if (state.pat) headers.Authorization = `Bearer ${state.pat}`;
		const url = path.startsWith("/user")
			? `${API_BASE}${path}`
			: `${API_BASE}/repos/${state.owner}/${state.repo}${path}`;
		const res = await fetch(url, {
			...opts,
			headers: { ...headers, ...(opts.headers || {}) }
		});
		if (res.status === 401) {
			state.pat = null;
			location.reload();
			throw new Error("Não autorizado");
		}
		if (!res.ok) {
			const txt = await res.text().catch(() => "");
			throw new Error(`GitHub ${res.status}: ${txt || res.statusText}`);
		}
		return res;
	}

	async function getFile(path, branch = "main") {
		const r = await gh(`/contents/${path}?ref=${encodeURIComponent(branch)}`);
		return r.json();
	}

	async function putFile(path, contentB64, message, branch = "main") {
		const r = await gh(`/contents/${encodeURIComponent(path)}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ message, content: contentB64, branch })
		});
		return r;
	}

	function decodeB64(b64) {
		return decodeURIComponent(escape(atob(b64)));
	}

	function encodeB64(text) {
		return btoa(unescape(encodeURIComponent(text)));
	}

	async function fetchCategories() {
		const files = await getFile("data/categories");
		const categories = [];
		for (const f of files) {
			if (f.type !== "file" || !f.name.endsWith(".json")) continue;
			const data = await fetchFile("data/categories/" + f.name);
			categories.push(data);
		}
		return categories;
	}

	async function saveFile(data, message) {
		const out = {
			message,
			content: encodeB64(JSON.stringify((( { _path, _sha, ...rest } = data ) => rest)(data), null, 2)),
			branch: "main"
		};
		if (data._sha) out.sha = data._sha;
		console.log("[saveFile]", data._path, out);
		await gh("/contents/" + encodeURIComponent(data._path), {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(out)
		});
	}

	async function fetchFile(path) {
		const raw = await getFile(path);
		const text = decodeB64(raw.content);
		let data;
		try { data = JSON.parse(text); } catch { data = {}; }
		data._path = raw.path;
		data._sha = raw.sha;
		return data;
	}

	async function saveCategory(data) {
		const { _sha, _path, ...rest } = data;
		await saveFile({ ...rest, _path, _sha }, `update ${_path} via admin`);
	}

	async function openHomeModal() {
		const home = await fetchFile("data/home.json").catch(() => ({ header_note: "", intro: {}, about: {}, contact: {}, footer: {} }));
		if (!home._path) home._path = "data/home.json";
		if (!home._sha) home._sha = "";

		$("#modal-title").textContent = "Editar home";
		$("#modal-body").innerHTML = `
			<div class="form">
				<div class="field">
					<label>Header note</label>
					<input data-field="header_note" value="${escapeAttr(home.header_note || "")}" />
				</div>
				<div class="field">
					<label>Intro primária (aceita HTML básico)</label>
					<textarea data-field="intro_primary" rows="3">${escapeHtml(home.intro?.primary || "")}</textarea>
				</div>
				<div class="field">
					<label>Intro secundária</label>
					<textarea data-field="intro_secondary" rows="2">${escapeHtml(home.intro?.secondary || "")}</textarea>
				</div>
				<div class="field">
					<label>Título "Serviços"</label>
					<input data-field="about_title" value="${escapeAttr(home.about?.title || "")}" />
				</div>
				<div class="field">
					<label>Contato headline (aceita HTML básico)</label>
					<textarea data-field="contact_headline" rows="2">${escapeHtml(home.contact?.headline || "")}</textarea>
				</div>
				<div class="row">
					<div class="field">
						<label>Telefone</label>
						<input data-field="contact_phone" value="${escapeAttr(home.contact?.phone || "")}" />
					</div>
					<div class="field">
						<label>E-mail</label>
						<input data-field="contact_email" value="${escapeAttr(home.contact?.email || "")}" />
					</div>
				</div>
				<div class="field">
					<label>Rodapé frase</label>
					<input data-field="footer_center" value="${escapeAttr(home.footer?.center || "")}" />
				</div>
			</div>
		`;
		$("#modal-cancel").onclick = closeModal;
		$("#modal-close").onclick = closeModal;

		await waitSave(async () => {
			const p = formPayload($("#modal-body"));
			const data = {
				_path: home._path,
				_sha: home._sha,
				header_note: p.header_note || "",
				intro: {
					primary: p.intro_primary || "",
					secondary: p.intro_secondary || ""
				},
				about: {
					title: p.about_title || "",
					items: home.about?.items || []
				},
				contact: {
					headline: p.contact_headline || "",
					phone: p.contact_phone || "",
					phone_href: `tel:${(p.contact_phone || "").replace(/\D/g, "")}`,
					email: p.contact_email || ""
				},
				footer: {
					center: p.footer_center || "",
					social: home.footer?.social || {}
				}
			};
			setStatus("salvando home...");
			try {
				await saveFile(data, "update home via admin");
				setStatus("home salva");
			} catch (e) {
				alert("Erro ao salvar home: " + e.message);
			}
		});
	}

	async function uploadImage(file, folder = "assets/uploads") {
		const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
		const path = `${folder}/${Date.now()}-${safeName}`;
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = async () => {
				const b64 = reader.result.split(",")[1];
				try {
					await putFile(path, b64, `upload ${path} via admin`);
					resolve(path);
				} catch (e) {
					reject(e);
				}
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	function hide(el) { if (el) el.classList.add("hidden"); }
	function show(el) { if (el) el.classList.remove("hidden"); }

	function escapeHtml(s) {
		return String(s ?? "").replace(/[&<>"']/g, m =>
			({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]
		);
	}
	function escapeAttr(s) { return String(s ?? "").replace(/"/g, "&quot;"); }

	function relativeToAdmin(p) {
		if (!p) return "";
		if (p.startsWith("http")) return p;
		return `https://raw.githubusercontent.com/${state.owner}/${state.repo}/main/${p}`;
	}

	function setStatus(msg) {
		const el = $("#status");
		if (el) el.textContent = msg || "";
	}

	function savePat() { try { localStorage.setItem("vitormateus.pat", state.pat || ""); } catch {} }
	function loadPat() { try { state.pat = localStorage.getItem("vitormateus.pat") || null; } catch {} }

	function mountModal(backdropId = "modal-backdrop") {
		const modal = $("#modal");
		const old = $("#" + backdropId);
		if (old) old.remove();
		const backdrop = document.createElement("div");
		backdrop.className = "modal__backdrop";
		backdrop.id = backdropId;
		backdrop.onclick = closeModal;
		modal.insertBefore(backdrop, modal.firstChild);
		show(modal);
	}

	function closeModal() {
		const modal = $("#modal");
		if (!modal) return;
		const bd = $("#modal-backdrop");
		if (bd) bd.remove();
		hide(modal);
	}

	function formPayload(root) {
		const out = {};
		$$("[data-field]", root).forEach(el => {
			const key = el.dataset.field;
			let v = el.value ?? "";
			if (key === "stats") v = v.split(",").map(s => s.trim()).filter(Boolean);
			out[key] = v;
		});
		return out;
	}

	async function waitSave(fn) {
		return new Promise(resolve => {
			$("#modal-save").onclick = async () => {
				await fn();
				closeModal();
				resolve();
			};
		});
	}

	async function openCategoryModal(cat, isNew) {
		const title = isNew ? "Nova categoria" : "Editar categoria";
		$("#modal-title").textContent = title;
		$("#modal-body").innerHTML = `
			<div class="form">
				<div class="field">
					<label>Título</label>
					<input data-field="title" value="${escapeAttr(cat.title || "")}" />
				</div>
				<div class="field">
					<label>Rótulo</label>
					<input data-field="label" value="${escapeAttr(cat.label || "")}" />
				</div>
				<div class="field">
					<label>Caminho (URL)</label>
					<input data-field="path" value="${escapeAttr(cat.path || "")}" />
				</div>
				<div class="field">
					<label>Subtítulo</label>
					<input data-field="subtitle" value="${escapeAttr(cat.subtitle || "")}" />
				</div>
				<div class="field">
					<label>Introdução</label>
					<textarea data-field="intro" rows="3">${escapeHtml(cat.intro || "")}</textarea>
				</div>
				<div class="field">
					<label>Stats (CSV)</label>
					<input data-field="stats" value="${escapeAttr((cat.stats || []).join(", "))}" />
				</div>
			</div>
		`;
		$("#modal-cancel").onclick = closeModal;
		$("#modal-close").onclick = closeModal;
		mountModal("modal-backdrop-cat");
		await waitSave(async () => {
			const payload = formPayload($("#modal-body"));
			Object.assign(cat, payload);
			if (!Array.isArray(cat.stats)) cat.stats = [];
			if (isNew) {
				cat._path = `data/categories/${(cat.path || cat.label || "categoria").toLowerCase().replace(/[^a-z0-9-]+/g, "-")}.json`;
				cat.projects = cat.projects || [];
			}
			setStatus("salvando...");
			try {
				await saveCategory(cat);
				setStatus("salvo");
				await renderDashboard();
			} catch (e) {
				alert("Erro ao salvar: " + e.message);
			}
		});
	}

	async function openProjectModal(cat, project, isNew) {
		const title = isNew ? "Novo projeto" : "Editar projeto";
		$("#modal-title").textContent = title;
		const gallery = project.gallery || [];
		$("#modal-body").innerHTML = `
			<div class="form">
				<div class="field">
					<label>Slug</label>
					<input data-field="slug" value="${escapeAttr(project.slug || "")}" />
				</div>
				<div class="row">
					<div class="field">
						<label>Título</label>
						<input data-field="title" value="${escapeAttr(project.title || "")}" />
					</div>
					<div class="field">
						<label>Cliente</label>
						<input data-field="client" value="${escapeAttr(project.client || "")}" />
					</div>
				</div>
				<div class="row">
					<div class="field">
						<label>Ano</label>
						<input data-field="date" value="${escapeAttr(project.date || "")}" />
					</div>
					<div class="field">
						<label>Localização</label>
						<input data-field="location" value="${escapeAttr(project.location || "")}" />
					</div>
				</div>
				<div class="row">
					<div class="field">
						<label>Tipo</label>
						<input data-field="type" value="${escapeAttr(project.type || "")}" />
					</div>
					<div class="field">
						<label>Nota</label>
						<input data-field="note" value="${escapeAttr(project.note || "")}" />
					</div>
				</div>
				<div class="field">
					<label>Descrição</label>
					<textarea data-field="description" rows="3">${escapeHtml(project.description || "")}</textarea>
				</div>
				<div class="field">
				  <label>Cover</label>
				  <input data-field="cover" value="${escapeAttr(project.cover || "")}" />
				  ${project.cover ? `<img data-preview-cover src="${relativeToAdmin(project.cover)}" style="max-width:160px; border-radius:6px; margin-top:8px; border:1px solid rgba(17,17,15,0.14)" />` : ""}
				</div>
				<div class="field">
					<label>Upload de capa</label>
					<label class="drop">
						<input type="file" accept="image/*" />
						Arraste ou clique
					</label>
				</div>
				<div class="field">
					<label>Galeria</label>
					<div class="gallery" id="gallery-grid"></div>
					<label class="drop" style="margin-top:10px">
						<input type="file" accept="image/*" multiple />
						Adicionar fotos à galeria
					</label>
				</div>
			</div>
		`;

		$("#modal-cancel").onclick = closeModal;
		$("#modal-close").onclick = closeModal;
		mountModal("modal-backdrop-proj");

		const renderGallery = () => {
			const grid = $("#gallery-grid");
			if (!grid) return;
			grid.innerHTML = "";
			gallery.forEach((src, idx) => {
				const item = document.createElement("div");
				item.className = "gallery__item";
				item.innerHTML = `<img src="${relativeToAdmin(src)}" alt="" /><button data-idx="${idx}">×</button>`;
				item.querySelector("button").addEventListener("click", () => {
					gallery.splice(idx, 1);
					renderGallery();
				});
				grid.appendChild(item);
			});
		};
		renderGallery();

		const galleryInput = $("input[type='file'][accept='image/*'][multiple]", $("#modal-body"));
		if (galleryInput) {
			galleryInput.addEventListener("change", async () => {
				for (const f of galleryInput.files || []) {
					const path = await uploadImage(f, "assets/uploads");
					gallery.push(path);
				}
				renderGallery();
				galleryInput.value = "";
			});
		}

		const coverInput = $("input[type='file'][accept='image/*']:not([multiple])", $("#modal-body"));
		if (coverInput) {
			coverInput.addEventListener("change", async () => {
				for (const f of coverInput.files || []) {
					const path = await uploadImage(f, "assets/uploads");
					project.cover = path;
					const coverField = $("[data-field='cover']", $("#modal-body"));
					if (coverField) coverField.value = path;
					const img = $("[data-preview-cover]", $("#modal-body"));
					if (img) { img.src = relativeToAdmin(path); img.style.display = "block"; }
				}
				coverInput.value = "";
			});
		}

		await waitSave(async () => {
			const payload = formPayload($("#modal-body"));
			Object.assign(project, payload);
			project.gallery = gallery;
			if (!project.slug) project.slug = `projeto-${Date.now()}`;
			setStatus("salvando...");
			try {
				await saveCategory(cat);
				setStatus("salvo");
				await renderDashboard();
			} catch (e) {
				alert("Erro ao salvar: " + e.message);
			}
		});
	}

	async function renderDashboard() {
		const box = $("categories");
		const addBtn = $("btn-add-cat");
		if(addBtn) addBtn.style.display = "";
		box.innerHTML = "";

		const homeCard = document.createElement("button");
		homeCard.className = "cat";
		homeCard.innerHTML = `
			<div class="cat__head">
				<div>
					<h3 class="cat__title">Home</h3>
					<p class="cat__sub">index.html / data/home.json</p>
				</div>
				<button data-act="edit-home" class="btn btn-primary">Editar textos da home</button>
			</div>
		`;
		homeCard.addEventListener("click", () => openHomeModal());
		box.appendChild(homeCard);

		let cats;
		try {
			cats = (await fetchCategories()).sort((a, b) =>
				String(a.label || a.path || "").localeCompare(String(b.label || b.path || ""))
			);
		} catch (e) {
			box.innerHTML = `<div class="card"><p class="hint">Erro: ${escapeHtml(e.message)}</p></div>`;
			return;
		}
		state.categories = cats;
		box.innerHTML = "";
		for (const cat of cats) {
			const el = document.createElement("article");
			el.className = "cat";
			el.innerHTML = `
				<div class="cat__head">
					<div>
						<h3 class="cat__title">${escapeHtml(cat.label || cat.title || "(sem título)")}</h3>
						<p class="cat__sub">${escapeHtml(cat.path || "")}</p>
					</div>
					<div style="display:flex; gap:10px">
						<button data-act="add" data-cat-path="${escapeAttr(cat._path)}" class="btn btn-primary">+ Projeto</button>
						<button data-act="edit" data-cat-path="${escapeAttr(cat._path)}" class="btn btn-ghost">Editar</button>
					</div>
				</div>
				<div class="projects"></div>
			`;
			const list = el.querySelector(".projects");
			for (const p of (cat.projects || [])) {
				const row = document.createElement("div");
				row.className = "project";
				row.innerHTML = `
					<img class="project__thumb" src="${relativeToAdmin(p.cover)}" alt="" />
					<div class="project__meta">
						<div class="project__name">${escapeHtml(p.title || "(sem título)")}</div>
						<div class="project__info">${escapeHtml([p.date, p.location, p.type || p.note].filter(Boolean).join(" · "))}</div>
					</div>
					<div class="project__actions">
						<button data-act="edit-project" data-path="${escapeAttr(cat._path)}" data-slug="${escapeAttr(p.slug)}" class="btn btn-ghost">Editar</button>
						<button data-act="remove-project" data-path="${escapeAttr(cat._path)}" data-slug="${escapeAttr(p.slug)}" class="btn btn-danger">Remover</button>
					</div>
				`;
				list.appendChild(row);
			}
			box.appendChild(el);
		}
		bindDashboard(box);
	}

	function bindDashboard(root) {
		root.querySelectorAll("[data-act='edit']").forEach(btn => btn.addEventListener("click", () => {
			const path = btn.dataset.catPath;
			const cat = state.categories.find(c => c._path === path);
			if (cat) openCategoryModal(cat, false);
		}));
		root.querySelectorAll("[data-act='add']").forEach(btn => btn.addEventListener("click", () => {
			const path = btn.dataset.catPath;
			const cat = state.categories.find(c => c._path === path);
			if (!cat) return;
			const proj = {
				slug: `novo-projeto-${Date.now()}`,
				title: "Novo projeto",
				client: "",
				date: String(new Date().getFullYear()),
				location: "",
				type: "",
				note: "",
				description: "",
				cover: "",
				coverAlt: "",
				gallery: []
			};
			cat.projects = cat.projects || [];
			cat.projects.push(proj);
			openProjectModal(cat, proj, true);
		}));
		root.querySelectorAll("[data-act='edit-project']").forEach(btn => btn.addEventListener("click", () => {
			const cat = state.categories.find(c => c._path === btn.dataset.path);
			const proj = (cat?.projects || []).find(p => p.slug === btn.dataset.slug);
			if (cat && proj) openProjectModal(cat, proj, false);
		}));
		root.querySelectorAll("[data-act='remove-project']").forEach(btn => btn.addEventListener("click", async () => {
			const cat = state.categories.find(c => c._path === btn.dataset.path);
			const proj = (cat?.projects || []).find(p => p.slug === btn.dataset.slug);
			if (!cat || !proj) return;
			if (!confirm(`Remover "${proj.title || proj.slug}"?`)) return;
			cat.projects = (cat.projects || []).filter(p => p.slug !== proj.slug);
			setStatus("salvando...");
			try {
				await saveCategory(cat);
				setStatus("salvo");
				await renderDashboard();
			} catch (e) {
				alert("Erro ao remover: " + e.message);
			}
		}));
	}

	window.addEventListener("DOMContentLoaded", async () => {
		await loadConfig();
		loadPat();

		$("#btn-logout").addEventListener("click", () => {
			state.pat = null;
			try { localStorage.removeItem("vitormateus.pat"); } catch {}
			location.reload();
		});

		$("#form-login").addEventListener("submit", async (e) => {
			e.preventDefault();
			const pat = String($("#pat").value || "").trim();
			if (!pat) return;
			state.pat = pat;
			try { localStorage.setItem("vitormateus.pat", pat); } catch {}
			setStatus("validando...");
			try {
				const r = await gh("/user");
				const u = await r.json();
				$("#user-login").textContent = `@${u.login}`;
				hide($("#login"));
				show($("#dashboard"));
				setStatus("");
				await renderDashboard();
			} catch (err) {
				state.pat = null;
				try { localStorage.removeItem("vitormateus.pat"); } catch {}
				alert(err.message || "Login inválido");
				setStatus("");
			}
		});
	});
})();
