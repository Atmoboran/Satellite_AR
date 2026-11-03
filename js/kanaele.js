// Chapter 2: the same weather seen in three channels of a geostationary
// imager (like the FCI on Meteosat-12): visible 0.6 µm, infrared 10.5 µm,
// water vapour 6.3 µm.
//
// The weather is a model scene, not a photograph: for every pixel the code
// first decides the physical state (surface type and temperature, cloud
// layers with optical thickness and top temperature, humidity of the upper
// troposphere). Each channel is then computed from that state with its own
// physics, so the three pictures differ for the right reasons:
//   VIS – sunlight reflected by surface and clouds (two-stream adding),
//         times the cosine of the sun's zenith angle: dark at night.
//   IR  – thermal emission: surface radiance passed up through the cloud
//         layers (emissivity from optical thickness), Planck at 10.5 µm.
//   WV  – emission of the upper-tropospheric water vapour; only clouds above
//         the emitting layer show, the surface and low clouds never do.
(() => {
  'use strict';
  const G = window.GEO, C = window.THEME.channels, T = window.TEXTS.kanaele;
  const D2R = G.D2R, R = G.R;

  // ============ GEOMETRY: the view from the satellite at 0° ============
  const SAT = [R + 35786, 0, 0];
  const AX0 = -3.4 * D2R, AX1 = 3.9 * D2R;      // scan angle east–west
  const AY0 = 3.35 * D2R, AY1 = 8.83 * D2R;     // scan angle south–north
  const NW = 480, NH = 360;                     // model pixels (4 : 3)
  const N = NW * NH;

  // pixel -> lon/lat (NaN in space)
  const lon = new Float32Array(N), lat = new Float32Array(N);
  for (let j = 0; j < NH; j++) {
    const ay = AY1 - (j + 0.5) / NH * (AY1 - AY0);
    for (let i = 0; i < NW; i++) {
      const ax = AX0 + (i + 0.5) / NW * (AX1 - AX0);
      const d = G.norm([-1, Math.tan(ax), Math.tan(ay)]);
      const s = G.hitSphere(SAT, d);
      const k = j * NW + i;
      if (s < 0) { lon[k] = NaN; lat[k] = NaN; continue; }
      const [lo, la] = G.toLonLat(G.add(SAT, G.scale(d, s)));
      lon[k] = lo; lat[k] = la;
    }
  }
  // lon/lat -> canvas fraction (for coasts and nothing else)
  const projectLL = (lo, la) => {
    const p = G.scale(G.fromLonLat(lo, la), R);
    const q = G.sub(p, SAT);
    if (G.dot(q, p) > 0) return null;          // on the far side
    const ax = Math.atan2(q[1], -q[0]), ay = Math.atan2(q[2], -q[0]);
    return [(ax - AX0) / (AX1 - AX0), (AY1 - ay) / (AY1 - AY0)];
  };

  // ============ NOISE ============
  const hash = (i, j, s) => {
    let h = (i * 374761393 + j * 668265263 + s * 2147483647) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const vnoise = (x, y, s) => {
    const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash(i, j, s), b = hash(i + 1, j, s), c = hash(i, j + 1, s), d = hash(i + 1, j + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  const fbm = (x, y, s = 0, oct = 4) => {
    let sum = 0, amp = 0.5, f = 1, n = 0;
    for (let o = 0; o < oct; o++) { sum += amp * vnoise(x * f, y * f, s + o * 7); n += amp; amp *= 0.5; f *= 2.03; }
    return sum / n;
  };
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  // distance (degrees, local east scaled by cos lat) from a point to a polyline,
  // and on which side (+1 east / right of the direction of travel)
  const polyDist = (x, y, pts) => {
    let best = Infinity, side = 1;
    for (let k = 0; k + 1 < pts.length; k++) {
      const [ax, ay] = pts[k], [bx, by] = pts[k + 1];
      const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L));
      const px = ax + t * dx - x, py = ay + t * dy - y, d = Math.hypot(px, py);
      if (d < best) { best = d; side = (dx * (y - ay) - dy * (x - ax)) > 0 ? 1 : -1; }
    }
    return [best, side];
  };
  const toXY = ([lo, la]) => [lo * Math.cos(la * D2R), la];

  // ============ THE WEATHER (a day in mid-October) ============
  const LOW = [-16, 56];                                                       // Atlantic low
  const COLD_FRONT = [[-14, 55], [-10, 52], [-8, 48], [-9, 44], [-12, 40], [-17, 35.5], [-23, 31.5]].map(toXY);
  const WARM_FRONT = [[-14, 55], [-8, 57.5], [-1, 58.5], [6, 58]].map(toXY);
  const JET = [[-32, 26.5], [-18, 28.5], [-4, 31], [10, 31.5], [24, 30.5], [36, 29]].map(toXY);
  const STORMS = [[14.6, 38.4, 1.5], [18.2, 36.8, 1.15], [11.2, 40.6, 0.9], [20.6, 39.6, 1.0], [16.2, 41.6, 0.6]];
  const DECL = -8.5;                                                           // sun's latitude in mid-October

  // per pixel state
  const surf = new Uint8Array(N);        // 0 sea, 1 land, 2 desert, 3 snow, 255 space
  const albedo = new Float32Array(N);
  const tMean = new Float32Array(N), tAmp = new Float32Array(N);
  const lowTau = new Float32Array(N), lowDT = new Float32Array(N), lowKind = new Uint8Array(N);   // 1 fog, 2 cumulus, 3 other
  const midTau = new Float32Array(N);
  const hiTau = new Float32Array(N), hiT = new Float32Array(N), hiKind = new Uint8Array(N);      // 1 Cb, 2 front, 3 comma, 4 cirrus
  const uth = new Float32Array(N);

  const buildScene = () => {
    G.landMask();
    const [lx, ly] = toXY(LOW);
    for (let k = 0; k < N; k++) {
      const lo = lon[k], la = lat[k];
      if (lo !== lo) { surf[k] = 255; continue; }
      const x = lo * Math.cos(la * D2R), y = la;
      const land = G.isLand(lo, la);

      // ---- surface ----
      let s = land ? 1 : 0;
      const df = land && lo > -17 ? smooth(35, 30.5, la + 2 * (fbm(x * 0.5, y * 0.5, 9) - 0.5)) : 0;   // desert share
      if (df > 0.5) s = 2;
      if (land && ((lo - 10.3) / 4.4) ** 2 + ((la - 46.5) / 0.85) ** 2 < 1 && fbm(x * 1.4, y * 1.4, 11) > 0.47) s = 3;
      surf[k] = s;
      const med = !land && lo > -5.5 && la < 45.5 && la > 30 ? 2 : 0;
      if (s === 0) { albedo[k] = 0.06; tMean[k] = 24 - 0.42 * (la - 30) + med; tAmp[k] = 0.3; }
      else if (s === 3) { albedo[k] = 0.72; tMean[k] = -4; tAmp[k] = 3; }
      else {
        const aL = 0.13 + 0.06 * fbm(x * 0.8, y * 0.8, 3), aD = 0.30 + 0.1 * fbm(x * 0.6, y * 0.6, 5);
        albedo[k] = aL + (aD - aL) * df;
        tMean[k] = (21 - 0.62 * (la - 30)) * (1 - df) + (27 - 0.2 * (la - 25)) * df;
        tAmp[k] = 6 + 6 * df;
      }

      // ---- the front ----
      const [dc, side] = polyDist(x, y, COLD_FRONT);
      const [dw] = polyDist(x, y, WARM_FRONT);
      const n1 = fbm(x * 0.55, y * 0.55, 21), n2 = fbm(x * 1.6, y * 1.6, 22);
      const band = Math.exp(-((dc / 1.7) ** 2)) * (0.55 + 0.9 * n1);
      const ahead = side > 0 ? Math.exp(-((Math.max(0, dc - 1) / 3.6) ** 2)) * smooth(0.35, 0.6, n1 + 0.15 * n2) * smooth(57.5, 54.5, la) : 0;
      const warm = Math.exp(-((dw / 2.6) ** 2)) * (0.6 + 0.6 * n2);
      // the comma: a spiral round the low
      const rx = x - lx, ry = y - ly, r = Math.hypot(rx, ry), th = Math.atan2(ry, rx);
      const arm = Math.max(0, Math.cos(th - r * 0.42 + 2.2)) ** 1.6;
      const comma = (arm * Math.exp(-((r / 7.5) ** 2)) * smooth(0.6, 1.8, r)) * (0.6 + 0.8 * n2);
      // dry slot: behind the cold front, south of the low
      const dry = side < 0 ? Math.exp(-(((dc - 3.2) / 2.0) ** 2)) * smooth(41, 46, la) * smooth(57, 53, la) : 0;

      let hT = 0, hK = 0, hTop = -45;
      const front = Math.max(band, 0.8 * warm) * (1 - 0.9 * dry);
      if (front > 0.25) { hT = 9 * (front - 0.25) * (0.7 + 0.6 * n2); hK = 2; hTop = -44 - 6 * n2; }
      if (comma > 0.3 && comma * 10 > hT) { hT = 10 * (comma - 0.3) + hT * 0.3; hK = 3; hTop = -40 - 6 * n1; }
      midTau[k] = (14 * Math.max(ahead, band) * (1 - dry) + 8 * comma) * (0.6 + 0.8 * n2);

      // ---- thunderstorms over the warm Mediterranean ----
      for (const [sx0, sy, sr] of STORMS) {
        const [sx] = toXY([sx0, sy]);
        // anvils stretch towards the north-east with the upper wind
        const ex = x - sx, ey = y - sy;
        const u = (ex * 0.8 + ey * 0.6), v = (-ex * 0.6 + ey * 0.8);
        const dd = Math.hypot((u - 0.35 * sr) / 1.45, v) / sr;
        const edge = 1 + 0.35 * (fbm(x * 2.2, y * 2.2, 31) - 0.5);
        if (dd < edge) {
          const core = Math.exp(-((dd / 0.33) ** 2));
          const tau = 45 * smooth(edge, edge * 0.55, dd) + 30 * core;
          if (tau > hT) { hT = tau; hK = 1; hTop = -56 - 11 * core - 2 * n2; }
          midTau[k] += 20 * smooth(edge, 0.3, dd);
        }
      }

      // ---- jet-stream cirrus over North Africa ----
      const [dj] = polyDist(x, y, JET);
      const streak = smooth(0.42, 0.7, fbm(x * 0.35 + y * 0.5, y * 2.4 - x * 0.2, 41, 5));
      const ci = 2.2 * Math.exp(-((dj / 1.9) ** 2)) * streak;
      if (ci > 0.15 && hT < 0.4) { hT = ci; hK = 4; hTop = -48 - 5 * n1; }
      hiTau[k] = hT; hiKind[k] = hK; hiT[k] = hTop;

      // ---- low clouds ----
      let lt = 0, lk = 0, ld = -6;
      // fog / low stratus under high pressure over Central Europe
      if (land && s !== 3) {
        const e = Math.hypot((lo - 12.5) / 7.5, (la - 50.4) / 2.6);
        const f = fbm(x * 0.9, y * 0.9, 51) + 0.32 * (1 - e) - (la < 47.8 ? 0.4 : 0);
        if (f > 0.5) { lt = 18 * smooth(0.5, 0.56, f); lk = 1; ld = +1.5; }
      }
      // open cells of cumulus in the cold air behind the front
      if (!land && side < 0 && dc > 3.5 && la > 38 && la < 60 && lo < -9) {
        const cells = smooth(0.52, 0.66, fbm(x * 2.1, y * 2.1, 61, 3));
        if (cells > 0) { lt = 5 * cells; lk = 2; ld = -14; }
      }
      // under the front and the comma
      const under = Math.max(band, comma, 0.6 * ahead);
      if (under > 0.3 && lt < 8) { lt = 10 * under; lk = 3; ld = -9; }
      // a few trade-wind cumulus far out over the subtropical Atlantic
      if (!land && la < 34 && lo < -16 && lt === 0) {
        const tc = smooth(0.6, 0.7, fbm(x * 2.6, y * 2.6, 71, 3));
        if (tc > 0) { lt = 3 * tc; lk = 3; ld = -8; }
      }
      lowTau[k] = lt; lowKind[k] = lk; lowDT[k] = ld;

      // ---- humidity of the upper troposphere (0 … 1) ----
      const sub = smooth(36, 30, la);                                   // dry subtropics
      let q = 0.42 + 0.3 * (fbm(x * 0.4 + y * 0.3, y * 0.9, 81) - 0.5) - 0.24 * sub;
      q += 0.55 * Math.max(band, 0.8 * warm, comma) + 0.3 * ahead;
      for (const [sx0, sy, sr] of STORMS) { const [sx] = toXY([sx0, sy]); q += 0.6 * Math.exp(-((Math.hypot(x - sx - 0.5, y - sy - 0.4) / (2.3 * sr)) ** 2)); }
      q += 0.35 * Math.exp(-((dj / 2.2) ** 2));
      q *= 1 - 0.8 * dry * (0.75 + 0.5 * n1);
      uth[k] = Math.max(0.03, Math.min(1, q));
    }
  };

  // ============ PHYSICS PER CHANNEL ============
  // Planck's law up to a constant factor; λ in µm, T in K.
  const C2 = 14387.77;
  const planck = (lam, Tk) => 1 / (Math.exp(C2 / (lam * Tk)) - 1);
  const planckInv = (lam, B) => C2 / (lam * Math.log(1 + 1 / B));
  const K = 273.15;
  const cloudR = tau => (0.15 * tau) / (2 + 0.15 * tau);       // two-stream reflectance, g = 0.85
  const emis = tau => 1 - Math.exp(-tau / 2.1);                // IR absorption depth ≈ half the visible one

  const surfaceT = (k, utc) => {
    const lst = utc + lon[k] / 15;
    return tMean[k] + tAmp[k] * Math.cos(2 * Math.PI * (lst - 14) / 24);
  };
  const sunCos = (k, utc) => {
    const h = (lon[k] + (utc - 12) * 15) * D2R, p = lat[k] * D2R, d = DECL * D2R;
    return Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(h);
  };

  // reflected fraction of the incoming sunlight (0 … 1), as the satellite measures it
  const visValue = (k, utc) => {
    const mu = sunCos(k, utc);
    if (mu <= 0) return 0;
    let Rt = cloudR(hiTau[k]);
    for (const tau of [midTau[k], lowTau[k]]) { const r = cloudR(tau); Rt = Rt + (1 - Rt) * (1 - Rt) * r / (1 - Rt * r); }
    const a = albedo[k];
    Rt = Rt + (1 - Rt) * (1 - Rt) * a / (1 - Rt * a);
    return Rt * Math.min(1, mu * 1.15);
  };
  // brightness temperature at 10.5 µm, °C
  const irValue = (k, utc) => {
    const ts = surfaceT(k, utc);
    const lam = 10.5;
    let B = planck(lam, ts - 1.5 + K);                              // a little water vapour above the surface
    const lowTop = ts + lowDT[k];
    B = emis(lowTau[k]) * planck(lam, lowTop + K) + (1 - emis(lowTau[k])) * B;
    B = emis(midTau[k]) * planck(lam, -22 + K) + (1 - emis(midTau[k])) * B;
    B = emis(hiTau[k]) * planck(lam, hiT[k] + K) + (1 - emis(hiTau[k])) * B;
    return planckInv(lam, B) - K;
  };
  // brightness temperature at 6.3 µm, °C
  const wvValue = k => {
    const lam = 6.3;
    const clear = -20 - 38 * Math.pow(uth[k], 0.7);                 // moist upper air emits from higher, colder levels
    let B = planck(lam, clear + K);
    if (hiT[k] < clear) B = emis(hiTau[k]) * planck(lam, hiT[k] + K) + (1 - emis(hiTau[k])) * B;
    return planckInv(lam, B) - K;
  };

  const describe = k => {
    if (surf[k] === 255) return T.what.space;
    if (hiTau[k] > 3) return T.what[['', 'cb', 'frontHigh', 'comma', 'cirrus'][hiKind[k]] || 'frontHigh'];
    if (midTau[k] > 4) return T.what.frontMid;
    if (hiTau[k] > 0.4 && hiKind[k] === 4) return T.what.cirrus;
    if (lowTau[k] > 3) return T.what[['', 'fog', 'cumulus', 'lowOther'][lowKind[k]]];
    return T.what[['sea', 'land', 'desert', 'snow'][surf[k]]];
  };
  const isFog = k => lowKind[k] === 1 && lowTau[k] > 4 && hiTau[k] < 0.5 && midTau[k] < 2;

  // ============ COLOURS ============
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const scaleFn = stops => {
    const s = stops.map(([v, c]) => [v, rgb(c)]);
    return v => {
      if (v <= s[0][0]) return s[0][1];
      for (let i = 1; i < s.length; i++) {
        if (v <= s[i][0]) {
          const f = (v - s[i - 1][0]) / (s[i][0] - s[i - 1][0]), a = s[i - 1][1], b = s[i][1];
          return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
        }
      }
      return s[s.length - 1][1];
    };
  };
  const SCALE = { vis: scaleFn(C.vis), ir: scaleFn(C.ir), wv: scaleFn(C.wv) };
  const SPACE = rgb(C.space);
  // the visible picture is shown with a gamma, as on real VIS images
  const visShown = v => Math.pow(Math.min(1, v / 0.7), 0.75);

  // ============ DOM ============
  const frame = document.getElementById('stage-frame');
  const canvas = document.getElementById('image');
  const ctx = canvas.getContext('2d');
  const chips = [...document.querySelectorAll('.chip-btn[data-ch]')];
  const cells = [...document.querySelectorAll('.probe-grid > div[data-ch]')];
  const timeIn = document.getElementById('time');
  const timeOut = document.getElementById('time-out');
  const playBtn = document.getElementById('time-play');
  const playIcon = document.getElementById('time-icon');
  const coastBtn = document.getElementById('coast-btn');
  const roVis = document.getElementById('ro-vis'), roIr = document.getElementById('ro-ir'), roWv = document.getElementById('ro-wv');
  const roWhat = document.getElementById('ro-what');
  const badge = SCAPE.badge(frame);
  const tasks = SCAPE.taskDialog('channel-tasks');

  const state = { ch: 'vis', utc: 12, probe: null, coasts: true, playing: false, seenNight: { vis: false, ir: false } };

  // ============ IMAGES ============
  const imgCanvas = { vis: document.createElement('canvas'), ir: document.createElement('canvas'), wv: document.createElement('canvas') };
  Object.values(imgCanvas).forEach(c => { c.width = NW; c.height = NH; });
  const values = { vis: new Float32Array(N), ir: new Float32Array(N), wv: new Float32Array(N) };

  const renderChannel = ch => {
    const c = imgCanvas[ch], cx = c.getContext('2d'), img = cx.createImageData(NW, NH), d = img.data;
    const vals = values[ch], utc = state.utc, sc = SCALE[ch];
    for (let k = 0; k < N; k++) {
      let col;
      if (surf[k] === 255) col = SPACE;
      else {
        const v = ch === 'vis' ? visValue(k, utc) : ch === 'ir' ? irValue(k, utc) : wvValue(k);
        vals[k] = v;
        col = sc(ch === 'vis' ? visShown(v) : v);
      }
      d[4 * k] = col[0]; d[4 * k + 1] = col[1]; d[4 * k + 2] = col[2]; d[4 * k + 3] = 255;
    }
    cx.putImageData(img, 0, 0);
  };

  // coastlines in canvas fractions, projected once
  const COASTS = (() => {
    const out = [];
    for (const r of window.LAND || []) {
      let line = [];
      for (let i = 0; i <= r.length / 2; i++) {
        const ii = i % (r.length / 2);
        const p = projectLL(r[2 * ii] / 10, r[2 * ii + 1] / 10);
        const inside = p && p[0] > -0.2 && p[0] < 1.2 && p[1] > -0.2 && p[1] < 1.2;
        if (inside && line.length && Math.abs(p[0] - line[line.length - 1][0]) < 0.3) line.push(p);
        else { if (line.length > 1) out.push(line); line = inside ? [p] : []; }
      }
      if (line.length > 1) out.push(line);
    }
    return out;
  })();

  // ============ DRAWING ============
  let W = 0, H = 0, DPR = 1, box = { x: 0, y: 0, w: 1, h: 1 };
  const resize = () => {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = frame.clientWidth; H = frame.clientHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    const s = Math.min(W / NW, H / NH);
    box = { w: NW * s, h: NH * s, x: (W - NW * s) / 2, y: (H - NH * s) / 2 };
    draw();
  };

  // the scan: a new channel appears row by row from south to north
  let scan = null;
  const draw = () => {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = C.space; ctx.fillRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = true;
    const { x, y, w, h } = box;
    if (scan) {
      ctx.drawImage(imgCanvas[scan.from], x, y, w, h);
      const f = scan.f, rows = Math.round(NH * f), sy = NH - rows;
      if (rows > 0) ctx.drawImage(imgCanvas[state.ch], 0, sy, NW, rows, x, y + h * sy / NH, w, h * rows / NH);
      ctx.fillStyle = C.coast; ctx.fillRect(x, y + h * sy / NH - 1.5, w, 3);
    } else ctx.drawImage(imgCanvas[state.ch], x, y, w, h);

    if (state.coasts) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      ctx.strokeStyle = C.coast; ctx.globalAlpha = 0.75; ctx.lineWidth = 1; ctx.lineJoin = 'round';
      ctx.beginPath();
      for (const line of COASTS) {
        ctx.moveTo(x + line[0][0] * w, y + line[0][1] * h);
        for (let i = 1; i < line.length; i++) ctx.lineTo(x + line[i][0] * w, y + line[i][1] * h);
      }
      ctx.stroke(); ctx.restore();
    }

    if (state.probe) {
      const px = x + (state.probe.i + 0.5) / NW * w, py = y + (state.probe.j + 0.5) / NH * h;
      ctx.strokeStyle = C.probe; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, 2 * Math.PI);
      ctx.moveTo(px - 18, py); ctx.lineTo(px - 9, py); ctx.moveTo(px + 9, py); ctx.lineTo(px + 18, py);
      ctx.moveTo(px, py - 18); ctx.lineTo(px, py - 9); ctx.moveTo(px, py + 9); ctx.lineTo(px, py + 18);
      ctx.stroke();
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(px, py, 11, 0, 2 * Math.PI); ctx.stroke();
    }
  };

  const startScan = from => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { scan = null; draw(); return; }
    scan = { from, f: 0, t0: performance.now() };
    const step = now => {
      if (!scan) return;
      scan.f = Math.min(1, (now - scan.t0) / 650);
      draw();
      if (scan.f < 1) requestAnimationFrame(step); else { scan = null; draw(); }
    };
    requestAnimationFrame(step);
  };

  // ============ READOUTS, LEGEND, CARD ============
  const fmt = v => (Math.round(v) === 0 ? '0' : String(Math.round(v)).replace('-', '−'));
  const updateProbe = () => {
    const p = state.probe;
    if (!p) return;
    const k = p.j * NW + p.i;
    if (surf[k] === 255) { roVis.textContent = roIr.textContent = roWv.textContent = '–'; }
    else {
      const v = visValue(k, state.utc);
      roVis.textContent = sunCos(k, state.utc) <= 0 ? T.readout.night : Math.round(v * 100) + ' %';
      roIr.textContent = fmt(irValue(k, state.utc)) + ' °C';
      roWv.textContent = fmt(wvValue(k)) + ' °C';
    }
    roWhat.textContent = describe(k);
  };

  const legendBar = document.getElementById('legend-bar');
  const drawLegend = () => {
    const ch = state.ch, L = T.channels[ch];
    document.getElementById('legend-title').textContent = L.legendTitle;
    document.getElementById('legend-low').textContent = ch === 'vis' ? L.legendLow : L.legendLow;
    document.getElementById('legend-high').textContent = L.legendHigh;
    const w = legendBar.clientWidth || 300;
    legendBar.width = w; legendBar.height = 18;
    const lc = legendBar.getContext('2d'), stops = C[ch];
    const v0 = stops[0][0], v1 = stops[stops.length - 1][0];
    for (let x = 0; x < w; x++) {
      const v = v0 + (v1 - v0) * x / (w - 1);
      const c = SCALE[ch](v);
      lc.fillStyle = 'rgb(' + c.map(Math.round).join(',') + ')';
      lc.fillRect(x, 0, 1, 18);
    }
    const ticks = document.getElementById('legend-ticks');
    ticks.innerHTML = '';
    const marks = ch === 'vis' ? [0, 0.25, 0.5, 0.75, 1] : ch === 'ir' ? [-70, -50, -30, -10, 10, 30] : [-65, -55, -45, -35, -25];
    for (const m of marks) {
      const sp = document.createElement('span');
      const f = (m - v0) / (v1 - v0);
      sp.style.left = (f * 100) + '%';
      // the visible scale is labelled in % of reflected light (inverse of the display gamma)
      sp.textContent = ch === 'vis' ? Math.round(Math.pow(m, 1 / 0.75) * 70) + ' %' : fmt(m) + ' °C';
      ticks.appendChild(sp);
    }
  };

  const setCard = () => {
    const c = T.channels[state.ch];
    document.getElementById('mode-card').style.setProperty('--obj', 'var(--ch-' + state.ch + ')');
    document.getElementById('mode-title').textContent = c.title;
    document.getElementById('mode-sub').innerHTML = c.sub;
    document.getElementById('mode-bullets').innerHTML = c.bullets.map(b => '<li>' + b + '</li>').join('');
    cells.forEach(el => el.classList.toggle('current', el.dataset.ch === state.ch));
    drawSpectrum();
  };

  // ---- the spectrum: the Sun's light and the Earth's heat, and where the channels sit ----
  const svg = document.getElementById('spectrum');
  const drawSpectrum = () => {
    const S = window.THEME.palette, Wd = 400, Ht = 150, x0 = 14, x1 = 386, yB = 112;
    const lx = lam => x0 + (Math.log10(lam) - Math.log10(0.3)) / (Math.log10(20) - Math.log10(0.3)) * (x1 - x0);
    const curve = (Tk, peak) => {
      let pts = [], max = 0;
      const vals = [];
      for (let i = 0; i <= 120; i++) {
        const lam = Math.pow(10, Math.log10(0.3) + i / 120 * (Math.log10(20) - Math.log10(0.3)));
        const v = lam * Math.pow(lam, -5) * planck(lam, Tk);   // per log-wavelength
        vals.push([lam, v]); max = Math.max(max, v);
      }
      for (const [lam, v] of vals) pts.push(lx(lam).toFixed(1) + ',' + (yB - v / max * peak).toFixed(1));
      return pts.join(' ');
    };
    const ch = state.ch;
    const mark = (lam, key, label) => {
      const x = lx(lam), on = key === ch;
      return '<line x1="' + x + '" y1="18" x2="' + x + '" y2="' + yB + '" stroke="' + (on ? '#000' : '#999') + '" stroke-width="' + (on ? 3 : 1.5) + '"/>' +
        '<text x="' + x + '" y="12" font-size="10.5" text-anchor="middle" font-weight="' + (on ? 500 : 400) + '" fill="#000">' + label + '</text>';
    };
    const t = T.spectrum;
    svg.innerHTML =
      '<rect x="' + lx(0.4) + '" y="' + yB + '" width="' + (lx(0.7) - lx(0.4)) + '" height="7" fill="' + S.yellow + '"/>' +
      '<rect x="' + lx(5.6) + '" y="22" width="' + (lx(7.4) - lx(5.6)) + '" height="' + (yB - 22) + '" fill="' + S.paleGreen + '"/>' +
      '<polyline points="' + curve(5772, 74) + '" fill="none" stroke="' + S.gold + '" stroke-width="2"/>' +
      '<polyline points="' + curve(255, 74) + '" fill="none" stroke="' + S.red + '" stroke-width="2"/>' +
      mark(0.64, 'vis', '0,6') + mark(6.3, 'wv', '6,3') + mark(10.5, 'ir', '10,5') +
      '<line x1="' + x0 + '" y1="' + yB + '" x2="' + x1 + '" y2="' + yB + '" stroke="#000" stroke-width="1.5"/>' +
      [0.5, 1, 2, 5, 10, 20].map(l => '<line x1="' + lx(l) + '" y1="' + yB + '" x2="' + lx(l) + '" y2="' + (yB + 4) + '" stroke="#000"/><text x="' + Math.min(x1 - 6, lx(l)) + '" y="' + (yB + 16) + '" font-size="9.5" text-anchor="middle">' + String(l).replace('.', ',') + '</text>').join('') +
      '<text x="' + ((x0 + x1) / 2) + '" y="' + (Ht - 4) + '" font-size="9.5" text-anchor="middle" fill="#4d4d4d">' + t.axis + '</text>';
    svg.setAttribute('viewBox', '0 0 ' + Wd + ' ' + Ht);
  };

  // ============ TASKS ============
  const isNight = () => {
    // night over the centre of the picture (≈ 45° N, 5° E)
    const h = (5 + (state.utc - 12) * 15) * D2R, p = 45 * D2R, d = DECL * D2R;
    return Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(h) < -0.05;
  };
  const checkTasks = () => {
    if (isNight() && (state.ch === 'vis' || state.ch === 'ir')) state.seenNight[state.ch] = true;
    if (state.seenNight.vis && state.seenNight.ir) tasks.done('night');
    const p = state.probe;
    if (!p) return;
    const k = p.j * NW + p.i;
    if (surf[k] === 255) return;
    if (state.ch === 'ir' && irValue(k, state.utc) < -55) tasks.done('cold');
    if (state.ch === 'wv' && isFog(k)) tasks.done('fog');
  };

  // ============ INPUT ============
  const setChannel = ch => {
    if (ch === state.ch) return;
    const from = state.ch;
    state.ch = ch;
    chips.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.ch === ch)));
    setCard(); drawLegend(); updateProbe(); checkTasks();
    startScan(from);
  };
  chips.forEach(c => c.addEventListener('click', () => setChannel(c.dataset.ch)));

  const setTime = h => {
    state.utc = ((h % 24) + 24) % 24;
    timeIn.value = String(Math.round(state.utc * 4) / 4);
    timeOut.textContent = T.controls.timeValue(Math.round(state.utc * 4) / 4);
    renderChannel('vis'); renderChannel('ir');
    draw(); updateProbe(); checkTasks();
  };
  timeIn.addEventListener('input', () => { stopPlay(); setTime(Number(timeIn.value)); });

  let playTimer = 0;
  const ICON_PLAY = '<path d="M6 4l14 8-14 8V4z" fill="currentColor"/>';
  const ICON_PAUSE = '<rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/>';
  const stopPlay = () => {
    state.playing = false; clearInterval(playTimer);
    playIcon.innerHTML = ICON_PLAY; playBtn.setAttribute('aria-pressed', 'false'); playBtn.setAttribute('aria-label', T.controls.playAria);
  };
  playBtn.addEventListener('click', () => {
    if (state.playing) { stopPlay(); return; }
    state.playing = true;
    playIcon.innerHTML = ICON_PAUSE; playBtn.setAttribute('aria-pressed', 'true'); playBtn.setAttribute('aria-label', T.controls.pauseAria);
    playTimer = setInterval(() => setTime(state.utc + 0.25), 250);   // one hour per second
  });

  coastBtn.addEventListener('click', () => {
    state.coasts = !state.coasts;
    coastBtn.setAttribute('aria-pressed', String(state.coasts));
    draw();
  });

  const pick = e => {
    const r = canvas.getBoundingClientRect();
    const fx = (e.clientX - r.left - box.x) / box.w, fy = (e.clientY - r.top - box.y) / box.h;
    if (fx < 0 || fx >= 1 || fy < 0 || fy >= 1) return;
    state.probe = { i: Math.floor(fx * NW), j: Math.floor(fy * NH) };
    badge.hide();
    draw(); updateProbe(); checkTasks();
  };
  let dragging = false;
  canvas.addEventListener('pointerdown', e => { dragging = true; canvas.setPointerCapture(e.pointerId); pick(e); });
  canvas.addEventListener('pointermove', e => { if (dragging) pick(e); });
  canvas.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('pointercancel', () => { dragging = false; });

  // ============ START ============
  buildScene();
  renderChannel('vis'); renderChannel('ir'); renderChannel('wv');
  setCard();
  setTime(12);
  resize();
  drawLegend();
  badge.show(T.badge);
  window.addEventListener('resize', () => { resize(); drawLegend(); });
  if (window.ResizeObserver) new ResizeObserver(() => { resize(); }).observe(frame);

  // for tests
  window.KANAELE = { state, setChannel, setTime, NW, NH, at: (lo, la) => {
    let best = -1, bd = Infinity;
    for (let k = 0; k < N; k++) { if (surf[k] === 255) continue; const d = (lon[k] - lo) ** 2 + (lat[k] - la) ** 2; if (d < bd) { bd = d; best = k; } }
    return { i: best % NW, j: Math.floor(best / NW), vis: visValue(best, state.utc), ir: irValue(best, state.utc), wv: wvValue(best), what: describe(best) };
  }, probeAt: (i, j) => { state.probe = { i, j }; draw(); updateProbe(); checkTasks(); } };
})();
