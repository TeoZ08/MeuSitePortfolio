const PROJECTS = {
  jarvis: {
    status: "Projeto em destaque / IA aplicada",
    title: "Jarvis Acadêmico",
    description:
      "Sistema acadêmico com IA desenvolvido para apoiar estudantes na organização, consulta e interação com recursos inteligentes de estudo.",
    problem:
      "Estudantes lidam com muitos materiais, tarefas e informações dispersas. O desafio foi criar uma experiência mais centralizada para consulta e apoio acadêmico.",
    solution:
      "Aplicação online com interface web, back-end em Python/FastAPI e deploy no Hugging Face, conectando recursos de IA a uma experiência prática de uso.",
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
      "Participantes das oficinas precisavam de um ambiente simples para revisar conteúdos, treinar habilidades digitais e acessar materiais fora dos encontros.",
    solution:
      "Portal leve, direto e acessível, publicado no GitHub Pages, com foco em usabilidade e autonomia de aprendizagem.",
    tags: ["HTML", "CSS", "JavaScript", "GitHub Pages", "Educação", "Acessibilidade"],
    links: [{ label: "Acessar portal", url: "https://pet-sistemas.github.io/unapi-oficinas/" }],
  },
  guincho: {
    status: "Projeto comercial / Cliente real",
    title: "Guincho 10",
    description:
      "Site institucional para empresa real de guincho e transporte, com foco em presença digital, SEO, responsividade e conversão.",
    problem:
      "A empresa precisava de presença online clara e confiável para transformar visitantes em contatos rápidos por WhatsApp ou ligação.",
    solution:
      "Site responsivo com estrutura objetiva, chamadas para ação, informações de serviço e publicação para operação real.",
    tags: ["HTML", "CSS", "JavaScript", "SEO", "Responsividade", "Vercel"],
    links: [
      { label: "Abrir site", url: "https://www.guincho10.com.br/" },
      { label: "Ver código", url: "https://github.com/TeoZ08/guincho-10.git" },
    ],
  },
  aquaia: {
    status: "Protótipo / Sustentabilidade",
    title: "AquaIA",
    description:
      "Projeto voltado à sustentabilidade, usando tecnologia e IA para apoiar análise e conscientização sobre consumo de água.",
    problem:
      "O consumo de água é um tema de impacto ambiental e operacional. O desafio é transformar informação em conscientização e tomada de decisão simples.",
    solution:
      "Protótipo web publicado no Render, estruturado para evoluir com recursos de IA, visualização de dados e experiência orientada a usuários reais.",
    tags: ["IA", "Sustentabilidade", "Web App", "Render", "UX", "Protótipo"],
    links: [{ label: "Abrir protótipo", url: "https://aquaia-ufms.onrender.com/" }],
  },
  useart: {
    status: "MVP / E-commerce estático",
    title: "useART",
    description:
      "MVP de e-commerce para marca de camisetas, com catálogo, carrinho persistente, checkout interno e finalização via WhatsApp.",
    problem:
      "A loja precisava validar uma experiência própria de compra sem começar por uma plataforma completa ou backend administrativo.",
    solution:
      "Aplicação React/Vite estática com seleção de variações, carrinho local, checkout por etapas e documentação clara sobre as limitações do admin local.",
    tags: ["React", "Vite", "E-commerce", "WhatsApp", "MVP", "Cliente"],
    links: [{ label: "Ver código", url: "https://github.com/TeoZ08/useART.git" }],
  },
  resumidor: {
    status: "Ferramenta IA / Produtividade",
    title: "ResumidorVideos",
    description:
      "Ferramenta com CLI, API FastAPI e interface React para resumir vídeos do YouTube com Gemini e exportar Markdown.",
    problem:
      "Vídeos longos de estudo exigem tempo para assistir, revisar e transformar em anotações reutilizáveis.",
    solution:
      "Pipeline que obtém legendas, gera resumo com Gemini, salva histórico em SQLite e exporta Markdown em formato útil para contexto.",
    tags: ["IA", "Gemini", "FastAPI", "React", "SQLite", "Markdown"],
    links: [{ label: "Ver código", url: "https://github.com/TeoZ08/ResumidorVideos.git" }],
  },
};

