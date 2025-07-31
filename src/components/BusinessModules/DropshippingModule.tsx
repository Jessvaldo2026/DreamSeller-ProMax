import React, { useState, useEffect } from 'react';
import { Package, Mail, TrendingUp, Users, Search, CheckCircle } from 'lucide-react';
import { DropshippingProduct, Supplier } from '../../lib/businessModules';
import { supabase } from '../../lib/supabase';

export default function DropshippingModule() {
  const [products, setProducts] = useState<DropshippingProduct[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [emailCampaign, setEmailCampaign] = useState({ sent: 0, responses: 0 });

  useEffect(() => {
    loadProducts();
    loadSuppliers();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('dropshipping_products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      // Set empty array on error instead of demo data
      setProducts([]);
    }
  };

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
      // Set empty array on error instead of demo data
      setSuppliers([]);
    }
  };

  const findSuppliers = async () => {
    setIsSearching(true);
    
    try {
      const response = await fetch('/api/dropshipping/find-suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categories: ['Electronics', 'Health', 'Fashion'],
          minRating: 4.0
        }),
      });

      const newSuppliers = await response.json();
      setSuppliers(prev => [...prev, ...newSuppliers]);
      alert(`Found ${newSuppliers.length} new suppliers!`);
    } catch (error) {
      console.error('Failed to find suppliers:', error);
      alert('Failed to find suppliers. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const contactSuppliers = async () => {
    try {
      const response = await fetch('/api/dropshipping/contact-suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplierIds: suppliers.map(s => s.id)
        }),
      });

      const result = await response.json();
      setEmailCampaign({ sent: result.sent, responses: result.responses });
      alert(`Email campaign sent to ${result.sent} suppliers. ${result.responses} responses received.`);
    } catch (error) {
      console.error('Failed to contact suppliers:', error);
      alert('Failed to send emails. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Smart Dropshipping</h2>
          <p className="text-blue-200">Automated supplier sourcing and order fulfillment</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={findSuppliers}
            disabled={isSearching}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Find Suppliers'}
          </button>
          <button
            onClick={contactSuppliers}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Contact All
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Active Products</p>
              <p className="text-xl font-bold text-white">{products.length}</p>
            </div>
            <Package className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Suppliers</p>
              <p className="text-xl font-bold text-white">{suppliers.length}</p>
            </div>
            <Users className="w-6 h-6 text-green-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Emails Sent</p>
              <p className="text-xl font-bold text-white">{emailCampaign.sent}</p>
            </div>
            <Mail className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Responses</p>
              <p className="text-xl font-bold text-white">{emailCampaign.responses}</p>
            </div>
            <TrendingUp className="w-6 h-6 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Winning Products */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Winning Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex space-x-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{product.name}</h4>
                  <p className="text-sm text-blue-200">Supplier: {product.supplier}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-green-400">${product.price}</span>
                    <span className="text-blue-300">{product.profitMargin}% profit</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suppliers */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Supplier Network</h3>
        <div className="space-y-3">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div>
                <h4 className="text-white font-medium">{supplier.name}</h4>
                <p className="text-sm text-blue-200">{supplier.email}</p>
                <p className="text-xs text-gray-400">{supplier.category} • {supplier.responseRate}% response rate</p>
              </div>
              <div className="flex items-center space-x-2">
                {supplier.contacted && <CheckCircle className="w-4 h-4 text-green-400" />}
                <span className="text-sm text-blue-200">{supplier.averageShipping} days shipping</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}