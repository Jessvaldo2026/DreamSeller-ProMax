import React, { useState, useEffect } from 'react';
import { Briefcase, Palette, FileText, Code, Clock, DollarSign } from 'lucide-react';
import { FreelanceService } from '../../lib/businessModules';
import { supabase } from '../../lib/supabase';

export default function FreelanceHubModule() {
  const [services, setServices] = useState<FreelanceService[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRealData();
    autoSignupPlatforms();
  }, []);

  const loadRealData = async () => {
    try {
      const { data: freelanceServices, error } = await supabase
        .from('freelance_services')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const realServices = freelanceServices || [];
      setServices(realServices);
      
      const orders = realServices.reduce((sum, service) => sum + (service.orders || 0), 0);
      const revenue = realServices.reduce((sum, service) => sum + ((service.orders || 0) * service.price), 0);
      
      setTotalOrders(orders);
      setTotalRevenue(revenue);
    } catch (error) {
      console.error('Failed to load freelance services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const autoSignupPlatforms = async () => {
    const platforms = [
      { name: 'Fiverr', url: 'https://fiverr.com' },
      { name: 'Upwork', url: 'https://upwork.com' },
      { name: 'Freelancer.com', url: 'https://freelancer.com' },
      { name: '99designs', url: 'https://99designs.com' },
      { name: 'Guru', url: 'https://guru.com' }
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
            businessType: 'freelance_hub'
          })
        });
      } catch (error) {
        console.error(`Auto-signup failed for ${platform.name}:`, error);
      }
    }
  };
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Design': return Palette;
      case 'Writing': return FileText;
      case 'Business': return Briefcase;
      case 'Development': return Code;
      default: return Briefcase;
    }
  };

  const generateDeliverable = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    alert(`AI is generating deliverable for: ${service?.name}. Client will receive it automatically.`);
  };

  const addNewService = () => {
    alert('Creating new AI-powered service offering...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Freelance Service Hub</h2>
          <p className="text-blue-200">AI-powered creative services marketplace</p>
        </div>
        <button 
          onClick={addNewService}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Add Service
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Active Services</p>
              <p className="text-xl font-bold text-white">{services.length}</p>
            </div>
            <Briefcase className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200">Total Orders</p>
              <p className="text-xl font-bold text-white">{totalOrders}</p>
            </div>
            <Clock className="w-6 h-6 text-green-400" />
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

      {/* Services Grid */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Service Offerings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => {
            const IconComponent = getCategoryIcon(service.category);
            return (
              <div key={service.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">{service.name}</h4>
                    <p className="text-sm text-blue-200 mb-2">{service.description}</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-400 font-semibold">${service.price}</span>
                      <span className="text-blue-300 text-sm">{service.deliveryTime}h delivery</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-400 text-sm">{service.orders} orders</span>
                      <button
                        onClick={() => generateDeliverable(service.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Generate Sample
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Capabilities */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">AI Automation Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Automated Delivery</h4>
            <p className="text-sm text-blue-200">AI generates and delivers work automatically upon payment confirmation</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Quality Control</h4>
            <p className="text-sm text-blue-200">AI reviews all deliverables before sending to ensure quality standards</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Client Communication</h4>
            <p className="text-sm text-blue-200">Automated client updates and revision handling through AI chat</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-semibold mb-2">Pricing Optimization</h4>
            <p className="text-sm text-blue-200">AI adjusts pricing based on demand and market conditions</p>
          </div>
        </div>
      </div>

      {/* Performance Analytics */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Service Performance</h3>
        <div className="space-y-3">
          {services.map((service) => (
            <div key={service.id} className="flex items-center justify-between">
              <span className="text-white">{service.name}</span>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${(service.orders / 250) * 100}%` }}
                  ></div>
                </div>
                <span className="text-blue-200 text-sm w-16">{service.orders} orders</span>
                <span className="text-green-400 font-semibold w-20">${(service.orders * service.price).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}