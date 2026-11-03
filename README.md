# SCAPE° — Wie messen Satelliten das Wetter?

An interactive, mobile-friendly browser exhibit (German, SCAPE° corporate
design) about how weather satellites observe the Earth. No prior knowledge
needed; visitors find things out by playing. Start page plus four chapters:

| Page | What it does |
|---|---|
| `index.html` | **Start.** Short introduction, the EUMETSAT YouTube video (16:9, loads only after a tap, falls back to a link), chapter cards. |
| `bahnen.html` | **1 · Zwei Perspektiven (LEO / GEO).** A globe, drawn to scale, with a Metop-like LEO orbit (817 km, 101 min, sun-synchronous) and a Meteosat-like GEO orbit (35 786 km, over 0°). Switch LEO/GEO, run time at three speeds, drag to turn, "Mitdrehen" (camera turns with the Earth). Yellow = what the imager sees now (2900 km swath / Earth disc); pale yellow = seen during the last 5 orbits (older stripes fade, so the newest always shows); zoom by pinch, Ctrl + wheel or +/−; day/night; Offenbach marked. Small view "Blick des Satelliten". Readouts: time, point below the satellite, when Offenbach was last seen. 3 tasks + Merke. |
| `kanaele.html` | **2 · Mit welchen Augen? (VIS / IR / WV).** One weather situation over Europe, North Africa and the Atlantic as Meteosat sees it, in three channels (0.6, 10.5, 6.3 µm). Tap for the values of all three channels at that point plus what is there; time-of-day slider (VIS goes dark at night); explained colour scales; spectrum with the channel positions. 3 tasks + Merke. |
| `messen.html` | **3 · Wie misst ein Satellit? (passiv / aktiv).** Schematic animation. Passive: VIS (sunlight reflected), IR (heat from ground and cloud tops), WV (emission of the vapour layer, heat from below swallowed); day/night. Active: radar and lidar pulses with an echo-height profile (time of flight), scatterometer with a wind slider. 4 tasks + Merke. |
| `satellit.html` | **4 · Der Satellit in AR.** MTG-I1 (Meteosat-12) as a 3D model and in AR (free view). |
| `mtg-satellite-ar2/` | The AR page in true scale, self-contained, without chapter navigation (exhibit version for the QR code, see below). |

### About the pictures in chapter 2

The weather in chapter 2 is a **computed example, not a real image** – the
page says so under the picture and in a topic. For every pixel the code sets
a physical state (surface type and temperature, cloud layers with optical
thickness and top temperature, upper-tropospheric humidity; an October day)
and computes each channel from it with its own physics: two-stream
reflectance × cos(solar zenith) for VIS, Planck emission passed up through
the cloud layers for IR, emission of the upper-tropospheric water vapour for
WV. So the pictures differ for the right reasons (fog bright in VIS, hardly
visible in IR, invisible in WV; VIS dark at night; snow bright but not cold;
thunderstorm tops below −55 °C). Real EUMETSAT or NASA images could not be
fetched while building and their licences would need checking; the topic
"Wie viele Kanäle…" points visitors to view.eumetsat.int and NASA Worldview.

### The video

The start page embeds `https://www.youtube.com/live/KkLs5xkL_6Y` through the
YouTube IFrame API (privacy-enhanced domain youtube-nocookie.com). Nothing is
loaded from YouTube until a visitor taps "Video abspielen" (privacy note
beside it). If the owner does not allow embedding (player error 101/150/153)
or YouTube cannot be reached within 12 s, the flat poster returns with the
message and a link to the video on YouTube. The page works without it.
Whether this stream may be embedded could not be checked while building
(YouTube was not reachable) – try it once on the real network. ID and URL are
in `content/start.de.js`.

## Two AR variants – which one is the exhibit version?

| Page | What it does |
|---|---|
| `satellit.html` | **Free view** (chapter 4). Turns slowly by itself, zoom allowed, AR size chosen by the phone (`ar-scale="auto"`, USDZ for iPhones generated on the fly). Good for visitors' own devices, the web and QR codes. |
| `mtg-satellite-ar2/index.html` | **True scale.** Size locked to the real satellite (≈ 11.8 m across the solar wings, `ar-scale="fixed"`), no zoom anywhere, a real `MTGI.usdz` so the lock also holds on iPhones. |

**Exhibit version: `mtg-satellite-ar2/` (true scale)** – its own notes say it
was built specifically for the museum floor (see
`mtg-satellite-ar2/README.md` for the size calibration and a test checklist).
*This is still to be confirmed by the exhibit team.* Before this extension the
free view was the root `index.html`; it is now `satellit.html`, and the root
URL shows the start page.

## Run

Serve the folder over HTTP – any static file server or GitHub Pages:

```
python3 -m http.server 8000      # then open http://localhost:8000/
```

* The page itself opens by double-click (`file://`), but browsers do not let
  a page read the 3D model from disk; the page then says so.
