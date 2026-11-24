// Schematics are not to scale. Each plate depicts the concept in its caption.
const plates = {
  'puncao-radial': ['Amostra e hemostasia', 'M34 77h51c10 0 17-4 22-11l13-18c7-6 14-1 11 6l-6 12h30l30 16q8 7 0 14h-50l-25 9H34Z M45 90h66q19 0 35-14 M135 51l19-18 19 17-20 19Z M154 33l10-10m9 27 10-10 M138 64l-12 11', 'M46 90h65q19 0 35-14 M126 75l12-11'],
  eletrocardiograma: ['A sequência P–QRS–T', 'M28 76h27q12-18 25 0h17l8 9 9-46 10 55 10-18h14q18-24 36 0h25 M56 100h44m24 0h42 M56 97v6m44-6v6m24-6v6m42-6v6', 'M97 76l8 9 9-46 10 55 10-18'],
  cricotireoidostomia: ['Membrana cricotireóidea', 'M84 32l26 12 26-12 6 25-32 9-32-9Z M83 78q27-9 54 0v11q-27 12-54 0Z M88 98q22 7 44 0m-43 12q21 7 42 0 M142 69h37', 'M91 70h38 M142 69h37'],
  'puncao-lombar': ['Espaços lombares inferiores', 'M83 27h52v16H83Zm-3 24h58v16H80Zm-3 24h64v16H77Zm-3 24h70v16H74Z M57 63C31 65 37 92 71 103m93-40c26 2 20 29-14 40 M141 95h47', 'M84 71h49 M81 95h107'],
  'iot-e-drogas': ['Indução e bloqueio', 'M61 38h36v15l6 9v35q0 7-7 7H62q-7 0-7-7V62l6-9Z M136 38h36v15l6 9v35q0 7-7 7h-34q-7 0-7-7V62l6-9Z M61 44h36m39 0h36M70 78h18m-9-9v18m63-9h24', 'M55 62h48 M130 62h48'],
  'descontaminacao-gastrica': ['Risco de aspiração', 'M73 30v27q0 11 12 11h16q11 0 11-18V35q0-9 10-9 17 0 25 24 6 21-3 38-9 18-29 18-13 0-24-10l-11-9-15 1 M155 44l29-7 15 15-7 30-17 15-17-15Z M177 53v19m0 8h.01', 'M177 53v19m0 8h.01'],
  'desfibrilacao-cardioversao': ['Onda R e sincronização', 'M30 32h170v60H30Z M44 66h25l8 5 8-24 9 30 7-11h32l8 5 8-24 9 30 7-11h21 M70 108h15m15 0h15m15 0h15m15 0h15 M79 40l6-6 6 6m52 0 6-6 6 6', 'M79 40l6-6 6 6m52 0 6-6 6 6'],
  'pressao-venosa-central': ['Nivelar antes de zerar', 'M34 102h147m-140 0V61m0 25h94l22 16 M54 73q9-18 20 0m16-2 27-20 30 35 M110 61h84m-25-13h25v26h-25Z M184 74v28', 'M110 61h56'],
  'puncao-suprapubica': ['Bexiga cheia ao ultrassom', 'M84 55q4-17 32-17t32 17q7 23-11 37l-13 9v10h-16v-10l-13-9q-18-14-11-37Z M77 35l18-13 15 16-17 13Z M89 51l19 34 18-44 M87 71q30 8 59 0', 'M89 51l19 34 18-44 M87 71q30 8 59 0'],
  'sondagem-vesical': ['Balão dentro da bexiga', 'M52 51q6-20 36-20t36 20q5 23-24 40v18H80V91q-33-17-28-40Z M90 58v53q0 9 13 9h53V90 M139 88h36v27h-36Z M50 66q38 8 74 0 M81 73a9 6 0 1 0 18 0 9 6 0 1 0-18 0', 'M81 73a9 6 0 1 0 18 0 9 6 0 1 0-18 0 M90 80v27'],
  pericardiocentese: ['Derrame ao redor do coração', 'M116 105Q59 78 69 51q8-29 42-15 29-21 47 7 18 29-42 62Z M114 90q-40-23-31-39 9-18 29-3 22-17 33 2 11 18-31 40Z M148 93l28 17m-15-26 23 15', 'M80 78q10 12 25 20 M139 95q16-12 23-27'],
  'pcr-rcp': ['Compressões e análise do ritmo', 'M51 76h34l28-22 33 22h41m-142 0v27h147V76 M69 101h96 M113 29v23m-10-8 10 9 10-9 M151 31h40v29h-40Z M156 46h8l4-9 5 16 5-7h8', 'M113 29v23m-10-8 10 9 10-9'],
  paracentese: ['Bolsa de ascite ao ultrassom', 'M57 49q60-42 120 0v40q-3 20-28 20H86q-27 0-29-20Z M57 89q60 15 120 0 M76 34l22-11 9 17-22 10Z M87 50l24 45 5-46 M129 62q25-15 27 4-7 14-25 5Z M140 82h15', 'M57 89q60 15 120 0 M87 50l24 45 5-46'],
  toracocentese: ['Derrame acima do diafragma', 'M78 34q-17 26-17 60m85-60q17 27 17 60 M61 94q49-29 102 0 M84 42q4-13 22-13v47q-22-7-29 2 3-21 7-36Z M144 42q-4-13-22-13v47q22-7 29 2-3-21-7-36Z M164 72h19l17-20 M56 104q54-25 111 0', 'M68 88q41-18 87 0 M57 101q54-25 111 0'],
  'acesso-intraosseo': ['Córtex e cavidade medular', 'M53 53q14-22 37-11 29 11 58 0 27-10 37 11-12 13-12 23 0 12 12 24-12 21-37 11-29-11-58 0-23 11-37-11 12-12 12-24 0-10-12-23Z M78 66q39 12 79 0m-79 19q39-12 79 0 M134 22v53m-5-53h10m-10 10h10', 'M134 42v33 M78 66q39 12 79 0'],
  'farmacologia-emergencia': ['Checagem da dose', 'M54 39h31v21l12 11v34H42V71l12-11Z M54 49h31m-43 30h55 M120 34h64v72h-64Z M132 56l4 4 8-8m7 7h19m-38 17 4 4 8-8m7 7h19', 'M132 56l4 4 8-8m-12 24 4 4 8-8'],
  'iot-7-ps': ['Capnografia após a passagem', 'M31 30h171v69H31Z M48 81h17l11-29h22v29h19l11-29h22v29h18l11-29h12 M85 108h64', 'M48 81h17l11-29h22v29h19l11-29h22v29h18l11-29h12'],
};

export function stationArt(id, decorative = false) {
  const [title, silhouette, highlight] = plates[id];
  const semantics = decorative ? 'aria-hidden="true"' : `role="img" aria-label="${title}"`;
  return `<svg class="atlas-art" viewBox="0 0 230 130" ${semantics}>
    <circle class="atlas-orbit" cx="115" cy="65" r="59"/>
    <path class="atlas-guides" d="M12 65h26m154 0h26M115 7v12m0 93v11"/>
    <path class="atlas-outline" d="${silhouette}"/>
    <path class="atlas-highlight" d="${highlight}"/>
  </svg>`;
}
