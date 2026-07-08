import "./hybrid.css";
import { projects, projectById } from "./data/projects.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function refineCopyAndStructure() {
  const navMenu = $("[data-nav-menu]");
  if (navMenu && !navMenu.querySelector('a[href="#arquivo"]')) {
    const archiveLink = document.createElement("a");
    archiveLink.href = "#arquivo";
    archiveLink.textContent = "Arquivo";
    navMenu.prepend(archiveLink);
  }

  const brandLabel = $(".nav-brand span");
  if (brandLabel) brandLabel.textContent = "Matteo / arquivo";

  const eyebrow = $(".hero-copy .eyebrow");
  if (eyebrow) eyebrow.textContent = "Matteo Lima Scotti · arquivo de trabalho · 2026";

  const intro = $(".hero-intro");
  if (intro) {
    intro.textContent =
      "Estudo Ciência da Computação e construo software para entender problemas de verdade. Este arquivo reúne produtos, ferramentas e experimentos que ainda estão evoluindo.";
  }

  const primaryAction = $(".hero-actions .button-primary");
  if (primaryAction) {
    primaryAction.href = "#arquivo";
    primaryAction.innerHTML = 'Explorar arquivo <span>↳</span>';
  }

  const quietAction = $(".hero-actions .button-quiet");
  if (quietAction) {
    quietAction.href = "#projetos";
    quietAction.innerHTML = 'Ir direto aos projetos <span>↘</span>';
  }

  const shell = $("[data-archive-shell]");
  if (!shell) return;
  shell.id = "arquivo";

  const archiveKicker = $(".archive-topline p", shell);
  if (archiveKicker) archiveKicker.textContent = "ARQUIVO DE TRABALHO / 04 PASTAS";

  const archiveTitle = $("#archive-title", shell);
  if (archiveTitle) archiveTitle.textContent = "Escolha uma pasta.";

  const instruction = $(".archive-instruction", shell);
  if (instruction) instruction.innerHTML = "<span>Puxe uma pasta</span><span>ou escolha abaixo</span>";

  const projectHeading = $("#projetos .section-heading p");
  if (projectHeading) {
    projectHeading.textContent =
      "O arquivo 3D é o convite. Aqui, cada caso pode ser lido diretamente e sem depender da interação.";
  }

  const scrollCue = $(".scroll-cue span");
  if (scrollCue) scrollCue.textContent = "projetos fora da caixa";
}

function createArchiveAccess(shell) {
  if ($(".archive-access", shell)) return;
  const list = $("[data-archive-list]", shell);
  if (!list) return;

  const access = document.createElement("div");
  access.className = "archive-access";
  access.setAttribute("aria-live", "polite");
  access.innerHTML = `
    <div class="archive-selection">
      <span data-archive-selected-index>01 / 04</span>
      <strong data-archive-selected-title>useART</strong>
      <small data-archive-selected-kind>Produto digital</small>
    </div>
    <button type="button" data-open-selected>
      Abrir pasta <span aria-hidden="true">→</span>
    </button>
  `;
  list.before(access);
}

function initHybridArchiveAccess() {
  const shell = $("[data-archive-shell]");
  if (!shell) return;

  createArchiveAccess(shell);

  const openSelectedButton = $("[data-open-selected]");
  const selectedIndex = $("[data-archive-selected-index]");
  const selectedTitle = $("[data-archive-selected-title]");
  const selectedKind = $("[data-archive-selected-kind]");
  const stateLabel = $("[data-archive-state-label]");
  const canvas = $("[data-archive-scene]");
  if (!openSelectedButton) return;

  let selectedId = projects[0]?.id;
  let pointerStart = null;

  const updateSelection = (id) => {
    const project = projectById[id];
    if (!project) return;
    selectedId = id;
    selectedIndex.textContent = `${project.index} / ${String(projects.length).padStart(2, "0")}`;
    selectedTitle.textContent = project.shortTitle;
    selectedKind.textContent = project.kind;
    openSelectedButton.setAttribute("aria-label", `Abrir a pasta ${project.title}`);
  };

  const openDirect = (id) => {
    if (!projectById[id]) return;
    window.__projectArchive?.select?.(id);
    window.dispatchEvent(new CustomEvent("archive:directopen", { detail: { id } }));
  };

  $$("[data-archive-project]").forEach((button) => {
    const id = button.dataset.archiveProject;
    button.setAttribute("aria-label", `Abrir a pasta ${projectById[id]?.title || id}.`);
    button.addEventListener("pointerenter", () => updateSelection(id));
    button.addEventListener("focus", () => updateSelection(id));
  });

  shell.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest("[data-archive-project]");
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      updateSelection(button.dataset.archiveProject);
      openDirect(button.dataset.archiveProject);
    },
    true,
  );

  canvas?.addEventListener("pointerdown", (event) => {
    pointerStart = { x: event.clientX, y: event.clientY };
  });

  canvas?.addEventListener("pointerup", (event) => {
    if (!pointerStart) return;
    const distance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
    pointerStart = null;
    if (distance <= 8) openDirect(selectedId);
  });

  canvas?.addEventListener("pointercancel", () => {
    pointerStart = null;
  });

  openSelectedButton.addEventListener("click", () => openDirect(selectedId));

  window.addEventListener("archive:hover", (event) => updateSelection(event.detail.id));
  window.addEventListener("archive:dragstart", (event) => updateSelection(event.detail.id));
  window.addEventListener("archive:state", (event) => {
    const project = projectById[event.detail.id];
    const labels = {
      idle: "ESCOLHA ABAIXO OU PUXE",
      dragging: project ? `PUXANDO ${project.shortTitle}` : "PUXANDO PASTA",
      settling: "PASTA REPOSICIONADA",
      extracting: "ABRINDO ARQUIVO",
      extracted: "ARQUIVO EXTRAÍDO",
      open: "DOSSIÊ ABERTO",
      returning: "DEVOLVENDO PASTA",
    };
    stateLabel.textContent = labels[event.detail.state] || labels.idle;
  });

  updateSelection(selectedId);
  stateLabel.textContent = "ESCOLHA ABAIXO OU PUXE";
}

requestAnimationFrame(() => {
  refineCopyAndStructure();
  initHybridArchiveAccess();
});
