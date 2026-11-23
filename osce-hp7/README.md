# OSCE · Prática HP7

Simulador estático de Habilidades Médicas VII com 17 estações, checklists e cenários fictícios, cronômetro de 5, 7 ou 10 minutos, banco de ritmos de ECG e painel de causas reversíveis da PCR. A busca aceita termos com ou sem acentos. As marcações ficam no navegador e o tempo de treino fica na sessão da aba.

## Executar

Na raiz do repositório, execute `python3 -m http.server 8000` e acesse `http://localhost:8000/osce-hp7/`. Em um host estático, publique o mesmo caminho e preserve `assets/habilidades-medicas-vii/mnemonics/` junto ao projeto para carregar as ilustrações. O site usa caminhos relativos e dispensa compilação, backend e dependências externas.

## Editar estações

Os cenários, checklists, pontos de revisão e referências estão em `stations.js`. Os traçados esquemáticos e as causas reversíveis estão em `clinical.js`. Cada estação usa um identificador estável para links e marcações. Preserve a ordem dos itens existentes ao editar redação e incremente a versão da chave de progresso quando substituir a estrutura dos checklists.

## Escopo acadêmico

Os checklists foram redigidos para prática e autoavaliação com cenários originais. As referências clínicas ficam na própria estação, incluindo as diretrizes de reanimação da AHA 2025 e de via aérea da DAS 2025. A pontuação corresponde aos itens de prática marcados pelo estudante.
