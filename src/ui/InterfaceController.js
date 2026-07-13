const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

export class InterfaceController {
  constructor(projects, callbacks = {}) {
    this.projects = projects;
    this.callbacks = callbacks;
    this.app = $("[data-app]");
    this.canvas = $("[data-world-canvas]");
    this.projectInterface = $("[data-project-interface]");
    this.galleryDialog = $("[data-gallery-dialog]");
    this.notesDialog = $("[data-notes-dialog]");
    this.profileDialog = $("[data-profile-dialog]");
    this.contactDialog = $("[data-contact-dialog]");
    this.helpPanel = $("[data-help-panel]");
    this.galleryIndex = 0;
    this.activeIndex = -1;
    this.hintTimer = null;
    this.renderAccessibleProjects();
    this.bind();
  }

  setState(state) {
    this.app.dataset.state = state;
    if (state === "project") {
      this.projectInterface.setAttribute("aria-hidden", "false");
      this.projectInterface.inert = false;
    } else {
      this.projectInterface.setAttribute("aria-hidden", "true");
      this.projectInterface.inert = true;
    }
  }

  setWorldState(label) {
    $("[data-world-state]").textContent = label;
  }

  setLoading(value) {
    const normalized = Math.max(0, Math.min(1, value));
    $("[data-loading-bar]").style.transform = `scaleX(${normalized})`;
    $("[data-loading-value]").textContent = `${Math.round(normalized * 100)}%`;
  }

  ready() {
    document.body.classList.add("room-ready");
  }

  setIntroProximity(active) {
    this.app.classList.toggle("terminal-near", active);
    const prompt = $("[data-terminal-prompt]");
    if (prompt) prompt.setAttribute("aria-hidden", String(!active));
  }

  fail() {
    document.body.classList.add("room-failed");
    this.setState("fallback");
    this.setWorldState("MODO SIMPLIFICADO");
  }

  showHubHint() {
    const hint = $("[data-hub-hint]");
    clearTimeout(this.hintTimer);
    hint.classList.add("is-visible");
    this.hintTimer = setTimeout(() => hint.classList.remove("is-visible"), 4300);
  }

  hideHubHint() {
    clearTimeout(this.hintTimer);
    $("[data-hub-hint]").classList.remove("is-visible");
  }

  renderAccessibleProjects() {
    $("[data-accessible-projects]").innerHTML = this.projects.map((project, index) => `
      <button type="button" data-accessible-project="${index}">${escapeHtml(project.number)} · ${escapeHtml(project.title)}</button>
    `).join("");
  }

  renderProject(index) {
    const project = this.projects[index];
    if (!project) return;
    this.activeIndex = index;
    this.app.dataset.active = project.id;
    this.app.style.setProperty("--active", project.color);
    $("[data-project-number]").textContent = project.number;
    $("[data-project-context]").textContent = project.context;
    $("[data-project-title]").textContent = project.title;
    $("[data-project-summary]").textContent = project.summary;
    $("[data-project-current]").textContent = project.current;
    $("[data-project-facts]").innerHTML = project.facts.map(([label, value]) => `
      <div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>
    `).join("");
    $("[data-project-links]").innerHTML = project.links.map((link) => `
      <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.label)} ↗</a>
    `).join("");
    this.projectInterface.setAttribute("aria-hidden", "false");
    this.projectInterface.inert = false;
  }

  clearProject() {
    this.activeIndex = -1;
    this.app.dataset.active = "none";
    this.app.style.setProperty("--active", "#b8392c");
    this.projectInterface.setAttribute("aria-hidden", "true");
    this.projectInterface.inert = true;
  }

  renderGallery() {
    const project = this.projects[this.activeIndex];
    if (!project) return;
    const current = project.gallery[this.galleryIndex];
    $("[data-gallery-project]").textContent = `${project.number} / ${project.roomLabel}`;
    $("[data-gallery-title]").textContent = project.title;
    $("[data-gallery-image]").src = current.src;
    $("[data-gallery-image]").alt = current.caption;
    $("[data-gallery-index]").textContent = `${String(this.galleryIndex + 1).padStart(2, "0")} / ${String(project.gallery.length).padStart(2, "0")}`;
    $("[data-gallery-caption]").textContent = current.caption;
    $("[data-gallery-thumbs]").innerHTML = project.gallery.map((image, index) => `
      <button type="button" data-gallery-go="${index}" class="${index === this.galleryIndex ? "is-active" : ""}" aria-label="Mostrar tela ${index + 1}">
        <img src="${escapeHtml(image.src)}" alt="" />
      </button>
    `).join("");
  }

