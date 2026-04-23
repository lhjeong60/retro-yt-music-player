(function () {
  'use strict';

  if (typeof window.__retroYtmpTeardown === 'function') {
    try { window.__retroYtmpTeardown(); } catch (_) {}
  }
  const stale = document.getElementById('retro-ytmp');
  if (stale) stale.remove();
  document.documentElement.classList.remove('retro-ytmp-compact', 'retro-ytmp-pip');

  const cleanups = [];
  window.__retroYtmpTeardown = () => {
    while (cleanups.length) {
      const fn = cleanups.pop();
      try { fn(); } catch (_) {}
    }
    window.__retroYtmpTeardown = null;
  };

  const addListener = (target, event, handler, options) => {
    target.addEventListener(event, handler, options);
    cleanups.push(() => target.removeEventListener(event, handler, options));
  };

  const overlay = document.createElement('div');
  overlay.id = 'retro-ytmp';
  overlay.style.display = 'none';
  overlay.innerHTML = `
    <div class="retro-ytmp-titlebar">
      <span class="retro-ytmp-title">◼ RETRO PLAYER</span>
      <div class="retro-ytmp-winbtns">
        <button class="retro-ytmp-compact" type="button" title="Shrink window to player size">▭</button>
        <button class="retro-ytmp-close" type="button" title="Hide">×</button>
      </div>
    </div>
    <div class="retro-ytmp-display">
      <div class="retro-ytmp-scanlines"></div>
      <div class="retro-ytmp-track-wrap">
        <div class="retro-ytmp-track">—</div>
      </div>
      <div class="retro-ytmp-artist-wrap">
        <div class="retro-ytmp-artist">—</div>
      </div>
      <div class="retro-ytmp-time">
        <span class="retro-ytmp-current">0:00</span>
        <span class="retro-ytmp-sep">/</span>
        <span class="retro-ytmp-duration">0:00</span>
      </div>
      <div class="retro-ytmp-progress" title="Seek">
        <div class="retro-ytmp-progress-fill"></div>
      </div>
    </div>
    <div class="retro-ytmp-controls">
      <button class="retro-ytmp-btn retro-ytmp-aux" type="button" data-action="shuffle" title="Shuffle">⇄</button>
      <button class="retro-ytmp-btn" type="button" data-action="prev" title="Previous">⏮</button>
      <button class="retro-ytmp-btn retro-ytmp-play" type="button" data-action="play" title="Play/Pause">▶</button>
      <button class="retro-ytmp-btn" type="button" data-action="next" title="Next">⏭</button>
      <button class="retro-ytmp-btn retro-ytmp-aux" type="button" data-action="repeat" title="Repeat">↻</button>
    </div>
    <div class="retro-ytmp-volume">
      <span class="retro-ytmp-vol-label">VOL</span>
      <div class="retro-ytmp-slider" title="Drag or scroll to change volume">
        <div class="retro-ytmp-slider-track">
          <div class="retro-ytmp-slider-fill"></div>
          <div class="retro-ytmp-slider-ticks"></div>
          <div class="retro-ytmp-slider-thumb"></div>
        </div>
      </div>
      <span class="retro-ytmp-vol-value">100</span>
    </div>
  `;

  const attach = () => {
    if (!document.body.contains(overlay)) document.body.appendChild(overlay);
  };
  if (document.body) attach();
  else window.addEventListener('DOMContentLoaded', attach, { once: true });

  const fmt = (s) => {
    if (!isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const q = (sels) => {
    for (const s of sels) {
      const el = document.querySelector(s);
      if (el) return el;
    }
    return null;
  };

  const getVideo = () => {
    const videos = Array.from(document.querySelectorAll('video'));
    if (!videos.length) return null;
    const playing = videos.find((v) => !v.paused && !v.ended && v.readyState > 2);
    if (playing) return playing;
    return document.querySelector('video.html5-main-video') || videos[0];
  };

  const getTitleText = () => {
    const el = q([
      'ytmusic-player-bar .title.ytmusic-player-bar',
      'ytmusic-player-bar yt-formatted-string.title',
      '.ytmusic-player-bar .title',
      '.content-info-wrapper .title',
    ]);
    return el?.textContent?.trim() || '';
  };

  const getArtistText = () => {
    const el = q([
      'ytmusic-player-bar .byline.ytmusic-player-bar',
      'ytmusic-player-bar yt-formatted-string.byline',
      '.ytmusic-player-bar .byline',
      '.content-info-wrapper .byline',
    ]);
    const raw = el?.textContent || '';
    return raw.replace(/\s+/g, ' ').trim();
  };

  const injectMainWorldBridge = () => {
    if (document.getElementById('retro-ytmp-bridge')) return;
    try {
      const s = document.createElement('script');
      s.id = 'retro-ytmp-bridge';
      s.src = chrome.runtime.getURL('main-world.js');
      s.onload = () => s.remove();
      (document.head || document.documentElement).appendChild(s);
    } catch (_) {}
  };
  injectMainWorldBridge();

  const getBridgeMeta = () => {
    try {
      const raw = document.documentElement.getAttribute('data-retro-ytmp-meta');
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  };

  const getBylineText = () => {
    const meta = getBridgeMeta();
    const parts = [];
    const artist = (meta?.artist || '').trim() || getArtistText();
    if (artist) parts.push(artist);
    const album = (meta?.album || '').trim();
    if (album && album !== artist) parts.push(album);
    const year = (meta?.year || '').trim();
    if (year) parts.push(year);
    return parts.join(' • ');
  };

  const getBtn = (name) => {
    const map = {
      play: [
        '#play-pause-button',
        'tp-yt-paper-icon-button.play-pause-button',
        '.play-pause-button',
      ],
      next: [
        '.next-button',
        'tp-yt-paper-icon-button.next-button',
      ],
      prev: [
        '.previous-button',
        'tp-yt-paper-icon-button.previous-button',
      ],
      shuffle: [
        'ytmusic-player-bar .shuffle',
        'tp-yt-paper-icon-button.shuffle',
        '.shuffle.ytmusic-player-bar',
        'ytmusic-player-bar [aria-label*="shuffle" i]',
        'ytmusic-player-bar [aria-label*="셔플" i]',
        'ytmusic-player-bar [aria-label*="임의" i]',
        '.shuffle',
      ],
      repeat: [
        'ytmusic-player-bar .repeat',
        'tp-yt-paper-icon-button.repeat',
        '.repeat.ytmusic-player-bar',
        'ytmusic-player-bar [aria-label*="repeat" i]',
        'ytmusic-player-bar [aria-label*="반복" i]',
        '.repeat',
      ],
    };
    return q(map[name] || []);
  };

  const readShuffleState = () => {
    const bar = document.querySelector('ytmusic-player-bar');
    if (bar) return bar.hasAttribute('shuffle-on');
    return null;
  };

  const readRepeatState = () => {
    const bar = document.querySelector('ytmusic-player-bar');
    if (!bar) return null;
    const mode = (bar.getAttribute('repeat-mode') || '').toUpperCase();
    if (mode === 'ONE') return 2;
    if (mode === 'ALL') return 1;
    if (mode === 'NONE') return 0;
    return null;
  };

  let uiShuffleOn = readShuffleState() || false;
  let uiRepeatMode = readRepeatState() || 0;

  const els = {
    track: overlay.querySelector('.retro-ytmp-track'),
    artist: overlay.querySelector('.retro-ytmp-artist'),
    current: overlay.querySelector('.retro-ytmp-current'),
    duration: overlay.querySelector('.retro-ytmp-duration'),
    play: overlay.querySelector('.retro-ytmp-play'),
    fill: overlay.querySelector('.retro-ytmp-progress-fill'),
    progress: overlay.querySelector('.retro-ytmp-progress'),
    close: overlay.querySelector('.retro-ytmp-close'),
    compact: overlay.querySelector('.retro-ytmp-compact'),
    titlebar: overlay.querySelector('.retro-ytmp-titlebar'),
    shuffle: overlay.querySelector('[data-action="shuffle"]'),
    repeat: overlay.querySelector('[data-action="repeat"]'),
    slider: overlay.querySelector('.retro-ytmp-slider'),
    sliderTrack: overlay.querySelector('.retro-ytmp-slider-track'),
    sliderFill: overlay.querySelector('.retro-ytmp-slider-fill'),
    sliderThumb: overlay.querySelector('.retro-ytmp-slider-thumb'),
    volValue: overlay.querySelector('.retro-ytmp-vol-value'),
  };

  const setText = (node, text) => {
    if (node.textContent !== text) node.textContent = text;
  };

  let volDrag = null;
  let pipWindow = null;
  let pipOriginalParent = null;
  let pipOriginalNext = null;
  let pipStyles = null;

  const applyMarquee = (el) => {
    const wrap = el?.parentElement;
    if (!wrap) return;
    const overflowPx = el.scrollWidth - wrap.clientWidth;
    if (overflowPx > 2) {
      const duration = Math.min(14, Math.max(5, overflowPx / 30));
      el.style.setProperty('--marquee-shift', `-${overflowPx}px`);
      el.style.setProperty('--marquee-duration', `${duration.toFixed(1)}s`);
      el.classList.add('retro-ytmp-marquee');
    } else {
      el.classList.remove('retro-ytmp-marquee');
      el.style.removeProperty('--marquee-shift');
      el.style.removeProperty('--marquee-duration');
    }
  };

  const updateMarquee = () => {
    applyMarquee(els.track);
    applyMarquee(els.artist);
  };

  const update = () => {
    const video = getVideo();
    const meta = getBridgeMeta();
    const current = (meta && typeof meta.currentTime === 'number') ? meta.currentTime : (video ? video.currentTime : 0);
    const duration = (meta && typeof meta.duration === 'number' && meta.duration > 0) ? meta.duration : (video ? video.duration : 0);
    const playing = !!(video && !video.paused && !video.ended && video.readyState > 2);

    setText(els.track, getTitleText() || '—');
    setText(els.artist, getBylineText() || '—');
    updateMarquee();
    setText(els.current, fmt(current));
    setText(els.duration, fmt(duration));
    const nextSym = playing ? '⏸' : '▶';
    if (els.play.textContent !== nextSym) els.play.textContent = nextSym;
    const pct = duration > 0 ? (current / duration) * 100 : 0;
    els.fill.style.width = pct.toFixed(2) + '%';

    const domShuffle = readShuffleState();
    if (domShuffle !== null) uiShuffleOn = domShuffle;
    const domRepeat = readRepeatState();
    if (domRepeat !== null) uiRepeatMode = domRepeat;

    els.shuffle.classList.toggle('retro-ytmp-active', !!uiShuffleOn);
    els.repeat.classList.toggle('retro-ytmp-active', uiRepeatMode > 0);
    const nextRepeatSym = uiRepeatMode === 2 ? '↻1' : '↻';
    if (els.repeat.textContent !== nextRepeatSym) els.repeat.textContent = nextRepeatSym;

    if (!volDrag) {
      const meta = getBridgeMeta();
      let vol;
      if (meta && typeof meta.volume === 'number') {
        vol = meta.muted ? 0 : meta.volume;
      } else {
        vol = video ? (video.muted ? 0 : video.volume) : 0;
      }
      const pct = (vol * 100).toFixed(2);
      els.sliderFill.style.width = pct + '%';
      els.sliderThumb.style.left = pct + '%';
      setText(els.volValue, Math.round(vol * 100).toString());
    }
  };
  const intervalId = setInterval(update, 500);
  cleanups.push(() => clearInterval(intervalId));
  update();

  overlay.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const target = getBtn(action);
    if (!target) return;
    target.click();
    update();
  });

  els.progress.addEventListener('click', (e) => {
    const video = getVideo();
    if (!video || !video.duration) return;
    const rect = els.progress.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pct * video.duration;
  });

  els.close.addEventListener('click', () => {
    setEnabled(false);
  });

  const onPipClose = () => {
    if (pipStyles) {
      overlay.style.position = pipStyles.position;
      overlay.style.left = pipStyles.left;
      overlay.style.top = pipStyles.top;
      overlay.style.right = pipStyles.right;
      overlay.style.bottom = pipStyles.bottom;
      pipStyles = null;
    }
    if (pipOriginalParent) {
      if (pipOriginalNext && pipOriginalNext.parentNode === pipOriginalParent) {
        pipOriginalParent.insertBefore(overlay, pipOriginalNext);
      } else {
        pipOriginalParent.appendChild(overlay);
      }
    }
    pipOriginalParent = null;
    pipOriginalNext = null;
    pipWindow = null;
    els.compact.textContent = '▭';
    els.compact.title = 'Open Picture-in-Picture (always on top)';
  };

  const PIP_OVERRIDE_CSS = `
    html, body { margin: 0; padding: 0; background: #000; overflow: hidden; width: 100%; height: 100%; }
    #retro-ytmp {
      position: static !important;
      top: auto !important;
      right: auto !important;
      left: auto !important;
      bottom: auto !important;
      width: 100% !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    }
  `;

  const enterCompact = async () => {
    if (pipWindow) return;
    if (!window.documentPictureInPicture) {
      console.warn('[retro-ytmp] Document Picture-in-Picture not supported in this browser');
      return;
    }
    try {
      const rect = overlay.getBoundingClientRect();
      const initW = Math.max(280, Math.ceil(rect.width) || 320);
      const initH = Math.max(220, Math.ceil(rect.height) || 280);

      const win = await window.documentPictureInPicture.requestWindow({ width: initW, height: initH });
      pipWindow = win;

      let cssText = '';
      try {
        const res = await fetch(chrome.runtime.getURL('overlay.css'));
        cssText = await res.text();
      } catch (e) {
        console.warn('[retro-ytmp] overlay.css fetch failed', e);
      }
      const baseStyle = win.document.createElement('style');
      baseStyle.textContent = cssText;
      win.document.head.appendChild(baseStyle);

      const overrideStyle = win.document.createElement('style');
      overrideStyle.textContent = PIP_OVERRIDE_CSS;
      win.document.head.appendChild(overrideStyle);

      win.document.title = 'Retro Player';
      win.document.documentElement.classList.add('retro-ytmp-pip');

      pipOriginalParent = overlay.parentNode;
      pipOriginalNext = overlay.nextSibling;
      pipStyles = {
        position: overlay.style.position,
        left: overlay.style.left,
        top: overlay.style.top,
        right: overlay.style.right,
        bottom: overlay.style.bottom,
      };
      overlay.style.position = '';
      overlay.style.left = '';
      overlay.style.top = '';
      overlay.style.right = '';
      overlay.style.bottom = '';
      win.document.body.appendChild(overlay);

      win.addEventListener('mousemove', onDocMouseMove);
      win.addEventListener('mouseup', onDocMouseUp);
      win.addEventListener('pagehide', onPipClose, { once: true });

      els.compact.textContent = '◱';
      els.compact.title = 'Close Picture-in-Picture';
    } catch (e) {
      console.warn('[retro-ytmp] PiP request failed', e);
      pipWindow = null;
    }
  };

  const exitCompact = () => {
    if (!pipWindow) return;
    try { pipWindow.close(); } catch (_) {}
  };

  els.compact.addEventListener('click', () => {
    if (pipWindow) exitCompact();
    else enterCompact();
  });
  cleanups.push(() => { if (pipWindow) { try { pipWindow.close(); } catch (_) {} } });

  let drag = null;
  els.titlebar.addEventListener('mousedown', (e) => {
    if (e.target.closest('button')) return;
    if (pipWindow) return;
    const rect = overlay.getBoundingClientRect();
    drag = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    overlay.classList.add('retro-ytmp-dragging');
    e.preventDefault();
  });

  const onDocMouseMove = (e) => {
    if (drag) {
      const x = Math.max(0, Math.min(window.innerWidth - overlay.offsetWidth, e.clientX - drag.dx));
      const y = Math.max(0, Math.min(window.innerHeight - overlay.offsetHeight, e.clientY - drag.dy));
      overlay.style.left = x + 'px';
      overlay.style.top = y + 'px';
      overlay.style.right = 'auto';
      overlay.style.bottom = 'auto';
    }
    if (volDrag) setVolumeFromClientX(e.clientX);
  };

  const onDocMouseUp = () => {
    if (drag) overlay.classList.remove('retro-ytmp-dragging');
    drag = null;
    if (volDrag) els.slider.classList.remove('retro-ytmp-slider-dragging');
    volDrag = null;
  };

  addListener(window, 'mousemove', onDocMouseMove);
  addListener(window, 'mouseup', onDocMouseUp);

  const applyVolume = (vol) => {
    const clamped = Math.max(0, Math.min(1, vol));
    try {
      window.postMessage({ source: 'retro-ytmp', type: 'setVolume', value: clamped }, '*');
    } catch (_) {}
    const video = getVideo();
    if (video) {
      video.volume = clamped;
      video.muted = clamped === 0;
    }
    const pct = (clamped * 100).toFixed(2);
    els.sliderFill.style.width = pct + '%';
    els.sliderThumb.style.left = pct + '%';
    setText(els.volValue, Math.round(clamped * 100).toString());
  };

  const setVolumeFromClientX = (clientX) => {
    const r = els.sliderTrack.getBoundingClientRect();
    if (r.width <= 0) return;
    applyVolume((clientX - r.left) / r.width);
  };

  els.slider.addEventListener('mousedown', (e) => {
    volDrag = true;
    els.slider.classList.add('retro-ytmp-slider-dragging');
    setVolumeFromClientX(e.clientX);
    e.preventDefault();
  });

  els.slider.addEventListener('wheel', (e) => {
    const video = getVideo();
    if (!video) return;
    const base = video.muted ? 0 : video.volume;
    applyVolume(base + (e.deltaY > 0 ? -0.05 : 0.05));
    e.preventDefault();
  }, { passive: false });

  let enabled = true;

  const setEnabled = (next, persist = true) => {
    enabled = !!next;
    if (enabled) {
      overlay.style.display = '';
    } else {
      if (pipWindow) exitCompact();
      overlay.style.display = 'none';
    }
    if (persist) {
      try { chrome.storage.local.set({ enabled }); } catch (_) {}
    }
  };

  try {
    chrome.storage.local.get({ enabled: true }, (res) => {
      setEnabled(res && res.enabled !== false, false);
    });
  } catch (_) {
    setEnabled(true, false);
  }

  const onRuntimeMessage = (msg, _sender, sendResponse) => {
    if (msg && msg.type === 'retro-ytmp-toggle') {
      setEnabled(!enabled);
      sendResponse({ ok: true, enabled });
      return true;
    }
    if (msg && msg.type === 'retro-ytmp-set') {
      setEnabled(!!msg.enabled);
      sendResponse({ ok: true, enabled });
      return true;
    }
    return false;
  };
  chrome.runtime.onMessage.addListener(onRuntimeMessage);
  cleanups.push(() => chrome.runtime.onMessage.removeListener(onRuntimeMessage));
})();
