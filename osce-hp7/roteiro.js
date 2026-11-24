export const examGroups = {
  oficial: 'Oficiais',
  procedimentos: 'Demais procedimentos',
  complementar: 'Complementares',
};

export const teachers = {
  bruno: 'Bruno',
  ricardo: 'Ricardo',
  vitor: 'Vitor',
};

export const examStations = {
  'puncao-radial': ['oficial', 'bruno', 7],
  eletrocardiograma: ['oficial', 'ricardo', 4],
  cricotireoidostomia: ['oficial', 'vitor', 5],
  'puncao-lombar': ['oficial', 'vitor', 5],
  'iot-e-drogas': ['oficial', 'ricardo', 4],
  'descontaminacao-gastrica': ['oficial', '', 7],
  'desfibrilacao-cardioversao': ['procedimentos', 'bruno', 7],
  'pressao-venosa-central': ['procedimentos', 'bruno', 7],
  'puncao-suprapubica': ['procedimentos', 'bruno', 7],
  'sondagem-vesical': ['procedimentos', 'bruno', 8],
  pericardiocentese: ['procedimentos', 'ricardo', 7],
  'pcr-rcp': ['procedimentos', 'ricardo', 7],
  paracentese: ['procedimentos', 'vitor', 8],
  toracocentese: ['procedimentos', 'vitor', 9],
  'acesso-intraosseo': ['procedimentos', 'vitor', 8],
  'farmacologia-emergencia': ['complementar', 'ricardo', 5],
  'iot-7-ps': ['complementar', 'ricardo', 6],
};

export const examCases = {
  'iot-e-drogas': {
    title: 'Edema pulmonar hipertensivo e via aérea',
    prompt: 'Paciente com PA de 218/124 mmHg, dispneia abrupta e estertores bilaterais evolui com rebaixamento da consciência. Verbalize a hipótese, escolha o tratamento inicial e demonstre no manequim como confirmaria a posição do tubo.',
    answer: 'O quadro sugere emergência hipertensiva com edema pulmonar agudo. Se a pressão e o contexto permitirem, a nitroglicerina IV titulável é uma opção para o edema pulmonar hipertensivo. Se houver necessidade de IOT, confirme o tubo com capnografia em onda e complemente com exame clínico e avaliação de profundidade.',
    refs: ['hypertension', 'heartFailure', 'das'],
  },
  'farmacologia-emergencia': {
    title: 'Escolha entre vasopressor, inotrópico e vasodilatador',
    prompt: 'Compare três pacientes: um com baixo débito e hipoperfusão persistente, outro com hipotensão grave e um terceiro com edema pulmonar hipertensivo. Qual efeito hemodinâmico você busca em cada um?',
    answer: 'Para baixo débito e hipoperfusão, considere suporte inotrópico após avaliar pressão e fatores reversíveis. Na hipotensão grave do choque cardiogênico, a noradrenalina pode sustentar a pressão de perfusão. Em edema pulmonar hipertensivo, a vasodilatação IV titulada pode reduzir as pressões de enchimento e a pós-carga.',
    refs: ['heartFailure', 'hypertension'],
  },
};

export const examTables = {
  'desfibrilacao-cardioversao': {
    title: 'Ritmo, modo e energia inicial no adulto',
    columns: ['Situação', 'Modo', 'Energia inicial'],
    rows: [
      ['FA ou flutter com instabilidade atribuível à arritmia', 'Sincronizado', '200 J (bifásico)'],
      ['Taquicardia regular de QRS estreito com instabilidade', 'Sincronizado', '100 J'],
      ['TV monomórfica instável com pulso', 'Sincronizado', '100 J'],
      ['TV polimórfica sustentada', 'Não sincronizado', 'Choque de alta energia conforme aparelho'],
      ['FV ou TV sem pulso', 'Não sincronizado', 'Bifásico conforme fabricante. Se desconhecido, energia máxima disponível. Monofásico: 360 J.'],
    ],
    note: 'Confira se o aparelho marcou as ondas R antes da cardioversão e se o modo precisa ser reativado após o choque.',
    refs: ['aha', 'ahaAlgorithms'],
  },
  'pressao-venosa-central': {
    title: 'Como interpretar uma PVC alta ou baixa',
    columns: ['Leitura', 'Possibilidades', 'O que conferir'],
    rows: [
      ['Elevada', 'Congestão venosa, disfunção ventricular direita, pressão intratorácica elevada ou tamponamento.', 'Curva, nível do transdutor, ventilação, perfusão e ecocardiografia conforme o quadro.'],
      ['Baixa', 'Baixa pressão atrial direita, depleção de volume ou venodilatação.', 'Tendência, perfusão e avaliação dinâmica quando a resposta a fluidos for a dúvida.'],
    ],
    note: 'Leia ao fim da expiração e registre posição e suporte ventilatório. A PVC isolada tem utilidade limitada para prever resposta a volume.',
    refs: ['cvp'],
  },
  'sondagem-vesical': {
    title: 'Cateterismo uretral no adulto',
    columns: ['Etapa', 'Anatomia feminina', 'Anatomia masculina'],
    rows: [
      ['Exposição', 'Afaste os lábios e identifique o meato à frente do introito vaginal.', 'Exponha o meato. Se houver prepúcio, retraia apenas o necessário.'],
      ['Inserção', 'Se a sonda entrar na vagina, use uma nova sonda estéril para a próxima tentativa.', 'Avance suavemente até a bifurcação quando compatível com o cateter, antes de insuflar.'],
      ['Balonete e fixação', 'Confirme drenagem e posição intravesical antes de insuflar.', 'Confirme drenagem e posição intravesical antes de insuflar. Recoloque o prepúcio ao finalizar.'],
    ],
    note: 'Em ambas as técnicas, mantenha sistema fechado e bolsa abaixo da bexiga.',
    refs: ['catheter', 'catheterFemale'],
  },
  paracentese: {
    title: 'GASA e proteína total do líquido ascítico',
    columns: ['GASA', 'Proteína ascítica', 'Hipótese a investigar'],
    rows: [
      ['≥ 1,1 g/dL', '< 2,5 g/dL', 'Hipertensão portal por cirrose é uma causa frequente.'],
      ['≥ 1,1 g/dL', '≥ 2,5 g/dL', 'Considere ascite cardíaca no contexto adequado.'],
      ['< 1,1 g/dL', 'Interpretar conforme o quadro', 'Investigue causas peritoneais ou pancreáticas, entre outras.'],
    ],
    note: 'GASA = albumina sérica − albumina ascítica, em amostras pareadas.',
    refs: ['ascites', 'ascitesProtein'],
  },
  toracocentese: {
    title: 'Critérios de Light',
    columns: ['Medida', 'Limiar para exsudato'],
    rows: [
      ['Proteína pleural ÷ proteína sérica', '> 0,5'],
      ['LDH pleural ÷ LDH sérica', '> 0,6'],
      ['LDH pleural', '> ⅔ do limite superior de referência da LDH sérica'],
    ],
    note: 'Um único critério positivo classifica o derrame como exsudato. Interprete com o contexto, principalmente após diuréticos na insuficiência cardíaca.',
    refs: ['light'],
  },
  'farmacologia-emergencia': {
    title: 'Vasopressores, inotrópicos e vasodilatadores',
    columns: ['Fármaco', 'Contexto de uso', 'O que monitorar'],
    rows: [
      ['Noradrenalina', 'Suporte de pressão na hipotensão grave do choque cardiogênico.', 'Pressão de perfusão e resposta clínica.'],
      ['Dobutamina', 'Suporte inotrópico em baixo débito com hipoperfusão, conforme a pressão arterial.', 'Arritmias, frequência e queda de pressão.'],
      ['Nitroglicerina', 'Vasodilatação em edema pulmonar hipertensivo com pressão que permita titulação.', 'Pressão arterial e resposta respiratória.'],
      ['Nitroprussiato', 'Redução de pré e pós-carga em situações selecionadas com monitorização intensiva.', 'Hipotensão e risco de toxicidade com uso prolongado ou altas doses.'],
    ],
    refs: ['heartFailure', 'hypertension', 'nitroprusside'],
  },
};

