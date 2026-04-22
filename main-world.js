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

  const getPlayerApi = () => {
    try {
      const bar = document.querySelector('ytmusic-player-bar');
      return (bar && (bar.playerApi_ || bar.playerApi)) || null;
    } catch (_) {
      return null;
    }
  };

  const readPlayerApi = () => {
    try {
      const api = getPlayerApi();
      const resp = api && (api.getPlayerResponse_ ? api.getPlayerResponse_() : api.getPlayerResponse && api.getPlayerResponse());
      const mf = resp && resp.microformat && resp.microformat.microformatDataRenderer;
      const year = mf && mf.publishDate ? String(mf.publishDate).slice(0, 4) : '';
      return { year };
    } catch (_) {
      return { year: '' };
    }
  };

  const readPlayerVolume = () => {
    const out = { volume: null, muted: null };
    try {
      const api = getPlayerApi();
      if (!api) return out;
      try {
        const v = typeof api.getVolume === 'function' ? api.getVolume() : null;
        if (typeof v === 'number' && isFinite(v)) out.volume = Math.max(0, Math.min(100, v)) / 100;
      } catch (_) {}
      try {
        const m = typeof api.isMuted === 'function' ? api.isMuted() : null;
        if (typeof m === 'boolean') out.muted = m;
      } catch (_) {}
    } catch (_) {}
    return out;
  };

  const readToggleStates = () => {
    const out = { shuffle: null, repeat: null };
    try {
      const bar = document.querySelector('ytmusic-player-bar');
      if (!bar) return out;
      out.shuffle = bar.hasAttribute('shuffle-on');
      const mode = (bar.getAttribute('repeat-mode') || '').toUpperCase();
      if (mode === 'ONE') out.repeat = 2;
      else if (mode === 'ALL') out.repeat = 1;
      else if (mode === 'NONE') out.repeat = 0;
    } catch (_) {}
    return out;
  };

  const parseClock = (s) => {
    if (!s) return null;
    const parts = s.trim().split(':').reverse();
    let total = 0;
    for (let i = 0; i < parts.length; i++) {
      const n = parseInt(parts[i], 10);
      if (!isFinite(n) || n < 0) return null;
      total += n * Math.pow(60, i);
    }
    return total;
  };

  const readPlayerProgress = () => {
    const out = { currentTime: null, duration: null };
    try {
      const timeInfo = document.querySelector('ytmusic-player-bar .time-info, ytmusic-player-bar span.time-info');
      if (timeInfo) {
        const txt = (timeInfo.textContent || '').replace(/\s+/g, ' ').trim();
        const m = txt.match(/(\d+(?::\d+){1,2})\s*\/\s*(\d+(?::\d+){1,2})/);
        if (m) {
          const ct = parseClock(m[1]);
          const dr = parseClock(m[2]);
          if (ct !== null) out.currentTime = ct;
          if (dr !== null && dr > 0) out.duration = dr;
        }
      }
      const api = getPlayerApi();
      if (api) {
        if (out.currentTime === null) {
          try {
            const ct = typeof api.getCurrentTime === 'function' ? api.getCurrentTime() : null;
            if (typeof ct === 'number' && isFinite(ct) && ct >= 0) out.currentTime = ct;
          } catch (_) {}
        }
        if (out.duration === null) {
          try {
            const dr = typeof api.getDuration === 'function' ? api.getDuration() : null;
            if (typeof dr === 'number' && isFinite(dr) && dr > 0) out.duration = dr;
          } catch (_) {}
        }
      }
    } catch (_) {}
    return out;
  };

  const update = () => {
    const ms = readMediaSession() || { title: '', artist: '', album: '' };
    const pa = readPlayerApi();
    const tg = readToggleStates();
    const pv = readPlayerVolume();
    const pg = readPlayerProgress();
    const data = {
      title: ms.title,
      artist: ms.artist,
      album: ms.album,
      year: pa.year || '',
      shuffle: tg.shuffle,
      repeat: tg.repeat,
      volume: pv.volume,
      muted: pv.muted,
      currentTime: pg.currentTime,
      duration: pg.duration,
    };
    const next = JSON.stringify(data);
    const el = document.documentElement;
    if (el.getAttribute(ATTR) !== next) el.setAttribute(ATTR, next);
  };

  window.addEventListener('message', (e) => {
    if (e.source !== window) return;
    const d = e.data;
    if (!d || d.source !== 'retro-ytmp' || !d.type) return;
    const api = getPlayerApi();
    if (!api) return;
    try {
      if (d.type === 'setVolume') {
        const raw = typeof d.value === 'number' ? d.value : 0;
        const v = Math.max(0, Math.min(100, Math.round(raw * 100)));
        if (typeof api.setVolume === 'function') api.setVolume(v);
        if (v === 0) {
          if (typeof api.mute === 'function') api.mute();
        } else {
          if (typeof api.unMute === 'function') api.unMute();
        }
      }
    } catch (_) {}
  });

  update();
  setInterval(update, 500);
})();
