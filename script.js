const CV_PATH = "assets/curriculo-matteo-2026.pdf";
const EMAIL = "matteoscotti10@gmail.com";
const WHATSAPP_URL = "https://wa.me/5567993379089";

const projects = [
  {
    id: "jarvis",
    index: "01",
    status: "Online",
    modalStatus: "Projeto em destaque / IA aplicada",
    title: "Jarvis Acadêmico",
    description:
      "Sistema acadêmico com IA para consulta e organização de materiais.",
    problem:
      "Estudantes lidam com muitos materiais, tarefas e informações dispersas. O desafio foi criar uma experiência mais centralizada para consulta e apoio acadêmico.",
    solution:
      "Aplicação online com interface web, back-end em Python/FastAPI e deploy no Hugging Face, conectando recursos de IA a uma experiência prática de uso.",
    categories: ["ia", "web", "api", "impacto"],
    tags: ["IA", "React", "FastAPI", "Python", "Hugging Face"],
    links: [
      { label: "Sistema", url: "https://teoz08-jarvis-academico.hf.space" },
      { label: "Código", url: "https://github.com/TeoZ08/jarvis-academico.git" },
    ],
    layout: "featured",
  },
  {
    id: "unapi",
    index: "02",
    status: "Extensão",
    modalStatus: "Projeto de impacto / Educação digital",
    title: "Portal UnAPI Oficinas",
    description:
      "Portal de apoio às oficinas de informática da UnAPI UFMS.",
    problem:
      "Participantes das oficinas precisavam de um ambiente simples para revisar conteúdos, treinar habilidades digitais e acessar materiais de apoio fora dos encontros.",
    solution:
      "Portal leve, direto e acessível, publicado no GitHub Pages, com foco em usabilidade e autonomia de aprendizagem.",
    categories: ["web", "impacto"],
    tags: ["HTML", "CSS", "JavaScript", "GitHub Pages", "Educação"],
    links: [{ label: "Acessar", url: "https://pet-sistemas.github.io/unapi-oficinas/" }],
    layout: "wide-pair",
  },
  {
    id: "guincho",
    index: "03",
    status: "Cliente real",
    modalStatus: "Projeto comercial / Cliente real",
    title: "Guincho 10",
    description:
      "Site institucional para cliente real, com foco em contato rápido e responsividade.",
    problem:
      "A empresa precisava de uma presença online clara, confiável e otimizada para transformar visitantes em contatos rápidos por WhatsApp ou ligação.",
    solution:
      "Site responsivo com estrutura objetiva, chamadas para ação, informações de serviço e deploy automatizado para operação real.",
    categories: ["web", "cliente"],
    tags: ["HTML", "CSS", "JavaScript", "SEO", "Vercel"],
    links: [
      { label: "Site", url: "https://www.guincho10.com.br/" },
      { label: "Código", url: "https://github.com/TeoZ08/guincho-10.git" },
    ],
  },
  {
    id: "aquaia",
    index: "04",
    status: "Protótipo",
    modalStatus: "Sustentabilidade / IA",
    title: "AquaIA",
    description:
      "Protótipo web sobre consumo de água e sustentabilidade.",
    problem:
      "O consumo de água é um tema de impacto ambiental e operacional. O desafio é transformar informação em conscientização e tomada de decisão simples.",
    solution:
      "Protótipo publicado no Render, com base para dados, interface web e recursos de IA.",
    categories: ["ia", "web", "impacto"],
    tags: ["IA", "Sustentabilidade", "Web App", "Render", "UX"],
    links: [{ label: "Protótipo", url: "https://aquaia-ufms.onrender.com/" }],
    progress: true,
  },
];

function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

function qsa(selector, scope = document) {
  return [...scope.querySelectorAll(selector)];
}

function openExternal(url) {
  window.open(url, "_blank", "noopener");
}

function downloadCV() {
  const link = document.createElement("a");
  link.href = CV_PATH;
  link.download = "curriculo-matteo-2026.pdf";
  link.click();
}

