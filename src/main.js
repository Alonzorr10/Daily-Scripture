// main.js - Final Corrected Version

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

// Wrap the main logic in an async function to allow for the dynamic import.
(async () => {
  // Dynamically import the ESM-only electron-store package.
  const { default: Store } = await import('electron-store');
  const store = new Store();

  // --- Set up all IPC listeners ---

  // For electron-store
  ipcMain.handle('electron-store-get', (event, key) => {
    return store.get(key);
  });
  ipcMain.handle('electron-store-set', (event, key, val) => {
    store.set(key, val);
  });

  // For loading the bible data
  ipcMain.handle('load-bible-data', () => {
    const dataPath = path.join(__dirname, 'data', 'en_kjv.json');
    const data = fs.readFileSync(dataPath, 'utf-8');
    const jsondata = data.replace(/^\uFEFF/, '');
    return JSON.parse(jsondata);
  });

  // --- App startup logic ---

  function createWindow() {
    const mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      icon: 'C:/Users/alonz/Desktop/Daily-Scripture/read.ico',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  }

  await app.whenReady();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
})();