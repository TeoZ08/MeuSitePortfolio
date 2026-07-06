# Sistema de interface — Arquivo de trabalho

## Intent

- Usuário principal: recrutadores técnicos, lideranças de engenharia/produto e potenciais colaboradores.
- Tarefa principal: reconhecer Matteo, explorar projetos reais e chegar a produto, código, currículo ou contato.
- Sensação: arquivo de trabalho usado de verdade — material, quente, preciso e levemente indisciplinado.
- Assinatura: ambiente-arquivo WebGL em tela cheia no desktop, com caixa e quatro pastas de projeto; `teo` aparece apenas como assinatura pequena.

## Domain

Pastas, slots, lombadas, caixa, fichas, recortes, rascunhos, carimbos, código, faculdade e documentação.

## Princípios

1. Matteo e os projetos são protagonistas; a marca apenas assina.
2. Livro, arquivo e mesa de trabalho; nunca dashboard.
3. Evidência antes de adjetivo.
4. Capturas reais; nenhum mockup inventado.
5. Um único canvas cobre a hero desktop e situa o arquivo no ambiente; nunca um canvas por card.
6. Todo texto e toda ação continuam em HTML.
7. Mobile usa a mesma cena WebGL quando disponível, com giro horizontal, seleção por toque e extração por controle HTML; o fallback permanece obrigatório.
8. Movimento comunica peso e materialidade; não esconde navegação.

## Tokens

### Cores

- `--paper: #e9dcc6`: fundo de papel.
- `--paper-light: #f5ead8`: ficha e superfície elevada.
- `--paper-bright: #fff8e9`: realce claro.
- `--paper-deep: #cdbb9f`: borda e folha envelhecida.
- `--ink: #1a1210`: carvão.
- `--ink-soft: #55443c`: texto secundário.
- `--ink-faint: #7c695f`: metadados.
- `--red: #aa3024`: pigmento.
- `--red-deep: #7c211a`: ação e fundo em brasa.
- Cores dos projetos aparecem nas pastas, capturas e respectivos dossiês.

### Tipografia

- Editorial: Cormorant Garamond.
- Impacto condensado: Bebas Neue.
- Interface: Inter.
- Metadados: IBM Plex Mono.

### Espaçamento e dimensão

- Gutter: `clamp(1.25rem, 4vw, 4.75rem)`.
- Espaço de seção: `clamp(6rem, 11vw, 11rem)`.
- Largura máxima: `1440px`.
- Controles: mínimo de 44 px; ações principais com 52 px.

### Profundidade

A profundidade vem de sobreposição, perspectiva, material e contraste. Sombras fortes ficam restritas à caixa 3D, às capturas reais, aos arquivos acadêmicos e ao modal.

## Padrões

- `.section-marker`: índice funcional de seção.
- `.section-heading`: título editorial + introdução curta.
- `.archive-explorer`: camada full-bleed da hero desktop e mecanismo central de seleção de projetos; não é um card ou frame.
- `.project-case`: captura real + resumo factual + estado atual.
- `.project-overlay`: dossiê completo com foco retido.
- `.project-modal-scroll`: única área rolável do dossiê; o cabeçalho pertence à caixa.
- `.folder-transition`: continuidade visual entre a pasta extraída e o dossiê HTML.

## Estados

- Hover: deslocamento pequeno, inversão papel/carvão ou perspectiva limitada.
- Focus: contorno vermelho de 2 px com offset.
- Fundo do canvas arrastado: gira a caixa e as pastas juntas, dentro de limites que preservam leitura e enquadramento.
- Touch mobile: gesto horizontal no fundo gira; gesto vertical continua rolando a página; tocar uma pasta seleciona sem abrir.
- Extração mobile: um controle HTML dedicado acompanha o dedo, aplica resistência e usa o mesmo limite físico de 70%.
- Pasta ativa: permanece em seu slot e sai pelo eixo físico de extração; o botão HTML inverte para papel.
- Arraste: `pointer capture`, resistência progressiva, volumes `Box3`, reação dos vizinhos, indicador e limite de 70%.
- Abaixo do limite: retorno com spring, sem abrir o projeto.
- Acima do limite: extração automática, capa abre e a captura real aparece.
- Modal aberto: foco no fechar, página bloqueada e scroll restrito a `.project-modal-scroll`.
- Fechamento vindo do arquivo: a camada DOM retorna ao canvas e a pasta volta à caixa.
- WebGL indisponível: pilha de pastas em CSS/HTML no mesmo enquadramento.
- Movimento reduzido: sem entrada, flutuação, tilt ou loop contínuo.

## Responsividade

- Acima de 1100 px em orientação suficientemente horizontal: hero inteira é o ambiente WebGL; texto HTML ocupa o espaço negativo à esquerda e o arquivo 3D permanece à direita, sem frame.
- 921–1100 px: hero ainda dividida, composição comprimida.
- 681–920 px: hero e cases empilhados; navegação recolhida.
- Até 680 px: WebGL full-bleed em retrato quando disponível; câmera própria, pixel ratio reduzido e fallback HTML para indisponibilidade ou falha de contexto.

## Conteúdo

- Não usar slogans de agência, frases motivacionais ou contagens como proposta de valor.
- Status, links, tecnologias, limites e próximos passos precisam existir nos projetos.
- Cases são atualizados em `src/data/projects.js`.
- Faculdade e contato ficam na estrutura semântica de `index.html`.
