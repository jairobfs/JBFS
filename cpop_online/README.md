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

Em 29/10/2026, o conteúdo contém 64 etapas, incluindo 31 questões e 14 cartões. Sete questões têm imagens (seis do acervo original em `https://r.craft.do/` e uma imagem autoral da semana 24); o slide inicial da semana 24 também tem um infográfico SVG original hospedado no repositório GitHub, com crédito.

### Sincronização de edições

1. O backend lê os campos da coleção a cada consulta; nenhum gabarito é incluído nas respostas públicas.
2. O professor edita um bloco no Craft e o site passa a exibi-lo após atualização. O aluno conectado é avisado quando a revisão muda (consulta periódica).
3. O professor edita no Estúdio: um PUT envia somente os campos modificados para o Craft, com verificação de revisão. Alterações concorrentes recebem erro 409 e não são sobrescritas.
4. Um POST do Estúdio adiciona novo bloco à coleção, imediatamente disponível no próximo GET.
5. As respostas do estudante só são exibidas como entregues após confirmação de gravação na coleção de tentativas.
6. O modo de apresentação guarda a posição no Craft; alunos que optarem por seguir o professor consultam a posição a cada ~8 segundos.
7. O quadro editorial organiza publicados e rascunhos e permite alterar ordem e estado, gravando as mudanças no Craft.
8. A biblioteca de cartões registra `Lembrei`/`Preciso rever` em uma coleção separada. O algoritmo simples de intervalos é 1, 3, 7, 14, 30 e 60 dias; **não é FSRS**.
9. A semana 26 tem seis portas; a interface exige resposta e justificativa antes de avançar no percurso autônomo. Uma liderança ao vivo do professor pode posicionar a turma em outra etapa. O código de saída só é emitido pelo servidor quando as seis respostas estão corretas.

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