const COMMANDS = [
  {
    id: "painel",
    title: "Ir para Painel",
    description: "Progresso acadêmico e matérias atuais.",
    action: () => scrollToSection("painel"),
  },
  {
    id: "projetos",
    title: "Ver Projetos",
    description: "Jarvis, UnAPI, Guincho 10, AquaIA, useART e ResumidorVideos.",
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
    description: "Protótipo publicado no Render.",
    action: () => window.open("https://aquaia-ufms.onrender.com/", "_blank", "noopener"),
  },
  {
    id: "useart",
    title: "Ver useART",
    description: "MVP de e-commerce estático.",
    action: () => window.open("https://github.com/TeoZ08/useART.git", "_blank", "noopener"),
  },
  {
    id: "resumidor",
    title: "Ver ResumidorVideos",
    description: "Ferramenta IA com FastAPI e React.",
    action: () => window.open("https://github.com/TeoZ08/ResumidorVideos.git", "_blank", "noopener"),
  },
  {
    id: "stack",
    title: "Ver Stack",
    description: "Tecnologias organizadas por função.",
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
    description: "Contato direto.",
    action: () => window.open("https://wa.me/5567993379089", "_blank", "noopener"),
  },
  {
    id: "github",
    title: "Abrir GitHub",
    description: "Repositórios públicos.",
    action: () => window.open("https://github.com/TeoZ08", "_blank", "noopener"),
  },
  {
    id: "cv",
    title: "Baixar currículo",
    description: "Arquivo PDF.",
    action: () => downloadFile("assets/curriculo-matteo-2026.pdf", "curriculo-matteo-2026.pdf"),
  },
];

function scrollToSection(id) {
  const section = document.getElementById(id);
  if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function downloadFile(href, filename) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
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
    showToast("Copiado.");
  } catch (error) {
    showToast("Não foi possível copiar automaticamente.");
  }
}

function initReveal() {
  const reveals = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
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
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
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
        const visible = filter === "all" || categories.split(" ").includes(filter);
        card.classList.toggle("is-hidden", !visible);
      });
    });
  });
}

