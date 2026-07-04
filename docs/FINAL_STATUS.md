# Status final — 2026-07-04

## Migração oficial

- origem técnica: `/home/matteo/ProjetosPessoais/teo-portfolio-3d`;
- destino Git: `/home/matteo/ProjetosPessoais/MeuSite`;
- repositório: `TeoZ08/MeuSitePortfolio`;
- histórico e `.git` do destino preservados;
- versão antiga preservada em branch remota de backup;
- arquivos estáticos antigos substituídos pelo projeto Vite;
- seção Laboratório removida integralmente;
- estrutura final: Hero, Projetos, Faculdade e Contato;
- Pages preparado para `/MeuSitePortfolio/` e deploy por GitHub Actions.

## Correções entregues

- pastas reconstruídas com espessura, volume conservador `Box3` e slots físicos;
- distância mínima entre vizinhos e limites internos para piso, teto, fundo e laterais;
- eixo de extração fixo, sem deslocamento livre em X/Y ou escala dentro da caixa;
- reação física discreta das pastas vizinhas enquanto o volume ativo ainda ocupa o conjunto;
- spring limitado à folga traseira e restauração exata dos quatro slots;
- borda frontal rebaixada para não interceptar a pasta inferior;
- materiais opacos com `depthTest` e `depthWrite`; transparência reservada a preview e sombra;
- `pointerdown`, `pointermove`, `pointerup`, `pointercancel`, `lostpointercapture` e `setPointerCapture` validados;
- clique curto no canvas retorna sem abrir; entrada HTML continua disponível para teclado, fallback e movimento reduzido;
- modal reestruturado como cabeçalho fixo na caixa + uma única área interna rolável;
- overlay sem scroll e modal com dimensões estáveis e `scrollbar-gutter`;
- transição sincronizada com uma única camada visual e ocultação explícita da pasta/imagem duplicada;
- cleanup de animações, classes, `will-change`, foco e bloqueios ao abrir e fechar;
- estrutura final reduzida a Hero, Projetos, Faculdade e Contato.

## Evidência funcional

- arraste parcial em 39%: pasta acompanhou o ponteiro, vizinhas reagiram e soltura retornou sem modal;
- arraste rápido acima de 70%: extração concluída e case aberto;
- `pointercancel`: captura liberada, spring executado e nenhum case aberto;
- fechamento durante a transformação: solicitação enfileirada e ciclo concluído sem clone órfão;
- useART, Jarvis, AquaIA e Portal UnAPI executaram extração e retorno;
- auditoria exposta por `getDebugState()` reportou `overlaps: []` e `outOfBounds: []` em repouso, arraste, extração e retorno;
- modal rolado até o fim manteve cabeçalho em `y = 46 px` e largura de `1220 px` em 1440 × 900;
- camada de transição terminou com zero animações ativas e classe removida;
- fechamento por botão e `Escape` restaurou o foco ao gatilho.

## Resoluções e modos

- 1440 × 900;
- 1280 × 800;
- 1024 × 640;
- layout submetido a zoom CSS de 125%;
- 360 × 800;
- 390 × 844;
- 430 × 932;
- movimento reduzido: RAF parado, canvas sem eventos e abertura HTML direta;
- WebGL desativado: quatro fichas HTML, cases completos e nenhuma mensagem técnica.

## Limitações restantes

- o sistema usa slots e caixas alinhadas aos eixos, não uma engine de rigid bodies;
- apenas uma pasta pode ser manipulada por vez;
- não há rotação livre nem colisão malha-a-malha;
- o canvas interativo é deliberadamente substituído por HTML abaixo de 720 px;
- Safari/iOS e dispositivos móveis físicos não foram acessados neste ambiente;
- o comando de wheel do navegador headless não emitiu eventos nesta sessão; scroll interno foi validado por teclado e alteração direta, mas wheel/trackpad físicos permanecem pendentes;
- Lighthouse e comportamento em rede móvel real dependem do deploy final;
- disponibilidade futura dos projetos externos não pode ser garantida.

## Bundle

- HTML: 9.56 kB bruto / 3.01 kB gzip;
- CSS: 28.71 kB bruto / 6.62 kB gzip;
- aplicação principal: 20.94 kB bruto / 8.05 kB gzip;
- cena Three.js dinâmica: 533.58 kB bruto / 135.27 kB gzip.
