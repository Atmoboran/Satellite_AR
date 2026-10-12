# Erzeugt index.html (Standard) und mtg-satellite-ar2/index.html (Originalgröße)
# aus einer gemeinsamen Vorlage, damit beide Varianten gleich aussehen.
# Aufruf: python3 build.py
import shutil, os

PAGE = '''<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>{title}</title>
<meta name="description" content="{desc}" />
<script type="module" src="https://unpkg.com/@google/model-viewer@4.3.1/dist/model-viewer.min.js"></script>
<!-- Gestaltung (Schrift, Farben, Logo) kommt aus theme/ – siehe theme/README.md.
     Dieses CSS ist nur Layout und nutzt ausschließlich Variablen aus theme/theme.css.
     Diese Datei wird von build.py erzeugt – Änderungen dort vornehmen. -->
<link rel="stylesheet" href="theme/theme.css">
<style>
  *{{box-sizing:border-box;}}
  html,body{{margin:0; padding:0; height:100%; background:var(--paper); color:var(--ink);
    font-family:var(--font); font-weight:var(--fw-regular); overflow:hidden;}}
  b,strong{{font-weight:var(--fw-medium);}}
  :focus-visible{{outline:3px solid var(--focus); outline-offset:2px;}}

  /* Handy: das Modell füllt den Bildschirm, Kopf oben, Infofeld unten. */
  .app{{display:grid; height:100%; grid-template-rows:auto minmax(0,1fr) auto; grid-template-areas:"head" "stage" "info";}}
  header{{grid-area:head; display:flex; align-items:flex-end; justify-content:space-between; gap:12px;
    padding:14px 16px 10px; border-bottom:var(--line-width) solid var(--line); --logo-size:28px;}}
  .tag{{font-size:11px; font-weight:var(--fw-medium); letter-spacing:.08em; text-transform:var(--caps); text-align:right; line-height:1.4;}}
  .stage{{grid-area:stage; position:relative; background:var(--stage-bg); min-height:0;}}
  model-viewer{{width:100%; height:100%; --poster-color:transparent; --progress-bar-color:var(--progress);}}
  .info{{grid-area:info; padding:14px 16px 18px; border-top:var(--line-width) solid var(--line); background:var(--paper);}}
  h1{{margin:0 0 6px; font-weight:var(--fw-light); text-transform:var(--caps); font-size:30px; line-height:.95;}}
  p.blurb{{margin:0 0 12px; font-size:14px; line-height:1.45; max-width:40em;}}
  .facts{{display:flex; flex-wrap:wrap; gap:8px 20px; margin:0 0 12px; padding:10px 0; border-top:var(--line-width) solid var(--line); border-bottom:var(--line-width) solid var(--line);}}
  .facts div{{font-size:11px; font-weight:var(--fw-medium); letter-spacing:.08em; text-transform:var(--caps);}}
  .facts b{{display:block; font-size:16px; font-weight:var(--fw-light); letter-spacing:0; text-transform:none; margin-top:2px;}}
  .hint{{margin:0; font-size:12px; line-height:1.4;}}

  #ar-button{{position:absolute; left:50%; bottom:16px; transform:translateX(-50%);
    display:flex; align-items:center; gap:10px; white-space:nowrap;
    background:var(--c-yellow-bright); color:var(--ink); border:var(--line-width) solid var(--line); border-radius:var(--radius);
    font-family:inherit; font-weight:var(--fw-medium); font-size:15px; letter-spacing:.04em; text-transform:var(--caps);
    padding:13px 18px; cursor:pointer;}}
  #ar-button svg{{width:18px; height:18px; flex:none;}}
  #ar-button .sub{{display:block; font-size:11px; font-weight:var(--fw-regular); text-transform:none; letter-spacing:0;}}
  .desk-note{{display:none;}}

  /* Während AR läuft, nur das Modell zeigen */
  .app:has(model-viewer[ar-status="session-started"]) header,
  .app:has(model-viewer[ar-status="session-started"]) .info{{display:none;}}

  /* Desktop: Modell links groß, Erklärung rechts daneben. AR gibt es hier nicht. */
  @media (min-width:1000px){{
    .app{{grid-template-columns:minmax(0,1fr) minmax(340px,420px); grid-template-rows:auto minmax(0,1fr);
      grid-template-areas:"head head" "stage info";}}
    header{{padding:22px 32px 14px; --logo-size:36px;}}
    .stage{{border-right:var(--line-width) solid var(--line);}}
    .info{{border-top:0; padding:28px 32px; overflow:auto;}}
    h1{{font-size:52px; margin-bottom:14px;}}
    p.blurb{{font-size:16px; margin-bottom:18px;}}
    .facts{{display:grid; grid-template-columns:1fr 1fr; gap:14px 20px; padding:16px 0; margin-bottom:18px;}}
    .facts b{{font-size:22px;}}
    .hint{{font-size:14px;}}
    .desk-note{{display:block; margin:14px 0 0; font-size:14px; line-height:1.45; padding:12px 14px; background:var(--accent-pale);}}
  }}
</style>
</head>
<body>
<div class="app">
  <header>
    <span class="logo" data-brand="logo"></span>
    <span class="tag">{tag}</span>
  </header>

  <div class="stage">
    <model-viewer
      id="viewer"
      src="MTGI.glb"{ios}
      alt="{alt}"
      ar
      ar-modes="webxr scene-viewer quick-look"
      ar-scale="{arscale}"
      ar-placement="floor"
      camera-controls{extra}
      touch-action="pan-y"
      shadow-intensity="1"
      shadow-softness="0.9"
      exposure="1.05"
      environment-image="neutral"
      camera-orbit="{orbit}"
      min-camera-orbit="{minorbit}"
      max-camera-orbit="{maxorbit}"
    >
      <button slot="ar-button" id="ar-button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2v6m0 8v6M4.9 4.9l4.2 4.2m5.8 5.8l4.2 4.2M2 12h6m8 0h6M4.9 19.1l4.2-4.2m5.8-5.8l4.2-4.2"/></svg>
        <span>In deinem Raum ansehen<span class="sub">Öffnet deine Kamera</span></span>
      </button>
    </model-viewer>
  </div>

  <section class="info">
    <h1>{h1}</h1>
    <p class="blurb">{blurb}</p>
    <div class="facts">
{facts}
    </div>
    <p class="hint">{hint}</p>
    <p class="desk-note">Augmented Reality gibt es nur auf dem Handy oder Tablet: Öffne diese Seite dort und tippe auf „In deinem Raum ansehen“.</p>
  </section>
</div>
<script src="theme/theme.js"></script>
<script src="js/brand.js"></script>
</body>
</html>
'''

