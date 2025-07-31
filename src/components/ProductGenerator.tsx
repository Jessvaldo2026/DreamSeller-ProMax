import React, { useState } from 'react';
import { Sparkles, Wand2, ShoppingBag, TrendingUp, Image, DollarSign, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { realProductService } from '../lib/realProductService';

interface GeneratedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  imageUrl: string;
  profitMargin: number;
  demandScore: number;
}

export default function ProductGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProducts, setGeneratedProducts] = useState<GeneratedProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [keywords, setKeywords] = useState('');

  const categories = [
    'Electronics & Tech',
    'Fashion & Apparel',
    'Home & Garden',
    'Health & Beauty',
    'Sports & Fitness',
    'Toys & Games',
    'Books & Media',
    'Automotive',
    'Pet Supplies',
    'Office Supplies'
  ];

  const handleGenerate = async () => {
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Get user session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Use real product service
      const result = await realProductService.generateProducts({
        category: selectedCategory,
        targetAudience,
        priceRange,
        keywords,
        userId: session.user.id
      });
      
      setGeneratedProducts(result.products || []);
      
      // Show success message
      alert(`Successfully generated ${result.products?.length || 0} products!`);
      
    } catch (error) {
      console.error('Failed to generate products:', error);
      alert(`Product generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportProduct = async (product: GeneratedProduct) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to export products');
        return;
      }

      // Use real product service for export
      const result = await realProductService.exportToEcommerce(
        product,
        ['shopify', 'woocommerce', 'amazon', 'etsy'],
        session.user.id
      );

      if (result.success.length > 0) {
        alert(`Product exported successfully to: ${result.success.join(', ')}`);
      }
      
      if (result.failed.length > 0) {
        alert(`Failed to export to: ${result.failed.join(', ')}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export product. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Smart Product Generator</h2>
          <p className="text-blue-200">AI-powered product ideas with market analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          <span className="text-white font-semibold">AI Powered</span>
        </div>
      </div>

      {/* Generation Form */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6">Generate Product Ideas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Product Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Target Audience</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., young professionals, fitness enthusiasts"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Price Range</label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
            >
              <option value="">Any price range</option>
              <option value="low">Budget ($5-$25)</option>
              <option value="medium">Mid-range ($25-$100)</option>
              <option value="high">Premium ($100+)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Keywords</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., smart, eco-friendly, portable"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !selectedCategory}
          className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating Products...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>Generate Products</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Products */}
      {generatedProducts.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6">Generated Products</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedProducts.map((product) => (
              <div key={product.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                
                <h4 className="text-lg font-semibold text-white mb-2">{product.name}</h4>
                <p className="text-sm text-blue-200 mb-4 line-clamp-3">{product.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Price:</span>
                    <span className="text-white font-semibold">${product.price}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Profit Margin:</span>
                    <span className="text-green-400 font-semibold">{product.profitMargin}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Demand Score:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${product.demandScore}%` }}
                        ></div>
                      </div>
                      <span className="text-white text-sm">{product.demandScore}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-3">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handleExportProduct(product)}
                    className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Package className="w-4 h-4" />
                    <span>Export Product</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <TrendingUp className="w-8 h-8 text-green-400 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Market Analysis</h3>
          <p className="text-blue-200 text-sm">
            AI analyzes current market trends, demand patterns, and competitor pricing to suggest profitable products.
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <DollarSign className="w-8 h-8 text-blue-400 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Profit Optimization</h3>
          <p className="text-blue-200 text-sm">
            Automatically calculates optimal pricing and profit margins based on market data and competition analysis.
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <ShoppingBag className="w-8 h-8 text-purple-400 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Multi-Platform Export</h3>
          <p className="text-blue-200 text-sm">
            Export generated products directly to Shopify, WooCommerce, Amazon, and other e-commerce platforms.
          </p>
        </div>
      </div>
    </div>
  );
}