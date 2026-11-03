// Chapter 3: how a satellite measures – passive and active remote sensing.
// A flat schematic side view (not to scale): space with the satellite, the
// atmosphere with a thin ice cloud, a dust layer, a thick cloud with rain,
// land and sea. Short wavy pieces stand for radiation.
//   passive: VIS – sunlight reflected by cloud and ground (not at night)
//            IR  – heat radiation from the ground and the (cold) cloud top
//            WV  – emission of the water vapour layer; heat from below is swallowed
//   active:  radar / lidar – a pulse goes straight down, echoes come back in the
//            order of their height (time of flight = distance); the lidar is
//            stopped by the thick cloud. Scatterometer – a slanted pulse onto
//            the sea; the rougher (windier) the sea, the stronger the echo.
(() => {
  'use strict';
  const C = window.THEME.measure, T = window.TEXTS.messen;

  // ============ DOM ============
  const frame = document.getElementById('stage-frame');
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const chart = document.getElementById('chart');
  const cctx = chart.getContext('2d');
  const modeChips = [...document.querySelectorAll('.chip-btn[data-mode]')];
  const instChips = [...document.querySelectorAll('.chip-btn[data-inst]')];
  const pulseBtn = document.getElementById('pulse-btn');
  const nightBtn = document.getElementById('night-btn');
  const windField = document.getElementById('wind-field');
  const windIn = document.getElementById('wind');
  const windOut = document.getElementById('wind-out');
  const badge = SCAPE.badge(frame);
  const tasks = SCAPE.taskDialog('measure-tasks');

  const state = {
    mode: 'passive', inst: { passive: 'vis', active: 'radar' }, night: false, wind: 6,
    packets: [], pulse: null, echoes: [], scatterResult: null,
    arrivals: { sun: 0, ground: 0, cloud: 0, vapour: 0 }, seenNight: { vis: false, ir: false }
  };
  const inst = () => state.inst[state.mode];

  // ============ GEOMETRY (recomputed on resize) ============
  let W = 0, H = 0, DPR = 1, g = {};
  const resize = () => {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = frame.clientWidth; H = frame.clientHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    const yG = H * 0.86, yT = H * 0.30;
    // narrow stages: the satellite moves right, clear of the mode chips top left
    const narrow = W < 560, sx = narrow ? W * 0.6 : W * 0.5;
    g = {
      space: H * (narrow ? 0.23 : 0.2), sat: [sx, H * (narrow ? 0.16 : 0.11)], sun: [W * 0.9, H * 0.1], sunR: Math.min(W, H) * 0.04,
      yG, km: h => yG - h * (yG - yT) / 12,
      seaX: sx + W * (narrow ? 0.12 : 0.17), xb: sx, target: [sx + W * 0.3, yG],
      cloud: [sx - W * 0.15, sx + W * 0.15], rain: [sx - W * 0.1, sx + W * 0.1], cirrus: [sx - W * 0.32, sx + W * 0.28],
      s: Math.max(0.8, Math.min(1.6, Math.min(W, H) / 480))
    };
    const cw = chart.clientWidth || 300;
    chart.width = Math.round(cw * DPR); chart.height = Math.round(170 * DPR);
  };

  // ============ SCENE ============
  const rnd = (a, b) => a + Math.random() * (b - a);
  const cloudTop = x => {           // the cumulus: top between 3 and 4 km, rounded
    const [a, b] = g.cloud, f = (x - a) / (b - a);
    if (f <= 0 || f >= 1) return null;
    return 4 - 1.6 * Math.pow(Math.abs(f - 0.5) * 2, 2.2) + 0.25 * Math.sin(f * 18);
  };

  const drawSatellite = () => {
    const [x, y] = g.sat, s = g.s;
    ctx.fillStyle = C.satellite; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    const rect = (rx, ry, rw, rh) => { ctx.fillRect(rx, ry, rw, rh); ctx.strokeRect(rx, ry, rw, rh); };
    rect(x - 12 * s, y - 12 * s, 24 * s, 24 * s);
    rect(x - 54 * s, y - 7 * s, 36 * s, 14 * s); rect(x + 18 * s, y - 7 * s, 36 * s, 14 * s);
    ctx.beginPath(); ctx.moveTo(x - 18 * s, y); ctx.lineTo(x - 12 * s, y); ctx.moveTo(x + 12 * s, y); ctx.lineTo(x + 18 * s, y); ctx.stroke();
    // the instrument: a lens (passive) or a dish (active)
    ctx.beginPath();
    if (state.mode === 'passive') ctx.arc(x, y + 15 * s, 5 * s, 0, 2 * Math.PI);
    else ctx.ellipse(x, y + 16 * s, 11 * s, 5 * s, 0, 0, Math.PI);
    ctx.fillStyle = C.ink; ctx.fill();
  };

  const label = (text, x, y, align = 'left', color = C.ink) => {
    ctx.font = '500 ' + Math.round(11 * Math.max(1, g.s * 0.9)) + 'px ' + window.THEME.font;
    ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
    ctx.fillText(text.toUpperCase(), x, y);
  };

  const drawScene = (now) => {
    const night = state.mode === 'passive' && state.night;
    // space and sky
    ctx.fillStyle = C.space; ctx.fillRect(0, 0, W, g.space);
    ctx.fillStyle = night ? C.night : C.sky; ctx.fillRect(0, g.space, W, g.yG - g.space);
    // water vapour layer (5–10 km) in the WV channel
    if (state.mode === 'passive' && inst() === 'wv') {
      ctx.fillStyle = C.vapour; ctx.globalAlpha = 0.28; ctx.fillRect(0, g.km(10), W, g.km(5) - g.km(10)); ctx.globalAlpha = 1;
      label(T.scene.vapour, 10, g.km(9.4), 'left', night ? C.inkInverse : C.ink);
    }
    // cirrus (10–11 km)
    ctx.fillStyle = C.cloud; ctx.strokeStyle = C.cloudLine; ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const x = g.cirrus[0] + (i + 0.5) / 6 * (g.cirrus[1] - g.cirrus[0]);
      ctx.beginPath(); ctx.ellipse(x, g.km(10.5 + 0.2 * Math.sin(i * 2.1)), (g.cirrus[1] - g.cirrus[0]) / 11, 3.2 * g.s, 0, 0, 2 * Math.PI);
      ctx.fill(); ctx.stroke();
    }
    label(T.scene.cirrus, g.cirrus[0], g.km(11.7), 'left', night ? C.inkInverse : C.ink);
    // dust (5.5–6.5 km)
    ctx.fillStyle = C.aerosol;
    for (let i = 0; i < 90; i++) {
      const x = ((i * 0.6180339) % 1) * W * 0.92 + W * 0.04, h = 5.5 + ((i * 0.381966) % 1);
      ctx.beginPath(); ctx.arc(x, g.km(h), 1.8 * g.s, 0, 2 * Math.PI); ctx.fill();
    }
    label(T.scene.dust, W * 0.96, g.km(6.95), 'right', night ? C.inkInverse : C.ink);
    // rain (0–1 km)
    ctx.strokeStyle = C.rain; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 26; i++) {
      const x = g.rain[0] + ((i * 0.6180339) % 1) * (g.rain[1] - g.rain[0]);
      const y0 = g.km(1.05) + ((i * 0.7548776 + now / 900) % 1) * (g.yG - g.km(1.05));
      ctx.moveTo(x, y0); ctx.lineTo(x - 3 * g.s, y0 + 8 * g.s);
    }
    ctx.stroke();
    // the cumulus (1–4 km): a row of circles over a flat base
    ctx.fillStyle = C.cloud; ctx.strokeStyle = C.cloudLine; ctx.lineWidth = 1.5;
    ctx.beginPath();
    const [ca, cb] = g.cloud, base = g.km(1);
    ctx.moveTo(ca, base);
    for (let i = 0; i <= 40; i++) { const x = ca + i / 40 * (cb - ca), top = cloudTop(x); ctx.lineTo(x, top === null ? base : g.km(top)); }
    ctx.lineTo(cb, base); ctx.closePath(); ctx.fill(); ctx.stroke();
    // ground: land and sea
    ctx.fillStyle = night ? C.nightGround : C.ground; ctx.fillRect(0, g.yG, g.seaX, H - g.yG);
    ctx.fillStyle = night ? C.seaDeep : C.sea; ctx.fillRect(g.seaX, g.yG, W - g.seaX, H - g.yG);
    // waves (scatterometer: the wind roughens the sea)
    const amp = state.mode === 'active' && inst() === 'scatter' ? 0.6 + state.wind * 0.22 : 1.2;
    ctx.strokeStyle = C.seaDeep; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let x = g.seaX; x <= W; x += 2) { const y = g.yG + 1 + amp * g.s * (1 + Math.sin((x + now / 30) / (6 * g.s))); if (x === g.seaX) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.stroke();
    if (state.mode === 'active' && inst() === 'scatter') {
      // wind arrows over the sea
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
      const n = Math.round(state.wind / 5);
      for (let i = 0; i < n; i++) {
        const y = g.yG - (10 + i * 12) * g.s, x = g.seaX + 12 + ((i * 37 + now / 20 * (0.3 + state.wind / 25)) % (W - g.seaX - 50));
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 22 * g.s, y); ctx.lineTo(x + 17 * g.s, y - 4 * g.s); ctx.moveTo(x + 22 * g.s, y); ctx.lineTo(x + 17 * g.s, y + 4 * g.s); ctx.stroke();
      }
    }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, g.yG); ctx.lineTo(W, g.yG); ctx.stroke();
    label(T.scene.land, 10, g.yG + (H - g.yG) / 2, 'left', night ? C.inkInverse : C.ink);
    label(T.scene.sea, W - 10, g.yG + (H - g.yG) / 2 + 3, 'right', night ? C.inkInverse : C.ink);
    // sun or night
    if (state.mode === 'passive' && !night) {
      const [sx, sy] = g.sun;
      ctx.fillStyle = C.sun; ctx.beginPath(); ctx.arc(sx, sy, g.sunR, 0, 2 * Math.PI); ctx.fill();
      ctx.strokeStyle = C.sun; ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.moveTo(sx + Math.cos(a) * g.sunR * 1.3, sy + Math.sin(a) * g.sunR * 1.3); ctx.lineTo(sx + Math.cos(a) * g.sunR * 1.65, sy + Math.sin(a) * g.sunR * 1.65); }
      ctx.stroke();
    }
    if (night) label(T.scene.night, 12, g.space + 16, 'left', C.inkInverse);
  };

  // ============ RADIATION PACKETS ============
  // A packet runs along a path of points at a fixed speed; it may die at
  // point index `dieAt` (absorbed), and reports `onArrive` at the path's end.
  const SPEED = () => Math.max(W, H) * 0.55;       // px per second
  const addPacket = (pts, color, width, extra = {}) => {
    let len = 0; const segs = [];
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); len += l; }
    state.packets.push(Object.assign({ pts, segs, len, d: 0, color, width, speed: SPEED() }, extra));
  };
  const posOn = (p, d) => {
    let i = 0;
    while (i < p.segs.length - 1 && d > p.segs[i]) { d -= p.segs[i]; i++; }
    const a = p.pts[i], b = p.pts[i + 1], f = Math.min(1, d / (p.segs[i] || 1));
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, Math.atan2(b[1] - a[1], b[0] - a[0])];
  };
  const drawPacket = p => {
    const L = 26 * g.s, A = 3.2 * g.s;
    const [x, y, ang] = posOn(p, p.d);
    const c = Math.cos(ang), s = Math.sin(ang);
    ctx.strokeStyle = p.color; ctx.lineWidth = p.width; ctx.globalAlpha = p.alpha == null ? 1 : p.alpha;
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const u = -L + i / 16 * L, v = A * Math.sin(i / 16 * 4 * Math.PI);
      const px = x + u * c - v * s, py = y + u * s + v * c;
      if (!i) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke(); ctx.globalAlpha = 1;
  };

  // ---- passive sources ----
  let spawnAcc = 0;
  const satIn = () => [g.sat[0] + rnd(-6, 6) * g.s, g.sat[1] + 16 * g.s];
  const spawnPassive = () => {
    const ch = inst();
    if (ch === 'vis') {
      if (state.night) return;
      const r = Math.random();
      let x, y, reflect, src = 'sun';
      if (r < 0.55) { x = rnd(g.cloud[0] + 8, g.cloud[1] - 8); y = g.km(cloudTop(x)); reflect = 0.9; }
      else if (r < 0.8) { x = rnd(W * 0.05, g.cloud[0] - 10); y = g.yG; reflect = 0.35; }
      else { x = rnd(g.seaX + 10, W * 0.97); y = g.yG; reflect = 0.08; }
      const back = Math.random() < reflect;
      addPacket(back ? [g.sun, [x, y], satIn()] : [g.sun, [x, y]], C.sunRay, 2.5, { src: back ? src : null });
    } else {
      // heat from the ground (warm: strong) – swallowed by the cloud above it or, at 6.3 µm, by the water vapour
      const n = Math.random();
      if (n < 0.55) {
        const x = rnd(W * 0.03, W * 0.97);
        const top = cloudTop(x);
        const stopAt = ch === 'wv' ? g.km(rnd(4.2, 5.6)) : top !== null ? g.km(1) : null;
        const end = satIn();
        if (stopAt) addPacket([[x, g.yG], [x + (end[0] - x) * (g.yG - stopAt) / (g.yG - end[1]), stopAt]], C.heat, 3, { fade: true });
        else addPacket([[x, g.yG], end], C.heat, 3, { src: 'ground' });
      } else if (n < 0.75 || ch === 'ir') {
        // the cold cloud top: weak heat radiation
        const x = rnd(g.cloud[0] + 10, g.cloud[1] - 10), y = g.km(cloudTop(x));
        if (ch === 'wv') addPacket([[x, y], [x, g.km(5.5)]], C.radar, 1.5, { fade: true });
        else addPacket([[x, y], satIn()], C.radar, 1.5, { src: 'cloud' });
      }
      if (ch === 'wv') {
        const x = rnd(W * 0.03, W * 0.97), y = g.km(rnd(5.2, 9.8));
        addPacket([[x, y], satIn()], C.vapourRay, 2.5, { src: 'vapour' });
      }
    }
  };

  // ---- active: pulses and echoes ----
  // targets straight below the satellite: height (km), echo strength for radar and lidar
  const TARGETS = [
    { key: 'cirrus', h: 10.5, radar: 0.12, lidar: 0.75 },
    { key: 'dust', h: 6, radar: 0, lidar: 0.4 },
    { key: 'cloud', h: 3.9, radar: 0.45, lidar: 1, blocks: 'lidar' },
    { key: 'cloud', h: 2.6, radar: 0.55, lidar: 0 },
    { key: 'cloud', h: 1.4, radar: 0.6, lidar: 0 },
    { key: 'rain', h: 0.6, radar: 0.85, lidar: 0 },
    { key: 'ground', h: 0, radar: 1, lidar: 0 }
  ];
  const scatterEcho = w => Math.min(1, 0.04 + Math.pow(w / 25, 0.75) * 0.96);

  const sendPulse = () => {
    if (state.mode !== 'active') return;
    badge.hide();
    const which = inst();
    state.echoes = [];
    state.scatterResult = null;
    if (which === 'scatter') {
      state.pulse = { which, d: 0, from: [g.sat[0] + 12 * g.s, g.sat[1] + 16 * g.s], to: g.target, done: false, wind: state.wind };
    } else {
      state.pulse = { which, y: g.sat[1] + 16 * g.s, hit: new Set(), stopY: which === 'lidar' ? g.km(3.9) : g.yG, done: false, pending: 0 };
    }
    pulseBtn.disabled = true;
  };
  pulseBtn.addEventListener('click', sendPulse);

  const stepPulse = dt => {
    const p = state.pulse;
    if (!p) return;
    const v = SPEED() * 0.75;
    if (p.which === 'scatter') {
      if (p.d === null) return;
      const L = Math.hypot(p.to[0] - p.from[0], p.to[1] - p.from[1]);
      p.d += v * dt;
      if (p.d >= L) {
        p.d = null;
        const e = scatterEcho(p.wind);
        addPacket([p.to, p.from], C.scatter, 1 + 4 * e, { echo: { scatter: true, strength: e, wind: p.wind } });
      }
      return;
    }
    if (p.y === null) return;
    p.y += v * dt;
    for (const [i, tg] of TARGETS.entries()) {
      const ty = g.km(tg.h);
      if (p.hit.has(i) || p.y < ty || ty > p.stopY + 1) continue;
      p.hit.add(i);
      const s = tg[p.which];
      if (s > 0) { p.pending++; addPacket([[g.xb, ty], [g.xb, g.sat[1] + 16 * g.s]], p.which === 'radar' ? C.radar : C.lidar, 1 + 3.5 * s, { echo: { key: tg.key, h: tg.h, strength: s } }); }
    }
    if (p.y >= p.stopY) p.y = null;
  };

  const drawPulse = () => {
    const p = state.pulse;
    if (!p) return;
    if (p.which === 'scatter') {
      ctx.strokeStyle = C.scatter; ctx.globalAlpha = 0.18; ctx.lineWidth = 6 * g.s;
      ctx.beginPath(); ctx.moveTo(p.from[0], p.from[1]); ctx.lineTo(p.to[0], p.to[1]); ctx.stroke(); ctx.globalAlpha = 1;
      if (p.d !== null) {
        const L = Math.hypot(p.to[0] - p.from[0], p.to[1] - p.from[1]), f = p.d / L;
        const x = p.from[0] + (p.to[0] - p.from[0]) * f, y = p.from[1] + (p.to[1] - p.from[1]) * f;
        const ang = Math.atan2(p.to[1] - p.from[1], p.to[0] - p.from[0]);
        ctx.strokeStyle = C.scatter; ctx.lineWidth = 4 * g.s;
        ctx.beginPath(); ctx.arc(x - Math.cos(ang) * 14 * g.s, y - Math.sin(ang) * 14 * g.s, 14 * g.s, ang - 0.7, ang + 0.7); ctx.stroke();
      }
      return;
    }
    // the beam straight down
    const col = p.which === 'radar' ? C.radar : C.lidar;
    const top = g.sat[1] + 16 * g.s, half = p.which === 'radar' ? W * 0.045 : 2 * g.s;
    ctx.fillStyle = col; ctx.globalAlpha = 0.16;
    ctx.beginPath(); ctx.moveTo(g.xb - 2, top); ctx.lineTo(g.xb + 2, top);
    const bottom = p.stopY;
    const hw = half * (bottom - top) / (g.yG - top);
    ctx.lineTo(g.xb + hw, bottom); ctx.lineTo(g.xb - hw, bottom); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    if (p.y !== null) {
      const w = Math.max(6, half * (p.y - top) / (g.yG - top)) + 4 * g.s;
      ctx.strokeStyle = col; ctx.lineWidth = 4 * g.s;
      ctx.beginPath(); ctx.moveTo(g.xb - w, p.y - 4 * g.s); ctx.quadraticCurveTo(g.xb, p.y + 6 * g.s, g.xb + w, p.y - 4 * g.s); ctx.stroke();
    }
  };

  // ============ CHART ============
  const drawChart = () => {
    const cw = chart.width / DPR, ch = chart.height / DPR;
    cctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cctx.fillStyle = C.chartBg; cctx.fillRect(0, 0, cw, ch);
    cctx.font = '12px ' + window.THEME.font; cctx.fillStyle = C.ink; cctx.textBaseline = 'middle';
    const title = document.getElementById('chart-title');
    const which = inst();
    if (state.mode === 'passive') {
      title.textContent = T.chart.passiveTitle;
      const parts = ['sun', 'ground', 'cloud', 'vapour'];
      const cols = { sun: C.sunRay, ground: C.heat, cloud: C.radar, vapour: C.vapourRay };
      const max = Math.max(4, ...parts.map(k => state.arrivals[k]));
      const lw = Math.min(170, cw * 0.45), rowH = (ch - 16) / 4;
      parts.forEach((k, i) => {
        const y = 8 + rowH * (i + 0.5);
        cctx.textAlign = 'left'; cctx.fillStyle = C.ink; cctx.fillText(T.chart.parts[k], 8, y);
        const v = state.arrivals[k] / max;
        cctx.fillStyle = cols[k]; cctx.fillRect(lw, y - rowH * 0.28, (cw - lw - 12) * v, rowH * 0.56);
        cctx.strokeStyle = C.grid; cctx.strokeRect(lw, y - rowH * 0.28, cw - lw - 12, rowH * 0.56);
        if (v < 0.02) { cctx.fillStyle = '#4d4d4d'; cctx.fillText(T.chart.nothing, lw + 6, y); }
      });
      return;
    }
    if (which === 'scatter') {
      title.textContent = T.chart.windTitle;
      const x0 = 34, x1 = cw - 12, y0 = ch - 26, y1 = 12;
      const X = w => x0 + w / 25 * (x1 - x0), Y = s => y0 - s * (y0 - y1);
      cctx.strokeStyle = C.grid; cctx.lineWidth = 1;
      for (const w of [0, 5, 10, 15, 20, 25]) { cctx.beginPath(); cctx.moveTo(X(w), y0); cctx.lineTo(X(w), y1); cctx.stroke(); cctx.textAlign = 'center'; cctx.fillStyle = C.ink; cctx.fillText(String(w), X(w), y0 + 10); }
      cctx.textAlign = 'right'; cctx.fillText(T.chart.windAxis, x1, y0 + 21);
      cctx.save(); cctx.translate(12, (y0 + y1) / 2); cctx.rotate(-Math.PI / 2); cctx.textAlign = 'center'; cctx.fillText(T.chart.strength, 0, 0); cctx.restore();
      cctx.strokeStyle = C.scatter; cctx.lineWidth = 2.5; cctx.beginPath();
      for (let w = 0; w <= 25; w += 0.5) { if (!w) cctx.moveTo(X(w), Y(scatterEcho(w))); else cctx.lineTo(X(w), Y(scatterEcho(w))); }
      cctx.stroke();
      cctx.strokeStyle = C.ink; cctx.lineWidth = 1.5; cctx.beginPath(); cctx.moveTo(x0, y1); cctx.lineTo(x0, y0); cctx.lineTo(x1, y0); cctx.stroke();
      const r = state.scatterResult;
      if (r) {
        cctx.fillStyle = C.ink; cctx.beginPath(); cctx.arc(X(r.wind), Y(r.strength), 6, 0, 2 * Math.PI); cctx.fill();
        cctx.setLineDash([4, 3]); cctx.beginPath(); cctx.moveTo(x0, Y(r.strength)); cctx.lineTo(X(r.wind), Y(r.strength)); cctx.lineTo(X(r.wind), y0); cctx.stroke(); cctx.setLineDash([]);
        cctx.textAlign = r.wind > 14 ? 'right' : 'left';
        cctx.font = '500 12px ' + window.THEME.font;
        cctx.fillText(T.chart.windResult(r.wind), X(r.wind) + (r.wind > 14 ? -10 : 10), Math.max(y1 + 8, Y(r.strength) - 12));
      }
      return;
    }
    // echo profile: height (km) against echo strength
    title.textContent = T.chart.profile;
    const x0 = 40, x1 = cw - 70, y0 = ch - 14, y1 = 10;
    const Y = h => y0 - h / 12 * (y0 - y1);
    cctx.strokeStyle = C.grid; cctx.lineWidth = 1; cctx.textAlign = 'right'; cctx.fillStyle = C.ink;
    for (const h of [0, 3, 6, 9, 12]) { cctx.beginPath(); cctx.moveTo(x0, Y(h)); cctx.lineTo(x1, Y(h)); cctx.stroke(); cctx.fillText(h + ' km', x0 - 5, Y(h)); }
    cctx.strokeStyle = C.ink; cctx.lineWidth = 1.5; cctx.beginPath(); cctx.moveTo(x0, y1); cctx.lineTo(x0, y0); cctx.stroke();
    const col = which === 'radar' ? C.radar : C.lidar;
    const seen = new Set();
    for (const e of state.echoes) {
      const bh = Math.max(5, (y0 - y1) / 12 * (e.key === 'ground' ? 0.45 : 0.8));
      cctx.fillStyle = col; cctx.fillRect(x0, Y(e.h) - bh / 2, (x1 - x0) * e.strength, bh);
      if (!seen.has(e.key)) {
        seen.add(e.key);
        cctx.textAlign = 'left'; cctx.fillStyle = C.ink; cctx.font = '500 11px ' + window.THEME.font;
        cctx.fillText(T.chart.labels[e.key].toUpperCase(), Math.min(x1 + 6, x0 + (x1 - x0) * e.strength + 6), Y(e.h));
        cctx.font = '12px ' + window.THEME.font;
      }
    }
    if (!state.echoes.length) { cctx.textAlign = 'left'; cctx.fillStyle = '#4d4d4d'; cctx.fillText(T.chart.waiting, x0 + 10, (y0 + y1) / 2); }
  };

  // ============ UI ============
  const ro = [1, 2, 3].map(i => [document.getElementById('ro-l' + i), document.getElementById('ro-' + i)]);
  const updateUI = () => {
    const key = inst(), I = T.inst[key];
    modeChips.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.mode === state.mode)));
    instChips.forEach(c => { c.hidden = c.dataset.for !== state.mode; c.setAttribute('aria-pressed', String(c.dataset.inst === key)); });
    pulseBtn.hidden = state.mode !== 'active';
    nightBtn.hidden = state.mode !== 'passive';
    windField.hidden = !(state.mode === 'active' && key === 'scatter');
    document.getElementById('mode-card').style.setProperty('--obj', state.mode === 'passive' ? 'var(--c-gold)' : 'var(--c-cyan)');
    document.getElementById('mode-title').textContent = I.title;
    document.getElementById('mode-sub').innerHTML = I.sub;
    document.getElementById('mode-bullets').innerHTML = I.bullets.map(b => '<li>' + b + '</li>').join('');
    const rows = state.mode === 'passive'
      ? [[T.readout.source, I.source], [T.readout.measures, I.measures], [T.readout.night, I.night]]
      : [[T.readout.signal, I.signal], [T.readout.time, I.time], [T.readout.what, I.measures]];
    rows.forEach(([l, v], i) => { ro[i][0].textContent = l; ro[i][1].textContent = v; });
    badge.show(state.mode === 'passive' ? T.badgePassive : T.badgeActive);
  };

  const clearRun = () => {
    state.packets = []; state.pulse = null; state.echoes = []; state.scatterResult = null; pulseBtn.disabled = false;
    for (const k in state.arrivals) state.arrivals[k] = 0;
  };
  const checkNight = () => {
    if (state.mode === 'passive' && state.night && (inst() === 'vis' || inst() === 'ir')) state.seenNight[inst()] = true;
    if (state.seenNight.vis && state.seenNight.ir) tasks.done('night');
  };
  modeChips.forEach(c => c.addEventListener('click', () => { if (state.mode === c.dataset.mode) return; state.mode = c.dataset.mode; clearRun(); updateUI(); checkNight(); }));
  instChips.forEach(c => c.addEventListener('click', () => { state.inst[state.mode] = c.dataset.inst; clearRun(); updateUI(); checkNight(); }));
  nightBtn.addEventListener('click', () => {
    state.night = !state.night; nightBtn.setAttribute('aria-pressed', String(state.night));
    clearRun(); checkNight();
  });
  const syncWind = () => { state.wind = Number(windIn.value); windOut.textContent = T.controls.windValue(state.wind); };
  windIn.addEventListener('input', syncWind);

  // ============ LOOP ============
  let last = performance.now();
  const loop = now => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (state.mode === 'passive') {
      spawnAcc += dt * (inst() === 'vis' ? 9 : 11);
      while (spawnAcc > 1) { spawnAcc -= 1; spawnPassive(); }
      for (const k in state.arrivals) state.arrivals[k] *= Math.exp(-dt / 2.5);
    } else stepPulse(dt);

    for (const p of state.packets) {
      p.d += p.speed * dt * (p.echo ? 0.75 : 1);
      if (p.fade) p.alpha = Math.max(0, 1 - Math.max(0, p.d - p.len * 0.7) / (p.len * 0.3));
      if (p.d >= p.len) {
        p.dead = true;
        if (p.src) state.arrivals[p.src] += 1;
        if (p.echo) {
          if (p.echo.scatter) { state.scatterResult = { wind: p.echo.wind, strength: p.echo.strength }; state.pulse = null; pulseBtn.disabled = false; if (p.echo.wind > 15) tasks.done('scatter'); }
          else {
            state.echoes.push(p.echo);
            const pu = state.pulse;
            if (pu && --pu.pending === 0 && pu.y === null) {
              pulseBtn.disabled = false;
              tasks.done(pu.which);
              state.pulse = null;
            }
          }
        }
      }
    }
    state.packets = state.packets.filter(p => !p.dead);

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    drawScene(now);
    drawPulse();
    for (const p of state.packets) drawPacket(p);
    drawSatellite();
    drawChart();
    requestAnimationFrame(loop);
  };

  resize();
  window.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(frame);
  syncWind();
  updateUI();
  requestAnimationFrame(loop);

  // for tests
  window.MESSEN = { state, sendPulse };
})();
