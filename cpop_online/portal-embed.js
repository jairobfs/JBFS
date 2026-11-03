(() => {
  'use strict';
  const query = new URLSearchParams(location.search);
  const embedded = query.get('embed') === '1';
  const destination = {
    '/estudar.html': '/aula.html?view=estudo',
    '/jogos.html': '/aula.html?view=jogos',
    '/editor.html': '/professor.html?pane=edit',
    '/apresentar.html': '/professor.html?pane=live'
  };
  if (location.pathname === '/minisimulado.html' && query.get('modo') !== 'projecao') {
    destination['/minisimulado.html'] = query.get('modo') === 'professor' ? '/professor.html?pane=mini' : '/aula.html?view=mini';
  }
  if (!embedded && destination[location.pathname]) {
    location.replace(destination[location.pathname] + location.hash);
    return;
  }
  if (!embedded) return;
  document.documentElement.classList.add('cpop-embedded');
  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href]');
    if (!anchor || anchor.target === '_blank' || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = new URL(anchor.href, location.href);
    if (href.origin !== location.origin || !['/','/aula.html','/estudar.html','/jogos.html','/professor.html','/editor.html','/apresentar.html','/minisimulado.html'].includes(href.pathname)) return;
    e.preventDefault();
    parent.postMessage({type:'cpop:portal-navigate',href:href.pathname+href.search+href.hash}, location.origin);
  }, true);
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.data?.type !== 'cpop:theme-refresh') return;
    const t = localStorage.getItem('cpop.theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.dataset.theme = t;
  });
})();
