import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Globe, Download, Play, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GeneratedApp {
  id: string;
  user_id: string;
  name: string;
  description: string;
  status: 'generating' | 'completed' | 'deployed' | 'failed';
  platforms: string[];
  visibility: 'private' | 'public';
  target_audience?: string;
  preview_url?: string;
  download_links: { [platform: string]: string };
  revenue: number;
  views: number;
  active_users: number;
  business_id?: string;
  project_type: string;
  created_at: Date;
}

export default function GeneratedAppsDisplay() {
  const [apps, setApps] = useState<GeneratedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);
  const [updatingVisibility, setUpdatingVisibility] = useState<string | null>(null);

  useEffect(() => {
    loadGeneratedApps();
  }, []);

  const loadGeneratedApps = async () => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No user session found');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('generated_apps')
        .select(`
          *,
          businesses!inner(
            name,
            description,
            business_type,
            status,
            website_url,
            monthly_revenue
          ),
          app_analytics!left(
            views,
            active_users
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Process data with analytics
      const processedApps = (data || []).map(app => ({
        ...app,
        name: app.businesses?.name || app.name,
        description: app.businesses?.description || app.description,
        revenue: app.businesses?.monthly_revenue || 0,
        views: app.app_analytics?.[0]?.views || 0,
        active_users: app.app_analytics?.[0]?.active_users || 0,
        preview_url: app.businesses?.website_url || app.preview_url
      }));
      
      setApps(processedApps);
    } catch (error) {
      console.error('Failed to load generated apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadApp = async (app: GeneratedApp, platform: string) => {
    const downloadUrl = app.download_links[platform];
    if (!downloadUrl) {
      // Generate download for the platform if not available
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          alert('Please log in to download apps');
          return;
        }

        const response = await fetch('/api/apps/generate-download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            appId: app.id,
            platform,
            userId: session.user.id
          })
        });

        if (!response.ok) {
          throw new Error('Failed to generate download');
        }

        const result = await response.json();
        
        // Update app with new download link
        await supabase
          .from('generated_apps')
          .update({
            download_links: {
              ...app.download_links,
              [platform]: result.downloadUrl
            }
          })
          .eq('id', app.id);

        // Trigger download
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = `${app.name}-${platform}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Reload apps to show updated download links
        loadGeneratedApps();
        
      } catch (error) {
        console.error('Failed to generate download:', error);
        alert('Failed to generate download. Please try again.');
      }
      return;
    }

    // Trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${app.name}-${platform}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteApp = async (appId: string) => {
    if (!confirm('Are you sure you want to permanently delete this app? This action cannot be undone.')) return;

    setDeletingAppId(appId);
    
    try {
      // Also delete related business if it exists
      const app = apps.find(a => a.id === appId);
      if (app?.business_id) {
        await supabase
          .from('businesses')
          .delete()
          .eq('id', app.business_id);
      }

      const { error } = await supabase
        .from('generated_apps')
        .delete()
        .eq('id', appId);

      if (error) throw error;
      
      setApps(prev => prev.filter(app => app.id !== appId));
      alert('App deleted successfully');
    } catch (error) {
      console.error('Failed to delete app:', error);
      alert('Failed to delete app');
    } finally {
      setDeletingAppId(null);
    }
  };

  const toggleVisibility = async (appId: string, currentVisibility: string) => {
    setUpdatingVisibility(appId);
    
    try {
      const newVisibility = currentVisibility === 'private' ? 'public' : 'private';
      
      const { error } = await supabase
        .from('generated_apps')
        .update({ visibility: newVisibility })
        .eq('id', appId);

      if (error) throw error;
      
      setApps(prev => prev.map(app => 
        app.id === appId 
          ? { ...app, visibility: newVisibility as 'private' | 'public' }
          : app
      ));

      // Track analytics for public apps
      if (newVisibility === 'public') {
        await supabase
          .from('app_analytics')
          .upsert({
            app_id: appId,
            views: 0,
            active_users: 0,
            last_updated: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Failed to update visibility:', error);
      alert('Failed to update app visibility');
    } finally {
      setUpdatingVisibility(null);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ios':
      case 'android':
        return Smartphone;
      case 'windows':
      case 'macos':
        return Monitor;
      case 'web':
      case 'pwa':
        return Globe;
      default:
        return Download;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    return visibility === 'public' 
      ? 'bg-green-600/20 text-green-400 border-green-400/30'
      : 'bg-blue-600/20 text-blue-400 border-blue-400/30';
  };

  const getAudienceLabel = (appName: string) => {
    const name = appName.toLowerCase();
    if (name.includes('dropshipping') || name.includes('store') || name.includes('shop')) return 'Customers';
    if (name.includes('course') || name.includes('education') || name.includes('learning')) return 'Students';
    if (name.includes('print') || name.includes('design')) return 'Buyers';
    if (name.includes('freelance') || name.includes('service')) return 'Clients';
    if (name.includes('blog') || name.includes('content')) return 'Readers';
    if (name.includes('saas') || name.includes('tool')) return 'Subscribers';
    return 'Users';
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading your generated apps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">Your Generated Apps</h2>

      {apps.length === 0 ? (
        <div className="text-center py-12">
          <Smartphone className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Apps Generated Yet</h3>
          <p className="text-blue-200 mb-4">Upload a project folder to generate your first app</p>
          <button
            onClick={() => window.location.href = '/generate'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Generate Your First App
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div key={app.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-start justify-between mb-4 relative">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{app.name}</h3>
                  <p className="text-sm text-blue-200">{app.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Type: {app.project_type}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => toggleVisibility(app.id, app.visibility)}
                      disabled={updatingVisibility === app.id}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border transition-colors ${getVisibilityColor(app.visibility)} ${
                        updatingVisibility === app.id ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'
                      }`}
                    >
                      {updatingVisibility === app.id ? (
                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                      ) : null}
                      {app.visibility.toUpperCase()}
                    </button>
                    <span className="text-xs text-gray-400">
                      {app.visibility === 'public' ? getAudienceLabel(app.name) : 'Only me'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => deleteApp(app.id)}
                    disabled={deletingAppId === app.id}
                    className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded hover:bg-red-600/20"
                    title="Delete app permanently"
                  >
                    {deletingAppId === app.id ? (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  app.status === 'completed' ? 'bg-green-600/20 text-green-400' :
                  app.status === 'deployed' ? 'bg-blue-600/20 text-blue-400' :
                  app.status === 'generating' ? 'bg-yellow-600/20 text-yellow-400' :
                  'bg-red-600/20 text-red-400'
                }`}>
                  {app.status}
                </div>
              </div>

              {/* App Analytics */}
              {app.visibility === 'public' && (app.views > 0 || app.active_users > 0) && (
                <div className="mb-4 p-3 bg-blue-600/20 rounded-lg border border-blue-400/30">
                  <p className="text-blue-400 font-semibold mb-2">Public Analytics</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-blue-200">Total Views</p>
                      <p className="text-lg font-bold text-white">{app.views.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-200">Active Users</p>
                      <p className="text-lg font-bold text-white">{app.active_users.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {app.revenue > 0 && (
                <div className="mb-4 p-3 bg-green-600/20 rounded-lg border border-green-400/30">
                  <p className="text-green-400 font-semibold">Revenue Generated</p>
                  <p className="text-2xl font-bold text-white">${app.revenue.toLocaleString()}</p>
                </div>
              )}

              {app.preview_url && (
                <div className="mb-4">
                  <a
                    href={app.preview_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>Live Preview</span>
                  </a>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-200">Available Downloads:</p>
                <div className="grid grid-cols-2 gap-2">
                  {app.platforms.map((platform) => {
                    const IconComponent = getPlatformIcon(platform);
                    return (
                      <button
                        key={platform}
                        onClick={() => downloadApp(app, platform)}
                        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-2 transition-colors"
                      >
                        <IconComponent className="w-4 h-4 text-blue-400" />
                        <span className="text-white text-sm capitalize">{platform}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-400">
                  Created: {app.created_at.toLocaleDateString()}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-500">
                      {app.platforms.length} platform{app.platforms.length !== 1 ? 's' : ''}
                    </span>
                    {app.visibility === 'public' && (
                      <span className="text-xs text-green-400">
                        Live to {getAudienceLabel(app.name)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteApp(app.id)}
                    disabled={deletingAppId === app.id}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 flex items-center space-x-1 px-2 py-1 rounded hover:bg-red-600/10"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>{deletingAppId === app.id ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}