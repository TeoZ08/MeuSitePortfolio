# Sistema de interface — Portfólio teo

## Intent

Usuário: recrutador, professor, colega técnico ou potencial cliente.

Tarefa principal: entender rapidamente quem é Matteo, quais projetos estão prontos e como entrar em contato.

Sensação desejada: editorial, autoral, técnico e selecionado, sem aparência de landing genérica.

## Domain

Portfólio, projetos, software, interfaces, APIs, IA, UFMS, currículo, command palette, terminal, identidade teo.

## Color World

- Papel claro quente para base editorial.
- Preto/ink para texto e contraste.
- Verde escuro como acento técnico.
- Tons muted para metadados e separação.
- Textura sutil para assinatura autoral.

## Signature

Identidade `teo` com composição editorial, command palette, terminal interativo e cards de projetos selecionados.

## Defaults a rejeitar

- Landing genérica com hero de marketing; preferir portfolio direto e autoral.
- Lista enorme de projetos; preferir curadoria com descrições honestas.
- Frases motivacionais vagas; preferir problemas, soluções e links reais.

## Tokens e padrões atuais

- `--paper`, `--paper-soft`, `--paper-deep`: fundos editoriais.
- `--ink`, `--ink-soft`, `--muted`: texto e metadados.
- `--accent`: acento principal.
- `--line`, `--line-strong`: divisórias e bordas.
- `--mono`, `--sans`, `--display`: hierarquia tipográfica.
- `--radius-lg`, `--radius-md`: raios principais.

## Estados interativos

- Filtros de projeto devem mostrar estado ativo.
- Cards precisam manter botão de detalhes e links diretos.
- Command palette deve abrir com `/` e fechar com `Esc`.
- Modal de projeto deve preservar foco visual e fechamento claro.

## Acessibilidade e responsividade

- Manter skip link e labels em botões de navegação.
- Não esconder conteúdo essencial apenas em efeitos/canvas.
- Garantir que textos dos cards caibam no mobile.
- Preservar contraste em botões, filtros e modal.

## Limites

Não remover Jarvis, UnAPI, Guincho 10 ou AquaIA sem decisão explícita. Novos projetos só entram se a documentação e validação mínima estiverem coerentes.
