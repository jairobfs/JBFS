const rhythms = [
  ['sinus-tach', 'Taquicardia sinusal', '120 bpm', 'P antes de cada QRS estreito, PR constante e RR regular.', 'Procure a causa do aumento da frequência, como febre, hipovolemia, dor ou hipoxemia.'],
  ['svt', 'TSV paroxística', '176 bpm', 'QRS estreito e RR regular. A onda P pode ficar oculta no QRS.', 'Avalie estabilidade. No paciente estável com taquicardia regular estreita, considere manobras vagais e adenosina quando apropriadas.'],
  ['af', 'Fibrilação atrial', 'RR variável', 'Intervalos RR irregularmente irregulares e ausência de ondas P discretas.', 'Correlacione sintomas, duração e estabilidade. Instabilidade atribuível à arritmia exige cardioversão urgente.'],
  ['flutter', 'Flutter atrial', '150 bpm', 'Ondas F serrilhadas. No traçado, a condução 2:1 produz resposta ventricular regular.', 'Uma taquicardia estreita regular perto de 150 bpm deve levantar a hipótese de flutter 2:1.'],
  ['vt', 'TV monomórfica', '160 bpm', 'Complexos largos e de morfologia semelhante, com RR regular.', 'Confirme pulso imediatamente. Com pulso e instabilidade, sincronize a cardioversão. Sem pulso, siga o ramo chocável da PCR.'],
  ['sinus-brady', 'Bradicardia sinusal', '48 bpm', 'Onda P sinusal antes de cada QRS, com intervalos RR regulares e mais longos.', 'A intensidade dos sintomas e os sinais de hipoperfusão orientam a urgência.'],
  ['av1', 'BAV de 1º grau', '71 bpm', 'PR prolongado acima de 200 ms. Todas as ondas P conduzem aos ventrículos.', 'Revise fármacos, sintomas e condições associadas.'],
  ['mobitz1', 'Mobitz I', 'Condução em grupos', 'O PR aumenta progressivamente até uma onda P não conduzir. O ciclo se repete.', 'Compare os intervalos PR dentro de cada grupo antes de classificar o bloqueio.'],
  ['mobitz2', 'Mobitz II', 'Condução intermitente', 'As ondas P conduzidas têm PR semelhante. Uma onda P deixa de conduzir sem alongamento prévio.', 'Avalie repercussão hemodinâmica e prepare estimulação quando indicada.'],
  ['av3', 'BAV total', 'Escape a 38 bpm', 'Ondas P e QRS regulares em frequências distintas, sem relação PR fixa.', 'Busque sinais de hipoperfusão e procure causas reversíveis enquanto organiza o suporte.'],
];

const causes = [
  ['Hipovolemia', 'Sangramento, perdas intensas ou choque antes da parada.', 'Controle sangramento e reponha volume ou hemoderivados conforme a causa.'],
  ['Hipóxia', 'Dessaturação, obstrução ou problema de ventilação antes da parada.', 'Verifique via aérea, fonte de oxigênio, circuito e ventilação efetiva.'],
  ['Hidrogênio (acidose)', 'Acidose prévia, hipoperfusão prolongada ou ventilação inadequada.', 'Otimize perfusão e ventilação. Considere tratamento específico para a causa, sem uso rotineiro de bicarbonato na PCR.'],
  ['Hipo/hipercalemia', 'Insuficiência renal, distúrbios documentados, fármacos ou alterações eletrocardiográficas compatíveis.', 'Investigue o distúrbio e siga o protocolo de tratamento específico para a causa suspeita.'],
  ['Hipotermia', 'Exposição ao frio e temperatura central reduzida.', 'Meça a temperatura central, inicie o reaquecimento conforme o protocolo e avalie suporte especializado.'],
  ['Pneumotórax hipertensivo', 'Trauma ou ventilação com pressão positiva com deterioração abrupta e assimetria ventilatória.', 'Se houver forte suspeita clínica, organize descompressão imediata em paralelo à RCP.'],
  ['Tamponamento cardíaco', 'Derrame pericárdico, trauma ou procedimento recente com choque obstrutivo.', 'Use ecografia sem prolongar pausas. Organize drenagem conforme o mecanismo e o contexto.'],
  ['Toxinas', 'História de exposição, toxíndrome ou alterações compatíveis no ECG.', 'Identifique o agente e discuta medidas específicas e antídotos com toxicologia.'],
  ['Trombose pulmonar', 'Fatores de risco para TEP, dispneia ou síncope antes da parada.', 'Considere protocolo de PCR por TEP e opções de reperfusão conforme diagnóstico e serviço.'],
  ['Trombose coronariana', 'Dor isquêmica, alteração prévia de ECG ou quadro compatível com síndrome coronariana.', 'Siga o algoritmo de PCR e avalie reperfusão coronariana conforme os achados após o retorno da circulação.'],
];

const gaussian = (t, center, width) => Math.exp(-(((t - center) / width) ** 2));

