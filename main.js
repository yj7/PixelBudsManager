/**
 * Pixel Buds Manager - Menu Bar App
 * 
 * A macOS menu bar application built with Electron to manage Google Pixel Buds.
 * This app wraps the official Google Pixel Buds web companion and provides
 * a native-feeling experience, including a custom Bluetooth device selection UI
 * to bypass macOS and Content Security Policy restrictions.
 */

const { app, shell, ipcMain, BrowserWindow, session } = require('electron');
const { menubar } = require('menubar');
const path = require('path');

// Enable Web Bluetooth functionality in Electron
app.commandLine.appendSwitch('enable-web-bluetooth', true);
app.commandLine.appendSwitch('enable-experimental-web-platform-features', true);

app.on('ready', () => {
  // Explicitly allow all permissions (including Bluetooth) to ensure macOS
  // does not silently block the Web Bluetooth API requests.
  session.defaultSession.setPermissionCheckHandler(() => true);
  session.defaultSession.setDevicePermissionHandler(() => true);
  session.defaultSession.setBluetoothPairingHandler((details, callback) => {
    callback({ accept: true });
  });

  // Initialize the menubar application
  const mb = menubar({
    index: 'https://mypixelbuds.google.com/',
    icon: path.join(__dirname, 'assets', 'IconTemplate.png'),
    browserWindow: {
      width: 420,
      height: 650,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    },
    preloadWindow: true,
    showDockIcon: false
  });

  // State variables for the Bluetooth device picker
  let selectBluetoothCallback;
  let pickerWin = null;
  let currentDeviceList = [];

  /**
   * IPC Listener: 'bluetooth-device-selected'
   * Triggered when the user selects a device from the custom picker UI.
   */
  ipcMain.on('bluetooth-device-selected', (event, deviceId) => {
    if (selectBluetoothCallback) {
      selectBluetoothCallback(deviceId);
      selectBluetoothCallback = null;
    }
    if (pickerWin) {
      pickerWin.close();
    }
  });

  /**
   * IPC Listener: 'bluetooth-device-cancel'
   * Triggered when the user clicks 'Cancel' in the custom picker UI.
   */
  ipcMain.on('bluetooth-device-cancel', (event) => {
    if (selectBluetoothCallback) {
      selectBluetoothCallback(''); // Empty string cancels the request
      selectBluetoothCallback = null;
    }
    if (pickerWin) {
      pickerWin.close();
    }
  });

  /**
   * Global WebContents Listener
   * Attaches to ALL webContents (including iframes/popups) to ensure we 
   * catch the 'select-bluetooth-device' event fired by navigator.bluetooth.requestDevice().
   */
  app.on('web-contents-created', (event, webContents) => {
    webContents.on('select-bluetooth-device', (event, deviceList, callback) => {
      event.preventDefault(); // Prevent Electron from automatically selecting a device
      selectBluetoothCallback = callback;
      currentDeviceList = deviceList;

      // Create a secondary floating window for the Bluetooth picker if it doesn't exist
      if (!pickerWin) {
        pickerWin = new BrowserWindow({
          parent: mb.window,
          modal: true,
          width: 320,
          height: 400,
          show: false,
          webPreferences: {
            nodeIntegration: true, // Required to use ipcRenderer in the picker window
            contextIsolation: false
          }
        });

        pickerWin.loadFile(path.join(__dirname, 'picker.html'));

        pickerWin.once('ready-to-show', () => {
          pickerWin.show();
          pickerWin.webContents.send('update-devices', currentDeviceList);
        });

        // Ensure we cancel the Bluetooth request if the user closes the window manually
        pickerWin.on('closed', () => {
          pickerWin = null;
          if (selectBluetoothCallback) {
            selectBluetoothCallback('');
            selectBluetoothCallback = null;
          }
        });
      } else {
        // If window is already open, just update the list of discovered devices
        pickerWin.webContents.send('update-devices', currentDeviceList);
      }
    });

    // Intercept external links and open them in the user's default system browser
    webContents.setWindowOpenHandler(({ url }) => {
      if (!url.startsWith('https://mypixelbuds.google.com/')) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
      return { action: 'allow' };
    });
  });
});
