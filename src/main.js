import "./styles.css";
import { projects } from "./data/projects.js";

const projectList = document.querySelector("[data-project-list]");
const year = document.querySelector("[data-year]");
const copyButton = document.querySelector("[data-copy-email]");
const copyLabel = document.querySelector("[data-copy-label]");
const toast = document.querySelector("[data-toast]");

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const renderLinks = (links) =>
  links
    .map(
      ({ label, url }) => `
        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(label)} <span aria-hidden="true">↗</span>
        </a>
      `,
    )
    .join("");

const renderTags = (tags) =>
  tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("");

const renderCaseDetails = (project) => `
  <details class="project-details">
    <summary>
      <span>Decisões do projeto</span>
      <span class="details-symbol" aria-hidden="true"></span>
    </summary>
    <div class="project-story">
      <div>
        <span>Começo</span>
        <p>${escapeHtml(project.started)}</p>
      </div>
      <div>
        <span>Problema</span>
        <p>${escapeHtml(project.problem)}</p>
      </div>
      <div>
        <span>Decisão</span>
        <p>${escapeHtml(project.decision)}</p>
      </div>
      <div>
        <span>Estado atual</span>
        <p>${escapeHtml(project.current)}</p>
      </div>
      <div>
        <span>Limite</span>
        <p>${escapeHtml(project.limit)}</p>
      </div>
      <div>
        <span>Próximo passo</span>
        <p>${escapeHtml(project.next)}</p>
      </div>
    </div>
  </details>
`;

const renderProject = (project) => {
  const image = project.images[0];
  const extraImage = project.images[1];

  return `
    <article class="project" id="${escapeHtml(project.id)}">
      <div class="project-visual">
        <img
          src="${escapeHtml(image.src)}"
          alt="${escapeHtml(image.alt)}"
          loading="lazy"
          decoding="async"
        />
        ${
          extraImage
            ? `<img class="project-visual-secondary" src="${escapeHtml(extraImage.src)}" alt="${escapeHtml(extraImage.alt)}" loading="lazy" decoding="async" />`
            : ""
        }
      </div>

      <div class="project-content">
        <div class="project-meta">
          <span>${escapeHtml(project.index)}</span>
          <span>${escapeHtml(project.status)}</span>
        </div>

        <div class="project-heading">
          <p>${escapeHtml(project.kind)}</p>
          <h3>${escapeHtml(project.title)}</h3>
        </div>

        <p class="project-summary">${escapeHtml(project.summary)}</p>

        <ul class="project-tags" aria-label="Tecnologias e temas">
          ${renderTags(project.tags)}
        </ul>

        <div class="project-links">
          ${renderLinks(project.links)}
        </div>

        ${renderCaseDetails(project)}
      </div>
    </article>
  `;
};

if (projectList) {
  projectList.innerHTML = projects.map(renderProject).join("");
}

if (year) {
  year.textContent = String(new Date().getFullYear());
}

const fallbackCopy = (text) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
};

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
};

copyButton?.addEventListener("click", async () => {
  const email = copyButton.dataset.copyEmail;
  let copied = false;

  try {
    await navigator.clipboard.writeText(email);
    copied = true;
  } catch {
    copied = fallbackCopy(email);
  }

  if (copied) {
    copyLabel.textContent = "e-mail copiado";
    showToast("E-mail copiado para a área de transferência.");
    window.setTimeout(() => {
      copyLabel.textContent = "copiar e-mail";
    }, 2200);
  } else {
    showToast("Não foi possível copiar. Selecione o endereço manualmente.");
  }
});
