// preload.js - Final Version

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadBibleData: () => ipcRenderer.invoke('load-bible-data'),
});

// The preload script now just sends messages to the main process
contextBridge.exposeInMainWorld('electronStore', {
  get: (key) => ipcRenderer.invoke('electron-store-get', key),
  set: (key, val) => ipcRenderer.invoke('electron-store-set', key, val),
});