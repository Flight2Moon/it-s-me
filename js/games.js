/* Jihoney OS — games. Both are original mini-games drawn entirely with canvas code:
   bughunt = raycasting corridor shooter, prix = pseudo-3D road racer. */
JOS.games = (function () {
  let ac;
  const beep = (f, d = 0.08, type = 'square', v = 0.04) => {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.value = f; g.gain.value = v;
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + d);
      o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + d);
    } catch (e) { /* no audio: play silently */ }
  };
  const canvas = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')); return c; };
  const emoji = (e, tint) => canvas(64, 64, c => {
    c.font = '50px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, 32, 36);
    if (tint) { c.globalCompositeOperation = 'source-atop'; c.fillStyle = tint; c.fillRect(0, 0, 64, 64); }
  });
  const FONT = 'Silkscreen, monospace';

  /* Shared frame: canvas + touch pad + key state + paused-when-hidden loop.
     pad buttons are [label, keyCode, gridColumn, gridRow]. */
  function shell(root, W, H, left, right, tapCode) {
    const btn = ([l, code, col, row]) => `<button type="button" data-code="${code}" style="${col ? `grid-column:${col};grid-row:${row}` : ''}">${l}</button>`;
    root.innerHTML = `<div class="game"><canvas width="${W}" height="${H}" style="aspect-ratio:${W}/${H}"></canvas>` +
      `<div class="pad"><div>${left.map(btn).join('')}</div><div class="two">${right.map(btn).join('')}</div></div></div>`;
    const el = root.firstChild, cv = el.querySelector('canvas'), keys = {}, hits = new Set(); // hits: presses since last frame, so a quick tap is never missed
    const hold = (target, code) => {
      const set = v => e => { e.preventDefault(); keys[code] = v; if (v) hits.add(code); target.classList.toggle('down', v); if (v) target.setPointerCapture(e.pointerId); };
      target.addEventListener('pointerdown', set(true));
      for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) target.addEventListener(ev, set(false));
    };
    el.querySelectorAll('.pad button').forEach(b => hold(b, b.dataset.code));
    hold(cv, tapCode);
    let alive = true, last = performance.now(), raf;
    return {
      ctx: cv.getContext('2d'), keys, hits,
      run(step) {
        const frame = t => {
          if (!alive) return;
          raf = requestAnimationFrame(frame);
          const dt = Math.min(0.05, (t - last) / 1000); last = t;
          if (el.offsetParent) step(dt); // minimized window = paused
          hits.clear();
        };
        raf = requestAnimationFrame(frame);
        return {
          onKey(e, down) {
            if (/^(Arrow|Space|Enter|Key[WASDQE])/.test(e.code) && !e.metaKey && !e.ctrlKey) { e.preventDefault(); keys[e.code] = down; if (down && !e.repeat) hits.add(e.code); }
          },
          destroy() { alive = false; cancelAnimationFrame(raf); }
        };
      }
    };
  }
  const banner = (ctx, W, H, lines) => {
    ctx.fillStyle = 'rgba(18,16,12,.78)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    lines.forEach(([t, size, col], i) => { ctx.font = `${size}px ${FONT}`; ctx.fillStyle = col || '#fbf5e4'; ctx.fillText(t, W / 2, H / 2 - (lines.length - 1) * 9 + i * 18); });
    ctx.textAlign = 'left';
  };

  /* ───────────── BUG HUNT 3D ───────────── */
  function bughunt(root) {
    const W = 320, H = 200, VH = 176;
    const g = shell(root, W, H, [['▲', 'ArrowUp', 2, 1], ['◀', 'ArrowLeft', 1, 2], ['▼', 'ArrowDown', 2, 2], ['▶', 'ArrowRight', 3, 2]], [['FIRE', 'Space']], 'Space');
    const { ctx, keys, hits } = g;
    // # server rack wall, % honey brick wall, P player, B bug, A ammo, H honey (health)
    const MAP = [
      '################',
      '#P...%....B....#',
      '#....%.........#',
      '#....%..%%..A..#',
      '#..............#',
      '#%%.%%%%..%%%.%#',
      '#......%..%...B#',
      '#..B...%..%....#',
      '#.........%.H..#',
      '#..A...%..%%%%%#',
      '#%%%.%%%.......#',
      '#......%..B....#',
      '#.B....%...%%..#',
      '#......%...%%.B#',
      '#..H.......A..B#',
      '################'];
    const TEX = {
      '#': canvas(64, 64, c => {
        c.fillStyle = '#2b2e36'; c.fillRect(0, 0, 64, 64);
        for (let y = 4; y < 64; y += 12) {
          c.fillStyle = '#16181d'; c.fillRect(3, y, 58, 9);
          for (let x = 6; x < 58; x += 6) { c.fillStyle = (x * 7 + y * 13) % 5 === 0 ? '#f5b301' : (x + y) % 4 === 0 ? '#3ddc6a' : '#23303a'; c.fillRect(x, y + 3, 3, 3); }
        }
        c.fillStyle = '#454a55'; c.fillRect(0, 0, 2, 64); c.fillRect(62, 0, 2, 64);
      }),
      '%': canvas(64, 64, c => {
        c.fillStyle = '#d99a06'; c.fillRect(0, 0, 64, 64);
        for (let r = 0; r < 4; r++) {
          c.fillStyle = '#f5c542'; c.fillRect(0, r * 16 + 2, 64, 2);
          c.fillStyle = '#6b4700'; c.fillRect(0, r * 16, 64, 2);
          for (let x = r % 2 ? 16 : 0; x < 64; x += 32) c.fillRect(x, r * 16, 2, 16);
        }
      })
    };
    const SPR = { B: emoji('👾'), Bh: emoji('👾', '#fff'), A: emoji('🔋'), H: emoji('🍯') };
    const zb = new Float32Array(W);
    let map, things, px, py, pa, hp, ammo, kills, total, state = 'title', cool = 0, flash = 0, hurt = 0, bob = 0;

    function reset() {
      things = [];
      map = MAP.map((r, y) => r.split('').map((c, x) => {
        if (c === 'P') { px = x + 0.5; py = y + 0.5; }
        else if ('BAH'.includes(c)) things.push({ t: c, x: x + 0.5, y: y + 0.5, hp: 3, cd: 0, awake: false, hit: 0 });
        return c === '#' || c === '%' ? c : '.';
      }));
      pa = 0.4; hp = 100; ammo = 20; kills = 0; cool = 0.4; hurt = 0;
      total = things.filter(t => t.t === 'B').length;
    }
    const solid = (x, y) => map[y | 0][x | 0] !== '.';
    const sees = t => { // straight walk from bug to player without touching a wall
      const d = Math.hypot(px - t.x, py - t.y);
      for (let s = 0.2; s < d; s += 0.2) if (solid(t.x + (px - t.x) * s / d, t.y + (py - t.y) * s / d)) return false;
      return true;
    };

    function update(dt) {
      const pressed = hits.has('Space') || hits.has('Enter'), fire = pressed || keys.Space || keys.Enter;
      if (state !== 'play') { if (pressed) { reset(); state = 'play'; } return; }
      pa += ((keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0)) * 2.6 * dt;
      const mv = (keys.ArrowUp || keys.KeyW ? 1 : 0) - (keys.ArrowDown || keys.KeyS ? 1 : 0), st = (keys.KeyE ? 1 : 0) - (keys.KeyQ ? 1 : 0);
      const nx = px + (Math.cos(pa) * mv - Math.sin(pa) * st) * 3 * dt, ny = py + (Math.sin(pa) * mv + Math.cos(pa) * st) * 3 * dt;
      if (!solid(nx + Math.sign(nx - px) * 0.22, py)) px = nx;
      if (!solid(px, ny + Math.sign(ny - py) * 0.22)) py = ny;
      if (mv || st) bob += dt * 10;
      cool -= dt; flash -= dt; hurt = Math.max(0, hurt - dt * 2);

      if (fire && cool <= 0) {
        if (ammo > 0) {
          ammo--; cool = 0.28; flash = 0.07; beep(180, 0.09, 'sawtooth', 0.06);
          // hitscan against last frame's projections: nearest bug under the crosshair and in front of the wall
          const t = things.filter(t => t.t === 'B' && t.ty > 0 && t.ty < zb[W >> 1] && Math.abs(t.sx - W / 2) < t.sw * 0.4).sort((a, b) => a.ty - b.ty)[0];
          if (t) {
            t.hp--; t.hit = 0.12; t.awake = true;
            if (t.hp <= 0) { things.splice(things.indexOf(t), 1); kills++; beep(90, 0.2, 'square', 0.06); }
          }
        } else { cool = 0.4; beep(60, 0.05); }
      }
      for (const t of [...things]) {
        const d = Math.hypot(px - t.x, py - t.y);
        if (t.t === 'B') {
          t.hit -= dt;
          if (!t.awake && d < 8 && sees(t)) t.awake = true;
          if (!t.awake) continue;
          if (d > 0.8) {
            const vx = (px - t.x) / d * 1.4 * dt, vy = (py - t.y) / d * 1.4 * dt;
            if (!solid(t.x + vx + Math.sign(vx) * 0.25, t.y)) t.x += vx;
            if (!solid(t.x, t.y + vy + Math.sign(vy) * 0.25)) t.y += vy;
          } else if ((t.cd -= dt) <= 0) { t.cd = 0.7; hp -= 9; hurt = 1; beep(70, 0.12, 'square', 0.06); }
        } else if (d < 0.6 && (t.t === 'A' || hp < 100)) {
          if (t.t === 'A') ammo += 10; else hp = Math.min(100, hp + 30);
          things.splice(things.indexOf(t), 1); beep(660, 0.08);
        }
      }
      if (hp <= 0) { hp = 0; state = 'dead'; } else if (kills === total) state = 'win';
    }

    function render() {
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, VH); ctx.clip();
      ctx.fillStyle = '#17141c'; ctx.fillRect(0, 0, W, VH / 2);
      const fl = ctx.createLinearGradient(0, VH / 2, 0, VH); fl.addColorStop(0, '#1a1408'); fl.addColorStop(1, '#6b4d12');
      ctx.fillStyle = fl; ctx.fillRect(0, VH / 2, W, VH / 2);
      const dx = Math.cos(pa), dy = Math.sin(pa), plx = -dy * 0.66, ply = dx * 0.66;
      for (let x = 0; x < W; x++) { // one DDA ray per screen column
        const cam = 2 * x / W - 1, rx = dx + plx * cam, ry = dy + ply * cam;
        let mx = px | 0, my = py | 0, side = 0;
        const ddx = Math.abs(1 / rx), ddy = Math.abs(1 / ry), sx = rx < 0 ? -1 : 1, sy = ry < 0 ? -1 : 1;
        let sdx = (rx < 0 ? px - mx : mx + 1 - px) * ddx, sdy = (ry < 0 ? py - my : my + 1 - py) * ddy;
        do { if (sdx < sdy) { sdx += ddx; mx += sx; side = 0; } else { sdy += ddy; my += sy; side = 1; } } while (map[my][mx] === '.');
        const d = Math.max(0.05, side ? sdy - ddy : sdx - ddx), lh = VH / d;
        let wx = side ? px + d * rx : py + d * ry; wx -= Math.floor(wx);
        zb[x] = d;
        ctx.drawImage(TEX[map[my][mx]], (wx * 64) | 0, 0, 1, 64, x, (VH - lh) / 2, 1, lh);
        ctx.fillStyle = `rgba(0,0,0,${Math.min(0.85, d / 9 + side * 0.18)})`; ctx.fillRect(x, (VH - lh) / 2, 1, lh);
      }
      const inv = 1 / (plx * dy - dx * ply);
      for (const t of things) { const rx = t.x - px, ry = t.y - py; t.tx = inv * (dy * rx - dx * ry); t.ty = inv * (-ply * rx + plx * ry); }
      for (const t of [...things].sort((a, b) => b.ty - a.ty)) { // far to near, clipped per column against walls
        if (t.ty <= 0.1) continue;
        const size = VH / t.ty * (t.t === 'B' ? 0.8 : 0.45), cx = W / 2 * (1 + t.tx / t.ty), x0 = cx - size / 2, y0 = VH / 2 + VH / t.ty / 2 - size;
        t.sx = cx; t.sw = size;
        const img = t.t === 'B' ? (t.hit > 0 ? SPR.Bh : SPR.B) : SPR[t.t];
        for (let x = Math.max(0, x0 | 0); x < Math.min(W, x0 + size); x++) if (t.ty < zb[x]) ctx.drawImage(img, ((x - x0) / size * 64) | 0, 0, 1, 64, x, y0, 1, size);
      }
      const gy = VH - 4 + Math.abs(Math.sin(bob)) * 4, gx = W / 2;
      if (flash > 0) { ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.arc(gx, gy - 46, 9 + Math.random() * 5, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#2b2e36'; ctx.fillRect(gx - 4, gy - 46, 8, 30);
      ctx.fillStyle = '#f5b301'; ctx.fillRect(gx - 10, gy - 24, 20, 30);
      ctx.fillStyle = '#1a1612'; ctx.fillRect(gx - 10, gy - 16, 20, 3); ctx.fillRect(gx - 10, gy - 8, 20, 3);
      ctx.fillStyle = '#fbf5e4'; ctx.fillRect(gx - 4, VH / 2, 9, 1); ctx.fillRect(gx, VH / 2 - 4, 1, 9);
      if (hurt > 0) { ctx.fillStyle = `rgba(255,40,30,${hurt * 0.45})`; ctx.fillRect(0, 0, W, VH); }
      ctx.restore();
      ctx.fillStyle = '#1a1612'; ctx.fillRect(0, VH, W, H - VH);
      ctx.fillStyle = '#f5b301'; ctx.fillRect(0, VH, W, 2);
      ctx.font = `8px ${FONT}`; ctx.textBaseline = 'middle';
      [[`HP ${hp}`, hp < 30 ? '#ff6b5e' : '#8fd16a'], [`AMMO ${ammo}`, ammo ? '#f5b301' : '#ff6b5e'], [`BUGS FIXED ${kills}/${total}`, '#fbf5e4']]
        .forEach(([s, c], i) => { ctx.fillStyle = c; ctx.fillText(s, 10 + i * 92, VH + 13); });
      ctx.textBaseline = 'alphabetic';
      if (state === 'title') banner(ctx, W, H, [['BUG HUNT 3D', 22, '#f5b301'], ['Bugs got into the GPU cluster.', 8], ['Arrows / WASD move · Space fires', 8], ['Press FIRE to start', 8, '#8fd16a']]);
      if (state === 'win') banner(ctx, W, H, [['ALL BUGS FIXED', 20, '#8fd16a'], ['Ship it. 🍯', 8], ['Press FIRE to play again', 8]]);
      if (state === 'dead') banner(ctx, W, H, [['SEGFAULT', 22, '#ff6b5e'], [`You fixed ${kills} of ${total} bugs.`, 8], ['Press FIRE to retry', 8]]);
    }
    reset();
    return g.run(dt => { update(dt); render(); });
  }

  /* ───────────── HONEY PRIX ───────────── */
  function prix(root) {
    const W = 400, H = 250, SEG = 200, ROAD = 2000, CAMH = 1000, DEPTH = 0.84, DRAW = 140, MAX = SEG * 52, PLAYER_Z = 900;
    const g = shell(root, W, H, [['◀', 'ArrowLeft', 1, 1], ['▶', 'ArrowRight', 2, 1]], [['BRK', 'ArrowDown'], ['GAS', 'ArrowUp']], 'ArrowUp');
    const { ctx, keys, hits } = g;
    const segs = [];
    const push = curve => segs.push({ i: segs.length, curve, sprites: [] });
    for (const [n, c] of [[60, 0], [30, 3], [40, 0], [30, -4], [20, 2], [80, 0], [40, -2], [25, 5], [50, 0], [30, -5], [30, 4], [70, 0], [35, -3], [35, 3], [60, 0], [25, 6], [45, -2], [90, 0]]) {
      if (!c) { for (let i = 0; i < n; i++) push(0); continue; }
      for (let i = 0; i < n; i++) push(c * (i / n) ** 2);       // ease in
      for (let i = 0; i < n; i++) push(c);                      // hold
      for (let i = 0; i < n; i++) push(c * (1 - (i / n) ** 2)); // ease out
    }
    const N = segs.length, TL = N * SEG;
    const board = text => canvas(120, 110, c => {
      c.fillStyle = '#1a1612'; c.fillRect(18, 60, 6, 50); c.fillRect(96, 60, 6, 50); c.fillRect(0, 0, 120, 66);
      c.fillStyle = '#f5b301'; c.fillRect(4, 4, 112, 58);
      c.fillStyle = '#1a1612'; c.textAlign = 'center'; c.font = `700 15px ${FONT}`;
      text.split('\n').forEach((l, i, a) => c.fillText(l, 60, 38 - (a.length - 1) * 9 + i * 18));
    });
    const BOARDS = ['VLM\nRESEARCH', 'UNIST\nUVLL', 'DONG-A\nAI', 'PILL\nLAB', 'DCASE\n2024', 'SoLA\n2026', 'CODE:MEDI\n1ST', 'HIRE\nJIHEON'].map(board);
    const TREES = ['🌲', '🌻', '🌳'].map(e => emoji(e));
    segs.forEach(s => {
      if (s.i % 10 === 5) s.sprites.push({ img: TREES[s.i % 3], off: (s.i % 20 === 5 ? -1 : 1) * (1.5 + (s.i * 7 % 10) / 8), w: 520 });
      if (s.i % 55 === 30) s.sprites.push({ img: BOARDS[(s.i / 55 | 0) % BOARDS.length], off: (s.i / 55 | 0) % 2 ? 1.7 : -1.7, w: 1100 });
    });
    const carImg = (body, cabin, stripes) => canvas(80, 50, c => {
      c.fillStyle = '#111'; c.fillRect(5, 32, 17, 16); c.fillRect(58, 32, 17, 16);
      c.fillStyle = body; c.fillRect(8, 14, 64, 26);
      if (stripes) { c.fillStyle = '#1a1612'; c.fillRect(28, 14, 7, 26); c.fillRect(45, 14, 7, 26); }
      c.fillStyle = cabin; c.fillRect(17, 3, 46, 14);
      c.fillStyle = '#9fd3ff'; c.fillRect(21, 6, 38, 8);
      c.fillStyle = '#ff3b30'; c.fillRect(10, 24, 11, 6); c.fillRect(59, 24, 11, 6);
      c.fillStyle = '#000'; c.fillRect(8, 37, 64, 3);
    });
    const ME = carImg('#f5b301', '#c98a00', true);
    const RIVALS = [['#e5484d', '#a32226'], ['#3b82f6', '#1e4fa8'], ['#fbf5e4', '#b9b09a'], ['#8b5cf6', '#5b34b8'], ['#22c55e', '#13803b']].map(([b, c]) => carImg(b, c));
    const cars = Array.from({ length: 16 }, (_, i) => ({ z: (i + 1) * TL / 17, off: [-0.62, 0, 0.62][i % 3], speed: MAX * (0.3 + (i * 37 % 10) / 28), img: RIVALS[i % RIVALS.length] }));
    let pos = 0, x = 0, speed = 0, lap = 1, lapT = 0, lastLap = 0, sky = 0, state = 'title', best = 0;
    try { best = +localStorage.getItem('jos-prix-best') || 0; } catch (e) { /* no storage: best time just isn't remembered */ }

    function update(dt) {
      const gas = keys.ArrowUp || keys.KeyW || keys.Space || hits.has('ArrowUp') || hits.has('Space'), brake = keys.ArrowDown || keys.KeyS;
      if (state === 'title') { if (gas) state = 'play'; else return; }
      const sp = speed / MAX, base = segs[(pos / SEG | 0) % N];
      x += ((keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0)) * 2.2 * sp * dt;
      x -= base.curve * sp * sp * 0.3 * dt; // centrifugal push on curves
      x = Math.max(-2.2, Math.min(2.2, x));
      speed += (gas ? MAX / 5 : brake ? -MAX : -MAX / 5) * dt;
      if (Math.abs(x) > 1 && speed > MAX / 4) speed -= MAX / 1.6 * dt; // grass
      speed = Math.max(0, Math.min(MAX, speed));
      pos += speed * dt; lapT += dt; sky += base.curve * sp * dt * 30;
      if (pos >= TL) {
        pos -= TL; lap++; lastLap = lapT; lapT = 0; beep(880, 0.2, 'square', 0.05);
        if (!best || lastLap < best) { best = lastLap; try { localStorage.setItem('jos-prix-best', best); } catch (e) { /* see above */ } }
      }
      for (const c of cars) {
        c.z = (c.z + c.speed * dt) % TL;
        const dz = (c.z - pos + TL) % TL;
        if (Math.abs(dz - PLAYER_Z) < 240 && Math.abs(c.off - x) < 0.42 && speed > c.speed) { speed = c.speed * 0.6; beep(110, 0.15, 'sawtooth', 0.06); }
      }
    }

    const quad = (col, x1, y1, w1, x2, y2, w2) => {
      ctx.fillStyle = col; ctx.beginPath();
      ctx.moveTo(x1 - w1, y1); ctx.lineTo(x2 - w2, y2); ctx.lineTo(x2 + w2, y2); ctx.lineTo(x1 + w1, y1); ctx.fill();
    };
    function render() {
      const hz = H / 2, skyG = ctx.createLinearGradient(0, 0, 0, hz);
      skyG.addColorStop(0, '#2b1a4a'); skyG.addColorStop(0.6, '#ff7a3d'); skyG.addColorStop(1, '#ffd36b');
      ctx.fillStyle = skyG; ctx.fillRect(0, 0, W, hz);
      ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(W / 2 - sky * 0.3, hz - 26, 20, 0, 7); ctx.fill();
      ctx.fillStyle = '#5a2d52';
      for (let hx = -(((sky % 130) + 130) % 130) - 130; hx < W + 130; hx += 130) { ctx.beginPath(); ctx.moveTo(hx, hz); ctx.lineTo(hx + 65, hz - 36); ctx.lineTo(hx + 130, hz); ctx.fill(); }
      ctx.fillStyle = '#528334'; ctx.fillRect(0, hz, W, hz);

      const bi = (pos / SEG | 0) % N, pct = (pos % SEG) / SEG;
      const proj = (z, cx) => { const sc = DEPTH / Math.max(z, 40); return [W / 2 + sc * cx * W / 2, hz + sc * CAMH * hz, sc * ROAD * W / 2, sc]; };
      let cx = 0, dcx = -segs[bi].curve * pct, maxy = H;
      const vis = [];
      for (let n = 0; n < DRAW; n++) { // near to far, each strip clipped by the one in front
        const s = segs[(bi + n) % N], z1 = n * SEG - pct * SEG;
        const p1 = proj(z1, cx - x * ROAD), p2 = proj(z1 + SEG, cx + dcx - x * ROAD);
        cx += dcx; dcx += s.curve;
        vis.push([s, p1, p2]);
        if (z1 + SEG <= 40 || p2[1] >= maxy) continue;
        const dark = (s.i / 3 | 0) % 2;
        ctx.fillStyle = dark ? '#528334' : '#5b8f3a'; ctx.fillRect(0, p2[1], W, p1[1] - p2[1] + 1);
        quad(dark ? '#1a1612' : '#f5b301', p1[0], p1[1], p1[2] * 1.14, p2[0], p2[1], p2[2] * 1.14);
        quad(s.i < 3 ? '#fbf5e4' : dark ? '#55524e' : '#5e5b56', p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]);
        if (!dark) for (const l of [-1 / 3, 1 / 3]) quad('#fbf5e4', p1[0] + p1[2] * l, p1[1], p1[2] / 40, p2[0] + p2[2] * l, p2[1], p2[2] / 40);
        maxy = p2[1];
      }
      const carsAt = {};
      for (const c of cars) (carsAt[(c.z / SEG | 0) % N] = carsAt[(c.z / SEG | 0) % N] || []).push(c);
      const sprite = (img, wWorld, px, py, sc) => { const w = sc * wWorld * W / 2, h = w * img.height / img.width; if (w > 1.5) ctx.drawImage(img, px - w / 2, py - h, w, h); };
      for (let n = vis.length - 1; n > 0; n--) { // far to near
        const [s, p1, p2] = vis[n];
        for (const sp of s.sprites) sprite(sp.img, sp.w, p1[0] + p1[2] * sp.off, p1[1], p1[3]);
        for (const c of carsAt[s.i] || []) {
          const f = (c.z % SEG) / SEG, sc = p1[3] + (p2[3] - p1[3]) * f;
          sprite(c.img, 620, p1[0] + (p2[0] - p1[0]) * f + (p1[2] + (p2[2] - p1[2]) * f) * c.off, p1[1] + (p2[1] - p1[1]) * f, sc);
        }
      }
      const steer = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0);
      const shake = speed > 0 ? Math.sin(pos / 60) * (Math.abs(x) > 1 ? 2.5 : 0.8) : 0;
      ctx.drawImage(ME, W / 2 - 52 + steer * 5, H - 70 + shake, 104, 65);

      ctx.font = `10px ${FONT}`; ctx.fillStyle = '#fbf5e4'; ctx.strokeStyle = '#1a1612'; ctx.lineWidth = 3;
      const hud = (s, hx, right) => { ctx.textAlign = right ? 'right' : 'left'; ctx.strokeText(s, hx, 14); ctx.fillText(s, hx, 14); };
      hud(`${Math.round(speed / MAX * 300)} KM/H`, 8); hud(`LAP ${lap}  ${lapT.toFixed(1)}s`, W / 2 - 40);
      hud(best ? `BEST ${best.toFixed(1)}s` : 'BEST --', W - 8, true);
      ctx.textAlign = 'left';
      if (state === 'title') banner(ctx, W, H, [['HONEY PRIX', 24, '#f5b301'], ['←  → steer · ↑ gas · ↓ brake', 9], ['Overtake traffic, beat your best lap', 9], ['Hold GAS to start', 9, '#8fd16a']]);
    }
    return g.run(dt => { update(dt); render(); });
  }

  return { bughunt, prix };
})();
