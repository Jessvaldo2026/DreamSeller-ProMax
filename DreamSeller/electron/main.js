const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

class DreamSellerApp {
  constructor() {
    this.mainWindow = null;
    this.splashWindow = null;
    this.isQuitting = false;
  }

  async createSplashWindow() {
    this.splashWindow = new BrowserWindow({
      width: 400,
      height: 300,
      frame: false,
      alwaysOnTop: true,
      transparent: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    // Create splash screen HTML
    const splashHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: white;
          }
          .logo {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .subtitle {
            font-size: 14px;
            opacity: 0.8;
            margin-bottom: 30px;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="logo">👑</div>
        <div class="title">DreamSeller Pro</div>
        <div class="subtitle">Automated Business Empire</div>
        <div class="spinner"></div>
      </body>
      </html>
    `;

    this.splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHTML)}`);
    
    // Auto-hide splash after 3 seconds
    setTimeout(() => {
      if (this.splashWindow && !this.splashWindow.isDestroyed()) {
        this.splashWindow.close();
      }
    }, 3000);
  }

  async createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 800,
      show: false, // Don't show until ready
      icon: path.join(__dirname, '../public/crown.svg'),
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: true,
        allowRunningInsecureContent: false
      }
    });

    // Load the app
    const startUrl = isDev 
      ? 'http://localhost:5173' 
      : `file://${path.join(__dirname, '../dist/index.html')}`;
    
    await this.mainWindow.loadURL(startUrl);
    
    // Alternative method for production builds
    if (!isDev) {
      this.mainWindow.loadFile('dist/index.html');
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      if (this.splashWindow && !this.splashWindow.isDestroyed()) {
        this.splashWindow.close();
      }
      this.mainWindow.show();
      
      if (isDev) {
        this.mainWindow.webContents.openDevTools();
      }
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Handle external links
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    // Prevent navigation to external sites
    this.mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl);
      
      if (parsedUrl.origin !== 'http://localhost:5173' && 
          parsedUrl.origin !== 'file://') {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    });
  }

  createMenu() {
    const template = [
      {
        label: 'DreamSeller Pro',
        submenu: [
          {
            label: 'About DreamSeller Pro',
            click: () => {
              dialog.showMessageBox(this.mainWindow, {
                type: 'info',
                title: 'About DreamSeller Pro',
                message: 'DreamSeller Pro v1.0.0',
                detail: 'Automated Business Empire Platform\n\nTransform any project into a revenue-generating business with AI-powered automation.',
                buttons: ['OK']
              });
            }
          },
          { type: 'separator' },
          {
            label: 'Preferences...',
            accelerator: 'CmdOrCtrl+,',
            click: () => {
              this.mainWindow.webContents.send('navigate-to', '/settings');
            }
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              this.isQuitting = true;
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Business',
        submenu: [
          {
            label: 'Dashboard',
            accelerator: 'CmdOrCtrl+D',
            click: () => {
              this.mainWindow.webContents.send('navigate-to', '/dashboard');
            }
          },
          {
            label: 'Generate New Business',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.mainWindow.webContents.send('navigate-to', '/generate');
            }
          },
          {
            label: 'Deploy App',
            accelerator: 'CmdOrCtrl+Shift+D',
            click: () => {
              this.mainWindow.webContents.send('navigate-to', '/deploy');
            }
          },
          { type: 'separator' },
          {
            label: 'Earnings Dashboard',
            accelerator: 'CmdOrCtrl+E',
            click: () => {
              this.mainWindow.webContents.send('navigate-to', '/earnings');
            }
          },
          {
            label: 'Withdrawals',
            accelerator: 'CmdOrCtrl+W',
            click: () => {
              this.mainWindow.webContents.send('navigate-to', '/withdrawals');
            }
          }
        ]
      },
      {
        label: 'Tools',
        submenu: [
          {
            label: 'Bulk Emailer',
            click: () => {
              this.mainWindow.webContents.send('navigate-to', '/bulk-email');
            }
          },
          {
            label: 'Product Generator',
            click: () => {
              this.mainWindow.webContents.send('navigate-to', '/products');
            }
          },
          {
            label: 'Marketing Tools',
            click: () => {
              this.mainWindow.webContents.send('navigate-to', '/marketing');
            }
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' },
          ...(process.platform === 'darwin' ? [
            { type: 'separator' },
            { role: 'front' }
          ] : [])
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Visit Website',
            click: () => {
              shell.openExternal('https://dreamsellers.org');
            }
          },
          {
            label: 'Documentation',
            click: () => {
              shell.openExternal('https://docs.dreamsellers.org');
            }
          },
          {
            label: 'Support',
            click: () => {
              shell.openExternal('mailto:support@dreamsellers.org');
            }
          },
          { type: 'separator' },
          {
            label: 'Report Issue',
            click: () => {
              shell.openExternal('https://github.com/dreamsellers/issues');
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  setupIPC() {
    // Handle app info requests
    ipcMain.handle('get-app-info', () => {
      return {
        name: app.getName(),
        version: app.getVersion(),
        platform: process.platform,
        arch: process.arch
      };
    });

    // Handle file operations
    ipcMain.handle('show-save-dialog', async (event, options) => {
      const result = await dialog.showSaveDialog(this.mainWindow, options);
      return result;
    });

    ipcMain.handle('show-open-dialog', async (event, options) => {
      const result = await dialog.showOpenDialog(this.mainWindow, options);
      return result;
    });

    // Handle notifications
    ipcMain.handle('show-notification', (event, title, body) => {
      new Notification(title, { body });
    });

    // Handle external links
    ipcMain.handle('open-external', (event, url) => {
      shell.openExternal(url);
    });

    // Handle app updates
    ipcMain.handle('check-for-updates', async () => {
      // Implement auto-updater logic here
      return { hasUpdate: false, version: '1.0.0' };
    });
  }

  async initialize() {
    // Wait for app to be ready
    await app.whenReady();

    // Create splash screen
    await this.createSplashWindow();

    // Create main window
    await this.createMainWindow();

    // Setup menu
    this.createMenu();

    // Setup IPC handlers
    this.setupIPC();

    // Handle app activation (macOS)
    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await this.createMainWindow();
      }
    });

    // Handle window all closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin' || this.isQuitting) {
        app.quit();
      }
    });

    // Handle before quit
    app.on('before-quit', () => {
      this.isQuitting = true;
    });

    // Security: Prevent new window creation
    app.on('web-contents-created', (event, contents) => {
      contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      });
    });

    console.log('🚀 DreamSeller Pro Desktop App Started Successfully!');
  }
}

// Create and initialize the app
const dreamSellerApp = new DreamSellerApp();
dreamSellerApp.initialize().catch(console.error);

// Handle certificate errors
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    // In development, ignore certificate errors
    event.preventDefault();
    callback(true);
  } else {
    // In production, use default behavior
    callback(false);
  }
});

// Handle app protocol for deep linking
app.setAsDefaultProtocolClient('dreamseller');

// Handle protocol URLs (deep linking)
app.on('open-url', (event, url) => {
  event.preventDefault();
  console.log('Deep link received:', url);
  // Handle deep link navigation
});