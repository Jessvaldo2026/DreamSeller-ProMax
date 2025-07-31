import React, { useState, useEffect } from 'react';
import { Palette, Download, DollarSign, Zap, Image, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LogoDesign {
  id: string;
  business_name: string;
  industry: string;
  style: string;
  colors: string[];
  logo_url: string;
  brand_kit_url: string;
  price: number;
  status: 'generating' | 'completed' | 'purchased';
  created_at: Date;
}

export default function LogoBrandGenerator() {
  const [designs, setDesigns] = useState<LogoDesign[]>([]);
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [style, setStyle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail',
    'Food & Beverage', 'Real Estate', 'Consulting', 'Creative', 'Sports'
  ];

  const styles = [
    'Modern', 'Minimalist', 'Vintage', 'Bold', 'Elegant',
    'Playful', 'Professional', 'Artistic', 'Tech', 'Luxury'
  ];

  useEffect(() => {
    loadDesigns();
    loadRevenue();
  }, []);

  const loadDesigns = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('logo_designs')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDesigns(data || []);
    } catch (error) {
      console.error('Failed to load designs:', error);
    }
  };

  const loadRevenue = async () => {
    try {
      const { data, error } = await supabase
        .from('logo_sales')
        .select('amount')
        .eq('status', 'completed');

      if (error) throw error;
      const revenue = data?.reduce((sum, sale) => sum + sale.amount, 0) || 0;
      setTotalRevenue(revenue);
    } catch (error) {
      console.error('Failed to load revenue:', error);
    }
  };

  const generateLogo = async () => {
    if (!businessName || !industry || !style) {
      alert('Please fill in all fields');
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Generate logo using AI service
      const response = await fetch('/api/ai/generate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          industry,
          style,
          userId: session.user.id
        })
      });

      if (!response.ok) throw new Error('Logo generation failed');

      const result = await response.json();

      // Save to database
      const { data, error } = await supabase
        .from('logo_designs')
        .insert({
          user_id: session.user.id,
          business_name: businessName,
          industry,
          style,
          colors: result.colors,
          logo_url: result.logoUrl,
          brand_kit_url: result.brandKitUrl,
          price: 29.99,
          status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;

      setDesigns(prev => [data, ...prev]);
      setBusinessName('');
      alert('Logo generated successfully!');
    } catch (error) {
      console.error('Logo generation failed:', error);
      alert('Logo generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const purchaseDesign = async (design: LogoDesign) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to purchase');
        return;
      }

      // Create Stripe checkout
      const response = await fetch('/api/stripe/create-logo-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designId: design.id,
          price: design.price,
          userId: session.user.id
        })
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    }
  };

  const downloadDesign = async (design: LogoDesign) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if purchased
      const { data: purchase } = await supabase
        .from('logo_sales')
        .select('*')
        .eq('design_id', design.id)
        .eq('user_id', session.user.id)
        .eq('status', 'completed')
        .single();

      if (!purchase) {
        alert('Please purchase this design first');
        return;
      }

      // Generate download package
      const response = await fetch('/api/logos/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designId: design.id,
          userId: session.user.id
        })
      });

      const { downloadUrl } = await response.json();
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${design.business_name}-brand-kit.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Custom Logo & Brand Generator</h2>
          <p className="text-blue-200">AI-powered logo design with brand kits</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-blue-200">Total Revenue</p>
          <p className="text-2xl font-bold text-green-400">${totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Generator Form */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Generate New Logo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Enter business name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Select industry</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Select style</option>
              {styles.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={generateLogo}
          disabled={isGenerating}
          className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate Logo ($29.99)'}
        </button>
      </div>

      {/* Generated Designs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {designs.map((design) => (
          <div key={design.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="aspect-square mb-4 bg-white rounded-lg p-4">
              <img
                src={design.logo_url}
                alt={design.business_name}
                className="w-full h-full object-contain"
              />
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-2">{design.business_name}</h3>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-blue-200">{design.industry} • {design.style}</span>
              <span className="text-green-400 font-semibold">${design.price}</span>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {design.colors.map((color, index) => (
                <div
                  key={index}
                  className="w-6 h-6 rounded-full border-2 border-white/20"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => purchaseDesign(design)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Purchase
              </button>
              <button
                onClick={() => downloadDesign(design)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}