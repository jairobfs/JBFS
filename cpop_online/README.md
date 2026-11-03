# CP֍P · Linguagens · sala digital S24–S26

Uma aplicação canônica para toda a aula: apresentação, teoria, tirinhas/cartazes com imagens originais do acervo CP֍P, questões, Escape Room, revisão conceitual, acompanhamento e painéis docentes. Código e deploy mantidos em `jairobfs/JBFS/cpop_online`; projeto Vercel `cpop-linguagens`.

## Entradas do mesmo aplicativo

| Rota | Função |
| --- | --- |
| `/` | Entrada principal: abre a sala de aula completa (`/aula.html`) |
| `/jogos.html` | Jogos independentes das semanas, preservados |
| `/aula.html` | Aula integral: teoria, projeção, imagens, questões, cartões, caderno pessoal e acompanhamento opcional do professor; prévia livre sem envio de respostas |
| `/estudar.html` | Meu progresso no Craft, cartões, biblioteca de materiais, justificativas e temporizador |
| `/professor.html` | Tentativas, diagnósticos, desempenho e exportação CSV (reservado) |
| `/editor.html` | Criar e editar slides, questões, imagens, gabaritos e cartões na mesma coleção do Craft (reservado) |
| `/apresentar.html` | Controlar a etapa transmitida à turma e revelar gabaritos apenas no painel docente (reservado) |

Produção canônica: https://cpop-linguagens.vercel.app/aula.html

## Fonte de verdade: quatro coleções Craft

Documento contêiner: CP֍P · Linguagens · Plataforma de jogos S24–S26, no espaço CP֍P. Uma conexão privada de leitura/escrita foi limitada a esse documento.

| Coleção | ID | Finalidade |
| --- | --- | --- |
| Conteúdo editável S24–S26 | `c3e544ba-2939-2292-45ce-327664a06d9a` | Slides, cartões e questões; ordem, corpo, imagem, alternativas, gabarito, justificativa |
| Tentativas S24–S26 | `a129558e-4d81-0531-8b07-acf4c126cc7c` | Respostas, justificativas, duração, XP, idempotência, data e versão |
| Sessão ao vivo | `5f9f66f0-8a45-ca8f-8e66-8d7dd96b1828` | Semana e UID da etapa projetada; estado de transmissão |
| Revisões conceituais | `ebb3c96e-55e6-9228-9523-7acbd154bc4a` | Autopercepção por cartão, repetição, intervalo e próxima data de revisão |

Em 03/11/2026, a coleção contém **91 itens**: **20 questões canônicas ativas**, **26 segmentos teóricos**, **14 cartões conceituais** e **31 questões didáticas preservadas como rascunhos**. Das 20 questões ativas, 12 têm imagens vinculadas. O infográfico SVG do slide inicial da semana 24 permanece hospedado no GitHub.

### Proveniência canônica Q001–Q301 (03/11/2026)

O Exame Canônico existente em @CPOP continua sendo a fonte normativa (301 itens). A coleção da sala mantém uma **seleção derivada de 20 questões**, identificadas por Q e com IDs de participação estáveis: 10 itens VEST e 10 SAEB II/VEST resgatados. Semana 24: 3 questões; semana 25: 7; semana 26: 10.

O backend `api/_canon.js` interpreta `canon-q###` e `canon-vest-##`, identifica o código Q na coluna `fonte` e audita vínculos ausentes, contraditórios ou duplicados. O GET autenticado de `/api/lesson-admin` fornece `canonAudit`, exibido no Estúdio em um quadro recolhível. O PUT/POST impede perda ou duplicação do código canônico, mas continua permitindo editar o texto e a estrutura de cada questão; não altera IDs já presentes nas tentativas.

**Auditoria de conteúdo realizada:** alternativas de 20/20 questões comparadas à Edição On-line do Exame (redação e ordem correspondentes); gabaritos de 11/11 questões VEST conferidos no Resolvedor Docente. Esta verificação parcial não equivale a uma auditoria integral de imagens, comandos, enunciados e seis superfícies.

