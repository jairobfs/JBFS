# CP֍P · Repertório aplicado de apps Craft

Referência editorial e funcional para a única aplicação `cpop_online`. A navegação é unificada; cada rota pertence ao mesmo deploy e compartilha o mesmo conteúdo do Craft.

## Padrões já aplicados

| Referência consultada | Princípio adotado no CP֍P | Onde conferir |
| --- | --- | --- |
| [Pomodoro Timer](https://www.craft.do/pt-BR/app-templates/pomodoro-timer) | Alternância foco/pausa, com relógio persistente no navegador | `/estudar.html` |
| [Exam Prep Timer](https://www.craft.do/pt-BR/app-templates/exam-prep-timer) | Sessão cronometrada de 50 minutos | `/estudar.html` |
| [Kanban Board](https://www.craft.do/pt-BR/app-templates/kanban-board) | Visão editorial filtrável por tipo e estado publicado/rascunho; sem fingir arrastar-e-soltar | `/editor.html` |
| [Content Dashboard](https://www.craft.do/pt-BR/app-templates/content-dashboard) | Editor central de conteúdo e busca | `/editor.html` |
| [CRM Dashboard](https://www.craft.do/pt-BR/app-templates/crm-dashboard) | Lista estruturada de estudantes, tentativas e acompanhamento | `/professor.html` |
| [Portfolio Page](https://www.craft.do/pt-BR/app-templates/portfolio-page) | Portfólio pessoal das justificativas realmente entregues | `/estudar.html` |
| [Quiz Maker](https://www.craft.do/pt-BR/app-templates/quiz-maker) | Autoria e edição de enunciados, alternativas, gabaritos e explicações no Craft | `/editor.html` |
| [Grade Tracker](https://www.craft.do/pt-BR/app-templates/grade-tracker) | Desempenho por semana e evolução; sem confundir XP com nota institucional | `/professor.html`, `/estudar.html` |
| [Concept Cards](https://www.craft.do/pt-BR/app-templates/concept-cards) | Conceitos por tema, cartões viráveis e exemplos | `/aula.html`, `/estudar.html` |
| [Student Hub](https://www.craft.do/pt-BR/app-templates/student-hub) | Acesso pessoal a aula, biblioteca, resultados e revisão | `/estudar.html` |
| [Flashcard Deck](https://www.craft.do/pt-BR/app-templates/flashcard-deck) | Cartões de frente/verso armazenados em coleção | `/estudar.html` |
| [Flashcard Library](https://www.craft.do/pt-BR/app-templates/flashcard-library) | Filtro de cartões por semana/assunto | `/estudar.html` |
| [Course Materials](https://www.craft.do/pt-BR/app-templates/course-materials) | Biblioteca em árvore, links para etapas da aula | `/estudar.html` |
| [Lecture Notes Viewer](https://www.craft.do/pt-BR/app-templates/lecture-notes-viewer) | Projeção legível de conceitos, imagens e explicações | `/aula.html` |
| [Course Progress](https://www.craft.do/pt-BR/app-templates/course-progress) | Barras de avanço e checkpoints por semana | `/aula.html`, `/estudar.html` |
| [Student Progress Tracker](https://www.craft.do/templates/student-progress-tracker) | Desempenho individual recuperado do Craft, não da memória do dispositivo | `/estudar.html` |
| [ADDIE Model](https://www.craft.do/pt-BR/templates/addie-model-template) | Organização didática da teoria, prática e avaliação formativa | Sequências S24–S26 |

## Padrões de infraestrutura examinados

- [Documentação de conexão Craft](https://connect.craft.do/api-docs/documents/): leitura e escrita de coleções, propriedades e blocos. A conexão é limitada ao documento do CPOP.
- [craft-cli](https://1ar.io/projects/craft-cli): referência de automação e cache para agentes. O app já usa API oficial server-side; não necessita executar um binário local no dispositivo do aluno.
- [Craft templates](https://www.craft.do/pt-BR/app-templates/quiz-maker): exemplos oficiais descrevem aplicativos React/TypeScript com backend Craft e, opcionalmente, OAuth pessoal. Para CPOP, a arquitetura atual mantém **a conta Craft do educador**, poupando os estudantes de criar contas próprias.

## Materiais com acesso público parcial

- [Exemplo de curso compartilhado](https://documents.craft.me/pBNq1CjUyPWjfH): a versão indexada exige JavaScript e não permitiu auditar os blocos internos; sua organização de curso é apenas inspiração geral, não material copiado.
- [Documento Experts Matter](https://experts-matter-xk7.craft.me/DQ1ceEohcmmmva): não foi possível recuperar conteúdo público confiável; nenhuma funcionalidade específica foi atribuída a ele.
- [URL personalizada da documentação](https://connect.craft.do/link/5HzNeBC8ESF/docs/v1): não acessível pelo mecanismo de pesquisa; a documentação oficial pública equivalente foi consultada.

## O que ainda não está implementado

- Arrastar-e-soltar de cartões no quadro editorial com persistência de posição.
- Notas institucionais com pesos diferenciados e rubricas humanas — XP e acertos não são lançados como notas oficiais.
- Discussão coletiva em tempo real e salas simultâneas; o modo atual transmite uma única etapa via consulta periódica (~8 s).
- Autenticação nominal/SSO de alunos; usamos pseudônimos e código da turma, adequado a prática inicial com minimização de dados, mas não equivalente a login institucional.

Esses elementos devem ser adicionados ao projeto existente, sem abrir um novo site ou uma base de dados concorrente.
