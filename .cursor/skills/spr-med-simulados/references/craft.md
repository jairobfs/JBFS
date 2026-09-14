# Publicar relatório no Craft

Usar quando o usuário pedir: “sobe no Craft”, “salva no MED Craft”, “manda pro Integrado Craft”.

## Namespace

Preferência, nesta ordem:

1. `⌯ MED Craft` — conteúdo médico / simulados
2. `Integrado Craft` — se o usuário indicar workspace Integrado
3. Outro Craft que o usuário nomear

Descobrir schema com `GetDynamicTools` no namespace antes de escrever.

## Comandos típicos

Criar documento:

```text
documents create --title "Relatório — Simulado ENAMED Grupo Integrado — YYYY-MM-DD" --destination unsorted
```

(ou `--folder <folderId>` se houver pasta de simulados)

Preencher corpo (após obter `pageId` / root block):

```text
blocks add --id <pageId> --markdown "<conteúdo markdown do relatório>" --position end
```

Para textos longos: adicionar por seção (Clínica, Cirurgia, Pediatria, GO, Preventiva) em chamadas sequenciais, evitando um único payload enorme.

## Conteúdo a publicar

- Relatório completo (tabelas por seção)
- Status da prova (respondida / finalizada)
- Lista de questões para revisão
- **Sem** credenciais de login

## Após publicar

Devolver ao usuário: título do doc + link/ID retornado pelo Craft + confirmação do namespace usado.
