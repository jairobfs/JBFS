# PROMPT DE CONTINUIDADE · CPOP — Cloudflare Workers `jbfs`

**Edição:** 03/11/2026  
**Responsável:** Jairo Batista Ferreira Silva (JBFS)  
**Projeto:** CPOP — Campo Mourão · Linguagens  
**Missão:** concluir a migração do CPOP atual da Vercel para o Worker Cloudflare já importado como `jbfs`, preservando Craft como base canônica e Vercel como contingência, sem criar outro Worker.

## 1. Contrato e limites

Você está continuando um projeto real já modificado e testado. Não reconstrua tudo nem alegue que a Cloudflare já foi publicada. Não faça merge, remova projeto antigo, altere DNS, exclua conteúdo Craft, mude códigos de acesso ou copie dados/credenciais para arquivos públicos antes da homologação.

Reutilize o Worker existente **`jbfs`**. O log inicial de 03/11/2026 mostra `Worker Name: jbfs`, `Framework: Static` e `Output Directory: cpop_online`. A detecção inicial foi inadequada: a pasta `cpop_online` contém arquivos internos. É necessário empacotar apenas `.cloudflare-public`.

Acesso Cloudflare: o usuário consegue entrar normalmente em seu Safari no iPhone. O navegador de trabalho do ChatGPT retorna `POST https://dash.cloudflare.com/api/v4/login → HTTP 403`, portanto não possui sessão autenticada reutilizável. Não repita credenciais nem tente contornar esse bloqueio. Se a integração do navegador local estiver disponível com autorização do usuário, utilize-a. Caso contrário, peça somente a configuração indispensável dentro da sessão Safari, sem solicitar que ele envie segredos ou senhas no chat.

## 2. Estado real confirmado

- Repositório: `jairobfs/JBFS`.
- Branch: `feat/cpop-cloudflare-workers`.
- Pull request em rascunho, ainda sem merge: https://github.com/jairobfs/JBFS/pull/4
- Commit de referência em 03/11/2026: `10f40c236ce6b71cddaea6595acda929e6f35731`. Sempre conferir o HEAD atualizado antes de agir.
- `cpop_online/wrangler.jsonc`: `name: jbfs`; `main: ./cloudflare/worker.mjs`; `compatibility_date: 2026-11-03`; `assets.directory: ./.cloudflare-public`; `assets.binding: ASSETS`; `assets.run_worker_first: ['/api/*']`.
- `cpop_online/cloudflare/worker.mjs` adapta as 12 rotas CPOP/Vercel para Workers.
- `cpop_online/scripts/build-cloudflare.js` gera os arquivos estáticos permitidos e exclui o backend, segredos e testes.
- `cpop_online/scripts/smoke-cloudflare.js` executa o Worker localmente sem credenciais e testa HTML, saúde, 404 e 415.
- Corrigida a invalidação do cache de conteúdo após edição no Craft, incluindo leituras antigas ainda em andamento.
- Sincronizado o mini-simulado de `main`: **30 questões**, sendo 15 do cânone, 8 recentes e 7 de revisão incorporadas em 03/11.
- Duas validações GitHub Actions aprovadas, incluindo suíte completa, teste do editor, teste da corrida de cache, pacote Wrangler em dry-run e runtime local:
  - https://github.com/jairobfs/JBFS/actions/runs/41615445195
  - https://github.com/jairobfs/JBFS/actions/runs/41615445162
- O domínio dos estudantes, a implantação Vercel e os dados do Craft permanecem sem alteração.
- **Não há confirmação de deploy real na conta Cloudflare nem de URL pública `workers.dev`.**

## 3. Etapa pendente prioritária: configurar `jbfs` na Cloudflare

Na conta Cloudflare autenticada, verificar primeiro se `Workers & Pages → jbfs` é o projeto proveniente de `jairobfs/JBFS`. Não sobrescrever se estiver atendendo outro aplicativo; usar evidências do painel/deploys para confirmar.

Em **Settings → Builds** ou a seção equivalente atual:

| Campo | Valor esperado |
|---|---|
| Worker | `jbfs` |
| GitHub | `jairobfs/JBFS` |
| Branch de implantação para homologação | `feat/cpop-cloudflare-workers` |
| Root directory | `cpop_online` |
| Build command | `npm run build:cloudflare` |
| Deploy command | `npx wrangler deploy` |
| Arquivos estáticos publicados | somente `.cloudflare-public`, conforme `wrangler.jsonc` |

