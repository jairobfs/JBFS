# CP֍P · Linguagens · sala digital S24–S26

Uma aplicação canônica para toda a aula: apresentação, teoria, tirinhas/cartazes com imagens originais do acervo CP֍P, questões, Escape Room, revisão conceitual, acompanhamento e painéis docentes. Código e deploy mantidos em `jairobfs/JBFS/cpop_online`; projeto Vercel `cpop-linguagens`.

## Entradas do mesmo aplicativo

| Rota | Função |
| --- | --- |
| `/` | Acesso, identidade do estudante e jogos das semanas |
| `/aula.html` | Sequência teórica intercalada com questões e cartões; aluno pode seguir a apresentação do professor |
| `/estudar.html` | Meu progresso no Craft, cartões, biblioteca de materiais, justificativas e temporizador |
| `/professor.html` | Tentativas, diagnósticos, desempenho e exportação CSV (reservado) |
| `/editor.html` | Criar e editar slides, questões, imagens, gabaritos e cartões na mesma coleção do Craft (reservado) |
| `/apresentar.html` | Controlar a etapa transmitida à turma e revelar gabaritos apenas no painel docente (reservado) |

Produção: https://cpop-linguagens-jairobfs7-1343s-projects.vercel.app/

## Fonte de verdade: três coleções Craft

Documento contêiner: CP֍P · Linguagens · Plataforma de jogos S24–S26, no espaço CP֍P. Uma conexão privada de leitura/escrita foi limitada a esse documento.

| Coleção | ID | Finalidade |
| --- | --- | --- |
| Conteúdo editável S24–S26 | `c3e544ba-2939-2292-45ce-327664a06d9a` | Slides, cartões e questões; ordem, corpo, imagem, alternativas, gabarito, justificativa |
| Tentativas S24–S26 | `a129558e-4d81-0531-8b07-acf4c126cc7c` | Respostas, justificativas, duração, XP, idempotência, data e versão |
| Sessão ao vivo | `5f9f66f0-8a45-ca8f-8e66-8d7dd96b1828` | Semana e UID da etapa projetada; estado de transmissão |

Em 29/10/2026, o conteúdo contém 64 etapas, incluindo 31 questões e 14 cartões. Sete questões têm imagens (seis do acervo original em `https://r.craft.do/` e uma imagem autoral da semana 24); o slide inicial da semana 24 também tem um infográfico SVG original hospedado no repositório GitHub, com crédito.

### Sincronização de edições

1. O backend lê os campos da coleção a cada consulta; nenhum gabarito é incluído nas respostas públicas.
2. O professor edita um bloco no Craft e o site passa a exibi-lo após atualização. O aluno conectado é avisado quando a revisão muda (consulta periódica).
3. O professor edita no Estúdio: um PUT envia somente os campos modificados para o Craft, com verificação de revisão. Alterações concorrentes recebem erro 409 e não são sobrescritas.
4. Um POST do Estúdio adiciona novo bloco à coleção, imediatamente disponível no próximo GET.
5. As respostas do estudante só são exibidas como entregues após confirmação de gravação na coleção de tentativas.
6. O modo de apresentação guarda a posição no Craft; alunos que optarem por seguir o professor consultam a posição a cada ~8 segundos.

**Importante:** não há promessa de propagação instantânea em tempo real por websocket. O acompanhamento é por consultas periódicas, e a troca de conteúdo durante uma tentativa pode exigir atualização para preservar a correção.

## Variáveis no Vercel

- `CRAFT_API_BASE` — endereço privado da conexão Craft.
- `CRAFT_API_KEY` — chave privada server-side.
- `CRAFT_COLLECTION_ID` — coleção de tentativas.
- `CRAFT_CONTENT_COLLECTION_ID` — coleção de conteúdos.
- `CRAFT_LIVE_COLLECTION_ID` — estado da projeção.
- `CPOP_CLASS_CODE` — código distribuído à turma.
- `CPOP_TEACHER_KEY` — credencial docente para edição, leitura de respostas e projeção.

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
- Arquivos JS foram verificados sintaticamente, mas esta entrega não substitui uma revisão visual manual nos principais dispositivos.

## Integridade pedagógica

A semana 24 trabalha cultura afro-brasileira e indígena, diversidade de fala e preconceito linguístico. A semana 25 inclui funções da linguagem, textos curtos, tirinhas e memes. A semana 26 aborda inferências, implícitos e resolução justificada de pistas. O editor pode alterar sequência e material sem recriar o site.

O registro técnico original `VALIDACAO-TECNICA` foi mantido; não deve ser interpretado como aluno real nas análises da turma.
