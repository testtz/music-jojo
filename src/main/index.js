'use strict'

import { app, BrowserWindow, Menu, dialog, ipcMain } from 'electron'
import * as fs from 'fs'
import path from 'path'
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const STORE_PATH = app.getPath('userData') // 获取electron应用的用户目录

const fsExtra = require('fs-extra')
if (!fsExtra.pathExistsSync(STORE_PATH)) { // 如果不存在路径
  fsExtra.mkdirpSync(STORE_PATH) // 就创建
}
const adapter = new FileSync(path.join(STORE_PATH, '/music-jojo-db.json')) // 初始化lowdb读写的json文件名以及存储路径
const db = low(adapter)

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  const options = {
    height: 678,
    width: 800,
    show: true,
    center: true,
    fullscreenable: false,
    resizable: true,
    title: 'music-jojo',
    vibrancy: 'ultra-dark',
    backgroundColor: '#ffffff', // 背景色
    webPreferences: {
      backgroundThrottling: false,
      webSecurity: false
    }
  }
  if (process.platform === 'darwin') { // 针对mac平台做出不同的配置
  }
  if (process.platform === 'linux') { // 针对linux平台做出不同的配置
    options.transparent = true
    options.titleBarStyle = 'hidden'
    Menu.setApplicationMenu(null)
  }
  if (process.platform === 'win32') { // 针对windows平台做出不同的配置
    options.frame = true // 创建一个frameless窗口
    options.transparent = true
    options.titleBarStyle = 'hidden'
    Menu.setApplicationMenu(null)
  }
  mainWindow = new BrowserWindow(options)
  // const menu = Menu.buildFromTemplate(template)
  // Menu.setApplicationMenu(menu)

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.request_remote = require('request')
app.fs = fs
app.dialog = dialog
app.lowdb = db
db.defaults({setting: { saveDir: '', redotAbout: true }})
  .write()

ipcMain.on('Config', (event, arg) => {
  console.log(arg)
  if (arg['method'] === 'set') {
    db.set('setting', arg['setting']).write()
    event.returnValue = 'success'
  }
  if (arg['method'] === 'get') {
    let ret = db.get('setting').value()
    event.returnValue = ret
  }
})
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