function scrollToSection(id) {
  qs(`#${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showToast(message) {
  const toast = qs("[data-toast]");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copiado para a área de transferência.");
  } catch {
    showToast("Não foi possível copiar automaticamente.");
  }
}

function makeElement(tag, options = {}) {
  const element = document.createElement(tag);
  if (options.className) element.className = options.className;
  if (options.text) element.textContent = options.text;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => element.setAttribute(key, value));
  }
  return element;
}

function renderProjects() {
  const grid = qs("[data-projects-grid]");
  if (!grid) return;

  const fragment = document.createDocumentFragment();

  projects.forEach((project) => {
    const article = makeElement("article", {
      className: ["project-card", project.layout, project.progress ? "progress-card" : ""]
        .filter(Boolean)
        .join(" "),
      attrs: {
        "data-project": project.id,
        "data-categories": project.categories.join(" "),
      },
    });

    const content = makeElement("div");
    const topline = makeElement("div", { className: "project-topline" });
    topline.append(
      makeElement("span", { className: "project-index", text: project.index }),
      makeElement("span", {
        className: `project-status${project.progress ? " status-progress" : ""}`,
        text: project.status,
      })
    );

    content.append(
      topline,
      makeElement("h3", { text: project.title }),
      makeElement("p", { text: project.description }),
      renderTags(project.tags)
    );

    const actions = makeElement("div", { className: "project-actions" });
    project.links.slice(0, 2).forEach((link) => {
      actions.append(
        makeElement("a", {
          text: link.label,
          attrs: { href: link.url, target: "_blank", rel: "noopener" },
        })
      );
    });

    const detailsButton = makeElement("button", { text: "Detalhes", attrs: { type: "button" } });
    detailsButton.addEventListener("click", () => openProjectModal(project.id));
    actions.append(detailsButton);

    article.append(content, actions);
    fragment.append(article);
  });

  grid.replaceChildren(fragment);
}

function renderTags(tags) {
  const list = makeElement("div", { className: "tag-list" });
  tags.forEach((tag) => list.append(makeElement("span", { text: tag })));
  return list;
}

function initReveal() {
  const reveals = qsa(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  reveals.forEach((element) => observer.observe(element));
}

function initMobileNav() {
  const toggle = qs("[data-nav-toggle]");
  const menu = qs("[data-nav-menu]");
  if (!toggle || !menu) return;

  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
  };

  toggle.addEventListener("click", () => {
    const willOpen = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(willOpen));
    menu.classList.toggle("is-open", willOpen);
  });

  qsa("a, button", menu).forEach((item) => item.addEventListener("click", close));
}

function initProjectFilters() {
  const buttons = qsa("[data-filter]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      buttons.forEach((item) => item.classList.toggle("active", item === button));

      qsa(".project-card").forEach((card) => {
        const categories = card.dataset.categories?.split(" ") || [];
        card.classList.toggle("is-hidden", filter !== "all" && !categories.includes(filter));
      });
    });
  });
}

const commands = [
  { id: "dados", title: "Dados", description: "Resumo acadêmico.", action: () => scrollToSection("sobre") },
  { id: "projetos", title: "Projetos", description: "Projetos publicados.", action: () => scrollToSection("projetos") },
  { id: "stack", title: "Stack", description: "Tecnologias usadas nos projetos.", action: () => scrollToSection("stack") },
  { id: "contato", title: "Contato", description: "E-mail, WhatsApp, GitHub e currículo.", action: () => scrollToSection("contato") },
  { id: "jarvis", title: "Jarvis Acadêmico", description: "Sistema online.", action: () => openExternal("https://teoz08-jarvis-academico.hf.space") },
  { id: "aquaia", title: "AquaIA", description: "Protótipo no Render.", action: () => openExternal("https://aquaia-ufms.onrender.com/") },
  { id: "unapi", title: "Portal UnAPI", description: "Oficinas de informática.", action: () => openExternal("https://pet-sistemas.github.io/unapi-oficinas/") },
  { id: "guincho", title: "Guincho 10", description: "Site institucional.", action: () => openExternal("https://www.guincho10.com.br/") },
  { id: "email", title: "Copiar e-mail", description: EMAIL, action: () => copyText(EMAIL) },
  { id: "whatsapp", title: "WhatsApp", description: "Abrir conversa.", action: () => openExternal(WHATSAPP_URL) },
  { id: "github", title: "GitHub", description: "Repositórios públicos.", action: () => openExternal("https://github.com/TeoZ08") },
  { id: "cv", title: "Currículo", description: "Baixar PDF.", action: downloadCV },
];

function initCommandPalette() {
  const overlay = qs("[data-command-overlay]");
  const input = qs("[data-command-input]");
  const list = qs("[data-command-list]");
  const closeButton = qs("[data-close-command]");
  if (!overlay || !input || !list) return;

  function render(query = "") {
    const normalized = query.trim().toLowerCase();
    const results = commands.filter((command) =>
      [command.id, command.title, command.description].some((field) =>
        field.toLowerCase().includes(normalized)
      )
    );

    list.replaceChildren(
      ...results.map((command) => {
        const button = makeElement("button", { attrs: { type: "button" } });
        button.append(
          makeElement("strong", { text: command.title }),
          makeElement("small", { text: command.description })
        );
        button.addEventListener("click", () => {
          closePalette();
          command.action();
        });
        return button;
      })
    );
  }

  function openPalette() {
    render();
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    window.setTimeout(() => input.focus(), 60);
  }

  function closePalette() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    input.value = "";
  }

  qsa("[data-open-command]").forEach((button) => button.addEventListener("click", openPalette));
  closeButton?.addEventListener("click", closePalette);
  overlay.addEventListener("click", (event) => event.target === overlay && closePalette());
  input.addEventListener("input", () => render(input.value));
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") qs("button", list)?.click();
  });

  document.addEventListener("keydown", (event) => {
    const tag = document.activeElement?.tagName?.toLowerCase();
    const isTyping = ["input", "textarea"].includes(tag);

    if (event.key === "/" && !isTyping) {
      event.preventDefault();
      openPalette();
    }

    if (event.key === "Escape" && overlay.classList.contains("is-open")) closePalette();
  });
}

function openProjectModal(projectId) {
  const modal = qs("[data-project-modal]");
  const project = projects.find((item) => item.id === projectId);
  if (!modal || !project) return;

  qs("[data-modal-status]", modal).textContent = project.modalStatus;
  qs("[data-modal-title]", modal).textContent = project.title;
  qs("[data-modal-description]", modal).textContent = project.description;
  qs("[data-modal-problem]", modal).textContent = project.problem;
  qs("[data-modal-solution]", modal).textContent = project.solution;
  qs("[data-modal-tags]", modal).replaceChildren(...project.tags.map((tag) => makeElement("span", { text: tag })));

  qs("[data-modal-links]", modal).replaceChildren(
    ...project.links.map((link) =>
      makeElement("a", {
        text: link.label,
        attrs: { href: link.url, target: "_blank", rel: "noopener" },
      })
    )
  );

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  qs("[data-close-project]", modal)?.focus();
}

function initProjectModal() {
  const modal = qs("[data-project-modal]");
  const closeButton = qs("[data-close-project]");
  if (!modal) return;

  const close = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  };

  closeButton?.addEventListener("click", close);
  modal.addEventListener("click", (event) => event.target === modal && close());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) close();
  });
}

function initCopyButtons() {
  qsa("[data-copy]").forEach((button) => {
    button.addEventListener("click", () => copyText(button.dataset.copy));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderProjects();
  initReveal();
  initMobileNav();
  initProjectFilters();
  initCommandPalette();
  initProjectModal();
  initCopyButtons();
});
