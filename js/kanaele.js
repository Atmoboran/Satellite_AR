// Chapter 3: the same weather seen in three channels of a geostationary
// imager (like the FCI on Meteosat-12): visible 0.6 µm, infrared 10.5 µm,
// water vapour 6.3 µm – for several weather situations, by day and by night.
//
// The weather is a model, not a photograph: a scene (SCENES below) lists
// lows with their fronts, thunderstorms, fog, snow cover, jet-stream cirrus,
// shower cells in cold air and the season. From it the code decides for every
// pixel the physical state (surface type and temperature, cloud layers with
// optical thickness and top temperature, humidity of the upper troposphere).
// Each channel is then computed from that state with its own physics, so the
// pictures differ for the right reasons:
//   VIS – sunlight reflected by surface and clouds (two-stream adding),
//         times the cosine of the sun's zenith angle: dark at night.
//   IR  – thermal emission: surface radiance passed up through the cloud
//         layers (emissivity from optical thickness), Planck at 10.5 µm.
//   WV  – emission of the upper-tropospheric water vapour; only clouds above
//         the emitting layer show, the surface and low clouds never do.
// The clouds stand still: day and night only change sunlight and the
// temperature of the ground. All six pictures of a scene (3 channels × day /
// night) are computed once and kept.
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
  // third value: how far the point lies beyond the ends of the line (0 alongside
  // it) – "ahead of" or "behind" a front fades out there instead of ending in a
  // straight cut
  const polyDist = (x, y, pts) => {
    let best = Infinity, side = 1, over = 0;
    const last = pts.length - 2;
    for (let k = 0; k + 1 < pts.length; k++) {
      const [ax, ay] = pts[k], [bx, by] = pts[k + 1];
      const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
      const tr = ((x - ax) * dx + (y - ay) * dy) / L, t = Math.max(0, Math.min(1, tr));
      const px = ax + t * dx - x, py = ay + t * dy - y, d = Math.hypot(px, py);
      if (d < best) {
        best = d; side = (dx * (y - ay) - dy * (x - ax)) > 0 ? 1 : -1;
        over = (k === 0 && tr < 0 ? -tr : k === last && tr > 1 ? tr - 1 : 0) * Math.sqrt(L);
      }
    }
    return [best, side, over];
  };
  const toXY = ([lo, la]) => [lo * Math.cos(la * D2R), la];

  // ============ THE WEATHER SITUATIONS ============
  // Positions in degrees longitude / latitude. Temperatures in °C (daily mean
  // at the given latitude, change per degree further north).
  //   lows:   centre, cold and warm front (polylines), whether it has a comma
  //           cloud, latitudes of its dry slot behind the cold front
  //   storms: [lon, lat, radius] of thunderstorm anvils; anvil: direction the
  //           upper wind stretches them to (degrees, 0 = east, 90 = north)
  //   fog:    ellipses [lon, lat, rx, ry] where fog/low stratus may lie (land)
  //   snow:   ellipses [lon, lat, rx, ry, share] of snow cover (land)
  //   cells:  boxes [lon0, lon1, lat0, lat1] of shower cells over the sea in cold air
  //   deck:   boxes of flat stratocumulus over a cold sea
  //   fairCu: fair-weather cumulus over land in summer
  const SCENES = {
    herbst: {
      decl: -8.5, day: 12, night: 0,
      sea: [24, 0.42], land: [21, 0.62], desert: 27, med: 2, ampLand: 6,
      lows: [{ c: [-16, 56], comma: true, dry: [41, 57],
        cold: [[-14, 55], [-10, 52], [-8, 48], [-9, 44], [-12, 40], [-17, 35.5], [-23, 31.5]],
        warm: [[-14, 55], [-8, 57.5], [-1, 58.5], [6, 58]] }],
      storms: [[14.6, 38.4, 1.5], [18.2, 36.8, 1.15], [11.2, 40.6, 0.9], [20.6, 39.6, 1.0], [16.2, 41.6, 0.6]], anvil: 37,
      jet: [[-32, 26.5], [-18, 28.5], [-4, 31], [10, 31.5], [24, 30.5], [36, 29]],
      fog: [[12.5, 50.4, 7.5, 2.6]],
      snow: [[10.3, 46.5, 4.4, 0.85, 0.47]],
      cells: [[-40, -9, 38, 60]], deck: [], fairCu: false, trade: true,
      uth: 0.42
    },
    sommer: {
      decl: 21.5, day: 14, night: 2,
      sea: [27, 0.38], land: [29, 0.5], desert: 37, med: 2, ampLand: 8,
      lows: [{ c: [-12, 57], comma: true, dry: [44, 58],
        cold: [[-10, 56], [-5, 53], [-1.5, 50], [-1, 46.5], [-3.5, 43.5]],
        warm: [[-10, 56], [-3, 58.5], [5, 59.5]] }],
      // a line of thunderstorms ahead of the front, over France, Germany, the Alps and the Balkans
      storms: [[3.2, 50.6, 0.9], [5.6, 49.3, 1.2], [8.4, 48.2, 1.0], [10.6, 47.0, 1.15], [13.4, 46.4, 0.8],
               [16.8, 45.6, 0.9], [20.2, 44.6, 0.8], [2.0, 47.3, 0.7], [7.0, 51.6, 0.6]], anvil: 50,
      jet: [[-30, 41], [-15, 45], [-3, 48.5], [8, 52], [22, 55]],
      fog: [], snow: [],
      cells: [], deck: [[-32, -9.5, 24, 39]], fairCu: true, trade: false,
      uth: 0.45
    },
    winter: {
      decl: -21, day: 12, night: 0,
      sea: [17, 0.48], land: [11, 0.95], desert: 16, med: 1, ampLand: 4,
      lows: [{ c: [9.5, 43.6], comma: true, dry: [36, 43.5],
        cold: [[10.5, 43], [12.4, 40.5], [12.8, 37.6], [11, 34.5], [8.5, 31.5]],
        warm: [[10.5, 43], [14.5, 44.6], [19, 45.4], [23, 45]] }],
      storms: [[16.5, 38.6, 0.8], [18.8, 36.9, 0.7]], anvil: 60,
      jet: [[-32, 28], [-18, 29], [-6, 31], [4, 32.5]],
      fog: [[19.5, 47, 2.6, 1.2], [8.5, 45.1, 2.4, 0.55]],
      // snow over Scandinavia, the Baltic, Poland and the east, and on the Alps
      snow: [[22, 62, 16, 8.5, 0.18], [24, 55, 12, 4.5, 0.32], [10.3, 46.5, 4.6, 1.0, 0.4]],
      cells: [[-25, 12, 54, 70]], deck: [], fairCu: false, trade: false,
      uth: 0.32
    }
  };

  // per pixel state of the current scene
  const surf = new Uint8Array(N);        // 0 sea, 1 land, 2 desert, 3 snow, 255 space
  const albedo = new Float32Array(N);
  const tMean = new Float32Array(N), tAmp = new Float32Array(N);
  const lowTau = new Float32Array(N), lowDT = new Float32Array(N);
  const midTau = new Float32Array(N);
  const hiTau = new Float32Array(N), hiT = new Float32Array(N);
  const uth = new Float32Array(N);
  let decl = 0;

  const inEll = (lo, la, e) => Math.hypot((lo - e[0]) / e[2], (la - e[1]) / e[3]);
  const inBox = (lo, la, b) => lo > b[0] && lo < b[1] && la > b[2] && la < b[3];

  const buildScene = sc => {
    G.landMask();
    decl = sc.decl;
    const lows = sc.lows.map(L => ({ ...L, cxy: toXY(L.c), coldXY: L.cold.map(toXY), warmXY: L.warm.map(toXY) }));
    const storms = sc.storms.map(([lo, la, r]) => [toXY([lo, la])[0], la, r]);
    const jet = sc.jet.map(toXY);
    const ac = Math.cos(sc.anvil * D2R), as = Math.sin(sc.anvil * D2R);
    for (let k = 0; k < N; k++) {
      const lo = lon[k], la = lat[k];
      if (lo !== lo) { surf[k] = 255; continue; }
      const x = lo * Math.cos(la * D2R), y = la;
      const land = G.isLand(lo, la);
      const n1 = fbm(x * 0.55, y * 0.55, 21), n2 = fbm(x * 1.6, y * 1.6, 22);

      // ---- surface ----
      let s = land ? 1 : 0;
      const df = land && lo > -17 ? smooth(35, 30.5, la + 2 * (fbm(x * 0.5, y * 0.5, 9) - 0.5)) : 0;   // desert share
      if (df > 0.5) s = 2;
      // snow thins out towards the edge of its area (more and more gaps), no hard rim
      if (land) for (const e of sc.snow) { const r = inEll(lo, la, e); if (r < 1.25 && fbm(x * 1.4, y * 1.4, 11) > e[4] + 0.5 * Math.max(0, r - 0.55)) s = 3; }
      surf[k] = s;
      const med = !land && lo > -5.5 && la < 45.5 && la > 30 ? sc.med : 0;
      const tLand = sc.land[0] - sc.land[1] * (la - 30);
      if (s === 0) { albedo[k] = 0.06; tMean[k] = sc.sea[0] - sc.sea[1] * (la - 30) + med; tAmp[k] = 0.3; }
      else if (s === 3) { albedo[k] = 0.62 + 0.15 * n2; tMean[k] = Math.min(-3, tLand - 4); tAmp[k] = 3; }
      else {
        const aL = 0.13 + 0.06 * fbm(x * 0.8, y * 0.8, 3), aD = 0.30 + 0.1 * fbm(x * 0.6, y * 0.6, 5);
        albedo[k] = aL + (aD - aL) * df;
        tMean[k] = tLand * (1 - df) + (sc.desert - 0.2 * (la - 25)) * df;
        tAmp[k] = sc.ampLand + 6 * df;
      }

      // ---- lows: frontal cloud bands, comma, dry slot ----
      let band = 0, ahead = 0, warm = 0, comma = 0, dry = 0, behind = false, dcMin = Infinity;
      for (const L of lows) {
        const [dc, side, over] = polyDist(x, y, L.coldXY);
        const endFade = Math.exp(-((over / 1.5) ** 2));
        const [dw] = polyDist(x, y, L.warmXY);
        const north = L.c[1];
        band = Math.max(band, Math.exp(-((dc / 1.7) ** 2)) * (0.55 + 0.9 * n1));
        if (side > 0) ahead = Math.max(ahead, endFade * Math.exp(-((Math.max(0, dc - 1) / 3.6) ** 2)) * smooth(0.35, 0.6, n1 + 0.15 * n2) * smooth(north + 1.5, north - 1.5, la));
        warm = Math.max(warm, Math.exp(-((dw / 2.6) ** 2)) * (0.6 + 0.6 * n2));
        if (L.comma) {
          const rx = x - L.cxy[0], ry = y - L.cxy[1], r = Math.hypot(rx, ry), th = Math.atan2(ry, rx);
          const arm = Math.max(0, Math.cos(th - r * 0.42 + 2.2)) ** 1.6;
          comma = Math.max(comma, arm * Math.exp(-((r / 7.5) ** 2)) * smooth(0.6, 1.8, r) * (0.6 + 0.8 * n2));
        }
        if (side < 0) {
          dry = Math.max(dry, endFade * Math.exp(-(((dc - 3.2) / 2.0) ** 2)) * smooth(L.dry[0], L.dry[0] + 5, la) * smooth(L.dry[1], L.dry[1] - 4, la));
          if (dc < dcMin) { dcMin = dc; behind = true; }
        } else if (dc < dcMin) { dcMin = dc; behind = false; }
      }

      let hT = 0, hTop = -45;
      const front = Math.max(band, 0.8 * warm) * (1 - 0.9 * dry);
      if (front > 0.25) { hT = 9 * (front - 0.25) * (0.7 + 0.6 * n2); hTop = -44 - 6 * n2; }
      if (comma > 0.3 && comma * 10 > hT) { hT = 10 * (comma - 0.3) + hT * 0.3; hTop = -40 - 6 * n1; }
      let mid = (14 * Math.max(ahead, band) * (1 - dry) + 8 * comma) * (0.6 + 0.8 * n2);

      // ---- thunderstorms: anvils stretched by the upper wind ----
      let stormQ = 0;
      for (const [sx, sy, sr] of storms) {
        const ex = x - sx, ey = y - sy;
        const u = ex * ac + ey * as, v = -ex * as + ey * ac;
        const dd = Math.hypot((u - 0.35 * sr) / 1.45, v) / sr;
        stormQ += Math.exp(-((Math.hypot(ex - 0.5 * ac, ey - 0.5 * as) / (2.3 * sr)) ** 2));
        const edge = 1 + 0.35 * (fbm(x * 2.2, y * 2.2, 31) - 0.5);
        if (dd < edge) {
          const core = Math.exp(-((dd / 0.33) ** 2));
          const tau = 45 * smooth(edge, edge * 0.55, dd) + 30 * core;
          if (tau > hT) { hT = tau; hTop = -56 - 11 * core - 2 * n2; }
          mid += 20 * smooth(edge, 0.3, dd);
        }
      }
      midTau[k] = mid;

      // ---- jet-stream cirrus ----
      const [dj] = polyDist(x, y, jet);
      const streak = smooth(0.42, 0.7, fbm(x * 0.35 + y * 0.5, y * 2.4 - x * 0.2, 41, 5));
      const ci = 2.2 * Math.exp(-((dj / 1.9) ** 2)) * streak;
      if (ci > 0.15 && hT < 0.4) { hT = ci; hTop = -48 - 5 * n1; }
      hiTau[k] = hT; hiT[k] = hTop;

      // ---- low clouds ----
      let lt = 0, ld = -6;
      // fog / low stratus under high pressure: as warm as the ground below
      if (land && s !== 3) for (const e of sc.fog) {
        const f = fbm(x * 0.9, y * 0.9, 51) + 0.32 * (1 - inEll(lo, la, e)) - 0.06;
        if (f > 0.5) { lt = Math.max(lt, 18 * smooth(0.5, 0.56, f)); ld = +1.5; }
      }
      // shower cells over the sea in cold air (behind a front or in an outbreak)
      if (!land) for (const b of sc.cells) {
        if (!inBox(lo, la, b) || (!behind && dcMin < 3.5)) continue;
        const cells = smooth(0.52, 0.66, fbm(x * 2.1, y * 2.1, 61, 3)) * smooth(b[2], b[2] + 3, la);
        if (cells > 0) { lt = 5 * cells; ld = -14; }
      }
      // flat stratocumulus over a cold sea
      if (!land) for (const b of sc.deck) {
        // soft edges: the deck thins out towards the sides of its box
        const edge = Math.min(smooth(b[0], b[0] + 4, lo), smooth(b[1], b[1] - 4, lo), smooth(b[2], b[2] + 3, la), smooth(b[3], b[3] - 3, la));
        if (edge <= 0) continue;
        const d = smooth(0.42, 0.52, fbm(x * 0.8, y * 0.8, 91) + 0.25 * edge - 0.12);
        if (d > 0) { lt = Math.max(lt, 9 * d); ld = -7; }
      }
      // fair-weather cumulus over land on a summer afternoon
      if (sc.fairCu && land && df < 0.5 && la > 40 && la < 58) {
        const cu = smooth(0.6, 0.7, fbm(x * 3.2, y * 3.2, 95, 3));
        if (cu > 0) { lt = Math.max(lt, 4 * cu); ld = -16; }
      }
      // under the fronts and the comma
      const under = Math.max(band, comma, 0.6 * ahead);
      if (under > 0.3 && lt < 8) { lt = 10 * under; ld = -9; }
      // a few trade-wind cumulus far out over the subtropical Atlantic
      if (sc.trade && !land && la < 34 && lo < -16 && lt === 0) {
        const tc = smooth(0.6, 0.7, fbm(x * 2.6, y * 2.6, 71, 3));
        if (tc > 0) { lt = 3 * tc; ld = -8; }
      }
      lowTau[k] = lt; lowDT[k] = ld;

      // ---- humidity of the upper troposphere (0 … 1) ----
      const subtrop = smooth(36, 30, la);
      let q = sc.uth + 0.3 * (fbm(x * 0.4 + y * 0.3, y * 0.9, 81) - 0.5) - 0.24 * subtrop;
      q += 0.55 * Math.max(band, 0.8 * warm, comma) + 0.3 * ahead + 0.6 * Math.min(1.2, stormQ);
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
    const h = (lon[k] + (utc - 12) * 15) * D2R, p = lat[k] * D2R, d = decl * D2R;
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
  const sceneBtns = [...document.querySelectorAll('[data-scene]')];
  const timeBtns = [...document.querySelectorAll('[data-time]')];
  const sceneText = document.getElementById('scene-text');
  const busy = document.getElementById('busy');
  const tasks = SCAPE.taskDialog('channel-tasks');

  const state = { scene: 'herbst', ch: 'vis', time: 'day', seen: {} };

  // ============ PICTURES: 3 channels × day/night per scene, computed once ============
  const cache = {};                       // cache[scene][time][ch] = canvas
  const renderAll = key => {
    const sc = SCENES[key];
    buildScene(sc);
    const out = {};
    for (const time of ['day', 'night']) {
      const utc = sc[time];
      out[time] = {};
      for (const ch of ['vis', 'ir', 'wv']) {
        const c = document.createElement('canvas'); c.width = NW; c.height = NH;
        const cx = c.getContext('2d'), img = cx.createImageData(NW, NH), d = img.data, scale = SCALE[ch];
        for (let k = 0; k < N; k++) {
          let col;
          if (surf[k] === 255) col = SPACE;
          else if (ch === 'vis') col = scale(visShown(visValue(k, utc)));
          else if (ch === 'ir') col = scale(irValue(k, utc));
          else col = scale(wvValue(k));
          d[4 * k] = col[0]; d[4 * k + 1] = col[1]; d[4 * k + 2] = col[2]; d[4 * k + 3] = 255;
        }
        cx.putImageData(img, 0, 0);
        out[time][ch] = c;
      }
    }
    cache[key] = out;
  };
  const picture = () => cache[state.scene] && cache[state.scene][state.time][state.ch];

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

  // a new picture appears row by row from south to north, as the imager scans
  let scan = null;
  const draw = () => {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = C.space; ctx.fillRect(0, 0, W, H);
    const pic = picture();
    if (!pic) return;
    ctx.imageSmoothingEnabled = true;
    const { x, y, w, h } = box;
    if (scan) {
      ctx.drawImage(scan.from, x, y, w, h);
      const rows = Math.round(NH * scan.f), sy = NH - rows;
      if (rows > 0) ctx.drawImage(pic, 0, sy, NW, rows, x, y + h * sy / NH, w, h * rows / NH);
      ctx.fillStyle = C.coast; ctx.fillRect(x, y + h * sy / NH - 1.5, w, 3);
    } else ctx.drawImage(pic, x, y, w, h);

    // coastlines, for orientation
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.strokeStyle = C.coast; ctx.globalAlpha = 0.75; ctx.lineWidth = 1; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (const line of COASTS) {
      ctx.moveTo(x + line[0][0] * w, y + line[0][1] * h);
      for (let i = 1; i < line.length; i++) ctx.lineTo(x + line[i][0] * w, y + line[i][1] * h);
    }
    ctx.stroke(); ctx.restore();
  };

  const startScan = from => {
    if (!from || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { scan = null; draw(); return; }
    scan = { from, f: 0, t0: performance.now() };
    const step = now => {
      if (!scan) return;
      scan.f = Math.min(1, (now - scan.t0) / 650);
      draw();
      if (scan.f < 1) requestAnimationFrame(step); else { scan = null; draw(); }
    };
    requestAnimationFrame(step);
  };

  // ============ LEGEND, CARD ============
  const fmt = v => (Math.round(v) === 0 ? '0' : String(Math.round(v)).replace('-', '−'));
  const legendBar = document.getElementById('legend-bar');
  const drawLegend = () => {
    const ch = state.ch, L = T.channels[ch];
    document.getElementById('legend-title').textContent = L.legendTitle;
    document.getElementById('legend-low').textContent = L.legendLow;
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
  const checkTasks = () => {
    const k = state.scene + '|' + state.time + '|' + state.ch;
    state.seen[k] = true;
    const seen = (sc, t, ch) => state.seen[sc + '|' + t + '|' + ch];
    if (['herbst', 'sommer', 'winter'].some(sc => seen(sc, 'night', 'vis') && seen(sc, 'night', 'ir'))) tasks.done('night');
    if (seen('herbst', 'day', 'vis') && seen('herbst', 'day', 'wv')) tasks.done('fog');
    if (seen('winter', 'day', 'vis') && seen('winter', 'day', 'ir')) tasks.done('snow');
  };

  // ============ INPUT ============
  const press = (btns, attr, val) => btns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset[attr] === val)));
  const show = from => { startScan(from); checkTasks(); };

  chips.forEach(c => c.addEventListener('click', () => {
    if (c.dataset.ch === state.ch) return;
    const from = picture();
    state.ch = c.dataset.ch;
    press(chips, 'ch', state.ch);
    setCard(); drawLegend();
    show(from);
  }));
  timeBtns.forEach(b => b.addEventListener('click', () => {
    if (b.dataset.time === state.time) return;
    const from = picture();
    state.time = b.dataset.time;
    press(timeBtns, 'time', state.time);
    show(from);
  }));
  // a new scene is computed on its first use (about a second); show that it is coming
  const setScene = key => {
    const from = picture();
    state.scene = key;
    press(sceneBtns, 'scene', key);
    sceneText.innerHTML = T.scenes[key].text;
    if (cache[key]) { show(from); return; }
    busy.hidden = false;
    sceneBtns.forEach(b => { b.disabled = true; });
    setTimeout(() => {
      renderAll(key);
      busy.hidden = true;
      sceneBtns.forEach(b => { b.disabled = false; });
      show(from);
    }, 30);
  };
  sceneBtns.forEach(b => b.addEventListener('click', () => { if (b.dataset.scene !== state.scene) setScene(b.dataset.scene); }));

  // ============ START ============
  renderAll(state.scene);
  sceneText.innerHTML = T.scenes[state.scene].text;
  setCard();
  resize();
  drawLegend();
  checkTasks();
  window.addEventListener('resize', () => { resize(); drawLegend(); });
  if (window.ResizeObserver) new ResizeObserver(() => { resize(); }).observe(frame);

  // for tests
  window.KANAELE = { state, setScene, SCENES, cache };
})();
