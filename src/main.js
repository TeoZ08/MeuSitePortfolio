import { projects } from "./data/portfolio.js";
import { InterfaceController } from "./ui/InterfaceController.js";
import { IntroWorld } from "./world/IntroWorld.js";
import { PortfolioWorld } from "./world/PortfolioWorld.js";

let world = null;
let introWorld = null;
let hubReadyPromise = null;
let state = "loading";
let navigationToken = 0;
let fallbackMode = false;
let introProgress = 0;
let hubProgress = 0;
const pendingIndex = projects.findIndex((project) => project.id === location.hash.slice(1));
const directToHub = location.hash === "#hub" || pendingIndex >= 0;

const ui = new InterfaceController(projects, {
  onEnter: () => enterExperience(false),
  onSkipIntro: () => enterExperience(true),
  onReturn: () => requestReturn(),
  onExitExperience: () => exitExperience(),
  onEscape: () => requestReturn(),
  onSelect: (index) => selectProject(index),
  onStartHover: (value) => world?.setStartHover(value),
  onPointerMove: (x, y) => {
    if (["hub", "project", "traveling", "returning"].includes(state)) world?.setPointer(x, y);
  },
  onCanvasClick: (x, y) => world?.pick(x, y),
  onIntroMove: (x, z) => {
    introWorld?.setTouchDirection(x, z);
    world?.setTouchDirection(x, z);
  }
});

function setState(next) {
  state = next;
  ui.setState(next);
}

function updateLoading() {
  ui.setLoading(introProgress * 0.58 + hubProgress * 0.42);
}

async function enterExperience(skip = false) {
  if (state !== "intro" || !world || !introWorld) return;
  const token = ++navigationToken;
  setState("entering");
  ui.setWorldState(skip ? "ABRINDO O HUB" : "ACESSANDO O TERMINAL");
  await introWorld.enter(skip);
  if (token !== navigationToken) return;
  const hubReady = await hubReadyPromise;
  if (!hubReady) {
    fallbackMode = true;
    introWorld.dispose();
    introWorld = null;
    ui.fail();
    setState("fallback");
    return;
  }
  world.activateHub();
  world.setActive(true);
  ui.app.classList.add("intro-exit");
  await new Promise((resolve) => setTimeout(resolve, skip ? 260 : 720));
  introWorld.dispose();
  introWorld = null;
  history.replaceState({ view: "hub" }, "", `${location.pathname}${location.search}#hub`);
  setState("hub");
  ui.setWorldState("HUB / EXPLORE");
  ui.showHubHint();

  if (pendingIndex >= 0) selectProject(pendingIndex);
}

async function selectProject(index, options = {}) {
  if (!projects[index]) return;
  if (fallbackMode) {
    if (state !== "fallback") return;
    const project = projects[index];
    ui.renderProject(index);
    setState("project");
    ui.setWorldState(`${project.number} / ${project.roomLabel}`);
    if (options.historyMode !== "none") {
      const method = options.historyMode === "replace" ? "replaceState" : "pushState";
      history[method]({ view: "project", project: project.id }, "", `#${project.id}`);
    }
    return;
  }
  if (state !== "hub" || !world) return;
  const token = ++navigationToken;
  const project = projects[index];
  ui.hideHubHint();
  ui.renderProject(index);
  setState("traveling");
  ui.setWorldState(`${project.number} / APROXIMANDO`);
  await world.focus(index);
  if (token !== navigationToken) return;
  setState("project");
  ui.setWorldState(`${project.number} / ${project.roomLabel}`);
  ui.projectInterface.focus({ preventScroll: true });

  if (options.historyMode === "none") return;
  const method = options.historyMode === "replace" ? "replaceState" : "pushState";
  history[method]({ view: "project", project: project.id }, "", `#${project.id}`);
}

async function returnToHub(options = {}) {
  if (fallbackMode) {
    if (state !== "project") return;
    ui.clearProject();
    setState("fallback");
    ui.setWorldState("MODO SIMPLIFICADO");
    if (options.historyMode !== "none") history.replaceState({ view: "fallback" }, "", `${location.pathname}${location.search}`);
    return;
  }
  if (!world || !["project", "traveling"].includes(state)) return;
  const token = ++navigationToken;
  setState("returning");
  ui.setWorldState("RETORNANDO AO HUB");
  await world.overview();
  if (token !== navigationToken) return;
  ui.clearProject();
  setState("hub");
  ui.setWorldState("HUB / EXPLORE");
  ui.showHubHint();
  if (options.historyMode !== "none") {
    history.replaceState({ view: "hub" }, "", `${location.pathname}${location.search}#hub`);
  }
}

function requestReturn() {
  if (state !== "project") return;
  if (history.state?.view === "project") history.back();
  else returnToHub();
}

function exitExperience() {
  if (state !== "hub") return;
  history.replaceState({ view: "intro" }, "", `${location.pathname}${location.search}`);
  location.reload();
}

addEventListener("popstate", () => {
  const id = location.hash.slice(1);
  const index = projects.findIndex((project) => project.id === id);
  if (index >= 0) {
    if (state === "hub") selectProject(index, { historyMode: "none" });
    return;
  }
  if (["project", "traveling"].includes(state)) returnToHub({ historyMode: "none" });
});

async function start() {
  try {
    introWorld = new IntroWorld(document.querySelector("[data-intro-canvas]"), {
      onProgress: (value) => {
        introProgress = value;
        updateLoading();
      },
      onProximity: (active) => ui.setIntroProximity(active),
      onActivate: () => enterExperience(false),
      onTransition: () => ui.setWorldState("TERMINAL / CONECTANDO")
    });

    world = new PortfolioWorld(ui.canvas, projects, {
      initialActive: false,
      onProgress: (value) => {
        hubProgress = value;
        updateLoading();
      },
      onSelect: (index) => selectProject(index),
      onOpenGallery: (index) => ui.openGallery(index),
      onHover: (index) => {
        if (state !== "hub") return;
        ui.setWorldState(index >= 0 ? `${projects[index].title} / CLIQUE PARA EXPLORAR` : "HUB / EXPLORE");
      },
      onReady: () => { hubProgress = 1; updateLoading(); }
    });
    hubReadyPromise = world.init().then(() => true).catch((error) => {
      console.error("O hub 3D não terminou de carregar.", error);
      return false;
    });
    await introWorld.init();
    ui.setLoading(1);
    ui.ready();
    setState("intro");
    ui.setWorldState("CAMINHO / ENCONTRE O TERMINAL");
    if (directToHub) requestAnimationFrame(() => enterExperience(true));
  } catch (error) {
    console.error("Não foi possível iniciar a experiência 3D.", error);
    fallbackMode = true;
    ui.fail();
    setState("fallback");
    if (pendingIndex >= 0) selectProject(pendingIndex, { historyMode: "none" });
  }
}

history.replaceState({ view: "intro" }, "", location.href);
start();