* **AR needs real HTTPS** from a real domain (GitHub Pages, Netlify, …), not
  a local file or an embedded preview. On Android, "In deinem Raum ansehen"
  opens Google Scene Viewer; on iPhone/iPad, AR Quick Look. On a computer
  there is no AR – the page shows a note and the model can be turned there.
* No requests to third parties, except the YouTube video after a tap:
  `<model-viewer>` 4.3.1 is self-hosted in `js/vendor/`, fonts are system
  fonts, coastlines are in `data/land.js`.

* The chapters 1–3 need no server and no network (opened from disk they work
  too); only the video and AR need the internet.

URL switches for staff: `?kiosk` (exhibit mode: back to the start of the
page after 3 minutes without touch). The app has no staff panel.

AR page controls: drag to turn; zoom with two fingers or Ctrl + mouse wheel
(the plain mouse wheel scrolls the page). "Drehen" switches the slow
automatic turn on and off. A tap on the model names the part.

## Files

```
index.html          start page (video, chapter cards)
bahnen.html         chapter 1: LEO / GEO
kanaele.html        chapter 2: VIS / IR / WV
messen.html         chapter 3: passive / active
satellit.html       chapter 4: the satellite in AR – generated by build.py
build.py            template for both AR pages; copies css/ js/ content/ theme/ into mtg-satellite-ar2/
MTGI.glb            3D model (free view)
css/kit.css         shared SCAPE° components (same in every app)
css/app.css         layout of this app (AR page, chapters, start page)
js/view.js          phone/desktop layout switch (loaded in <head>)
js/texts.js         fills the texts from content/
js/brand.js         fills logo and footer line from the theme
js/kit.js           fullscreen button, hint badge, info notes, tasks/Merke, kiosk mode
js/tasks-dialog.js  the tasks pop-up of chapters 1–3 (as in the other SCAPE° exhibits)
js/video.js         the YouTube video with its fallback (start page)
js/geo.js           globe geometry, land mask, ray casting (chapters 1 and 2)
js/bahnen.js        chapter 1: orbits, globe, swath memory, satellite view
js/kanaele.js       chapter 2: the model weather and the three channels
js/messen.js        chapter 3: the passive/active animation and the echo chart
js/app.js           AR page: viewer settings, "Drehen", tapping parts, tasks, AR status
js/vendor/          model-viewer-umd.min.js 4.3.1 (Google, Apache-2.0, see model-viewer.LICENSE)
data/land.js        coastlines, Natural Earth 1:110m (public domain) – generated by tools/make-land.js
content/texts.de.js texts every page shares, plus the AR page (variants for its two pages)
content/start.de.js, bahnen.de.js, kanaele.de.js, messen.de.js
                    every visible text of the start page and chapters 1–3 (edit or translate here)
theme/              the design: font, palette, logo, colours (see theme/README.md)
mtg-satellite-ar2/  the true-scale variant: own MTGI.glb + MTGI.usdz, generated
                    index.html and copies of css/ js/ content/ theme/
tools/make-land.js  rebuilds data/land.js from the npm packages world-atlas and topojson-client
```

**After changing anything in `css/`, `js/`, `content/`, `theme/` or the AR
page template, run `python3 build.py`** – it rewrites both AR pages and
refreshes the copies in `mtg-satellite-ar2/`, so that folder stays
self-contained (e.g. for Netlify Drop). Do not edit the copies or the
generated `satellit.html` / `mtg-satellite-ar2/index.html` by hand. The
start page and chapters 1–3 are plain HTML files.

`js/vendor/model-viewer-umd.min.js` is the classic-script (UMD) build of
`@google/model-viewer` 4.3.1; the plain `model-viewer.min.js` is an ES module
and would be blocked on `file://`.

## Layout

Every page: phone layout below 1000 px, desktop above (or via the
"Desktop-/Handy-Ansicht" toggle, remembered for the whole app). Chapters
1–3: on the desktop the picture fills the left column and the screen height,
readouts, controls, explanation and tasks sit on the right.

AR page – phone: poster header, the square 3D stage with the AR button (only where AR
is possible) and the fullscreen button, then the part readout, hint,
"Drehen", facts, tasks and Merke box. Desktop (automatic from 1000 px, or
via the "Desktop-/Handy-Ansicht" toggle, remembered for this app only): the
3D stage on the left, sized to the screen; everything else on the right.
While a WebXR AR session runs in the browser, the stage fills the whole
screen.

## Adapting

Chapters: colours of the globe, the channel colour scales and the schematic
are in `theme/theme.js` (`THEME.orbits`, `THEME.channels`, `THEME.measure`).
The place marked in chapter 1 (Offenbach) is `TEXTS.bahnen.place` in
`content/bahnen.de.js`.

AR page design: `theme/` only (signature colours lavender / navy / pale blue, yellow
shape, white outline; light and shadow of the 3D view in `THEME.satellit`).
Texts: `content/texts.de.js` only. Founders Grotesk is used when installed,
otherwise the system fallback.

Model settings (in `build.py`): `ar-scale` (`auto` or `fixed`),
`ar-placement` (`floor` or `wall`), camera orbit and zoom limits.
