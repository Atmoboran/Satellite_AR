// Texts of chapter 3 (messen.html): passive and active remote sensing.
// Shared texts: content/texts.de.js.
TEXTS.pageTitle = 'Wie misst ein Satellit eigentlich?';
TEXTS.description = 'Passive und aktive Fernerkundung: Strahlung empfangen oder selbst ein Signal aussenden – Radiometer, Radar, Lidar und Scatterometer.';

TEXTS.messen = {
  poster: {
    kicker: 'Kapitel 3',
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
    radar: {
      chip: 'Radar',
      title: 'Aktiv: Radar',
      sub: 'Mikrowellen-Impulse · z. B. EarthCARE (94 GHz), GPM',
      bullets: [
        'Das Radar schickt einen kurzen <b>Mikrowellen-Impuls</b> nach unten.',
        'Wolkentröpfchen und vor allem <b>Regentropfen</b> werfen einen Teil davon zurück. Das Radar dringt auch durch dicke Wolken bis zum Boden.',
        'Aus der <b>Laufzeit</b> des Echos ergibt sich die Höhe, aus seiner <b>Stärke</b>, wie viel Wasser dort ist.',
        'Staub und dünne Eiswolken bemerkt das Radar kaum.'
      ],
      signal: 'Mikrowellen', time: '2,6 ms', measures: 'Regen, Wolken'
    },
    lidar: {
      chip: 'Lidar',
      title: 'Aktiv: Lidar',
      sub: 'Laser-Impulse · z. B. EarthCARE (355 nm), CALIPSO',
      bullets: [
        'Das Lidar schickt kurze <b>Laserblitze</b> nach unten – Licht statt Mikrowellen.',
        'Schon kleinste Teilchen werfen Licht zurück: <b>dünne Eiswolken</b> und <b>Staub</b> (Aerosole) in der Luft.',
        'Dicke Wolken verschlucken das Laserlicht: Darunter sieht das Lidar nichts mehr.',
        'Radar und Lidar ergänzen sich – darum fliegen sie auf EarthCARE zusammen.'
      ],
      signal: 'Laserlicht', time: '2,6 ms', measures: 'Wolken, Staub'
    },
    scatter: {
      chip: 'Scatterometer',
      title: 'Aktiv: Scatterometer',
      sub: 'Schräge Mikrowellen-Impulse · z. B. ASCAT auf Metop',
      bullets: [
        'Das Scatterometer schickt Mikrowellen <b>schräg</b> auf das Meer.',
        'Ist die Meeresoberfläche glatt, wird das Signal wie von einem Spiegel weggelenkt – kaum etwas kommt zurück.',
        'Wind kräuselt das Wasser: Je <b>stärker der Wind</b>, desto rauer die Oberfläche und desto stärker das Echo.',
        'Aus mehreren Blickrichtungen ergeben sich Windstärke und Windrichtung über dem Meer.'
      ],
      signal: 'Mikrowellen, schräg', time: 'etwa 8 ms', measures: 'Wind über dem Meer'
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
    windTitle: 'Echo und Windstärke',
    windAxis: 'Wind in m/s',
    passiveTitle: 'Was kommt beim Satelliten an?',
    parts: { sun: 'Sonnenlicht', ground: 'Wärme vom Boden', cloud: 'Wärme der Wolke', vapour: 'Strahlung des Wasserdampfs' },
    nothing: 'nichts',
    labels: { cirrus: 'Eiswolke', dust: 'Staub', cloud: 'Wolke', rain: 'Regen', ground: 'Boden' },
    windResult: v => 'Gemessen: Wind etwa ' + v + ' m/s'
  },

  scene: { night: 'Nacht', vapour: 'Wasserdampf', dust: 'Staub', cirrus: 'Eiswolke', sea: 'Meer', land: 'Land' },

  controls: {
    pulse: 'Impuls senden',
    nightAria: 'Tag oder Nacht',
    wind: 'Wind',
    windValue: v => v + ' m/s',
    infoAria: 'Bedienung erklären',
    note: '<p>Oben im Bild wählst du das Messprinzip: <b>passiv</b> (Strahlung empfangen) oder <b>aktiv</b> (selbst ein Signal senden). Darunter den Kanal oder das Instrument.</p><p>Passiv: <span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/></svg></span> schaltet zwischen Tag und Nacht um.</p><p>Aktiv: <b>Impuls senden</b> schickt ein Signal los. Rechts unten im Diagramm erscheinen die Echos – in der Reihenfolge, in der sie zurückkommen. Beim Scatterometer stellst du mit dem Regler die Windstärke ein.</p><p>Alles läuft in Zeitlupe: In Wirklichkeit ist ein Radar-Impuls nach 2 bis 3 Tausendstelsekunden wieder zurück.</p>'
  },

  tasks: {
    radar: 'Schick mit dem Radar einen Impuls los. Von wo kommen Echos zurück?',
    doneRadar: 'Von der Wolke, vom Regen und vom Boden. Das Echo aus größerer Höhe ist zuerst da – so wird aus der Laufzeit eine Höhe.',
    lidar: 'Jetzt das Lidar: Kommt sein Licht durch die dicke Wolke bis zum Boden?',
    doneLidar: 'Nein – die dicke Wolke verschluckt das Laserlicht. Dafür sieht das Lidar die Eiswolke und den Staub, die das Radar kaum bemerkt.',
    scatter: 'Stell beim Scatterometer starken Wind ein (mehr als 15 m/s) und miss.',
    doneScatter: 'Starker Wind, raue See, starkes Echo. So messen Satelliten den Wind über den Ozeanen – auch dort, wo keine Wetterstation steht.',
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
