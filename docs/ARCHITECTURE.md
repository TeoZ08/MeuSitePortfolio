# Arquitetura

## Stack

- Vite;
- JavaScript ES modules;
- CSS responsivo;
- Three.js puro, sem dependências adicionais.

## Fluxo

`index.html` contém landmarks, seções e todo conteúdo essencial. `src/main.js` renderiza cases e fallback, controla navegação, modal, foco e a ponte DOM/WebGL. `src/data/projects.js` é a fonte de verdade dos quatro projetos.

## Módulos da cena

- `ProjectArchiveScene.js`: renderer, câmera, luzes, raycasting, pointer capture, solucionador de slots e máquina de estados.
- `ArchiveFolder.js`: geometria sólida, volume `Box3`, etiqueta, desgaste procedural, preview sob demanda, capa articulada e indicador.
- `ArchiveBox.js`: caixa, espessuras, dobras, sombras de contato e cordão vermelho reativo.
- `ArchiveArtifactScene.js`: reexport compatível.

## Máquina de estados

```text
idle
  → dragging
      → settling → idle
      → extracting → extracted → open
                                  → returning → idle
```

- `dragging`: `setPointerCapture`, progresso normalizado, resistência e reação dos outros objetos.
- `settling`: spring amortecido abaixo do limite.
- `extracting`: pasta avança, câmera se aproxima, capa abre e captura real aparece.
- `open`: render loop pausado enquanto o dossiê HTML assume a leitura.
- `returning`: camada DOM volta ao canvas, capa fecha e pasta retorna à caixa.

O limite de extração é 70%. A entrada por teclado executa a mesma timeline sem exigir gesto de arraste.

## Volumes, slots e limites

As quatro pastas possuem espessura geométrica e um volume conservador definido em `FOLDER_PHYSICS`. Cada uma repousa em um slot com `0.17` unidade de passo vertical e `0.02` de distância mínima.

O movimento ativo é restrito ao eixo Z da caixa. X e Y não acompanham o ponteiro; o deslocamento horizontal apenas influencia uma inclinação pequena e limitada da caixa. Antes de cada frame:

1. os alvos dos quatro slots são recalculados;
2. vizinhos reagem à pressão enquanto a pasta ainda ocupa a caixa;
3. piso, teto, laterais e fundo são aplicados como limites;
4. pares que ainda se sobrepõem em profundidade preservam distância vertical mínima;
5. somente então damping ou spring atualizam as posições visuais.

O retorno admite uma compressão máxima de `-0.025` no eixo, dentro da folga traseira, sem atravessar o fundo. A borda frontal foi rebaixada para deixar o canal inferior livre. `renderOrder` não participa da solução.

Limitação deliberada: esse é um sistema determinístico de slots com caixas alinhadas aos eixos, não uma engine de rigid bodies. Existe uma única pasta ativa por vez e não há rotação livre.

## Arquitetura do modal

```text
project-overlay
└── project-modal
    ├── modal-head
    └── project-modal-scroll
        ├── modal-hero
        ├── modal-story
        └── modal-footer
```

O overlay posiciona e isola a página com `overflow: hidden`. O modal é uma grid de duas linhas com altura máxima estável. O cabeçalho não é `sticky`; ele é a primeira linha física do cartão. Somente `.project-modal-scroll` possui `overflow-y: auto`, `overscroll-behavior: contain` e `scrollbar-gutter: stable`.

Na abertura o scroll volta a zero e fica bloqueado durante a transformação. No fechamento ele é bloqueado na posição atual; o cleanup remove classes, animações, propriedades temporárias e restaura foco apenas depois do retorno.

## Transição para HTML

`src/main.js` usa uma única camada `.folder-transition` com cor, etiqueta e captura do projeto. O fluxo é:

```text
pasta extraída → clone visível → pasta WebGL oculta
→ modal estável com imagem oculta → clone alinha na imagem
→ clone removido → imagem liberada → scroll liberado
```

No fechamento a imagem do modal é substituída pelo mesmo clone, inclusive quando o conteúdo está rolado. Depois do alinhamento ao canvas, o clone é removido, a pasta WebGL reaparece e inicia o retorno. A camada não mantém `transform`, animações ou `will-change` após o cleanup.

## Performance

- import dinâmico da cena;
- DPR máximo de 1.5;
- preview de projeto carregado apenas ao selecionar a pasta;
- RAF pausado fora da viewport, em aba oculta e com case aberto;
- um renderer compartilhado;
- dispose de geometria, material, textura e renderer.

## Fallback

Abaixo de 720 px o canvas não é montado. WebGL indisponível preserva quatro fichas, botões e modal sem mensagem técnica. Movimento reduzido mantém uma renderização estática e abre os cases diretamente por HTML. O seletor global `[hidden]` garante que fallback e canvas nunca bloqueiem um ao outro.

## Acessibilidade

- skip link e headings reais;
- botões HTML sincronizados com as pastas;
- entrada por teclado equivalente ao gesto;
- modal com foco inicial, retenção, Escape e retorno de foco;
- página inerte enquanto o modal está aberto;
- texto e links fora do canvas;
- `prefers-reduced-motion` sem timeline física.

## Bundle de produção

- HTML: 9.56 kB bruto / 3.01 kB gzip;
- CSS: 28.71 kB bruto / 6.62 kB gzip;
- aplicação: 20.94 kB bruto / 8.05 kB gzip;
- cena Three.js dinâmica: 533.58 kB bruto / 135.27 kB gzip.

## GitHub Pages

- `vite.config.js` usa `base: "/MeuSitePortfolio/"`;
- assets em `public` usam `%BASE_URL%` no HTML ou `import.meta.env.BASE_URL` nos dados;
- o CSS é reescrito pelo Vite para o mesmo subdiretório;
- `.github/workflows/deploy.yml` executa check, build e publicação de `dist`;
- `dist` e `node_modules` não são versionados.
