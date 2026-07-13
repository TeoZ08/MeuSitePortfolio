const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export const projects = [
  {
    id: "useart",
    number: "01",
    title: "useART",
    roomLabel: "PRODUTO / OPERAÇÃO",
    context: "Loja para cliente real",
    status: "Branch em validação",
    color: "#b8392c",
    summary: "A primeira versão fechava pedidos pelo WhatsApp. Na branch atual, catálogo, cupons, frete, pedidos e permissões passaram a ser tratados no servidor. O pagamento ainda está em teste, então essa versão não substituiu a loja publicada.",
    current: "O Preview usa Supabase de staging e Mercado Pago de teste. Falta confirmar o pagamento real antes do merge.",
    facts: [
      ["Contexto", "Cliente real"],
      ["Ambiente", "Preview"],
      ["Estado", "Draft PR"]
    ],
    flow: ["Escolha", "Pedido", "Pagamento"],
    tags: ["Next.js", "TypeScript", "Supabase", "Mercado Pago"],
    links: [{ label: "Código", url: "https://github.com/TeoZ08/useART" }],
    notes: [
      ["Da primeira versão para a atual", "A loja começou com catálogo, carrinho e envio do pedido pelo WhatsApp. Preços, cupons e pedidos ainda dependiam do navegador."],
      ["Regras no servidor", "O carrinho envia identificadores, variações e quantidades. O servidor consulta o catálogo, calcula desconto e entrega, cria o pedido e devolve um link de acompanhamento com token opaco."],
      ["Administração", "Produtos, variantes, imagens, cupons e pedidos podem ser gerenciados numa área protegida. A autorização é confirmada no servidor e o acesso do responsável usa TOTP."],
      ["Pagamento", "O Checkout Pro já cria preferências. O webhook tem validação de assinatura e idempotência, mas a entrega real ainda precisa ser testada antes da publicação."]
    ],
    gallery: [
      ["screens/useart-inicial.webp", "Página inicial da loja, com catálogo e direção visual da ART."],
      ["screens/useart-produto.webp", "Produto com tamanhos, quantidade e informações de compra."],
      ["screens/useart-carrinho.webp", "Carrinho antes da criação do pedido."],
      ["screens/useart-checkout.webp", "Checkout da nova branch em ambiente de teste."],
      ["screens/useart-acompanhamento-pedido.webp", "Acompanhamento público por token opaco."]
    ].map(([src, caption]) => ({ src: asset(src), caption }))
  },
  {
    id: "jarvis",
    number: "02",
    title: "Jarvis Acadêmico",
    roomLabel: "IA / RASTREABILIDADE",
    context: "Projeto acadêmico com Pedro Bertoncelo",
    status: "Publicado no Hugging Face",
    color: "#8177ce",
    summary: "Um assistente de estudos que deixa o caminho da resposta visível. A interface mostra os trechos recuperados, as ferramentas chamadas e o que acontece quando a LLM ou a busca falham.",
    current: "A aplicação reúne chat, upload, agenda, revisão ativa, registro de dificuldades e um painel técnico para conferir cada resposta.",
    facts: [
      ["Contexto", "Disciplina de IA"],
      ["Autores", "Matteo e Pedro"],
      ["Estado", "Publicado"]
    ],
    flow: ["Pergunta", "Trechos", "Resposta"],
    tags: ["React", "FastAPI", "Python", "RAG", "Tool calling"],
    links: [
      { label: "Abrir sistema", url: "https://teoz08-jarvis-academico.hf.space" },
      { label: "Código", url: "https://github.com/TeoZ08/jarvis-academico" }
    ],
    notes: [
      ["O trabalho", "A disciplina pedia RAG, tool calling, avaliação de erros e apoio ao aprendizado. O sistema precisava mostrar o material encontrado e o tratamento dado às falhas."],
      ["Recuperação", "Os documentos são divididos em trechos e pesquisados por busca lexical ou híbrida. A interface expõe fontes, scores e chunks usados."],
      ["Sem LLM", "Se o modelo remoto estiver indisponível, uma heurística decide se a busca local ainda vale a pena. Quando há material, o sistema mostra os trechos sem fingir que houve uma resposta completa."],
      ["Limite atual", "A base inicial é pequena e foi escrita para o trabalho. O próximo passo útil seria ampliar os materiais e medir a recuperação com uma avaliação repetível."]
    ],
    gallery: [
      ["screens/jarvis-chat.webp", "Chat principal do assistente acadêmico."],
      ["screens/jarvis-resposta-fontes.webp", "Resposta acompanhada das fontes recuperadas."],
      ["screens/jarvis-ferramentas-chamadas.webp", "Ferramentas chamadas e evidências usadas pelo sistema."],
      ["screens/jarvis-painel-tecnico.webp", "Painel técnico para acompanhar o caminho da resposta."],
      ["screens/jarvis-fallback-sem-llm.webp", "Comportamento seguro quando a LLM não está disponível."]
    ].map(([src, caption]) => ({ src: asset(src), caption }))
  },
  {
    id: "aquaia",
    number: "03",
    title: "AquaIA",
    roomLabel: "CAMPUS / MANUTENÇÃO",
    context: "Protótipo para hackathon da UFMS",
    status: "MVP publicado",
    color: "#15989b",
    summary: "Um web app para registrar desperdício de água no campus, estimar litros e custo e organizar as ocorrências por local, gravidade e prioridade.",
    current: "O MVP recebe descrição e imagem, marca a ocorrência no mapa e continua funcionando por regras quando o Gemini não está disponível.",
    facts: [
      ["Contexto", "Hackathon UFMS"],
      ["Escopo", "MVP funcional"],
      ["Estado", "Publicado"]
    ],
    flow: ["Registro", "Mapa", "Atendimento"],
    tags: ["Flask", "SQLite", "Gemini", "Leaflet"],
    links: [
      { label: "Abrir protótipo", url: "https://aquaia-ufms.onrender.com/" },
      { label: "Código", url: "https://github.com/TeoZ08/aquaia-ufms" }
    ],
    notes: [
      ["Registro", "Uma ocorrência reúne local, ambiente, descrição e imagem opcional. Ela entra numa fila que pode ser consultada e atualizada."],
      ["Estimativas", "O painel calcula litros por dia, custo mensal e custo anual com uma tarifa configurável. A memória do cálculo fica visível."],
      ["Análise e fallback", "Quando existe uma chave, o Gemini analisa imagem e descrição. Sem chave ou em caso de falha, regras locais fazem a classificação. O projeto não treinou um modelo próprio."],
      ["O que ainda falta", "O sistema não está ligado à operação real da universidade. As estimativas e o fluxo de atendimento precisam ser validados com a equipe responsável."]
    ],
    gallery: [
      ["screens/aquaia-formulario-ocorrencia.webp", "Formulário usado para registrar uma ocorrência."],
      ["screens/aquaia-analise-fallback-sem-gemini.webp", "Classificação por regras sem o Gemini."],
      ["screens/aquaia-mapa.webp", "Mapa das ocorrências registradas."],
      ["screens/aquaia-indicadores-litros-custos.webp", "Estimativas de litros desperdiçados e custo."],
      ["screens/aquaia-painel-atendimento.webp", "Fila de atendimento e mudança de estado."]
    ].map(([src, caption]) => ({ src: asset(src), caption }))
  },
  {
    id: "unapi",
    number: "04",
    title: "Portal UnAPI",
    roomLabel: "EXTENSÃO / ENSINO",
    context: "Projeto de extensão na UFMS",
    status: "Usado nas oficinas",
    color: "#7b3b79",
    summary: "Um portal criado para as oficinas de informática com pessoas idosas. Ele reúne exercícios, vídeos e simulações que podem ser usados sem inserir dados reais.",
    current: "O portal já apoia atividades de mouse e teclado, guias do gov.br, prova de vida, assinatura eletrônica e reconhecimento de golpes digitais.",
    facts: [
      ["Contexto", "Extensão UFMS"],
      ["Público", "Pessoas idosas"],
      ["Estado", "Em uso"]
    ],
    flow: ["Atividade", "Prática", "Oficina"],
    tags: ["HTML", "CSS", "JavaScript", "Acessibilidade"],
    links: [
      { label: "Abrir portal", url: "https://pet-sistemas.github.io/unapi-oficinas/" },
      { label: "Código", url: "https://github.com/TeoZ08/homeUnapi" }
    ],
    notes: [
      ["Dentro das oficinas", "O portal foi criado para apoiar as aulas e permitir que cada atividade seja retomada depois dos encontros."],
      ["Praticar primeiro", "Os exercícios trabalham ações específicas: localizar teclas, controlar o mouse, acompanhar etapas do gov.br e reconhecer sinais de golpe."],
      ["Dados fictícios", "As simulações não pedem nem enviam dados reais. Os exemplos são fictícios e os avisos separam o treinamento do serviço oficial."],
      ["Por que é estático", "HTML, CSS e JavaScript mantêm o portal simples de abrir no laboratório e deixam cada atividade disponível por um link direto."],
      ["Uso real", "O conteúdo já foi usado nas oficinas. As próximas atividades devem partir das dificuldades observadas com os participantes."]
    ],
    gallery: [
      ["screens/unapi-inicial.webp", "Página inicial do portal usado nas oficinas."],
      ["screens/unapi-exercicio-mouse.webp", "Atividade para praticar controle e precisão do mouse."],
      ["screens/unapi-exercicio-teclado.webp", "Exercício de reconhecimento e uso do teclado."],
      ["screens/unapi-simulacao-govbr.webp", "Simulação educativa de etapas do gov.br."],
      ["screens/unapi-exercicio-golpes.webp", "Exercício para identificar sinais de golpe."],
      ["screens/unapi-avisos-seguranca-dados-ficticios.webp", "Avisos de segurança e uso de dados fictícios."]
    ].map(([src, caption]) => ({ src: asset(src), caption }))
  }
];

export const byId = Object.fromEntries(projects.map((project) => [project.id, project]));
