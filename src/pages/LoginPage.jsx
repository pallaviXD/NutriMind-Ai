import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await login(form);
      if (data.error) {
        setError(data.error);
      } else {
        navigate(data.profileComplete ? '/' : '/setup-profile');
      }
    } catch {
      setError('Connection error. Is the server running?');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-accent-neon/8 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Activity size={36} className="text-accent-neon" />
            <span className="text-3xl font-bold">Nutri<span className="text-accent-purple">Mind</span> <span className="text-muted font-light text-xl">OS</span></span>
          </div>
          <p className="text-muted text-sm">Your AI Health Intelligence Platform</p>
        </div>

        {/* Card */}
        <div className="glass-panel p-8 border-gradient">
          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-muted text-sm mb-7">Sign in to your NutriMind account</p>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="flex items-start gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-3 mb-5 text-sm"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>{error}</div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Email</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" autoComplete="email"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-accent-neon/60 focus:ring-1 focus:ring-accent-neon/30 transition-all placeholder:text-muted/40 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-12 text-foreground focus:outline-none focus:border-accent-neon/60 focus:ring-1 focus:ring-accent-neon/30 transition-all placeholder:text-muted/40 text-sm"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-accent-neon to-accent-purple text-white font-bold py-3 rounded-xl hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in…</> : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent-neon hover:text-accent-cyan font-semibold transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
