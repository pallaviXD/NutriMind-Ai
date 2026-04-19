import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ChevronRight, ChevronLeft, Loader2, CheckCircle2, Ruler, Scale, User, Dumbbell, Heart, Pill } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STEPS = ['Body Details', 'Measurements', 'Health Goal'];

const HEALTH_GOALS = [
  { key: 'gym',          icon: <Dumbbell size={22}/>, label: 'Gym & Muscle',      color: 'border-blue-500/50 bg-blue-500/10 hover:border-blue-400', accent: 'text-blue-400' },
  { key: 'weight_loss',  icon: <Activity size={22}/>, label: 'Weight Loss',       color: 'border-orange-500/50 bg-orange-500/10 hover:border-orange-400', accent: 'text-orange-400' },
  { key: 'diabetes',     icon: <Pill size={22}/>,     label: 'Diabetes Care',     color: 'border-emerald-500/50 bg-emerald-500/10 hover:border-emerald-400', accent: 'text-emerald-400' },
  { key: 'heart',        icon: <Heart size={22}/>,    label: 'Cardiac Health',    color: 'border-pink-500/50 bg-pink-500/10 hover:border-pink-400', accent: 'text-pink-400' },
  { key: 'general',      icon: <User size={22}/>,     label: 'General Wellness',  color: 'border-purple-500/50 bg-purple-500/10 hover:border-purple-400', accent: 'text-purple-400' },
];

const ACTIVITY_LEVELS = [
  { key: 'sedentary',   label: 'Sedentary',     desc: 'Desk job, little/no exercise' },
  { key: 'light',       label: 'Light',         desc: 'Exercise 1-3x/week' },
  { key: 'moderate',    label: 'Moderate',      desc: 'Exercise 3-5x/week' },
  { key: 'active',      label: 'Active',        desc: 'Hard exercise 6-7x/week' },
  { key: 'very_active', label: 'Very Active',   desc: 'Physical job + training' },
];

const calcBMI = (weight, height) => {
  if (!weight || !height) return null;
  const bmi = weight / ((height / 100) ** 2);
  return bmi.toFixed(1);
};
const bmiCategory = bmi => {
  if (!bmi) return '';
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
  if (bmi < 25)   return { label: 'Normal', color: 'text-green-400' };
  if (bmi < 30)   return { label: 'Overweight', color: 'text-yellow-400' };
  return { label: 'Obese', color: 'text-red-400' };
};

