import "./styles.css";
import { projects, projectById } from "./data/projects.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderArchive() {
  const list = $("[data-archive-list]");
  const fallback = $("[data-archive-fallback]");
  if (list) {
    list.innerHTML = projects
      .map(
        (project, index) => `
          <button
            type="button"
            class="archive-project ${index === 0 ? "is-active" : ""}"
            data-archive-project="${escapeHtml(project.id)}"
            aria-label="Selecionar a pasta ${escapeHtml(project.title)}. Pressione Enter para abrir."
            style="--folder:${escapeHtml(project.folder)}"
          >
            <span>${escapeHtml(project.index)}</span>
            <strong>${escapeHtml(project.shortTitle)}</strong>
            <small>${escapeHtml(project.kind.split(" · ")[0])}</small>
          </button>
        `
      )
      .join("");
  }
  if (fallback) {
    fallback.innerHTML = [...projects]
      .reverse()
      .map(
        (project, index) =>
          `<i style="--folder:${escapeHtml(project.folder)};--i:${index}"><span>${escapeHtml(project.shortTitle)}</span></i>`
      )
      .join("");
  }
}

function renderProjects() {
  const list = $("[data-project-list]");
  if (!list) return;
  list.innerHTML = projects
    .map(
      (project, index) => `
        <article class="project-case reveal ${index % 2 ? "project-case-reverse" : ""}" id="projeto-${escapeHtml(project.id)}" style="--folder:${escapeHtml(project.folder)}">
          <button class="project-image" type="button" data-open-project="${escapeHtml(project.id)}" aria-label="Abrir o caso ${escapeHtml(project.title)}">
            <span class="project-image-meta"><b>${escapeHtml(project.index)}</b><small>captura real</small></span>
            <img src="${escapeHtml(project.images[0].src)}" alt="${escapeHtml(project.images[0].alt)}" loading="${index ? "lazy" : "eager"}" decoding="async" />
            ${project.images[1] ? `<img class="project-image-secondary" src="${escapeHtml(project.images[1].src)}" alt="" loading="lazy" decoding="async" />` : ""}
            <span class="project-image-action">abrir dossiê <i>↗</i></span>
          </button>
          <div class="project-copy">
            <div class="project-meta"><span>${escapeHtml(project.index)} / ${String(projects.length).padStart(2, "0")}</span><span>${escapeHtml(project.status)}</span></div>
            <p class="project-kind">${escapeHtml(project.kind)}</p>
            <h3>${escapeHtml(project.title)}</h3>
            <p class="project-summary">${escapeHtml(project.summary)}</p>
            <div class="project-now"><span>AGORA</span><p>${escapeHtml(project.current)}</p></div>
            <div class="project-actions">
              <button type="button" data-open-project="${escapeHtml(project.id)}">Ler o caso <span>→</span></button>
              ${project.links.slice(0, 1).map((link) => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.label)} <span>↗</span></a>`).join("")}
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function initNavigation() {
  const nav = $(".site-nav");
  const hero = $(".hero");
  const immersiveHeroQuery = window.matchMedia("(min-width: 1101px) and (min-aspect-ratio: 3 / 2)");
  const toggle = $("[data-nav-toggle]");
  const menu = $("[data-nav-menu]");
  if (!nav || !toggle || !menu) return;

  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
    menu.classList.remove("is-open");
  };

  toggle.addEventListener("click", () => {
    const next = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(next));
    toggle.setAttribute("aria-label", next ? "Fechar menu" : "Abrir menu");
    menu.classList.toggle("is-open", next);
  });
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });

  const update = () => {
    const wideHero = immersiveHeroQuery.matches && hero;
    const heroEnd = wideHero ? hero.offsetTop + hero.offsetHeight - 76 : 20;
    nav.classList.toggle("is-scrolled", window.scrollY > heroEnd);
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });

  const links = $$("a[href^='#']", menu);
  const sections = links.map((link) => $(link.getAttribute("href"))).filter(Boolean);
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((link) => link.classList.toggle("is-active", link.hash === `#${visible.target.id}`));
    },
    { rootMargin: "-25% 0px -65% 0px", threshold: [0, 0.2, 0.5] }
  );
  sections.forEach((section) => observer.observe(section));
}

function initReveal() {
  const elements = $$(".reveal");
  if (motionQuery.matches || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -5%" }
  );
  elements.forEach((element) => observer.observe(element));
}

function getFocusable(container) {
  return $$("a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])", container).filter(
    (element) => !element.hasAttribute("hidden") && !element.closest("[inert]")
  );
}

