---
name: spr-med-simulados
description: >-
  Acessa a plataforma SPR Med para resolver simulados ENAMED, iniciar/continuar
  Trilha Inteligente e banco de questões, cumprir meta semanal (Questões na
  Semana), e gerar relatório questão/resposta/justificativa. Use quando o
  usuário pedir SPR Med, Treinamento, Meus simulados, trilhas, meta da semana,
  gabarito comentado, ou publicar no Craft (MED/Integrado).
---

# SPR Med — Resolver Simulados e Trilhas

Skill operacional para **entrar na plataforma**, **cumprir meta de questões**,
**iniciar/continuar trilhas**, **resolver simulados** com rigor clínico e
**entregar relatório** (e opcionalmente subir no Craft).

## Quando usar

- URL ou menção a `plataforma.sprmed.com.br`
- Pedidos como: “abra o simulado”, “resolva o ENAMED”, “gabarito comentado”,
  “justificativa científica”, “trilha”, “meta da semana”, “Questões na Semana”
- Continuar simulado/trilha em andamento ou gerar relatório após respostas

## Não fazer

- **Não** gravar credenciais nesta skill, no git ou em artefatos commitados
- **Não** finalizar/enviar a prova sem pedido explícito do usuário
- **Não** inventar enunciados: ler o stem completo na UI (incluindo imagens)
- **Não** pular questões; se travar, registrar e retomar
- **Não** responder no chat com senha em claro além do necessário para o agente de browser

## Pré-requisitos

1. Credenciais do aluno (pedir se não forem fornecidas nesta conversa)
2. Nome exato do simulado (ex.: `Simulado ENAMED Grupo Integrado — 11/09/2026`)
3. Agente `computerUse` para navegação autenticada
4. Opcional: Craft (`⌯ MED Craft` ou `Integrado Craft`) se o usuário pedir para publicar

## Fluxo (obrigatório)

### 0) Meta semanal (quando aplicável)

No home, ler o card **Questões na Semana** (ex.: `142 / Meta: 560`).

- Baseline no início da sessão e de novo no fim
- Priorizar atividades que **incrementam** esse contador: **Trilha Inteligente**, banco/questões de treino, trilhas iniciadas
- Meta do usuário = cumprir a meta; continuar em lotes até zerar o déficit ou o usuário parar
- Reportar: respondidas na sessão, total atual, faltam para a meta

### 1) Acesso

1. Abrir `https://plataforma.sprmed.com.br/spr/student/home` (ou a URL dada)
2. Login com as credenciais fornecidas pelo usuário
3. Confirmar home do aluno e (se pedido) o card da meta
4. Conforme o objetivo:
   - **Simulado:** Treinamento → Meus simulados / Simulados ENAMED → título exato
   - **Meta / treino:** abrir **Trilha Inteligente** (iniciar ou continuar) e outras trilhas disponíveis; usar banco de questões se a trilha esgotar
5. Em simulado: abrir até Q1 só para confirmar acesso, se o pedido for só “entrar”
6. Se o pedido for **resolver** / **cumprir meta**, seguir a seção 2

### 2) Resolução científica (análise OBRIGATÓRIA antes de marcar)

**Proibido** chute, clique por instinto ou “fallback” sem ler o enunciado.
Preferir menos questões bem analisadas a volume com erro.

Para **cada** questão, nesta ordem:

1. **Ler** enunciado completo + todas as alternativas (rolar; abrir imagens/ECG/RX/tabelas)
2. **Extrair** dados-chave: idade/sexo, tempo de doença, alarmes, comorbidades, exames decisivos
3. **Definir** o que a questão pede (diagnóstico vs. próximo passo vs. tratamento vs. prevenção)
4. **Eliminar** alternativas incompatíveis (contraindicação, tempo errado, outra doença)
5. **Confirmar** a melhor opção com MBE e, quando aplicável, **diretrizes brasileiras** (MS, FEBRASGO, SBC, SBPT, etc.) e estilo ENAMED/INEP
6. Só então **marcar** na UI → em Trilha/treino clicar **Responder** (obrigatório para contar) → avançar; em modo prova, seguir a UI (marcar → próxima)
7. Manter log (schema abaixo) — em lotes de meta, log por tema ok; gabarito completo se o usuário pedir
8. Em dúvida real: opção mais defensável + confiança `medium`/`low` + motivo — **nunca** aleatório

Se o stem estiver ilegível/UI quebrada: não marcar; registrar bloqueio e mudar de questão/seção.

**Heurísticas ENAMED úteis:**
- Preferir conduta do MS/SUS quando houver conflito com guideline internacional
- Sepse: antibiótico na 1ª hora; pacotes Surviving Sepsis adaptados ao contexto BR
- Obstetrícia: protocolos MS/FEBRASGO (HIV, RPM, corioamnionite, herpes a termo)
- Preventiva: rastreios do MS (mamografia, etc.), SINAN/Notivisa, APS/ESF, prevenção quaternária
- Cirurgia: estabilizar → operar quando houver isquemia/perfuração/estrangulamento
- Pediatria: suporte > fármaco inespecífico (ex.: bronquiolite); calendário vacinal BR

### 3) Controles de execução

- Exames longos (~100Q): processar em lotes; **nunca** entregar só metade sem dizer o que falta
- Se deslogar: relogar e retomar pela navegação de questões / “em andamento”
- Screenshots: a cada ~10 questões, em imagens diagnósticas críticas, e no mapa final de conclusão
- **Não** clicar em Finalizar prova até o usuário pedir
- Ao terminar as respostas: verificar no mapa que **todas** estão marcadas

### 4) Entrega

Sempre entregar:

1. Status (N respondidas / total; finalizado ou não)
2. Relatório por questão (ou por seção se o usuário pedir resumo)
3. Lista de incertezas (`medium`/`low`)
4. Próximo passo possível: revisar dúvidas, finalizar prova, ou publicar no Craft

Formato detalhado: [references/relatorio.md](references/relatorio.md)  
Publicação Craft: [references/craft.md](references/craft.md)  
Mapa de navegação UI: [references/plataforma.md](references/plataforma.md)

## Schema do log por questão

```text
Q{n} | {especialidade/tema}
Resposta: {letra} — {texto curto da alternativa}
Justificativa: {2–5 frases; critério diagnóstico/conduta; por que as outras falham se relevante}
Confiança: high | medium | low
```

## Orquestração de agentes

- Usar `computerUse` com prompt que inclua: URL, credenciais da conversa, título do simulado, regras (não finalizar, log completo, screenshots)
- Em provas longas: retomar o mesmo `computerUse` (`resume`) pedindo só o lote restante + log delta
- Compilar o relatório final no agente principal (PT-BR, direto, tabelas por seção)

## Critérios de qualidade

- Cada resposta deve ter justificativa clínica auditável
- Diretriz BR citada quando for o diferencial da questão
- Relatório final cobre **100%** das questões respondidas
- Credenciais nunca vão para commit/Craft público sem pedido explícito
