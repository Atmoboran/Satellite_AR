// Texts of chapter 3 (messen.html): passive and active remote sensing.
// Shared texts: content/texts.de.js.
TEXTS.pageTitle = 'Wie misst ein Satellit eigentlich?';
TEXTS.description = 'Passive und aktive Fernerkundung: Strahlung empfangen oder selbst ein Signal aussenden – Radiometer, Radar, Lidar und Scatterometer.';

TEXTS.messen = {
  poster: {
    kicker: 'Kapitel 4',
    headline: 'Wie misst ein Satel–<br>lit eigentlich?',
    lead: 'Ein Wettersatellit ist keine gewöhnliche Kamera. Er misst Strahlung – entweder die, die von der Erde kommt, oder ein Signal, das er selbst losschickt.'
  },

  stageAria: 'Schema: ein Satellit über Atmosphäre, Wolke, Regen, Land und Meer. Bewegte Wellenstücke zeigen, welche Strahlung wohin läuft.',
  modeAria: 'Messprinzip wählen',
  instAria: 'Kanal oder Instrument wählen',
  stageNote: 'Schema · nicht maßstäblich',
  badgePassive: 'Schau: Woher kommt die Strahlung?',
  badgeActive: 'Tippe auf „Impuls senden“',

  modes: { passive: 'Passiv', active: 'Aktiv' },

  inst: {
    vis: {
      chip: 'Sichtbar',
      title: 'Passiv: sichtbares Licht',
      sub: 'Radiometer · Kanal 0,6 <span class="nc">µm</span>',
      bullets: [
        'Die <b>Sonne</b> beleuchtet Wolken und Erdboden. Ein Teil des Lichts wird zurückgeworfen.',
        'Der Sensor empfängt dieses Licht und misst, <b>wie viel</b> ankommt. Dicke Wolken werfen viel zurück, das Meer wenig.',
        'Nachts fehlt das Sonnenlicht – dann kommt kaum etwas an.'
      ],
      source: 'Sonne (zurückgeworfen)', measures: 'Helligkeit', night: 'nein'
    },
    ir: {
      chip: 'Infrarot',
      title: 'Passiv: Infrarot',
      sub: 'Radiometer · Kanal 10,5 <span class="nc">µm</span>',
      bullets: [
        'Boden, Meer und Wolken senden selbst <b>Wärmestrahlung</b> aus – je wärmer, desto mehr.',
        'Der warme Boden strahlt stark, die kalte Oberkante einer hohen Wolke schwach.',
        'Aus der Stärke der Strahlung berechnet man eine Temperatur. Das geht <b>Tag und Nacht</b>.'
      ],
      source: 'Erde und Wolken selbst', measures: 'Wärme (Temperatur)', night: 'ja'
    },
    wv: {
      chip: 'Wasserdampf',
      title: 'Passiv: Wasserdampf',
      sub: 'Radiometer · Kanal 6,3 <span class="nc">µm</span>',
      bullets: [
        'Auf dieser Wellenlänge <b>verschluckt</b> der Wasserdampf die Wärmestrahlung, die von unten kommt.',
        'Er sendet aber selbst Strahlung aus. Beim Satelliten kommt vor allem die aus 5 bis 10 km Höhe an.',
        'So misst der Kanal, wie <b>feucht</b> die obere Luft ist – Tag und Nacht.'
      ],
      source: 'Wasserdampf in 5–10 km Höhe', measures: 'Feuchte oben', night: 'ja'
    },
    pulse: {
      title: 'Aktiv: selbst ein Signal senden',
      sub: 'z. B. Radar, Lidar oder Scatterometer',
      bullets: [
        'Das Instrument schickt einen kurzen <b>Impuls</b> nach unten – hier wie bei einem Radar Mikrowellen.',
        'Wolken, <b>Regentropfen</b> und der Boden werfen einen Teil davon zurück. Der Satellit fängt diese <b>Echos</b> auf.',
        'Aus der <b>Laufzeit</b> eines Echos ergibt sich, aus welcher Höhe es kommt; aus seiner <b>Stärke</b>, wie viel Wasser dort ist.',
        'Andere aktive Instrumente arbeiten genauso: Ein <b>Lidar</b> schickt Laserlicht und sieht dünne Wolken und Staub; ein <b>Scatterometer</b> zielt schräg aufs Meer und misst daran den Wind.'
      ],
      signal: 'Mikrowellen', time: '2,6 ms', measures: 'Regen, Wolken, Höhe'
    }
  },

  readout: {
    source: 'Woher kommt die Strahlung?',
    measures: 'Was wird gemessen?',
    night: 'Geht nachts?',
    signal: 'Was wird gesendet?',
    time: 'Hin und zurück',
    what: 'Ergebnis'
  },

  chart: {
    profile: 'Echo – zuerst von oben, zuletzt vom Boden',
    height: 'Höhe',
    strength: 'Stärke des Echos',
    waiting: 'Sende einen Impuls, um das Echo zu sehen.',
    passiveTitle: 'Was kommt beim Satelliten an?',
    parts: { sun: 'Sonnenlicht', ground: 'Wärme vom Boden', cloud: 'Wärme der Wolke', vapour: 'Strahlung des Wasserdampfs' },
    nothing: 'nichts',
    labels: { cirrus: 'Eiswolke', cloud: 'Wolke', rain: 'Regen', ground: 'Boden' }
  },

  scene: { night: 'Nacht', vapour: 'Wasserdampf', dust: 'Staub', cirrus: 'Eiswolke', sea: 'Meer', land: 'Land' },

  controls: {
    pulse: 'Impuls senden',
    nightAria: 'Tag oder Nacht',
    infoAria: 'Bedienung erklären',
    note: '<p>Oben im Bild wählst du das Messprinzip: <b>passiv</b> (Strahlung empfangen) oder <b>aktiv</b> (selbst ein Signal senden). Darunter den Kanal oder das Instrument.</p><p>Passiv: <span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/></svg></span> schaltet zwischen Tag und Nacht um.</p><p>Aktiv: <b>Impuls senden</b> schickt ein Signal los. Im Diagramm erscheinen die Echos – in der Reihenfolge, in der sie zurückkommen.</p><p>Alles läuft in Zeitlupe: In Wirklichkeit ist ein Radar-Impuls nach 2 bis 3 Tausendstelsekunden wieder zurück.</p>'
  },

  tasks: {
    pulse: 'Aktiv: Schick einen Impuls los. Von wo kommen Echos zurück – und welches kommt zuerst?',
    donePulse: 'Zuerst das Echo der hohen Eiswolke, dann Wolke und Regen, zuletzt der Boden. Je weiter weg, desto länger braucht das Echo – so wird aus der Laufzeit eine Höhe.',
    night: 'Passiv: Schalte auf Nacht und probiere „Sichtbar“ und „Infrarot“. Welcher Kanal misst noch etwas?',
    doneNight: 'Nur der Infrarotkanal (und der Wasserdampfkanal): Wärmestrahlung gibt es auch ohne Sonne.'
  },

  merke: {
    title: 'Merke',
    text: 'Passive Instrumente empfangen Strahlung, die von der Erde kommt: zurückgeworfenes Sonnenlicht oder Wärmestrahlung. Aktive Instrumente senden selbst ein Signal und messen das Echo: Die Laufzeit verrät die Entfernung, die Stärke zum Beispiel, wie viel Regen fällt.'
  },

  topics: {
    camera: {
      title: 'Ist ein Satellit nicht einfach eine Kamera?',
      body: '<p>Nicht ganz. Eine Handykamera soll ein schönes Bild machen. Ein Messinstrument auf einem Wettersatelliten – ein <b>Radiometer</b> – misst dagegen genau, <b>wie viel Strahlung</b> in einem schmalen Wellenlängenbereich ankommt. Dafür wird es im All ständig nachgeeicht (kalibriert), zum Beispiel mit einem Blick ins kalte Weltall und auf eine Fläche mit bekannter Temperatur.</p><p>Aus diesen Zahlen berechnen Fachleute mit physikalischen Gesetzen, was sie bedeuten: eine Temperatur, eine Wolkenhöhe, eine Feuchte. Die Bilder entstehen dabei Zeile für Zeile, während das Instrument die Erde abtastet.</p>'
    },
    passive: {
      title: 'Passive Fernerkundung',
      body: '<p>Passiv heißt: Der Sensor sendet nichts, er <b>empfängt</b> nur. Die Strahlung ist entweder Sonnenlicht, das Erde und Atmosphäre zurückwerfen, oder Wärmestrahlung, die sie selbst aussenden.</p><p>Die meisten klassischen Wettersatelliten-Messungen funktionieren so: die sichtbaren Kanäle, die Infrarot- und die Wasserdampfkanäle. Auch der Blitz-Sensor von Meteosat-12 ist passiv – er zählt die Lichtblitze von Gewittern.</p>'
    },
    active: {
      title: 'Aktive Fernerkundung',
      body: '<p>Aktiv heißt: Das Instrument sendet selbst ein Signal aus und empfängt das Echo, das Atmosphäre oder Erdoberfläche zurückwerfen.</p><ul><li><b>Radar</b> (Mikrowellen): Niederschlag und Wolken, zum Beispiel auf GPM (NASA/JAXA) oder EarthCARE (ESA/JAXA).</li><li><b>Lidar</b> (Laserlicht): Wolken und Aerosole wie Staub oder Rauch, zum Beispiel auf EarthCARE oder früher CALIPSO.</li><li><b>Scatterometer</b> (schräge Mikrowellen): Wind über dem Meer, zum Beispiel ASCAT auf den Metop-Satelliten.</li></ul><p>Weil die Signale mit Lichtgeschwindigkeit laufen, kommt ein Echo aus 1 km mehr Entfernung nur knapp 7 Millionstelsekunden später an. Die Instrumente müssen also extrem genau messen.</p>'
    },
    which: {
      title: 'Hat jeder Wettersatellit alle Instrumente?',
      body: '<p>Nein. Jeder Satellit trägt nur die Instrumente, die er für seine Aufgabe braucht.</p><ul><li><b>Meteosat-12</b> (GEO) misst nur passiv: mit dem Bildsensor (16 Kanäle) und dem Blitz-Sensor.</li><li><b>Metop</b> (LEO) trägt viele passive Instrumente und dazu das Scatterometer ASCAT.</li><li><b>EarthCARE</b> (LEO) hat ein Wolkenradar und ein Lidar an Bord – dazu passive Instrumente.</li></ul>'
    },
    simple: {
      title: 'Was ist am Schema vereinfacht?',
      body: '<p>Das Bild ist nicht maßstäblich: In echt ist der Satellit viele Hundert Kilometer hoch, die Wolken nur wenige Kilometer. Die Impulse laufen in extremer Zeitlupe. Die Wellenstücke stehen für Strahlung – sie zeigen, woher sie kommt und wohin sie läuft, nicht ihre echte Wellenlänge.</p>'
    },
    sources: {
      title: 'Quellen',
      body: '<ul class="sources-list"><li>NASA Earth Observatory / NASA Earthdata: Remote Sensing – Passive and Active Sensors</li><li>ESA: EarthCARE (Wolkenradar CPR, Lidar ATLID)</li><li>EUMETSAT: Metop – ASCAT; Meteosat Third Generation – FCI und Lightning Imager</li><li>NASA: GPM (Global Precipitation Measurement)</li></ul>'
    }
  }
};
