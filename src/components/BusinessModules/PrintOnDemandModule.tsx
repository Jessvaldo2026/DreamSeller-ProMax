import React, { useState, useEffect } from 'react';
import { Printer, Shirt, Coffee, Image, TrendingUp } from 'lucide-react';
import { PrintProduct } from '../../lib/businessModules';
import { supabase } from '../../lib/supabase';

export default function PrintOnDemandModule() {
  const [products, setProducts] = useState<PrintProduct[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRealData();
    autoSignupPlatforms();
  }, []);

  const loadRealData = async () => {
    try {
      const { data: printProducts, error } = await supabase
        .from('print_products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const realProducts = printProducts || [];
      setProducts(realProducts);
      
      const orders = realProducts.reduce((sum, product) => sum + (product.orders || 0), 0);
      const revenue = realProducts.reduce((sum, product) => sum + ((product.orders || 0) * product.price), 0);
      
      setTotalOrders(orders);
      setTotalRevenue(revenue);
    } catch (error) {
      console.error('Failed to load print products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const autoSignupPlatforms = async () => {
    const platforms = [
      { name: 'Printful', url: 'https://printful.com' },
      { name: 'Printify', url: 'https://printify.com' },
      { name: 'Gooten', url: 'https://gooten.com' },
      { name: 'Teespring', url: 'https://teespring.com' },
      { name: 'Redbubble', url: 'https://redbubble.com' }
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
            businessType: 'print_on_demand'
          })
        });
      } catch (error) {
        console.error(`Auto-signup failed for ${platform.name}:`, error);
      }
    }
  };
  const getProductIcon = (type: string) => {
    switch (type) {
      case 'tshirt': return Shirt;
      case 'mug': return Coffee;
      case 'poster': return Image;
      case 'sticker': return Image;
      default: return Printer;
    }
  };

  const generateNewDesign = () => {
    alert('AI is generating new product designs based on trending topics...');
  };

  const syncWithPrintAPI = () => {
    alert('Syncing with print fulfillment partners (Printful, Gooten, etc.)...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Print-on-Demand Store</h2>
          <p className="text-blue-200">Auto-generated products with print fulfillment</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={generateNewDesign}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Generate Design
          </button>
          <button 
            onClick={syncWithPrintAPI}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Sync Orders
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Active Products</p>
              <p className="text-xl font-bold text-white">{products.length}</p>
            </div>
            <Printer className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Total Orders</p>
              <p className="text-xl font-bold text-white">{totalOrders}</p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Revenue</p>
              <p className="text-xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
            </div>
            <Coffee className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Product Catalog</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => {
            const IconComponent = getProductIcon(product.type);
            return (
              <div key={product.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex space-x-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={product.design} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <IconComponent className="w-4 h-4 text-blue-400" />
                      <h4 className="text-white font-semibold">{product.name}</h4>
                    </div>
                    <p className="text-sm text-blue-200 capitalize mb-2">{product.type}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-green-400 font-semibold">${product.price}</span>
                      <span className="text-blue-300">{product.orders} orders</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Print Partners */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Print Fulfillment Partners</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Printful</h4>
            <p className="text-sm text-blue-200 mb-2">T-shirts, Hoodies, Mugs</p>
            <div className="flex justify-between">
              <span className="text-green-400 text-sm">Connected</span>
              <span className="text-blue-300 text-sm">2-3 days</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Gooten</h4>
            <p className="text-sm text-blue-200 mb-2">Posters, Canvas, Stickers</p>
            <div className="flex justify-between">
              <span className="text-green-400 text-sm">Connected</span>
              <span className="text-blue-300 text-sm">1-2 days</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Printify</h4>
            <p className="text-sm text-blue-200 mb-2">Phone Cases, Bags</p>
            <div className="flex justify-between">
              <span className="text-yellow-400 text-sm">Setup Required</span>
              <span className="text-blue-300 text-sm">3-5 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Performance */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Sales Performance</h3>
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between">
              <span className="text-white">{product.name}</span>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{ width: `${(product.orders / 250) * 100}%` }}
                  ></div>
                </div>
                <span className="text-blue-200 text-sm w-16">{product.orders} orders</span>
                <span className="text-green-400 font-semibold w-20">${(product.orders * product.price).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}