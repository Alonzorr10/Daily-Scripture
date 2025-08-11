const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
  loadBibleData: () => {
    const dataPath = path.join(__dirname, 'data', 'en_kjv.json');
    const data = fs.readFileSync(dataPath, 'utf-8');
    const jsondata = data.replace(/^\uFEFF/, '');
    return JSON.parse(jsondata);
  }
});