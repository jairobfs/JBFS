---
name: spr-med-simulados
description: >-
  Acessa, resolve e documenta simulados da plataforma SPR Med (ENAMED e afins)
  com checagem científica, navegação autenticada no browser e relatório
  questão/resposta/justificativa. Use quando o usuário pedir para entrar na
  SPR Med, abrir Treinamento/Meus simulados, resolver simulado ENAMED,
  marcar alternativas na plataforma, gerar relatório de gabarito comentado,
  ou publicar o resultado no Craft (MED/Integrado).
---

# SPR Med — Resolver Simulados

Skill operacional para **entrar na plataforma**, **resolver o simulado** com rigor clínico e **entregar relatório** (e opcionalmente subir no Craft).

## Quando usar

- URL ou menção a `plataforma.sprmed.com.br`
- Pedidos como: “abra o simulado”, “resolva o ENAMED”, “gabarito comentado”, “justificativa científica”
- Continuar um simulado em andamento ou gerar relatório após respostas

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

### 1) Acesso

1. Abrir `https://plataforma.sprmed.com.br/spr/student/home` (ou a URL dada)
2. Login com as credenciais fornecidas pelo usuário
3. Confirmar home do aluno
4. Ir para **Treinamento** → **Meus simulados** / **Simulados ENAMED** (conforme menu)
5. Localizar o simulado pelo título e status (`Em andamento` / disponível)
6. Abrir até a tela inicial ou Q1 só para confirmar acesso, se o pedido for só “entrar”
7. Se o pedido for **resolver**, seguir a seção 2

### 2) Resolução científica

Para **cada** questão:

1. Ler enunciado completo + alternativas (rolar página; analisar imagens/ECG/RX se houver)
2. Raciocinar com medicina baseada em evidência e, quando aplicável, **diretrizes brasileiras** (MS, FEBRASGO, SBC, SBPT, etc.) e estilo ENAMED/INEP
3. Escolher a **melhor** alternativa e **clicar** na UI
4. Ir para a próxima
5. Manter log contínuo (ver schema abaixo)
6. Em dúvida: marcar a mais defensável, confiança `medium`/`low`, e anotar o que falta para certeza

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
