import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Dumbbell, Activity, Pill, Sliders, CheckCircle2, User, Brain, ShieldAlert, Apple, Ban, Loader2, Save, Sparkles } from 'lucide-react';
import { useGlobalState } from '../context/GlobalContext';
import { useAuth } from '../context/AuthContext';

const PROFILES = [
  { key: 'gym',         icon: <Dumbbell size={24}/>, label: 'Gym & Muscle',     color: 'border-blue-500/50 bg-blue-500/10',   accent: 'text-blue-400',   targets: { calories: 2800, protein: 180, carbs: 220, fat: 70 } },
  { key: 'weight_loss', icon: <Activity size={24}/>, label: 'Weight Loss',      color: 'border-orange-500/50 bg-orange-500/10', accent: 'text-orange-400', targets: { calories: 1600, protein: 160, carbs: 150, fat: 55 } },
  { key: 'diabetes',    icon: <Pill size={24}/>,     label: 'Diabetes Care',    color: 'border-emerald-500/50 bg-emerald-500/10', accent: 'text-emerald-400', targets: { calories: 1800, protein: 130, carbs: 130, fat: 60 } },
  { key: 'heart',       icon: <Heart size={24}/>,    label: 'Cardiac Health',   color: 'border-pink-500/50 bg-pink-500/10',   accent: 'text-pink-400',   targets: { calories: 1900, protein: 120, carbs: 200, fat: 45 } },
  { key: 'general',     icon: <User size={24}/>,     label: 'General Wellness', color: 'border-purple-500/50 bg-purple-500/10', accent: 'text-purple-400', targets: { calories: 2200, protein: 150, carbs: 250, fat: 80 } },
];

const CONDITIONS = ['Hypertension', 'High Cholesterol', 'PCOS', 'Thyroid', 'Anemia', 'IBS', 'Lactose Intolerant', 'Gluten Intolerant'];

