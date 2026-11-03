(() => {
  'use strict';
  const studentNav = document.querySelector('[data-student-portal]');
  const teacherTheme = document.querySelector('#teacherThemeToggle');
  const allowed = new Set(['aula','estudo','jogos','mini']);
  const frameUrls = {
    estudo: '/estudar.html?embed=1',
    jogos: '/jogos.html?embed=1',
    mini: '/minisimulado.html?modo=aluno&embed=1'
  };
  function studentSelect(view, updateHistory = true) {
    if (!studentNav || !allowed.has(view)) return;
    studentNav.querySelectorAll('[data-student-view]').forEach(button => {
      const on = button.dataset.studentView === view;
      button.setAttribute('aria-selected', String(on));
      button.tabIndex = on ? 0 : -1;
    });
    document.querySelector('#classroomRoot').hidden = view !== 'aula';
    document.querySelectorAll('[data-student-pane]').forEach(panel => {
      const on = panel.dataset.studentPane === view;
      panel.hidden = !on;
      if (on) {
        const frame = panel.querySelector('iframe');
        if (frame && !frame.getAttribute('src')) frame.src = frame.dataset.src;
      }
    });
    if (updateHistory) {
      const url = new URL(location.href);
      if (view === 'aula') url.searchParams.delete('view');
      else url.searchParams.set('view', view);
      history.replaceState({portalView:view}, '', url.pathname + url.search + url.hash);
    }
    window.scrollTo({top:0,behavior:'instant'});
  }
  if (studentNav) {
    studentNav.querySelectorAll('[data-student-view]').forEach(button => {
      button.addEventListener('click', () => studentSelect(button.dataset.studentView));
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const items = Array.from(studentNav.querySelectorAll('[data-student-view]'));
        const next = items[(items.indexOf(button) + (event.key === 'ArrowRight' ? 1 : items.length - 1)) % items.length];
        next.focus(); studentSelect(next.dataset.studentView);
      });
    });
    const view = new URLSearchParams(location.search).get('view');
    studentSelect(allowed.has(view) ? view : 'aula', false);
    window.addEventListener('popstate', () => {
      const v = new URLSearchParams(location.search).get('view') || 'aula';
      studentSelect(allowed.has(v) ? v : 'aula', false);
    });
  }
  window.addEventListener('message', event => {
    if (event.origin !== location.origin) return;
    if (studentNav && event.data?.type === 'cpop:embed-height') {
      const frame = [...document.querySelectorAll('.student-portal-frame')].find(f => f.contentWindow === event.source);
      const height = Number(event.data.height);
      if (!frame || !Number.isFinite(height) || height < 180 || height > 18000) return;
      const next = Math.ceil(height + 2);
      if (Math.abs(frame.getBoundingClientRect().height - next) > 6) {
        frame.style.height = next + 'px';
        frame.classList.add('is-autosized');
      }
      return;
    }
    if (event.data?.type !== 'cpop:portal-navigate') return;
    const path = new URL(event.data.href, location.origin);
    if (studentNav) {
      const v = {'/aula.html':'aula','/estudar.html':'estudo','/jogos.html':'jogos','/minisimulado.html':'mini','/':'aula'}[path.pathname];
      if (v) studentSelect(v);
      return;
    }
    const panel = {'/professor.html':'results','/editor.html':'edit','/apresentar.html':'live','/minisimulado.html':'mini'}[path.pathname];
    if (panel) document.querySelector('[data-pane="'+panel+'"]')?.click();
  });
  if (teacherTheme) {
    const sync = () => {
      const t = localStorage.getItem('cpop.theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      document.documentElement.dataset.theme = t;
      teacherTheme.setAttribute('aria-label', t === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro');
    };
    sync();
    teacherTheme.addEventListener('click', () => {
      localStorage.setItem('cpop.theme', document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
      sync();
      document.querySelectorAll('iframe[src]').forEach(frame => frame.contentWindow?.postMessage({type:'cpop:theme-refresh'}, location.origin));
    });
  }
})();
