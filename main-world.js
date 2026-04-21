(function () {
  if (window.__retroYtmpBridgeRunning) return;
  window.__retroYtmpBridgeRunning = true;

  const ATTR = 'data-retro-ytmp-meta';

  const readMediaSession = () => {
    try {
      const m = navigator.mediaSession && navigator.mediaSession.metadata;
      if (!m) return null;
      return {
        title: m.title || '',
        artist: m.artist || '',
        album: m.album || '',
      };
    } catch (_) {
      return null;
    }
  };

  const readPlayerApi = () => {
    try {
      const bar = document.querySelector('ytmusic-player-bar');
      const api = bar && (bar.playerApi_ || bar.playerApi);
      const resp = api && (api.getPlayerResponse_ ? api.getPlayerResponse_() : api.getPlayerResponse && api.getPlayerResponse());
      const mf = resp && resp.microformat && resp.microformat.microformatDataRenderer;
      const year = mf && mf.publishDate ? String(mf.publishDate).slice(0, 4) : '';
      return { year };
    } catch (_) {
      return { year: '' };
    }
  };

  const update = () => {
    const ms = readMediaSession() || { title: '', artist: '', album: '' };
    const pa = readPlayerApi();
    const data = {
      title: ms.title,
      artist: ms.artist,
      album: ms.album,
      year: pa.year || '',
    };
    const next = JSON.stringify(data);
    const el = document.documentElement;
    if (el.getAttribute(ATTR) !== next) el.setAttribute(ATTR, next);
  };

  update();
  setInterval(update, 500);
})();
