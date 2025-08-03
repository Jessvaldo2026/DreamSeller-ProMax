
import "./lib/dailyJobs";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { offlineManager } from "./lib/offline";
import { incomeTracker } from "./lib/realTimeIncome";


async function initializeApp() {
  try {
    if (offlineManager?.init) {
      await offlineManager.init();
    }
    if (incomeTracker?.startTracking) {
      await incomeTracker.startTracking();
    }
  } catch (error) {
    console.warn("⚠️ App initialization warning:", error);
  }
}

initializeApp();

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </StrictMode>
  );
} else {
  console.error("❌ Root element not found!");
}
