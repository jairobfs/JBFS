# Plataforma SPR Med — navegação

## URLs

- Home aluno: `https://plataforma.sprmed.com.br/spr/student/home`
- Simulado (padrão): `https://plataforma.sprmed.com.br/spr/student/mock/{uuid}`

## Caminho típico

1. Login (e-mail institucional + senha)
2. Menu lateral / área **Treinamento**
3. **Simulados ENAMED** ou **Meus simulados**
4. Card do simulado pelo título exato
5. Status: `Em andamento`, datas início/fim, modo prova
6. Abrir → interface de questões com:
   - enunciado + alternativas
   - navegador numérico (check verde = respondida)
   - Anterior / Próxima / Finalizar prova / Tutorial
   - timer (modo prova)

## Operação durante a prova

- Selecionar alternativa com clique (confirmar visualmente o estado selecionado)
- Avançar com **Próxima**
- Usar o mapa numérico para pular a não respondidas no fim
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
