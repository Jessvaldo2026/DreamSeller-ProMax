import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Crown, UserCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function InviteAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    validateInvitation();
  }, [token]);

  const validateInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (error || !data) {
        setError('Invalid or expired invitation');
        setLoading(false);
        return;
      }

      // Check if invitation is expired
      if (new Date(data.expires_at) < new Date()) {
        setError('This invitation has expired');
        setLoading(false);
        return;
      }

      setInvitation(data);
      setEmail(data.email);
      setLoading(false);

    } catch (error) {
      console.error('Failed to validate invitation:', error);
      setError('Failed to validate invitation');
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!email || !password || !fullName) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: invitation.role
          }
        }
      });

      if (authError) throw authError;

      // Mark invitation as accepted
      await supabase
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      // Create user profile
      if (authData.user) {
        await supabase
          .from('users')
          .insert({
            auth_id: authData.user.id,
            email,
            full_name: fullName,
            role: invitation.role
          });
      }

      alert('Account created successfully! You can now log in.');
      navigate('/');

    } catch (error) {
      console.error('Failed to accept invitation:', error);
      alert('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center border border-white/20">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Invitation Error</h1>
          <p className="text-blue-200 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to DreamSeller Pro</h1>
          <p className="text-blue-200">You've been invited to join as a {invitation?.role}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
            />
          </div>

          <button
            onClick={acceptInvitation}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <UserCheck className="w-5 h-5" />
            <span>Accept Invitation & Create Account</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-blue-200">
            By accepting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}