Se a Cloudflare não permitir selecionar essa branch como produção do Worker existente, não force `main` sem merge validado; inspecione as opções oficiais de branch, build preview ou implantação autenticada por CLI. A meta é primeiro obter uma URL `workers.dev` homologável, sem alterar o domínio de uso da turma.

Documentação oficial:
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/
- https://developers.cloudflare.com/workers/configuration/secrets/

## 4. Secrets Craft — não expor valores

Verificar e cadastrar como **Secrets** (nunca como strings no GitHub ou em respostas de chat):

- `CRAFT_API_BASE`
- `CRAFT_API_KEY`
- `CRAFT_COLLECTION_ID`
- `CRAFT_CONTENT_COLLECTION_ID`
- `CRAFT_LIVE_COLLECTION_ID`
- `CRAFT_REVIEW_COLLECTION_ID`

Obter os valores de configurações já autorizadas do projeto anterior ou da integração Craft canônica. Não inventar IDs, substituir coleções ou copiar dados. Se não houver autoridade para ler/cadastrar um segredo, solicitar ao usuário apenas a operação mínima na interface segura, nunca o valor em texto.

Os códigos docente/discente são validados pelos hashes no Craft. Não publicar PIN ou código no JavaScript do cliente.

## 5. Homologação antes do uso por alunos

1. Recuperar e registrar a URL `https://jbfs.<subdomínio-da-conta>.workers.dev` **observada no painel**; não adivinhar subdomínio.
2. Confirmar que `/aula.html`, `/professor.html`, `/minisimulado.html?modo=aluno`, `/minisimulado.html?modo=professor`, `/minisimulado.html?modo=projecao` carregam corretamente.
3. Confirmar que arquivos de backend não são servidos como código-fonte (por exemplo `/api/_craft.js`, `/mini_backend.js`, `/.env` devem estar indisponíveis).
4. Testar `/api/health` com `ready: true`, sem divulgar credenciais.
5. Testar somente leituras do Craft: `/api/lesson`, `/api/lesson?mini=1`, listas e painéis. Confirmar 30 questões no mini-simulado, imagens, fonte e paleta.
6. Confirmar autenticação docente e acesso discente, preservando os controles atuais; o gabarito oculto não pode vazar para estudantes.
7. Somente após autorização específica, realizar escrita técnica identificável no Craft e releitura; identificar o registro exato antes de qualquer limpeza.
8. Testar edições bidirecionais, conflitos 409, painel, projeção, rascunhos e caderno pessoal.
9. Testar no iPhone e desktop, incluindo modos claro/escuro.
10. Medir CPU e latência reais da autenticação com `scryptSync`. A documentação atual limita Workers Free a 10 ms de CPU por requisição; não alterar a função de derivação/hash sem plano seguro. Caso haja erro 1102, apresentar alternativa com custos e riscos antes de executar.

## 6. Contingência e virada

- O Craft continua como fonte canônica, sem novo banco de dados.
- A Vercel fica ativa e acessível; não remover ou redirecionar durante a homologação.
- `localStorage` e cookies não migram automaticamente entre `vercel.app` e `workers.dev`. Orientar estudantes a concluir ou exportar rascunhos locais antes de trocar a URL; reconectar cadernos privados no novo endereço.
- Validar segurança, sincronização, limites e disponibilidade antes de considerar merge do PR ou domínio definitivo.
- Registrar resultado de cada teste, falhas reproduzíveis, URL exata e opção de retorno imediato à Vercel.

## 7. Critério de entrega

Entregar link público real do Worker `jbfs` com API e conteúdo funcionando, lista objetiva de testes executados, situação de Secrets apenas por presença/ausência (sem valores), eventuais pendências e confirmação de que a Vercel/Craft permanecem preservados. Não marcar deploy como concluído por causa de `wrangler deploy --dry-run` ou de testes locais.

**Ação imediata do próximo agente:** verificar o estado do `jbfs` na Cloudflare, corrigir configuração Git/branch/root/build/deploy no painel autenticado ou por integração oficial autorizada, cadastrar Secrets com segurança, implantar e realizar a primeira homologação de leitura. Se a sessão privada continuar inacessível, parar nesse ponto e solicitar somente o acesso/handoff estritamente necessário.
