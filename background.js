let intervalId = null;
let intervalTime = 5000; // 5 segundos por defecto
let isActive = false;

// Escuchar mensajes del popup para activar/desactivar y cambiar el tiempo
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TOGGLE_AUTOTAB') {
    isActive = request.active;
    if (isActive) {
      startAutoTab();
    } else {
      stopAutoTab();
    }
    sendResponse({ success: true });
  } else if (request.type === 'SET_INTERVAL') {
    intervalTime = request.interval;
    if (isActive) {
      stopAutoTab();
      startAutoTab();
    }
    sendResponse({ success: true });
  }
});

function startAutoTab() {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    chrome.windows.getLastFocused({ populate: true }, (window) => {
      if (!window || !window.tabs) return;
      const tabs = window.tabs.filter(tab => !tab.pinned && tab.url && tab.active !== undefined);
      if (tabs.length <= 1) return;
      const activeIndex = tabs.findIndex(tab => tab.active);
      const nextIndex = (activeIndex + 1) % tabs.length;
      chrome.tabs.update(tabs[nextIndex].id, { active: true });
    });
  }, intervalTime);
}

function stopAutoTab() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// Inicializar desde storage
chrome.storage.sync.get(['autotabActive', 'autotabInterval'], (data) => {
  isActive = data.autotabActive || false;
  intervalTime = data.autotabInterval || 5000;
  if (isActive) {
    startAutoTab();
  }
}); 