# Plataforma SPR Med — navegação

## URLs

- Home aluno: `https://plataforma.sprmed.com.br/spr/student/home`
- Simulado (padrão): `https://plataforma.sprmed.com.br/spr/student/mock/{uuid}`

## Caminho típico

1. Login (e-mail institucional + senha)
2. Home: card **Questões na Semana** (progresso / meta)
3. Menu lateral:
   - **Trilha Inteligente** — treino contínuo que conta para a meta
   - **Treinamento** → **Simulados ENAMED** / **Meus simulados**
   - Outras trilhas / banco de questões, se visíveis
4. Simulado: card pelo título; status `Em andamento`; modo prova + timer
5. Interface de questões:
   - enunciado + alternativas
   - navegador numérico (check verde = respondida)
   - Anterior / Próxima / **Responder** (trilhas) / Finalizar / Tutorial

## Operação

### Trilha / banco (meta semanal)

- Selecionar alternativa → clicar **Responder** (sem isso a questão pode não contar)
- Só então avançar
- Se a trilha reiniciar em Q1 já respondidas, pular via mapa ou mudar de seção/módulo
- Iniciar trilhas novas com **Iniciar** quando o usuário pedir volume/meta

### Simulado (modo prova)

- Selecionar alternativa e avançar com **Próxima**
- Usar o mapa numérico para não respondidas no fim
- **Finalizar prova** só com autorização explícita do usuário

## Falhas comuns

| Sintoma | Ação |
|--------|------|
| Sessão expirada | Relogar e reabrir o mesmo simulado |
| Alternativa não marca | Scroll, reclicar, verificar overlay/modal |
| Imagem ilegível | Ampliar/screenshot e descrever achados antes de responder |
| Timer acabando | Priorizar questões em branco; manter rigor nas restantes |

## Segurança

- Credenciais só em memória da sessão / prompt do `computerUse`
- Não colar senha em documentos Craft, commits ou PRs
