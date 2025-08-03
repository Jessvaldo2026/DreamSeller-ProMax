// src/App.tsx
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";

import AIAssistant from "./components/AIAssistant";
import ElectronIntegration from "./components/ElectronIntegration";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Generator from "./pages/Generator";
import Settings from "./pages/Settings";
import Marketing from "./pages/Marketing";
import Earnings from "./pages/Earnings";
import Withdrawals from "./pages/Withdrawals";
import BulkEmail from "./pages/BulkEmail";
import Products from "./pages/Products";
import BusinessModule from "./pages/BusinessModule";
import DeployApp from "./pages/DeployApp";
import AdminDashboard from "./components/AdminDashboard";
import InviteAccept from "./pages/InviteAccept";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error("❌ Auth check failed:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Listen for authentication changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setIsAuthenticated(!!session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading DreamSeller Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ElectronIntegration />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Login />}
        />
        <Route
          path="/generate"
          element={isAuthenticated ? <Generator /> : <Login />}
        />
        <Route
          path="/settings"
          element={isAuthenticated ? <Settings /> : <Login />}
        />
        <Route
          path="/marketing"
          element={isAuthenticated ? <Marketing /> : <Login />}
        />
        <Route
          path="/earnings"
          element={isAuthenticated ? <Earnings /> : <Login />}
        />
        <Route
          path="/withdrawals"
          element={isAuthenticated ? <Withdrawals /> : <Login />}
        />
        <Route
          path="/bulk-email"
          element={isAuthenticated ? <BulkEmail /> : <Login />}
        />
        <Route
          path="/products"
          element={isAuthenticated ? <Products /> : <Login />}
        />
        <Route
          path="/business/:moduleId"
          element={isAuthenticated ? <BusinessModule /> : <Login />}
        />
        <Route
          path="/deploy"
          element={isAuthenticated ? <DeployApp /> : <Login />}
        />
        <Route
          path="/admin"
          element={isAuthenticated ? <AdminDashboard /> : <Login />}
        />
        <Route path="/invite/:token" element={<InviteAccept />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      {isAuthenticated && <AIAssistant />}
    </>
  );
}

export default App;
