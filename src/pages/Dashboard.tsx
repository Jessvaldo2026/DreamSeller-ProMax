import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Crown, Zap, Settings, TrendingUp, DollarSign, Users, Rocket,
  Package, Download, FileText, Printer, Briefcase, Monitor,
  GraduationCap, Code
} from 'lucide-react';
import { businessModules } from '../lib/businessModules';
import { startBusinessModule } from '../lib/startBusinessModule';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [statsData, setStatsData] = useState({
    active: 0,
    revenue: 0,
    users: 1,
    success: 100
  });

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found, redirecting to login');
        navigate('/');
        return;
      }
      console.log('User session found:', session.user.email);
      setUser(session.user);
    } catch (error) {
      console.error('Failed to check user:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { count: active } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { data: earningsData } = await supabase
        .from('earnings')
        .select('amount')
        .eq('user_id', user.id);

      const revenue = earningsData?.reduce((sum, e) => sum + e.amount, 0) || 0;

      setStatsData({
        active: active || 0,
        revenue,
        users: 1,
        success: 100
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleWithdraw = async () => {
    const response = await fetch('/api/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user?.id,
        amount: 10.00,
        destination_account: 'acct_1RnIoULauvzkzhwQ'
      }),
    });

    const data = await response.json();

    if (data.success) {
      alert('Payout successful!');
    } else {
      alert(`Payout failed: ${data.message}`);
    }
  };

  const getModuleIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Package, Download, FileText, Printer, Briefcase,
      Zap, Monitor, GraduationCap, TrendingUp, Code
    };
    return icons[iconName] || Package;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">No user session found. Redirecting...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Active Businesses', value: statsData.active, icon: TrendingUp, color: 'text-green-500' },
    { label: 'Monthly Revenue', value: `$${statsData.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-blue-500' },
    { label: 'Total Users', value: statsData.users, icon: Users, color: 'text-purple-500' },
    { label: 'Success Rate', value: `${statsData.success}%`, icon: Rocket, color: 'text-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="w-8 h-8 text-yellow-400" />
              <h1 className="text-2xl font-bold text-white">DreamSeller Pro</h1>
            </div>
            <button
              onClick={() => navigate('/settings')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Welcome Back, Entrepreneur</h2>
          <p className="text-xl text-blue-200">Your automated business empire is generating revenue 24/7</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-4">Business Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {businessModules.map((module) => {
              const IconComponent = getModuleIcon(module.icon);
              return (
                <div
                  key={module.id}
                  onClick={async () => {
                    if (!user?.id) return alert("No user logged in");

                    if (module.id === 'dropshipping') {
                      const { launchSmartDropshipping } = await import('../lib/smartDropshippingController');
                      await launchSmartDropshipping();
                    }

                    await startBusinessModule(module.id as any, user.id);
                    navigate(`/business/${module.id}`);
                  }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-200 cursor-pointer transform hover:scale-105"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm">{module.name}</h4>
                      <p className="text-xs text-blue-200">{module.category}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      module.status === 'active' ? 'bg-green-600/20 text-green-400' :
                      module.status === 'setup' ? 'bg-yellow-600/20 text-yellow-400' :
                      'bg-gray-600/20 text-gray-400'
                    }`}>
                      {module.status}
                    </span>
                    <span className="text-green-400 font-semibold text-sm">
                      ${module.monthlyRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={handleWithdraw}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg"
          >
            Withdraw Earnings
          </button>
        </div>
      </div>
    </div>
  );
}


