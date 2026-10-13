// Every visible text of the app. Edit or translate this file to adapt the
// exhibit; index.html only holds data-t="path.to.key" placeholders that
// js/texts.js fills from here. Entries written as functions build a sentence
// around runtime values. This app has no location-specific lines (other
// apps mark them with a LOCAL comment).
//
// The app has two pages built from one template (build.py): the free view
// (index.html) and the true-scale view (mtg-satellite-ar2/index.html). Texts
// that differ between them sit in `variants`; the page picks its set through
// <html data-variant="…"> and finds it under `page`.
window.TEXTS = {
  lang: 'de',

  kit: {
    viewToDesktop: 'Desktop-Ansicht',
    viewToMobile: 'Handy-Ansicht',
    viewToDesktopAria: 'Zur Desktop-Ansicht wechseln',
    viewToMobileAria: 'Zur Handy-Ansicht wechseln',
    fullscreenEnter: 'Vollbild',
    fullscreenExit: 'Vollbild beenden',
    infoAria: 'Erklärung anzeigen',
    merke: 'Merke',
    tasks: 'Aufgaben',
    merkeLocked: 'Löse die Aufgaben – dann erscheint hier, was du herausgefunden hast.',
    devLink: '(dev)'
  },

  variants: {
    // index.html – free view: turns by itself, zoom allowed, AR size adjustable.
    standard: {
      pageTitle: 'MTG-I1 – Wettersatellit in AR',
      description: 'Der Wettersatellit Meteosat-12 (MTG-I1) in Augmented Reality – zum Drehen, Umrunden und Erkunden.',
      poster: {
        headline: 'Wetter–<br>satellit MTG-I1',
        lead: 'Dieser Satellit schaut aus 36.000 km Höhe auf Europa und Afrika. Dreh ihn, geh um ihn herum und schau dir alles aus der Nähe an.'
      },
      alt: '3D-Modell des Wettersatelliten MTG-I1',
      hint: 'Zieh mit dem Finger oder der Maus, um ihn zu drehen. Zoomen: zwei Finger oder Strg + Mausrad.',
      controlsNote: '<p><b>Ziehen</b> dreht den Satelliten. <b>Zwei Finger</b> auseinander oder <b>Strg + Mausrad</b> zoomen. Mit zwei Fingern schieben oder mit der rechten Maustaste ziehen verschiebt das Bild.</p><p><b>Drehen</b> schaltet das langsame Kreisen an oder aus.</p>',
      facts: [
        { label: 'Höhe', value: '36.000 km' },
        { label: 'Neues Bild', value: 'alle 10 min' },
        { label: 'Kanäle', value: '16' },
        { label: 'Status', value: 'in Betrieb' }
      ]
    },
    // mtg-satellite-ar2/index.html – true scale: size locked, no zoom.
    truescale: {
      pageTitle: 'MTG-I1 in Originalgröße – Wettersatellit in AR',
      description: 'Der Wettersatellit Meteosat-12 (MTG-I1) in Augmented Reality, fest in Originalgröße.',
      poster: {
        headline: 'MTG-I1 in Original–<br>größe',
        lead: 'Dieser Wettersatellit ist fast 12 m breit. Stell ihn mit AR in echter Größe in den Raum und geh um ihn herum.'
      },
      alt: '3D-Modell des Wettersatelliten MTG-I1 in echter Größe',
      hint: 'Zieh, um ihn zu drehen. Die Größe ist fest, zoomen geht nicht. Geh im AR-Modus näher heran, um Details zu sehen.',
      controlsNote: '<p><b>Ziehen</b> dreht den Satelliten. Zoomen ist absichtlich aus: So bleibt er in AR genau so groß wie in echt.</p><p><b>Drehen</b> schaltet das langsame Kreisen an oder aus.</p>',
      facts: [
        { label: 'Startmasse', value: '3760 kg' },
        { label: 'Körper (verstaut)', value: '2,3 × 2,8 × 5,2 m' },
        { label: 'Höhe', value: '36.000 km' },
        { label: 'Status', value: 'in Betrieb' }
      ]
    }
  },

  badge: 'Zieh am Satelliten, um ihn zu drehen',

  ar: {
    label: 'In deinem Raum ansehen',
    sub: 'Öffnet deine Kamera',
    deskNote: 'Augmented Reality (AR) gibt es nur auf dem Handy oder Tablet: Öffne diese Seite dort und tippe auf „In deinem Raum ansehen“.',
    failed: 'AR konnte nicht starten. Das 3D-Modell bleibt hier zum Drehen.',
    loadError: 'Das 3D-Modell konnte nicht geladen werden. Öffne die Seite über einen Webserver (nicht als Datei).'
  },

  controls: {
    rotate: 'Drehen',
    infoAria: 'Bedienung erklären'
  },

  part: {
    idle: 'Tippe auf ein Teil des Satelliten',
    wing: 'Solarflügel – macht aus Sonnenlicht Strom',
    body: 'Satellitenkörper – darin stecken die Kameras'
  },

  tasks: {
    title: 'Aufgaben',
    turn: 'Dreh den Satelliten einmal ganz herum.',
    wing: 'Tippe auf einen Solarflügel.'
  },

  merke: {
    title: 'Merke',
    text: 'MTG-I1 kreist so schnell um die Erde, wie sie sich dreht. Darum bleibt er immer über derselben Stelle. Von dort macht er alle 10 Minuten ein neues Bild von Europa und Afrika.'
  },

  facts: { aria: 'Steckbrief des Satelliten' },

  topics: {
    orbit: {
      title: 'Warum steht der Satellit scheinbar still?',
      body: '<p>MTG-I1 fliegt rund 35.800 km über dem Äquator, genau über 0° Länge – südlich von Europa, vor der Küste Afrikas. Für eine Runde um die Erde braucht er dort fast genau einen Tag. Die Erde dreht sich in derselben Zeit einmal um sich selbst.</p><p>Von der Erde aus gesehen steht er deshalb still am Himmel. Fachleute nennen das eine <b>geostationäre Umlaufbahn</b>. Der Vorteil: Der Satellit sieht immer dieselbe Hälfte der Erde und kann Wolken und Gewitter ohne Pause verfolgen.</p><p>Der Nachteil: Er ist sehr weit weg. Satelliten auf niedrigen Bahnen (etwa 800 km) sehen mehr Einzelheiten, kommen aber nur zweimal am Tag vorbei.</p>'
    },
    job: {
      title: 'Was macht MTG-I1?',
      body: '<p>MTG steht für <b>Meteosat Third Generation</b>, die dritte Generation der europäischen Wettersatelliten. ESA und EUMETSAT haben sie gemeinsam gebaut. MTG-I1 startete im Dezember 2022 mit einer Ariane-5-Rakete; im Dienst heißt er <b>Meteosat-12</b>.</p><p>Seine Hauptkamera (Flexible Combined Imager) fotografiert alle 10 Minuten die ganze sichtbare Erdhälfte, in 16 Kanälen: sichtbares Licht, Infrarot und Wasserdampf. Daraus lesen Wetterdienste ab, wo Wolken entstehen, wie warm sie oben sind und wie viel Feuchte in der Luft ist.</p><p>Neu ist ein <b>Blitz-Sensor</b> (Lightning Imager). Er zählt Blitze über Europa und Afrika, bei Tag und bei Nacht. So lassen sich Gewitter früher erkennen und Warnungen schneller herausgeben.</p>'
    },
    size: {
      title: 'Wie groß ist er wirklich?',
      body: '<p>Zum Start ist der Satellit zusammengefaltet: etwa 2,3 × 2,8 × 5,2 m groß und 3760 kg schwer. Im All klappt er seine Solarflügel aus.</p><p>In der Ansicht in Originalgröße ist das Modell fest auf echte Größe eingestellt: Der Satellitenkörper misst etwa 6,8 × 5,6 m, über beide ausgeklappte Solarflügel sind es rund 11,8 m. Zoomen ist dort absichtlich aus.</p><p><b>Was am Modell vereinfacht ist:</b> Es zeigt die Form, aber nicht alle Einzelheiten und Farben. Die Spannweite von 11,8 m ist aus der bekannten Länge des Körpers hochgerechnet – eine offizielle Angabe dazu gibt es nicht.</p>'
    },
    ar: {
      title: 'Wie funktioniert AR?',
      body: '<p>AR heißt <b>Augmented Reality</b>, erweiterte Wirklichkeit: Das Handy zeigt das Kamerabild und setzt den Satelliten hinein, als stünde er wirklich im Raum.</p><ol><li>Tippe auf „In deinem Raum ansehen“.</li><li>Richte die Kamera auf den Boden und bewege das Handy langsam hin und her, bis es den Boden erkennt.</li><li>Tippe, um den Satelliten abzusetzen. Dann geh um ihn herum.</li></ol><p>Auf Android-Handys öffnet sich dafür Googles Scene Viewer, auf dem iPhone AR Quick Look. Am Computer gibt es kein AR – dort kannst du das Modell auf der Seite drehen.</p>'
    }
  },

  sources: 'Fakten: ESA und EUMETSAT. Spannweite in der Originalgröße aus ESA-Angaben hochgerechnet.',

  // Screen-reader texts of <model-viewer> (it announces the viewing angle).
  viewer: {
    a11y: {
      'interaction-prompt': 'Zum Drehen ziehen oder die Pfeiltasten benutzen.',
      front: 'Ansicht von vorne', right: 'Ansicht von rechts', back: 'Ansicht von hinten', left: 'Ansicht von links',
      'upper-front': 'Ansicht von oben vorne', 'upper-right': 'Ansicht von oben rechts', 'upper-back': 'Ansicht von oben hinten', 'upper-left': 'Ansicht von oben links',
      'lower-front': 'Ansicht von unten vorne', 'lower-right': 'Ansicht von unten rechts', 'lower-back': 'Ansicht von unten hinten', 'lower-left': 'Ansicht von unten links'
    }
  }
};

// Pick the texts of this page's variant.
TEXTS.page = TEXTS.variants[document.documentElement.dataset.variant] || TEXTS.variants.standard;
TEXTS.pageTitle = TEXTS.page.pageTitle;
TEXTS.description = TEXTS.page.description;
