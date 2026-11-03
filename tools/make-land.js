// Converts Natural Earth 110m land (world-atlas, public domain) into a
// compact JS file of rings [lon,lat,...] rounded to 0.1 degrees.
const path = require('path');
const dl = process.argv[2], out = process.argv[3];
const topo = require(path.join(dl, 'topojson-client-3.1.0/package/dist/topojson-client.js'));
const t = require(path.join(dl, 'world-atlas-2.0.2/package/land-110m.json'));
const geo = topo.feature(t, t.objects.land);
const rings = [];
let maxJump = 0, n = 0;
for (const f of geo.features) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const p of polys) for (const r of p) {
    const flat = [];
    let prev = null;
    for (const [lo, la] of r) {
      const a = Math.round(lo * 10), b = Math.round(la * 10);
      if (prev && prev[0] === a && prev[1] === b) continue;
      if (prev) maxJump = Math.max(maxJump, Math.abs(a - prev[0]));
      flat.push(a, b); prev = [a, b]; n++;
    }
    if (flat.length >= 6) rings.push(flat);
  }
}
const minLat = Math.min(...rings.flatMap(r => r.filter((_, i) => i % 2)));
console.error('rings', rings.length, 'points', n, 'max lon jump (0.1deg)', maxJump, 'min lat', minLat);
const body = '// Land outlines: Natural Earth 1:110m (public domain), via world-atlas 2.0.2.\n' +
  '// Each ring is a flat list lon,lat,lon,lat… in tenths of a degree.\n' +
  '// Generated – do not edit by hand.\nwindow.LAND = ' + JSON.stringify(rings) + ';\n';
require('fs').writeFileSync(out, body);
console.error('bytes', body.length);
