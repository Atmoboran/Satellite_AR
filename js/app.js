// Satellit (MTG-I1): settings of the <model-viewer>, first-hint badge, the
// satellite picker (free view: MTG-I1, GOES-R, both), tapping parts of
// MTG-I1, tasks, AR status. The model always turns slowly by itself
// (auto-rotate); after a drag it pauses for a moment and goes on.
// <model-viewer> itself is self-hosted in js/vendor/ (loaded before this file).
(() => {
  'use strict';

  const viewer = document.getElementById('viewer');
  const frame = document.getElementById('stage-frame');
  const partReadout = document.getElementById('part-readout');
  const deskNote = document.getElementById('desk-note');
  const loadError = document.getElementById('load-error');
  const look = (window.THEME && THEME.satellit) || {};

  // ---- look and texts of the viewer ---------------------------------------
  viewer.alt = t('page.alt');
  viewer.a11y = t('viewer.a11y');
  if (look.exposure != null) viewer.exposure = look.exposure;
  if (look.shadowIntensity != null) viewer.shadowIntensity = look.shadowIntensity;
  if (look.shadowSoftness != null) viewer.shadowSoftness = look.shadowSoftness;
  if (look.environment) viewer.environmentImage = look.environment;

  // ---- first-hint badge: until the visitor turns the model ----------------
  const badge = SCAPE.badge(frame);
  badge.show(t('badge'));

  // ---- tasks ---------------------------------------------------------------
  const tasks = SCAPE.tasks(document.getElementById('sat-tasks'));

  // ---- satellite picker (free view only) ------------------------------------
  const picker = document.getElementById('sat-picker');
  const factCells = [...document.querySelectorAll('#facts > div')];
  let current = 'mtgi';
  const setSat = key => {
    const S = t('sats.' + key);
    current = key;
    picker.querySelectorAll('[data-sat]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sat === key)));
    if (S.iosSrc) viewer.setAttribute('ios-src', S.iosSrc); else viewer.removeAttribute('ios-src');
    viewer.src = S.src;
    viewer.alt = S.alt;
    partReadout.textContent = S.readout;
    S.facts.forEach((f, i) => {
      if (!factCells[i]) return;
      factCells[i].querySelector('span').textContent = f.label;
      factCells[i].querySelector('b').textContent = f.value;
    });
  };
  if (picker) {
    picker.addEventListener('click', e => {
      const b = e.target.closest('[data-sat]');
      if (b && b.dataset.sat !== current) setSat(b.dataset.sat);
    });
    setSat('mtgi');
  }

  // ---- turning by hand: sum up the azimuth the visitor turned --------------
  // Only turns made by the visitor count (not the slow automatic turn).
  const TAU = 2 * Math.PI;
  let lastTheta = null;
  let turned = 0;
  viewer.addEventListener('camera-change', e => {
    const theta = viewer.getCameraOrbit().theta;
    if (e.detail && e.detail.source === 'user-interaction') {
      badge.hide();
      if (lastTheta !== null) {
        const d = ((theta - lastTheta) % TAU + TAU * 1.5) % TAU - Math.PI;   // wrapped to −π…π
        turned += d;
        if (Math.abs(turned) >= TAU * 0.95) tasks.done('turn');
      }
    }
    lastTheta = theta;
  });

  // ---- tapping a part: solar wing or body ---------------------------------
  // The wings stick out far above and below the body (glTF y axis), so the
  // height of the hit point tells them apart.
  let down = null;
  viewer.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; badge.hide(); });
  viewer.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) { down = null; return; }
    down = null;
    if (current !== 'mtgi') return;      // the parts are known for MTG-I1 only
    const hit = viewer.positionAndNormalFromPoint(e.clientX, e.clientY);   // window coordinates
    if (!hit) return;
    const size = viewer.getDimensions();
    const center = viewer.getBoundingBoxCenter();
    const isWing = Math.abs(hit.position.y - center.y) > 0.15 * size.y;
    partReadout.textContent = t(isWing ? 'part.wing' : 'part.body');
    if (isWing) tasks.done('wing');
  });

  // ---- Ctrl + mouse wheel zooms; the plain wheel scrolls the page ----------
  frame.addEventListener('wheel', e => { if (!e.ctrlKey) e.stopPropagation(); }, { capture: true });

  // ---- AR availability and status ------------------------------------------
  viewer.addEventListener('load', () => {
    loadError.hidden = true;
    deskNote.hidden = !!viewer.canActivateAR;
    // on a phone without AR say why, instead of "open this on a phone"
    const ua = navigator.userAgent;
    const phone = /android|iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    if (!viewer.canActivateAR && phone) deskNote.textContent = t(/android/i.test(ua) && /firefox/i.test(ua) ? 'ar.firefoxNote' : 'ar.phoneNote');
  });
  viewer.addEventListener('error', () => { loadError.hidden = false; });
  viewer.addEventListener('ar-status', e => {
    if (e.detail.status === 'session-started') badge.hide();
    if (e.detail.status === 'failed') partReadout.textContent = t('ar.failed');
    window.dispatchEvent(new Event('resize'));
  });
})();
