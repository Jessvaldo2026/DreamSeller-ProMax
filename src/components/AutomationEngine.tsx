import React, { useState, useEffect } from 'react';
import { Bot, Mail, FileText, Package, DollarSign, TrendingUp, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AutomationRule {
  id: string;
  name: string;
  type: 'email' | 'content' | 'pricing' | 'ads' | 'products';
  trigger: string;
  action: string;
  status: 'active' | 'paused';
  executions: number;
  last_run: Date;
  created_at: Date;
}

export default function AutomationEngine() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [newRule, setNewRule] = useState({
    name: '',
    type: 'email' as const,
    trigger: '',
    action: ''
  });

  useEffect(() => {
    loadAutomationRules();
    startAutomationEngine();
  }, []);

  const loadAutomationRules = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Failed to load automation rules:', error);
    }
  };

  const startAutomationEngine = async () => {
    // Start real automation processes
    setInterval(async () => {
      await executeAutomations();
    }, 60000); // Run every minute
  };

  const executeAutomations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Execute each active automation rule
      for (const rule of rules.filter(r => r.status === 'active')) {
        await executeRule(rule);
      }
    } catch (error) {
      console.error('Automation execution failed:', error);
    }
  };

  const executeRule = async (rule: AutomationRule) => {
    try {
      switch (rule.type) {
        case 'email':
          await executeEmailAutomation(rule);
          break;
        case 'content':
          await executeContentAutomation(rule);
          break;
        case 'pricing':
          await executePricingAutomation(rule);
          break;
        case 'ads':
          await executeAdAutomation(rule);
          break;
        case 'products':
          await executeProductAutomation(rule);
          break;
      }

      // Update execution count
      await supabase
        .from('automation_rules')
        .update({ 
          executions: rule.executions + 1,
          last_run: new Date().toISOString()
        })
        .eq('id', rule.id);

    } catch (error) {
      console.error(`Failed to execute rule ${rule.name}:`, error);
    }
  };

  const executeEmailAutomation = async (rule: AutomationRule) => {
    // Auto-responder for leads
    if (rule.trigger === 'new_lead') {
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('status', 'new')
        .is('responded_at', null);

      for (const lead of leads || []) {
        await fetch('/api/send-auto-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadEmail: lead.email,
            leadName: lead.name,
            template: rule.action
          })
        });

        await supabase
          .from('leads')
          .update({ responded_at: new Date().toISOString() })
          .eq('id', lead.id);
      }
    }
  };

  const executeContentAutomation = async (rule: AutomationRule) => {
    // Auto-generate blog content
    if (rule.trigger === 'weekly_content') {
      const response = await fetch('/api/ai/generate-blog-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: rule.action,
          includeAffiliateLinks: true
        })
      });

      const { title, content, affiliateLinks } = await response.json();

      await supabase
        .from('blog_posts')
        .insert({
          title,
          content,
          affiliate_links: affiliateLinks,
          status: 'published',
          auto_generated: true
        });
    }
  };

  const executePricingAutomation = async (rule: AutomationRule) => {
    // Auto-adjust pricing based on sales velocity
    if (rule.trigger === 'sales_velocity') {
      const { data: products } = await supabase
        .from('products')
        .select('*, sales_last_7_days');

      for (const product of products || []) {
        if (product.sales_last_7_days > 50) {
          // Increase price by 5%
          const newPrice = product.price * 1.05;
          await supabase
            .from('products')
            .update({ price: newPrice })
            .eq('id', product.id);
        } else if (product.sales_last_7_days < 5) {
          // Decrease price by 10%
          const newPrice = product.price * 0.9;
          await supabase
            .from('products')
            .update({ price: newPrice })
            .eq('id', product.id);
        }
      }
    }
  };

  const executeAdAutomation = async (rule: AutomationRule) => {
    // Auto-launch ads based on traffic/revenue
    if (rule.trigger === 'revenue_threshold') {
      const { data: businesses } = await supabase
        .from('businesses')
        .select('*')
        .gte('monthly_revenue', 5000);

      for (const business of businesses || []) {
        await fetch('/api/ads/auto-launch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: business.id,
            budget: business.monthly_revenue * 0.3, // 30% of revenue
            platforms: ['google', 'facebook']
          })
        });
      }
    }
  };

  const executeProductAutomation = async (rule: AutomationRule) => {
    // Auto-upload products from scraped suppliers
    if (rule.trigger === 'new_supplier_products') {
      const response = await fetch('/api/scrape-supplier-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId: rule.action })
      });

      const { products } = await response.json();

      for (const product of products) {
        await supabase
          .from('products')
          .insert({
            name: product.name,
            price: product.price * 1.5, // 50% markup
            supplier_id: rule.action,
            auto_imported: true
          });
      }
    }
  };

  const createAutomationRule = async () => {
    if (!newRule.name || !newRule.trigger || !newRule.action) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('automation_rules')
        .insert({
          user_id: session.user.id,
          name: newRule.name,
          type: newRule.type,
          trigger: newRule.trigger,
          action: newRule.action,
          status: 'active',
          executions: 0
        })
        .select()
        .single();

      if (error) throw error;

      setRules(prev => [data, ...prev]);
      setNewRule({ name: '', type: 'email', trigger: '', action: '' });
      alert('Automation rule created!');
    } catch (error) {
      console.error('Failed to create rule:', error);
      alert('Failed to create automation rule');
    }
  };

  const toggleRule = async (ruleId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    await supabase
      .from('automation_rules')
      .update({ status: newStatus })
      .eq('id', ruleId);

    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, status: newStatus as any } : rule
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">AI Automation Engine</h2>
          <p className="text-blue-200">Time-free execution for your business</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-blue-200">Active Rules</p>
            <p className="text-2xl font-bold text-green-400">{rules.filter(r => r.status === 'active').length}</p>
          </div>
        </div>
      </div>

      {/* Create New Rule */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Create Automation Rule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Rule Name</label>
            <input
              type="text"
              value={newRule.name}
              onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Auto-respond to leads"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Type</label>
            <select
              value={newRule.type}
              onChange={(e) => setNewRule(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="email">Email Automation</option>
              <option value="content">Content Generation</option>
              <option value="pricing">Pricing Optimization</option>
              <option value="ads">Ad Management</option>
              <option value="products">Product Management</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Trigger</label>
            <input
              type="text"
              value={newRule.trigger}
              onChange={(e) => setNewRule(prev => ({ ...prev, trigger: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="new_lead, weekly_content, sales_velocity"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Action</label>
            <input
              type="text"
              value={newRule.action}
              onChange={(e) => setNewRule(prev => ({ ...prev, action: e.target.value }))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="welcome_email, blog_post_topic, price_adjustment"
            />
          </div>
        </div>
        <button
          onClick={createAutomationRule}
          className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
        >
          Create Rule
        </button>
      </div>

      {/* Active Rules */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Automation Rules</h3>
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-white font-semibold">{rule.name}</h4>
                  <p className="text-sm text-blue-200">Type: {rule.type} • Trigger: {rule.trigger}</p>
                  <p className="text-xs text-gray-400">Action: {rule.action}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-200 text-sm">{rule.executions} executions</p>
                  <p className={`text-sm ${rule.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {rule.status}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  Last run: {rule.last_run ? new Date(rule.last_run).toLocaleString() : 'Never'}
                </span>
                <button
                  onClick={() => toggleRule(rule.id, rule.status)}
                  className={`px-3 py-1 rounded text-sm ${
                    rule.status === 'active' 
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {rule.status === 'active' ? 'Pause' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preset Automations */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Quick Setup Automations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <Mail className="w-8 h-8 text-blue-400 mb-3" />
            <h4 className="text-white font-semibold mb-2">Auto-Responder</h4>
            <p className="text-sm text-blue-200 mb-3">Automatically respond to new leads and sales inquiries</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
              Setup Now
            </button>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <FileText className="w-8 h-8 text-green-400 mb-3" />
            <h4 className="text-white font-semibold mb-2">Content Generator</h4>
            <p className="text-sm text-blue-200 mb-3">AI-generated blog posts with affiliate links</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
              Setup Now
            </button>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <DollarSign className="w-8 h-8 text-purple-400 mb-3" />
            <h4 className="text-white font-semibold mb-2">Smart Pricing</h4>
            <p className="text-sm text-blue-200 mb-3">Auto-adjust prices based on sales performance</p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm">
              Setup Now
            </button>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <Package className="w-8 h-8 text-orange-400 mb-3" />
            <h4 className="text-white font-semibold mb-2">Product Importer</h4>
            <p className="text-sm text-blue-200 mb-3">Auto-upload products from supplier feeds</p>
            <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-sm">
              Setup Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}