export const extraChecks = {
  'puncao-radial': [
    'Demonstre no simulador a palpação proximal ao ponto de coleta e verbalize a orientação do bisel.',
  ],
  eletrocardiograma: [
    'Em dois traçados distintos, verbalize separadamente o diagnóstico e a conduta para a taquiarritmia e para a bradiarritmia.',
  ],
  cricotireoidostomia: [
    'Na simulação por cânula, explique como verificaria o acesso à luz da via aérea e avaliaria ventilação e oxigenação após conectar o dispositivo do protocolo.',
  ],
  'puncao-lombar': [
    'Use as cristas ilíacas como referência de superfície, verbalize os planos da via mediana e explique como reconhece o acesso ao espaço subaracnóideo.',
  ],
  'iot-e-drogas': [
    'No cenário hipertensivo, identifique a lesão aguda de órgão-alvo e justifique a escolha do vasodilatador.',
    'Confira iluminação, lâmina e integridade do cuff no manequim. Após passar o tubo, complemente a capnografia com avaliação da expansão torácica e ausculta.',
  ],
  'descontaminacao-gastrica': [
    'No manequim, explique como monitoraria a aspiração e o retorno em cada ciclo de uma lavagem já indicada pela equipe. Encerre se houver perda da proteção da via aérea ou piora clínica.',
  ],
  'desfibrilacao-cardioversao': [
    'Demonstre o posicionamento anterolateral e o anteroposterior das pás adesivas no manequim.',
  ],
  'pressao-venosa-central': [
    'Explique como infusões no lúmen de medida ou conexões inadequadas podem distorcer a curva. Preserve o suporte vasoativo em via apropriada.',
  ],
  'puncao-suprapubica': [
    'Mostre a relação entre a sínfise púbica, a bexiga cheia e o peritônio. Reavalie por imagem antes de uma nova tentativa sem retorno.',
  ],
  'sondagem-vesical': [
    'Compare os marcos de identificação do meato e a confirmação de posição nas anatomias feminina e masculina.',
  ],
  pericardiocentese: [
    'Nomeie os componentes da tríade de Beck e explique por que sua apresentação incompleta é compatível com tamponamento.',
  ],
  'pcr-rcp': [
    'Demonstre uma checagem de ritmo rápida entre ciclos e a retomada imediata das compressões quando indicada.',
  ],
  paracentese: [
    'Calcule o GASA em um exemplo com albuminas pareadas e interprete o resultado junto à proteína ascítica.',
  ],
  toracocentese: [
    'Calcule os três critérios de Light em um exemplo e identifique qual medida classifica o líquido como exsudato.',
  ],
  'acesso-intraosseo': [
    'Aponte a tuberosidade e a face anteromedial da tíbia no manequim. Identifique o trajeto que deve evitar a fise em pacientes pediátricos.',
  ],
  'farmacologia-emergencia': [
    'Diferencie o objetivo de elevar a pressão de perfusão, aumentar o débito cardíaco ou reduzir a pós-carga antes de escolher o fármaco.',
  ],
  'iot-7-ps': [
    'Teste a integridade do balonete antes da tentativa e substitua a cânula se houver perda de pressão no teste.',
  ],
};
