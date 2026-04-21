(function () {
  'use strict';

  if (typeof window.__retroYtmpTeardown === 'function') {
    try { window.__retroYtmpTeardown(); } catch (_) {}
  }
  const stale = document.getElementById('retro-ytmp');
  if (stale) stale.remove();
  document.documentElement.classList.remove('retro-ytmp-compact');

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
      <div class="retro-ytmp-artist">—</div>
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

  const getVideo = () => document.querySelector('video');

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
        '.shuffle',
      ],
      repeat: [
        'ytmusic-player-bar .repeat',
        'tp-yt-paper-icon-button.repeat',
        '.repeat.ytmusic-player-bar',
        '.repeat',
      ],
    };
    return q(map[name] || []);
  };

  const readShuffleState = () => {
    const b = getBtn('shuffle');
    if (!b) return null;
    const pressed = b.getAttribute('aria-pressed');
    if (pressed === 'true') return true;
    if (pressed === 'false') return false;
    if (b.hasAttribute('active') || b.classList.contains('active')) return true;
    const lbl = (b.getAttribute('aria-label') || b.title || '').toLowerCase();
    if (lbl.includes('shuffle on') || lbl.includes('셔플 사용') || lbl.includes('임의 재생 사용 중')) return true;
    if (lbl.includes('shuffle off') || lbl.includes('임의 재생 사용 안')) return false;
    return null;
  };

  const readRepeatState = () => {
    const b = getBtn('repeat');
    if (!b) return null;
    const lbl = (b.getAttribute('aria-label') || b.title || '').toLowerCase();
    if (/\bone\b|1곡|한곡|한 곡|현재 노래/.test(lbl)) return 2;
    if (/\ball\b|전체|목록/.test(lbl)) return 1;
    if (/\boff\b|해제|사용 안|안 함/.test(lbl)) return 0;
    const iconHost = b.querySelector('[icon]');
    if (iconHost) {
      const icon = (iconHost.getAttribute('icon') || '').toLowerCase();
      if (icon.includes('repeat-one') || icon.includes('one')) return 2;
      if (icon.includes('repeat')) {
        return (b.hasAttribute('active') || b.classList.contains('active')) ? 1 : 0;
      }
    }
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

  const updateMarquee = () => {
    const track = els.track;
    const wrap = track.parentElement;
    if (!wrap) return;
    const isCompact = document.documentElement.classList.contains('retro-ytmp-compact');
    if (isCompact) {
      track.classList.remove('retro-ytmp-track-marquee');
      track.style.removeProperty('--marquee-shift');
      track.style.removeProperty('--marquee-duration');
      return;
    }
    const overflowPx = track.scrollWidth - wrap.clientWidth;
    if (overflowPx > 2) {
      const duration = Math.min(14, Math.max(5, overflowPx / 30));
      track.style.setProperty('--marquee-shift', `-${overflowPx}px`);
      track.style.setProperty('--marquee-duration', `${duration.toFixed(1)}s`);
      track.classList.add('retro-ytmp-track-marquee');
    } else {
      track.classList.remove('retro-ytmp-track-marquee');
      track.style.removeProperty('--marquee-shift');
      track.style.removeProperty('--marquee-duration');
    }
  };

  const update = () => {
    const video = getVideo();
    const current = video ? video.currentTime : 0;
    const duration = video ? video.duration : 0;
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
      const vol = video ? (video.muted ? 0 : video.volume) : 0;
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

    if (action === 'shuffle') {
      uiShuffleOn = !uiShuffleOn;
      els.shuffle.classList.toggle('retro-ytmp-active', uiShuffleOn);
    } else if (action === 'repeat') {
      uiRepeatMode = (uiRepeatMode + 1) % 3;
      els.repeat.classList.toggle('retro-ytmp-active', uiRepeatMode > 0);
      els.repeat.textContent = uiRepeatMode === 2 ? '↻1' : '↻';
    }
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

  let compactState = null;

  const requestResize = (payload) => {
    try {
      chrome.runtime.sendMessage({ type: 'retro-ytmp-resize', ...payload });
    } catch (e) {
      console.warn('[retro-ytmp] resize request failed', e);
    }
  };

  const enterCompact = () => {
    compactState = {
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      screenX: window.screenX,
      screenY: window.screenY,
      overlayLeft: overlay.style.left,
      overlayTop: overlay.style.top,
      overlayRight: overlay.style.right,
      overlayBottom: overlay.style.bottom,
    };

    document.documentElement.classList.add('retro-ytmp-compact');
    overlay.style.left = '';
    overlay.style.top = '';
    overlay.style.right = '';
    overlay.style.bottom = '';

    const rect = overlay.getBoundingClientRect();
    const chromeW = Math.max(0, window.outerWidth - window.innerWidth);
    const chromeH = Math.max(0, window.outerHeight - window.innerHeight);
    const width = Math.ceil(rect.width) + chromeW + 4;
    const height = Math.ceil(rect.height) + chromeH + 4;

    requestResize({ width, height });
    els.compact.textContent = '◱';
    els.compact.title = 'Restore window size';
  };

  const exitCompact = () => {
    document.documentElement.classList.remove('retro-ytmp-compact');
    if (compactState) {
      overlay.style.left = compactState.overlayLeft;
      overlay.style.top = compactState.overlayTop;
      overlay.style.right = compactState.overlayRight;
      overlay.style.bottom = compactState.overlayBottom;
      requestResize({ width: compactState.outerWidth, height: compactState.outerHeight });
    }
    compactState = null;
    els.compact.textContent = '▭';
    els.compact.title = 'Shrink window to player size';
  };

  els.compact.addEventListener('click', () => {
    if (compactState) exitCompact();
    else enterCompact();
  });

  let drag = null;
  els.titlebar.addEventListener('mousedown', (e) => {
    if (e.target.closest('button')) return;
    const rect = overlay.getBoundingClientRect();
    drag = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    overlay.classList.add('retro-ytmp-dragging');
    e.preventDefault();
  });
  addListener(window, 'mousemove', (e) => {
    if (!drag) return;
    const x = Math.max(0, Math.min(window.innerWidth - overlay.offsetWidth, e.clientX - drag.dx));
    const y = Math.max(0, Math.min(window.innerHeight - overlay.offsetHeight, e.clientY - drag.dy));
    overlay.style.left = x + 'px';
    overlay.style.top = y + 'px';
    overlay.style.right = 'auto';
    overlay.style.bottom = 'auto';
  });
  addListener(window, 'mouseup', () => {
    if (drag) overlay.classList.remove('retro-ytmp-dragging');
    drag = null;
  });

  const applyVolume = (vol) => {
    const video = getVideo();
    if (!video) return;
    const clamped = Math.max(0, Math.min(1, vol));
    video.volume = clamped;
    video.muted = clamped === 0;
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

  addListener(window, 'mousemove', (e) => {
    if (!volDrag) return;
    setVolumeFromClientX(e.clientX);
  });

  addListener(window, 'mouseup', () => {
    if (volDrag) els.slider.classList.remove('retro-ytmp-slider-dragging');
    volDrag = null;
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
      if (compactState) exitCompact();
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
