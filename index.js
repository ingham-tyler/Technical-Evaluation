const { app, BrowserWindow, ipcMain } = require('electron')
const windowStateKeeper = require('electron-window-state')

const path = require('path')

let mainWin

const createWindow = () => {
  let mainWinState = windowStateKeeper({
    defaultWidth: 850,
    defaultHeight: 640
  })

  mainWin = new BrowserWindow({
    x: mainWinState.x,
    y: mainWinState.y,
    width: mainWinState.width,
    height: mainWinState.height,
    backgroundColor: '#353b3c',
    resizable: false,
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(app.getAppPath(), 'preload.js')
    }
  })

  mainWin.loadFile(path.join(app.getAppPath(), 'app/index.html'))
  mainWinState.manage(mainWin)

  // Only for dev env
  // mainWin.webContents.openDevTools()

  mainWin.once('ready-to-show', () => mainWin.show())
  mainWin.on('closed', () => mainWin = null)
}

app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('app-quit', (event, args) => {
  app.quit()
})
