const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  
  // File operations
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // Notifications
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  
  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Updates
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  
  // Navigation (receive from main process)
  onNavigate: (callback) => {
    ipcRenderer.on('navigate-to', (event, route) => callback(route));
  },
  
  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
  
  // Platform info
  platform: process.platform,
  
  // Version info
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});

// Security: Remove node integration
delete window.require;
delete window.exports;
delete window.module;

console.log('🔒 DreamSeller Pro Preload Script Loaded - Security Context Isolated');