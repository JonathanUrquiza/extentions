const toggleBtn = document.getElementById('toggle');
const intervalInput = document.getElementById('interval');

// Cargar estado inicial
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['autotabActive', 'autotabInterval'], (data) => {
    const isActive = data.autotabActive || false;
    const interval = data.autotabInterval ? data.autotabInterval / 1000 : 5;
    intervalInput.value = interval;
    updateButton(isActive);
  });
});

// Cambiar estado al hacer click
toggleBtn.addEventListener('click', () => {
  chrome.storage.sync.get('autotabActive', (data) => {
    const newActive = !data.autotabActive;
    chrome.storage.sync.set({ autotabActive: newActive }, () => {
      chrome.runtime.sendMessage({ type: 'TOGGLE_AUTOTAB', active: newActive });
      updateButton(newActive);
    });
  });
});

// Cambiar intervalo
document.getElementById('interval').addEventListener('change', (e) => {
  let value = parseInt(e.target.value, 10);
  if (isNaN(value) || value < 1) value = 5;
  chrome.storage.sync.set({ autotabInterval: value * 1000 }, () => {
    chrome.runtime.sendMessage({ type: 'SET_INTERVAL', interval: value * 1000 });
  });
});

function updateButton(isActive) {
  toggleBtn.textContent = isActive ? 'Desactivar AutoTab' : 'Activar AutoTab';
} 