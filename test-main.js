const { app, BrowserWindow } = require('electron'); 
 
app.whenReady().then(() =
  const win = new BrowserWindow({ width: 400, height: 300, webPreferences: { nodeIntegration: true } }); 
  win.loadURL('data:text/html,<h1>Electron Test</h1><p>If you see this, Electron works!</p>'); 
  setTimeout(() =, 5000); 
}); 
 
app.on('window-all-closed', () =
