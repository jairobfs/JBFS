import { stationArt } from './visuals.js';
import { figuresFor, renderAtlasFigure, renderStationAtlas } from './atlas.js';
import { axes, illustrations, kinds, references, stations } from './stations.js';
import { clinicalPanel, renderCause, renderECG } from './clinical.js';

const drawings = {
  arrow: '<path d="M5 12h13m-5-5 5 5-5 5"/>',
  left: '<path d="M19 12H6m5 5-5-5 5-5"/>',
  search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 4 4"/>',
  pulse: '<path d="M2 12h5l2.5-6 4 12 2.5-6H22"/>',
  needle: '<path d="m14 4 6 6m-1-5 2-2m-4 4-7 7H6v-4l7-7M6 14l-4 4m8-8 3 3m-1-5 2 2"/>',
  airway: '<path d="M9 3h6m-5 0v9a5 5 0 1 0 4 0V3m-4 5h4m-3 8h2"/>',
  flask: '<path d="M9 3h6m-5 0v6l-5 8.5A2 2 0 0 0 6.7 21h10.6a2 2 0 0 0 1.7-3.5L14 9V3m-6 12h8m-4 3h.01"/>',
  drop: '<path d="M12 3c4.2 5.1 6 8.1 6 11a6 6 0 0 1-12 0c0-2.9 1.8-5.9 6-11zM9 15a3 3 0 0 0 3 3"/>',
  link: '<path d="M13 5h6v6m0-6-8 8m5 0v6H5V8h6"/>',
};

