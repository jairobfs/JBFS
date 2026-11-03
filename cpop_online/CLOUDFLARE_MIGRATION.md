# CPOP · preparação da migração Vercel → Cloudflare Workers

A migração é **paralela e reversível**. A Vercel permanece operando, e o Craft continua sendo a fonte canônica para conteúdos, respostas, sessões e revisões. Nenhuma coleção é copiada, removida ou substituída.

## Arquitetura de prévia

- Cloudflare Workers Static Assets serve HTML, CSS, JavaScript e imagens pela pasta gerada `.cloudflare-public/`.
- `cloudflare/worker.mjs` adapta as rotas `/api/*` existentes de `(req, res)` para Fetch `Request/Response` sem alterar o contrato HTTP nem o formato das coleções do Craft.
- Os endpoints `/api/lesson?mini=1`, `/api/lesson?feature=forms`, `/api/people?mode=settings` e `/api/me?mode=notebook` mantêm suas rotas de compatibilidade.
- O pacote estático **não inclui** `api/`, `mini_backend.js`, `forms_backend.js`, `.env*`, testes ou credenciais.
- Não há banco D1 nem duplicação de estado: leituras e escritas continuam diretamente no Craft.

## Validação local ou em CI

Na pasta `cpop_online`:

```sh
npm install
npm run build:cloudflare
node --test tests/app.test.js tests/canon.test.js tests/cloudflare.test.js tests/content-format.test.js tests/editor-authoring.test.js tests/identity.test.js tests/media-routing.test.js tests/minisimulado.test.js tests/notebook.test.js tests/public-cache.test.js
npm run check:cloudflare
```

A GitHub Action `CPOP · Cloudflare · validação` executa testes e `wrangler deploy --dry-run` sem publicar nem usar credenciais do Craft.

## Reconfigurar o Worker `jbfs` existente na conta Cloudflare

O log de importação identifica o Worker `jbfs` e a antiga configuração `Framework: Static / Output Directory: cpop_online`. Essa configuração antiga **não deve continuar**: publicaria o diretório de código-fonte em vez do pacote público isolado.

1. Em **Workers & Pages**, abra o Worker **`jbfs`** existente. Confirme que sua conexão Git aponta para `jairobfs/JBFS` e ajuste-a, se necessário.
2. Configure o diretório raiz como **`cpop_online`** e a branch de implantação como **`feat/cpop-cloudflare-workers`**. Não aponte a produção para `main` enquanto o PR não estiver homologado.
3. Use o build **`npm run build:cloudflare`** e o deploy **`npx wrangler deploy`**. O `wrangler.jsonc` desta branch tem `name: jbfs`, `main: cloudflare/worker.mjs` e publica somente `.cloudflare-public`.
4. Mantenha o endereço de teste `*.workers.dev`; **não configure ainda o domínio dos estudantes**, e não remova o deployment Vercel.
5. Se não for possível selecionar a branch de prévia no painel, interrompa a implantação automática e utilize o fluxo CLI abaixo, executado a partir da branch correta.
6. Insira as credenciais abaixo em **Workers → Settings → Variables and Secrets**, exclusivamente como Secrets:
   - `CRAFT_API_BASE`
   - `CRAFT_API_KEY`
   - `CRAFT_COLLECTION_ID`
   - `CRAFT_CONTENT_COLLECTION_ID`
   - `CRAFT_LIVE_COLLECTION_ID`
   - `CRAFT_REVIEW_COLLECTION_ID`
7. Os códigos docente/discente são validados por hashes mantidos na coleção de acesso do Craft. Não copie PINs ou códigos para arquivos públicos. Não é necessário alterar a coleção existente.
8. Faça primeiro testes **somente de leitura**: `/api/health` com `ready: true`, `/api/lesson`, `/api/lesson?mini=1`, `/aula.html`, `/professor.html` e `/minisimulado.html?modo=aluno`.

Alternativa por CLI autenticado, após o checkout da branch e a instalação de dependências:

```sh
cd cpop_online
npm run build:cloudflare
npx wrangler login
npx wrangler secret put CRAFT_API_BASE
npx wrangler secret put CRAFT_API_KEY
npx wrangler secret put CRAFT_COLLECTION_ID
npx wrangler secret put CRAFT_CONTENT_COLLECTION_ID
npx wrangler secret put CRAFT_LIVE_COLLECTION_ID
npx wrangler secret put CRAFT_REVIEW_COLLECTION_ID
npx wrangler deploy
```

**Nunca** introduza valores reais no GitHub, em tickets, logs ou no terminal como argumentos literais.

## Matriz mínima de homologação (antes de qualquer troca de DNS)

- [ ] Resposta `ready: true` da API de saúde, sem expor a chave Craft.
- [ ] Conteúdos das semanas 24–26, imagens e estilos carregam sem URLs quebradas.
- [ ] Mini-simulado contém 30 questões (15 canônicas, 8 recentes e 7 de revisão incorporadas em 03/11), alternativas, comentários e respostas locais.
- [ ] Acesso de estudante com código da turma; acesso docente somente com PIN.
- [ ] Prévia docente lê resultados e controles de projeção; estudante não recebe gabaritos ocultos.
- [ ] Uma tentativa **técnica autorizada**, com identificador separado, é gravada e relida do Craft; verificar que o reenvio finalizado recebe 409. Remover a tentativa técnica **apenas após revisão do alvo exato**.
- [ ] Alteração docente no Craft aparece no ambiente; edição no Estúdio preserva a proteção contra conflito (409).
- [ ] Criação e sincronização do caderno pessoal, inclusive cookie HttpOnly e retorno bidirecional.
- [ ] Verificações de renderização no iPhone e em desktop.
- [ ] Medição real de CPU/requests durante uma aula com participantes simulados; o plano Free possui apenas 10 ms de CPU por requisição, e o `scryptSync` existente pode exigir Workers Paid ou outra estratégia segura.
- [ ] Confirmar o domínio definitivo e um procedimento de retorno à Vercel.

## Preservação de dados locais

O armazenamento local do navegador e os cookies são separados por origem. Uma migração de `*.vercel.app` para `*.workers.dev` **não transfere automaticamente** rascunhos e conexões privadas do Craft. As respostas já confirmadas na coleção Craft permanecem. Antes de direcionar estudantes ao novo endereço:

- conclua ou exporte cadernos/rascunhos ainda armazenados somente no endereço antigo;
- garanta que notas particulares foram sincronizadas com o Craft;
- explique que o caderno pessoal precisará ser conectado novamente no novo endereço;
- faça a virada preferencialmente entre aulas, não durante uma tentativa.

## Contingência e reversão

A implantação da Vercel **não é modificada, pausada ou excluída** por esta branch. Caso um teste falhe ou a Cloudflare fique indisponível, continue distribuindo o endereço da Vercel. A passagem ao Cloudflare deve ser feita somente após validação de leitura/escrita, desempenho, domínio e comunicação à turma.

A integração não é um canal WebSocket: painéis e projeção continuam utilizando consultas periódicas ao Craft, como antes.

Documentação: https://developers.cloudflare.com/workers/static-assets/migration-guides/vercel-to-workers/
