async function getTabGroups() {
  const tabs = await chrome.tabs.query({});
  const groupIds = [...new Set(tabs.map(tab => tab.groupId).filter(id => id >= 0))];
  const groups = await Promise.all(groupIds.map(id => chrome.tabGroups.get(id)));
  return groups.map((group, i) => ({ id: groupIds[i], title: group.title || `Grupo ${groupIds[i]}` }));
}

function setStatus(msg) {
  document.getElementById('status').textContent = msg;
  setTimeout(() => { document.getElementById('status').textContent = ''; }, 2000);
}

document.addEventListener('DOMContentLoaded', async () => {
  const groupSelect = document.getElementById('groupSelect');
  const intervalInput = document.getElementById('intervalInput');
  const saveBtn = document.getElementById('saveBtn');
  const stopBtn = document.getElementById('stopBtn');

  // Cargar grupos
  const groups = await getTabGroups();
  groupSelect.innerHTML = groups.map(g => `<option value="${g.id}">${g.title}</option>`).join('');

  // Cargar estado actual
  chrome.runtime.sendMessage({ type: 'getState' }, (state) => {
    if (state && state.groupId !== null) {
      groupSelect.value = state.groupId;
    }
    if (state && state.interval) {
      intervalInput.value = state.interval / 1000;
    }
  });

  saveBtn.onclick = () => {
    const groupId = parseInt(groupSelect.value);
    const interval = Math.max(1, parseInt(intervalInput.value)) * 1000;
    chrome.runtime.sendMessage({ type: 'setGroupAndInterval', groupId, interval }, (resp) => {
      if (resp && resp.status === 'ok') setStatus('Guardado!');
    });
  };

  stopBtn.onclick = () => {
    chrome.runtime.sendMessage({ type: 'stopAutoTab' }, (resp) => {
      if (resp && resp.status === 'stopped') setStatus('AutoTab detenido');
    });
  };
}); 