const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${drawings[name]}</svg>`;
const main = document.querySelector('#main');
const timerTemplate = document.querySelector('#timer-template');
const resetDialog = document.querySelector('#reset-dialog');
const atlasDialog = document.querySelector('#atlas-dialog');
const prefix = 'osce-hp7:v1:';
const timerKey = `${prefix}timer`;
const filters = { query: '', kind: 'all', axis: 'all' };
const minutesAllowed = [5, 7, 10];
let timer = loadTimer();
let selectedStation = null;

const catalog = stations.map(station => {
  const items = station.checks.flatMap(([, checks]) => checks);
  const searchable = [station.title, station.summary, station.keywords, axes[station.axis].label, kinds[station.kind], ...items, ...station.notes.flat()].join(' ');
  return { ...station, items, searchable: normalize(searchable) };
});
const totalItems = catalog.reduce((total, station) => total + station.items.length, 0);
const knownKeys = catalog.flatMap(station => station.items.map((_, index) => itemKey(station.id, index)));
const checked = new Set();
try {
  knownKeys.forEach(key => { if (localStorage.getItem(key) === '1') checked.add(key); });
} catch {
  // Private storage can be unavailable. Interactions still work in this session.
}

function normalize(value) {
  return value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function itemKey(id, index) {
  return `${prefix}${id}:${index}`;
}

function mark(id, index, value) {
  const key = itemKey(id, index);
  if (value) checked.add(key);
  else checked.delete(key);

  try {
    if (value) localStorage.setItem(key, '1');
    else localStorage.removeItem(key);
  } catch {
    // Keep the in-memory mark when persistence is restricted.
  }
}

function markCount(station) {
  return station.items.reduce((count, _, i) => count + Number(checked.has(itemKey(station.id, i))), 0);
}

function summary() {
  return catalog.reduce((counts, station) => {
    const count = markCount(station);
    counts.items += count;
    counts.complete += Number(count === station.items.length);
    return counts;
  }, { items: 0, complete: 0 });
}

function showOverview() {
  const tile = document.querySelector('#overview');
  if (!tile) return;
  const counts = summary();
  tile.innerHTML = `
    <div><strong>${counts.complete}<span> / ${catalog.length}</span></strong><span>Estações concluídas</span></div>
    <div><strong>${counts.items}<span> / ${totalItems}</span></strong><span>Itens marcados</span></div>
    <progress value="${counts.items}" max="${totalItems}" aria-label="Progresso geral do checklist"></progress>`;
}

function stationCard(station) {
  const count = markCount(station);
  const total = station.items.length;
  return `<a class="station-card ${station.axis}" href="#${station.id}">
    <div class="atlas-thumb">${stationArt(station.id, true)}</div>
    <div class="card-head"><span class="station-symbol">${icon(axes[station.axis].icon)}</span><span>${axes[station.axis].label}</span></div>
    <h3>${station.title}</h3>
    <p>${station.summary}</p>
    <div class="card-foot"><span class="card-score${count === total ? ' complete' : ''}">${count === total ? 'Concluída' : `${count}/${total} itens`}</span><span class="card-arrow">${icon('arrow')}</span></div>
    <progress class="card-meter" value="${count}" max="${total}" aria-label="Itens marcados em ${station.title}"></progress>
  </a>`;
}

function updateList() {
  const grid = document.querySelector('#station-grid');
  if (!grid) return;
  const terms = normalize(filters.query).trim().split(/\s+/u).filter(Boolean);
  const visible = catalog.filter(station => (filters.kind === 'all' || station.kind === filters.kind)
    && (filters.axis === 'all' || station.axis === filters.axis)
    && terms.every(term => station.searchable.includes(term)));

  document.querySelector('#result-count').textContent = visible.length === 1 ? '1 estação' : `${visible.length} estações`;
  grid.innerHTML = visible.length ? visible.map(stationCard).join('') : '<p class="empty">Nenhuma estação corresponde à busca. <button class="text-button" data-action="clear-filters" type="button">Limpar filtros</button></p>';
  document.querySelector('#axis-filter').value = filters.axis;
  main.querySelectorAll('[data-kind]').forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.kind === filters.kind)));
}

function landing() {
  return `
    <section class="hero" aria-labelledby="page-title">
      <div class="hero-copy">
        <div class="hero-content">
          <p class="label">Habilidades Médicas VII</p>
          <h1 id="page-title" tabindex="-1">Estações de<br>prática clínica</h1>
          <p>Treine procedimentos e decisões clínicas com simulação e checklist.</p>
        </div>
        <svg class="hero-trace" viewBox="0 0 390 205" aria-hidden="true">
          <defs><pattern id="hero-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 H 0 V 20" fill="none" stroke="currentColor" opacity=".16"/></pattern></defs>
          <rect width="390" height="205" fill="url(#hero-grid)"/>
          <path class="trace-main" d="M0 125h53q10 0 15-5t17 5h18l8 8 12-34 15-65 12 134 10-44 14 1q21-20 37 0h44q15 0 22-6t18 6h17l8 8 12-34 14-65 12 134 10-44h22"/>
          <circle cx="138" cy="34" r="4"/><circle cx="345" cy="34" r="4"/>
        </svg>
      </div>
      <div data-timer></div>
    </section>
    <section class="overview" id="overview" aria-label="Visão geral do progresso"></section>
    <section class="station-library" aria-labelledby="station-library-title">
      <div class="section-heading"><h2 id="station-library-title">Escolha uma estação</h2><span id="result-count" role="status"></span></div>
      <div class="filters">
        <div class="filter-fields">
          <label class="search-box">${icon('search')}<span class="sr-only">Buscar estações</span><input id="station-search" type="search" placeholder="Buscar procedimento, ritmo ou fármaco" autocomplete="off"></label>
          <label class="select-wrap"><span class="sr-only">Eixo clínico</span><select id="axis-filter"><option value="all">Todos os eixos</option>${Object.entries(axes).map(([key, axis]) => `<option value="${key}">${axis.label}</option>`).join('')}</select></label>
        </div>
        <div class="chips" role="group" aria-label="Tipo de estação">
          <button class="chip" data-kind="all" type="button" aria-pressed="true">Todas</button>
          <button class="chip" data-kind="procedimento" type="button" aria-pressed="false">Procedimentos</button>
          <button class="chip" data-kind="decisao" type="button" aria-pressed="false">Decisão clínica</button>
          <button class="chip" data-kind="revisao" type="button" aria-pressed="false">Revisão focada</button>
        </div>
      </div>
      <div class="station-grid" id="station-grid"></div>
    </section>`;
}

function stationPage(station) {
  const index = catalog.indexOf(station);
  let itemIndex = 0;
  const checklist = station.checks.map(([group, items]) => `<fieldset class="check-group"><legend>${group}</legend>${items.map(item => {
    const position = itemIndex++;
    return `<label class="check-row"><input data-check="${position}" type="checkbox" ${checked.has(itemKey(station.id, position)) ? 'checked' : ''}><span>${item}</span></label>`;
  }).join('')}</fieldset>`).join('');
  const previous = catalog[index - 1];
  const next = catalog[index + 1];
  const picture = illustrations[station.id];

  return `
    <a class="back-link" href="#estacoes">${icon('left')} Todas as estações</a>
    <div class="station-layout">
      <header class="station-intro ${station.axis}">
        <span class="station-symbol">${icon(axes[station.axis].icon)}</span>
        <div><p class="label">${axes[station.axis].label} · ${kinds[station.kind]}</p><h1 id="page-title" tabindex="-1">${station.title}</h1><p>${station.summary}</p><button class="text-button mobile-check-jump" data-action="show-checklist" type="button">Ir ao checklist ${icon('arrow')}</button></div>
      </header>
      <aside class="station-side" aria-label="Controles da estação">
        <div data-timer></div>
        <section class="detail-card station-progress" aria-labelledby="station-progress-title">
          <h2 id="station-progress-title">Nesta estação</h2>
          <output id="station-count" aria-live="polite"></output>
          <progress id="station-meter" max="${station.items.length}" value="0" aria-label="Progresso da estação"></progress>
          <button class="text-button" data-action="show-checklist" type="button">Ir ao checklist ${icon('arrow')}</button>
        </section>
      </aside>
      <div class="station-main ${station.axis}">
        <section class="detail-card scenario-card" aria-labelledby="scenario-title">
          <h2 id="scenario-title">Cenário</h2>
          <p>${station.scenario}</p><p class="task"><strong>Tarefa</strong><span>${station.task}</span></p>
          <ol class="route" aria-label="Sequência da estação">${station.route.map(step => `<li>${step}</li>`).join('')}</ol>
        </section>
        ${renderStationAtlas(station.id)}
        ${clinicalPanel(station.tool)}
        ${picture ? `<section class="detail-card station-infographic" aria-label="Infográfico da estação">
          <figure class="station-figure">
            <a href="../assets/habilidades-medicas-vii/mnemonics/${picture[0]}" target="_blank" rel="noopener" aria-label="Ampliar infográfico">
              <img src="../assets/habilidades-medicas-vii/mnemonics/${picture[0]}" alt="${picture[1]}" width="1664" height="2080" loading="lazy" decoding="async">
            </a>
            <figcaption>${picture[1]} <a href="../assets/habilidades-medicas-vii/mnemonics/${picture[0]}" target="_blank" rel="noopener">Ampliar</a></figcaption>
          </figure>
        </section>` : ''}
        <section class="detail-card" aria-labelledby="check-title" id="checklist">
          <div class="check-top"><div><h2 id="check-title">Checklist</h2><output class="mobile-check-count" id="mobile-check-count" aria-live="polite"></output></div><button class="text-button" id="toggle-checks" data-action="toggle-checks" type="button">Marcar todos</button></div>
          <div class="checklist">${checklist}</div>
        </section>
        <details class="detail-card notes">
          <summary>Revisão e referências</summary>
          ${station.notes.map(([title, content]) => `<h3>${title}</h3><p>${content}</p>`).join('')}
          <ul class="references">${station.refs.map(key => {
            const [name, url] = references[key];
            return `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${name} ${icon('link')}</a></li>`;
          }).join('')}</ul>
        </details>
        <nav class="station-neighbors" aria-label="Estações vizinhas">
          ${previous ? `<a href="#${previous.id}">${icon('left')}<span>${previous.title}</span></a>` : '<span></span>'}
          ${next ? `<a href="#${next.id}"><span>${next.title}</span>${icon('arrow')}</a>` : ''}
        </nav>
      </div>
    </div>`;
}

function showStationProgress() {
  if (!selectedStation) return;
  const count = markCount(selectedStation);
  const total = selectedStation.items.length;
  document.querySelector('#station-count').textContent = `${count} de ${total} itens`;
  document.querySelector('#mobile-check-count').textContent = `${count} de ${total} itens`;
  document.querySelector('#station-meter').value = count;
  document.querySelector('#toggle-checks').textContent = count === total ? 'Desmarcar todos' : 'Marcar todos';
}

function progressPage() {
  const counts = summary();
  return `<section class="progress-page" aria-labelledby="page-title">
    <div class="section-heading progress-heading"><h1 id="page-title" tabindex="-1">Meu progresso</h1><button class="text-button danger-text" data-action="reset-progress" type="button" ${counts.items === 0 ? 'disabled' : ''}>Limpar marcações</button></div>
    <div class="overview" id="overview" aria-label="Visão geral do progresso"></div>
    <div class="progress-list" id="progress-list"></div>
  </section>`;
}

function updateProgressList() {
  const list = document.querySelector('#progress-list');
  if (!list) return;
  const counts = summary();
  main.querySelector('[data-action="reset-progress"]').disabled = counts.items === 0;
  list.innerHTML = catalog.map(station => {
    const count = markCount(station);
    const total = station.items.length;
    return `<a class="progress-row ${station.axis}" href="#${station.id}"><span class="station-symbol">${icon(axes[station.axis].icon)}</span><span class="progress-name">${station.title}</span><progress aria-label="Progresso de ${station.title}" value="${count}" max="${total}"></progress><span class="card-score${count === total ? ' complete' : ''}">${count === total ? 'Concluída' : `${count}/${total}`}</span>${icon('arrow')}</a>`;
  }).join('');
}

function renderRoute(focus = false) {
  const route = location.hash.slice(1);
  selectedStation = catalog.find(station => station.id === route) ?? null;
  const onProgress = route === 'progresso';
  main.innerHTML = selectedStation ? stationPage(selectedStation) : onProgress ? progressPage() : landing();
  document.title = selectedStation ? `${selectedStation.title} · OSCE HP7` : onProgress ? 'Meu progresso · OSCE HP7' : 'OSCE · Prática HP7';
  const active = document.querySelector(onProgress ? '#nav-progress' : '#nav-stations');
  document.querySelectorAll('nav [aria-current]').forEach(link => link.removeAttribute('aria-current'));
  active.setAttribute('aria-current', 'page');

  main.querySelector('[data-timer]')?.append(timerTemplate.content.cloneNode(true));
  const input = document.querySelector('#station-search');
  if (input) input.value = filters.query;
  showOverview();
  updateList();
  showStationProgress();
  updateProgressList();
  paintTimer();

  if (focus) {
    window.scrollTo(0, 0);
    document.querySelector('#page-title').focus({ preventScroll: true });
  }
}

function loadTimer() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(timerKey));
    if (saved && minutesAllowed.includes(saved.preset)
      && Number.isFinite(saved.remaining) && saved.remaining >= 0 && saved.remaining <= saved.preset * 60000
      && (saved.deadline === null || Number.isFinite(saved.deadline))) return saved;
  } catch {
    // Use the default session timer if saved data cannot be read.
  }
  return { preset: 5, remaining: 300000, deadline: null };
}

function saveTimer() {
  try { sessionStorage.setItem(timerKey, JSON.stringify(timer)); } catch { /* Session storage can be disabled. */ }
}

function millisecondsLeft(now = Date.now()) {
  return timer.deadline === null ? timer.remaining : Math.max(0, timer.deadline - now);
}

function paintTimer() {
  const left = millisecondsLeft();
  if (timer.deadline !== null && left === 0) {
    timer = { ...timer, deadline: null, remaining: 0 };
    saveTimer();
  }
  const clock = document.querySelector('#timer-clock');
  if (!clock) return;
  const secs = Math.ceil(left / 1000);
  const format = value => String(value).padStart(2, '0');
  const time = `${format(Math.floor(secs / 60))}:${format(secs % 60)}`;
  const running = timer.deadline !== null;
  const status = left === 0 ? 'Tempo encerrado' : running ? 'Em andamento' : left === timer.preset * 60000 ? 'Pronto' : 'Pausado';
  const action = running ? 'Pausar' : left === 0 ? 'Iniciar novamente' : 'Iniciar';
  const toggle = document.querySelector('#timer-toggle');
  const stationStatus = document.querySelector('#timer-status');
  if (clock.textContent !== time) clock.textContent = time;
  if (stationStatus.textContent !== status) stationStatus.textContent = status;
  clock.closest('.timer-panel').classList.toggle('timer-ended', left === 0);
  if (toggle.textContent !== action) toggle.textContent = action;
  const progress = document.querySelector('#timer-progress');
  if (progress.max !== timer.preset * 60) progress.max = timer.preset * 60;
  if (progress.value !== secs) progress.value = secs;
  main.querySelectorAll('[data-minutes]').forEach(btn => {
    const pressed = String(Number(btn.dataset.minutes) === timer.preset);
    if (btn.getAttribute('aria-pressed') !== pressed) btn.setAttribute('aria-pressed', pressed);
  });
}

function setDuration(minutes) {
  timer = { preset: minutes, remaining: minutes * 60000, deadline: null };
  saveTimer();
  paintTimer();
}

function toggleTimer() {
  const now = Date.now();
  if (timer.deadline !== null) timer = { ...timer, remaining: millisecondsLeft(now), deadline: null };
  else {
    const remaining = timer.remaining || timer.preset * 60000;
    timer = { ...timer, remaining, deadline: now + remaining };
  }
  saveTimer();
  paintTimer();
}

main.addEventListener('input', event => {
  if (event.target.id !== 'station-search') return;
  filters.query = event.target.value;
  updateList();
});

main.addEventListener('change', event => {
  const target = event.target;
  if (target.id === 'axis-filter') {
    filters.axis = target.value;
    updateList();
  } else if (selectedStation && target.matches('[data-check]')) {
    mark(selectedStation.id, Number(target.dataset.check), target.checked);
    showStationProgress();
  }
});

main.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;

  const { kind, minutes, clinical, choice, action } = button.dataset;
  if (kind) {
    filters.kind = kind;
    updateList();
  } else if (minutes) {
    const preset = Number(minutes);
    if (preset !== timer.preset) setDuration(preset);
  }
  else if (button.id === 'timer-toggle') toggleTimer();
  else if (button.id === 'timer-reset') setDuration(timer.preset);
  else if (clinical) {
    const render = clinical === 'ecg' ? renderECG : renderCause;
    document.querySelector('#clinical-answer').innerHTML = render(Number(choice));
    main.querySelectorAll('[data-clinical]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
  } else if (action === 'clear-filters') {
    Object.assign(filters, { query: '', kind: 'all', axis: 'all' });
    document.querySelector('#station-search').value = '';
    updateList();
    document.querySelector('#station-search').focus();
  } else if (action === 'toggle-checks' && selectedStation) {
    const value = markCount(selectedStation) < selectedStation.items.length;
    main.querySelectorAll('[data-check]').forEach(input => {
      input.checked = value;
      mark(selectedStation.id, Number(input.dataset.check), value);
    });
    showStationProgress();
  } else if (action === 'reset-progress') {
    resetDialog.showModal();
  } else if (action === 'zoom-figure' && selectedStation) {
    const figure = figuresFor(selectedStation.id)[Number(button.dataset.figure)];
    if (!figure) return;
    atlasDialog.querySelector('.atlas-dialog-content').innerHTML = renderAtlasFigure(figure);
    atlasDialog.showModal();
  } else if (action === 'show-checklist') {
    const first = main.querySelector('[data-check]');
    first.focus({ preventScroll: true });
    document.querySelector('#checklist').scrollIntoView({ block: 'start' });
  }
});

resetDialog.querySelector('form').addEventListener('submit', event => {
  if (event.submitter?.value !== 'clear') return;
  event.preventDefault();
  resetDialog.close();
  catalog.forEach(station => station.items.forEach((_, index) => mark(station.id, index, false)));
  showOverview();
  updateProgressList();
  document.querySelector('#page-title').focus();
});

window.addEventListener('storage', event => {
  if (event.key === null) checked.clear();
  else if (!knownKeys.includes(event.key)) return;
  else if (event.newValue === '1') checked.add(event.key);
  else checked.delete(event.key);

  if (selectedStation) main.querySelectorAll('[data-check]').forEach(input => {
    input.checked = checked.has(itemKey(selectedStation.id, Number(input.dataset.check)));
  });
  showStationProgress();
  showOverview();
  updateList();
  updateProgressList();
});

document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  main.focus();
});

window.addEventListener('hashchange', () => renderRoute(true));
window.setInterval(paintTimer, 250);
renderRoute();
