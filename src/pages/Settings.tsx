import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, User, Bell, Shield, CreditCard, Globe, Palette } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'api', label: 'API Settings', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
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
              <SettingsIcon className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">App Settings</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-600/30 text-white border border-blue-400/30'
                        : 'text-blue-200 hover:bg-white/10'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue="Business Owner"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue="goncalvesjacelina27@gmail.com"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-200 mb-2">Business Focus</label>
                      <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none">
                        <option value="ecommerce">E-commerce</option>
                        <option value="saas">SaaS Applications</option>
                        <option value="digital">Digital Services</option>
                        <option value="all">All Business Types</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Revenue Alerts</h3>
                        <p className="text-blue-200 text-sm">Get notified when revenue milestones are reached</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Business Launch</h3>
                        <p className="text-blue-200 text-sm">Notifications when new businesses go live</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">System Updates</h3>
                        <p className="text-blue-200 text-sm">Updates about new features and improvements</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white font-medium mb-2">Change Password</h3>
                      <div className="space-y-3">
                        <input
                          type="password"
                          placeholder="Current Password"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                        />
                        <input
                          type="password"
                          placeholder="New Password"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                        <p className="text-blue-200 text-sm">Add an extra layer of security</p>
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Enable
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Billing & Subscription</h2>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg p-6 border border-green-400/30">
                      <h3 className="text-xl font-bold text-white mb-2">Pro Plan</h3>
                      <p className="text-green-200 mb-4">Unlimited businesses, advanced AI, priority support</p>
                      <p className="text-2xl font-bold text-white">$99/month</p>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-4">Payment Method</h3>
                      <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                        <p className="text-white">**** **** **** 4242</p>
                        <p className="text-blue-200 text-sm">Expires 12/25</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'api' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">API Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white font-medium mb-2">API Key</h3>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value="dsp_live_sk_1234567890abcdef"
                          readOnly
                          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                        />
                        <button className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                          Copy
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-2">Webhook URL</h3>
                      <input
                        type="url"
                        placeholder="https://your-domain.com/webhook"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Appearance</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white font-medium mb-4">Theme</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg p-4 border-2 border-blue-400">
                          <p className="text-white font-medium">Dark (Current)</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4 border-2 border-transparent">
                          <p className="text-gray-800 font-medium">Light</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-2">Brand Colors</h3>
                      <div className="flex space-x-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg border-2 border-white"></div>
                        <div className="w-12 h-12 bg-purple-600 rounded-lg"></div>
                        <div className="w-12 h-12 bg-green-600 rounded-lg"></div>
                        <div className="w-12 h-12 bg-yellow-500 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-white/20">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}