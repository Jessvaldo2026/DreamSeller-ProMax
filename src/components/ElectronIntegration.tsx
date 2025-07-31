import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useElectron } from '../hooks/useElectron';

export default function ElectronIntegration() {
  const navigate = useNavigate();
  const { isElectron, electronAPI } = useElectron();

  useEffect(() => {
    if (!isElectron || !electronAPI) return;

    // Listen for navigation events from main process
    electronAPI.onNavigate((route: string) => {
      navigate(route);
    });

    // Cleanup listeners on unmount
    return () => {
      electronAPI.removeAllListeners('navigate-to');
    };
  }, [isElectron, electronAPI, navigate]);

  // Add desktop-specific features
  useEffect(() => {
    if (!isElectron) return;

    // Add desktop app class to body
    document.body.classList.add('electron-app');

    // Handle keyboard shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + R for refresh
      if ((event.metaKey || event.ctrlKey) && event.key === 'r') {
        event.preventDefault();
        window.location.reload();
      }

      // Cmd/Ctrl + Shift + I for dev tools (development only)
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'I') {
        if (process.env.NODE_ENV === 'development') {
          // Dev tools will be handled by Electron
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('electron-app');
    };
  }, [isElectron]);

  // Show desktop-specific UI elements
  if (!isElectron) return null;

  return (
    <div className="electron-integration">
      {/* Desktop-specific UI elements can go here */}
      <style>{`
        .electron-app {
          /* Desktop-specific styles */
          user-select: none;
        }
        
        .electron-app input,
        .electron-app textarea {
          user-select: text;
        }
        
        /* Custom scrollbars for desktop */
        .electron-app ::-webkit-scrollbar {
          width: 8px;
        }
        
        .electron-app ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        .electron-app ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        
        .electron-app ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}