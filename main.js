const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Sunucu çalışınca tarayıcı penceresi localhost'a yönlendirilecek
  win.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
  // Node.js sunucusunu başlat
  exec('node server.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Server başlatılamadı: ${error}`);
      return;
    }
    console.log(stdout);
  });

  createWindow();
});