/* Jihoney OS — Terminal: a tiny shell (jsh) with an in-memory filesystem,
   plus full-screen apps: htop, btop and a modal vi. */
JOS.terminal = function (root, win) {
  const D = JOS.data, esc = JOS.esc;
  root.innerHTML = '<div class="term"><pre class="out"><span class="hist"></span><span class="pl"></span></pre><pre class="scr" hidden></pre>' +
    '<textarea class="kbd" aria-label="Terminal input" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"></textarea>' +
    '<div class="keys">' + ['Esc', 'Tab', 'Ctrl', '↑', '↓', '←', '→', ':', '/', '-', 'q'].map(k => `<button type="button" data-k="${k}">${k}</button>`).join('') + '</div></div>';
  const $ = s => root.querySelector(s);
  const term = $('.term'), out = $('.out'), hist = $('.hist'), pl = $('.pl'), scr = $('.scr'), kbd = $('.kbd'), keys = $('.keys');

  /* ── filesystem (built from JOS.data) ── */
  const wrap = (s, n = 64, ind = '') => {
    const res = []; let l = '';
    for (const w of s.split(' ')) {
      if (l && (l + ' ' + w).length > n - ind.length) { res.push(l); l = w; } else l = l ? l + ' ' + w : w;
    }
    if (l) res.push(l);
    return res.map((x, i) => (i ? ind : '') + x).join('\n');
  };
  const bl = a => a.map(p => '  - ' + wrap(p, 64, '    ')).join('\n');
  const HOME = ['home', D.user];
  const fs = {
    home: {
      [D.user]: {
        'README.md': `# Welcome to Jihoney OS\n\nThis is ${D.name}'s portfolio, pretending to be a computer.\n\n  cat about.txt        who I am\n  ls projects          what I have built\n  vi contact.txt       yes, vi really works (:q to leave)\n  htop / btop          what is running right now\n  neofetch             system info\n  bughunt / prix       games`,
        'about.txt': `${D.name} (${D.nameKo})\n\n${wrap(D.tagline)}\n\nResearch interests\n${D.interests.map(i => '  - ' + i).join('\n')}\n\nEducation\n${D.education.map(e => `  ${e.school}, ${e.dept}\n  ${e.when} (${e.note})`).join('\n')}`,
        'research.txt': D.research.map(r => `${r.lab}\n${r.org} · ${r.prof}\n${r.role} · ${r.when}\n${bl(r.points)}`).join('\n\n'),
        'publications.txt': D.publications.map((p, i) => `[${i + 1}] ${p.authors}\n    ${wrap('"' + p.title + '"', 64, '    ')}\n    ${p.venue} — ${p.status}${p.note ? '\n    ' + p.note : ''}`).join('\n\n'),
        'awards.txt': D.awards.map(a => `${a.title} (${a.when})\n${a.by}\n${bl(a.points)}`).join('\n\n') +
          `\n\nHonors\n${D.honors.map(h => '  - ' + h).join('\n')}\n\nCertifications\n${D.certs.map(h => '  - ' + h).join('\n')}`,
        'contact.txt': `email   ${D.email}\ngithub  ${D.links.github}\nblog    ${D.links.blog}`,
        projects: Object.fromEntries(D.projects.map(p => [p.id + '.md',
          `# ${wrap(p.title, 62, '  ')}\n\n${p.kind} · ${p.when}${p.topic ? '\n' + wrap('Topic: ' + p.topic) : ''}\n\n${bl(p.points)}`])),
        games: { bughunt: '#!jos bughunt', prix: '#!jos prix' },
        '.vimrc': 'set number\nsyntax on\n" there is no escape. (there is: press Esc, then :q!)'
      }
    },
    etc: { 'os-release': 'NAME="Jihoney OS"\nVERSION="1.0 (Honeycomb)"\nID=jihoney\nHOME_URL="' + D.links.github + '"', motd: 'Stay curious. Ship honey.' }
  };
  let cwd = [...HOME];
  const parts = p => {
    const a = p.startsWith('/') ? [] : (p === '~' || p.startsWith('~/')) ? [...HOME] : [...cwd];
    for (const s of p.replace(/^~/, '').split('/')) { if (!s || s === '.') continue; if (s === '..') a.pop(); else a.push(s); }
    return a;
  };
  const isDir = n => n !== null && typeof n === 'object';
  const node = a => a.reduce((n, k) => isDir(n) && Object.hasOwn(n, k) ? n[k] : undefined, fs);
  const show = a => { const s = '/' + a.join('/'), h = '/' + HOME.join('/'); return s === h ? '~' : s.startsWith(h + '/') ? '~' + s.slice(h.length) : s; };

  /* ── output + line editor ── */
  let buf = '', pos = 0, past = [], hi = 0;
  const print = html => hist.insertAdjacentHTML('beforeend', html + '\n');
  const say = (s, cls) => print(cls ? `<span class="${cls}">${esc(s)}</span>` : esc(s));
  const ps1 = () => `<span class="y">${D.user}@${D.host}</span>:<span class="b">${esc(show(cwd))}</span>$ `;
  const renderLine = () => {
    pl.innerHTML = ps1() + esc(buf.slice(0, pos)) + `<span class="cur">${esc(buf[pos] || ' ')}</span>` + esc(buf.slice(pos + 1));
    out.scrollTop = out.scrollHeight;
  };
  const insert = s => { buf = buf.slice(0, pos) + s + buf.slice(pos); pos += s.length; };

  /* ── fake-but-live process table (open windows show up as processes) ── */
  const t0 = Date.now();
  let pidSeq = 2400;
  let procs = [
    ['/sbin/honeyd --system', 'root', 0.4, 0.3], ['vlm-trainer --task deepfake-detect --curated', D.user, 41, 22],
    ['graph-memory-d --edge-trigger --vad', D.user, 13, 6.5], ['medgemma-synth --dataset knhanes', D.user, 9, 8.1],
    ['cpx-agent --role standardized-patient', D.user, 7, 4.2], ['denoise-n2n --samples 1000', D.user, 5, 3.3],
    ['jetson-cluster-sched --nodes 4', 'root', 2, 1.1], ['sshd: pill-gpu-cluster', 'root', 0.2, 0.2],
    ['paper-deadline-watchdog', 'root', 0.6, 0.1], ['coffee-daemon --refill', D.user, 1.2, 0.2]
  ].map(([cmd, user, base, mem], i) => ({ pid: i ? 300 + i * 53 : 1, user, cmd, base, cpu: base, mem, time: Math.random() * 4000 }));
  let cores = [0, 0, 0, 0], cpuHist = [], netHist = [];
  const tickProcs = () => {
    for (const id in JOS.wins) if (!procs.some(p => p.app === id))
      procs.push({ pid: pidSeq++, user: D.user, cmd: `/usr/bin/${id} --window`, base: /bughunt|prix/.test(id) ? 24 : 3, cpu: 3, mem: 1.4, time: 0, app: id });
    procs = procs.filter(p => !p.app || JOS.wins[p.app]);
    for (const p of procs) {
      p.cpu = Math.max(0, Math.min(99, p.base * (0.6 + Math.random() * 0.8) + (Math.random() < 0.06 ? Math.random() * 15 : 0)));
      p.time += p.cpu / 100;
    }
    const avg = procs.reduce((s, p) => s + p.cpu, 0) / cores.length;
    cores = cores.map(() => Math.max(1, Math.min(100, avg * (0.5 + Math.random()))));
    cpuHist.push(cores.reduce((a, b) => a + b) / cores.length / 100); netHist.push(Math.random() ** 2);
    if (cpuHist.length > 400) { cpuHist.shift(); netHist.shift(); }
  };
  for (let i = 0; i < 200; i++) tickProcs(); // pre-fill the btop graphs
  const memUsed =() => procs.reduce((s, p) => s + p.mem, 0) / 100 * 16 + 1.2;
  const upStr = () => { const s = Math.floor((Date.now() - t0) / 1000); return [s / 3600, s / 60 % 60, s % 60].map(v => String(Math.floor(v)).padStart(2, '0')).join(':'); };
  const hms = t => `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`;

  /* ── character-cell screen for full-screen apps ── */
  let cols = 80, rows = 24, app = null, timer = null;
  function Screen(c, r) {
    this.c = c; this.r = r;
    this.ch = Array.from({ length: r }, () => Array(c).fill(' '));
    this.cl = Array.from({ length: r }, () => Array(c).fill(''));
  }
  Screen.prototype.put = function (x, y, s, cls = '') {
    if (y < 0 || y >= this.r) return;
    for (const ch of String(s)) { if (x >= this.c) break; if (x >= 0) { this.ch[y][x] = ch; this.cl[y][x] = cls; } x++; }
  };
  Screen.prototype.html = function () {
    return this.ch.map((row, y) => {
      let s = '', run = '', cls = this.cl[y][0];
      const flush = () => { if (run) s += cls ? `<span class="${cls}">${run}</span>` : run; run = ''; };
      row.forEach((ch, x) => {
        if (this.cl[y][x] !== cls) { flush(); cls = this.cl[y][x]; }
        run += ch.charCodeAt(0) > 126 ? `<i>${ch}</i>` : esc(ch); // <i> pins non-ASCII glyphs to one cell
      });
      flush();
      return s;
    }).join('\n');
  };
  const measure = () => {
    const probe = document.createElement('span');
    probe.textContent = '0'.repeat(20);
    (scr.hidden ? out : scr).append(probe);
    const cw = probe.getBoundingClientRect().width / 20 || 8;
    probe.remove();
    const lh = parseFloat(getComputedStyle(term).fontSize) * 1.35;
    cols = Math.max(24, Math.floor((term.clientWidth - 20) / cw));
    rows = Math.max(8, Math.floor((term.clientHeight - keys.offsetHeight - 16) / lh));
  };
  const draw = () => { if (!app) return; measure(); const S = new Screen(cols, rows); app.draw(S); scr.innerHTML = S.html(); };
  const runApp = a => { app = a; out.hidden = true; scr.hidden = false; draw(); if (a.tick) timer = setInterval(() => { a.tick(); draw(); }, a.ms || 1000); };
  const quitApp = () => { clearInterval(timer); app = null; scr.hidden = true; out.hidden = false; renderLine(); };
  const isQuit = (k, ctrl) => k === 'q' || k === 'Escape' || k === 'F10' || (ctrl && k === 'c');

  /* ── htop ── */
  function htop() {
    let selPid = 0;
    tickProcs();
    const COLS = [['PID', 5, 1], ['USER', 8], ['PRI', 3, 1], ['NI', 3, 1], ['VIRT', 6, 1], ['RES', 5, 1], ['S', 1], ['CPU%', 5, 1], ['MEM%', 5, 1], ['TIME+', 8, 1]];
    const NARROW = [0, 1, 7, 8];
    const fmt = (vals, idx) => idx.map(i => { const [, w, r] = COLS[i], v = String(vals[i]).slice(0, w); return r ? v.padStart(w) : v.padEnd(w); }).join(' ') + ' ';
    const sorted = () => [...procs].sort((a, b) => b.cpu - a.cpu);
    const bar = (S, x, y, w, label, frac, text) => {
      const inner = w - label.length - 2, fill = Math.round(inner * Math.min(1, frac)), tx = text.padStart(inner);
      S.put(x, y, label, 'c'); S.put(x + label.length, y, '[', 'w'); S.put(x + w - 1, y, ']', 'w');
      for (let i = 0; i < inner; i++) {
        const t = tx[i] !== ' ';
        S.put(x + label.length + 1 + i, y, t ? tx[i] : i < fill ? '|' : ' ', t ? 'd' : i > inner * 0.75 ? 'r' : i > inner * 0.45 ? 'y' : 'g');
      }
    };
    return {
      ms: 1200, tick: tickProcs,
      draw(S) {
        const two = S.c >= 76, colW = two ? Math.floor(S.c / 2) : S.c, per = two ? Math.ceil(cores.length / 2) : cores.length;
        cores.forEach((v, i) => bar(S, (two && i >= per ? colW : 0) + 1, two ? i % per : i, colW - 2, String(i + 1).padStart(2) + ' ', v / 100, v.toFixed(1) + '%'));
        let y = per;
        const mu = memUsed();
        bar(S, 1, y, colW - 2, 'Mem', mu / 16, mu.toFixed(2) + 'G/16.0G');
        bar(S, 1, y + 1, colW - 2, 'Swp', 0.04, '82M/2.00G');
        const info = [`Tasks: ${procs.length}, ${procs.length * 7} thr; ${procs.filter(p => p.cpu > 5).length} running`,
          `Load average: ${(cores[0] / 25).toFixed(2)} ${(cores[1] / 28).toFixed(2)} ${(cores[2] / 30).toFixed(2)}`, `Uptime: ${upStr()}`];
        if (two) info.forEach((s, i) => S.put(colW + 2, y + i, s, 'c'));
        else if (S.r > 18) { info.forEach((s, i) => S.put(1, y + 2 + i, s, 'c')); y += 3; }
        y += two ? 3 : 2;
        const idx = S.c >= 70 ? COLS.map((_, i) => i) : NARROW;
        S.put(0, y, (fmt(COLS.map(c => c[0]), idx) + 'Command').padEnd(S.c), 'hd');
        const list = sorted(), n = S.r - y - 2;
        if (!list.some(p => p.pid === selPid)) selPid = list[0].pid;
        const si = list.findIndex(p => p.pid === selPid), from = Math.max(0, Math.min(si - n + 1, list.length - n));
        list.slice(from, from + n).forEach((p, i) => {
          const vals = [p.pid, p.user, 20, 0, (p.mem * 190 | 0) + 'M', (p.mem * 164 | 0) + 'M', p.cpu > 5 ? 'R' : 'S', p.cpu.toFixed(1), p.mem.toFixed(1), hms(p.time)];
          S.put(0, y + 1 + i, (fmt(vals, idx) + p.cmd).padEnd(S.c), p.pid === selPid ? 'sel' : p.user === 'root' ? 'd' : '');
        });
        let x = 0;
        for (const [k, label] of (S.c >= 70 ? [['F1', 'Help  '], ['F9', 'Kill  '], ['F10', 'Quit  ']] : [['q', 'Quit '], ['k', 'Kill '], ['↑↓', 'Select ']])) {
          S.put(x, S.r - 1, k); x += k.length; S.put(x, S.r - 1, label, 'fk'); x += label.length;
        }
      },
      key(k, ctrl) {
        if (isQuit(k, ctrl)) return quitApp();
        const list = sorted(), i = list.findIndex(p => p.pid === selPid);
        if (k === 'ArrowDown' || k === 'j') selPid = list[Math.min(list.length - 1, i + 1)].pid;
        else if (k === 'ArrowUp') selPid = list[Math.max(0, i - 1)].pid;
        else if ((k === 'k' || k === 'F9') && list.length > 1) {
          const p = list[i];
          procs = procs.filter(q => q !== p);
          if (p.app) setTimeout(() => JOS.close(p.app)); // killing a window's process really closes it
        }
      }
    };
  }

  /* ── btop ── */
  function btop() {
    tickProcs();
    const BLK = ' ▁▂▃▄▅▆▇█';
    const box = (S, x, y, w, h, title, cls) => {
      S.put(x, y, '╭' + '─'.repeat(w - 2) + '╮', cls);
      for (let i = 1; i < h - 1; i++) { S.put(x, y + i, '│', cls); S.put(x + w - 1, y + i, '│', cls); }
      S.put(x, y + h - 1, '╰' + '─'.repeat(w - 2) + '╯', cls);
      S.put(x + 2, y, ' ' + title + ' ', 'w');
    };
    const graph = (S, x, y, w, h, data) => {
      for (let i = 0; i < w; i++) {
        const v = data[data.length - w + i] || 0;
        for (let r = 0; r < h; r++) {
          const lvl = v * h - r;
          S.put(x + i, y + h - 1 - r, lvl >= 1 ? '█' : lvl > 0 ? BLK[Math.max(1, Math.round(lvl * 8))] : ' ', r / h > 0.66 ? 'r' : r / h > 0.33 ? 'y' : 'g');
        }
      }
    };
    const meter = (S, x, y, w, frac) => {
      const f = Math.round(w * Math.min(1, frac));
      for (let i = 0; i < w; i++) S.put(x + i, y, '■', i >= f ? 'd' : i > w * 0.75 ? 'r' : i > w * 0.45 ? 'y' : 'g');
    };
    return {
      ms: 1000, tick: tickProcs,
      draw(S) {
        const W = S.c, wide = W >= 64, cpuH = Math.max(6, Math.floor(S.r * 0.34)), pw = wide ? 26 : 0;
        const avg = cores.reduce((a, b) => a + b) / cores.length;
        box(S, 0, 0, W, cpuH, 'cpu', 'g');
        S.put(W - 22, 0, ` ${avg.toFixed(0).padStart(3)}% · up ${upStr()} `, 'y');
        graph(S, 1, 1, W - 2 - pw, cpuH - 2, cpuHist);
        if (wide) cores.slice(0, cpuH - 2).forEach((v, i) => {
          S.put(W - pw, 1 + i, 'C' + i, 'c'); meter(S, W - pw + 3, 1 + i, 14, v / 100); S.put(W - 8, 1 + i, v.toFixed(0).padStart(4) + '%');
        });
        const midH = 5, y1 = cpuH, half = wide ? Math.floor(W / 2) : W, mu = memUsed();
        box(S, 0, y1, half, midH, 'mem', 'y');
        [['Used', mu / 16, mu.toFixed(1) + 'G'], ['Cache', 0.31, '5.0G'], ['Free', 1 - mu / 16 - 0.31, (16 - mu - 5).toFixed(1) + 'G']].forEach(([l, f, t], i) => {
          S.put(2, y1 + 1 + i, l.padEnd(6), 'c'); meter(S, 8, y1 + 1 + i, half - 17, f); S.put(half - 8, y1 + 1 + i, t.padStart(6));
        });
        if (wide) {
          box(S, half, y1, W - half, midH, 'net', 'm');
          graph(S, half + 1, y1 + 1, W - half - 16, midH - 2, netHist);
          const d = netHist[netHist.length - 1] || 0;
          S.put(W - 14, y1 + 1, '▼ ' + (d * 42).toFixed(1).padStart(5) + ' MB', 'm'); S.put(W - 14, y1 + 2, '▲ ' + (d * 7).toFixed(1).padStart(5) + ' MB', 'b');
        }
        const y2 = y1 + midH, ph = S.r - y2;
        if (ph < 4) return;
        box(S, 0, y2, W, ph, 'proc', 'c');
        S.put(W - 10, y2 + ph - 1, ' q quit ', 'w');
        S.put(2, y2 + 1, 'PID'.padStart(5) + ' ' + 'Program'.padEnd(W - 24) + ' ' + 'Mem%'.padStart(5) + ' ' + 'Cpu%'.padStart(6), 'y');
        [...procs].sort((a, b) => b.cpu - a.cpu).slice(0, ph - 3).forEach((p, i) =>
          S.put(2, y2 + 2 + i, String(p.pid).padStart(5) + ' ' + p.cmd.slice(0, W - 24).padEnd(W - 24) + ' ' + p.mem.toFixed(1).padStart(5) + ' ' + p.cpu.toFixed(1).padStart(6), p.cpu > 20 ? 'w' : p.cpu > 5 ? '' : 'd'));
      },
      key(k, ctrl) { if (isQuit(k, ctrl)) quitApp(); }
    };
  }

  /* ── vi ── */
  function vi(path) {
    const a = parts(path || 'untitled.txt'), name = a[a.length - 1], n = node(a);
    if (isDir(n)) return say(`vi: ${path}: is a directory`, 'r');
    let lines = (typeof n === 'string' ? n : '').split('\n'), cx = 0, cy = 0, top = 0, mode = 'n', cmd = '', pend = '', yank = [], undo = [], dirty = false, last = '';
    let msg = typeof n === 'string' ? `"${name}" ${lines.length}L` : `"${name}" [New File]`;
    const snap = () => { undo.push([lines.slice(), cx, cy]); if (undo.length > 50) undo.shift(); dirty = true; };
    const save = () => {
      const dir = node(a.slice(0, -1));
      if (!isDir(dir)) { msg = "E212: Can't open file for writing"; return false; }
      dir[name] = lines.join('\n'); dirty = false; msg = `"${name}" ${lines.length}L written`; return true;
    };
    const ex = c => {
      if (c === 'w') save();
      else if (c === 'q') dirty ? msg = 'E37: No write since last change (add ! to override)' : quitApp();
      else if (c === 'q!') quitApp();
      else if (c === 'wq' || c === 'x') save() && quitApp();
      else if (/^\d+$/.test(c)) { cy = c - 1; cx = 0; }
      else if (c) msg = 'E492: Not an editor command: ' + c;
    };
    const find = q => {
      for (let i = 0; i <= lines.length; i++) {
        const y = (cy + i) % lines.length, x = lines[y].indexOf(q, i ? 0 : cx + 1);
        if (x >= 0) { cy = y; cx = x; return; }
      }
      msg = 'E486: Pattern not found: ' + q;
    };
    const ins = s => { lines[cy] = lines[cy].slice(0, cx) + s + lines[cy].slice(cx); cx += s.length; };
    runApp({
      draw(S) {
        const h = S.r - 1, bar = mode === ':' || mode === '/';
        if (cy < top) top = cy; if (cy >= top + h) top = cy - h + 1;
        const left = Math.max(0, cx - S.c + 1);
        for (let y = 0; y < h; y++) { const l = lines[top + y]; l === undefined ? S.put(0, y, '~', 'b') : S.put(0, y, l.slice(left)); }
        if (bar) S.put(0, h, mode + cmd);
        else { S.put(0, h, mode === 'i' ? '-- INSERT --' : msg, mode === 'i' ? 'w' : ''); S.put(S.c - 10, h, ` ${cy + 1},${cx + 1}`); }
        if (bar) S.cl[h][Math.min(S.c - 1, 1 + cmd.length)] = 'cur'; else S.cl[cy - top][cx - left] = 'cur';
      },
      key(k, ctrl) {
        if (mode === 'i') {
          if (k === 'Escape' || (ctrl && (k === 'c' || k === '['))) { mode = 'n'; cx--; }
          else if (k === 'Enter') { const l = lines[cy]; lines.splice(cy, 1, l.slice(0, cx), l.slice(cx)); cy++; cx = 0; }
          else if (k === 'Backspace') {
            if (cx > 0) { lines[cy] = lines[cy].slice(0, cx - 1) + lines[cy].slice(cx); cx--; }
            else if (cy > 0) { cx = lines[cy - 1].length; lines.splice(cy - 1, 2, lines[cy - 1] + lines[cy]); cy--; }
          }
          else if (k === 'Tab') ins('  ');
          else if (k === 'ArrowLeft') cx--; else if (k === 'ArrowRight') cx++; else if (k === 'ArrowUp') cy--; else if (k === 'ArrowDown') cy++;
          else if (k.length === 1 && !ctrl) ins(k);
        } else if (mode === ':' || mode === '/') {
          if (k === 'Escape' || (ctrl && k === 'c')) mode = 'n';
          else if (k === 'Enter') { const m = mode; mode = 'n'; if (m === ':') { ex(cmd.trim()); if (!app) return; } else if (cmd) { last = cmd; find(cmd); } }
          else if (k === 'Backspace') { if (!cmd) mode = 'n'; cmd = cmd.slice(0, -1); }
          else if (k.length === 1) cmd += k;
        } else {
          const p = pend; pend = ''; msg = '';
          if (p === 'd' && k === 'd') { snap(); yank = lines.splice(cy, 1); if (!lines.length) lines = ['']; }
          else if (p === 'y' && k === 'y') { yank = [lines[cy]]; msg = '1 line yanked'; }
          else if (p === 'g' && k === 'g') cy = 0;
          else switch (k) {
            case 'h': case 'ArrowLeft': case 'Backspace': cx--; break;
            case 'l': case 'ArrowRight': case ' ': cx++; break;
            case 'j': case 'ArrowDown': case 'Enter': cy++; break;
            case 'k': case 'ArrowUp': cy--; break;
            case '0': cx = 0; break;
            case '$': cx = 1e9; break;
            case 'G': cy = lines.length - 1; break;
            case 'w': { const m = lines[cy].slice(cx).match(/^\S*\s+/); if (m && cx + m[0].length < lines[cy].length) cx += m[0].length; else if (cy < lines.length - 1) { cy++; cx = 0; } break; }
            case 'b': { const m = lines[cy].slice(0, cx).match(/\S+\s*$/); if (m) cx -= m[0].length; else if (cy > 0) { cy--; cx = 1e9; } break; }
            case 'i': snap(); mode = 'i'; break;
            case 'a': snap(); mode = 'i'; cx++; break;
            case 'A': snap(); mode = 'i'; cx = 1e9; break;
            case 'I': snap(); mode = 'i'; cx = 0; break;
            case 'o': snap(); lines.splice(++cy, 0, ''); cx = 0; mode = 'i'; break;
            case 'O': snap(); lines.splice(cy, 0, ''); cx = 0; mode = 'i'; break;
            case 'x': snap(); lines[cy] = lines[cy].slice(0, cx) + lines[cy].slice(cx + 1); break;
            case 'p': if (yank.length) { snap(); lines.splice(cy + 1, 0, ...yank); cy++; } break;
            case 'u': if (undo.length) [lines, cx, cy] = undo.pop(); else msg = 'Already at oldest change'; break;
            case 'n': if (last) find(last); break;
            case 'd': case 'y': case 'g': pend = k; break;
            case ':': case '/': mode = k; cmd = ''; break;
          }
        }
        cy = Math.max(0, Math.min(lines.length - 1, cy));
        cx = Math.max(0, Math.min(lines[cy].length - (mode === 'i' ? 0 : 1), cx));
      }
    });
  }

  /* ── neofetch ── */
  function neofetch() {
    const logo = ['      ___      ', '  ___/   \\___  ', ' /   \\___/   \\ ', ' \\___/ J \\___/ ', ' /   \\___/   \\ ', ' \\___/   \\___/ ', '     \\___/     '];
    const mo = (new Date().getFullYear() - 2022) * 12 + new Date().getMonth() - 2;
    const info = [
      ['', `${D.user}@${D.host}`], ['', '-'.repeat(D.user.length + D.host.length + 1)],
      ['OS', 'Jihoney OS 1.0 (Honeycomb)'], ['Host', `${D.education[0].school}, ${D.education[0].dept}`],
      ['Kernel', '6.11.17-honey'], ['Uptime', `${Math.floor(mo / 12)} yrs ${mo % 12} mos in AI (since Mar 2022)`],
      ['Packages', `${D.projects.length} (projects), ${D.publications.length} (papers), ${D.awards.length} (awards)`],
      ['Shell', 'jsh 1.0'], ['Resolution', `${innerWidth}x${innerHeight}`], ['DE', 'Honeycomb Desktop'], ['Terminal', 'jterm'],
      ['CPU', 'Caffeine-Cooled Brain (4) @ 3.14GHz'], ['GPU', 'PILL Lab GPU Cluster (sysadmin)'],
      ['Memory', `${(memUsed() * 1024) | 0}MiB / 16384MiB`], ['Focus', 'VLMs · Multimodal · Trustworthy AI'], ['Contact', D.email]
    ].map(([k, v]) => k ? `<span class="y">${k}</span>: ${esc(v)}` : `<span class="y">${esc(v)}</span>`);
    info.push('', [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<span class="k${i}">   </span>`).join(''));
    measure();
    if (cols < 62) { print(`<span class="y">${esc(logo.join('\n'))}</span>`); info.forEach(print); }
    else for (let i = 0; i < Math.max(logo.length, info.length); i++) print(`<span class="y">${esc(logo[i] || ' '.repeat(15))}</span>  ${info[i] || ''}`);
  }

  /* ── commands ── */
  const HELP = [
    ['help', 'this list'], ['ls [-la] [path]', 'list files'], ['cd, pwd, tree', 'move around'], ['cat <file>', 'print a file'],
    ['vi <file>', 'edit a file (i, Esc, :wq, dd, yy, p, u, /text)'], ['touch, mkdir, rm', 'create and remove'],
    ['neofetch', 'system info'], ['htop', 'process viewer (arrows, k to kill, q to quit)'], ['btop', 'resource monitor (q to quit)'],
    ['open <app>', 'open a window: ' + Object.keys(JOS.apps).join(', ')], ['bughunt, prix', 'play a game'],
    ['whoami, date, uname, uptime, ps, history, echo, clear, reboot, exit', '']
  ];
  const lsName = (k, n) => isDir(n) ? `<span class="b">${esc(k)}/</span>` : String(n).startsWith('#!jos') ? `<span class="g">${esc(k)}*</span>` : esc(k);
  const cmds = {
    help: () => HELP.forEach(([c, d]) => print(`  <span class="y">${esc(c.padEnd(18))}</span> ${esc(d)}`)),
    ls(args) {
      const flags = args.filter(a => a.startsWith('-')).join(''), p = args.find(a => !a.startsWith('-')) || '.', n = node(parts(p));
      if (n === undefined) return say(`ls: ${p}: No such file or directory`, 'r');
      if (!isDir(n)) return say(p);
      const ks = Object.keys(n).filter(k => flags.includes('a') || !k.startsWith('.')).sort();
      if (flags.includes('l')) ks.forEach(k => print(`${isDir(n[k]) ? 'drwxr-xr-x' : String(n[k]).startsWith('#!jos') ? '-rwxr-xr-x' : '-rw-r--r--'} ${D.user} ${String(isDir(n[k]) ? 4096 : n[k].length).padStart(5)} ${lsName(k, n[k])}`));
      else print(ks.map(k => lsName(k, n[k])).join('  '));
    },
    cd(args) { const a = parts(args[0] || '~'); isDir(node(a)) ? cwd = a : say(`cd: ${args[0]}: Not a directory`, 'r'); },
    pwd: () => say('/' + cwd.join('/')),
    cat(args) {
      if (!args.length) return say('usage: cat <file>');
      for (const p of args) {
        const n = node(parts(p));
        say(...(n === undefined ? [`cat: ${p}: No such file or directory`, 'r'] : isDir(n) ? [`cat: ${p}: Is a directory`, 'r'] : n.startsWith('#!jos') ? [`cat: ${p}: binary file — run it instead`, 'r'] : [n]));
      }
    },
    tree(args) {
      const walk = (n, pre) => Object.keys(n).filter(k => !k.startsWith('.')).sort().forEach((k, i, all) => {
        const lastOne = i === all.length - 1;
        print(esc(pre + (lastOne ? '└── ' : '├── ')) + lsName(k, n[k]));
        if (isDir(n[k])) walk(n[k], pre + (lastOne ? '    ' : '│   '));
      });
      const n = node(parts(args[0] || '.'));
      isDir(n) ? (say(args[0] || '.', 'b'), walk(n, '')) : say('tree: not a directory', 'r');
    },
    touch(args) { for (const p of args) { const a = parts(p), d = node(a.slice(0, -1)); if (isDir(d) && a.length && d[a[a.length - 1]] === undefined) d[a[a.length - 1]] = ''; } },
    mkdir(args) { for (const p of args) { const a = parts(p), d = node(a.slice(0, -1)); isDir(d) && a.length && d[a[a.length - 1]] === undefined ? d[a[a.length - 1]] = {} : say(`mkdir: ${p}: cannot create`, 'r'); } },
    rm(args) {
      const r = args.some(a => /^-.*r/.test(a));
      for (const p of args.filter(a => !a.startsWith('-'))) {
        const a = parts(p), d = node(a.slice(0, -1)), k = a[a.length - 1];
        if (!isDir(d) || !a.length || d[k] === undefined) say(`rm: ${p}: No such file or directory`, 'r');
        else if (isDir(d[k]) && !r) say(`rm: ${p}: is a directory (use -r)`, 'r');
        else delete d[k];
      }
    },
    echo: args => say(args.join(' ')),
    clear: () => { hist.innerHTML = ''; },
    whoami: () => say(D.user),
    hostname: () => say(D.host),
    date: () => say(new Date().toString()),
    uname: args => say(args[0] === '-a' ? `JihoneyOS ${D.host} 6.11.17-honey #1 SMP PREEMPT x86_64 GNU/Linux` : 'JihoneyOS'),
    uptime: () => say(` up ${upStr()},  1 user,  load average: 0.42, 0.37, 0.31`),
    history: () => past.forEach((l, i) => say(String(i + 1).padStart(4) + '  ' + l)),
    ps: () => { tickProcs(); say('  PID TTY          TIME CMD'); procs.forEach(p => say(`${String(p.pid).padStart(5)} pts/0    ${hms(p.time).padStart(8)} ${p.cmd}`)); },
    open(args) { if (!JOS.open(args[0])) say('usage: open <' + Object.keys(JOS.apps).join('|') + '>'); },
    sudo: args => say(/rm\s+-\w*r/.test(args.join(' ')) ? 'Nice try. The honey stays. 🍯' : `${D.user} is not in the sudoers file. This incident will be reported.`, 'r'),
    exit: () => setTimeout(() => JOS.close(win.id)),
    reboot: () => { try { sessionStorage.removeItem('jos'); } catch (e) { /* storage blocked: reload still reboots */ } location.reload(); },
    neofetch, htop: () => runApp(htop()), btop: () => runApp(btop()), vi: args => vi(args[0])
  };
  Object.assign(cmds, { top: cmds.htop, vim: cmds.vi, nvim: cmds.vi, nano: cmds.vi, ll: a => cmds.ls(['-la', ...a]), doom: () => JOS.open('bughunt'), race: () => JOS.open('prix') });
  for (const id in JOS.apps) if (!cmds[id]) cmds[id] = () => JOS.open(id);
  fs.bin = Object.fromEntries(Object.keys(cmds).map(c => [c, '#!jos ' + c]));

  function exec(line) {
    let [name, ...args] = (line.match(/"[^"]*"|'[^']*'|\S+/g) || []).map(t => t.replace(/^(["'])(.*)\1$/, '$2'));
    if (name.includes('/')) { // ./games/bughunt style: run an executable file
      const n = node(parts(name));
      if (typeof n !== 'string' || !n.startsWith('#!jos ')) return say(`jsh: ${name}: ${n === undefined ? 'No such file or directory' : 'Permission denied'}`, 'r');
      name = n.slice(6);
    }
    Object.hasOwn(cmds, name) ? cmds[name](args) : say(`jsh: command not found: ${name} (try 'help')`, 'r');
  }

  function complete() {
    const before = buf.slice(0, pos), m = before.match(/(\S*)$/)[1], first = !/\s/.test(before.trimStart());
    let c;
    if (first && !m.includes('/')) c = Object.keys(cmds).filter(k => k.startsWith(m));
    else {
      const i = m.lastIndexOf('/'), n = node(i < 0 ? cwd : parts(m.slice(0, i) || '/'));
      c = isDir(n) ? Object.keys(n).filter(k => k.startsWith(m.slice(i + 1))).map(k => m.slice(0, i + 1) + k + (isDir(n[k]) ? '/' : '')) : [];
    }
    if (!c.length) return;
    let pre = c[0];
    for (const k of c) while (!k.startsWith(pre)) pre = pre.slice(0, -1);
    if (pre.length > m.length) insert(pre.slice(m.length) + (c.length === 1 && !pre.endsWith('/') ? ' ' : ''));
    else if (c.length > 1) { print(ps1() + esc(buf)); say(c.join('  ')); }
  }

  function shellKey(k, ctrl) {
    if (ctrl) {
      if (k === 'c') { print(ps1() + esc(buf) + '^C'); buf = ''; pos = 0; }
      else if (k === 'l') hist.innerHTML = '';
      else if (k === 'u') { buf = buf.slice(pos); pos = 0; }
      else if (k === 'a') pos = 0;
      else if (k === 'e') pos = buf.length;
      else if (k === 'd' && !buf) return JOS.close(win.id);
    }
    else if (k === 'Enter') {
      const line = buf; buf = ''; pos = 0;
      print(ps1() + esc(line));
      if (line.trim()) { past.push(line); exec(line.trim()); }
      hi = past.length;
    }
    else if (k === 'Backspace') { if (pos) { buf = buf.slice(0, pos - 1) + buf.slice(pos); pos--; } }
    else if (k === 'Delete') buf = buf.slice(0, pos) + buf.slice(pos + 1);
    else if (k === 'ArrowLeft') pos = Math.max(0, pos - 1);
    else if (k === 'ArrowRight') pos = Math.min(buf.length, pos + 1);
    else if (k === 'Home') pos = 0;
    else if (k === 'End') pos = buf.length;
    else if (k === 'ArrowUp' || k === 'ArrowDown') { hi = Math.max(0, Math.min(past.length, hi + (k === 'ArrowUp' ? -1 : 1))); buf = past[hi] || ''; pos = buf.length; }
    else if (k === 'Tab') complete();
    else if (k.length === 1) insert(k);
    if (!app) renderLine();
  }

  /* ── input: one hidden textarea feeds both the shell and full-screen apps ──
     Physical keys arrive via keydown; soft keyboards and IMEs arrive via input events.
     The textarea always holds one sentinel space so a soft-keyboard backspace is detectable. */
  let sticky = false;
  const ctrlBtn = keys.querySelector('[data-k="Ctrl"]');
  const feed = (k, ctrl) => {
    if (sticky) { ctrl = true; sticky = false; ctrlBtn.classList.remove('on'); if (k.length === 1) k = k.toLowerCase(); }
    if (app) { app.key(k, ctrl); draw(); } else shellKey(k, ctrl);
  };
  const SPECIAL = /^(Enter|Backspace|Tab|Escape|Delete|Home|End|Arrow\w+|F\d+)$/;
  const drain = () => {
    const v = kbd.value.replace(' ', '');
    const erased = kbd.value === '';
    kbd.value = ' ';
    if (erased) return feed('Backspace');
    for (const ch of v) feed(ch === '\n' ? 'Enter' : ch);
  };
  kbd.value = ' ';
  kbd.addEventListener('keydown', e => {
    if (e.isComposing || e.metaKey) return;
    if (e.ctrlKey && e.key.length === 1) { if (e.key !== 'v') { e.preventDefault(); feed(e.key.toLowerCase(), true); } return; }
    if (SPECIAL.test(e.key)) { e.preventDefault(); feed(e.key, e.ctrlKey); }
  });
  kbd.addEventListener('input', e => { if (!e.isComposing) drain(); });
  kbd.addEventListener('compositionend', drain);
  kbd.addEventListener('focus', () => term.classList.add('focus'));
  kbd.addEventListener('blur', () => term.classList.remove('focus'));
  const focus = () => kbd.focus({ preventScroll: true });
  term.addEventListener('click', e => { if (!e.target.closest('.keys') && getSelection().isCollapsed) focus(); });
  const KEYMAP = { Esc: 'Escape', '↑': 'ArrowUp', '↓': 'ArrowDown', '←': 'ArrowLeft', '→': 'ArrowRight' };
  keys.addEventListener('pointerdown', e => e.preventDefault()); // keep the soft keyboard up
  keys.addEventListener('click', e => {
    const k = e.target.dataset.k;
    if (!k) return;
    if (k === 'Ctrl') { sticky = !sticky; ctrlBtn.classList.toggle('on', sticky); } else feed(KEYMAP[k] || k);
    focus();
  });
  const ro = new ResizeObserver(draw);
  ro.observe(term);

  print(`<span class="y">Jihoney OS 1.0</span> — type <span class="g">help</span> to get started.\nTry: <span class="g">neofetch</span> · <span class="g">htop</span> · <span class="g">btop</span> · <span class="g">vi about.txt</span> · <span class="g">ls projects</span>\n`);
  renderLine();
  JOS.term = { feed, exec: l => { exec(l); if (!app) renderLine(); } }; // handy for scripted checks
  return { onFocus: focus, destroy() { clearInterval(timer); ro.disconnect(); } };
};
