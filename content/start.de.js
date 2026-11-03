// Texts of the start page (index.html). Shared texts: content/texts.de.js.
TEXTS.pageTitle = 'Wie messen Satelliten das Wetter?';
TEXTS.description = 'Eine Mitmach-Ausstellung im Browser: wie Wettersatelliten die Erde beobachten – Umlaufbahnen, Messkanäle und Messprinzipien.';

TEXTS.start = {
  poster: {
    kicker: 'Wettersatelliten',
    headline: 'Wie messen Satel–<br>liten das Wetter?',
    lead: 'Wettersatelliten beobachten unsere Erde aus dem Weltraum. Aber wie können sie Wolken, Temperatur und Wasserdampf erkennen? Entdecke, wie Satelliten das Wetter messen.'
  },

  intro: [
    'Jeden Tag kreisen Dutzende Wettersatelliten um die Erde. Sie messen Strahlung: Sonnenlicht, das Wolken und Boden zurückwerfen, und Wärmestrahlung, die Erde, Wolken und Luft selbst aussenden.',
    'Aus diesen Messungen entstehen die Bilder, die du aus dem Wetterbericht kennst – und die Daten, mit denen Wettervorhersagen berechnet werden.'
  ],
  claim: 'Wetter, Klima, Wandel. Wir erklären es.',

  // The YouTube video (js/video.js). It loads only after a tap, so the page
  // works without it; if YouTube refuses the embed, the link remains.
  video: {
    id: 'KkLs5xkL_6Y',
    url: 'https://www.youtube.com/live/KkLs5xkL_6Y',
    kicker: 'Video von EUMETSAT',
    title: 'Die Erde, gesehen von Meteosat',
    play: 'Video abspielen',
    playAria: 'Video von EUMETSAT abspielen (lädt YouTube)',
    privacy: 'Beim Abspielen wird das Video von YouTube geladen; dabei werden Daten an YouTube (Google) übertragen.',
    link: 'Auf YouTube ansehen ↗',
    loading: 'Video wird geladen …',
    blocked: 'Dieses Video lässt sich hier nicht abspielen.',
    offline: 'Keine Verbindung zu YouTube.',
    openThere: 'Auf YouTube ansehen ↗',
    credit: 'Video: EUMETSAT (YouTube)'
  },

  chaptersTitle: 'Entdecke in vier Kapiteln',
  cards: [
    { title: 'Zwei Perspek–<br>tiven', text: 'Warum fliegen manche Wettersatelliten tief und schnell – und andere hängen scheinbar still über einem Ort?' },
    { title: 'Mit welchen Augen?', text: 'Sichtbares Licht, Infrarot, Wasserdampf: Dieselbe Wetterlage sieht in jedem Messkanal anders aus.' },
    { title: 'Wie misst ein Satellit?', text: 'Strahlung empfangen oder selbst ein Signal aussenden: passive und aktive Fernerkundung.' },
    { title: 'Der Satellit in AR', text: 'Der Wettersatellit MTG-I1 als 3D-Modell – auf dem Handy in deinem Raum.' }
  ],
  go: 'Los →',

  sources: 'Fakten: EUMETSAT, ESA, NASA. Video: EUMETSAT. Die Wetterlage in Kapitel 2 ist ein berechnetes Beispiel, keine echte Aufnahme.'
};
