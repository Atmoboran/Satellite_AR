// Texts of chapter 2 (kanaele.html): the three measuring channels.
// Shared texts: content/texts.de.js.
TEXTS.pageTitle = 'Mit welchen Augen sieht ein Satellit das Wetter?';
TEXTS.description = 'Sichtbares Licht, Infrarot und Wasserdampf: dieselbe Wetterlage in drei Messkanälen eines Wettersatelliten.';

TEXTS.kanaele = {
  poster: {
    kicker: 'Kapitel 2',
    headline: 'Mit welchen<br>Augen?',
    lead: 'Ein Wettersatellit misst Strahlung in verschiedenen Wellenlängen. Jeder Messkanal verrät etwas anderes über dieselbe Wetterlage. Schalte um, tippe ins Bild und vergleiche.'
  },

  stageAria: 'Satellitenbild von Europa, Nordafrika und dem Atlantik aus der Sicht eines geostationären Wettersatelliten im gewählten Messkanal.',
  channelAria: 'Messkanal wählen',
  badge: 'Tippe ins Bild: Was misst der Satellit hier?',
  stageNote: 'Berechnetes Beispiel · Blick von Meteosat',
  computing: 'Wetterlage wird berechnet …',

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

  readout: {
    vis: 'Sichtbar 0,6 <span class="nc">µm</span>',
    ir: 'Infrarot 10,5 <span class="nc">µm</span>',
    wv: 'Wasserdampf 6,3 <span class="nc">µm</span>',
    here: 'Was ist hier?',
    none: 'Tippe ins Bild',
    night: 'dunkel'
  },

  // What the model has put at the tapped point.
  what: {
    space: 'Weltraum – hinter dem Rand der Erde',
    cb: 'Gewitterwolke (Cumulonimbus) – Oberkante etwa 12 km hoch',
    frontHigh: 'Wolkenband einer Kaltfront – hohe, dicke Wolken',
    frontMid: 'Mittelhohe Wolken vor der Front (3–6 km)',
    comma: 'Wolkenwirbel eines Tiefdruckgebiets',
    cirrus: 'Dünne Eiswolken (Cirrus) in etwa 10 km Höhe',
    fog: 'Nebel bzw. Hochnebel – Oberkante nur etwa 1 km hoch',
    cumulus: 'Niedrige Haufenwolken in kalter Meeresluft',
    lowOther: 'Tiefe Wolken (unter 2 km)',
    snow: 'Schnee in den Alpen – keine Wolke!',
    desert: 'Wüste (Sahara), wolkenfrei',
    land: 'Land, wolkenfrei',
    sea: 'Meer, wolkenfrei'
  },

  controls: {
    time: 'Uhrzeit (UTC)',
    timeValue: h => String(Math.floor(h)).padStart(2, '0') + ':' + String(Math.round((h % 1) * 60)).padStart(2, '0') + ' UTC',
    playAria: 'Den Tag ablaufen lassen',
    pauseAria: 'Anhalten',
    coastAria: 'Küstenlinien ein- oder ausblenden',
    infoAria: 'Bedienung erklären',
    note: '<p><b>Sichtbar / Infrarot / Wasserdampf</b> oben im Bild wählt den Messkanal. Der Satellit tastet die Erde dabei Zeile für Zeile ab – von Süden nach Norden.</p><p><b>Tippen</b> ins Bild setzt das rote Fadenkreuz: Darunter stehen die Messwerte aller drei Kanäle an dieser Stelle.</p><p><span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4l14 8-14 8V4z" fill="currentColor"/></svg></span> lässt den Tag ablaufen (eine Stunde pro Sekunde), der Regler stellt die Uhrzeit ein. <span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 15c3-1 4-5 7-5s3 4 6 3 3-4 5-4"/></svg></span> blendet die Küstenlinien ein oder aus.</p>'
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
    night: 'Stell die Uhrzeit auf Nacht (zum Beispiel 22:00 UTC). Was zeigt jetzt der sichtbare Kanal – und was der Infrarotkanal?',
    doneNight: 'Nachts ist das sichtbare Bild dunkel – es fehlt das Sonnenlicht. Das Infrarotbild bleibt: Wärmestrahlung gibt es Tag und Nacht.',
    cold: 'Finde im Infrarotbild die kälteste Wolkenoberkante und tippe darauf.',
    doneCold: 'Unter −55 °C! So kalt ist es nur ganz oben in hochreichenden Gewitterwolken, etwa 12 km über dem Meer.',
    fog: 'Über Mitteleuropa liegt Nebel – im sichtbaren Bild gut zu sehen. Schalte auf Wasserdampf und tippe auf die Stelle. Was siehst du?',
    doneFog: 'Nichts vom Nebel! Der Wasserdampfkanal sieht nur die Luft in 5 bis 10 km Höhe. Was darunter liegt, bleibt verborgen.'
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
      body: '<p>Nein – die Wetterlage ist <b>berechnet</b>, damit man sie anfassen kann: Für jeden Punkt legt ein Modell fest, wo Wolken sind, wie hoch und wie dick, wie warm Boden und Meer sind und wie feucht die obere Luft ist (eine Lage, wie sie im Oktober vorkommen kann). Daraus berechnet die Seite für jeden Kanal, was ein Satellit messen würde: das zurückgeworfene Sonnenlicht und die Wärmestrahlung nach dem Planckschen Strahlungsgesetz.</p><p>Vereinfacht ist unter anderem: Wolkenschatten, die schräge Sonne am Rand und die Feinheiten der Strahlung in der Atmosphäre fehlen. Die Küstenlinien stammen von Natural Earth.</p>'
    },
    sources: {
      title: 'Quellen',
      body: '<ul class="sources-list"><li>EUMETSAT: MTG Flexible Combined Imager (FCI) – Kanäle; Image Library und Bildinterpretation – eumetsat.int</li><li>EUMETSAT / EUMeTrain: Interpretation von Wasserdampfbildern</li><li>NASA Earth Observatory: Remote Sensing – earthobservatory.nasa.gov</li><li>Küstenlinien: Natural Earth (gemeinfrei)</li></ul>'
    }
  }
};