**Limite arquitetural:** a conexão de produção da Vercel alcança a coleção da sala. As alterações do Estúdio ↔ coleção da sala são bidirecionais; a propagação automática Exame Canônico ↔ coleção derivada **não está habilitada**. Sincronizar esse documento de origem exige acesso autorizado à API correspondente, leitura de versões, diff por Q, escolha de tratamento de conflitos e read-back. O quadro `canonAudit` é um controle de integridade do mapeamento, não uma alegação de sincronização de conteúdo.

### Sincronização de edições

1. O backend lê os campos da coleção a cada consulta; nenhum gabarito é incluído nas respostas públicas.
2. O professor edita um bloco no Craft e o site passa a exibi-lo após atualização. O aluno conectado é avisado quando a revisão muda (consulta periódica).
3. O professor edita no Estúdio: um PUT envia somente os campos modificados para o Craft, com verificação de revisão. Alterações concorrentes recebem erro 409 e não são sobrescritas.
4. Um POST do Estúdio adiciona novo bloco à coleção, imediatamente disponível no próximo GET.
5. As respostas do estudante só são exibidas como entregues após confirmação de gravação na coleção de tentativas.
6. O modo de apresentação guarda a posição no Craft; alunos que optarem por seguir o professor consultam a posição a cada ~8 segundos.
7. O quadro editorial organiza publicados e rascunhos e permite alterar ordem e estado, gravando as mudanças no Craft.
8. A biblioteca de cartões registra `Lembrei`/`Preciso rever` em uma coleção separada. O algoritmo simples de intervalos é 1, 3, 7, 14, 30 e 60 dias; **não é FSRS**.
9. A semana 26 tem **dez portas** no percurso vigente, derivadas das dez questões canônicas ativas; a interface exige resposta e justificativa antes de avançar no percurso autônomo. Uma liderança ao vivo do professor pode posicionar a turma em outra etapa. O código de saída só é emitido pelo servidor quando todas as respostas estiverem corretas.

**Importante:** não há promessa de propagação instantânea em tempo real por websocket. O acompanhamento é por consultas periódicas, e a troca de conteúdo durante uma tentativa pode exigir atualização para preservar a correção.

### Caderno particular durante a aula

Cada etapa tem um campo de notas e marcação para revisão, com salvamento local imediato. O painel **Caderno** oferece copiar Markdown, exportar `.md`, conectar uma nota do Craft e sincronização nos dois sentidos:

1. O estudante identifica-se com **nome completo**, seleciona a turma fixa **CPOP - Campo Mourão** e usa o código de participação (atualmente `jbfs`); pode escrever o nome ou selecioná-lo da lista de chamada.
2. Sem conexão Craft, as notas permanecem apenas no dispositivo.
3. Na área **Configurar meu Craft**, a pessoa entra/cria conta gratuitamente em `docs.craft.do`, autoriza uma conexão API de leitura/escrita em **Imagine** e cola a URL fornecida pelo Craft. Sua senha de login **nunca** é solicitada pelo CPOP.
4. O botão **Criar meu caderno no Craft** cria uma nota pessoal com nome e apresentação editorial. Em uma conexão que não permita criar documentos, pode escolher uma nota existente. O vínculo fica em cookie cifrado HttpOnly, separado por dispositivo e aluno.
5. Novas edições feitas pela aula são gravadas no Craft após um breve intervalo e confirmação de releitura; **Enviar notas já escritas** envia os registros locais anteriores. **Trazer edições do Craft** recupera textos alterados no Craft com confirmação quando haveria substituição de conteúdo local. Ambos permanecem editáveis.
6. A nota pessoal é privada e não aparece no painel docente. As respostas avaliativas são gravadas separadamente na coleção institucional.

**Limite conhecido:** ainda não há botão de OAuth integrado no aplicativo CPOP. A conexão individual usa a URL de API autorizada pelo próprio usuário; o fluxo OAuth oficial do Craft requer um adaptador específico e deve ser implementado e testado separadamente antes de ser anunciado como funcional. O armazenamento local não substitui backup e pode ser perdido caso o navegador apague dados.

Selecionar uma alternativa agora atualiza a etapa sem reconstruir a tela, preservando a posição, o foco e a área de texto; em desafios da semana 26, o progresso das portas e o bloqueio de navegação são recalculados. Há atalhos de resposta A–D no desktop quando o foco não está em um campo de edição.

