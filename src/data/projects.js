const publicAsset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export const projects = [
  {
    id: "useart",
    index: "01",
    title: "useART",
    shortTitle: "useART",
    kind: "Loja própria · produto e operação",
    status: "Cliente real · em desenvolvimento",
    summary:
      "Uma loja autoral que precisou sair do MVP estático e encarar catálogo, carrinho, regras comerciais e uma operação que ainda está sendo fechada.",
    started:
      "Começou como um MVP de loja para uma marca de roupa de Campo Grande. A primeira versão concentrava interface, dados e regras no mesmo lugar.",
    problem:
      "Frete, pagamento e administração pareciam prontos na tela, mas ainda eram simulações. Isso deixava a experiência mais completa do que a operação real.",
    decision:
      "Migrar para Next.js e TypeScript, reduzir o catálogo às sete ofertas confirmadas e tratar o WhatsApp como checkout assistido, sem fingir integrações que ainda não existem.",
    current:
      "A Fase 1 tem catálogo tipado, variações, Kit, carrinho persistente, cupom transitório e mensagem de pedido estruturada.",
    limit:
      "Backend, estoque, painel, frete e pagamento reais dependem de regras e credenciais da operação.",
    next:
      "Fechar fotografias e regras comerciais com a cliente; depois ligar banco, pagamento e frete ao fluxo já construído.",
    tags: ["Next.js", "TypeScript", "E-commerce", "Three.js"],
    links: [{ label: "Ver código", url: "https://github.com/TeoZ08/useART" }],
    images: [
      {
        src: publicAsset("projects/useart-home.webp"),
        alt: "Página inicial real da loja useART com campanha editorial e camiseta 3D."
      },
      {
        src: publicAsset("projects/useart-product.webp"),
        alt: "Página real de produto da useART com variações e informações de compra."
      }
    ],
    folder: "#a92e22"
  },
  {
    id: "jarvis",
    index: "02",
    title: "Jarvis Acadêmico",
    shortTitle: "Jarvis",
    kind: "RAG · ferramentas · avaliação",
    status: "Projeto acadêmico · online",
    summary:
      "Um copiloto de estudos publicado que combina documentos, agenda e ferramentas sem esconder de onde cada resposta veio.",
    started:
      "Materiais, prazos e tarefas da faculdade estavam espalhados. A ideia inicial era reunir esse contexto em uma interface de conversa.",
    problem:
      "Só conversar com um modelo não resolvia o problema: a resposta precisava apontar fontes, acionar ferramentas e continuar útil quando uma etapa falhasse.",
    decision:
      "Combinar recuperação híbrida, tool calling, revisão ativa, agenda e um painel de evidências em vez de tratar o chat como produto inteiro.",
    current:
      "Frontend React, API FastAPI, upload de documentos, tarefas e deploy público no Hugging Face Spaces.",
    limit:
      "A recuperação ainda precisa de métricas melhores e avaliação em sessões acadêmicas mais longas.",
    next:
      "Aprofundar observabilidade e transformar os testes de recuperação em uma rotina de avaliação repetível.",
    tags: ["React", "FastAPI", "Python", "RAG", "Tool calling"],
    links: [
      { label: "Abrir sistema", url: "https://teoz08-jarvis-academico.hf.space" },
      { label: "Ver código", url: "https://github.com/TeoZ08/jarvis-academico" }
    ],
    images: [
      {
        src: publicAsset("projects/jarvis-home.webp"),
        alt: "Interface real do Jarvis Acadêmico com chat, fontes e painel de evidências."
      }
    ],
    folder: "#756bc4"
  },
  {
    id: "aquaia",
    index: "03",
    title: "AquaIA",
    shortTitle: "AquaIA",
    kind: "Inteligência hídrica participativa",
    status: "Hackathon UFMS · protótipo publicado",
    summary:
      "Um protótipo mobile-first para transformar relatos de desperdício de água em mapa, prioridade e impacto legível.",
    started:
      "O projeto nasceu em um hackathon da UFMS a partir de um problema visível no cotidiano: vazamentos são percebidos localmente, mas os registros ficam dispersos.",
    problem:
      "Relato, localização, triagem e leitura do impacto apareciam como etapas separadas. A tecnologia não podia depender de uma API externa para o fluxo básico funcionar.",
    decision:
      "Unir comunidade, mapa e painel de manutenção em um único fluxo, com IA opcional e fallback por regras.",
    current:
      "Aplicação Flask com SQLite, OpenStreetMap, cálculo de impacto e deploy no Render.",
    limit:
      "Ainda é um protótipo: os dados e a priorização não foram integrados a uma operação real de manutenção.",
    next:
      "Validar o fluxo com dados e pessoas da operação antes de ampliar a promessa tecnológica.",
    tags: ["Flask", "Dados", "UX", "IA aplicada", "OpenStreetMap"],
    links: [
      { label: "Abrir protótipo", url: "https://aquaia-ufms.onrender.com/" },
      { label: "Ver código", url: "https://github.com/TeoZ08/aquaia-ufms" }
    ],
    images: [
      {
        src: publicAsset("projects/aquaia-home.webp"),
        alt: "Página real do AquaIA com narrativa de inteligência hídrica e indicadores."
      }
    ],
    folder: "#078b91"
  },
  {
    id: "unapi",
    index: "04",
    title: "Portal UnAPI",
    shortTitle: "UnAPI",
    kind: "Extensão · acessibilidade digital",
    status: "Projeto de extensão · publicado",
    summary:
      "Um portal com exercícios e simuladores para que participantes das oficinas de informática possam praticar também fora da sala.",
    started:
      "Nas oficinas de extensão, pessoas idosas precisavam rever conteúdos e praticar habilidades digitais entre um encontro e outro.",
    problem:
      "Tutoriais genéricos não reproduziam as ações ensinadas nas oficinas e alguns serviços reais não eram bons ambientes para aprender sem risco.",
    decision:
      "Criar exercícios de mouse e teclado, guias e simulações educativas com avisos claros, linguagem direta e navegação leve.",
    current:
      "Portal estático publicado e usado como apoio nas oficinas, com vídeos, atividades e simuladores.",
    limit:
      "A acessibilidade ainda precisa ser validada com mais participantes e os módulos não cobrem todo o conteúdo das oficinas.",
    next:
      "Ampliar os módulos a partir do que os participantes realmente tentam fazer e observar onde ainda existe fricção.",
    tags: ["HTML", "CSS", "JavaScript", "Acessibilidade", "Extensão"],
    links: [
      { label: "Abrir portal", url: "https://pet-sistemas.github.io/unapi-oficinas/" },
      { label: "Ver código", url: "https://github.com/TeoZ08/homeUnapi" }
    ],
    images: [
      {
        src: publicAsset("projects/unapi-home.webp"),
        alt: "Página real do Portal UnAPI com acesso às ferramentas e vídeos das oficinas."
      }
    ],
    folder: "#5b2a61"
  }
];

export const projectById = Object.fromEntries(projects.map((project) => [project.id, project]));
