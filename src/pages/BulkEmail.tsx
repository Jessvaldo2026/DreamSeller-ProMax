import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import BulkEmailer from '../components/BulkEmailer';

export default function BulkEmail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
              <Mail className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Bulk Supplier Emailer</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <BulkEmailer />
      </div>
    </div>
  );
}