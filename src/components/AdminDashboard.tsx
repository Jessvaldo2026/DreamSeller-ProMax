import React, { useState, useEffect } from 'react';
import { Shield, Users, DollarSign, Activity, Settings, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  activeBusinesses: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalRevenue: 0,
    activeBusinesses: 0,
    systemHealth: 'healthy'
  });
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Load user stats
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, total_revenue, created_at');
      
      if (userError) throw userError;
      
      // Load business stats
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id, status, monthly_revenue');
      
      if (businessError) throw businessError;
      
      const totalRevenue = userData?.reduce((sum, user) => sum + (user.total_revenue || 0), 0) || 0;
      const activeBusinesses = businessData?.filter(b => b.status === 'active').length || 0;
      
      setStats({
        totalUsers: userData?.length || 0,
        totalRevenue,
        activeBusinesses,
        systemHealth: totalRevenue > 100000 ? 'healthy' : totalRevenue > 10000 ? 'warning' : 'critical'
      });
      
      setUsers(userData || []);
      
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }
  };

  const suspendUser = async (userId: string) => {
    try {
      await supabase
        .from('users')
        .update({ suspended: true })
        .eq('id', userId);
      
      await loadAdminData();
      alert('User suspended successfully');
    } catch (error) {
      console.error('Failed to suspend user:', error);
      alert('Failed to suspend user');
    }
  };

  const sendSystemAlert = async (message: string, type: 'error' | 'warning' | 'info') => {
    const alert: SystemAlert = {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: new Date()
    };
    
    setAlerts(prev => [alert, ...prev]);
    
    // Send to all users
    await supabase
      .from('notifications')
      .insert({
        id: crypto.randomUUID(),
        title: 'System Alert',
        message,
        type,
        created_at: new Date().toISOString()
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <div className={`px-4 py-2 rounded-lg ${
            stats.systemHealth === 'healthy' ? 'bg-green-600/20 text-green-400' :
            stats.systemHealth === 'warning' ? 'bg-yellow-600/20 text-yellow-400' :
            'bg-red-600/20 text-red-400'
          }`}>
            System: {stats.systemHealth}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200">Total Revenue</p>
                <p className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200">Active Businesses</p>
                <p className="text-2xl font-bold text-white">{stats.activeBusinesses}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200">System Alerts</p>
                <p className="text-2xl font-bold text-white">{alerts.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Management */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">User Management</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{user.email}</p>
                    <p className="text-sm text-blue-200">Revenue: ${(user.total_revenue || 0).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => suspendUser(user.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Suspend
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">System Alerts</h3>
              <button
                onClick={() => sendSystemAlert('System maintenance scheduled', 'info')}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Send Alert
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border ${
                  alert.type === 'error' ? 'bg-red-600/20 border-red-400/30' :
                  alert.type === 'warning' ? 'bg-yellow-600/20 border-yellow-400/30' :
                  'bg-blue-600/20 border-blue-400/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm">{alert.message}</p>
                    <span className="text-xs text-gray-400">
                      {alert.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Controls */}
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">System Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors">
              <Settings className="w-6 h-6 mx-auto mb-2" />
              System Settings
            </button>
            <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors">
              <Activity className="w-6 h-6 mx-auto mb-2" />
              Performance Monitor
            </button>
            <button className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors">
              <Shield className="w-6 h-6 mx-auto mb-2" />
              Security Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}