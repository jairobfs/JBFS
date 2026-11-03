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
  // Keep embedded student modules in the same document scroll flow.
  function startHeightSync() {
    const body = document.body;
    if (!body || parent === window) return;
    let scheduled = false;
    let reported = 0;
    const report = () => {
      scheduled = false;
      const height = Math.ceil(Math.max(
        document.documentElement.scrollHeight,
        body.scrollHeight,
        body.getBoundingClientRect().height
      ));
      if (Math.abs(height - reported) < 3) return;
      reported = height;
      parent.postMessage({type:'cpop:embed-height', height}, location.origin);
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(report);
    };
    if ('ResizeObserver' in window) {
      const resize = new ResizeObserver(schedule);
      resize.observe(body);
      const main = document.querySelector('main');
      if (main) resize.observe(main);
    }
    const changes = new MutationObserver(schedule);
    changes.observe(body, {childList:true, subtree:true, characterData:true});
    window.addEventListener('load', schedule);
    window.addEventListener('resize', schedule);
    schedule();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startHeightSync, {once:true});
  else startHeightSync();
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
