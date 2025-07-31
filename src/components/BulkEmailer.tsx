import React, { useState, useEffect } from 'react';
import { Mail, Upload, Send, Users, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { realEmailService } from '../lib/realEmailService';

interface Supplier {
  id: string;
  name: string;
  email: string;
  category: string;
  status: 'active' | 'inactive';
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

export default function BulkEmailer() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    }
  };
  const [emailTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Partnership Inquiry',
      subject: 'Business Partnership Opportunity - DreamSeller Pro',
      content: `Dear {{supplier_name}},

I hope this email finds you well. I'm reaching out from DreamSeller Pro, an automated business platform that helps entrepreneurs launch and scale successful e-commerce ventures.

We're currently expanding our supplier network and would love to explore a potential partnership with {{supplier_name}}. Our platform generates significant volume across multiple automated stores, and we're looking for reliable suppliers who can provide:

• Competitive wholesale pricing
• Quality products with fast shipping
• Dropshipping capabilities
• Product data feeds (CSV/API)

Would you be interested in discussing how we can work together? I'd be happy to schedule a call to explore mutual opportunities.

Best regards,
{{sender_name}}
DreamSeller Pro`
    },
    {
      id: '2',
      name: 'Product Catalog Request',
      subject: 'Product Catalog & Pricing Request',
      content: `Hello {{supplier_name}},

I'm writing to request your latest product catalog and wholesale pricing information. We operate multiple automated e-commerce stores and are always looking for new products to feature.

Could you please provide:
• Complete product catalog with images
• Wholesale pricing tiers
• Minimum order quantities
• Shipping information
• Available product data feeds

We typically process high volumes and are looking for long-term partnerships with reliable suppliers.

Thank you for your time.

Best regards,
{{sender_name}}`
    }
  ]);

  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customSubject, setCustomSubject] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [senderName, setSenderName] = useState('Business Owner');
  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState<{success: number, failed: number} | null>(null);

  const handleSupplierToggle = (supplierId: string) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId) 
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const handleSelectAll = () => {
    const activeSuppliers = suppliers.filter(s => s.status === 'active').map(s => s.id);
    setSelectedSuppliers(
      selectedSuppliers.length === activeSuppliers.length ? [] : activeSuppliers
    );
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setCustomSubject(template.subject);
      setCustomContent(template.content);
    }
  };

  const handleSendEmails = async () => {
    if (selectedSuppliers.length === 0 || !customSubject || !customContent) {
      alert('Please select suppliers and provide email content');
      return;
    }

    setIsSending(true);
    setSendResults(null);

    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Use real email service
      const result = await realEmailService.sendBulkEmails({
        user_id: session.user.id,
        subject: customSubject,
        content: customContent,
        sender_name: senderName,
        supplier_ids: selectedSuppliers,
        status: 'sending'
      });

      setSendResults({ success: result.success, failed: result.failed });
      setSelectedSuppliers([]);
    } catch (error) {
      console.error('Failed to send emails:', error);
      setSendResults({ success: 0, failed: selectedSuppliers.length });
    } finally {
      setIsSending(false);
    }
  };

  const handleImportSuppliers = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const newSuppliers: Supplier[] = [];
        
        for (let i = 1; i < lines.length; i++) { // Skip header
          const [name, email, category] = lines[i].split(',');
          if (name && email) {
            newSuppliers.push({
              id: Date.now().toString() + i,
              name: name.trim(),
              email: email.trim(),
              category: category?.trim() || 'General',
              status: 'active'
            });
          }
        }
        
        setSuppliers(prev => [...prev, ...newSuppliers]);
      };
      reader.readAsText(file);
    }
  };

  const replaceTemplateVariables = (content: string, supplier: Supplier) => {
    // Validate content is a string
    if (typeof content !== "string" || !content) {
      console.log("Invalid content: not a valid string or empty");
      return '';
    }
    
    // Validate supplier object exists
    if (!supplier) {
      console.log("Invalid supplier: supplier object is undefined");
      return content;
    }
    
    // Safe template variable replacement
    try {
      return content
        .replace(/\{\{supplier_name\}\}/g, supplier?.name || '')
        .replace(/\{\{sender_name\}\}/g, senderName || '');
    } catch (error) {
      console.error('Error replacing template variables:', error);
      return content;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Bulk Supplier Emailer</h2>
          <p className="text-blue-200">Automate outreach to suppliers and partners</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleImportSuppliers}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </label>
        </div>
      </div>

      {sendResults && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Email Campaign Complete</h3>
              <p className="text-blue-200">
                {sendResults.success} emails sent successfully, {sendResults.failed} failed
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supplier Selection */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Select Suppliers</h3>
            <button
              onClick={handleSelectAll}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              {selectedSuppliers.length === suppliers.filter(s => s.status === 'active').length ? 'Deselect All' : 'Select All Active'}
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                  supplier.status === 'active' 
                    ? 'border-white/20 hover:bg-white/5' 
                    : 'border-gray-600 opacity-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSuppliers.includes(supplier.id)}
                  onChange={() => handleSupplierToggle(supplier.id)}
                  disabled={supplier.status === 'inactive'}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium">{supplier.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      supplier.status === 'active' 
                        ? 'bg-green-600/20 text-green-400' 
                        : 'bg-gray-600/20 text-gray-400'
                    }`}>
                      {supplier.status}
                    </span>
                  </div>
                  <p className="text-sm text-blue-200">{supplier.email}</p>
                  <p className="text-xs text-gray-400">{supplier.category}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-600/20 rounded-lg border border-blue-400/30">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-blue-200 text-sm">
                {selectedSuppliers.length} suppliers selected
              </span>
            </div>
          </div>
        </div>

        {/* Email Composition */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Compose Email</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Sender Name</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Email Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
              >
                <option value="">Select a template</option>
                {emailTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Subject Line</label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Enter email subject"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Email Content</label>
              <textarea
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Enter your email content..."
                rows={12}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Use {{supplier_name}} and {{sender_name}} for personalization
              </p>
            </div>

            <button
              onClick={handleSendEmails}
              disabled={isSending || selectedSuppliers.length === 0 || !customSubject || !customContent}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send to {selectedSuppliers.length} Suppliers</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Email Templates */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Email Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emailTemplates.map((template) => (
            <div key={template.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">{template.name}</h4>
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-sm text-blue-200 mb-2">{template.subject}</p>
              <p className="text-xs text-gray-400 line-clamp-3">
                {template.content.substring(0, 150)}...
              </p>
              <button
                onClick={() => handleTemplateChange(template.id)}
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}