import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const passwordStrength = (p) => {
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score;
};

const StrengthBar = ({ password }) => {
  const score = passwordStrength(password);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-border'}`} />
        ))}
      </div>
      <p className={`text-xs mt-1 ${score >= 3 ? 'text-green-400' : score >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
        {labels[score]}
      </p>
    </div>
  );
};

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', dateOfBirth: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [canResend, setCanResend] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (passwordStrength(form.password) < 2) { setError('Please choose a stronger password.'); return; }
    setLoading(true); setError('');
    try {
      const data = await signup(form);
      if (data.success) {
        setSuccess(data.message);
        setCanResend(true);
      } else {
        setError(data.error || 'Signup failed.');
      }
    } catch {
      setError('Connection error. Is the server running?');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent-neon/10 rounded-full blur-3xl" />
        </div>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel p-10 max-w-md w-full text-center relative z-10">
          <div className="w-20 h-20 bg-accent-neon/10 border-2 border-accent-neon rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={36} className="text-accent-neon" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Check Your Email! 📬</h2>
          <p className="text-muted text-sm leading-relaxed mb-2">{success}</p>
          <p className="text-xs text-muted/60 mb-8">Check your spam/promotions folder if you don't see it within a minute.</p>
          <button onClick={() => navigate('/login')} className="w-full bg-accent-neon/10 border border-accent-neon/30 text-accent-neon py-3 rounded-xl font-semibold hover:bg-accent-neon/20 transition-all">
            Go to Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] bg-accent-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-accent-cyan/8 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Activity size={32} className="text-accent-neon" />
            <span className="text-2xl font-bold">Nutri<span className="text-accent-purple">Mind</span> OS</span>
          </div>
          <p className="text-muted text-sm">Create your free account</p>
        </div>

        <div className="glass-panel p-8">
          <h1 className="text-xl font-bold mb-6">Get Started — It's Free</h1>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-3 mb-5 text-sm"
            >
              <AlertCircle size={16} className="shrink-0" /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-neon/60 focus:ring-1 focus:ring-accent-neon/30 transition-all placeholder:text-muted/40"
              />
            </div>
            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-neon/60 focus:ring-1 focus:ring-accent-neon/30 transition-all placeholder:text-muted/40"
              />
            </div>
            {/* DOB */}
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Date of Birth</label>
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange}
                max={new Date(Date.now() - 13 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0]}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-neon/60 focus:ring-1 focus:ring-accent-neon/30 transition-all"
              />
            </div>
            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min 8 characters"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-12 text-sm text-foreground focus:outline-none focus:border-accent-neon/60 focus:ring-1 focus:ring-accent-neon/30 transition-all placeholder:text-muted/40"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <StrengthBar password={form.password} />
            </div>
            {/* Confirm Password */}
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Confirm Password</label>
              <div className="relative">
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password"
                  className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none transition-all placeholder:text-muted/40 ${
                    form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-500/50' : 'border-border focus:border-accent-neon/60 focus:ring-1 focus:ring-accent-neon/30'
                  }`}
                />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400" />
                )}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-accent-neon to-accent-purple text-white font-bold py-3 rounded-xl hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account…</> : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-neon hover:text-accent-cyan font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
