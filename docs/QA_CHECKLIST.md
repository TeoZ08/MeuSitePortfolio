# Checklist de QA

## Pastas e colisão

- [x] espessura e volume reais
- [x] slots de repouso explícitos
- [x] distância mínima entre volumes
- [x] limites de piso, teto, fundo e laterais
- [x] nenhuma colisão mascarada por `renderOrder`
- [x] arraste parcial e lento
- [x] retorno abaixo do limite
- [x] arraste rápido acima do limite
- [x] extração completa
- [x] `pointercancel`
- [x] pointer fora do canvas por pointer capture
- [x] consequência física nas pastas vizinhas
- [x] restauração exata dos quatro slots
- [x] useART, Jarvis, AquaIA e Portal UnAPI
- [x] aberturas repetidas

## Modal e transição

- [x] overlay com `overflow: hidden`
- [x] cabeçalho sem `sticky`
- [x] somente `.project-modal-scroll` rola
- [x] scroll rápido para baixo e retorno para cima
- [x] teclado (`End`, `Escape`, tabulação)
- [x] largura e altura estáveis
- [x] imagem não atravessa o cabeçalho
- [x] fechamento no topo, meio e fim
- [x] fechamento por botão e `Escape`
- [x] fechamento solicitado durante abertura
- [x] pasta WebGL oculta enquanto o clone existe
- [x] imagem HTML oculta enquanto o clone existe
- [x] zero animações ou classes órfãs após o ciclo
- [x] foco restaurado ao gatilho

## Resoluções e modos

- [x] 1440 × 900
- [x] 1280 × 800
- [x] 1024 × 640
- [x] zoom CSS de 125%
- [x] 360 × 800
- [x] 390 × 844
- [x] 430 × 932
- [x] sem overflow horizontal
- [x] fallback sem WebGL
- [x] `prefers-reduced-motion`

## Automático

- [x] `npm run check` final
- [x] `npm run build` final
- [x] preview de produção sem erro no console
- [x] sem overlay do Vite
- [x] sem asset local quebrado
- [x] nenhum asset requisitado fora de `/MeuSitePortfolio/`
- [x] currículo, favicon, textura e capturas presentes em `dist`
- [x] Laboratório, Processo e Versões ausentes da interface

## Fora do ambiente

- [ ] Safari/iOS em dispositivo físico
- [ ] Android intermediário físico
- [ ] trackpad físico
- [ ] Lighthouse no deploy final
- [ ] rede móvel real
