// Every visible text of the app. Edit or translate this file to adapt the
// exhibit; index.html only holds data-t="path.to.key" placeholders that
// js/texts.js fills from here. Entries written as functions build a sentence
// around runtime values. This app has no location-specific lines (other
// apps mark them with a LOCAL comment).
//
// The texts of the start page and chapters 1–3 are in content/start.de.js,
// bahnen.de.js, kanaele.de.js and messen.de.js. This file holds what every
// page shares, plus chapter 4: the satellite in AR. That one has two pages
// built from one template (build.py): the free view (satellit.html) and the
// true-scale view (mtg-satellite-ar2/index.html). Texts
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

  // Header navigation and the prev/next buttons (every page).
  chapters: {
    aria: 'Kapitel',
    start: 'Start',
    one: 'Bahnen',
    two: 'Kanäle',
    three: 'Messen',
    four: 'AR',
    toStart: 'Zum Start',
    toOne: 'Kapitel 1: Zwei Perspektiven',
    toTwo: 'Kapitel 2: Mit welchen Augen?',
    toThree: 'Kapitel 3: Wie misst ein Satellit?',
    toFour: 'Kapitel 4: Der Satellit in AR'
  },

  // The tasks pop-up of chapters 1–3 (js/tasks-dialog.js).
  tasksDialog: {
    open: 'Aufgaben',
    title: 'Aufgaben',
    closeAria: 'Aufgaben schließen',
    intro: 'Sie haken sich von selbst ab, sobald du sie geschafft hast.'
  },

  variants: {
    // satellit.html – free view: turns by itself, zoom allowed, AR size adjustable.
    standard: {
      pageTitle: 'Wettersatelliten in AR',
      description: 'Die Wettersatelliten MTG-I1 (Europa) und GOES-R (USA) in Augmented Reality – zum Drehen, Umrunden und Erkunden.',
      poster: {
        headline: 'Wetter–<br>satelliten in AR',
        lead: 'Beide sind geostationäre Wettersatelliten: Sie stehen 36.000 km hoch über dem Äquator und schauen von dort immer auf dieselbe Erdhälfte – MTG-I1 auf Afrika und Europa, GOES-R auf Amerika. Wähle einen Satelliten, dreh ihn und geh um ihn herum.'
      },
      alt: '3D-Modell des Wettersatelliten MTG-I1',
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
      facts: [
        { label: 'Startmasse', value: '3760 kg' },
        { label: 'Körper (verstaut)', value: '2,3 × 2,8 × 5,2 m' },
        { label: 'Höhe', value: '36.000 km' },
        { label: 'Status', value: 'in Betrieb' }
      ]
    }
  },


  // The satellite picker of the free view (satellit.html). Models: MTGI.glb
  // (as before), GOES-R_1m.glb and constellation.glb with their USDZ files for
  // iPhones. GOES-R and "Beide" are not to scale – no size claims for them.
  sats: {
    aria: 'Satellit wählen',
    mtgi: {
      chip: 'MTG-I1',
      src: 'MTGI.glb', iosSrc: '',
      alt: '3D-Modell des europäischen Wettersatelliten MTG-I1',
      readout: 'Tippe auf ein Teil des Satelliten',
      facts: [
        { label: 'Betreiber', value: 'EUMETSAT / ESA' },
        { label: 'Steht über', value: '0° Länge' },
        { label: 'Blick auf', value: 'Afrika, Europa' },
        { label: 'Bildsensor', value: '16 Kanäle' }
      ]
    },
    goes: {
      chip: 'GOES-R',
      src: 'GOES-R_1m.glb', iosSrc: 'GOES-R_1m.usdz',
      alt: '3D-Modell des US-amerikanischen Wettersatelliten GOES-R',
      readout: 'GOES-R – die Wettersatelliten der USA',
      facts: [
        { label: 'Betreiber', value: 'NOAA / NASA' },
        { label: 'Stehen über', value: '75° W und 137° W' },
        { label: 'Blick auf', value: 'Amerika, Pazifik' },
        { label: 'Bildsensor', value: '16 Kanäle' }
      ]
    },
    both: {
      chip: 'Beide',
      src: 'constellation.glb', iosSrc: 'constellation.usdz',
      alt: '3D-Modell der Wettersatelliten MTG-I1 und GOES-R nebeneinander',
      readout: 'MTG-I1 und GOES-R nebeneinander',
      facts: [
        { label: 'Betreiber', value: 'EUMETSAT, NOAA' },
        { label: 'Stehen über', value: '0°, 75° W, 137° W' },
        { label: 'Blick auf', value: 'Europa bis Pazifik' },
        { label: 'Bildsensor', value: 'je 16 Kanäle' }
      ]
    }
  },

  ar: {
    label: 'In deinem Raum ansehen',
    sub: 'Öffnet deine Kamera',
    deskNote: 'Augmented Reality (AR) gibt es nur auf dem Handy oder Tablet: Öffne diese Seite dort und tippe auf „In deinem Raum ansehen“.',
    // phones where <model-viewer> offers no AR (it leaves out Firefox on Android on purpose)
    firefoxNote: 'In Firefox lässt sich AR leider nicht starten. Öffne diese Seite in Chrome (oder Samsung Internet), dann erscheint „In deinem Raum ansehen“.',
    phoneNote: 'Dieser Browser oder dieses Handy kann AR nicht starten. Probiere Chrome auf Android oder Safari auf dem iPhone. Auf Android braucht es außerdem „Google Play-Dienste für AR“.',
    failed: 'AR konnte nicht starten. Das 3D-Modell bleibt hier zum Drehen.',
    loadError: 'Das 3D-Modell konnte nicht geladen werden. Öffne die Seite über einen Webserver (nicht als Datei).'
  },

  part: {
    idle: 'Tippe auf ein Teil des Satelliten',
    wing: 'Solarflügel – macht aus Sonnenlicht Strom',
    body: 'Satellitenkörper – darin stecken die Kameras'
  },

  facts: { aria: 'Steckbrief des Satelliten' },

  topics: {
    goes: {
      title: 'Wer schaut auf die andere Seite der Erde?',
      body: '<p>Ein geostationärer Satellit sieht immer nur eine Hälfte der Erde. Darum stehen mehrere Wettersatelliten verschiedener Länder in einem Ring über dem Äquator, jeder für eine andere Region.</p><p><b>GOES-R</b> ist die Satelliten-Serie der USA, betrieben von NOAA und gebaut mit der NASA. Zwei davon sind im Dienst: GOES-East über 75° West blickt auf Nord- und Südamerika und den Atlantik, GOES-West über 137° West auf den Pazifik. Ihr Bildsensor ABI misst wie der von MTG-I1 in 16 Kanälen und liefert alle 10 Minuten ein Bild der ganzen Erdhälfte; dazu zählt ein Blitz-Sensor die Gewitterblitze.</p><p>Japan (Himawari), China, Indien, Südkorea und Russland betreiben weitere Satelliten im Ring. Die Wetterdienste teilen ihre Daten – so entsteht ein Bild vom Wetter der ganzen Erde.</p>'
    },
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

  sources: 'Fakten: ESA, EUMETSAT, NOAA und NASA. Spannweite in der Originalgröße aus ESA-Angaben hochgerechnet. Die Modelle von GOES-R und „Beide“ sind nicht maßstabsgetreu.',

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

// The AR pages (<html data-variant="…">) pick the texts of their variant.
// The chapter pages set pageTitle and description in their own content file.
if (document.documentElement.dataset.variant) {
  TEXTS.page = TEXTS.variants[document.documentElement.dataset.variant] || TEXTS.variants.standard;
  TEXTS.pageTitle = TEXTS.page.pageTitle;
  TEXTS.description = TEXTS.page.description;
}
