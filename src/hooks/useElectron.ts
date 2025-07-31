import { useEffect, useState } from 'react';

interface ElectronAPI {
  getAppInfo: () => Promise<{
    name: string;
    version: string;
    platform: string;
    arch: string;
  }>;
  showSaveDialog: (options: any) => Promise<any>;
  showOpenDialog: (options: any) => Promise<any>;
  showNotification: (title: string, body: string) => Promise<void>;
  openExternal: (url: string) => Promise<void>;
  checkForUpdates: () => Promise<{ hasUpdate: boolean; version: string }>;
  onNavigate: (callback: (route: string) => void) => void;
  removeAllListeners: (channel: string) => void;
  platform: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [electronAPI, setElectronAPI] = useState<ElectronAPI | null>(null);

  useEffect(() => {
    if (window.electronAPI) {
      setIsElectron(true);
      setElectronAPI(window.electronAPI);
    }
  }, []);

  return {
    isElectron,
    electronAPI
  };
};

export default useElectron;