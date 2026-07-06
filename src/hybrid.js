import "./hybrid.css";
import { projects, projectById } from "./data/projects.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function initHybridArchiveAccess() {
  const shell = $("[data-archive-shell]");
  const openSelectedButton = $("[data-open-selected]");
  const selectedIndex = $("[data-archive-selected-index]");
  const selectedTitle = $("[data-archive-selected-title]");
  const selectedKind = $("[data-archive-selected-kind]");
  const stateLabel = $("[data-archive-state-label]");
  if (!shell || !openSelectedButton) return;

  let selectedId = projects[0]?.id;

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

initHybridArchiveAccess();
