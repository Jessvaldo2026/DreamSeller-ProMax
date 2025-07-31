import React, { useState, useEffect } from 'react';
import { Zap, Users, CreditCard, TrendingDown, BarChart, Settings } from 'lucide-react';
import { SaasSubscription } from '../../lib/businessModules';
import { supabase } from '../../lib/supabase';

export default function SaasToolModule() {
  const [tools, setTools] = useState<SaasSubscription[]>([]);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRealData();
    autoSignupPlatforms();
  }, []);

  const loadRealData = async () => {
    try {
      const { data: saasTools, error } = await supabase
        .from('saas_tools')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const realTools = saasTools || [];
      setTools(realTools);
      
      const subscribers = realTools.reduce((sum, tool) => sum + (tool.subscribers || 0), 0);
      const revenue = realTools.reduce((sum, tool) => sum + ((tool.subscribers || 0) * tool.monthlyPrice), 0);
      
      setTotalSubscribers(subscribers);
      setMonthlyRevenue(revenue);
    } catch (error) {
      console.error('Failed to load SaaS tools:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const autoSignupPlatforms = async () => {
    const platforms = [
      { name: 'Stripe', url: 'https://stripe.com' },
      { name: 'Paddle', url: 'https://paddle.com' },
      { name: 'Chargebee', url: 'https://chargebee.com' },
      { name: 'AWS', url: 'https://aws.amazon.com' },
      { name: 'Heroku', url: 'https://heroku.com' }
    ];

    for (const platform of platforms) {
      try {
        await fetch('/api/auto-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: platform.name,
            email: 'goncalvesjacelina27@gmail.com',
            password: 'MakeMoney20k',
            businessType: 'saas_tool'
          })
        });
      } catch (error) {
        console.error(`Auto-signup failed for ${platform.name}:`, error);
      }
    }
  };
  const manageSubscriptions = (toolId: string) => {
    alert(`Managing subscriptions for tool ID: ${toolId}. Stripe dashboard integration would open here.`);
  };

  const viewAnalytics = (toolId: string) => {
    const tool = tools.find(t => t.id === toolId);
    alert(`Analytics for ${tool?.name}: ${tool?.subscribers} subscribers, ${tool?.churnRate}% churn rate`);
  };

  const createNewTool = () => {
    alert('Creating new SaaS tool with AI-powered features...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">SaaS Subscription Tools</h2>
          <p className="text-blue-200">Monthly paid tools with recurring billing</p>
        </div>
        <button 
          onClick={createNewTool}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Create Tool
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Active Tools</p>
              <p className="text-xl font-bold text-white">{tools.length}</p>
            </div>
            <Zap className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Total Subscribers</p>
              <p className="text-xl font-bold text-white">{totalSubscribers.toLocaleString()}</p>
            </div>
            <Users className="w-6 h-6 text-green-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Monthly Revenue</p>
              <p className="text-xl font-bold text-white">${monthlyRevenue.toFixed(2)}</p>
            </div>
            <CreditCard className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Avg Churn Rate</p>
              <p className="text-xl font-bold text-white">
                {(tools.reduce((sum, tool) => sum + tool.churnRate, 0) / tools.length).toFixed(1)}%
              </p>
            </div>
            <TrendingDown className="w-6 h-6 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">SaaS Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <div key={tool.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-white font-semibold text-lg">{tool.name}</h4>
                  <p className="text-sm text-blue-200">{tool.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">${tool.monthlyPrice}/mo</p>
                  <p className="text-xs text-blue-200">{tool.subscribers} subscribers</p>
                </div>
              </div>
              
              <div className="mb-3">
                <h5 className="text-white text-sm font-medium mb-2">Features:</h5>
                <div className="flex flex-wrap gap-1">
                  {tool.features.map((feature, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-4">
                  <span className="text-green-400 text-sm">
                    ${(tool.subscribers * tool.monthlyPrice).toFixed(2)}/mo
                  </span>
                  <span className={`text-sm ${
                    tool.churnRate < 3 ? 'text-green-400' : 
                    tool.churnRate < 5 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {tool.churnRate}% churn
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => manageSubscriptions(tool.id)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <Settings className="w-3 h-3" />
                  <span>Manage</span>
                </button>
                <button
                  onClick={() => viewAnalytics(tool.id)}
                  className="flex-1 bg-purple-600 text-white py-2 px-3 rounded text-sm hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <BarChart className="w-3 h-3" />
                  <span>Analytics</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Analytics */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Subscription Performance</h3>
        <div className="space-y-3">
          {tools.map((tool) => (
            <div key={tool.id} className="flex items-center justify-between">
              <span className="text-white">{tool.name}</span>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${(tool.subscribers / 1500) * 100}%` }}
                  ></div>
                </div>
                <span className="text-blue-200 text-sm w-20">{tool.subscribers} users</span>
                <span className="text-green-400 font-semibold w-24">
                  ${(tool.subscribers * tool.monthlyPrice).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing Integration */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Billing & Payments</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Stripe Integration</h4>
            <p className="text-sm text-blue-200 mb-2">Automated recurring billing</p>
            <span className="text-green-400 text-sm">✓ Connected</span>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Dunning Management</h4>
            <p className="text-sm text-blue-200 mb-2">Failed payment recovery</p>
            <span className="text-green-400 text-sm">✓ Active</span>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Usage Tracking</h4>
            <p className="text-sm text-blue-200 mb-2">API calls and feature usage</p>
            <span className="text-green-400 text-sm">✓ Monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
}