function trapFocus(container, event) {
  if (event.key !== "Tab") return;
  const focusable = getFocusable(container);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

function rectFrame(rect, rotation = 0) {
  return {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    transform: `rotate(${rotation}deg)`,
    borderRadius: "1px"
  };
}

function initProjectModal() {
  const overlay = $("[data-project-overlay]");
  const modal = $(".project-modal", overlay);
  const modalScroll = $("[data-project-modal-scroll]", overlay);
  const closeButton = $("[data-close-project]", overlay);
  const transition = $("[data-folder-transition]");
  const pageMain = $("main");
  const siteNav = $(".site-nav");
  if (!overlay || !modal || !modalScroll || !closeButton || !transition) return null;

  const fields = {
    index: $("[data-modal-index]", overlay),
    status: $("[data-modal-status]", overlay),
    kind: $("[data-modal-kind]", overlay),
    title: $("[data-modal-title]", overlay),
    summary: $("[data-modal-summary]", overlay),
    image: $("[data-modal-image]", overlay),
    started: $("[data-modal-started]", overlay),
    problem: $("[data-modal-problem]", overlay),
    decision: $("[data-modal-decision]", overlay),
    current: $("[data-modal-current]", overlay),
    limit: $("[data-modal-limit]", overlay),
    next: $("[data-modal-next]", overlay),
    tags: $("[data-modal-tags]", overlay),
    links: $("[data-modal-links]", overlay),
    transitionIndex: $("[data-transition-index]", transition),
    transitionTitle: $("[data-transition-title]", transition),
    transitionImage: $("[data-transition-image]", transition)
  };

  let previousFocus = null;
  let currentId = null;
  let archiveOrigin = false;
  let transitioning = false;
  let waitingForReturn = false;
  let closeRequested = false;
  let phase = "closed";
  let transitionAnimation = null;

  const populate = (project) => {
    fields.index.textContent = `${project.index} / ${String(projects.length).padStart(2, "0")}`;
    fields.status.textContent = project.status;
    fields.kind.textContent = project.kind;
    fields.title.textContent = project.title;
    fields.summary.textContent = project.summary;
    fields.image.src = project.images[0].src;
    fields.image.alt = project.images[0].alt;
    fields.started.textContent = project.started;
    fields.problem.textContent = project.problem;
    fields.decision.textContent = project.decision;
    fields.current.textContent = project.current;
    fields.limit.textContent = project.limit;
    fields.next.textContent = project.next;
    fields.tags.innerHTML = project.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    fields.links.innerHTML = project.links
      .map((link) => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.label)} <span>↗</span></a>`)
      .join("");
    fields.transitionIndex.textContent = project.index;
    fields.transitionTitle.textContent = project.shortTitle;
    fields.transitionImage.src = project.images[0].src;
    overlay.style.setProperty("--folder", project.folder);
    transition.style.setProperty("--folder", project.folder);
  };

  const setPageInert = (value) => {
    pageMain.inert = value;
    siteNav.inert = value;
  };

  const lockModalScroll = (value) => {
    modalScroll.classList.toggle("is-scroll-locked", value);
    if (value) modalScroll.setAttribute("aria-busy", "true");
    else modalScroll.removeAttribute("aria-busy");
  };

  const cleanupTransitionLayer = () => {
    transitionAnimation?.cancel();
    transitionAnimation = null;
    transition.getAnimations().forEach((animation) => animation.cancel());
    transition.classList.remove("is-visible");
    transition.style.removeProperty("left");
    transition.style.removeProperty("top");
    transition.style.removeProperty("width");
    transition.style.removeProperty("height");
    transition.style.removeProperty("transform");
    transition.style.removeProperty("opacity");
    transition.style.removeProperty("z-index");
    transition.style.removeProperty("will-change");
  };

  const showOverlay = (physical) => {
    modalScroll.scrollTop = 0;
    lockModalScroll(physical);
    overlay.inert = false;
    overlay.removeAttribute("inert");
    overlay.setAttribute("aria-hidden", "false");
    overlay.classList.add("is-open");
    overlay.classList.toggle("is-transitioning", physical);
    overlay.classList.toggle("is-ready", !physical);
    document.body.classList.add("modal-open");
    setPageInert(true);
  };

  const hideOverlay = ({ unlock = true, restore = true } = {}) => {
    cleanupTransitionLayer();
    lockModalScroll(false);
    overlay.classList.remove("is-open", "is-ready", "is-transitioning", "is-closing");
    overlay.setAttribute("aria-hidden", "true");
    overlay.inert = true;
    overlay.setAttribute("inert", "");
    if (unlock) {
      document.body.classList.remove("modal-open");
      setPageInert(false);
    }
    if (restore) previousFocus?.focus?.({ preventScroll: true });
  };

  const animateLayer = async (fromRect, toRect, direction, onStart) => {
    cleanupTransitionLayer();
    transition.classList.add("is-visible");
    transitionAnimation = transition.animate(
      [
        { ...rectFrame(fromRect, direction === "open" ? -1.4 : 0), opacity: 1 },
        { ...rectFrame(toRect, direction === "open" ? 0 : -1.2), opacity: 1 }
      ],
      {
        duration: motionQuery.matches ? 1 : direction === "open" ? 680 : 560,
        easing: direction === "open" ? "cubic-bezier(.22,1,.36,1)" : "cubic-bezier(.55,.06,.68,.19)",
        fill: "forwards"
      }
    );
    onStart?.();
    try {
      await transitionAnimation.finished;
    } catch {}
    cleanupTransitionLayer();
  };

  const open = async (id, trigger, { physical = false, fromRect = null } = {}) => {
    const project = projectById[id];
    if (!project || transitioning || overlay.classList.contains("is-open")) return;
    transitioning = physical;
    phase = physical ? "opening" : "open";
    closeRequested = false;
    currentId = id;
    archiveOrigin = physical;
    waitingForReturn = false;
    previousFocus = trigger || document.activeElement;
    populate(project);
    showOverlay(physical);

    if (physical && fromRect) {
      await nextFrame();
      const targetRect = fields.image.getBoundingClientRect();
      await animateLayer(fromRect, targetRect, "open", () => {
        window.__projectArchive?.setActiveFolderVisible?.(false);
      });
      overlay.classList.remove("is-transitioning");
      overlay.classList.add("is-ready");
      lockModalScroll(false);
      window.__projectArchive?.setCaseOpen?.();
    } else {
      lockModalScroll(false);
    }

    transitioning = false;
    phase = "open";
    window.setTimeout(() => closeButton.focus({ preventScroll: true }), physical ? 80 : 30);
    if (closeRequested) {
      closeRequested = false;
      close();
    }
  };

  const finishArchiveReturn = () => {
    if (!waitingForReturn) return;
    waitingForReturn = false;
    document.body.classList.remove("modal-open");
    setPageInert(false);
    previousFocus?.focus?.({ preventScroll: true });
    archiveOrigin = false;
    currentId = null;
    phase = "closed";
  };

  const getCloseOriginRect = () => {
    const imageRect = fields.image.getBoundingClientRect();
    const scrollRect = modalScroll.getBoundingClientRect();
    const imageIsVisible = imageRect.bottom > scrollRect.top + 20 && imageRect.top < scrollRect.bottom - 20;
    if (imageIsVisible) return imageRect;

    const modalRect = modal.getBoundingClientRect();
    const width = Math.min(modalRect.width * 0.64, 720);
    const height = width * 0.58;
    return {
      left: modalRect.left + (modalRect.width - width) / 2,
      top: Math.max(scrollRect.top + 18, scrollRect.top + (scrollRect.height - height) / 2),
      width,
      height
    };
  };

  const close = async () => {
    if (!overlay.classList.contains("is-open")) return;
    if (phase === "opening") {
      closeRequested = true;
      return;
    }
    if (transitioning || phase === "closing") return;
    if (!archiveOrigin || !window.__projectArchive) {
      phase = "closing";
      lockModalScroll(true);
      hideOverlay();
      currentId = null;
      archiveOrigin = false;
      phase = "closed";
      return;
    }

    transitioning = true;
    phase = "closing";
    lockModalScroll(true);
    closeButton.disabled = true;
    overlay.classList.add("is-transitioning", "is-closing");
    overlay.classList.remove("is-ready");
    const fromRect = getCloseOriginRect();
    const toRect = window.__projectArchive.getActiveScreenRect();
    await animateLayer(fromRect, toRect, "close");
    window.__projectArchive?.setActiveFolderVisible?.(true);
    waitingForReturn = true;
    hideOverlay({ unlock: false, restore: false });
    closeButton.disabled = false;
    transitioning = false;
    phase = "returning";
    if (!window.__projectArchive.returnFolder()) finishArchiveReturn();
  };

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open-project]");
    if (trigger) open(trigger.dataset.openProject, trigger);
  });
  window.addEventListener("archive:directopen", (event) => {
    const trigger = $(`[data-archive-project="${CSS.escape(event.detail.id)}"]`);
    open(event.detail.id, trigger);
  });
  window.addEventListener("archive:extracted", (event) => {
    const trigger = $(`[data-archive-project="${CSS.escape(event.detail.id)}"]`);
    open(event.detail.id, trigger, { physical: true, fromRect: event.detail.rect });
  });
  window.addEventListener("archive:returncomplete", finishArchiveReturn);
  closeButton.addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay && overlay.classList.contains("is-ready")) close();
  });
  document.addEventListener("keydown", (event) => {
    if (!overlay.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (!transitioning) trapFocus(overlay, event);
  });

  return { open, close };
}

function initArchiveControls() {
  const buttons = $$("[data-archive-project]");
  const shell = $("[data-archive-shell]");
  const progressBar = $("[data-archive-progress]");
  const progressCopy = $("[data-archive-drag-copy]");
  const stateLabel = $("[data-archive-state-label]");
  if (!buttons.length || !shell) return;

  const updateButtons = (id) => {
    buttons.forEach((button) => button.classList.toggle("is-active", button.dataset.archiveProject === id));
  };

  const select = (id) => {
    updateButtons(id);
    window.__projectArchive?.select?.(id);
  };

  const setState = (state, id) => {
    shell.dataset.interaction = state;
    const project = projectById[id];
    const labels = {
      idle: "PRONTO PARA PUXAR",
      dragging: project ? `PUXANDO ${project.shortTitle}` : "PUXANDO PASTA",
      settling: "RETORNANDO À CAIXA",
      extracting: "ABRINDO ARQUIVO",
      extracted: "ARQUIVO EXTRAÍDO",
      open: "CASE ABERTO",
      returning: "DEVOLVENDO PASTA"
    };
    stateLabel.textContent = labels[state] || labels.idle;
    if (state === "idle") {
      progressBar.style.transform = "scaleX(0)";
      progressCopy.textContent = "PUXE PARA ABRIR";
    }
  };

  buttons.forEach((button) => {
    button.addEventListener("pointerenter", () => select(button.dataset.archiveProject));
    button.addEventListener("focus", () => select(button.dataset.archiveProject));
    button.addEventListener("click", () => {
      const id = button.dataset.archiveProject;
      const canAnimate = window.__projectArchive && !motionQuery.matches && shell.dataset.archiveState === "ready";
      if (!canAnimate || !window.__projectArchive.extract(id)) {
        window.dispatchEvent(new CustomEvent("archive:directopen", { detail: { id } }));
      }
    });
  });

  window.addEventListener("archive:hover", (event) => updateButtons(event.detail.id));
  window.addEventListener("archive:dragstart", (event) => updateButtons(event.detail.id));
  window.addEventListener("archive:progress", (event) => {
    const value = Math.max(0, Math.min(1, event.detail.progress));
    progressBar.style.transform = `scaleX(${value})`;
    progressCopy.textContent = value >= event.detail.threshold ? "SOLTE PARA ABRIR" : "PUXE PARA ABRIR";
  });
  window.addEventListener("archive:state", (event) => setState(event.detail.state, event.detail.id));
  setState("idle", projects[0]?.id);
}

function initArchiveScene() {
  const shell = $("[data-archive-shell]");
  const canvas = $("[data-archive-scene]");
  const fallback = $("[data-archive-fallback]");
  if (!shell || !canvas) return;
  if (window.innerWidth < 720) {
    shell.dataset.archiveState = "html";
    canvas.setAttribute("hidden", "");
    fallback?.removeAttribute("hidden");
    return;
  }

  let loaded = false;
  const load = async () => {
    if (loaded) return;
    loaded = true;
    try {
      const { ProjectArchiveScene } = await import("./scene/ProjectArchiveScene.js");
      const scene = new ProjectArchiveScene(canvas, shell, projects);
      window.__projectArchive = scene;
      shell.dataset.archiveState = "ready";
      fallback?.setAttribute("hidden", "");
      const active = $("[data-archive-project].is-active")?.dataset.archiveProject;
      if (active) scene.select(active);
    } catch (error) {
      console.warn("Arquivo 3D indisponível; usando fallback em HTML.", error);
      shell.dataset.archiveState = "fallback";
      canvas.setAttribute("hidden", "");
      fallback?.removeAttribute("hidden");
    }
  };

  if (!("IntersectionObserver" in window)) {
    load();
    return;
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      load();
    },
    { rootMargin: "240px" }
  );
  observer.observe(shell);
}

function showToast(message) {
  const toast = $("[data-toast]");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const field = document.createElement("textarea");
    field.value = value;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  }
  showToast("E-mail copiado.");
}

function initCopyActions() {
  $$('[data-copy]').forEach((button) => button.addEventListener("click", () => copyText(button.dataset.copy)));
}

renderArchive();
renderProjects();
initNavigation();
initReveal();
initProjectModal();
initArchiveControls();
initArchiveScene();
initCopyActions();
$("[data-year]").textContent = String(new Date().getFullYear());
