let intervalId = null;
let currentGroupId = null;
let intervalTime = 8000; // 8 segundos por defecto

async function switchTabsInGroup() {
  if (!currentGroupId) return;
  const tabs = await chrome.tabs.query({ groupId: currentGroupId });
  if (tabs.length === 0) return;
  // Encuentra la pestaña activa actual en el grupo
  const activeTab = tabs.find(tab => tab.active);
  let nextIndex = 0;
  if (activeTab) {
    nextIndex = (tabs.findIndex(tab => tab.id === activeTab.id) + 1) % tabs.length;
  }
  chrome.tabs.update(tabs[nextIndex].id, { active: true });
}

function startAutoTab() {
  if (intervalId) clearInterval(intervalId);
  if (currentGroupId) {
    intervalId = setInterval(switchTabsInGroup, intervalTime);
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'setGroupAndInterval') {
    currentGroupId = msg.groupId;
    intervalTime = msg.interval;
    startAutoTab();
    sendResponse({ status: 'ok' });
  } else if (msg.type === 'getState') {
    sendResponse({ groupId: currentGroupId, interval: intervalTime });
  } else if (msg.type === 'stopAutoTab') {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
    sendResponse({ status: 'stopped' });
  }
}); 