import React, { useState, useEffect } from 'react';
import { Download, DollarSign, FileText, Music, Code, Image } from 'lucide-react';
import { DigitalProduct } from '../../lib/businessModules';
import { supabase } from '../../lib/supabase';

export default function DigitalStoreModule() {
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRealData();
    autoSignupPlatforms();
  }, []);

  const loadRealData = async () => {
    try {
      const { data: digitalProducts, error } = await supabase
        .from('digital_products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const realProducts = digitalProducts || [];
      setProducts(realProducts);
      
      const sales = realProducts.reduce((sum, product) => sum + (product.sales || 0), 0);
      const revenue = realProducts.reduce((sum, product) => sum + ((product.sales || 0) * product.price), 0);
      
      setTotalSales(sales);
      setTotalRevenue(revenue);
    } catch (error) {
      console.error('Failed to load digital products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const autoSignupPlatforms = async () => {
    const platforms = [
      { name: 'Gumroad', url: 'https://gumroad.com' },
      { name: 'Etsy Digital', url: 'https://etsy.com' },
      { name: 'Creative Market', url: 'https://creativemarket.com' },
      { name: 'Envato Market', url: 'https://market.envato.com' }
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
            businessType: 'digital_store'
          })
        });
      } catch (error) {
        console.error(`Auto-signup failed for ${platform.name}:`, error);
      }
    }
  };
  const getProductIcon = (type: string) => {
    switch (type) {
      case 'ebook': return FileText;
      case 'music': return Music;
      case 'software': return Code;
      case 'template': return Image;
      default: return Download;
    }
  };

  const handleDownload = (product: DigitalProduct) => {
    // In a real app, this would handle secure download delivery
    alert(`Download link sent to customer for: ${product.name}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Digital Product Store</h2>
          <p className="text-blue-200">Sell ebooks, music, software, and templates</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Total Products</p>
              <p className="text-xl font-bold text-white">{products.length}</p>
            </div>
            <Download className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Total Sales</p>
              <p className="text-xl font-bold text-white">{totalSales}</p>
            </div>
            <FileText className="w-6 h-6 text-green-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Revenue</p>
              <p className="text-xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Digital Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => {
            const IconComponent = getProductIcon(product.type);
            return (
              <div key={product.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{product.name}</h4>
                    <p className="text-sm text-blue-200 mb-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-4">
                        <span className="text-green-400 font-semibold">${product.price}</span>
                        <span className="text-blue-300">{product.sales} sales</span>
                      </div>
                      <button
                        onClick={() => handleDownload(product)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Test Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sales Analytics */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Sales Performance</h3>
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between">
              <span className="text-white">{product.name}</span>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${(product.sales / 250) * 100}%` }}
                  ></div>
                </div>
                <span className="text-blue-200 text-sm w-16">{product.sales} sales</span>
                <span className="text-green-400 font-semibold w-20">${(product.sales * product.price).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}