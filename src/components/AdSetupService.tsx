import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, DollarSign, Users, BarChart, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdPlan {
  id: string;
  client_email: string;
  business_name: string;
  budget: number;
  platforms: string[];
  target_audience: string;
  goals: string;
  plan_type: 'basic' | 'premium' | 'enterprise';
  price: number;
  status: 'pending' | 'active' | 'completed';
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    roas: number;
  };
  created_at: Date;
}

export default function AdSetupService() {
  const [plans, setPlans] = useState<AdPlan[]>([]);
  const [clientEmail, setClientEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [budget, setBudget] = useState(1000);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState('');
  const [goals, setGoals] = useState('');
  const [planType, setPlanType] = useState<'basic' | 'premium' | 'enterprise'>('basic');
  const [totalRevenue, setTotalRevenue] = useState(0);

  const platforms = [
    { id: 'google', name: 'Google Ads', icon: '🔍' },
    { id: 'facebook', name: 'Facebook Ads', icon: '📘' },
    { id: 'instagram', name: 'Instagram Ads', icon: '📸' },
    { id: 'tiktok', name: 'TikTok Ads', icon: '🎵' },
    { id: 'linkedin', name: 'LinkedIn Ads', icon: '💼' },
    { id: 'twitter', name: 'Twitter Ads', icon: '🐦' }
  ];

  const planPrices = {
    basic: 297,
    premium: 597,
    enterprise: 1297
  };

  useEffect(() => {
    loadAdPlans();
    loadRevenue();
  }, []);

  const loadAdPlans = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('ad_plans')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Failed to load ad plans:', error);
    }
  };

  const loadRevenue = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_plan_sales')
        .select('amount')
        .eq('status', 'completed');

      if (error) throw error;
      const revenue = data?.reduce((sum, sale) => sum + sale.amount, 0) || 0;
      setTotalRevenue(revenue);
    } catch (error) {
      console.error('Failed to load revenue:', error);
    }
  };

  const createAdPlan = async () => {
    if (!clientEmail || !businessName || selectedPlatforms.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ad_plans')
        .insert({
          user_id: session.user.id,
          client_email: clientEmail,
          business_name: businessName,
          budget,
          platforms: selectedPlatforms,
          target_audience: targetAudience,
          goals,
          plan_type: planType,
          price: planPrices[planType],
          status: 'pending',
          performance: {
            impressions: 0,
            clicks: 0,
            conversions: 0,
            roas: 0
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Send client proposal email
      await fetch('/api/send-ad-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientEmail,
          businessName,
          planType,
          price: planPrices[planType],
          platforms: selectedPlatforms
        })
      });

      setPlans(prev => [data, ...prev]);
      setClientEmail('');
      setBusinessName('');
      setSelectedPlatforms([]);
      setTargetAudience('');
      setGoals('');
      alert('Ad plan created and proposal sent to client!');
    } catch (error) {
      console.error('Failed to create ad plan:', error);
      alert('Failed to create ad plan');
    }
  };

  const launchAdCampaign = async (planId: string) => {
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      // Launch ads on selected platforms
      const response = await fetch('/api/ads/launch-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          platforms: plan.platforms,
          budget: plan.budget,
          targetAudience: plan.target_audience
        })
      });

      if (!response.ok) throw new Error('Campaign launch failed');

      await supabase
        .from('ad_plans')
        .update({ status: 'active' })
        .eq('id', planId);

      loadAdPlans();
      alert('Ad campaign launched successfully!');
    } catch (error) {
      console.error('Failed to launch campaign:', error);
      alert('Failed to launch campaign');
    }
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Ad Setup Service</h2>
          <p className="text-blue-200">Sell ad optimization plans to clients</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-blue-200">Total Revenue</p>
          <p className="text-2xl font-bold text-green-400">${totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Create Ad Plan */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Create Ad Plan for Client</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Client Email</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="client@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Client's business"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Monthly Budget ($)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              min="500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Plan Type</label>
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value as any)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="basic">Basic - $297</option>
              <option value="premium">Premium - $597</option>
              <option value="enterprise">Enterprise - $1,297</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-blue-200 mb-2">Ad Platforms</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {platforms.map(platform => (
              <div
                key={platform.id}
                onClick={() => handlePlatformToggle(platform.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedPlatforms.includes(platform.id)
                    ? 'border-blue-400 bg-blue-600/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{platform.icon}</span>
                  <span className="text-white text-sm">{platform.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Target Audience</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="e.g., 25-45 year old professionals"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Campaign Goals</label>
            <input
              type="text"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="e.g., increase sales, brand awareness"
            />
          </div>
        </div>

        <button
          onClick={createAdPlan}
          className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-200"
        >
          Create Ad Plan (${planPrices[planType]})
        </button>
      </div>

      {/* Active Plans */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Client Ad Plans</h3>
        <div className="space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-white font-semibold">{plan.business_name}</h4>
                  <p className="text-sm text-blue-200">{plan.client_email}</p>
                  <p className="text-xs text-gray-400">Budget: ${plan.budget}/month • {plan.plan_type}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">${plan.price}</p>
                  <p className={`text-sm ${
                    plan.status === 'active' ? 'text-green-400' :
                    plan.status === 'completed' ? 'text-purple-400' :
                    'text-yellow-400'
                  }`}>
                    {plan.status}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {plan.platforms.map(platformId => {
                  const platform = platforms.find(p => p.id === platformId);
                  return (
                    <span key={platformId} className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                      {platform?.icon} {platform?.name}
                    </span>
                  );
                })}
              </div>

              {plan.status === 'active' && (
                <div className="grid grid-cols-4 gap-4 mb-3 text-center">
                  <div>
                    <p className="text-xs text-blue-200">Impressions</p>
                    <p className="text-white font-semibold">{plan.performance.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-200">Clicks</p>
                    <p className="text-white font-semibold">{plan.performance.clicks.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-200">Conversions</p>
                    <p className="text-white font-semibold">{plan.performance.conversions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-200">ROAS</p>
                    <p className="text-white font-semibold">{plan.performance.roas.toFixed(2)}x</p>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                {plan.status === 'pending' && (
                  <button
                    onClick={() => launchAdCampaign(plan.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Launch Campaign
                  </button>
                )}
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                  View Analytics
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}