const SIGNATURE_FRAME_POINTS = [
  300, 101, 2, 322, 101, 3, 300, 121, 2, 233, 141, 3, 256, 141, 2, 300, 141, 1, 533, 182, 1, 256, 202, 1, 433, 202, 2, 456, 202, 2, 511, 202, 1, 856, 202, 2, 267, 222, 2, 367, 222, 2, 411, 222, 2,
  433, 222, 3, 456, 222, 3, 256, 242, 3, 278, 242, 1, 311, 242, 3, 333, 242, 3, 356, 242, 3, 378, 242, 1, 400, 242, 2, 422, 242, 3, 444, 242, 3, 467, 242, 3, 233, 263, 3, 256, 263, 4, 278, 263, 1,
  300, 263, 2, 322, 263, 3, 344, 263, 3, 367, 263, 3, 389, 263, 1, 889, 263, 1, 144, 283, 4, 189, 283, 1, 211, 283, 3, 233, 283, 3, 256, 283, 4, 278, 283, 1, 300, 283, 2, 322, 283, 3, 689, 283, 1,
  711, 283, 3, 733, 283, 3, 756, 283, 4, 844, 283, 4, 911, 283, 3, 144, 303, 3, 167, 303, 2, 211, 303, 3, 233, 303, 3, 256, 303, 3, 300, 303, 2, 456, 303, 3, 500, 303, 2, 522, 303, 3, 544, 303, 3,
  567, 303, 2, 711, 303, 3, 733, 303, 3, 756, 303, 3, 800, 303, 2, 833, 303, 3, 856, 303, 3, 133, 323, 3, 156, 323, 2, 200, 323, 1, 222, 323, 3, 244, 323, 3, 267, 323, 1, 411, 323, 2, 433, 323, 3,
  456, 323, 2, 500, 323, 1, 522, 323, 3, 544, 323, 3, 567, 323, 1, 656, 323, 2, 722, 323, 3, 744, 323, 3, 767, 323, 1, 822, 323, 3, 844, 323, 3, 911, 323, 2, 133, 343, 2, 244, 343, 1, 422, 343, 1,
  533, 343, 2, 633, 343, 2, 744, 343, 1, 856, 343, 1, 933, 343, 2, 133, 364, 1, 233, 364, 1, 344, 364, 1, 533, 364, 1, 622, 364, 1, 644, 364, 1, 933, 364, 1, 122, 384, 2, 244, 384, 2, 267, 384, 1,
  356, 384, 1, 511, 384, 1, 533, 384, 2, 622, 384, 2, 756, 384, 1, 811, 384, 1, 911, 384, 1, 933, 384, 2, 233, 404, 3, 256, 404, 3, 333, 404, 3, 356, 404, 3, 500, 404, 1, 600, 404, 1, 622, 404, 3,
  767, 404, 2, 811, 404, 2, 900, 404, 1, 922, 404, 3, 244, 424, 3, 267, 424, 2, 322, 424, 3, 344, 424, 3, 367, 424, 2, 467, 424, 2, 489, 424, 1, 578, 424, 1, 600, 424, 2, 756, 424, 3, 778, 424, 1,
  800, 424, 2, 822, 424, 3, 911, 424, 3, 78, 444, 1, 244, 444, 3, 267, 444, 3, 311, 444, 3, 333, 444, 3, 356, 444, 4, 378, 444, 1, 467, 444, 3, 567, 444, 3, 589, 444, 1, 611, 444, 3, 767, 444, 3,
  789, 444, 1, 811, 444, 3, 889, 444, 1, 911, 444, 3, 78, 465, 1, 244, 465, 4, 267, 465, 3, 311, 465, 3, 333, 465, 3, 356, 465, 4, 444, 465, 4, 467, 465, 3, 567, 465, 3, 589, 465, 1, 611, 465, 3,
  767, 465, 3, 789, 465, 1, 811, 465, 3, 900, 465, 2, 233, 485, 3, 256, 485, 3, 311, 485, 3, 333, 485, 3, 356, 485, 3, 422, 485, 3, 444, 485, 3, 567, 485, 2, 756, 485, 3, 800, 485, 2, 900, 485, 2,
  233, 505, 3, 256, 505, 2, 311, 505, 2, 333, 505, 3, 356, 505, 2, 411, 505, 2, 433, 505, 3, 567, 505, 1, 756, 505, 2, 800, 505, 1, 900, 505, 1, 233, 525, 2, 322, 525, 1, 344, 525, 1, 544, 525, 1,
  222, 545, 1, 244, 545, 1, 333, 545, 1, 533, 545, 1, 733, 545, 1, 844, 545, 1, 233, 566, 2, 256, 566, 1, 311, 566, 1, 333, 566, 2, 356, 566, 1, 522, 566, 2, 544, 566, 2, 567, 566, 1, 744, 566, 2,
  767, 566, 1, 844, 566, 2, 867, 566, 1, 222, 586, 3, 244, 586, 3, 267, 586, 2, 322, 586, 3, 344, 586, 3, 367, 586, 2, 511, 586, 2, 544, 586, 3, 567, 586, 2, 722, 586, 3, 744, 586, 3, 767, 586, 2,
  822, 586, 3, 844, 586, 3, 200, 606, 2, 222, 606, 3, 244, 606, 3, 267, 606, 2, 322, 606, 3, 344, 606, 3, 367, 606, 2, 389, 606, 1, 411, 606, 3, 500, 606, 2, 544, 606, 3, 567, 606, 2, 589, 606, 1,
  722, 606, 3, 744, 606, 3, 767, 606, 2, 800, 606, 2, 822, 606, 3, 844, 606, 3, 189, 626, 1, 211, 626, 3, 233, 626, 3, 256, 626, 4, 278, 626, 1, 344, 626, 3, 367, 626, 3, 389, 626, 1, 411, 626, 3,
  433, 626, 3, 456, 626, 4, 478, 626, 1, 500, 626, 2, 567, 626, 3, 589, 626, 1, 711, 626, 3, 733, 626, 3, 756, 626, 4, 789, 626, 1, 811, 626, 3, 833, 626, 3, 189, 646, 1, 211, 646, 3, 233, 646, 3,
  256, 646, 4, 278, 646, 1, 333, 646, 3, 356, 646, 4, 378, 646, 1, 400, 646, 2, 422, 646, 3, 444, 646, 4, 467, 646, 3, 489, 646, 1, 567, 646, 3, 589, 646, 1, 611, 646, 3, 711, 646, 3, 733, 646, 3,
  789, 646, 1, 811, 646, 3, 144, 667, 3, 167, 667, 2, 211, 667, 3, 233, 667, 3, 256, 667, 3, 300, 667, 2, 367, 667, 2, 411, 667, 3, 433, 667, 3, 456, 667, 3, 567, 667, 2, 611, 667, 3, 633, 667, 3,
  711, 667, 3, 767, 667, 2, 300, 687, 1, 322, 687, 3, 411, 687, 2, 433, 687, 3, 456, 687, 2, 600, 687, 1, 622, 687, 3, 644, 687, 3, 667, 687, 1, 711, 687, 2, 744, 687, 3, 767, 687, 1, 322, 707, 1,
  433, 707, 2, 456, 707, 1, 622, 707, 1, 644, 707, 1, 744, 707, 1, 222, 727, 1, 244, 727, 1, 433, 727, 1, 644, 727, 1, 211, 747, 1, 233, 747, 2, 256, 747, 1, 311, 747, 1, 367, 747, 1, 422, 747, 2,
  622, 747, 2, 644, 747, 2, 667, 747, 1, 211, 768, 2, 233, 768, 3, 256, 768, 3, 300, 768, 1, 322, 768, 3, 344, 768, 3, 400, 768, 1, 422, 768, 3, 444, 768, 3, 600, 768, 1, 622, 768, 3, 644, 768, 3,
  222, 788, 3, 244, 788, 3, 267, 788, 2, 289, 788, 1, 311, 788, 3, 333, 788, 3, 356, 788, 3, 378, 788, 1, 433, 788, 3, 456, 788, 3, 478, 788, 1, 500, 788, 2, 522, 788, 3, 578, 788, 1, 600, 788, 2,
  256, 808, 4, 278, 808, 1, 300, 808, 2, 322, 808, 3, 344, 808, 3, 367, 808, 3, 389, 808, 1, 456, 808, 4, 478, 808, 1, 500, 808, 2, 522, 808, 3, 556, 808, 4, 578, 808, 1, 600, 808, 2, 289, 828, 1,
  311, 828, 3, 333, 828, 3, 356, 828, 4, 378, 828, 1, 400, 828, 2, 422, 828, 3, 444, 828, 4, 467, 828, 3, 489, 828, 1, 511, 828, 3, 533, 828, 3, 556, 828, 4, 578, 828, 1, 311, 848, 3, 333, 848, 3,
  356, 848, 3, 400, 848, 2, 422, 848, 3, 444, 848, 3, 467, 848, 2, 511, 848, 3, 533, 848, 3, 556, 848, 3, 322, 869, 3, 344, 869, 3, 367, 869, 1, 411, 869, 2, 433, 869, 3, 456, 869, 2, 500, 869, 1,
  522, 869, 3, 356, 889, 1, 422, 889, 1, 444, 889, 1,
];

