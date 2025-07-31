import React, { useState, useEffect } from 'react';
import { Mail, Users, Crown, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { realEmailService } from '../lib/realEmailService';

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired';
  token: string;
  invite_link: string;
  expires_at: Date;
  created_at: Date;
}

export default function AutoInviteSystem() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newInviteRole, setNewInviteRole] = useState('user');
  const [isSending, setIsSending] = useState(false);
  const [stats, setStats] = useState({
    totalSent: 0,
    totalAccepted: 0,
    pendingInvites: 0
  });

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('sender_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvitations(data || []);
      
      // Calculate stats
      const totalSent = data?.length || 0;
      const totalAccepted = data?.filter(inv => inv.status === 'accepted').length || 0;
      const pendingInvites = data?.filter(inv => inv.status === 'pending').length || 0;
      
      setStats({ totalSent, totalAccepted, pendingInvites });
    } catch (error) {
      console.error('Failed to load invitations:', error);
    }
  };

  const sendInvitation = async () => {
    if (!newInviteEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    setIsSending(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Generate invitation token and link
      const token = crypto.randomUUID();
      const inviteLink = `${window.location.origin}/invite/${token}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      // Create invitation record
      const { data: invitation, error: inviteError } = await supabase
        .from('invitations')
        .insert({
          sender_id: session.user.id,
          email: newInviteEmail.trim(),
          role: newInviteRole,
          token,
          invite_link: inviteLink,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // Send invitation email
      await realEmailService.sendInvitationEmail({
        recipientEmail: newInviteEmail.trim(),
        inviteLink,
        role: newInviteRole,
        senderName: session.user.email || 'DreamSeller Pro Team',
        senderEmail: session.user.email || 'noreply@dreamsellers.org'
      });

      // Update local state
      setInvitations(prev => [invitation, ...prev]);
      setNewInviteEmail('');
      setStats(prev => ({
        ...prev,
        totalSent: prev.totalSent + 1,
        pendingInvites: prev.pendingInvites + 1
      }));

      alert('Invitation sent successfully!');
    } catch (error) {
      console.error('Failed to send invitation:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'expired':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Crown className="w-8 h-8 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Team Invitations</h2>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <p className="text-sm text-blue-200">Total Sent</p>
            <p className="text-xl font-bold text-white">{stats.totalSent}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-blue-200">Accepted</p>
            <p className="text-xl font-bold text-green-400">{stats.totalAccepted}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-blue-200">Pending</p>
            <p className="text-xl font-bold text-yellow-400">{stats.pendingInvites}</p>
          </div>
        </div>
      </div>

      {/* Send New Invitation */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
        <h3 className="text-lg font-bold text-white mb-4">Send New Invitation</h3>
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="email"
              value={newInviteEmail}
              onChange={(e) => setNewInviteEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <select
              value={newInviteRole}
              onChange={(e) => setNewInviteRole(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>
          <button
            onClick={sendInvitation}
            disabled={isSending || !newInviteEmail.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Invite</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Invitations List */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Recent Invitations</h3>
        {invitations.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <p className="text-blue-200">No invitations sent yet</p>
            <p className="text-sm text-gray-400">Send your first invitation to grow your team</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Users className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">{invitation.email}</p>
                      <p className="text-sm text-blue-200 capitalize">{invitation.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(invitation.status)}
                        <span className={`text-sm capitalize ${getStatusColor(invitation.status)}`}>
                          {invitation.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {invitation.status === 'pending' 
                          ? `Expires ${new Date(invitation.expires_at).toLocaleDateString()}`
                          : `Sent ${new Date(invitation.created_at).toLocaleDateString()}`
                        }
                      </p>
                    </div>
                    {invitation.status === 'pending' && (
                      <button
                        onClick={() => navigator.clipboard.writeText(invitation.invite_link)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Copy Link
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}