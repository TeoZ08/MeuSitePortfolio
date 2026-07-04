# Matteo — portfólio 3D

Portfólio oficial de Matteo Lima Scotti. A página combina uma apresentação editorial com o “Arquivo Impossível”: uma caixa 3D com quatro pastas de projetos que podem ser puxadas, abertas e devolvidas ao arquivo.

## Stack

- Vite;
- JavaScript com ES modules;
- Three.js;
- CSS responsivo;
- GitHub Actions e GitHub Pages.

## Desenvolvimento local

Requer Node.js LTS e npm.

```bash
npm ci
npm run dev
```

## Validação

```bash
npm run check
npm run build
npm run preview
```

`npm run preview` valida a saída estática gerada em `dist`. A pasta `dist` é descartável e não deve ser editada ou commitada.

## GitHub Pages

O repositório é publicado em:

```text
https://teoz08.github.io/MeuSitePortfolio/
```

Como o site é servido em um subdiretório, o Vite usa `base: "/MeuSitePortfolio/"`. Assets públicos utilizam `import.meta.env.BASE_URL` ou substituição de `%BASE_URL%` no HTML.

Pushes na branch `main` acionam [.github/workflows/deploy.yml](.github/workflows/deploy.yml), que:

1. instala dependências com `npm ci`;
2. executa `npm run check`;
3. gera `dist` com `npm run build`;
4. publica o artifact pelo GitHub Pages.

O deploy não depende de commitar `dist`.

## Estrutura

```text
public/                  assets estáticos e currículo
src/data/projects.js     conteúdo dos quatro projetos
src/scene/               caixa, pastas e interação Three.js
src/main.js              navegação, cases, modal e ponte DOM/WebGL
src/styles.css           sistema visual e responsividade
docs/                    arquitetura, QA e status final
```

Não commitar `node_modules`, arquivos `.env`, tokens, credenciais ou builds locais.