Em telas de até 960 px, o mapa de etapas é recolhível e fica fechado ao entrar. Até 760 px, uma barra de navegação fixa na base do celular oferece voltar/avançar, indica a etapa corrente e respeita as margens seguras do iPhone. A barra se oculta durante a digitação para não obstruir campos de resposta; o conteúdo completo e o índice desktop são preservados.

## Variáveis no Vercel

- `CRAFT_API_BASE` — endereço privado da conexão Craft.
- `CRAFT_API_KEY` — chave privada server-side.
- `CRAFT_COLLECTION_ID` — coleção de tentativas.
- `CRAFT_CONTENT_COLLECTION_ID` — coleção de conteúdos.
- `CRAFT_LIVE_COLLECTION_ID` — estado da projeção.
- `CRAFT_REVIEW_COLLECTION_ID` — avaliações espaçadas dos cartões.
- Código da turma e PIN do educador são hashes scrypt com sal na coleção de configurações de acesso do Craft, alteráveis no painel do professor. Não há senhas individuais para estudantes.

Nenhuma dessas credenciais privadas deve entrar no GitHub, no HTML público ou em capturas de tela. O estudante não precisa ter uma conta Craft; a coleção docente recebe dados pseudonimizados por identificador aleatório do dispositivo. Esse identificador e o código da turma não equivalem a autenticação forte.

## Identidade visual CP֍P

Paleta resgatada do Manual/Atlas Cromático real:
- Azul `#1C3B8E`: estrutura e navegação.
- Vermelho `#B42620`: interpretação e interação.
- Ouro `#EEAF3D`: pistas e pontos de atenção.
- Verde `#529F32`: progresso e conclusão.
- Papel `#FBF8F1`, texto `#20242A`; versão escura adaptada para OLED.

## Verificações realizadas

- API pública de aula e catálogo respondendo HTTP 200 e lendo diretamente o Craft.
- Conteúdo e imagens: 24/25/26, 64 etapas; 31 questões, seis URLs de imagens originais do acervo Craft e duas ilustrações SVG autorais servidas pelo GitHub.
- Editor docente autenticado: GET 200; edição por PUT e leitura de volta; restauração do valor original.
- Criação de slide pelo POST do editor: HTTP 201; item visto no Craft.
- Sessão ao vivo: PUT 200, GET de leitura confirmou novo UID, posição original restaurada.
- Progresso individual: consulta autenticada à turma retornou tentativas existentes no Craft.
- Acesso sem credencial docente recebe HTTP 401; progresso sem código de turma recebe HTTP 403.
- Código de revisão de cartões e análise docente verificado sintaticamente; rota pública `/api/review` rejeita código de turma inválido com HTTP 403. A escrita de uma avaliação real ainda exige um teste de ponta a ponta com participante autorizado.
- Arquivos JS foram verificados sintaticamente, mas esta entrega não substitui uma revisão visual manual nos principais dispositivos.
- Implantações Vercel podem ficar atrasadas por limite diário de uso; distinguir o código do repositório da versão atualmente respondendo no domínio.

## Integridade pedagógica

A semana 24 trabalha cultura afro-brasileira e indígena, diversidade de fala e preconceito linguístico. A semana 25 inclui funções da linguagem, textos curtos, tirinhas e memes. A semana 26 aborda inferências, implícitos e resolução justificada de pistas. O editor pode alterar sequência e material sem recriar o site.

O registro técnico original `VALIDACAO-TECNICA` foi mantido; não deve ser interpretado como aluno real nas análises da turma.

## Mini-simulado de revisão final · 03/11/2026

- Aluno: `/minisimulado.html?modo=aluno` — 30 questões (15 do acervo canônico, 8 recentes e 7 de revisão incorporadas em 03/11), escolha objetiva ou comentário, rascunho local com envio e leitura de volta pelo Craft.
- Educador: `/minisimulado.html?modo=professor` e aba **Mini-simulado** dentro de `/professor.html` — acompanhamento por estudante e questão, comentários e devolutivas; PIN docente já existente.
- Projeção: `/minisimulado.html?modo=projecao` — posição e revelação do gabarito comandadas pelo educador, agregados anonimizados.
- Banco de questões: coleção institucional de conteúdo `c3e544ba-2939-2292-45ce-327664a06d9a`, com 23 UIDs selecionados, ordenados por identidade estável e conteúdo atualizado em leitura.
- Coleta: coleção Craft `675a73a0-b3c2-6a26-4613-0cc6dac7a844`; projeção: `117e4c16-84fb-040f-3300-2952f55ebf55`.
- Sincronização: cada salvamento aguarda confirmação da API Craft; dashboards e projeção usam consultas periódicas, não websockets.
- Comentários sem alternativa são aceitos para envio, mas exigem leitura e devolutiva humana; o número de acertos objetivos não equivale a uma nota TRI do ENEM.

