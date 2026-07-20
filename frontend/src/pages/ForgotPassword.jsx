import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader } from 'lucide-react';
import logo from '../logo.png';

function ForgotPassword() {
  const navigate      = useNavigate();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-green-400 text-2xl">✓</span>
          </div>
          <h2 className="text-white text-2xl font-bold mb-3">Check your email!</h2>
          <p className="text-white/40 text-sm mb-6">
            We sent a password reset link to <span className="text-white">{email}</span>
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <img src={logo} alt="CallSense AI" className="w-12 h-12 rounded-xl object-cover mx-auto mb-4 shadow-lg" />
          <h1 className="text-white text-2xl font-bold">Forgot Password</h1>
          <p className="text-white/40 text-sm mt-1">Enter your email to reset your password</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/60 text-xs font-medium mb-1.5 block">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="john@company.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white py-2.5 rounded-lg text-sm font-medium transition-all"
            >
              {loading ? <><Loader size={14} className="animate-spin" /> Sending...</> : 'Send Reset Link'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          <button onClick={() => navigate('/login')} className="hover:text-white/40 transition-colors">
            ← Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;