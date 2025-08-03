import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Mail, Lock, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";
import { FingerprintAuth } from "../lib/fingerprint";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fingerprintAvailable, setFingerprintAvailable] = useState(false);

  useEffect(() => {
    checkFingerprintAvailability();
  }, []);

  const checkFingerprintAvailability = async () => {
    try {
      const available = await FingerprintAuth.isAvailable();
      setFingerprintAvailable(available);
    } catch (err) {
      console.warn("⚠️ Fingerprint check failed:", err);
      setFingerprintAvailable(false);
    }
  };

  const login = async () => {
    if (!email.trim()) {
      alert("Please enter your email address");
      return;
    }

    if (!password.trim()) {
      alert("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Login error:", error);
        alert("Login failed: " + error.message);
        return;
      }

      // Confirm session exists
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        console.log("✅ Login successful. Redirecting to dashboard...");
        navigate("/dashboard");
      } else {
        alert("Login failed: Session not established.");
      }
    } catch (err: any) {
      console.error("❌ Login error:", err);
      alert("Login failed: " + (err.message || "Network error"));
    } finally {
      setLoading(false);
    }
  };

  const loginWithFingerprint = async () => {
    try {
      const success = await FingerprintAuth.authenticate();
      if (success) {
        await login();
      }
    } catch (error) {
      console.error("❌ Fingerprint login failed:", error);
      alert("Fingerprint login failed. Please use email and password.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      login();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Crown className="w-16 h-16 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">DreamSeller Pro</h1>
          <p className="text-blue-200">Automated Business Empire</p>
          <div className="flex items-center justify-center mt-2">
            <Sparkles className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="text-sm text-yellow-400">
              Generate Revenue Automatically
            </span>
            <Sparkles className="w-4 h-4 text-yellow-400 ml-1" />
          </div>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Password"
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>

          {/* Login Button */}
          <button
            onClick={login}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Access Dashboard"}
          </button>

          {/* Fingerprint Login */}
          {fingerprintAvailable && (
            <button
              onClick={loginWithFingerprint}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-3"
            >
              Login with Fingerprint
            </button>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-blue-200">Secure Business Platform</p>
        </div>
      </div>
    </div>
  );
}
