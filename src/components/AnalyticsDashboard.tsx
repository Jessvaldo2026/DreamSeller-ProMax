import React, { useState, useEffect } from 'react';
import { BarChart, TrendingUp, TrendingDown, AlertTriangle, Target, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AnalyticsData {
  sales_trends: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  product_performance: {
    best_sellers: Array<{
      name: string;
      sales: number;
      revenue: number;
      trend: 'up' | 'down' | 'stable';
    }>;
    low_performers: Array<{
      name: string;
      sales: number;
      conversion_rate: number;
    }>;
  };
  ai_suggestions: Array<{
    type: 'price_increase' | 'price_decrease' | 'promotion' | 'restock';
    product: string;
    suggestion: string;
    potential_impact: string;
    confidence: number;
  }>;
  revenue_metrics: {
    total_revenue: number;
    growth_rate: number;
    avg_order_value: number;
    conversion_rate: number;
  };
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, [selectedTimeframe]);

  const loadAnalytics = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Load real analytics data
      const response = await fetch('/api/analytics/dashboard', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          userId: session.user.id,
          timeframe: selectedTimeframe
        })
      });

      if (!response.ok) throw new Error('Failed to load analytics');

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const implementSuggestion = async (suggestion: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch('/api/analytics/implement-suggestion', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          suggestion,
          userId: session.user.id
        })
      });

      alert(`Implemented: ${suggestion.suggestion}`);
      loadAnalytics(); // Refresh data
    } catch (error) {
      console.error('Failed to implement suggestion:', error);
      alert('Failed to implement suggestion');
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
        <p className="text-center text-blue-200">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Real-Time Analytics</h2>
          <p className="text-blue-200">Smart triggers and AI suggestions</p>
        </div>
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-400 outline-none"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${analytics.revenue_metrics.total_revenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Growth Rate</p>
              <p className="text-2xl font-bold text-white">+{analytics.revenue_metrics.growth_rate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Avg Order Value</p>
              <p className="text-2xl font-bold text-white">${analytics.revenue_metrics.avg_order_value}</p>
            </div>
            <BarChart className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Conversion Rate</p>
              <p className="text-2xl font-bold text-white">{analytics.revenue_metrics.conversion_rate}%</p>
            </div>
            <Target className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">🧠 AI Suggestions</h3>
        <div className="space-y-4">
          {analytics.ai_suggestions.map((suggestion, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">{suggestion.product}</h4>
                  <p className="text-blue-200 mb-2">{suggestion.suggestion}</p>
                  <p className="text-sm text-green-400">{suggestion.potential_impact}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${suggestion.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-white text-sm">{suggestion.confidence}%</span>
                  </div>
                  <button
                    onClick={() => implementSuggestion(suggestion)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Implement
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">📈 Best Sellers</h3>
          <div className="space-y-3">
            {analytics.product_performance.best_sellers.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-600/20 rounded-lg border border-green-400/30">
                <div>
                  <h4 className="text-white font-medium">{product.name}</h4>
                  <p className="text-sm text-green-200">{product.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">${product.revenue}</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">Hot</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">📉 Low Conversion Warnings</h3>
          <div className="space-y-3">
            {analytics.product_performance.low_performers.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-600/20 rounded-lg border border-red-400/30">
                <div>
                  <h4 className="text-white font-medium">{product.name}</h4>
                  <p className="text-sm text-red-200">{product.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-semibold">{product.conversion_rate}%</p>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">Low</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Trends Chart */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">📊 Sales Trends</h3>
        <div className="h-64 flex items-center justify-center bg-white/5 rounded-lg">
          <div className="text-center">
            <BarChart className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <p className="text-white">Interactive Sales Chart</p>
            <p className="text-blue-200 text-sm">Real-time revenue visualization</p>
          </div>
        </div>
      </div>
    </div>
  );
}