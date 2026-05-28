const PROJECTS = {
  jarvis: {
    status: "Projeto em destaque / IA aplicada",
    title: "Jarvis Acadêmico",
    description:
      "Sistema acadêmico com IA desenvolvido para apoiar estudantes na organização, consulta e interação com recursos inteligentes de estudo.",
    problem:
      "Estudantes lidam com muitos materiais, tarefas e informações dispersas. O desafio foi criar uma experiência mais centralizada e útil para consulta e apoio acadêmico.",
    solution:
      "Construção de uma aplicação online com interface web, back-end em Python/FastAPI e deploy no Hugging Face, conectando recursos de IA a uma experiência prática de uso.",
    tags: ["IA", "React", "FastAPI", "Python", "Hugging Face", "APIs"],
    links: [
      { label: "Abrir sistema", url: "https://teoz08-jarvis-academico.hf.space" },
      { label: "Ver código", url: "https://github.com/TeoZ08/jarvis-academico.git" },
    ],
  },
  unapi: {
    status: "Projeto de impacto / Educação digital",
    title: "Portal UnAPI Oficinas",
    description:
      "Portal educacional criado para apoiar participantes das oficinas de informática da UNAPI UFMS com práticas, materiais e simuladores.",
    problem:
      "Participantes das oficinas precisavam de um ambiente simples para revisar conteúdos, treinar habilidades digitais e acessar materiais de apoio fora dos encontros.",
    solution:
      "Criação de um portal leve, direto e acessível, publicado no GitHub Pages, com foco em usabilidade e autonomia de aprendizagem.",
    tags: ["HTML", "CSS", "JavaScript", "GitHub Pages", "Educação", "Acessibilidade"],
    links: [{ label: "Acessar portal", url: "https://pet-sistemas.github.io/unapi-oficinas/" }],
  },
  guincho: {
    status: "Projeto comercial / Cliente real",
    title: "Guincho 10",
    description:
      "Site institucional para empresa real de guincho e transporte, com foco em presença digital, SEO, responsividade e conversão.",
    problem:
      "A empresa precisava de uma presença online clara, confiável e otimizada para transformar visitantes em contatos rápidos por WhatsApp ou ligação.",
    solution:
      "Desenvolvimento de site responsivo com estrutura objetiva, chamadas para ação, informações de serviço e deploy automatizado para operação real.",
    tags: ["HTML", "CSS", "JavaScript", "SEO", "Responsividade", "Vercel"],
    links: [
      { label: "Abrir site", url: "https://www.guincho10.com.br/" },
      { label: "Ver código", url: "https://github.com/TeoZ08/guincho-10.git" },
    ],
  },
  aquaia: {
    status: "Em desenvolvimento / Sustentabilidade",
    title: "AquaIA",
    description:
      "Projeto de sustentabilidade com interface web, IA e visualização de dados para apoiar análise sobre consumo de água.",
    problem:
      "O consumo de água é um tema de impacto ambiental e operacional. O desafio é transformar informação em conscientização e tomada de decisão simples.",
    solution:
      "Protótipo web publicado no Render, com foco em dados, interface e conscientização sobre consumo de água.",
    tags: ["IA", "Sustentabilidade", "Web App", "Render", "UX", "Protótipo"],
    links: [{ label: "Abrir protótipo", url: "https://aquaia-ufms.onrender.com/" }],
  },
};

const COMMANDS = [
  {
    id: "painel",
    title: "Ir para Painel",
    description: "Progresso acadêmico e matérias.",
    action: () => scrollToSection("painel"),
  },
  {
    id: "projetos",
    title: "Ver Projetos",
    description: "Jarvis, UnAPI, Guincho 10 e AquaIA.",
    action: () => scrollToSection("projetos"),
  },
  {
    id: "jarvis",
    title: "Abrir Jarvis Acadêmico",
    description: "Sistema online com IA aplicada.",
    action: () => window.open("https://teoz08-jarvis-academico.hf.space", "_blank", "noopener"),
  },
  {
    id: "aquaia",
    title: "Abrir AquaIA",
    description: "Projeto publicado no Render.",
    action: () => window.open("https://aquaia-ufms.onrender.com/", "_blank", "noopener"),
  },
  {
    id: "stack",
    title: "Ver Stack",
    description: "Tecnologias por área.",
    action: () => scrollToSection("stack"),
  },
  {
    id: "contato",
    title: "Ir para Contato",
    description: "E-mail, WhatsApp, GitHub e currículo.",
    action: () => scrollToSection("contato"),
  },
  {
    id: "email",
    title: "Copiar e-mail",
    description: "matteoscotti10@gmail.com",
    action: () => copyText("matteoscotti10@gmail.com"),
  },
  {
    id: "whatsapp",
    title: "Abrir WhatsApp",
    description: "Abrir conversa.",
    action: () => window.open("https://wa.me/5567993379089", "_blank", "noopener"),
  },
  {
    id: "github",
    title: "Abrir GitHub",
    description: "Repositórios e projetos públicos.",
    action: () => window.open("https://github.com/TeoZ08", "_blank", "noopener"),
  },
  {
    id: "cv",
    title: "Baixar currículo",
    description: "Arquivo PDF atualizado.",
    action: () => {
      const link = document.createElement("a");
      link.href = "assets/curriculo-matteo-2026.pdf";
      link.download = "curriculo-matteo-2026.pdf";
      link.click();
    },
  },
];

