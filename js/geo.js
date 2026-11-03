// Shared geometry of the globe (chapters 1 and 2): vectors, longitude/latitude,
// a land mask rasterised once from data/land.js (Natural Earth 1:110m), and
// ray casting onto the Earth sphere. No drawing and no colours here.
// Frame: z = north pole, x = towards 0° longitude (Earth-fixed) or towards
// the Sun (space-fixed, chapter 1).
(() => {
  'use strict';
  const D2R = Math.PI / 180;
  const G = (window.GEO = {
    R: 6371,                 // km, mean Earth radius
    MU: 398600.4418,         // km³/s², Earth's gravitational parameter
    D2R
  });

  G.dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  G.cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  G.len = a => Math.hypot(a[0], a[1], a[2]);
  G.norm = a => { const l = G.len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  G.scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  G.add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  G.sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  // rotation about the z (polar) axis
  G.rotZ = (a, ang) => { const c = Math.cos(ang), s = Math.sin(ang); return [c * a[0] - s * a[1], s * a[0] + c * a[1], a[2]]; };

  G.fromLonLat = (lon, lat) => {
    const l = lon * D2R, p = lat * D2R, c = Math.cos(p);
    return [c * Math.cos(l), c * Math.sin(l), Math.sin(p)];
  };
  G.toLonLat = v => {
    const l = G.len(v);
    return [Math.atan2(v[1], v[0]) / D2R, Math.asin(Math.max(-1, Math.min(1, v[2] / l))) / D2R];
  };
  // great-circle angle between two unit vectors, in radians
  G.angle = (a, b) => Math.acos(Math.max(-1, Math.min(1, G.dot(a, b))));

  // circular orbit period in seconds for an orbit radius r (km)
  G.period = r => 2 * Math.PI * Math.sqrt(r * r * r / G.MU);

  // "50°N 9°O" (German compass letters)
  G.formatLonLat = (lon, lat) => {
    lon = ((lon + 540) % 360) - 180;
    const la = Math.round(Math.abs(lat)), lo = Math.round(Math.abs(lon));
    return la + '°' + (lat >= 0 ? 'N' : 'S') + ' ' + lo + '°' + (lon >= 0 ? 'O' : 'W');
  };

  // ---- land mask: equirectangular grid, 1 = land -----------------------------
  // Scanline fill, ring by ring with XOR (so holes stay open). Rings in the
  // data are cut at ±180°: each ring is unwrapped to a continuous longitude
  // first and filled with wrap-around; the ring around the South Pole, which
  // does not close after unwrapping, is closed over the pole.
  G.landMask = (W = 1440, H = 720) => {
    if (G._mask && G._mask.w === W) return G._mask;
    const mask = new Uint8Array(W * H);
    const xs = [];
    for (const r of window.LAND || []) {
      const n = r.length / 2, pts = [];
      let shift = 0, prev = null;
      for (let i = 0; i < n; i++) {
        let lon = r[2 * i] / 10;
        const lat = r[2 * i + 1] / 10;
        if (prev !== null) { while (lon + shift - prev > 180) shift -= 360; while (lon + shift - prev < -180) shift += 360; }
        prev = lon + shift;
        pts.push(prev, lat);
      }
      if (Math.abs(pts[pts.length - 2] - pts[0]) > 180) {     // goes once round the pole
        const pole = pts.reduce((m, v, i) => (i % 2 ? m + v : m), 0) < 0 ? -90 : 90;
        pts.push(pts[pts.length - 2], pole, pts[0], pole);
      }
      const m = pts.length / 2;
      let latMin = 90, latMax = -90;
      for (let i = 1; i < pts.length; i += 2) { latMin = Math.min(latMin, pts[i]); latMax = Math.max(latMax, pts[i]); }
      const r0 = Math.max(0, Math.floor((90 - latMax) * H / 180)), r1 = Math.min(H - 1, Math.ceil((90 - latMin) * H / 180));
      for (let row = r0; row <= r1; row++) {
        const lat = 90 - (row + 0.5) * 180 / H;
        xs.length = 0;
        for (let i = 0; i < m; i++) {
          const j = (i + 1) % m;
          const y1 = pts[2 * i + 1], y2 = pts[2 * j + 1];
          if ((y1 <= lat) === (y2 <= lat)) continue;
          const x1 = pts[2 * i], x2 = pts[2 * j];
          xs.push(x1 + (lat - y1) * (x2 - x1) / (y2 - y1));
        }
        xs.sort((a, b) => a - b);
        for (let k = 0; k + 1 < xs.length; k += 2) {
          const c0 = Math.ceil((xs[k] + 180) * W / 360 - 0.5), c1 = Math.floor((xs[k + 1] + 180) * W / 360 - 0.5);
          for (let c = c0; c <= c1; c++) mask[row * W + (((c % W) + W) % W)] ^= 1;
        }
      }
    }
    G._mask = { w: W, h: H, data: mask };
    return G._mask;
  };
  G.isLand = (lon, lat) => {
    const m = G._mask || G.landMask();
    let c = Math.floor(((lon + 180) / 360 - Math.floor((lon + 180) / 360)) * m.w);
    let r = Math.floor((90 - lat) / 180 * m.h);
    if (r < 0) r = 0; else if (r >= m.h) r = m.h - 1;
    return m.data[r * m.w + c] === 1;
  };

  // ---- ray casting: first hit of the ray p + s·d with the sphere |x| = R -----
  // d must be a unit vector. Returns s, or -1 when the ray misses the Earth.
  G.hitSphere = (p, d, R = G.R) => {
    const b = G.dot(p, d), c = G.dot(p, p) - R * R, disc = b * b - c;
    if (disc < 0) return -1;
    const s = -b - Math.sqrt(disc);
    return s > 0 ? s : -1;
  };
})();
