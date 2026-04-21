const YTM_URL_FILTER = 'https://music.youtube.com/*';

async function injectInto(tabId) {
  try {
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ['overlay.css'],
    });
  } catch (_) {}
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js'],
    });
  } catch (_) {}
}

async function injectIntoOpenYtmTabs() {
  try {
    const tabs = await chrome.tabs.query({ url: YTM_URL_FILTER });
    await Promise.all(tabs.filter((t) => t.id != null).map((t) => injectInto(t.id)));
  } catch (_) {}
}

chrome.runtime.onInstalled.addListener(injectIntoOpenYtmTabs);
chrome.runtime.onStartup.addListener(injectIntoOpenYtmTabs);

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || tab.id == null) return;
  if (typeof tab.url !== 'string' || !tab.url.startsWith('https://music.youtube.com/')) return;

  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'retro-ytmp-toggle' });
  } catch (_) {
    await injectInto(tab.id);
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'retro-ytmp-toggle' });
    } catch (_) {}
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'retro-ytmp-resize' && sender.tab && sender.tab.windowId != null) {
    const updateInfo = { state: 'normal' };
    if (typeof msg.width === 'number') updateInfo.width = Math.max(120, Math.round(msg.width));
    if (typeof msg.height === 'number') updateInfo.height = Math.max(80, Math.round(msg.height));
    if (typeof msg.left === 'number') updateInfo.left = Math.round(msg.left);
    if (typeof msg.top === 'number') updateInfo.top = Math.round(msg.top);

    chrome.windows.update(sender.tab.windowId, updateInfo)
      .then((win) => sendResponse({ ok: true, win }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }
});
