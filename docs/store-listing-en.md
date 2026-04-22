# Chrome Web Store Listing — English

## Short description (manifest.json — already set)

Retro stereo skin for YouTube Music. Green LCD, playback & volume controls, always-on-top mini player via PiP.

## Detailed description

Turn YouTube Music into an 80s/90s hi-fi stereo.

Retro YT Music Player overlays music.youtube.com with a retro stereo-style skin: a green LCD display with scrolling track/artist text, metallic bezel buttons for transport controls, and a mixer-style volume fader. Perfect for anyone who misses the tactile feel of vintage audio gear.

★ FEATURES
• Retro LCD display with green phosphor glow & scanlines
• Playback controls: play/pause, prev/next, shuffle, repeat (off/all/one)
• Volume fader with LED level meter — click, drag, or mouse-wheel; auto-mute at 0
• Seekable progress bar (click anywhere to jump)
• Marquee animation for long track/artist names
• Draggable panel — move it anywhere on the page
• Compact / Picture-in-Picture mode — detach as an always-on-top mini window that stays visible above other apps (Chrome 116+ required)
• Toolbar icon toggles on/off without reloading the page or interrupting playback
• State persists across page reloads and browser restarts

★ HOW IT WORKS
The extension works as an overlay on music.youtube.com. It reads the current track metadata via the page's media session, forwards playback and volume commands to YouTube Music's internal player API, and renders a retro-themed UI on top. No audio or data leaves your browser.

★ ONE-TIME SETUP (IMPORTANT)
Chrome's site access policy requires a one-time permission grant:
1. Open chrome://extensions
2. Click "Details" on Retro YT Music Player
3. Under "Site access", select either:
   - "On specific sites" → add https://music.youtube.com/*  (recommended)
   - or "On all sites"
4. Reload your YouTube Music tab

After this, the toolbar icon becomes a pure on/off toggle — no reload prompts, no playback interruption.

★ PRIVACY
This extension does not collect, transmit, or store any user data outside your local browser. It only reads information from music.youtube.com pages you open.

★ SOURCE
Open source on GitHub: https://github.com/lhjeong60/retro-yt-music-player

---

## Single purpose statement

The single purpose of this extension is to overlay YouTube Music (music.youtube.com) with an alternative retro stereo-style player skin that provides playback controls, volume control, and a detachable always-on-top mini player.

## Permission justifications

**scripting**
Required to re-inject the content script into already-open YouTube Music tabs when the extension is updated, reloaded, or when the user clicks the toolbar icon to toggle the overlay. This avoids forcing users to manually reload their tabs.

**storage**
Stores the on/off toggle state (a single boolean) so the retro player remembers whether it should be visible after page reloads and browser restarts.

**host_permissions: https://music.youtube.com/***
The extension only operates on YouTube Music. Access is scoped strictly to this single domain to read track metadata and inject the retro UI. It does not access any other site.

## Not collecting user data

Tick "I do not collect user data" in the privacy section.
Disclose that the extension handles "website content" only (reads the YTM page DOM locally, never transmits).
