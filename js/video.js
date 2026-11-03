// The YouTube video on the start page, loaded only after a tap.
// Until then a flat poster in the CD stands in its place, so the page never
// depends on YouTube (offline exhibit, blocked network, embedding switched
// off by the owner). The player comes through the YouTube IFrame API from
// the privacy-enhanced domain; its error event tells us when the owner does
// not allow embedding (codes 101 / 150) – then the poster comes back with a
// link to the video on YouTube. No answer within 12 s counts as offline.
(() => {
  'use strict';
  const box = document.getElementById('video');
  if (!box) return;
  const V = TEXTS.start.video;
  const cover = box.querySelector('.video-cover');
  const play = document.getElementById('video-play');
  const status = document.getElementById('video-status');
  let started = false, timer = 0;
  const link = document.getElementById('video-link');
  if (link) link.href = V.url;

  const fail = msg => {
    clearTimeout(timer);
    const host = box.querySelector('.yt-host, iframe');
    if (host) host.remove();
    cover.hidden = false;
    box.classList.add('failed');
    status.hidden = false;
    status.innerHTML = '';
    status.append(msg + ' ');
    const a = document.createElement('a');
    a.href = V.url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = V.openThere;
    status.append(a);
  };

  const loadApi = () => new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(window.YT); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = reject;
    document.head.appendChild(s);
  });

  play.addEventListener('click', () => {
    if (started) return;
    started = true;
    status.hidden = false;
    status.textContent = V.loading;
    timer = setTimeout(() => fail(V.offline), 12000);
    loadApi().then(YT => {
      const host = document.createElement('div');
      host.className = 'yt-host';
      box.appendChild(host);
      new YT.Player(host, {
        host: 'https://www.youtube-nocookie.com',
        videoId: V.id,
        width: '100%', height: '100%',
        // controls: 0 – the square frame crops the sides, where the control
        // bar's buttons would sit; a tap on the picture still pauses.
        playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1, controls: 0, iv_load_policy: 3 },
        events: {
          onReady: e => {
            clearTimeout(timer);
            cover.hidden = true; status.hidden = true;
            try { e.target.playVideo(); } catch (err) { /* the visitor taps play in the player */ }
          },
          // 2 bad id, 5 HTML5 error, 100 removed/private, 101/150/153 embedding not allowed
          onError: () => fail(V.blocked)
        }
      });
    }).catch(() => fail(V.offline));
  });
})();
