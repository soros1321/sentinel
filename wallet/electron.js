const url = require('url');
const path = require('path');
const electron = require('electron');
const { app, BrowserWindow, Menu, dialog, ipcMain } = electron;
var i18n = new (require('./translations/i18n'));
const remote = electron.remote;
var { exec, execSync } = require('child_process');
var sudo = require('sudo-prompt');
const fs = require('fs');
var disconnect = {
  name: 'DisconnectOpenVPN'
};
var showPrompt = true;
const SENT_DIR = getUserHome() + '/.sentinel';
const KEYSTORE_FILE = SENT_DIR + '/keystore';
if (!fs.existsSync(SENT_DIR)) fs.mkdirSync(SENT_DIR);
function getUserHome() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
}

function windowManager() {
  this.window = null;

  this.createWindow = () => {
    if (process.platform === 'win32') screenHeight = 700;
    else screenHeight = 672;
    this.window = new BrowserWindow({ title: "Sentinel-alpha-0.0.31", resizable: false, width: 1000, height: screenHeight, icon: './public/icon256x256.png' });
    this.window.loadURL(url.format({
      pathname: path.join(__dirname, 'build/index.html'),
      protocol: 'file:',
      slashes: true
    }));

    this.window.on('close', (e) => {
      let self = this;
      isVPNConnected(function (isConnected) {
        if (showPrompt && isConnected) {
          // e.preventDefault();
          let res = dialog.showMessageBox({
            type: 'question',
            buttons: ['Disconnect', 'Run in Background'],
            title: 'Confirm',
            message: 'You are currently connected to a VPN'
          })
          if (!res) {
            showPrompt = false;
            stopVPN(function (err) {
              self.window = null;
              app.quit();
            });
          }
          else {
            self.window = null;
            showPrompt = false;
            app.quit();
          }
        }
        else {
          self.window = null;
          showPrompt = false;
          app.quit();
        }
      });
    });
  }
}


function getKeystore(cb) {
  fs.readFile(KEYSTORE_FILE, function (err, data) {
    if (err) cb(err, null);
    else {
      cb(null, data);
    }
  });
}

function isVPNConnected(cb) {
  if (process.platform === 'win32') {
    exec('tasklist /v /fo csv | findstr /i "openvpn.exe"', function (err, stdout, stderr) {
      if (stdout.toString() === '') {
        cb(false)
      }
      else {
        cb(true)
      }
    })
  }
  else {
    try {
      let stdout = execSync('pidof openvpn').toString();
      if (stdout) {
        console.log("True...")
        cb(true);
      }
      else {
        cb(false);
      }
    } catch (err) {
      cb(false);
    }
  }
}

function stopVPN(cb) {
  if (process.platform === 'win32') {
    sudo.exec('taskkill /IM openvpn.exe /f  && taskkill /IM sentinel.exe /f', disconnect,
      function (error, stdout, stderr) {
        if (error) cb('Disconnecting failed');
        else {
          cb(null);
        }
      });
  }
  else {
    try {
      let stdout = execSync('pidof openvpn').toString();
      console.log(stdout);
      if (stdout) {
        console.log(stdout);
        let pids = stdout.trim();
        let command = 'kill -2 ' + pids;
        if (process.platform === 'darwin') {
          command = `/usr/bin/osascript -e 'do shell script "${command}" with administrator privileges'`
        }
        try {
          let output = execSync(command).toString();
          getKeystore(function (error, KEYSTOREDATA) {
            let data = JSON.parse(KEYSTOREDATA);
            data.isConnected = null;
            let keystore = JSON.stringify(data);
            fs.writeFile(KEYSTORE_FILE, keystore, function (keyErr) {
            });
            cb(null);
          })
        } catch (err) {
          cb(null);
        }
      }
      else {
        cb(null);
      }
    }
    catch (err) {
      cb(null);
    }
  }
}

const template = [{
  label: i18n.__('View'),
  submenu: [

    {
      role: 'toggledevtools', label: i18n.__('Toggle Developer Tools')
    }
  ]
}

]

const mainWindow = new windowManager();

app.on('ready', mainWindow.createWindow);
app.on('ready', function () {
  var m = Menu.buildFromTemplate([{
    label: "Edit",
    submenu: [
      { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
      { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
      { type: "separator" },
      { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
      { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" },
      { label: "Quit", accelerator: "CmdOrCtrl+Q", selector: "quit:", role: 'close' },
      // {
      //   role: 'toggledevtools', label: i18n.__('Toggle Developer Tools')
      // },
    ]
  },
  {
    label: "Language",
    submenu: [
      {
        label: 'English', type: 'checkbox', checked: true, click() {
          m.items[1].submenu.items[1].checked = false;
          m.items[1].submenu.items[0].checked = true;
          mainWindow.window.webContents.send('lang', 'en');
        }
      },
      {
        label: 'Japanese', type: 'checkbox', click() {
          m.items[1].submenu.items[0].checked = false;
          m.items[1].submenu.items[1].checked = true;
          mainWindow.window.webContents.send('lang', 'ja');
        }
      }
    ]
  }
  ])
  Menu.setApplicationMenu(m)
})

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow.window === null) {
    mainWindow.createWindow();
  }
});