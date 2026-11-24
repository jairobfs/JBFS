import { anatomy } from './atlas-anatomia.js';
import { applied } from './atlas-clinica.js';
import { addedPlates, memoryCards } from './atlas-memoria.js';
import { references } from './stations.js';

const extraSources = {
  palmar: ['StatPearls · Arcos arteriais palmares', 'https://www.ncbi.nlm.nih.gov/books/NBK545377/'],
  puma: ['PUMA · Consenso de capnografia na intubação', 'https://doi.org/10.1111/anae.15817'],
  cauti: ['CDC · Prevenção de infecção associada à sonda urinária', 'https://www.cdc.gov/infection-control/hcp/cauti/summary-of-recommendations.html'],
  pericardiumWindow: ['ESC · Janelas guiadas para pericardiocentese', 'https://www.escardio.org/communities/councils/cardiology-practice/scientific-documents-and-publications/ejournal/volume-15/Pericardiocentesis-in-cardiac-tamponade-indications-and-practical-aspects/'],
  radialAtlas: ['StatPearls · Anatomia da artéria radial', 'https://www.ncbi.nlm.nih.gov/books/NBK546626/'],
  openstax: ['OpenStax · Atividade elétrica cardíaca', 'https://openstax.org/books/anatomy-and-physiology-2e/pages/19-2-cardiac-muscle-and-electrical-activity'],
  femaleCath: ['Manual MSD · Cateterismo uretral feminino', 'https://www.msdmanuals.com/professional/genitourinary-disorders/how-to-do-genitourinary-procedures/how-to-do-urethral-catheterization-in-a-female'],
  thoraxAtlas: ['Manual MSD · Toracocentese', 'https://www.msdmanuals.com/pt/profissional/dist%C3%BArbios-pulmonares/como-fazer-procedimentos-pulmonares/como-fazer-toracocentese'],
  ioLandmark: ['IAEM · Acesso intraósseo em adultos', 'https://iaem.ie/wp-content/uploads/2023/07/Adult-IO-Guideline-V1.0.pdf'],
  glottisAtlas: ['NHM · Laringoscopia e anatomia laríngea', 'https://nhm.gov.in/pdf/2024/LSAS_Revised_Curriculum-2024.pdf'],
};

export function figuresFor(id) {
  const memory = memoryCards[id];
  return [...(memory ? [memory] : []), ...(anatomy[id] ?? []), ...(addedPlates[id] ?? []), ...(applied[id] ?? [])];
}

function numberedMarkers(labels) {
  const lines = labels.map(([x, y, bx, by]) => `<path d="M${x} ${y}L${bx} ${by}"/><circle cx="${x}" cy="${y}" r="3" class="atlas-tip"/>`).join('');
  const markers = labels.map(([, , bx, by], i) => `<g><circle class="atlas-number-dot" cx="${bx}" cy="${by}" r="12"/><text x="${bx}" y="${by+0.5}">${i+1}</text></g>`).join('');
  return `<g class="atlas-leaders">${lines}</g><g class="atlas-markers">${markers}</g>`;
}

function renderDiagram(figure) {
  const labels = figure.labels.map(([, , , , name], i) =>
    `<li><span class="atlas-key" aria-hidden="true">${i+1}</span><span>${name}</span></li>`).join('');
  return `
    <svg class="anatomy-drawing" viewBox="0 0 420 246" aria-hidden="true">
      <rect class="anatomy-border" x="10" y="10" width="400" height="226" rx="12"/>
      ${figure.geometry}
      ${numberedMarkers(figure.labels)}
    </svg>
    <ol class="anatomy-legend" aria-label="Estruturas numeradas">${labels}</ol>`;
}

function renderFlow(columns) {
  return `<div class="anatomy-flow">${columns.map(column =>
    `<div class="anatomy-lane"><strong>${column.title}</strong><ol>${column.steps.map(step => `<li>${step}</li>`).join('')}</ol></div>`).join('')}</div>`;
}

function renderMemory(figure) {
  return `<div class="memory-grid">
    <svg class="anatomy-drawing memory-drawing" viewBox="24 17 372 215" aria-hidden="true">${figure.geometry}</svg>
    <div class="memory-terms">
      <p class="memory-cue">${figure.cue}</p>
      <dl>${figure.prompts.map(([term, meaning]) => `<div><dt>${term}</dt><dd>${meaning}</dd></div>`).join('')}</dl>
    </div>
  </div>`;
}

export function renderAtlasFigure(figure, index = null) {
  const [name, url] = extraSources[figure.source] ?? references[figure.source];
  return `<figure class="anatomy-figure${figure.prompts ? ' anatomy-memory' : ''}${figure.columns ? ' anatomy-figure-flow' : ''}">
    <figcaption>
      <p class="anatomy-plane">${figure.plane}</p>
      <h3${index === null ? ' id="atlas-dialog-title"' : ''}>${figure.title}</h3>
    </figcaption>
    ${figure.prompts ? renderMemory(figure) : figure.columns ? renderFlow(figure.columns) : renderDiagram(figure)}
    <p class="anatomy-takeaway">${figure.takeaway}</p>
    <div class="anatomy-credits">
      <a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a>
      ${index !== null ? `<button type="button" class="text-button atlas-zoom" data-action="zoom-figure" data-figure="${index}" aria-label="Ampliar ${figure.title}">Ampliar</button>` : ''}
    </div>
  </figure>`;
}

export function renderStationAtlas(id) {
  return `<section class="station-atlas" aria-labelledby="atlas-title">
    <h2 id="atlas-title">Anatomia e prática visual</h2>
    <div class="atlas-figure-grid">${figuresFor(id).map(renderAtlasFigure).join('')}</div>
  </section>`;
}
