const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('voskBridge', {
  startListening: () => ipcRenderer.send('start-listening'),
  stopListening: () => ipcRenderer.send('stop-listening'),
  sendAudio: (buffer) => ipcRenderer.send('audio-chunk', buffer),
  onResult: (callback) => ipcRenderer.on('speech-result', (event, text) => callback(text)),
});