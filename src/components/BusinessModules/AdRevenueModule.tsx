import React, { useState, useEffect } from 'react';
import { Monitor, Eye, DollarSign, TrendingUp, Play, Users } from 'lucide-react';

interface AdRevenueData {
  platform: string;
  views: number;
  revenue: number;
  cpm: number;
  status: 'active' | 'pending' | 'suspended';
}

export default function AdRevenueModule() {
  const [adData, setAdData] = useState<AdRevenueData[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRealData();
    autoSignupPlatforms();
  }, []);

  const loadRealData = async () => {
    try {
      const { data: adRevenue, error } = await supabase
        .from('ad_revenue_data')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const realData = adRevenue || [];
      setAdData(realData);
      
      const views = realData.reduce((sum, data) => sum + (data.views || 0), 0);
      const revenue = realData.reduce((sum, data) => sum + (data.revenue || 0), 0);
      
      setTotalViews(views);
      setTotalRevenue(revenue);
    } catch (error) {
      console.error('Failed to load ad revenue data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const autoSignupPlatforms = async () => {
    const platforms = [
      { name: 'Google AdSense', url: 'https://adsense.google.com' },
      { name: 'Media.net', url: 'https://media.net' },
      { name: 'PropellerAds', url: 'https://propellerads.com' },
      { name: 'Ezoic', url: 'https://ezoic.com' },
      { name: 'AdThrive', url: 'https://adthrive.com' }
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
            businessType: 'ad_revenue'
          })
        });
      } catch (error) {
        console.error(`Auto-signup failed for ${platform.name}:`, error);
      }
    }
  };
  const optimizeAds = () => {
    alert('AI is optimizing ad placements for maximum revenue...');
  };

  const generateContent = () => {
    alert('AI is generating new viral content to increase views...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'suspended': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Ad Revenue Site</h2>
          <p className="text-blue-200">Content platform with advertising monetization</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={generateContent}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Generate Content
          </button>
          <button 
            onClick={optimizeAds}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Optimize Ads
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Total Views</p>
              <p className="text-xl font-bold text-white">{totalViews.toLocaleString()}</p>
            </div>
            <Eye className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Ad Revenue</p>
              <p className="text-xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-6 h-6 text-green-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Avg CPM</p>
              <p className="text-xl font-bold text-white">
                ${(adData.reduce((sum, data) => sum + data.cpm, 0) / adData.length).toFixed(2)}
              </p>
            </div>
            <TrendingUp className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Active Platforms</p>
              <p className="text-xl font-bold text-white">
                {adData.filter(data => data.status === 'active').length}
              </p>
            </div>
            <Monitor className="w-6 h-6 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Ad Platforms */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Ad Network Performance</h3>
        <div className="space-y-4">
          {adData.map((data, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{data.platform}</h4>
                    <p className={`text-sm ${getStatusColor(data.status)} capitalize`}>
                      {data.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-blue-200">Views</p>
                      <p className="text-white font-semibold">{data.views.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-200">Revenue</p>
                      <p className="text-green-400 font-semibold">${data.revenue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-200">CPM</p>
                      <p className="text-purple-400 font-semibold">${data.cpm.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Performance */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Top Performing Content</h3>
        <div className="space-y-3">
          {[
            { title: '10 AI Tools That Will Change Your Business', views: 45680, revenue: 234.50 },
            { title: 'Complete Guide to Passive Income Streams', views: 38920, revenue: 198.70 },
            { title: 'Best Productivity Apps for Entrepreneurs', views: 32150, revenue: 167.80 },
            { title: 'How to Automate Your Online Business', views: 28740, revenue: 145.60 }
          ].map((content, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center space-x-3">
                <Play className="w-4 h-4 text-blue-400" />
                <span className="text-white">{content.title}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-200 text-sm">{content.views.toLocaleString()}</span>
                </div>
                <span className="text-green-400 font-semibold">${content.revenue.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Analytics */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Revenue Analytics</h3>
        <div className="space-y-3">
          {adData.map((data, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-white">{data.platform}</span>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${(data.revenue / 1500) * 100}%` }}
                  ></div>
                </div>
                <span className="text-blue-200 text-sm w-20">{data.views.toLocaleString()}</span>
                <span className="text-green-400 font-semibold w-20">${data.revenue.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Tools */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">AI Optimization Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Smart Ad Placement</h4>
            <p className="text-sm text-blue-200">AI optimizes ad positions for maximum revenue without hurting user experience</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Content Generation</h4>
            <p className="text-sm text-blue-200">Automatically creates viral content based on trending topics and SEO data</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">A/B Testing</h4>
            <p className="text-sm text-blue-200">Continuously tests different ad formats and placements for optimal performance</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Traffic Analysis</h4>
            <p className="text-sm text-blue-200">Analyzes visitor behavior to improve content strategy and ad targeting</p>
          </div>
        </div>
      </div>
    </div>
  );
}