function scrollToSection(id) {
  const section = document.getElementById(id);
  if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showToast(message) {
  const toast = document.querySelector("[data-toast]");
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
  } catch (error) {
    showToast("Não foi possível copiar automaticamente.");
  }
}

function initReveal() {
  const reveals = document.querySelectorAll(".reveal");
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
  reveals.forEach((el) => observer.observe(el));
}

function initMobileNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");
  if (!toggle || !menu) return;

  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    menu.classList.toggle("is-open", !isOpen);
  });

  menu.querySelectorAll("a, button").forEach((item) => item.addEventListener("click", close));
}

function initProjectFilters() {
  const filterButtons = document.querySelectorAll("[data-filter]");
  const cards = document.querySelectorAll(".project-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((btn) => btn.classList.toggle("active", btn === button));

      cards.forEach((card) => {
        const categories = card.dataset.categories || "";
        const visible = filter === "all" || categories.includes(filter);
        card.classList.toggle("is-hidden", !visible);
      });
    });
  });
}

function initCommandPalette() {
  const overlay = document.querySelector("[data-command-overlay]");
  const input = document.querySelector("[data-command-input]");
  const list = document.querySelector("[data-command-list]");
  const openButtons = document.querySelectorAll("[data-open-command]");
  const closeButton = document.querySelector("[data-close-command]");

  if (!overlay || !input || !list) return;

  const runCommand = (command) => {
    closePalette();
    command.action();
  };

  const render = (query = "") => {
    const normalized = query.trim().toLowerCase();
    const results = COMMANDS.filter((command) => {
      return (
        command.id.includes(normalized) ||
        command.title.toLowerCase().includes(normalized) ||
        command.description.toLowerCase().includes(normalized)
      );
    });

    list.innerHTML = "";
    results.forEach((command) => {
      const button = document.createElement("button");
      button.type = "button";
      button.innerHTML = `<strong>${command.id}</strong><small>${command.title} — ${command.description}</small>`;
      button.addEventListener("click", () => runCommand(command));
      list.appendChild(button);
    });
  };

  const openPalette = () => {
    render();
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    window.setTimeout(() => input.focus(), 60);
  };

  function closePalette() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    input.value = "";
  }

  openButtons.forEach((button) => button.addEventListener("click", openPalette));
  closeButton?.addEventListener("click", closePalette);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closePalette();
  });

  input.addEventListener("input", () => render(input.value));
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const firstCommand = list.querySelector("button");
      firstCommand?.click();
    }
  });

  document.addEventListener("keydown", (event) => {
    const tag = document.activeElement?.tagName?.toLowerCase();
    const isTyping = tag === "input" || tag === "textarea";
    if (event.key === "/" && !isTyping) {
      event.preventDefault();
      openPalette();
    }
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      closePalette();
    }
  });
}

function initProjectModal() {
  const modal = document.querySelector("[data-project-modal]");
  if (!modal) return;

  const title = modal.querySelector("[data-modal-title]");
  const status = modal.querySelector("[data-modal-status]");
  const description = modal.querySelector("[data-modal-description]");
  const problem = modal.querySelector("[data-modal-problem]");
  const solution = modal.querySelector("[data-modal-solution]");
  const tags = modal.querySelector("[data-modal-tags]");
  const links = modal.querySelector("[data-modal-links]");
  const closeButton = modal.querySelector("[data-close-project]");

  const open = (key) => {
    const project = PROJECTS[key];
    if (!project) return;

    status.textContent = project.status;
    title.textContent = project.title;
    description.textContent = project.description;
    problem.textContent = project.problem;
    solution.textContent = project.solution;
    tags.innerHTML = project.tags.map((tag) => `<span>${tag}</span>`).join("");
    links.innerHTML = project.links
      .map((link) => `<a href="${link.url}" target="_blank" rel="noopener">${link.label}</a>`)
      .join("");

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    closeButton?.focus();
  };

  const close = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  };

  document.querySelectorAll("[data-open-project]").forEach((button) => {
    button.addEventListener("click", () => open(button.dataset.openProject));
  });

  closeButton?.addEventListener("click", close);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) close();
  });
}

function initCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", () => copyText(button.dataset.copy));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initReveal();
  initMobileNav();
  initProjectFilters();
  initCommandPalette();
  initProjectModal();
  initCopyButtons();
});