function initSignatureParticles() {
  const canvas = document.querySelector("[data-signature-particles]");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  const card = canvas.closest(".signature-card");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const state = {
    particles: [],
    frameId: null,
    startedAt: performance.now(),
    hovered: false,
    dpr: 1,
  };

  const random = (seed) => {
    const value = Math.sin(seed * 9301 + 49297) * 233280;
    return value - Math.floor(value);
  };

  const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const buildParticles = () => {
    const width = canvas.clientWidth || 480;
    const height = canvas.clientHeight || 520;
    const points = [];

    for (let index = 0; index < SIGNATURE_FRAME_POINTS.length; index += 3) {
      points.push({
        x: SIGNATURE_FRAME_POINTS[index] / 1000,
        y: SIGNATURE_FRAME_POINTS[index + 1] / 1000,
        alpha: SIGNATURE_FRAME_POINTS[index + 2] / 9,
      });
    }

    const maxParticles = width < 420 ? 320 : 420;
    const selectedPoints = points.length > maxParticles
      ? Array.from({ length: maxParticles }, (_, index) => points[Math.floor(index * points.length / maxParticles)])
      : points;
    const mapWidth = width * 1.48;
    const mapHeight = mapWidth * 0.55;
    const offsetX = (width - mapWidth) / 2;
    const offsetY = height * 0.08;

    return selectedPoints
      .map((point, index) => {
        const targetX = offsetX + point.x * mapWidth;
        const targetY = offsetY + point.y * mapHeight;
        const edge = random(index + 17) > 0.5;
        const startX = edge ? random(index + 101) * width : (random(index + 202) > 0.5 ? -24 : width + 24);
        const startY = edge ? (random(index + 303) > 0.5 ? -24 : height + 24) : random(index + 404) * height;

        return {
          targetX,
          targetY,
          startX,
          startY,
          alpha: 0.36 + point.alpha * 0.64,
          size: 9 + random(index + 505) * 5,
          phase: random(index + 606) * Math.PI * 2,
        };
      });
  };

  const resize = () => {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * state.dpr);
    canvas.height = Math.round(height * state.dpr);
    context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    state.particles = buildParticles();
    state.startedAt = performance.now();
    canvas.classList.toggle("is-ready", state.particles.length > 0);
  };

  const draw = (time) => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const intro = reducedMotion ? 1 : easeOutCubic(clamp((time - state.startedAt) / 1800, 0, 1));
    const hoverForce = state.hovered ? 1 : 0;

    context.clearRect(0, 0, width, height);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "rgba(23, 22, 21, 0.5)";

    state.particles.forEach((particle, index) => {
      const wave = Math.sin(time * 0.0012 + particle.phase);
      const breathe = (2.1 + hoverForce * 6.5) * wave;
      const originX = width * 0.52;
      const originY = height * 0.5;
      const vectorX = particle.targetX - originX;
      const vectorY = particle.targetY - originY;
      const distance = Math.max(1, Math.hypot(vectorX, vectorY));
      const push = hoverForce * 8 * Math.sin(time * 0.0016 + particle.phase);
      const targetX = particle.targetX + (vectorX / distance) * push;
      const targetY = particle.targetY + (vectorY / distance) * push;
      const x = particle.startX + (targetX - particle.startX) * intro + breathe;
      const y = particle.startY + (targetY - particle.startY) * intro + Math.cos(time * 0.001 + particle.phase) * 0.9;
      const alpha = particle.alpha * intro * (0.58 + hoverForce * 0.2);
      const size = particle.size * (0.92 + Math.sin(time * 0.001 + index) * 0.05);

      context.globalAlpha = alpha;
      context.font = `600 ${size.toFixed(1)}px "IBM Plex Mono", ui-monospace, monospace`;
      context.fillText("@", x, y);
    });

    context.globalAlpha = 1;
    if (!reducedMotion) state.frameId = window.requestAnimationFrame(draw);
  };

  const start = () => {
    resize();
    if (state.frameId) window.cancelAnimationFrame(state.frameId);
    state.frameId = window.requestAnimationFrame(draw);
  };

  card?.addEventListener("mouseenter", () => { state.hovered = true; });
  card?.addEventListener("mouseleave", () => { state.hovered = false; });

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(() => {
      resize();
    });
    observer.observe(canvas);
    window.addEventListener("pagehide", () => observer.disconnect(), { once: true });
  } else {
    window.addEventListener("resize", resize);
  }

  window.addEventListener("pagehide", () => {
    if (state.frameId) window.cancelAnimationFrame(state.frameId);
  }, { once: true });

  start();
}