function signalFor(id) {
  const atrial = [];
  const ventricular = [];
  let baseline = () => 0;

  function paced(first, interval, output) {
    for (let time = first; time < 6.25; time += interval) output.push(time);
  }

  if (id === 'af') {
    ventricular.push(0.25, 0.81, 1.64, 2.05, 2.69, 3.21, 4.13, 4.62, 5.44, 5.91);
    baseline = t => 0.035 * Math.sin(t * 46) + 0.023 * Math.sin(t * 65) + 0.018 * Math.cos(t * 31);
  } else if (id === 'flutter') {
    paced(0.22, 0.4, ventricular);
    baseline = t => {
      const phase = ((t + 0.13) % 0.2) / 0.2;
      return 0.16 * (phase < 0.82 ? 2 * phase / 0.82 - 1 : 1 - 2 * (phase - 0.82) / 0.18);
    };
  } else if (id === 'svt' || id === 'vt') {
    paced(0.22, 60 / (id === 'svt' ? 176 : 160), ventricular);
  } else if (id === 'av3') {
    paced(0.09, 0.69, atrial);
    paced(0.48, 60 / 38, ventricular);
  } else {
    const intervals = { 'sinus-tach': 0.5, 'sinus-brady': 1.25, av1: 0.85, mobitz1: 0.76, mobitz2: 0.78 };
    paced(0.09, intervals[id], atrial);
    atrial.forEach((time, i) => {
      if ((id === 'mobitz1' && i % 4 === 3) || (id === 'mobitz2' && i % 3 === 2)) return;
      const pr = id === 'mobitz1' ? [0.14, 0.20, 0.28][i % 4] : id === 'av1' ? 0.27 : 0.16;
      ventricular.push(time + pr);
    });
  }

  function complex(t, at) {
    if (id === 'vt') {
      return 0.98 * gaussian(t, at, 0.048)
        - 0.58 * gaussian(t, at + 0.071, 0.031)
        - 0.24 * gaussian(t, at + 0.18, 0.052);
    }
    const repolarization = id === 'sinus-tach' || id === 'svt' ? 0.19 : 0.24;
    return -0.13 * gaussian(t, at - 0.021, 0.01)
      + 1.11 * gaussian(t, at, 0.013)
      - 0.26 * gaussian(t, at + 0.026, 0.014)
      + 0.23 * gaussian(t, at + repolarization, 0.06);
  }

  return t => baseline(t)
    + atrial.reduce((sum, at) => sum + 0.135 * gaussian(t, at, 0.029), 0)
    + ventricular.reduce((sum, at) => sum + complex(t, at), 0);
}

function ecgPath(id) {
  const signal = signalFor(id);
  return Array.from({ length: 1501 }, (_, i) => {
    const t = i / 250;
    return `${i === 0 ? 'M' : 'L'}${(12 + 100 * t).toFixed(1)} ${(80 - 40 * signal(t)).toFixed(1)}`;
  }).join(' ');
}

export function renderECG(index) {
  const [id, name, rate, reading, practice] = rhythms[index];

  return `
    <div class="ecg-scroll" tabindex="0" role="region" aria-label="Traçado de ${name}">
      <svg class="ecg" viewBox="0 0 624 156" role="img" aria-label="${name}. ${reading}">
        <defs>
          <pattern id="fine-grid" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M 4 0 H 0 V 4" fill="none" stroke="#e8cab0" stroke-width=".55"/></pattern>
          <pattern id="coarse-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="url(#fine-grid)"/><path d="M 20 0 H 0 V 20" fill="none" stroke="#cea686" stroke-width=".75"/></pattern>
        </defs>
        <rect width="624" height="156" fill="#f8e9d9"/>
        <rect width="624" height="156" fill="url(#coarse-grid)"/>
        <text x="12" y="20" fill="#675145" font-size="11" font-family="system-ui">DII</text>
        <path d="${ecgPath(id)}" fill="none" stroke="#24463a" stroke-width="2.05" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="612" y="141" text-anchor="end" fill="#675145" font-size="11" font-family="system-ui">6 s</text>
      </svg>
    </div>
    <div class="ecg-caption"><span>Traçado didático · 25 mm/s · 10 mm/mV</span><strong>${rate}</strong></div>
    <p class="clinical-reading">${reading}</p><p>${practice}</p>`;
}

export function renderCause(index) {
  const [label, clue, action] = causes[index];
  return `<h3>${label}</h3><dl class="cause-pair"><div><dt>Pista</dt><dd>${clue}</dd></div><div><dt>Conduta</dt><dd>${action}</dd></div></dl>`;
}

function controls(items, type) {
  return items.map(([label], i) => `<button class="chip" type="button" data-clinical="${type}" data-choice="${i}" aria-controls="clinical-answer" aria-pressed="${i === 0}">${label}</button>`);
}

export function clinicalPanel(type) {
  if (type === 'ecg') {
    return `<section class="detail-card" aria-labelledby="clinical-title">
      <h2 id="clinical-title">Banco de ritmos</h2>
      <div class="chips clinical-choices" aria-label="Ritmos disponíveis" role="group">${controls(rhythms.map(([, name]) => [name]), 'ecg').join('')}</div>
      <div id="clinical-answer" aria-live="polite">${renderECG(0)}</div>
    </section>`;
  }

  if (type === 'causes') {
    const buttons = controls(causes, 'causes');
    return `<section class="detail-card" aria-labelledby="clinical-title">
      <h2 id="clinical-title">Causas reversíveis</h2>
      <div class="cause-list"><strong>5 H</strong><div class="chips" role="group" aria-label="Causas H">${buttons.slice(0, 5).join('')}</div></div>
      <div class="cause-list"><strong>5 T</strong><div class="chips" role="group" aria-label="Causas T">${buttons.slice(5).join('')}</div></div>
      <div id="clinical-answer" class="cause-answer" aria-live="polite">${renderCause(0)}</div>
    </section>`;
  }

  return '';
}
