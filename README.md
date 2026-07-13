# Portfólio Matteo — Explore meu mundo

Portfólio em tela inteira construído como uma experiência 3D. Antes do hub, o visitante conduz o robô por uma ruína tomada pela vegetação, encontra um terminal e entra no portfólio pela tela do monitor.

Os projetos mostrados na sala são destaques. Outros trabalhos continuam disponíveis no GitHub de Matteo.

## Experiência

- **Entrada:** caminho externo em luz de fim de tarde, movimento em terceira pessoa, ruínas, vegetação e um terminal interativo.
- **Transição:** o monitor desperta quando o robô se aproxima; clique ou `E` leva a câmera para dentro da tela e revela o hub.
- **Hub:** estandes distribuídos em semicírculo, câmera reagindo ao mouse e robô-guia controlável por WASD.
- **useART:** camiseta 3D, produto e checkout.
- **Jarvis Acadêmico:** EVA, monitores, fontes e documentos.
- **AquaIA:** tubulação modular, medidor, mapa e indicadores.
- **Portal UnAPI:** teclado, mouse e atividades usadas nas oficinas.
- **Retorno:** botão `×` permanente, tecla `Esc` e histórico do navegador; no hub, **Voltar à entrada** reinicia o percurso externo.

## Executar

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Versão de produção:

```bash
npm run check
npm run build
npm run preview
```

## Controles

- Use `W`, `A`, `S` e `D` para mover o robô na introdução e no hub.
- Perto do terminal, clique na tela ou pressione `E`. Também existe a opção **Ir direto aos projetos**.
- Mova o mouse para observar; a câmera acompanha o deslocamento de forma sutil.
- Clique em um estande para o robô se aproximar e visitá-lo.
- Clique nas telas do estande para ampliar as capturas.
- Use o botão `×`, a tecla `Esc` ou o botão voltar do navegador para retornar ao hub.
- No hub, use **Voltar à entrada** para rever o percurso e o terminal.
- No celular, arraste para observar.

## Estrutura principal

- `src/main.js`: fluxo entre entrada, hub e projetos.
- `src/world/PortfolioWorld.js`: ambiente, estandes e interações 3D.
- `src/world/IntroWorld.js`: cenário externo, terminal, controles e transição inicial.
- `src/world/CameraRig.js`: movimentos e rotas da câmera.
- `src/world/GuideRobot.js`: comportamento do robô-guia.
- `src/world/stations/`: composição individual de cada projeto.
- `src/ui/InterfaceController.js`: entrada, informações, ajuda e galerias.
- `src/data/portfolio.js`: textos, links e capturas.
- `public/models/`: modelos GLB usados no hub.
- `public/intro/`: mesa, monitor, ruína e vegetação já reduzidos para o navegador.

Os objetos auxiliares presentes nos GLBs do teclado e da EVA são removidos antes da normalização. A rede da AquaIA usa apenas um conjunto coerente de peças do arquivo de canos. Esta revisão parte da versão 14 — incluindo a orientação frontal corrigida do robô, o WASD e os enquadramentos dos projetos — e troca somente a entrada por uma cena externa independente.

Se WebGL não estiver disponível, o site apresenta uma navegação simplificada com os mesmos textos e links.
