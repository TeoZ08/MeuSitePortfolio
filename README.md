# Matteo — portfólio subtraction design

Versão alternativa do portfólio de Matteo Lima Scotti, criada na branch `redesign/subtraction-design`.

A proposta aplica **design por subtração**: remover interações, efeitos e camadas que competiam com o conteúdo. A experiência passa a priorizar projetos, decisões técnicas, formação e contato.

> A branch `main` não foi alterada e continua responsável pelo GitHub Pages atual.

## O que mudou

- remoção da experiência 3D e da dependência Three.js;
- remoção de modal, transições de pasta, ruído e elementos cenográficos;
- navegação reduzida a Projetos, Sobre e Contato;
- estudos de caso exibidos no próprio fluxo da página;
- hierarquia tipográfica mais direta;
- sistema visual reduzido a fundo grafite, texto, linhas e um único acento violeta;
- layout responsivo e suporte a `prefers-reduced-motion`;
- manutenção do conteúdo, imagens, currículo e links dos projetos.

## Stack

- Vite;
- JavaScript com ES modules;
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

## GitHub Pages

O Vite continua configurado com:

```text
base: "/MeuSitePortfolio/"
```

Isso mantém todos os assets compatíveis com a publicação em subdiretório. O workflow de deploy permanece restrito a pushes na branch `main`, portanto esta branch não substitui o site publicado automaticamente.

## Estrutura

```text
public/                  identidade, imagens e currículo
src/data/projects.js     conteúdo dos quatro projetos
src/main.js              renderização dos projetos e cópia de e-mail
src/styles.css           sistema visual e responsividade
index.html               estrutura semântica da página
docs/                    documentação do projeto
```