const HealthProfile = () => {
  const { healthProfile, applyHealthProfile } = useGlobalState();
  const { profile, updateProfile, refreshProfile } = useAuth();
  const [selected, setSelected] = useState(healthProfile?.goal || 'general');
  const [applied, setApplied] = useState(false);
  const [aiAdvice, setAiAdvice] = useState(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [details, setDetails] = useState({
    height_cm: '', weight_kg: '', gender: 'male',
    date_of_birth: '', activity_level: 'moderate',
    neck_cm: '', waist_cm: '', hip_cm: '',
    health_conditions: [],
  });

  // Load existing profile data
  useEffect(() => {
    if (profile) {
      setDetails({
        height_cm: profile.height_cm || '',
        weight_kg: profile.weight_kg || '',
        gender: profile.gender || 'male',
        date_of_birth: profile.date_of_birth || '',
        activity_level: profile.activity_level || 'moderate',
        neck_cm: profile.neck_cm || '',
        waist_cm: profile.waist_cm || '',
        hip_cm: profile.hip_cm || '',
        health_conditions: profile.health_conditions
          ? (typeof profile.health_conditions === 'string' ? JSON.parse(profile.health_conditions) : profile.health_conditions)
          : [],
      });
    }
  }, [profile]);

  const set = (k, v) => setDetails(d => ({ ...d, [k]: v }));

  const toggleCondition = (c) => {
    setDetails(d => ({
      ...d,
      health_conditions: d.health_conditions.includes(c)
        ? d.health_conditions.filter(x => x !== c)
        : [...d.health_conditions, c],
    }));
  };

  const bmi = details.height_cm && details.weight_kg
    ? (details.weight_kg / ((details.height_cm / 100) ** 2)).toFixed(1) : null;

  const bmiLabel = bmi
    ? bmi < 18.5 ? { t: 'Underweight', c: 'text-blue-400' }
    : bmi < 25   ? { t: 'Normal', c: 'text-green-400' }
    : bmi < 30   ? { t: 'Overweight', c: 'text-yellow-400' }
    : { t: 'Obese', c: 'text-red-400' } : null;

  const age = details.date_of_birth
    ? Math.floor((Date.now() - new Date(details.date_of_birth)) / (365.25 * 24 * 3600 * 1000)) : null;

  const handleSaveDetails = async () => {
    setSavingDetails(true);
    await updateProfile({
      height_cm: parseFloat(details.height_cm) || null,
      weight_kg: parseFloat(details.weight_kg) || null,
      gender: details.gender,
      date_of_birth: details.date_of_birth || null,
      activity_level: details.activity_level,
      neck_cm: parseFloat(details.neck_cm) || null,
      waist_cm: parseFloat(details.waist_cm) || null,
      hip_cm: parseFloat(details.hip_cm) || null,
      health_conditions: details.health_conditions,
    });
    await refreshProfile();
    setSavingDetails(false);
  };

  const handleApplyGoal = () => {
    const p = PROFILES.find(x => x.key === selected);
    applyHealthProfile({ goal: selected, label: p.label, ...p.targets });
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  const getAIAdvice = async () => {
    setLoadingAdvice(true);
    setAiAdvice(null);
    const token = localStorage.getItem('nm_token');
    try {
      const res = await fetch('/api/user/health-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ goal: selected, details }),
      });
      const data = await res.json();
      if (data.advice) setAiAdvice(data.advice);
    } catch (e) { console.error(e); }
    setLoadingAdvice(false);
  };

  return (
    <div className="h-full overflow-y-auto p-6 flex flex-col gap-6">

      <div className="shrink-0">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Heart className="text-accent-purple" size={26} /> Health Profile
        </h1>
        <p className="text-muted text-sm mt-1">Complete your health details for personalized AI recommendations.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* LEFT: Body Details */}
        <div className="flex flex-col gap-4">
          <div className="glass-panel p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <User size={16} className="text-accent-neon" /> Body Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Gender */}
              <div className="col-span-2">
                <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-2">Gender</label>
                <div className="flex gap-2">
                  {['male','female','other'].map(g => (
                    <button key={g} onClick={() => set('gender', g)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-semibold capitalize transition-all
                        ${details.gender === g ? 'border-accent-neon text-accent-neon bg-accent-neon/10' : 'border-border text-muted hover:border-foreground/30'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              {/* DOB */}
              <div className="col-span-2">
                <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-2">Date of Birth {age && <span className="text-accent-neon normal-case">({age} years old)</span>}</label>
                <input type="date" value={details.date_of_birth} onChange={e => set('date_of_birth', e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent-neon/60 transition-all" />
              </div>
              {/* Height */}
              <div>
                <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-2">Height (cm)</label>
                <input type="number" value={details.height_cm} onChange={e => set('height_cm', e.target.value)} placeholder="175"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent-neon/60 transition-all" />
              </div>
              {/* Weight */}
              <div>
                <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-2">Weight (kg)</label>
                <input type="number" value={details.weight_kg} onChange={e => set('weight_kg', e.target.value)} placeholder="70"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent-neon/60 transition-all" />
              </div>
              {/* Neck */}
              <div>
                <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-2">Neck (cm)</label>
                <input type="number" value={details.neck_cm} onChange={e => set('neck_cm', e.target.value)} placeholder="38"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent-neon/60 transition-all" />
              </div>
              {/* Waist */}
              <div>
                <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-2">Waist (cm)</label>
                <input type="number" value={details.waist_cm} onChange={e => set('waist_cm', e.target.value)} placeholder="80"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent-neon/60 transition-all" />
              </div>
              {/* Hip */}
              <div>
                <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-2">Hip (cm) <span className="text-muted/60 normal-case text-[10px]">optional</span></label>
                <input type="number" value={details.hip_cm} onChange={e => set('hip_cm', e.target.value)} placeholder="95"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent-neon/60 transition-all" />
              </div>
              {/* Activity */}
              <div className="col-span-2">
                <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-2">Activity Level</label>
                <select value={details.activity_level} onChange={e => set('activity_level', e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent-neon/60 transition-all">
                  <option value="sedentary">Sedentary — desk job, little exercise</option>
                  <option value="light">Light — 1-3x/week</option>
                  <option value="moderate">Moderate — 3-5x/week</option>
                  <option value="active">Active — 6-7x/week</option>
                  <option value="very_active">Very Active — physical job + training</option>
                </select>
              </div>
            </div>

            {/* BMI display */}
            {bmi && (
              <div className="mt-4 flex items-center justify-between p-3 bg-background/50 border border-border rounded-xl">
                <div>
                  <div className="text-xs text-muted uppercase tracking-wider">BMI</div>
                  <div className="text-xl font-bold">{bmi}</div>
                </div>
                <div className={`text-sm font-semibold ${bmiLabel?.c}`}>{bmiLabel?.t}</div>
              </div>
            )}
          </div>

          {/* Health Conditions */}
          <div className="glass-panel p-5">
            <h2 className="font-bold text-base mb-3 flex items-center gap-2">
              <ShieldAlert size={16} className="text-yellow-400" /> Health Conditions
            </h2>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map(c => (
                <button key={c} onClick={() => toggleCondition(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                    ${details.health_conditions.includes(c)
                      ? 'bg-yellow-400/20 border-yellow-400/60 text-yellow-300'
                      : 'border-border text-muted hover:border-foreground/30'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSaveDetails} disabled={savingDetails}
            className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-accent-neon to-accent-cyan text-background font-bold rounded-xl hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all disabled:opacity-50">
            {savingDetails ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={16} /> Save Body Details</>}
          </button>
        </div>

        {/* RIGHT: Goal + AI Advice */}
        <div className="flex flex-col gap-4">

          {/* Goal selector */}
          <div className="glass-panel p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
              <Brain size={16} className="text-accent-purple" /> Health Goal
            </h2>
            <div className="flex flex-col gap-2">
              {PROFILES.map(p => (
                <button key={p.key} onClick={() => setSelected(p.key)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all bg-gradient-to-r ${p.color}
                    ${selected === p.key ? 'ring-2 ring-accent-neon ring-offset-1 ring-offset-background' : ''}`}>
                  <span className={p.accent}>{p.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{p.label}</div>
                    <div className="text-xs text-muted">{p.targets.calories} kcal · {p.targets.protein}g P · {p.targets.carbs}g C</div>
                  </div>
                  {selected === p.key && <CheckCircle2 size={16} className="text-accent-neon shrink-0" />}
                </button>
              ))}
            </div>
            <button onClick={handleApplyGoal}
              className="w-full mt-4 py-3 bg-gradient-to-r from-accent-neon to-accent-purple text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all">
              {applied ? '✅ Goal Activated!' : 'Activate This Goal'}
            </button>
          </div>

          {/* AI Food Advice */}
          <div className="glass-panel p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Apple size={16} className="text-green-400" /> AI Food Advice
              </h2>
              <button onClick={getAIAdvice} disabled={loadingAdvice}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-xs font-semibold hover:bg-green-500/30 transition-all disabled:opacity-50">
                {loadingAdvice ? <><Loader2 size={12} className="animate-spin" /> Analyzing…</> : <><Sparkles size={12} /> Get AI Advice</>}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {loadingAdvice && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-muted text-sm animate-pulse">Analyzing your health profile…</p>
                </motion.div>
              )}

              {aiAdvice && !loadingAdvice && (
                <motion.div key="advice" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Eat */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-green-400 flex items-center gap-1.5 mb-2">
                      <Apple size={12} /> Eat More Of
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {aiAdvice.eat?.map((f, i) => (
                        <span key={i} className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-300 rounded-full text-xs font-medium">{f}</span>
                      ))}
                    </div>
                  </div>
                  {/* Avoid */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5 mb-2">
                      <Ban size={12} /> Avoid / Limit
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {aiAdvice.avoid?.map((f, i) => (
                        <span key={i} className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-300 rounded-full text-xs font-medium">{f}</span>
                      ))}
                    </div>
                  </div>
                  {/* Tips */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-accent-neon flex items-center gap-1.5 mb-2">
                      <Brain size={12} /> Personalized Tips
                    </h3>
                    <ul className="space-y-2">
                      {aiAdvice.tips?.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                          <span className="text-accent-neon mt-0.5 shrink-0">→</span> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Warning */}
                  {aiAdvice.warning && (
                    <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-3">
                      <p className="text-xs text-yellow-300"><span className="font-bold">⚠️ Note:</span> {aiAdvice.warning}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {!aiAdvice && !loadingAdvice && (
                <motion.div key="empty" className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                  <Apple size={40} className="text-muted/20" />
                  <p className="text-muted text-sm">Click <span className="text-green-400 font-semibold">Get AI Advice</span> to get personalized food recommendations based on your health profile</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthProfile;
