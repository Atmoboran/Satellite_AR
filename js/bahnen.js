// Chapter 1: two perspectives – a weather satellite in low Earth orbit (LEO,
// like Metop) and one in geostationary orbit (GEO, like Meteosat-12).
// The globe is drawn pixel by pixel in flat CD colours: land/sea, day/night,
// the area the satellite's imager sees right now (yellow) and, for LEO, what
// it has seen in the last 12 hours (pale yellow). Earth and orbits are to
// scale; only the satellite symbols are far too big.
// The small view in the corner shows the Earth as seen from the satellite.
(() => {
  'use strict';
  const G = window.GEO, C = window.THEME.orbits, T = window.TEXTS.bahnen;
  const R = G.R, D2R = G.D2R;

  // ============ MODEL ============
  const DAY = 86400;                         // the model day (the Sun stands still in space)
  const W_E = 2 * Math.PI / DAY;             // Earth's rotation
  const START_UTC = 8.5;                     // the clock starts at 08:30 UTC
  const LEO_R = R + 817;                     // Metop: 817 km
  const LEO_T = G.period(LEO_R);             // ≈ 101 min
  const INC = 98.7 * D2R;                    // sun-synchronous, nearly over the poles
  const RAAN = 142.5 * D2R;                  // ascending node at 21:30 local solar time (Sun on +x)
  const SWATH = 1450 / R;                    // half of the 2900 km AVHRR swath, as an angle at the Earth's centre
  const GEO_R = R + 35786;
  const GEO_LON = 0;                         // Meteosat-12 at 0°
  const GEO_VIEW = Math.acos(R / GEO_R);     // edge of the Earth disc seen from GEO (≈ 81°)
  const MEMORY = 12 * 3600;                  // "seen in the last 12 hours"
  const SUN = [1, 0, 0];

  const earthAngle = t => ((START_UTC - 12) * 3600 + t) * W_E;   // Greenwich faces the Sun at 12:00 UTC
  const toFixed = (v, t) => G.rotZ(v, -earthAngle(t));
  const toSpace = (v, t) => G.rotZ(v, earthAngle(t));

  let U0 = 0;                                // LEO phase at t = 0, chosen below
  const leoPos = t => {
    const u = U0 + 2 * Math.PI * t / LEO_T;
    const cu = Math.cos(u), su = Math.sin(u), ci = Math.cos(INC), si = Math.sin(INC), cO = Math.cos(RAAN), sO = Math.sin(RAAN);
    return [LEO_R * (cO * cu - sO * su * ci), LEO_R * (sO * cu + cO * su * ci), LEO_R * su * si];
  };
  const geoPos = t => G.scale(toSpace(G.fromLonLat(GEO_LON, 0), t), GEO_R);
  const satPos = (mode, t) => (mode === 'leo' ? leoPos(t) : geoPos(t));

  const place = T.place;
  const PLACE_EF = G.fromLonLat(place.lon, place.lat);

  // Start the LEO satellite so that its first pass over the place comes
  // after about half a minute of watching (at the normal tempo).
  (() => {
    let best = Infinity, bestU = 0;
    for (let k = 0; k < 720; k++) {
      U0 = k * Math.PI / 360;
      let m = Infinity;
      for (let t = 9 * 60; t <= 40 * 60; t += 20) m = Math.min(m, G.angle(G.norm(toFixed(leoPos(t), t)), PLACE_EF));
      if (m < best) { best = m; bestU = U0; }
    }
    U0 = bestU;
  })();

  // What the LEO imager has seen: time of the last look, 1° cells.
  const seen = new Float64Array(360 * 180);
  const markSeen = (sub, t) => {
    const [lonS, latS] = G.toLonLat(sub);
    const rho = SWATH / D2R;
    const sphi = Math.sin(latS * D2R), cphi = Math.cos(latS * D2R), crho = Math.cos(SWATH);
    const j0 = Math.max(0, Math.floor(90 - latS - rho)), j1 = Math.min(179, Math.ceil(90 - latS + rho));
    for (let j = j0; j <= j1; j++) {
      const lat = (89.5 - j) * D2R;
      const den = Math.cos(lat) * cphi;
      const cosd = den > 1e-9 ? (crho - Math.sin(lat) * sphi) / den : -2;
      if (cosd >= 1) continue;
      const half = cosd <= -1 ? 180 : Math.acos(cosd) / D2R;
      const i0 = Math.floor(lonS - half + 180), i1 = Math.ceil(lonS + half + 180);
      for (let i = i0; i <= i1; i++) seen[j * 360 + (((i % 360) + 360) % 360)] = t;
    }
  };

  // ============ STATE ============
  const state = {
    mode: 'leo', t: 0, playing: true, follow: false,
    az: 0, el: 28 * D2R, zoom: 0,
    lastSeen: { leo: -Infinity, geo: -Infinity },
    leoTime: 0, geoTime: 0
  };
  const resetModel = () => {
    state.t = 0; state.leoTime = 0; state.geoTime = 0;
    state.lastSeen.leo = -Infinity; state.lastSeen.geo = -Infinity;
    seen.fill(-1e12);
    state.az = earthAngle(0) + (place.lon + 4) * D2R;
    state.el = 28 * D2R;
    checkPlace();
  };

  const checkPlace = () => {
    const t = state.t;
    if (G.angle(G.norm(toFixed(leoPos(t), t)), PLACE_EF) < SWATH) state.lastSeen.leo = t;
    if (G.angle(G.fromLonLat(GEO_LON, 0), PLACE_EF) < GEO_VIEW) state.lastSeen.geo = t;
  };

  // ============ DOM ============
  const frame = document.getElementById('stage-frame');
  const canvas = document.getElementById('globe');
  const ctx = canvas.getContext('2d');
  const inset = document.getElementById('inset-canvas');
  const ictx = inset.getContext('2d');
  const playBtn = document.getElementById('sim-play');
  const playIcon = document.getElementById('play-icon');
  const speedSel = document.getElementById('speed-select');
  const followBtn = document.getElementById('sim-follow');
  const chips = [...document.querySelectorAll('.chip-btn[data-mode]')];
  const roTime = document.getElementById('ro-time');
  const roBelow = document.getElementById('ro-below');
  const roPlace = document.getElementById('ro-place');
  const badge = SCAPE.badge(frame);
  badge.show(T.badge);
  const tasks = SCAPE.taskDialog('orbit-tasks');

  // ============ COLOURS ============
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, f) => a.map((v, i) => Math.round(v + (b[i] - v) * f));
  // index: (land ? 1 : 0) + (night ? 2 : 0); then + 4 × (0 plain, 1 now, 2 earlier)
  const PAL = (() => {
    const base = [C.oceanDay, C.landDay, C.oceanNight, C.landNight].map(rgb);
    const now = rgb(C.seenNow), earlier = rgb(C.seenEarlier);
    return [...base, ...base.map(c => mix(c, now, C.seenNowMix)), ...base.map(c => mix(c, earlier, C.seenEarlierMix))];
  })();
  const SPACE = rgb(C.space);

  // ============ CAMERA ============
  // The camera looks at the Earth's centre from direction D (azimuth, elevation),
  // in space or – with "Mitdrehen" – turning with the Earth.
  const camera = () => {
    const az = state.az + (state.follow ? earthAngle(state.t) : 0);
    const D = [Math.cos(state.el) * Math.cos(az), Math.cos(state.el) * Math.sin(az), Math.sin(state.el)];
    const right = G.norm(G.cross([0, 0, 1], D));
    const up = G.cross(D, right);
    return { D, right, up };
  };

  // ============ DRAWING ============
  let W = 0, H = 0, DPR = 1;
  const resize = () => {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = frame.clientWidth; H = frame.clientHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    const iw = inset.clientWidth;
    const n = Math.min(240, Math.round(iw * DPR));
    if (inset.width !== n) { inset.width = n; inset.height = n; insetImg = null; }
  };

  let buf = document.createElement('canvas'), bctx = buf.getContext('2d'), img = null;
  let insetImg = null;

  // the colour of the Earth at the unit vector p (space frame)
  const mask = () => G._mask || G.landMask();
  const earthIndex = (px, py, pz, ca, sa) => {
    // to Earth-fixed (rotate by −earthAngle)
    const ex = ca * px + sa * py, ey = -sa * px + ca * py;
    const lon = Math.atan2(ey, ex), lat = Math.asin(pz < -1 ? -1 : pz > 1 ? 1 : pz);
    const m = mask();
    let c = Math.floor((lon / (2 * Math.PI) + 0.5) * m.w); if (c >= m.w) c = m.w - 1;
    let r = Math.floor((0.5 - lat / Math.PI) * m.h); if (r >= m.h) r = m.h - 1;
    let k = m.data[r * m.w + c] + (px * SUN[0] + py * SUN[1] + pz * SUN[2] < 0 ? 2 : 0);
    return { k, ex, ey, lon, lat };
  };

  const drawGlobe = (cam, cx, cy, rad, sub, rho, useMemory) => {
    const n = Math.max(8, Math.min(560, Math.round(2 * rad * DPR)));
    if (buf.width !== n) { buf.width = n; buf.height = n; img = null; }
    if (!img) img = bctx.createImageData(n, n);
    const d = img.data;
    const ea = earthAngle(state.t), ca = Math.cos(ea), sa = Math.sin(ea);
    const { D, right, up } = cam;
    const crho = Math.cos(rho), t = state.t, m = mask();
    for (let py = 0; py < n; py++) {
      const y = 1 - (py + 0.5) * 2 / n;
      for (let pxi = 0; pxi < n; pxi++) {
        const x = (pxi + 0.5) * 2 / n - 1;
        const o = (py * n + pxi) * 4;
        const r2 = x * x + y * y;
        if (r2 > 1) { d[o + 3] = 0; continue; }
        const z = Math.sqrt(1 - r2);
        const px = x * right[0] + y * up[0] + z * D[0];
        const py3 = x * right[1] + y * up[1] + z * D[1];
        const pz = x * right[2] + y * up[2] + z * D[2];
        const e = earthIndex(px, py3, pz, ca, sa);
        let k = e.k;
        if (e.ex * sub[0] + e.ey * sub[1] + pz * sub[2] > crho) k += 4;
        else if (useMemory) {
          const j = Math.min(179, Math.floor((0.5 - e.lat / Math.PI) * 180));
          const i = Math.min(359, Math.floor((e.lon / (2 * Math.PI) + 0.5) * 360));
          if (t - seen[j * 360 + i] < MEMORY) k += 8;
        }
        const col = PAL[k];
        d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
      }
    }
    bctx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(buf, cx - rad, cy - rad, 2 * rad, 2 * rad);
    ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 2 * Math.PI);
    ctx.strokeStyle = C.label; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = 1;
  };

  const project = (p, cam, cx, cy, k) => [cx + G.dot(p, cam.right) * k, cy - G.dot(p, cam.up) * k, G.dot(p, cam.D)];

  // the orbit as a closed line; back = the half behind the Earth's centre plane
  const orbitPoints = (mode) => {
    const pts = [];
    for (let i = 0; i <= 240; i++) {
      const a = i / 240 * 2 * Math.PI;
      if (mode === 'leo') { pts.push(leoPos((a - U0) / (2 * Math.PI) * LEO_T)); }
      else pts.push([GEO_R * Math.cos(a), GEO_R * Math.sin(a), 0]);
    }
    return pts;
  };
  const ORBITS = { leo: orbitPoints('leo'), geo: orbitPoints('geo') };
  const strokeOrbit = (pts, cam, cx, cy, k, back, color, width, alpha) => {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.globalAlpha = alpha;
    ctx.beginPath();
    let pen = false;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = project(pts[i], cam, cx, cy, k), b = project(pts[i + 1], cam, cx, cy, k);
      const isBack = (a[2] + b[2]) / 2 < 0;
      if (isBack === back) { if (!pen) ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); pen = true; }
      else pen = false;
    }
    ctx.stroke(); ctx.globalAlpha = 1;
  };

  const drawSatellite = (x, y, s) => {
    ctx.fillStyle = C.satellite; ctx.strokeStyle = C.satelliteLine; ctx.lineWidth = 1.5;
    const b = 5 * s, pw = 9 * s, ph = 4 * s;
    ctx.fillRect(x - b, y - b, 2 * b, 2 * b); ctx.strokeRect(x - b, y - b, 2 * b, 2 * b);
    ctx.fillRect(x - b - 2 * s - pw, y - ph, pw, 2 * ph); ctx.strokeRect(x - b - 2 * s - pw, y - ph, pw, 2 * ph);
    ctx.fillRect(x + b + 2 * s, y - ph, pw, 2 * ph); ctx.strokeRect(x + b + 2 * s, y - ph, pw, 2 * ph);
    ctx.beginPath(); ctx.moveTo(x - b - 2 * s, y); ctx.lineTo(x - b, y); ctx.moveTo(x + b, y); ctx.lineTo(x + b + 2 * s, y); ctx.stroke();
  };

  // the two outer lines of the satellite's view onto the edge of what it sees
  const drawCone = (satP, cam, cx, cy, k, rho, sScreen) => {
    const sHat = G.norm(satP);
    const e1 = G.norm(G.cross(sHat, Math.abs(sHat[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0])), e2 = G.cross(sHat, e1);
    const base = Math.atan2(cy - sScreen[1], cx - sScreen[0]);
    let lo = null, hi = null;
    for (let i = 0; i < 72; i++) {
      const th = i / 72 * 2 * Math.PI;
      const b = G.scale(G.add(G.scale(sHat, Math.cos(rho)), G.scale(G.add(G.scale(e1, Math.cos(th)), G.scale(e2, Math.sin(th))), Math.sin(rho))), R);
      const q = project(b, cam, cx, cy, k);
      let a = Math.atan2(q[1] - sScreen[1], q[0] - sScreen[0]) - base;
      a = Math.atan2(Math.sin(a), Math.cos(a));
      if (!lo || a < lo.a) lo = { a, q };
      if (!hi || a > hi.a) hi = { a, q };
    }
    ctx.strokeStyle = C.seenNow; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(sScreen[0], sScreen[1]); ctx.lineTo(lo.q[0], lo.q[1]);
    ctx.moveTo(sScreen[0], sScreen[1]); ctx.lineTo(hi.q[0], hi.q[1]);
    ctx.stroke(); ctx.globalAlpha = 1;
  };

  // caps label; boxed = black on a white box (on the globe), else white on space
  const label = (text, x, y, align = 'left', boxed = false) => {
    const fs = Math.max(11, Math.round(12 * Math.min(1.3, W / 500)));
    ctx.font = '500 ' + fs + 'px ' + window.THEME.font;
    ctx.textAlign = align; ctx.textBaseline = 'middle';
    const s = text.toUpperCase();
    if (boxed) {
      const w = ctx.measureText(s).width, x0 = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
      ctx.fillStyle = C.label; ctx.fillRect(x0 - 4, y - fs * 0.75, w + 8, fs * 1.5);
      ctx.fillStyle = C.satelliteLine;
    } else ctx.fillStyle = C.label;
    ctx.fillText(s, x, y);
  };

  const draw = () => {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = C.space; ctx.fillRect(0, 0, W, H);
    const cam = camera();
    const z = state.zoom, ease = z * z * (3 - 2 * z);
    const kLeo = 0.33 * Math.min(W, H) / R;
    const kGeo = Math.min(0.46 * W / GEO_R, 0.40 * H / (GEO_R * Math.abs(Math.sin(state.el)) + R));
    const k = Math.exp(Math.log(kLeo) + (Math.log(kGeo) - Math.log(kLeo)) * ease);
    const cx = W / 2, cy = H * (0.54 - 0.02 * ease);
    const t = state.t, mode = state.mode;
    const sp = satPos(mode, t), ss = project(sp, cam, cx, cy, k);
    const sub = G.norm(toFixed(sp, t));
    const rho = mode === 'leo' ? SWATH : GEO_VIEW;
    const s = Math.max(1, Math.min(1.8, Math.min(W, H) / 420));

    // behind the Earth
    if (mode === 'geo') strokeOrbit(ORBITS.leo, cam, cx, cy, k, true, C.orbitOther, 1.5, 0.7);
    strokeOrbit(ORBITS[mode], cam, cx, cy, k, true, C.orbit, 2, 0.45);
    if (ss[2] < 0) drawSatellite(ss[0], ss[1], s);

    drawGlobe(cam, cx, cy, R * k, sub, rho, mode === 'leo');

    // in front of the Earth
    if (mode === 'geo') strokeOrbit(ORBITS.leo, cam, cx, cy, k, false, C.orbitOther, 1.5, 0.9);
    strokeOrbit(ORBITS[mode], cam, cx, cy, k, false, C.orbit, 2, 1);
    if (ss[2] >= 0) { drawCone(sp, cam, cx, cy, k, rho, ss); drawSatellite(ss[0], ss[1], s); }

    // the place
    const pp = project(G.scale(toSpace(PLACE_EF, t), R), cam, cx, cy, k);
    if (pp[2] > 0) {
      const r = Math.max(3.5, Math.min(6, R * k / 30));
      ctx.beginPath(); ctx.arc(pp[0], pp[1], r, 0, 2 * Math.PI);
      ctx.fillStyle = C.place; ctx.fill(); ctx.strokeStyle = C.label; ctx.lineWidth = 1.5; ctx.stroke();
      if (R * k > 60) label(place.name, pp[0] + r + 7, pp[1], 'left', true);
    }

    // orbit name at its rightmost point
    let best = null, bestD = -1;
    for (const p of ORBITS[mode]) {
      const q = project(p, cam, cx, cy, k);
      if (q[2] < 0 || q[0] < 60 || q[0] > W - 60 || q[1] < 0.2 * H || q[1] > 0.85 * H) continue;
      const dd = Math.hypot(q[0] - ss[0], q[1] - ss[1]);
      if (dd > bestD) { bestD = dd; best = q; }
    }
    if (best) label(T.modes[mode].label, best[0] + (best[0] > W / 2 ? -10 : 10), best[1], best[0] > W / 2 ? 'right' : 'left', true);
    if (mode === 'geo') {
      let lb = null;
      for (const p of ORBITS.leo) { const q = project(p, cam, cx, cy, k); if (!lb || q[1] > lb[1]) lb = q; }
      ctx.globalAlpha = 0.85; label(T.modes.leo.label, lb[0], lb[1] + 14, 'center'); ctx.globalAlpha = 1;
    }

    drawInset(sp, mode, t);
  };

  // ---- what the satellite sees: a camera on the satellite, looking down ----
  const drawInset = (P, mode, t) => {
    const n = inset.width;
    if (!n) return;
    if (!insetImg || insetImg.width !== n) insetImg = ictx.createImageData(n, n);
    const d = insetImg.data;
    const f = G.norm(G.scale(P, -1));
    // north up; near the poles (where north is straight below) the flight direction
    let upRef = [0, 0, 1];
    if (Math.abs(f[2]) > 0.94) upRef = G.sub(leoPos(t + 1), P);
    const up = G.norm(G.sub(upRef, G.scale(f, G.dot(upRef, f))));
    const right = G.cross(f, up);
    const tanH = mode === 'leo' ? Math.tan(56 * D2R) : Math.tan(Math.asin(R / G.len(P)) * 1.08);
    const ea = earthAngle(t), ca = Math.cos(ea), sa = Math.sin(ea);
    for (let py = 0; py < n; py++) {
      const v = 1 - (py + 0.5) * 2 / n;
      for (let pxi = 0; pxi < n; pxi++) {
        const u = (pxi + 0.5) * 2 / n - 1;
        const o = (py * n + pxi) * 4;
        const dir = G.norm([f[0] + tanH * (u * right[0] + v * up[0]), f[1] + tanH * (u * right[1] + v * up[1]), f[2] + tanH * (u * right[2] + v * up[2])]);
        const s = G.hitSphere(P, dir);
        let col = SPACE;
        if (s > 0) {
          const hx = (P[0] + s * dir[0]) / R, hy = (P[1] + s * dir[1]) / R, hz = (P[2] + s * dir[2]) / R;
          col = PAL[earthIndex(hx, hy, hz, ca, sa).k];
        }
        d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
      }
    }
    ictx.putImageData(insetImg, 0, 0);
    // the place, if the satellite sees it
    const q = G.sub(G.scale(toSpace(PLACE_EF, t), R), P);
    const depth = G.dot(q, f);
    if (depth > 0) {
      const dir = G.norm(q), s = G.hitSphere(P, dir);
      if (s > 0 && Math.abs(s - G.len(q)) < 1) {
        const u = G.dot(dir, right) / G.dot(dir, f) / tanH, v = G.dot(dir, up) / G.dot(dir, f) / tanH;
        if (Math.abs(u) <= 1 && Math.abs(v) <= 1) {
          const x = (u + 1) / 2 * n, y = (1 - v) / 2 * n;
          ictx.beginPath(); ictx.arc(x, y, Math.max(2.5, n / 40), 0, 2 * Math.PI);
          ictx.fillStyle = C.place; ictx.fill(); ictx.strokeStyle = C.label; ictx.lineWidth = 1; ictx.stroke();
        }
      }
    }
  };

  // ============ READOUTS ============
  const pad = v => String(v).padStart(2, '0');
  const updateReadouts = () => {
    const t = state.t;
    const hours = START_UTC + t / 3600;
    const day = Math.floor(hours / 24) + 1, hh = Math.floor(hours % 24), mm = Math.floor((hours * 60) % 60);
    roTime.textContent = T.readout.day(day) + ' · ' + pad(hh) + ':' + pad(mm);
    const [lon, lat] = G.toLonLat(toFixed(satPos(state.mode, t), t));
    roBelow.textContent = G.formatLonLat(lon, lat);
    const last = state.lastSeen[state.mode];
    if (last === t) roPlace.textContent = T.readout.now;
    else if (!isFinite(last)) roPlace.textContent = T.readout.never;
    else { const m = Math.floor((t - last) / 60); roPlace.textContent = T.readout.ago(Math.floor(m / 60), m % 60); }
  };

  const setModeCard = () => {
    const m = T.modes[state.mode];
    document.getElementById('mode-card').style.setProperty('--obj', state.mode === 'leo' ? 'var(--mode-leo)' : 'var(--mode-geo)');
    document.getElementById('mode-title').textContent = m.title;
    document.getElementById('mode-sub').textContent = m.sub;
    document.getElementById('mode-bullets').innerHTML = m.bullets.map(b => '<li>' + b + '</li>').join('');
    document.getElementById('mode-facts').innerHTML = m.facts.map(f => '<div>' + f.label + '<b>' + f.value + '</b></div>').join('');
  };

  // ============ TIME ============
  const advance = dt => {
    const steps = Math.max(1, Math.ceil(dt / 20)), h = dt / steps;
    for (let i = 0; i < steps; i++) {
      state.t += h;
      if (state.mode === 'leo') state.leoTime += h; else state.geoTime += h;
      markSeen(toFixed(leoPos(state.t), state.t), state.t);
      checkPlace();
      if (state.mode === 'leo' && state.lastSeen.leo === state.t) tasks.done('pass');
    }
    if (state.geoTime >= 3 * 3600) tasks.done('geo');
    if (state.leoTime >= DAY) tasks.done('day');
  };

  const ICON_PLAY = '<path d="M6 4l14 8-14 8V4z" fill="currentColor"/>';
  const ICON_PAUSE = '<rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/>';
  const syncPlay = () => {
    playIcon.innerHTML = state.playing ? ICON_PAUSE : ICON_PLAY;
    playBtn.setAttribute('aria-label', state.playing ? T.controls.pauseAria : T.controls.playAria);
  };

  // ============ INPUT ============
  const setMode = mode => {
    state.mode = mode;
    chips.forEach(c => { c.setAttribute('aria-pressed', String(c.dataset.mode === mode)); c.classList.remove('attn'); });
    setModeCard();
    updateReadouts();
  };
  chips.forEach(c => c.addEventListener('click', () => setMode(c.dataset.mode)));
  document.getElementById('mode-geo').classList.add('attn');

  playBtn.addEventListener('click', () => { state.playing = !state.playing; syncPlay(); });
  document.getElementById('sim-reset').addEventListener('click', () => { resetModel(); updateReadouts(); });
  followBtn.addEventListener('click', () => {
    // keep the picture where it is when switching
    const ea = earthAngle(state.t);
    state.az += state.follow ? ea : -ea;
    state.follow = !state.follow;
    followBtn.setAttribute('aria-pressed', String(state.follow));
  });

  let drag = null;
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); badge.hide(); });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    state.az -= (e.clientX - drag.x) * 0.008;
    state.el = Math.max(-75 * D2R, Math.min(80 * D2R, state.el + (e.clientY - drag.y) * 0.008));
    drag = { x: e.clientX, y: e.clientY };
  });
  const endDrag = () => { drag = null; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  // ============ LOOP ============
  let last = performance.now(), roTimer = 0;
  const loop = now => {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (state.playing) advance(dt * Number(speedSel.value));
    const target = state.mode === 'geo' ? 1 : 0;
    state.zoom += (target - state.zoom) * Math.min(1, dt * 4);
    if (Math.abs(target - state.zoom) < 0.001) state.zoom = target;
    draw();
    roTimer += dt;
    if (roTimer > 0.12) { roTimer = 0; updateReadouts(); }
    requestAnimationFrame(loop);
  };

  G.landMask();
  resetModel();
  resize();
  window.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(frame);
  setModeCard();
  syncPlay();
  updateReadouts();
  requestAnimationFrame(loop);

  // for tests
  window.BAHNEN = { state, advance, setMode, LEO_T, U0: () => U0 };
})();
