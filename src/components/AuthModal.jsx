import React, { useState } from 'react';
import { X, User, Mail, Lock, Eye, EyeOff, Film, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';

export function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (tab === 'login') {
      if (!username.trim() || !password.trim()) {
        setError('Please enter your username/email and password.');
        return;
      }
    } else {
      if (!username.trim() || !email.trim() || !password.trim()) {
        setError('Please fill in all required fields.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    }

    setLoading(true);

    setTimeout(() => {
      const userData = {
        username: username.trim() || 'CinebyUser',
        email: email.trim() || 'user@cineby.app',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
        memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      };

      try {
        localStorage.setItem('airflix_user', JSON.stringify(userData));
      } catch (err) {
        console.error('Error saving user session:', err);
      }

      setLoading(false);
      onLoginSuccess(userData);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-[#121318] border border-white/10 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-500 mb-1 shadow-lg shadow-red-600/20">
            <Film className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-wide">
            Welcome to <span className="text-red-600">AirFlix</span>
          </h2>
          <p className="text-xs text-gray-400 font-semibold">
            {tab === 'login'
              ? 'Log in to access your Watchlist, Favorites & VidKing 4K Stream'
              : 'Create a free account to unlock Unlimited 4K Cinema Streaming'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-black/50 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              tab === 'login'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setTab('signup');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              tab === 'signup'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username/Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">
              {tab === 'login' ? 'Username or Email' : 'Username'}
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={tab === 'login' ? 'Enter username or email' : 'Choose a username'}
                className="w-full bg-black/60 border border-white/15 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Email Input for Signup */}
          {tab === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-black/60 border border-white/15 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/60 border border-white/15 focus:border-red-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/40 transition-all transform hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? (
              <Sparkles className="w-4 h-4 animate-spin text-white" />
            ) : tab === 'login' ? (
              'Log In to AirFlix'
            ) : (
              'Create Free Account'
            )}
          </button>
        </form>

        {/* Features Checklist */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-around text-[11px] text-gray-400 font-semibold">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Free Forever
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-red-500" /> VidKing 4K HD
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Instant Access
          </span>
        </div>
      </div>
    </div>
  );
}
