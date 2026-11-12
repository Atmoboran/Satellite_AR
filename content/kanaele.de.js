// Texts of chapter 2 (kanaele.html): the three measuring channels.
// Shared texts: content/texts.de.js.
TEXTS.pageTitle = 'Mit welchen Augen sieht ein Satellit das Wetter?';
TEXTS.description = 'Sichtbares Licht, Infrarot und Wasserdampf: dieselbe Wetterlage in drei Messkanälen eines Wettersatelliten.';

TEXTS.kanaele = {
  poster: {
    kicker: 'Kapitel 3',
    headline: 'Mit welchen<br>Augen?',
    lead: 'Ein Wettersatellit misst Strahlung in verschiedenen Wellenlängen. Jeder Messkanal verrät etwas anderes über dieselbe Wetterlage. Schalte um, wechsle die Wetterlage, tippe ins Bild und vergleiche.'
  },

  stageAria: 'Satellitenbild von Europa, Nordafrika und dem Atlantik aus der Sicht eines geostationären Wettersatelliten im gewählten Messkanal.',
  channelAria: 'Messkanal wählen',
  stageNote: 'Berechnetes Beispiel · Blick von Meteosat',
  computing: 'Wetterlage wird berechnet …',
  badge: 'Tippe ins Bild: Was misst der Satellit hier?',
  readout: {
    vis: 'Sichtbar 0,6 <span class="nc">µm</span>',
    ir: 'Infrarot 10,5 <span class="nc">µm</span>',
    wv: 'Wasserdampf 6,3 <span class="nc">µm</span>',
    here: 'Was ist hier?',
    none: 'Tippe ins Bild',
    night: 'dunkel'
  },
  // what the model has put at the tapped point
  what: {
    space: 'Weltraum – hinter dem Rand der Erde',
    cb: 'Gewitterwolke (Cumulonimbus) – Oberkante etwa 12 km hoch',
    highCloud: 'Hohe, dicke Wolken an einer Front oder einem Tief',
    frontMid: 'Mittelhohe Wolken (3–6 km)',
    cirrus: 'Dünne Eiswolken (Cirrus) in etwa 10 km Höhe',
    fog: 'Nebel bzw. Hochnebel – Oberkante nur etwa 1 km hoch',
    cumulus: 'Niedrige Haufen- oder Schauerwolken',
    deck: 'Flache Wolkendecke (Stratocumulus) über kühlem Meer',
    lowOther: 'Tiefe Wolken (unter 2 km)',
    sea: 'Meer, wolkenfrei',
    land: 'Land, wolkenfrei',
    desert: 'Wüste (Sahara), wolkenfrei',
    snow: 'Schnee am Boden – keine Wolke!'
  },
  sceneTitle: 'Wetterlage',
  sceneAria: 'Wetterlage wählen',
  scenes: {
    herbst: { label: 'Herbst', text: '<b>Oktober:</b> Ein Tief über dem Atlantik schickt eine Kaltfront nach Europa. Über Mitteleuropa liegt unter einem Hoch zäher Nebel, über dem warmen Mittelmeer brodeln Gewitter.' },
    sommer: { label: 'Sommer', text: '<b>Juli, Nachmittag:</b> Heiße, feuchte Luft liegt über Europa. In der Nachmittagshitze wachsen über Frankreich, Deutschland, den Alpen und dem Balkan einzelne kräftige Gewitter. Vor Portugal und Marokko liegt eine flache Wolkendecke über dem kühlen Meer, die Sahara ist glühend heiß.' },
    winter: { label: 'Winter', text: '<b>Januar:</b> Kalte Luft aus dem Norden. Skandinavien und Osteuropa sind verschneit, über der Nordsee entstehen in der Kaltluft Schauerwolken. Über Norditalien dreht sich ein Mittelmeertief (Genuatief), in Ungarn hält sich Nebel.' }
  },

  channels: {
    vis: {
      chip: 'Sichtbar',
      title: 'Sichtbares Licht',
      sub: 'Kanal 0,6 <span class="nc">µm</span> · zurückgeworfenes Sonnenlicht',
      bullets: [
        'Der Satellit empfängt <b>Sonnenlicht</b>, das Wolken und Erdoberfläche zurückwerfen (reflektieren).',
        'Das Bild ähnelt einem Schwarz-Weiß-Foto: Dicke Wolken, Schnee und Wüste sind hell, das Meer ist dunkel.',
        'Wolkenstrukturen sind gut zu erkennen – auch flacher Nebel.',
        '<b>Ohne Sonnenlicht</b> bleibt das Bild dunkel: Nachts funktioniert dieser Kanal nicht wie am Tag.'
      ],
      legendTitle: 'Helligkeit: Anteil des zurückgeworfenen Sonnenlichts',
      legendLow: 'wenig Licht (Meer, Nacht)',
      legendHigh: 'viel Licht (dicke Wolken, Schnee)',
      unit: '%'
    },
    ir: {
      chip: 'Infrarot',
      title: 'Infrarot',
      sub: 'Kanal 10,5 <span class="nc">µm</span> · ausgesendete Wärmestrahlung',
      bullets: [
        'Alles sendet Wärmestrahlung aus – Boden, Meer, Wolken. Der Satellit misst, <b>wie viel</b> davon bei ihm ankommt.',
        'Daraus wird eine <b>Strahlungstemperatur</b> berechnet: die Temperatur dessen, was der Satellit „sieht“ – bei Wolken ihre Oberkante.',
        'Hohe Wolken sind sehr kalt (bis unter −60 °C), der Boden ist warm. So unterscheidet man hochreichende Wolken von tiefen.',
        'Die Messung funktioniert <b>auch nachts</b>.'
      ],
      legendTitle: 'Strahlungstemperatur in °C',
      legendLow: 'kalt: hohe Wolkenoberkanten',
      legendHigh: 'warm: Boden, Meer, tiefe Wolken',
      unit: '°C'
    },
    wv: {
      chip: 'Wasserdampf',
      title: 'Wasserdampf',
      sub: 'Kanal 6,3 <span class="nc">µm</span> · Strahlung des Wasserdampfs',
      bullets: [
        'Auf dieser Wellenlänge schluckt Wasserdampf die Wärmestrahlung von unten – und sendet selbst welche aus.',
        'Der Satellit „sieht“ darum nur die Luft in etwa <b>5 bis 10 km Höhe</b>. Boden, Meer und tiefe Wolken bleiben verborgen.',
        '<b>Hell/blau</b>: viel Feuchte in der oberen Luft (kalte Strahlung). <b>Dunkel/gelb</b>: trockene Luft – dort blickt der Kanal tiefer, wo es wärmer ist.',
        'So werden großräumige Luftströmungen sichtbar – auch dort, wo keine Wolken sind.'
      ],
      legendTitle: 'Strahlungstemperatur in °C',
      legendLow: 'kalt: feuchte obere Luft, hohe Wolken',
      legendHigh: 'wärmer: trockene obere Luft',
      unit: '°C'
    }
  },

  controls: {
    timeAria: 'Tag oder Nacht',
    day: 'Tag',
    night: 'Nacht',
    infoAria: 'Bedienung erklären',
    note: '<p><b>Sichtbar / Infrarot / Wasserdampf</b> über dem Bild wählt den Messkanal. Der Satellit tastet die Erde dabei Zeile für Zeile ab – von Süden nach Norden.</p><p><b>Wetterlage</b> wechselt zwischen drei typischen Situationen. <b>Tag / Nacht</b> zeigt dieselbe Lage mit und ohne Sonnenlicht – die Wolken bleiben dabei stehen.</p><p><b>Tippen</b> ins Bild setzt das rote Fadenkreuz: Darunter stehen die Messwerte aller drei Kanäle an dieser Stelle.</p>'
  },

  spectrum: {
    title: 'Wo liegen die Kanäle?',
    aria: 'Spektrum: Sonnenlicht hat seinen Schwerpunkt im sichtbaren Bereich, die Wärmestrahlung der Erde im Infrarot. Der Wasserdampfkanal liegt in einem Bereich, in dem Wasserdampf stark absorbiert.',
    sun: 'Sonnenlicht',
    earth: 'Wärmestrahlung der Erde',
    absorb: 'Wasserdampf schluckt',
    axis: 'Wellenlänge in µm (Mikrometer)',
    visible: 'sichtbares Licht'
  },

  tasks: {
    night: 'Schalte auf Nacht und vergleiche den sichtbaren Kanal mit Infrarot.',
    doneNight: 'Nachts ist das sichtbare Bild dunkel – es fehlt das Sonnenlicht. Das Infrarotbild bleibt: Wärmestrahlung gibt es Tag und Nacht.',
    fog: 'Herbst: Über Mitteleuropa liegt Nebel – im sichtbaren Bild gut zu sehen. Schalte auf Wasserdampf. Ist er noch da?',
    doneFog: 'Nichts vom Nebel! Der Wasserdampfkanal sieht nur die Luft in 5 bis 10 km Höhe. Was darunter liegt, bleibt verborgen.',
    snow: 'Winter: Vergleiche Sichtbar und Infrarot. Woran erkennst du, was Schnee am Boden ist und was Wolke?',
    doneSnow: 'Im sichtbaren Bild sind Schnee und Wolken beide hell. Im Infrarotbild sind hohe Wolken viel kälter als der verschneite Boden – und im Wasserdampfbild ist der Schnee gar nicht zu sehen.'
  },

  merke: {
    title: 'Merke',
    text: 'Jeder Kanal misst etwas anderes: Der sichtbare Kanal zurückgeworfenes Sonnenlicht, der Infrarotkanal die Wärmestrahlung von Boden und Wolkenoberkanten, der Wasserdampfkanal die Feuchte in der oberen Atmosphäre. Erst zusammen ergeben sie ein vollständiges Bild.'
  },

  topics: {
    filters: {
      title: 'Sind das nicht einfach Farbfilter?',
      body: '<p>Nein. Jedes der drei Bilder ist eine <b>eigene Messung</b> in einem anderen Wellenlängenbereich – mit einem eigenen Detektor im Instrument. Die Strahlung, die gemessen wird, hat jedes Mal einen anderen Ursprung: Sonnenlicht, das zurückgeworfen wird; Wärmestrahlung von Boden und Wolken; Wärmestrahlung des Wasserdampfs hoch in der Luft.</p><p>Deshalb verschwinden Dinge von einem Bild zum anderen: Der Nebel ist im sichtbaren Bild hell, im Infrarotbild kaum vom Boden zu unterscheiden und im Wasserdampfbild gar nicht da. Die Farben sind erst nachträglich hinzugefügt, damit man die Messwerte besser lesen kann.</p>'
    },
    ir: {
      title: 'Misst der Infrarotkanal die Lufttemperatur?',
      body: '<p>Nicht direkt. Der Satellit misst die Wärmestrahlung, die bei ihm ankommt. Daraus berechnet man eine <b>Strahlungstemperatur</b>: die Temperatur, die ein Körper haben müsste, um so stark zu strahlen.</p><p>Wo keine Wolken sind, ist das ungefähr die Temperatur der Erdoberfläche – nicht die Lufttemperatur, die der Wetterbericht nennt. Wo Wolken sind, ist es die Temperatur ihrer <b>Oberkante</b>. Weil es nach oben hin kälter wird, verrät eine kalte Oberkante eine hohe Wolke.</p><p>Um Temperaturen in verschiedenen Höhen der Atmosphäre zu bestimmen, nutzen Wetterdienste viele Kanäle zugleich, zum Beispiel mit dem Instrument IASI auf den Metop-Satelliten.</p>'
    },
    wv: {
      title: 'Warum sieht der Wasserdampfkanal den Boden nicht?',
      body: '<p>Bei 6,3 µm schluckt Wasserdampf Wärmestrahlung sehr stark. Strahlung vom Boden oder von tiefen Wolken wird schon auf dem Weg nach oben verschluckt. Beim Satelliten kommt vor allem Strahlung an, die der Wasserdampf in der oberen Hälfte der Troposphäre selbst aussendet – etwa 5 bis 10 km hoch.</p><p>Ist diese Luft feucht, kommt die Strahlung aus großer Höhe, wo es kalt ist: Das Bild ist hell. Ist sie trocken, blickt der Kanal tiefer hinab, wo es wärmer ist: Das Bild ist dunkel. Dunkle Bänder zeigen oft absinkende, trockene Luft – zum Beispiel hinter einer Kaltfront.</p>'
    },
    more: {
      title: 'Wie viele Kanäle hat ein Wettersatellit?',
      body: '<p>Der Bildsensor von Meteosat-12 (MTG-I1) hat <b>16 Kanäle</b>, vom sichtbaren Licht bis zum Infrarot. Neben den drei hier gezeigten misst er zum Beispiel einen Kanal, der Eis- und Wasserwolken unterscheidet, und einen, mit dem man Vulkanasche erkennt.</p><p>Oft werden mehrere Kanäle zu einem Farbbild kombiniert („RGB“). Andere Satelliten haben andere Instrumente – nicht jeder Wettersatellit misst alle Kanäle.</p><p>Echte, aktuelle Bilder aller Kanäle zeigt EUMETSAT unter <b>view.eumetsat.int</b>; die NASA unter <b>worldview.earthdata.nasa.gov</b>.</p>'
    },
    model: {
      title: 'Ist das ein echtes Satellitenbild?',
      body: '<p>Nein – die Wetterlage ist <b>berechnet</b>, damit man sie anfassen kann: Für jeden Punkt legt ein Modell fest, wo Wolken sind, wie hoch und wie dick, wie warm Boden und Meer sind und wie feucht die obere Luft ist (drei Lagen, wie sie im Herbst, Sommer und Winter vorkommen). Daraus berechnet die Seite für jeden Kanal, was ein Satellit messen würde: das zurückgeworfene Sonnenlicht und die Wärmestrahlung nach dem Planckschen Strahlungsgesetz.</p><p>Vereinfacht ist unter anderem: Wolkenschatten, die schräge Sonne am Rand und die Feinheiten der Strahlung in der Atmosphäre fehlen. Die Küstenlinien stammen von Natural Earth.</p>'
    },
    sources: {
      title: 'Quellen',
      body: '<ul class="sources-list"><li>EUMETSAT: MTG Flexible Combined Imager (FCI) – Kanäle; Image Library und Bildinterpretation – eumetsat.int</li><li>EUMETSAT / EUMeTrain: Interpretation von Wasserdampfbildern</li><li>NASA Earth Observatory: Remote Sensing – earthobservatory.nasa.gov</li><li>Küstenlinien: Natural Earth (gemeinfrei)</li></ul>'
    }
  }
};