function initCommandPalette() {
  const overlay = document.querySelector("[data-command-overlay]");
  const input = document.querySelector("[data-command-input]");
  const list = document.querySelector("[data-command-list]");
  const openButtons = document.querySelectorAll("[data-open-command]");
  const closeButton = document.querySelector("[data-close-command]");

  if (!overlay || !input || !list) return;

  const render = (query = "") => {
    const normalized = query.trim().toLowerCase();
    const results = COMMANDS.filter((command) => {
      const searchable = `${command.id} ${command.title} ${command.description}`.toLowerCase();
      return searchable.includes(normalized);
    });

    list.innerHTML = "";
    results.forEach((command) => {
      const button = document.createElement("button");
      button.type = "button";
      button.innerHTML = `<strong>${command.title}</strong><small>${command.description}</small>`;
      button.addEventListener("click", () => {
        closePalette();
        command.action();
      });
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
    if (event.key === "Enter") list.querySelector("button")?.click();
  });

  document.addEventListener("keydown", (event) => {
    const tag = document.activeElement?.tagName?.toLowerCase();
    const isTyping = tag === "input" || tag === "textarea";
    if (event.key === "/" && !isTyping) {
      event.preventDefault();
      openPalette();
    }
    if (event.key === "Escape" && overlay.classList.contains("is-open")) closePalette();
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
    document.body.classList.add("modal-open");
    closeButton?.focus();
  };

  const close = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
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
  initSignatureParticles();
  initCommandPalette();
  initProjectModal();
  initCopyButtons();
});
