import React, { useState, useEffect } from 'react';
import { Code, Zap, DollarSign, Users, Download, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ClientProject {
  id: string;
  client_email: string;
  project_name: string;
  requirements: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delivered';
  price: number;
  progress: number;
  delivery_date: Date;
  app_url?: string;
  download_links: { [platform: string]: string };
  created_at: Date;
}

export default function AIAppGenerator() {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [clientEmail, setClientEmail] = useState('');
  const [projectName, setProjectName] = useState('');
  const [requirements, setRequirements] = useState('');
  const [price, setPrice] = useState(500);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadClientProjects();
  }, []);

  const loadClientProjects = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('client_projects')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Failed to load client projects:', error);
    }
  };

  const createClientProject = async () => {
    if (!clientEmail || !projectName || !requirements) {
      alert('Please fill in all fields');
      return;
    }

    setIsCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days delivery

      const { data, error } = await supabase
        .from('client_projects')
        .insert({
          user_id: session.user.id,
          client_email: clientEmail,
          project_name: projectName,
          requirements,
          price,
          status: 'pending',
          progress: 0,
          delivery_date: deliveryDate.toISOString(),
          download_links: {}
        })
        .select()
        .single();

      if (error) throw error;

      // Send client notification email
      await fetch('/api/send-client-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientEmail,
          projectName,
          price,
          deliveryDate: deliveryDate.toISOString()
        })
      });

      setProjects(prev => [data, ...prev]);
      setClientEmail('');
      setProjectName('');
      setRequirements('');
      alert('Client project created and notification sent!');
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const startProjectDevelopment = async (projectId: string) => {
    try {
      await supabase
        .from('client_projects')
        .update({ status: 'in_progress', progress: 10 })
        .eq('id', projectId);

      // Start AI development process
      await fetch('/api/ai/develop-client-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });

      loadClientProjects();
    } catch (error) {
      console.error('Failed to start development:', error);
    }
  };

  const deliverProject = async (projectId: string) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      await supabase
        .from('client_projects')
        .update({ 
          status: 'delivered',
          progress: 100,
          app_url: `https://${project.project_name.toLowerCase()}.dreamsellers.org`
        })
        .eq('id', projectId);

      // Send delivery email to client
      await fetch('/api/send-delivery-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientEmail: project.client_email,
          projectName: project.project_name,
          appUrl: `https://${project.project_name.toLowerCase()}.dreamsellers.org`,
          downloadLinks: project.download_links
        })
      });

      loadClientProjects();
      alert('Project delivered to client!');
    } catch (error) {
      console.error('Failed to deliver project:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">AI App Generator for Clients</h2>
          <p className="text-blue-200">Sell done-for-you apps to clients</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-blue-200">Total Revenue</p>
          <p className="text-2xl font-bold text-green-400">
            ${projects.filter(p => p.status === 'delivered').reduce((sum, p) => sum + p.price, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Create New Project */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Create Client Project</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Client Email</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="client@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Client Business App"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Price ($)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              min="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Requirements</label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Describe what the client needs..."
              rows={3}
            />
          </div>
        </div>
        <button
          onClick={createClientProject}
          disabled={isCreating}
          className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
        >
          {isCreating ? 'Creating...' : 'Create Project'}
        </button>
      </div>

      {/* Client Projects */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Client Projects</h3>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-white font-semibold">{project.project_name}</h4>
                  <p className="text-sm text-blue-200">{project.client_email}</p>
                  <p className="text-xs text-gray-400">{project.requirements}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">${project.price}</p>
                  <p className={`text-sm ${
                    project.status === 'completed' ? 'text-green-400' :
                    project.status === 'in_progress' ? 'text-blue-400' :
                    project.status === 'delivered' ? 'text-purple-400' :
                    'text-yellow-400'
                  }`}>
                    {project.status.replace('_', ' ')}
                  </p>
                </div>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              
              <div className="flex space-x-2">
                {project.status === 'pending' && (
                  <button
                    onClick={() => startProjectDevelopment(project.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Start Development
                  </button>
                )}
                {project.status === 'completed' && (
                  <button
                    onClick={() => deliverProject(project.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Deliver to Client
                  </button>
                )}
                {project.app_url && (
                  <a
                    href={project.app_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                  >
                    View App
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}