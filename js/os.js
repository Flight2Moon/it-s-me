/* Jihoney OS — desktop shell: icons, dock, window manager, boot screen. */
(function () {
  const D = JOS.data, H = JOS.html;
  const $ = (s, r = document) => r.querySelector(s);
  const desktop = $('#desktop'), dock = $('#dock');
  const FOLDER = '<svg viewBox="0 0 54 48" aria-hidden="true"><path d="M3 10a4 4 0 0 1 4-4h13l5 6h22a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" fill="#fbf5e4" stroke="#1a1612" stroke-width="2.5"/><path d="M3 18h48" stroke="#1a1612" stroke-width="2.5"/></svg>';
  const tip = `<p class="tip">Tip — open <a href="#terminal" data-open="terminal"><b>Terminal</b></a> and try <kbd>help</kbd>, <kbd>neofetch</kbd>, <kbd>htop</kbd>, <kbd>btop</kbd> or <kbd>vi about.txt</kbd>. Or take a break with <a href="#bughunt" data-open="bughunt"><b>Bug Hunt 3D</b></a> and <a href="#prix" data-open="prix"><b>Honey Prix</b></a>.</p>`;
  const doc = html => `<div class="doc">${html}</div>`;

  /* App registry. `render` → static content window, `mount` → live app, `href` → leaves the OS. */
  const apps = JOS.apps = {
    about:    { title: 'About Me',     glyph: '🐝', folder: 1, w: 600, h: 560, render: () => doc(H.about() + tip) },
    research: { title: 'Research',     glyph: '🔬', folder: 1, w: 640, h: 540, render: () => doc(H.research()) },
    projects: { title: 'Projects',     glyph: '🧪', folder: 1, w: 700, h: 580, render: () => doc(H.projects()) },
    pubs:     { title: 'Publications', glyph: '📝', folder: 1, w: 620, h: 420, render: () => doc(H.pubs()) },
    awards:   { title: 'Awards',       glyph: '🏆', folder: 1, w: 640, h: 560, render: () => doc(H.awards()) },
    resume:   { title: 'Resume.pdf',   glyph: '📄', href: 'resume.html' },
    blog:     { title: 'Git Blog',     glyph: '🌐', href: D.links.blog, external: 1 },
    terminal: { title: 'Terminal',     glyph: '>_', dark: 1, w: 760, h: 500, mount: (b, w) => JOS.terminal(b, w) },
    bughunt:  { title: 'Bug Hunt 3D',  glyph: '👾', dark: 1, w: 680, h: 470, mount: b => JOS.games.bughunt(b) },
    prix:     { title: 'Honey Prix',   glyph: '🏎️', dark: 1, w: 680, h: 470, mount: b => JOS.games.prix(b) }
  };
  const DOCK = ['about', 'projects', 'terminal', 'bughunt', 'prix', 'resume'];

  const glyph = a => a.folder
    ? `<span class="glyph folder">${FOLDER}<span>${a.glyph}</span></span>`
    : `<span class="glyph tile${a.dark ? ' dark' : ''}"${a.glyph === '>_' ? ' style="font:700 17px var(--tmono);color:#8fd16a"' : ''}>${a.glyph}</span>`;

  const icons = document.createElement('div');
  icons.id = 'icons';
  icons.innerHTML = Object.entries(apps).map(([id, a]) =>
    `<a class="icon" href="${a.href || '#' + id}" data-open="${id}">${glyph(a)}<span class="label">${a.title}</span></a>`).join('');
  desktop.append(icons);
  dock.innerHTML = DOCK.map(id => `<button data-open="${id}" data-dock="${id}" title="${apps[id].title}" aria-label="${apps[id].title}">${glyph(apps[id]).replace(' tile', '').replace(' dark', '')}</button>`).join('');

  /* ── window manager ── */
  const wins = JOS.wins = {};
  let z = 10, active = null, cascade = 0;

  function focus(w) {
    if (active === w) return;
    if (active) active.el.classList.remove('active');
    active = w;
    $('#active-title').textContent = w ? apps[w.id].title : '';
    if (!w) return;
    w.el.style.zIndex = ++z;
    w.el.classList.add('active');
    w.app && w.app.onFocus && w.app.onFocus();
  }
  const topWin = () => Object.values(wins).filter(w => !w.el.hidden).sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0] || null;
  const syncDock = () => dock.querySelectorAll('button').forEach(b => b.classList.toggle('on', !!wins[b.dataset.dock]));

  function close(id) {
    const w = wins[id];
    if (!w) return;
    w.app && w.app.destroy && w.app.destroy();
    w.el.remove();
    delete wins[id];
    if (active === w) { active = null; focus(topWin()); }
    syncDock();
  }

  function open(id) {
    const a = apps[id];
    if (!a) return false;
    if (a.href) { a.external ? window.open(a.href, '_blank', 'noopener') : (location.href = a.href); return true; }
    let w = wins[id];
    if (w) { w.el.hidden = false; focus(w); return true; }
    const el = document.createElement('section');
    el.className = 'win' + (a.dark ? ' dark' : '');
    el.setAttribute('aria-label', a.title);
    el.innerHTML = `<header class="bar"><button class="x" aria-label="Close">×</button><span class="title">${a.title}</span>` +
      `<button class="min" aria-label="Minimize">–</button><button class="max" aria-label="Maximize">□</button></header><div class="body"></div>`;
    const dw = desktop.clientWidth, dh = desktop.clientHeight - 80;
    const ww = Math.min(a.w, dw - 20), wh = Math.min(a.h, dh);
    const off = (cascade++ % 6) * 26;
    el.style.cssText = `width:${ww}px;height:${wh}px;left:${Math.max(10, Math.min(dw - ww - 10, 130 + off))}px;top:${Math.max(6, Math.min(dh - wh, 14 + off))}px`;
    desktop.append(el);
    w = wins[id] = { id, el };
    const body = $('.body', el);
    if (a.mount) w.app = a.mount(body, w); else body.innerHTML = a.render();

    $('.x', el).onclick = () => close(id);
    $('.min', el).onclick = () => { el.hidden = true; active = null; focus(topWin()); };
    $('.max', el).onclick = () => el.classList.toggle('max');
    el.addEventListener('pointerdown', () => focus(w), true);
    drag(el, $('.bar', el));
    focus(w);
    syncDock();
    return true;
  }
  JOS.open = open; JOS.close = close;

  function drag(el, bar) {
    bar.addEventListener('pointerdown', e => {
      if (e.target.closest('button') || el.classList.contains('max') || innerWidth <= 720) return;
      const sx = e.clientX - el.offsetLeft, sy = e.clientY - el.offsetTop;
      bar.setPointerCapture(e.pointerId);
      const move = ev => {
        el.style.left = Math.max(-el.offsetWidth + 80, Math.min(desktop.clientWidth - 80, ev.clientX - sx)) + 'px';
        el.style.top = Math.max(0, Math.min(desktop.clientHeight - 40, ev.clientY - sy)) + 'px';
      };
      const up = () => { bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up); };
      bar.addEventListener('pointermove', move); bar.addEventListener('pointerup', up); bar.addEventListener('pointercancel', up);
    });
    bar.addEventListener('dblclick', e => e.target.closest('button') || el.classList.toggle('max'));
  }

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-open]');
    if (!t) return;
    const a = apps[t.dataset.open];
    if (a.href && t.tagName === 'A') { if (a.external) { t.target = '_blank'; t.rel = 'noopener'; } return; } // real link: let the browser navigate
    e.preventDefault();
    open(t.dataset.open);
  });
  const key = down => e => { if (active && active.app && active.app.onKey) active.app.onKey(e, down); };
  addEventListener('keydown', key(true)); addEventListener('keyup', key(false));

  /* ── chrome: clock, touch flag, soft-keyboard-aware height ── */
  const tick = () => $('#clock').textContent = new Date().toLocaleString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
  tick(); setInterval(tick, 15000);
  if (matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0) document.documentElement.classList.add('touch');
  const vv = window.visualViewport;
  if (vv) {
    const fit = () => {
      document.documentElement.style.setProperty('--vvh', vv.height + 'px');
      document.documentElement.classList.toggle('kb-open', vv.height < screen.height * 0.6 && innerWidth <= 720);
      scrollTo(0, 0);
    };
    vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit); fit();
  }

  /* ── boot ── */
  const boot = $('#boot'), pre = $('pre', boot);
  const start = () => {
    boot.classList.add('done');
    setTimeout(() => boot.remove(), 400);
    const want = location.hash.slice(1);
    if (!open(apps[want] && !apps[want].href ? want : '') && innerWidth > 720) open('about');
  };
  let seen = false;
  try { seen = sessionStorage.jos; sessionStorage.jos = 1; } catch (e) { /* private mode: just boot every time */ }
  if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) start();
  else {
    const lines = ['Jihoney BIOS v1.0 — (c) ' + new Date().getFullYear() + ' ' + D.name, '', 'Detecting honeycomb memory ........ 640K OK',
      'Loading kernel /boot/vmlinuz-honey ... OK', 'Mounting /home/' + D.user + ' ............... OK',
      'Starting research daemons .......... OK', 'Brewing coffee ..................... OK', '', 'Welcome to Jihoney OS 🍯'];
    let i = 0;
    const t = setInterval(() => {
      pre.textContent += lines[i++] + '\n';
      if (i === lines.length) { clearInterval(t); setTimeout(start, 450); }
    }, 150);
    boot.onclick = () => { clearInterval(t); start(); };
  }
})();
