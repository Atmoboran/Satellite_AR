// Texts of chapter 1 (bahnen.html): LEO and GEO. Shared texts: content/texts.de.js.
// LOCAL: the place marked on the globe is Offenbach (SCAPE°); change name and
// coordinates in `place` for another location.
TEXTS.pageTitle = 'Zwei Perspektiven – LEO und GEO';
TEXTS.description = 'Tief und schnell oder weit weg und scheinbar still: die zwei Umlaufbahnen der Wettersatelliten im Vergleich.';

TEXTS.bahnen = {
  poster: {
    kicker: 'Kapitel 2',
    headline: 'Zwei Perspek–<br>tiven',
    lead: 'Manche Wettersatelliten flitzen tief über die Erde, andere stehen scheinbar still über einem Ort. Schalte zwischen LEO und GEO um und vergleiche, was sie sehen.'
  },

  place: { name: 'Offenbach', lon: 8.77, lat: 50.10 },   // LOCAL

  stageAria: 'Die Erde mit der Bahn eines Wettersatelliten. Lila: der Bereich, den der Satellit gerade sieht.',
  badge: 'Zieh zum Drehen · zwei Finger zum Zoomen',
  insetLabel: 'Blick des Satelliten',
  insetClose: 'Blick des Satelliten schließen',
  insetOpen: 'Blick des Satelliten',
  modeAria: 'Umlaufbahn wählen',

  modes: {
    leo: {
      chip: 'LEO',
      label: 'LEO · 817 km',
      title: 'LEO',
      sub: 'Low Earth Orbit – niedrige Umlaufbahn',
      bullets: [
        'Wettersatelliten auf solchen Bahnen fliegen meist etwa <b>500 bis 1000 km</b> hoch.',
        'Eine Runde um die Erde dauert nur rund <b>100 Minuten</b>.',
        'Unter ihnen dreht sich die Erde weiter: Jede Runde führt über einen anderen Streifen.',
        'Weil sie nah sind, liefern sie <b>detaillierte</b> Messungen und Bilder.',
        'Einen bestimmten Ort sehen sie aber nur bei einem <b>Überflug</b>.'
      ],
      facts: [
        { label: 'Höhe', value: '817 km' },
        { label: 'Eine Runde', value: '101 min' },
        { label: 'Runden pro Tag', value: 'gut 14' },
        { label: 'Beispiel', value: 'Metop (EUMETSAT)' }
      ]
    },
    geo: {
      chip: 'GEO',
      label: 'GEO · 35.786 km',
      title: 'GEO',
      sub: 'Geostationary Orbit – geostationäre Umlaufbahn',
      bullets: [
        'Der Satellit fliegt <b>35.786 km</b> über dem Äquator.',
        'Für eine Runde braucht er genau so lange, wie sich die Erde einmal dreht: <b>23 Stunden 56 Minuten</b>.',
        'Darum steht er von der Erde aus gesehen <b>scheinbar still</b> über demselben Punkt.',
        'Er sieht ständig dieselbe Erdhälfte und kann eine große Region <b>ohne Pause</b> beobachten.',
        'Ideal, um zu verfolgen, wie Wolken und Stürme entstehen und wandern.'
      ],
      facts: [
        { label: 'Höhe', value: '35.786 km' },
        { label: 'Eine Runde', value: '23 h 56 min' },
        { label: 'Runden pro Tag', value: '1 – wie die Erde' },
        { label: 'Beispiel', value: 'Meteosat-12 (MTG-I1)' }
      ]
    }
  },

  readout: {
    time: 'Uhrzeit (UTC)',
    day: d => 'Tag ' + d,
    below: 'Unter dem Satelliten',
    place: 'Offenbach gesehen',      // LOCAL
    now: 'jetzt',
    never: 'noch nicht',
    ago: (h, m) => 'vor ' + (h ? h + ' h ' : '') + m + ' min'
  },

  key: {
    now: 'sieht der Satellit gerade',
    earlier: 'in den letzten 5 Runden gesehen',
    night: 'Nacht',
    place: 'Offenbach'                // LOCAL
  },

  controls: {
    playAria: 'Abspielen',
    pauseAria: 'Anhalten',
    resetAria: 'Von vorn',
    zoomInAria: 'Hineinzoomen',
    zoomOutAria: 'Herauszoomen',
    followAria: 'Kamera dreht sich mit der Erde',
    speed: 'Tempo',
    speeds: ['1 s = 5 min', '1 s = 30 min', '1 s = 1 h'],
    infoAria: 'Bedienung erklären',
    note: '<p><span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4l14 8-14 8V4z" fill="currentColor"/></svg></span> lässt die Zeit laufen oder hält sie an. <b>Tempo</b>: wie viel Zeit pro Sekunde vergeht.</p><p><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/></svg></span> startet wieder um 8:30 Uhr und löscht die Streifen.</p><p><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 7v10"/><path d="M4.5 9.5A8 8 0 0 1 18 6.3"/><path d="M18 2.5v4h-4"/><path d="M19.5 14.5A8 8 0 0 1 6 17.7"/><path d="M6 21.5v-4h4"/></svg></span> <b>Mitdrehen</b>: Die Kamera dreht sich mit der Erde. Dann sieht man besonders gut, dass der GEO-Satellit stillsteht.</p><p><b>Ziehen</b> am Bild dreht die Ansicht. <b>Zoomen</b>: zwei Finger auseinander, Strg + Mausrad oder die Knöpfe <b>+</b> und <b>−</b> im Bild. Die Größen und Abstände sind maßstabsgetreu – nur die Satelliten sind viel größer gezeichnet.</p><p>Bei <b>GEO</b> dreht sich die Kamera automatisch mit der Erde, damit der Satellit im Bild bleibt. Schalte „Mitdrehen“ aus, um zu sehen, wie Erde und Satellit sich gemeinsam drehen.</p>'
  },

  tasks: {
    geo: 'Schalte auf GEO und lass ein paar Stunden vergehen. Bleibt der Satellit über demselben Ort?',
    doneGeo: 'Genau: Unter ihm bleibt immer 0°N 0°O. Er kreist so schnell, wie sich die Erde dreht.',
    pass: 'Schalte auf LEO und warte, bis der Satellit Offenbach sieht.',
    donePass: 'Überflug! Ein paar Minuten lang ist Offenbach im Blick – dann ist der Satellit schon weiter.',
    day: 'Lass den LEO-Satelliten einen ganzen Tag lang fliegen. Wie viel von der Erde hat er gesehen?',
    doneDay: 'In 24 Stunden schafft er gut 14 Runden. Dabei sieht er fast die ganze Erde – aber jeden Ort nur zu bestimmten Zeiten: Offenbach zum Beispiel vormittags und abends. Die hellila Streifen zeigen nur seine letzten 5 Runden.'
  },

  merke: {
    title: 'Merke',
    text: 'LEO-Satelliten sind nah und sehen viele Einzelheiten, aber jeden Ort nur bei einem Überflug. GEO-Satelliten sind weit weg, schauen aber ohne Pause auf dieselbe Erdhälfte. Für die Wettervorhersage braucht man beide.'
  },

  topics: {
    why: {
      title: 'Warum braucht man beide?',
      body: '<p><b>GEO-Satelliten</b> liefern alle paar Minuten ein neues Bild derselben Erdhälfte. Damit sehen Wetterdienste, wie ein Gewitter wächst oder ein Sturm näher kommt – wie in einem Film.</p><p><b>LEO-Satelliten</b> sind 40-mal näher an der Erde. Sie messen genauer und mit mehr Einzelheiten, zum Beispiel wie warm und feucht die Luft in verschiedenen Höhen ist. Sie sehen auch die Polargebiete, die von GEO aus nur ganz schräg oder gar nicht zu sehen sind. Ihre Messungen sind besonders wichtig für die Computermodelle, die das Wetter vorhersagen.</p><p>Zusammen ergänzen sie sich: GEO für den ständigen Überblick, LEO für genaue Messungen rund um den ganzen Globus.</p>'
    },
    leo: {
      title: 'Mehr zur LEO-Bahn',
      body: '<p>Die Bahn im Modell entspricht den europäischen Wettersatelliten <b>Metop</b>: 817 km hoch, eine Runde in 101 Minuten. Sie führt fast über die Pole – darum heißen solche Satelliten auch <b>polarumlaufend</b>.</p><p>Die Bahn ist <b>sonnensynchron</b>: Der Satellit überquert den Äquator auf dem Weg nach Süden immer um etwa 9:30 Uhr Ortszeit. So sind die Lichtverhältnisse bei jedem Überflug ähnlich.</p><p>Der lila Streifen ist etwa 2900 km breit. So breit ist der Bereich, den das Bildinstrument (AVHRR) bei jedem Überflug abtastet. Andere Instrumente an Bord sehen schmalere Streifen.</p>'
    },
    geo: {
      title: 'Mehr zur GEO-Bahn',
      body: '<p>Nur über dem Äquator, in genau 35.786 km Höhe, dauert eine Umrundung so lange wie eine Erddrehung: 23 Stunden 56 Minuten. Deshalb steht ein geostationärer Satellit von der Erde aus gesehen still.</p><p><b>Meteosat-12</b> (MTG-I1) steht über 0° Länge und schaut auf Europa, Afrika und den Atlantik. Am Rand der Erdscheibe – auch in Nordeuropa – blickt er schon sehr schräg; die Polargebiete sieht er praktisch nicht.</p><p>Wetterdienste mehrerer Länder betreiben geostationäre Satelliten an verschiedenen Stellen über dem Äquator, zum Beispiel GOES (USA) und Himawari (Japan). Zusammen überblicken sie fast die ganze Erde außer den Polen.</p>'
    },
    simple: {
      title: 'Was ist im Modell vereinfacht?',
      body: '<p>Größen und Abstände von Erde und Bahnen sind maßstabsgetreu. Die Satelliten selbst sind viel zu groß gezeichnet – in echt wären sie winzige Punkte.</p><p>Die Sonne steht im Modell still über dem Äquator, wie zur Tag-und-Nacht-Gleiche im Frühling und Herbst. Dass die Erde im Laufe des Jahres um die Sonne wandert, ist weggelassen; ein Tag dauert im Modell 24 Stunden.</p><p>Lila heißt „im Blick des Bildinstruments“ – bei Tag und bei Nacht. Infrarot-Messungen funktionieren auch nachts (mehr dazu in Kapitel 3). Hellila sind die Streifen der letzten 5 Runden (gut 8 Stunden); ältere verschwinden, damit man den neuesten Streifen immer erkennt.</p>'
    },
    sources: {
      title: 'Quellen',
      body: '<ul class="sources-list"><li>ESA: Types of orbits – esa.int</li><li>NASA Earth Observatory: Catalog of Earth Satellite Orbits – earthobservatory.nasa.gov</li><li>EUMETSAT: Metop (Bahn, Instrumente) und Meteosat Third Generation – eumetsat.int</li><li>Küstenlinien: Natural Earth (gemeinfrei)</li></ul>'
    }
  }
};
