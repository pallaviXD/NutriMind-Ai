import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Activity } from 'lucide-react';

const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('No verification token found.'); return; }
    fetch(`/api/auth/verify/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) { setStatus('success'); setMessage(data.message); }
        else { setStatus('error'); setMessage(data.error); }
      })
      .catch(() => { setStatus('error'); setMessage('Connection error.'); });
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-accent-neon/10 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="glass-panel p-12 max-w-md w-full text-center relative z-10"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <Activity size={28} className="text-accent-neon" />
          <span className="text-xl font-bold">NutriMind <span className="text-accent-purple">OS</span></span>
        </div>

        {status === 'loading' && (
          <>
            <Loader2 size={48} className="animate-spin text-accent-neon mx-auto mb-4" />
            <h2 className="text-xl font-bold">Verifying your email…</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-500/10 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">Email Verified! 🎉</h2>
            <p className="text-muted text-sm mb-8">{message}</p>
            <button onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-accent-neon to-accent-purple text-white font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all"
            >Sign In Now →</button>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Verification Failed</h2>
            <p className="text-muted text-sm mb-8">{message}</p>
            <Link to="/login" className="block w-full text-center py-3 border border-border rounded-xl text-muted hover:text-foreground hover:border-accent-neon/40 transition-all">
              Back to Sign In
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