### Homologação E2E (03/11/2026)

- Uma implantação **de prévia isolada** executou POST real de rascunho com 23 respostas, incluindo 1 questão respondida somente por texto; leitura subsequente pela API Craft confirmou o conteúdo.
- A finalização real registrou 22 acertos objetivos e 1 resposta pendente de análise humana. Reenvio de tentativa já finalizada foi rejeitado com HTTP 409, sem apagar a entrega.
- Uma devolutiva escrita na coleção Craft foi recuperada corretamente pela API de estudante. O registro técnico foi excluído após a verificação; a coleção permaneceu sem tentativas de teste.
- A rota temporária de QA foi desativada na branch de ensaio e não integra o código de produção.
- Foram acrescentados testes de regressão em `tests/minisimulado.test.js` para preservar gabaritos, comentários, correção, acesso docente, projeção e compatibilidade com versões armazenadas.
- Não foi realizado teste automatizado visual com interação de iPhone; a garantia de layout depende de validação em dispositivo real. A API é por consulta periódica, não websockets.

### Projeção pedagógica moderada de comentários

O educador pode selecionar a justificativa de um estudante no painel do mini-simulado, revisar o trecho para ocultar nomes e dados privados e confirmar sua exibição **sem identificação** na projeção. A decisão é exclusivamente docente: nenhuma resposta discursiva aparece automaticamente no telão.

- A sessão é persistida na coleção Craft de projeção, propriedade `comentarioprojetado`. A mudança de questão ou a pausa limpa o comentário.
- A ação `project-comment` exige a autenticação docente, valida a existência de comentário naquele item e limita o texto projetado a 700 caracteres.
- A interface de projeção exibe o texto somente com a apresentação ativa; o modo estudante não recebe o comentário projetado no campo de sessão.
- O texto é escapado no navegador. O educador deve revisar e remover informações pessoais do trecho antes de autorizar sua divulgação.
- O teste de regressão automatizado verifica: HTTP 401 para publicação sem PIN, revisão e publicação docente, ausência de nome na resposta pública, ocultação manual e limpeza ao mudar de questão.

### Consolidação de sete notas-base de Linguagens · 03/11/2026

- As sete notas de origem foram lidas integralmente (16 páginas de conteúdo paginado), preservadas no arquivo de integridade `archive/notas_base_linguagens_2026-11-03.md` e sintetizadas em **16 registros** da coleção canônica no Craft: 9 exposições e 7 questões com quatro alternativas e gabaritos comentados.
- Identificadores das novas entradas: prefixo `inc-20261103-` (semanas 24–26); não foram reproduzidas como questões oficiais do ENEM as situações hipotéticas/autorais das notas.
- Alinhamento pedagógico revisto com a Matriz oficial do Inep: H18–H20 (competência de área 6), H21–H24 (competência 7) e H25–H27 (competência 8). A competência 1 de Linguagens diz respeito aos sistemas de comunicação e informação.
- O Censo Demográfico 2022 identifica 295 línguas indígenas faladas ou utilizadas por pessoas indígenas com 2 anos ou mais, com base em autodeclaração e critérios próprios de coleta (IBGE); evitar números antigos ou interpretar o total como medida direta de vitalidade linguística.
- A coleção antiga foi reutilizada, sem novas subpáginas temáticas. Os sete documentos-base foram movidos para a **lixeira do Craft** em 03/11/2026 após validação; o arquivo de integridade conserva seu texto original.
- O código do mini-simulado incorpora as sete questões novas, totalizando **30 questões**, preservando os UIDs originais. **Situação de publicação em 03/11/2026:** a Vercel bloqueou o novo deploy por limite diário (HTTP 402), portanto a versão pública do mini-simulado permanece com 23 questões até uma implantação bem-sucedida; as 16 entradas novas já estão acessíveis na aula pública via API do Craft.
