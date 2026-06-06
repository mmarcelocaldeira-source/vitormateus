(() => {
	"use strict";

	const CONFIG_PATH = "./config.json";
	const API_BASE = "https://api.github.com";
	let state = {
		pat: null,
		owner: null,
		repo: null,
		files: [],
		data: {}
	};

	const $ = (sel, el = document) => el.querySelector(sel);
	const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

	async function loadConfig() {
		const res = await fetch(CONFIG_PATH);
		if (!res.ok) throw new Error("config.json não encontrado");
		const cfg = await res.json();
		state.owner = cfg.github.owner;
		state.repo = cfg.github.repo;
	}

	async function api(path, opts = {}) {
		const headers = {
			Accept: "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28"
		};
		if (state.pat) headers.Authorization = `Bearer ${state.pat}`;
		const repoPath = path.startsWith("/user") ? path : `/repos/${state.owner}/${state.repo}${path}`;
		const res = await fetch(`${API_BASE}${repoPath}`, {
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
		const r = await api(`/contents/${path}?ref=${encodeURIComponent(branch)}`);
		const j = await r.json();
		return j;
	}

	async function putFile(path, contentB64, message, branch = "main") {
		// contentB64 must be base64-encoded string (not JSON, but the raw b64)
		const res = await api(`/contents/${encodeURIComponent(path)}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message,
				content: contentB64,
				branch
			})
		});
		return res;
	}

	function decodeContentB64(b64) {
		return decodeURIComponent(escape(atob(b64)));
	}

	function encodeContentB64(text) {
		return btoa(unescape(encodeURIComponent(text)));
	}

	async function fetchCategories() {
		const files = await getFile("data/categories");
		const categories = [];
		for (const f of files) {
			if (f.type !== "file" || !f.name.endsWith(".json")) continue;
			const sha = f.sha;
			const raw = await api(`/contents/${f.path}?ref=main`).then(r => r.json());
			const text = decodeContentB64(raw.content);
			let data;
			try { data = JSON.parse(text); } catch { data = { label: f.name }; }
			data._rawSha = sha;
			data._rawText = text;
			data._path = f.path;
			categories.push(data);
		}
		return categories;
	}

	async function saveCategory(data) {
		const text = JSON.stringify(data, null, 2);
		const b64 = encodeContentB64(text);
		await putFile(data._path, b64, `update ${data._path} via admin`);
	}

	async function uploadImage(file, pathHint) {
		const ext = file.name.split(".").pop() || "bin";
		const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
		const dir = pathHint || "assets/uploads";
		const path = `${dir}/${Date.now()}-${safeName}`;
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

	function showStatus(msg) {
		const el = $("#status");
		if (!el) return;
		el.textContent = msg || "";
	}

	function hide(el) { if (el) el.classList.add("hidden"); }
	function show(el) { if (el) el.classList.remove("hidden"); }

	function renderLogin() {
		hide($("#dashboard"));
		show($("#login"));
		$("#user-login").textContent = state.pat ? "autenticado" : "";
	}

	function saveState() {
		try { localStorage.setItem("vitormateus.pat", state.pat || ""); } catch {}
	}
	function loadState() {
		try { state.pat = localStorage.getItem("vitormateus.pat") || null; } catch {}
	}

	window.addEventListener("DOMContentLoaded", async () => {
		await loadConfig();
		loadState();
		renderLogin();

		$("#btn-logout").addEventListener("click", () => {
			state.pat = null;
			saveState();
			renderLogin();
		});

		$("#form-login").addEventListener("submit", async (e) => {
			e.preventDefault();
			const pat = $("#pat").value.trim();
			if (!pat) return;
			state.pat = pat;
			saveState();
			$("#status").textContent = "validando...";
			try {
				const r = await api("/user");
				const u = await r.json();
				$("#user-login").textContent = `@${u.login}`;
				show($("#dashboard"));
				hide($("#login"));
				$("#status").textContent = "";
				await renderCategories();
			} catch (err) {
				state.pat = null;
				saveState();
				alert(err.message || "Login inválido");
				$("#status").textContent = "";
			}
		});

		$("#btn-add-cat").addEventListener("click", () => {
			openCategoryModal({
				title: "",
				path: "",
				subtitle: "",
				intro: "",
				stats: [],
				projects: []
			}, true);
		});
	});

	async function renderCategories() {
		const box = $("#categories");
		box.innerHTML = "";
		let cats;
		try {
			cats = await fetchCategories();
		} catch (err) {
			box.innerHTML = `<div class="card"><p class="hint">Erro ao carregar: ${err.message}</p></div>`;
			return;
		}
		if (!cats.length) {
			box.innerHTML = `<div class="card"><p class="hint">Nenhuma categoria encontrada em data/categories.</p></div>`;
			return;
		}
		for (const cat of cats) {
			const el = document.createElement("article");
			el.className = "cat";
			el.innerHTML = `
				<div class="cat__head">
					<div>
						<h3 class="cat__title">${escapeHtml(cat.label || cat.title || "(sem título)")}</h3>
						<p class="cat__sub">${escapeHtml(cat.path || "")}</p>
					</div>
					<div style="display:flex;gap:10px">
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
					<img class="project__thumb" src="${relativeToAdmin(p.cover)}" alt="${escapeAttr(p.title || "")}" />
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

		box.querySelectorAll("button[data-act='edit']").forEach(btn => btn.addEventListener("click", () => {
			const p = btn.dataset.catPath;
			const cat = cats.find(c => c._path === p);
			if (cat) openCategoryModal(cat, false);
		}));

		box.querySelectorAll("button[data-act='add']").forEach(btn => btn.addEventListener("click", () => {
			const p = btn.dataset.catPath;
			const cat = cats.find(c => c._path === p);
			if (cat) {
				const baseSlug = `novo-projeto-${Date.now()}`;
				const project = {
					slug: baseSlug,
					title: "Novo projeto",
					client: "",
					date: new Date().getFullYear().toString(),
					location: "",
					type: "",
					note: "",
					description: "",
					cover: "",
					coverAlt: "",
					gallery: []
				};
				cat.projects = cat.projects || [];
				cat.projects.push(project);
				openProjectModal(cat, project, true);
			}
		}));

		box.querySelectorAll("button[data-act='edit-project']").forEach(btn => btn.addEventListener("click", async () => {
			const cat = cats.find(c => c._path === btn.dataset.path);
			const pj = (cat?.projects || []).find(p => p.slug === btn.dataset.slug);
			if (cat && pj) openProjectModal(cat, pj, false);
		}));

		box.querySelectorAll("button[data-act='remove-project']").forEach(btn => btn.addEventListener("click", async () => {
			const cat = cats.find(c => c._path === btn.dataset.path);
			const pj = (cat?.projects || []).find(p => p.slug === btn.dataset.slug);
			if (!cat || !pj) return;
			if (!confirm(`Remover projeto "${pj.title || pj.slug}" de ${cat.label || cat.title || cat.path}?`)) return;
			cat.projects = (cat.projects || []).filter(p => p.slug !== pj.slug);
			showStatus("salvando...");
			await saveCategory(cat);
			showStatus("salvo");
			await renderCategories();
		}));
	}

	async function openCategoryModal(cat, isNew) {
		const title = isNew ? "Nova categoria" : "Editar categoria";
		const titleEl = $("#modal-title");
		titleEl.textContent = title;
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
					<label>Caminho (slug/URL)</label>
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
					<label>Stats (CSV: item1, item2)</label>
					<input data-field="stats" value="${escapeAttr((cat.stats || []).join(", "))}" />
				</div>
			</div>
		`;
		$("#modal-cancel").onclick = closeModal;
		$("#modal-close").onclick = closeModal;
		$("#modal-backdrop")?.remove();
		const backdrop = document.createElement("div");
		backdrop.className = "modal__backdrop";
		backdrop.id = "modal-backdrop";
		backdrop.onclick = closeModal;
		const modal = $("#modal");
		modal.insertBefore(backdrop, modal.firstChild);
		show(modal);

		return new Promise((resolve) => {
			const resolveAndClose = async () => {
				const payload = toPayload($("#modal-body"));
				Object.assign(cat, payload);
				if (!cat.stats) cat.stats = [];
				showStatus("salvando...");
				if (isNew) {
					cat._path = `data/categories/${(cat.path || cat.label || "categoria").toLowerCase().replace(/[^a-z0-9-]+/g,"-")}.json`;
					cat.projects = cat.projects || [];
				}
				try {
					await saveCategory(cat);
					showStatus("salvo");
					await renderCategories();
				} catch (e) {
					alert("Erro ao salvar: " + e.message);
				}
				closeModal();
				resolve();
			};
			$("#modal-save").onclick = resolveAndClose;
		});
	}

	async function openProjectModal(cat, project, isNew) {
		const title = isNew ? "Novo projeto" : "Editar projeto";
		$("#modal-title").textContent = title;
		const gallery = (project.gallery || []).map(p => ({ path: p, url: relativeToAdmin(p) }));
		const coverUrl = relativeToAdmin(project.cover || "");

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
					${coverUrl ? `<img src="${escapeAttr(coverUrl)}" alt="" style="max-width:160px;border-radius:10px;margin-top:8px" />` : ""}
				</div>
				<div class="field">
					<label>Upload de capa</label>
					<label class="drop">
						<input type="file" accept="image/*" />
						Arraste uma imagem ou clique para selecionar
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

		// Wire uploads
		const dropCover = $(".drop", $("#modal-body"));
		const coverInput = $("input[type='file']", dropCover);
		const dropGallery = $$(".drop", $("#modal-body"))[1];
		const galleryInput = $("input[type='file']", dropGallery);

		const updateGallery = (imgs) => {
			project.gallery = imgs;
			renderGallery();
		};
		const renderGallery = () => {
			const grid = $("#gallery-grid");
			if (!grid) return;
			grid.innerHTML = "";
			(project.gallery || []).forEach((src, idx) => {
				const item = document.createElement("div");
				item.className = "gallery__item";
				item.innerHTML = `<img src="${relativeToAdmin(src)}" alt="" /><button data-idx="${idx}">×</button>`;
				item.querySelector("button").addEventListener("click", () => {
					const arr = [...project.gallery];
					arr.splice(idx, 1);
					updateGallery(arr);
				});
				grid.appendChild(item);
			});
		};
		renderGallery();

		$("#modal-cancel").onclick = closeModal;
		$("#modal-close").onclick = closeModal;
		const backdrop = document.createElement("div");
		backdrop.className = "modal__backdrop";
		backdrop.id = "modal-backdrop";
		backdrop.onclick = closeModal;
		const modal = $("#modal");
		modal.insertBefore(backdrop, modal.firstChild);
		show(modal);

		return new Promise((resolve) => {
			const resolveAndClose = async () => {
				const payload = toPayload($("#modal-body"));
				Object.assign(project, payload);
				project.gallery = project.gallery || [];
				if (!project.slug) project.slug = `projeto-${Date.now()}`;
				showStatus("salvando...");
				try {
					if (!coverInput?.files?.length && !dropGallery?.querySelector("input")?.files?.length) {
						await saveCategory(cat);
					}
					// Handle uploads after a tick so values render
					if (coverInput?.files?.length) {
						const path = await uploadImage(coverInput.files[0], "assets/uploads");
						project.cover = path;
						await saveCategory(cat);
					}
					if (dropGallery?.querySelector("input")?.files?.length) {
						const files = dropGallery.querySelector("input").files;
						for (const f of files) {
							const path = await uploadImage(f, "assets/uploads");
							project.gallery = project.gallery || [];
							project.gallery.push(path);
						}
						await saveCategory(cat);
					}
					showStatus("salvo");
					await renderCategories();
					closeModal();
					resolve();
				} catch (e) {
					alert("Erro ao salvar: " + e.message);
				}
			};
			$("#modal-save").onclick = resolveAndClose;
		});
	}

	function closeModal() {
		const modal = $("#modal");
		if (!modal) return;
		const backdrop = $("#modal-backdrop");
		if (backdrop) backdrop.remove();
		hide(modal);
	}

	function toPayload(root) {
		const out = {};
		$$("[data-field]", root).forEach(el => {
			const key = el.dataset.field;
			const raw = el.value ?? "";
			let parsed = raw;
			if (key === "stats") {
				parsed = raw.split(",").map(s => s.trim()).filter(Boolean);
			}
			out[key] = parsed;
		});
		return out;
	}
})();
