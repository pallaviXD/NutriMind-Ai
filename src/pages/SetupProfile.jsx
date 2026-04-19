import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, CheckCircle2, Loader2, Dumbbell, Heart, Pill, User, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HEALTH_GOALS = [
  { key: 'gym',         icon: <Dumbbell size={22}/>, label: 'Gym & Muscle',     desc: 'High protein, caloric surplus, hypertrophy', color: 'border-blue-500/50 bg-blue-500/10 hover:border-blue-400', accent: 'text-blue-400' },
  { key: 'weight_loss', icon: <Activity size={22}/>, label: 'Weight Loss',      desc: 'Caloric deficit, fat-loss mode',              color: 'border-orange-500/50 bg-orange-500/10 hover:border-orange-400', accent: 'text-orange-400' },
  { key: 'diabetes',    icon: <Pill size={22}/>,     label: 'Diabetes Care',    desc: 'Low-GI diet, blood sugar management',         color: 'border-emerald-500/50 bg-emerald-500/10 hover:border-emerald-400', accent: 'text-emerald-400' },
  { key: 'heart',       icon: <Heart size={22}/>,    label: 'Cardiac Health',   desc: 'Low sodium, heart-healthy DASH diet',         color: 'border-pink-500/50 bg-pink-500/10 hover:border-pink-400', accent: 'text-pink-400' },
  { key: 'general',     icon: <User size={22}/>,     label: 'General Wellness', desc: 'Balanced nutrition for everyday health',      color: 'border-purple-500/50 bg-purple-500/10 hover:border-purple-400', accent: 'text-purple-400' },
];

const STEPS = ['Body Details', 'Health Goal'];

const SetupProfile = () => {
  const { updateProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    gender: 'male', height_cm: '', weight_kg: '',
    date_of_birth: '', health_goal: 'general', activity_level: 'moderate',
  });

  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  const bmi = data.height_cm && data.weight_kg
    ? (data.weight_kg / ((data.height_cm / 100) ** 2)).toFixed(1)
    : null;

  const bmiLabel = bmi
    ? bmi < 18.5 ? { t: 'Underweight', c: 'text-blue-400' }
    : bmi < 25   ? { t: 'Normal', c: 'text-green-400' }
    : bmi < 30   ? { t: 'Overweight', c: 'text-yellow-400' }
    : { t: 'Obese', c: 'text-red-400' }
    : null;

  const handleLaunch = async () => {
    setLoading(true);
    try {
      await updateProfile({
        gender: data.gender,
        height_cm: parseFloat(data.height_cm) || 170,
        weight_kg: parseFloat(data.weight_kg) || 70,
        date_of_birth: data.date_of_birth || null,
        health_goal: data.health_goal,
        activity_level: data.activity_level,
      });
      await refreshProfile();
    } catch (e) { console.error(e); }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-accent-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-accent-neon/8 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg relative z-10">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Activity size={30} className="text-accent-neon" />
          <span className="text-2xl font-bold">NutriMind <span className="text-accent-purple">OS</span></span>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${i <= step ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                  ${i < step ? 'bg-accent-neon border-accent-neon text-background' : i === step ? 'border-accent-neon text-accent-neon' : 'border-border text-muted'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block text-muted">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px max-w-[60px] ${i < step ? 'bg-accent-neon' : 'bg-border'}`} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="glass-panel p-8"
          >
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold">Tell us about yourself</h2>
                  <p className="text-muted text-sm mt-1">This helps the AI give you personalized advice.</p>
                </div>

                {/* Gender */}
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Gender</label>
                  <div className="flex gap-2">
                    {['male', 'female', 'other'].map(g => (
                      <button key={g} onClick={() => set('gender', g)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-medium capitalize transition-all
                          ${data.gender === g ? 'border-accent-neon text-accent-neon bg-accent-neon/10' : 'border-border text-muted hover:border-foreground/30'}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DOB */}
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Date of Birth</label>
                  <input type="date" value={data.date_of_birth} onChange={e => set('date_of_birth', e.target.value)}
                    max={new Date(Date.now() - 10 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0]}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-neon/60 focus:ring-1 focus:ring-accent-neon/30 transition-all"
                  />
                </div>

                {/* Height & Weight */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Height (cm)</label>
                    <input type="number" value={data.height_cm} onChange={e => set('height_cm', e.target.value)} placeholder="e.g. 175"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-neon/60 focus:ring-1 focus:ring-accent-neon/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Weight (kg)</label>
                    <input type="number" value={data.weight_kg} onChange={e => set('weight_kg', e.target.value)} placeholder="e.g. 70"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-neon/60 focus:ring-1 focus:ring-accent-neon/30 transition-all"
                    />
                  </div>
                </div>

                {/* Live BMI */}
                {bmi && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center justify-between p-4 bg-background/50 border border-border rounded-xl"
                  >
                    <div>
                      <div className="text-xs text-muted uppercase tracking-wider">Your BMI</div>
                      <div className="text-2xl font-bold">{bmi}</div>
                    </div>
                    <div className={`text-sm font-semibold ${bmiLabel?.c}`}>{bmiLabel?.t}</div>
                  </motion.div>
                )}

                {/* Activity */}
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Activity Level</label>
                  <select value={data.activity_level} onChange={e => set('activity_level', e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-neon/60 transition-all"
                  >
                    <option value="sedentary">Sedentary — desk job, little exercise</option>
                    <option value="light">Light — exercise 1-3x/week</option>
                    <option value="moderate">Moderate — exercise 3-5x/week</option>
                    <option value="active">Active — hard exercise 6-7x/week</option>
                    <option value="very_active">Very Active — physical job + training</option>
                  </select>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold">What's your health goal?</h2>
                  <p className="text-muted text-sm mt-1">NutriMind will tailor everything to match.</p>
                </div>
                <div className="flex flex-col gap-3">
                  {HEALTH_GOALS.map(g => (
                    <button key={g.key} onClick={() => set('health_goal', g.key)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all bg-gradient-to-r ${g.color}
                        ${data.health_goal === g.key ? 'ring-2 ring-accent-neon ring-offset-1 ring-offset-background' : ''}`}
                    >
                      <span className={g.accent}>{g.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-foreground">{g.label}</div>
                        <div className="text-xs text-muted mt-0.5">{g.desc}</div>
                      </div>
                      {data.health_goal === g.key && <CheckCircle2 size={18} className="text-accent-neon shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Nav */}
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-2 px-5 py-3 border border-border rounded-xl text-sm font-medium text-muted hover:text-foreground hover:border-foreground/30 transition-all"
                >
                  <ChevronLeft size={16} /> Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button onClick={() => setStep(s => s + 1)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-accent-neon to-accent-purple text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleLaunch} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-accent-neon to-accent-purple text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all disabled:opacity-50"
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Setting up…</> : <><CheckCircle2 size={18} /> Launch Dashboard</>}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SetupProfile;
