import { art, box, ellipse as oval, figure, line, path as p, sinusTrace, words } from './atlas-geometry.js';

const pulse = 'M26 120h43q11-16 24 0h29l11 11 12-60 12 72 11-23h34q26-31 48 0h29l9 10 12-59 13 69 10-20h71';
const capnogram = 'M24 184h56l10-73q3-9 13-9l66-9 7 91h62l10-73q3-9 13-9l95-12 7 94h31';
const timeline = () => art(line(22,197,397,197,'faint'),line(23,56,23,197,'faint'),[70,103,136,169].map(y=>line(24,y,395,y,'grid')).join(''));
const stripTrace = d => art(timeline(),p(d,'signal'));
const measure = (x1,x2,y) => art(line(x1,y,x2,y,'measure'),line(x1,y-6,x1,y+6,'measure'),line(x2,y-6,x2,y+6,'measure'));

function flow(title, plane, source, takeaway, columns) {
  return { title, plane, source, takeaway, columns };
}

export const applied = {
  'puncao-radial': [
    figure('Bolhas e qualidade da amostra', 'Gasometria · inspeção pré-analítica', 'who',
      'Retire bolhas, vede e homogeneíze a amostra conforme o protocolo. Registre a oferta de oxigênio e encaminhe prontamente.',
      art(box(48,80,137,69,'fluid',8),box(232,80,137,69,'fluid',8),
        p('M48 110h-18m155 0h25m22 0h-19m156 0h26','outline'),
        p('M53 115h126v28H53Zm185-16h125v44H238Z','blood'),
        oval(76,103,8,7,'airBubble'),oval(108,95,6,5,'airBubble'),oval(136,104,9,7,'airBubble'),
        line(48,157,185,157,'faint'),line(232,157,369,157,'faint')),
      [[108,97,78,42,'Ar na amostra, a retirar'],[288,124,336,41,'Amostra sem bolhas'],[63,150,89,202,'Seringa apropriada e heparinizada'],[360,117,336,202,'Extremidade vedada']]),
  ],
  eletrocardiograma: [
    figure('Onde medir PR, QRS e QT', 'Traçado sinusal · intervalos esquemáticos', 'openstax',
      'O PR começa no início da P e termina no início do QRS. O QT começa com o QRS e vai até o fim da T.',
      art(stripTrace(sinusTrace),measure(62,126,175),measure(126,169,164),measure(126,245,195)),
      [[80,126,70,57,'Onda P'],[147,89,153,46,'Complexo QRS'],[221,126,279,63,'Onda T'],[90,175,49,222,'Intervalo PR'],[147,164,166,223,'Duração do QRS'],[214,195,291,222,'Intervalo QT']]),
  ],
  cricotireoidostomia: [
    flow('Da falha de oxigenação ao plano de resgate', 'Via aérea difícil · adulto', 'das',
      'CICO significa que não foi possível intubar nem oxigenar. Declare a emergência, acione ajuda e siga o plano de acesso frontal treinado pela equipe.',
      [{title:'Reconhecer', steps:['Intubação falhou', 'Oxigenação não se mantém com as estratégias de resgate']},
       {title:'Agir', steps:['Declarar CICO e acionar ajuda', 'Ativar acesso de emergência pela frente do pescoço', 'Confirmar ventilação por capnografia em onda']}]),
  ],
  'iot-e-drogas': [
    flow('Sequência rápida e função dos fármacos', 'Indução, bloqueio e cuidados pós-IOT', 'sccm',
      'O agente de indução e o bloqueador cumprem funções diferentes. Planeje sedação e analgesia após o procedimento.',
      [{title:'Antes', steps:['Pré-oxigenar', 'Corrigir ameaças à perfusão']},
       {title:'Indução e bloqueio', steps:['Indutor → inconsciência', 'Bloqueador → paralisia']},
       {title:'Depois', steps:['Confirmar com capnografia', 'Fixar, ventilar e iniciar sedoanalgesia']}]),
  ],
  'descontaminacao-gastrica': [
    flow('Quando considerar descontaminação', 'Intoxicação oral aguda', 'charcoal',
      'Carvão ativado é seletivo. Lavagem gástrica é excepcional. Discuta o caso com o CIATox e priorize estabilização.',
      [{title:'Avaliar', steps:['Proteger a via aérea se indicado', 'Identificar agente, tempo e gravidade']},
       {title:'Decidir', steps:['Há benefício esperado para o agente?', 'O risco de aspiração é aceitável?', 'Discutir a indicação com o CIATox']}]),
  ],
  'desfibrilacao-cardioversao': [
    figure('Marcadores de sincronização na onda R', 'Ritmo organizado · monitor esquemático', 'aha',
      'Confira se o desfibrilador reconhece as ondas R. A sincronização procura evitar a descarga na repolarização ventricular.',
      art(stripTrace(pulse),p('M136 57l9-12 9 12Zm155 0 9-12 9 12Z','device'),
        box(196,102,72,49,'hazard',6)),
      [[145,72,86,42,'Onda R'],[300,46,349,59,'Marcador de sincronização'],[225,110,213,214,'Onda T e período de repolarização']]),
    flow('Choque sincronizado ou não sincronizado', 'Emergências cardiovasculares · adulto', 'ahaAlgorithms',
      'A seleção do modo depende do pulso, do ritmo e da instabilidade clínica. Taquicardia ventricular polimórfica sustentada requer choque não sincronizado.',
      [{title:'Com pulso e instabilidade', steps:['Taquiarritmia monomórfica ou organizada', 'Cardioversão sincronizada quando possível']},
       {title:'Sem pulso', steps:['Confirmar FV ou TV sem pulso', 'Desfibrilar e retomar compressões']}]),
  ],
  'pressao-venosa-central': [
    figure('Ondas a, c e v da PVC', 'Curva venosa central · esquema temporal', 'cvp',
      'A onda a reflete a contração atrial. A onda v acompanha o enchimento atrial com a tricúspide fechada. Leia a curva em contexto clínico.',
      art(stripTrace('M25 153h33q21 0 28-38 7-22 20-7l15 30q9 9 16-11 7-16 18-3l21 35q20 16 45 0 20-13 44-31 22-18 41 11l10 26q8 12 29-5h50')),
      [[95,102,74,49,'Onda a · contração atrial'],[147,120,151,70,'Onda c · início da sístole ventricular'],[191,166,179,218,'Descenso x'],[282,119,313,62,'Onda v · enchimento atrial'],[321,171,343,220,'Descenso y']]),
  ],
  'puncao-suprapubica': [
    figure('Bexiga distendida ao ultrassom', 'Imagem estilizada · janela suprapúbica', 'uti',
      'A urina costuma ser anecoica. Confirme a distensão da bexiga e reconheça as estruturas superficiais antes de considerar a coleta.',
      art(box(56,27,310,195,'usFrame'),p('M65 50h290v41H65Z','usWall'),
        p('M118 139q8-34 45-45 42-13 93-3 49 10 55 48-7 44-55 49h-84q-58-7-54-49Z','usTissue'),
        p('M128 141q10-34 46-41 40-8 80 0 41 8 46 41-7 33-43 36h-83q-44-3-46-36Z','usFluid'),
        p('M131 179q86 22 165-1','usLine')),
      [[207,66,65,43,'Parede abdominal anterior'],[207,135,81,123,'Urina anecoica no lúmen'],[277,105,348,77,'Parede vesical'],[221,185,345,208,'Superfície posterior']]),
  ],
  'sondagem-vesical': [
    figure('Drenagem por gravidade', 'Sistema de demora · bexiga, tubo e bolsa', 'catheter',
      'Mantenha a bolsa abaixo da bexiga, a tubulação livre de dobras e o sistema fechado.',
      art(p('M86 55q9-28 41-27 40 0 51 27 10 35-28 51l-15 6v16h-15v-17q-42-16-34-56Z','fluid'),
        oval(129,89,11,7,'device'),p('M129 96v42q0 25 25 25h100q25 0 25 21v12','deviceLine'),
        p('M241 188h78v37h-78Z','device'),pathBag()),
      [[128,89,57,78,'Balão na bexiga'],[175,163,161,213,'Tubulação sem dobras'],[279,214,356,211,'Bolsa abaixo da bexiga']]),
  ],
  pericardiocentese: [
    figure('Derrame e colapso de câmara direita', 'Ecocardiografia estilizada · comparação conceitual', 'pericardium',
      'O colapso diastólico do ventrículo direito é um achado possível no tamponamento. Interprete o eco junto à instabilidade e à perfusão.',
      art(box(36,52,158,144,'usFrame'),box(226,52,158,144,'usFrame'),
        oval(115,124,59,49,'usTissue'),oval(306,124,63,53,'usFluid'),oval(306,124,49,42,'usTissue'),
        oval(91,122,18,27,'usFluid'),oval(134,130,26,30,'usFluid'),p('M273 104l20 5-15 23Z','usFluid'),oval(323,132,25,29,'usFluid'),
        p('M251 104h18m-7-6 7 6-7 6','risk')),
      [[90,125,52,214,'Cavidade direita no esquema à esquerda'],[353,115,364,40,'Derrame no esquema à direita'],[278,112,234,40,'Indentação da parede direita']]),
  ],
  'pcr-rcp': [
    flow('Ciclo inicial da reanimação', 'PCR no adulto · decisão guiada pelo ritmo', 'ahaAlgorithms',
      'Minimize as pausas e reavalie o ritmo em ciclos de cerca de dois minutos. Trate causas reversíveis conforme os achados.',
      [{title:'FV / TV sem pulso', steps:['Choque', 'Retomar RCP imediatamente', 'Reavaliar em cerca de 2 min']},
       {title:'Assistolia / AESP', steps:['RCP e adrenalina conforme algoritmo', 'Investigar causas reversíveis', 'Reavaliar em cerca de 2 min']}]),
  ],
  paracentese: [
    flow('Qual amostra vai para qual exame', 'Líquido ascítico · estações de coleta e análise', 'ascites',
      'Na cirrose, contagem de PMN ≥ 250 células/mm³ sustenta o diagnóstico de peritonite bacteriana espontânea no contexto apropriado.',
      [{title:'Ascite', steps:['Líquido → contagem celular e diferencial', 'Líquido → albumina e proteína total']},
       {title:'Amostras complementares', steps:['Suspeita de infecção → cultura à beira-leito', 'Albumina sérica pareada → cálculo do GASA']}]),
  ],
  toracocentese: [
    figure('Janela pleural ao ultrassom', 'Base pulmonar direita · imagem estilizada', 'pleural',
      'Confirme o líquido pleural acima do diafragma e acompanhe a posição do pulmão ao longo do ciclo respiratório.',
      art(box(49,26,321,200,'usFrame'),p('M57 48h305v29H57Z','usWall'),
        p('M59 80q85 14 138 8 52-11 60 27l-9 31H59Z','usFluid'),
        p('M131 84q40-20 60 4-19 22-72 25l-25-13Z','usTissue'),
        p('M60 154q79-23 186-8 59 6 114-32','usLine'),
        p('M62 160q82-21 184-9 65 5 114-31v96H62Z','usTissue')),
      [[112,64,63,41,'Parede torácica'],[143,100,238,43,'Pulmão adjacente'],[181,123,75,128,'Derrame pleural'],[266,145,371,153,'Diafragma'],[256,183,369,218,'Fígado, abaixo do diafragma']]),
  ],
  'acesso-intraosseo': [
    flow('Validação e vigilância do acesso', 'Acesso intraósseo · segurança', 'io',
      'A passagem de solução com estabilidade do dispositivo e sem edema local apoia a avaliação da posição. Reavalie o sítio durante a infusão.',
      [{title:'Antes de usar', steps:['Conferir estabilidade do dispositivo', 'Avaliar sinais de infiltração e fluxo']},
       {title:'Durante o uso', steps:['Vigiar edema e extravasamento', 'Interromper uso se houver suspeita de complicação']}]),
  ],
  'farmacologia-emergencia': [
    flow('Separar fármacos por situação clínica', 'Algoritmos de suporte avançado · adulto', 'ahaAlgorithms',
      'A escolha depende de pulso, ritmo e estabilidade. Confirme concentração, dose em massa, volume e via antes da administração.',
      [{title:'Parada cardiorrespiratória', steps:['Adrenalina conforme o ritmo e o algoritmo', 'Amiodarona ou lidocaína na FV/TV sem pulso refratária']},
       {title:'Com pulso', steps:['Atropina na bradicardia sintomática quando indicada', 'Adenosina em taquicardia regular selecionada']}]),
    figure('Ler o rótulo e conferir o volume', 'Preparo e comunicação em alça fechada', 'ahaAlgorithms',
      'Relacione a dose prescrita à concentração do rótulo. Verbalize em massa e volume, com as respectivas unidades.',
      art(p('M58 53h61v34l14 14v86H44v-86l14-14Z','device'),box(49,110,79,54,'panel'),
        words(89,133,'mg/mL'),line(63,146,112,146,'faint'),box(214,103,139,40,'fluid',8),
        p('M214 123h-35m174 0h42m-15-12v24m-133-28v16m25-16v12m25-12v16m25-16v12','outline')),
      [[82,133,68,36,'Concentração no rótulo'],[295,122,349,55,'Volume medido na seringa'],[248,117,237,198,'Escala em mL']]),
  ],
  'iot-7-ps': [
    figure('Capnografia em onda', 'Capnograma esquemático durante ventilação', 'das',
      'Uma curva expiratória sustentada confirma ventilação traqueal no contexto apropriado. Avalie o traçado repetidamente após intubar.',
      art(stripTrace(capnogram),words(39,47,'CO₂'),words(363,220,'tempo')),
      [[55,185,55,78,'Linha de base'],[92,110,100,55,'Subida expiratória'],[134,99,140,154,'Platô alveolar'],[167,94,208,52,'ETCO₂ ao fim da expiração'],[356,91,357,49,'Onda sustentada em ciclos sucessivos']]),
  ],
};

function pathBag() { return p('M247 208q28-10 66 0v12h-66Z','fluid'); }
