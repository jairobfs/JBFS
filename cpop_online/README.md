# CP֍P · Linguagens em jogo

Plataforma online para as semanas 24–26, com interface mobile-first, correção automática, justificativas textuais e armazenamento das tentativas na coleção do Craft.

## Fluxo

1. A página lê `/api/catalog`, que não expõe o gabarito.
2. O estudante entra com apelido, turma e código fornecido pelo educador.
3. As respostas são enviadas a `/api/submit`; a correção ocorre no servidor.
4. O servidor consulta e adiciona um item na coleção de tentativas do Craft.
5. Somente após confirmação de gravação a tela apresenta a entrega como concluída.
6. O painel `/professor.html` consulta `/api/results`, protegido por chave, e exporta CSV.

**Importante:** este repositório não contém chaves nem URLs privadas. O navegador nunca se comunica diretamente com o Craft. A cópia local das respostas é apenas um rascunho de recuperação, não o registro oficial.

## Variáveis no Vercel

| Variável | Função |
| --- | --- |
| `CRAFT_API_BASE` | URL privada da conexão oficial `https://connect.craft.do/link/<id>/api/v1` |
| `CRAFT_COLLECTION_ID` | `a129558e-4d81-0531-8b07-acf4c126cc7c` |
| `CPOP_CLASS_CODE` | Código compartilhado exclusivamente com a turma (mínimo de 6 caracteres) |
| `CPOP_TEACHER_KEY` | Chave longa e exclusiva do educador (mínimo de 16 caracteres) |

As duas últimas variáveis devem ser geradas aleatoriamente. Não devem entrar no GitHub nem no HTML. A URL da conexão também é uma credencial e deve ficar apenas no ambiente do servidor.

## Coleção no Craft

- Espaço: `CP֍P`
- Documento: `CP֍P · Linguagens · Plataforma de jogos S24–S26`
- ID da coleção: `a129558e-4d81-0531-8b07-acf4c126cc7c`
- Cada item é uma tentativa concluída, com identificador pseudônimo, turma, semana, atividade, pontos, duração, respostas JSON, instante de envio e chave de idempotência.
- As respostas abertas são armazenadas para revisão humana e não recebem pontuação automática adicional.

## Desenvolvimento e verificação

- Node.js 20 ou superior.
- `npm test` usa servidor Craft simulado em memória e não grava dados externos.
- `vercel dev` executa páginas e funções localmente com variáveis privadas de desenvolvimento.
- Para publicação, configurar projeto Vercel com diretório raiz `cpop_online` e integração GitHub.
- Verificar `/api/health` e realizar uma tentativa de teste real antes de convidar estudantes.

## Privacidade e integridade

- Não solicitar nome completo ou e-mail dos estudantes.
- Não expor gabaritos no catálogo público.
- Não aceitar resultados calculados no navegador.
- Não marcar envio como concluído em caso de falha do Craft.
- Não exportar o CSV de resultados em máquina compartilhada sem cuidado.
- O código da turma é uma barreira simples contra uso casual, não um sistema de autenticação de identidade forte.

## Referências curriculares

- BNCC: EF69LP55 e EM13LGG402, diversidade e variação linguística.
- Lei nº 11.645/2008, história e cultura afro-brasileira e indígena.