  openGallery(index = 0) {
    if (this.activeIndex < 0) return;
    this.galleryIndex = Math.max(0, Math.min(this.projects[this.activeIndex].gallery.length - 1, Number(index) || 0));
    this.renderGallery();
    this.galleryDialog.showModal();
  }

  moveGallery(direction) {
    const length = this.projects[this.activeIndex]?.gallery.length || 1;
    this.galleryIndex = (this.galleryIndex + direction + length) % length;
    this.renderGallery();
  }

  openNotes() {
    const project = this.projects[this.activeIndex];
    if (!project) return;
    $("[data-notes-number]").textContent = `${project.number} / ${project.roomLabel}`;
    $("[data-notes-title]").textContent = project.title;
    $("[data-notes-list]").innerHTML = project.notes.map(([title, body], index) => `
      <article><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></div></article>
    `).join("");
    this.notesDialog.showModal();
  }

  closeTopDialog() {
    const opened = $$('dialog[open]');
    if (!opened.length) return false;
    opened[opened.length - 1].close();
    return true;
  }

  toggleHelp(force) {
    const open = force ?? !this.helpPanel.classList.contains("is-open");
    this.helpPanel.classList.toggle("is-open", open);
    this.helpPanel.setAttribute("aria-hidden", String(!open));
  }

  bind() {
    $("[data-enter-world]").addEventListener("click", () => this.callbacks.onEnter?.());
    $("[data-skip-intro]")?.addEventListener("click", () => this.callbacks.onSkipIntro?.());
    $("[data-enter-world]").addEventListener("pointerenter", () => this.callbacks.onStartHover?.(true));
    $("[data-enter-world]").addEventListener("pointerleave", () => this.callbacks.onStartHover?.(false));
    $("[data-return-hub]").addEventListener("click", () => this.callbacks.onReturn?.());
    $("[data-exit-experience]")?.addEventListener("click", () => this.callbacks.onExitExperience?.());
    $("[data-open-gallery]").addEventListener("click", () => this.openGallery(0));
    $("[data-open-notes]").addEventListener("click", () => this.openNotes());
    $("[data-open-profile]").addEventListener("click", () => this.profileDialog.showModal());
    $("[data-open-contact]").addEventListener("click", () => this.contactDialog.showModal());
    $("[data-help-trigger]").addEventListener("click", () => this.toggleHelp());
    $("[data-close-help]").addEventListener("click", () => this.toggleHelp(false));
    $("[data-gallery-prev]").addEventListener("click", () => this.moveGallery(-1));
    $("[data-gallery-next]").addEventListener("click", () => this.moveGallery(1));

    $("[data-accessible-projects]").addEventListener("click", (event) => {
      const button = event.target.closest("[data-accessible-project]");
      if (button) this.callbacks.onSelect?.(Number(button.dataset.accessibleProject));
    });
    $("[data-gallery-thumbs]").addEventListener("click", (event) => {
      const button = event.target.closest("[data-gallery-go]");
      if (!button) return;
      this.galleryIndex = Number(button.dataset.galleryGo);
      this.renderGallery();
    });

    $$('[data-close-dialog]').forEach((button) => button.addEventListener("click", () => button.closest("dialog")?.close()));
    $$('dialog').forEach((dialog) => dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    }));

    addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (this.closeTopDialog()) {
        event.preventDefault();
        return;
      }
      if (this.helpPanel.classList.contains("is-open")) {
        this.toggleHelp(false);
        return;
      }
      this.callbacks.onEscape?.();
    });

    addEventListener("pointermove", (event) => this.callbacks.onPointerMove?.(event.clientX, event.clientY), { passive: true });
    this.canvas.addEventListener("click", (event) => this.callbacks.onCanvasClick?.(event.clientX, event.clientY));

    $$('[data-intro-move]').forEach((button) => {
      const directions = {
        up: [0, -1],
        left: [-1, 0],
        down: [0, 1],
        right: [1, 0]
      };
      const direction = directions[button.dataset.introMove];
      const start = (event) => {
        event.preventDefault();
        button.setPointerCapture?.(event.pointerId);
        this.callbacks.onIntroMove?.(...direction);
      };
      const stop = (event) => {
        event.preventDefault();
        this.callbacks.onIntroMove?.(0, 0);
      };
      button.addEventListener("pointerdown", start);
      button.addEventListener("pointerup", stop);
      button.addEventListener("pointercancel", stop);
      button.addEventListener("lostpointercapture", stop);
    });
  }
}
