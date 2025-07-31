import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MarketingPage from '../components/MarketingPage';

export default function Marketing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
      <MarketingPage />
    </div>
  );
}