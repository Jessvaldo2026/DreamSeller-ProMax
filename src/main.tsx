import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom'; // <-- CHANGED HERE
import App from './App.tsx';
import './index.css';
import { offlineManager } from './lib/offline';
import { incomeTracker } from './lib/realTimeIncome';

const initializeApp = async () => {
  try {
    await offlineManager.init();
    await incomeTracker.startTracking();
  } catch (error) {
    console.warn('App initialization warning:', error);
  }
};

initializeApp();

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <HashRouter> {/* <-- CHANGED HERE */}
        <App />
      </HashRouter>
    </StrictMode>
  );
} else {
  console.error('Root element not found!');
}
