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

Produção: https://cpop-linguagens-jairobfs7-1343s-projects.vercel.app/

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

Cada etapa da sala de aula oferece anotação livre e marcação para revisão. O botão **Caderno** reúne os registros por semana, permite voltar a uma etapa e exporta um arquivo Markdown. Esses apontamentos pertencem ao navegador/dispositivo do estudante: **não são enviados ao Craft**, não sincronizam entre aparelhos e podem desaparecer se o navegador apagar os dados locais. A coleta de respostas avaliativas continua sendo feita exclusivamente pelo backend no Craft quando há identificação e envio confirmado.

Selecionar uma alternativa agora atualiza a etapa sem reconstruir a tela, preservando a posição, o foco e a área de texto; em desafios da semana 26, o progresso das portas e o bloqueio de navegação são recalculados. Há atalhos de resposta A–D no desktop quando o foco não está em um campo de edição.

## Variáveis no Vercel

- `CRAFT_API_BASE` — endereço privado da conexão Craft.
- `CRAFT_API_KEY` — chave privada server-side.
- `CRAFT_COLLECTION_ID` — coleção de tentativas.
- `CRAFT_CONTENT_COLLECTION_ID` — coleção de conteúdos.
- `CRAFT_LIVE_COLLECTION_ID` — estado da projeção.
- `CRAFT_REVIEW_COLLECTION_ID` — avaliações espaçadas dos cartões.
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
- Código de revisão de cartões e análise docente verificado sintaticamente; rota pública `/api/review` rejeita código de turma inválido com HTTP 403. A escrita de uma avaliação real ainda exige um teste de ponta a ponta com participante autorizado.
- Arquivos JS foram verificados sintaticamente, mas esta entrega não substitui uma revisão visual manual nos principais dispositivos.
- Implantações Vercel podem ficar atrasadas por limite diário de uso; distinguir o código do repositório da versão atualmente respondendo no domínio.

## Integridade pedagógica

A semana 24 trabalha cultura afro-brasileira e indígena, diversidade de fala e preconceito linguístico. A semana 25 inclui funções da linguagem, textos curtos, tirinhas e memes. A semana 26 aborda inferências, implícitos e resolução justificada de pistas. O editor pode alterar sequência e material sem recriar o site.

O registro técnico original `VALIDACAO-TECNICA` foi mantido; não deve ser interpretado como aluno real nas análises da turma.