def facts(items):
    return '\n'.join(f'      <div>{k}<b>{v}</b></div>' for k, v in items)

VARIANTS = {
    '.': dict(
        title='MTG-I1 – Wettersatellit in AR',
        desc='Der Wettersatellit Meteosat-12 (MTG-I1) in Augmented Reality – zum Drehen, Umrunden und Erkunden.',
        tag='MTG-I1 · Meteosat-12<br>0° Länge · geostationär',
        ios='', alt='3D-Modell des Wettersatelliten MTG-I1', arscale='auto',
        extra='\n      auto-rotate\n      rotation-per-second="8deg"',
        orbit='35deg 75deg auto', minorbit='auto auto auto', maxorbit='auto auto auto',
        h1='Wetter–<br>satellit MTG-I1',
        blurb='Meteosat der dritten Generation: der Wettersatellit von ESA und EUMETSAT, der Europa seit Dezember 2022 aus 36.000 km Höhe beobachtet. Dreh ihn, geh um ihn herum und schau dir die Instrumente aus der Nähe an.',
        facts=facts([('Umlaufbahn', '36.000 km'), ('Bild der Erde', 'alle 10 min'), ('Kanäle', '16'), ('Status', 'in Betrieb')]),
        hint='Ohne AR: ziehen zum Drehen, mit zwei Fingern oder dem Mausrad zoomen.'),
    'mtg-satellite-ar2': dict(
        title='MTG-I1 in Originalgröße – Wettersatellit in AR',
        desc='Der Wettersatellit Meteosat-12 (MTG-I1) in Augmented Reality, fest in Originalgröße.',
        tag='MTG-I1 · Meteosat-12<br>Originalgröße',
        ios='\n      ios-src="MTGI.usdz"', alt='3D-Modell des Wettersatelliten MTG-I1 in echter Größe', arscale='fixed',
        extra='\n      disable-zoom',
        orbit='35deg 75deg 15m', minorbit='auto auto 15m', maxorbit='auto auto 15m',
        h1='MTG-I1 in Original–<br>größe',
        blurb='Meteosat-12 (MTG-I1), der Wettersatellit von ESA und EUMETSAT, beobachtet Europa und Afrika seit Dezember 2022 aus der geostationären Umlaufbahn. Das Modell ist auf seine echte Größe festgelegt: etwa 6,8 × 5,6 m der Satellitenkörper, rund 11,8 m über die ausgeklappten Solarflügel. Zoomen ist absichtlich aus – geh um ihn herum, um ihn von einer anderen Seite zu sehen.',
        facts=facts([('Startmasse', '3.760 kg'), ('Körper (verstaut)', '2,3 × 2,8 × 5,2 m'), ('Umlaufbahn', '36.000 km'), ('Status', 'in Betrieb')]),
        hint='Die Größe ist fest – kein Zoomen. Geh mit dem Handy näher heran, um Details zu sehen.'),
}

here = os.path.dirname(os.path.abspath(__file__))
for folder, v in VARIANTS.items():
    out = os.path.join(here, folder)
    with open(os.path.join(out, 'index.html'), 'w') as f:
        f.write(PAGE.format(**v))
    if folder != '.':
        # jede Variante bleibt ein eigenständiger Ordner (z. B. für Netlify Drop)
        for d in ('theme', 'js'):
            shutil.rmtree(os.path.join(out, d), ignore_errors=True)
            shutil.copytree(os.path.join(here, d), os.path.join(out, d))
print('ok')
