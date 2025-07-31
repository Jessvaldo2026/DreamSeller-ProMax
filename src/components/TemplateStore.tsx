import React, { useState, useEffect } from 'react';
import { FileText, Download, DollarSign, Star, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'website' | 'resume' | 'content' | 'email' | 'social';
  price: number;
  preview_url: string;
  download_url: string;
  downloads: number;
  rating: number;
  tags: string[];
  created_at: Date;
}

export default function TemplateStore() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    loadTemplates();
    loadRevenue();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('downloads', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadRevenue = async () => {
    try {
      const { data, error } = await supabase
        .from('template_sales')
        .select('amount')
        .eq('status', 'completed');

      if (error) throw error;
      const revenue = data?.reduce((sum, sale) => sum + sale.amount, 0) || 0;
      setTotalRevenue(revenue);
    } catch (error) {
      console.error('Failed to load revenue:', error);
    }
  };

  const purchaseTemplate = async (template: Template) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to purchase templates');
        return;
      }

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-template-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          price: template.price,
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

  const downloadTemplate = async (template: Template) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to download templates');
        return;
      }

      // Check if user has purchased this template
      const { data: purchase } = await supabase
        .from('template_sales')
        .select('*')
        .eq('template_id', template.id)
        .eq('user_id', session.user.id)
        .eq('status', 'completed')
        .single();

      if (!purchase) {
        alert('Please purchase this template first');
        return;
      }

      // Generate secure download link
      const response = await fetch('/api/templates/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          userId: session.user.id
        })
      });

      const { downloadUrl } = await response.json();
      
      // Trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${template.name}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update download count
      await supabase
        .from('templates')
        .update({ downloads: template.downloads + 1 })
        .eq('id', template.id);

    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Template Store</h2>
          <p className="text-blue-200">Professional templates for websites, resumes, and content</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-blue-200">Total Revenue</p>
          <p className="text-2xl font-bold text-green-400">${totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">All Categories</option>
              <option value="website">Website Templates</option>
              <option value="resume">Resume Templates</option>
              <option value="content">Content Packs</option>
              <option value="email">Email Templates</option>
              <option value="social">Social Media</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <img
                src={template.preview_url}
                alt={template.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
            <p className="text-sm text-blue-200 mb-3">{template.description}</p>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-green-400 font-semibold text-lg">${template.price}</span>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-yellow-400 text-sm">{template.rating}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-400 capitalize">{template.category}</span>
              <span className="text-xs text-blue-200">{template.downloads} downloads</span>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {template.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => purchaseTemplate(template)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Purchase
              </button>
              <button
                onClick={() => downloadTemplate(template)}
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