const SetupProfile = () => {
  const { updateProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [data, setData] = useState({
    gender: '', heightUnit: 'cm', height_cm: '', heightFt: '', heightIn: '',
    weightUnit: 'kg', weight_kg: '', weightLbs: '',
    neck_cm: '', waist_cm: '', hip_cm: '',
    health_goal: '', activity_level: 'moderate',
    health_conditions: [], target_weight_kg: '',
  });

  const set = (key, val) => setData(d => ({ ...d, [key]: val }));

  const bmi = calcBMI(
    data.weightUnit === 'kg' ? data.weight_kg : data.weightLbs * 0.453592,
    data.heightUnit === 'cm' ? data.height_cm : (parseFloat(data.heightFt || 0) * 30.48 + parseFloat(data.heightIn || 0) * 2.54)
  );
  const bmiInfo = bmiCategory(bmi);

  const handleFinish = async () => {
    setLoading(true);
    const h = data.heightUnit === 'cm' ? parseFloat(data.height_cm) : parseFloat(data.heightFt) * 30.48 + parseFloat(data.heightIn) * 2.54;
    const w = data.weightUnit === 'kg' ? parseFloat(data.weight_kg) : parseFloat(data.weightLbs) * 0.453592;
    await updateProfile({
      gender: data.gender,
      height_cm: h || null,
      weight_kg: w || null,
      neck_cm: data.neck_cm || null,
      waist_cm: data.waist_cm || null,
      hip_cm: data.hip_cm || null,
      health_goal: data.health_goal || 'general',
      activity_level: data.activity_level,
      health_conditions: data.health_conditions,
      target_weight_kg: data.target_weight_kg || null,
    });
    await refreshProfile();
    setDone(true);
    setTimeout(() => navigate('/'), 2000);
    setLoading(false);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
          <CheckCircle2 size={64} className="text-accent-neon mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Profile Complete!</h2>
          <p className="text-muted mt-2">Launching your personalized dashboard…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-accent-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-accent-neon/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Activity size={28} className="text-accent-neon" />
          <span className="text-xl font-bold">NutriMind <span className="text-accent-purple">OS</span></span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${i <= step ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i < step ? 'bg-accent-neon border-accent-neon text-background' : i === step ? 'border-accent-neon text-accent-neon' : 'border-border text-muted'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-accent-neon' : 'bg-border'}`} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="glass-panel p-8"
          >
            {step === 0 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Tell us about your body</h2>
                
                {/* Gender */}
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Gender</label>
                  <div className="flex gap-3">
                    {['male', 'female', 'other'].map(g => (
                      <button key={g} onClick={() => set('gender', g)}
                        className={`flex-1 py-3 rounded-xl border text-sm font-medium capitalize transition-all ${data.gender === g ? 'border-accent-neon text-accent-neon bg-accent-neon/10' : 'border-border text-muted hover:border-foreground/30'}`}
                      >{g}</button>
                    ))}
                  </div>
                </div>

                {/* Height */}
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Height</label>
                  <div className="flex gap-2 mb-3">
                    {['cm', 'ft'].map(u => (
                      <button key={u} onClick={() => set('heightUnit', u)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${data.heightUnit === u ? 'border-accent-neon text-accent-neon bg-accent-neon/10' : 'border-border text-muted'}`}
                      >{u}</button>
                    ))}
                  </div>
                  {data.heightUnit === 'cm' ? (
                    <input type="number" value={data.height_cm} onChange={e => set('height_cm', e.target.value)} placeholder="e.g. 175"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-neon/60 focus:ring-1 focus:ring-accent-neon/30 transition-all"
                    />
                  ) : (
                    <div className="flex gap-3">
                      <input type="number" value={data.heightFt} onChange={e => set('heightFt', e.target.value)} placeholder="ft"
                        className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-neon/60 transition-all" />
                      <input type="number" value={data.heightIn} onChange={e => set('heightIn', e.target.value)} placeholder="in"
                        className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-neon/60 transition-all" />
                    </div>
                  )}
                </div>

                {/* Weight */}
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Current Weight</label>
                  <div className="flex gap-2 mb-3">
                    {['kg', 'lbs'].map(u => (
                      <button key={u} onClick={() => set('weightUnit', u)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${data.weightUnit === u ? 'border-accent-neon text-accent-neon bg-accent-neon/10' : 'border-border text-muted'}`}
                      >{u}</button>
                    ))}
                  </div>
                  <input type="number" value={data.weightUnit === 'kg' ? data.weight_kg : data.weightLbs}
                    onChange={e => set(data.weightUnit === 'kg' ? 'weight_kg' : 'weightLbs', e.target.value)}
                    placeholder={data.weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-neon/60 focus:ring-1 focus:ring-accent-neon/30 transition-all"
                  />
                </div>

                {/* Live BMI */}
                {bmi && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-4 bg-background/50 border border-border rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs text-muted uppercase tracking-wider">Your BMI</div>
                      <div className="text-2xl font-bold text-foreground">{bmi}</div>
                    </div>
                    <div className={`text-sm font-semibold ${bmiInfo.color}`}>{bmiInfo.label}</div>
                  </motion.div>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold">Body Measurements</h2>
                  <p className="text-muted text-sm mt-1">Optional. Used to estimate body fat % more accurately.</p>
                </div>
                {[
                  { key: 'neck_cm', label: 'Neck circumference (cm)', placeholder: 'e.g. 38' },
                  { key: 'waist_cm', label: 'Waist circumference (cm)', placeholder: 'e.g. 85' },
                  { key: 'hip_cm', label: 'Hip circumference (cm) — females', placeholder: 'e.g. 95' },
                  { key: 'target_weight_kg', label: 'Target Weight (kg)', placeholder: 'e.g. 65' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">{field.label}</label>
                    <input type="number" value={data[field.key]} onChange={e => set(field.key, e.target.value)} placeholder={field.placeholder}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-neon/60 focus:ring-1 focus:ring-accent-neon/30 transition-all placeholder:text-muted/40"
                    />
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Health Goal & Activity</h2>
                <div className="grid grid-cols-1 gap-3">
                  {HEALTH_GOALS.map(g => (
                    <button key={g.key} onClick={() => set('health_goal', g.key)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${data.health_goal === g.key ? 'ring-2 ring-accent-neon ' + g.color : g.color + ' border-opacity-50'}`}
                    >
                      <span className={g.accent}>{g.icon}</span>
                      <span className="font-semibold text-sm">{g.label}</span>
                      {data.health_goal === g.key && <CheckCircle2 size={16} className="ml-auto text-accent-neon" />}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Activity Level</label>
                  <div className="space-y-2">
                    {ACTIVITY_LEVELS.map(a => (
                      <button key={a.key} onClick={() => set('activity_level', a.key)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${data.activity_level === a.key ? 'border-accent-neon bg-accent-neon/10 text-accent-neon' : 'border-border text-muted hover:border-foreground/30'}`}
                      >
                        <span className="font-semibold">{a.label}</span>
                        <span className="text-xs opacity-70">{a.desc}</span>
                        {data.activity_level === a.key && <CheckCircle2 size={14} className="ml-2 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Nav buttons */}
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
                <button onClick={handleFinish} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-accent-neon to-accent-purple text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all disabled:opacity-50"
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : <><CheckCircle2 size={18} /> Launch Dashboard</>}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SetupProfile;
