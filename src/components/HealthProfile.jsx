import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Dumbbell, Activity, Pill, Sliders, CheckCircle2, ChevronRight, User } from 'lucide-react';
import { useGlobalState } from '../context/GlobalContext';

const PROFILES = [
  {
    key: 'gym',
    icon: <Dumbbell size={28} />,
    label: 'Gym & Muscle Building',
    description: 'Optimized for hypertrophy. High-protein, caloric surplus, performance macros.',
    color: 'from-blue-600/20 to-cyan-600/20 border-blue-500/40 hover:border-blue-400/70',
    accent: 'text-blue-400',
    targets: { calories: 2800, protein: 180, carbs: 220, fat: 70 },
    tips: ['Train compound lifts 4-5x/week', 'Eat within 1hr post-workout', 'Sleep 8hrs for muscle recovery', 'Stay above 170g protein daily'],
  },
  {
    key: 'diabetes',
    icon: <Pill size={28} />,
    label: 'Diabetes Management',
    description: 'Low-GI focused diet. Controls blood sugar spikes with slow-releasing carbs.',
    color: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/40 hover:border-emerald-400/70',
    accent: 'text-emerald-400',
    targets: { calories: 1800, protein: 130, carbs: 130, fat: 60 },
    tips: ['Choose low-GI foods (oats, lentils, broccoli)', 'Eat 5-6 small meals vs 3 large', 'Walk 15 min after each meal', 'Avoid fruit juices — eat whole fruit'],
  },
  {
    key: 'weight_loss',
    icon: <Activity size={28} />,
    label: 'Weight Loss & Deficit',
    description: 'Caloric deficit mode. High protein to preserve muscle while losing fat.',
    color: 'from-orange-600/20 to-red-600/20 border-orange-500/40 hover:border-orange-400/70',
    accent: 'text-orange-400',
    targets: { calories: 1600, protein: 160, carbs: 150, fat: 55 },
    tips: ['Eat protein at every meal to feel full', 'Prioritize whole foods over processed', 'Drink water before meals', 'Track everything — even small bites'],
  },
  {
    key: 'heart',
    icon: <Heart size={28} />,
    label: 'Cardiac Care',
    description: 'Heart-healthy plan. Low sodium, low saturated fat, high fiber diet.',
    color: 'from-pink-600/20 to-rose-600/20 border-pink-500/40 hover:border-pink-400/70',
    accent: 'text-pink-400',
    targets: { calories: 1900, protein: 120, carbs: 200, fat: 45 },
    tips: ['Avoid processed/packaged foods', 'Choose fish over red meat', 'Limit sodium to <1500mg/day', 'Eat oats, nuts, olive oil daily'],
  },
  {
    key: 'custom',
    icon: <Sliders size={28} />,
    label: 'Custom Blueprint',
    description: 'Set your own calorie and macro targets tailored to your specific needs.',
    color: 'from-purple-600/20 to-violet-600/20 border-purple-500/40 hover:border-purple-400/70',
    accent: 'text-purple-400',
    targets: null,
    tips: [],
  },
];

const HealthProfile = () => {
  const { healthProfile, applyHealthProfile } = useGlobalState();
  const [selected, setSelected] = useState(null);
  const [customVals, setCustomVals] = useState({ calories: 2200, protein: 150, carbs: 200, fat: 65 });
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    if (!selected) return;
    const profile = PROFILES.find(p => p.key === selected);
    const payload = {
      goal: selected,
      label: profile.label,
      ...(selected === 'custom' ? customVals : profile.targets)
    };
    applyHealthProfile(payload);
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  const activeProfile = PROFILES.find(p => p.key === healthProfile?.goal);

  return (
    <div className="h-full p-6 overflow-y-auto flex flex-col gap-6">

      {/* Page Title */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <User className="text-accent-purple" size={28} /> Health Profile
        </h1>
        <p className="text-muted text-sm mt-1">
          Choose your health goal. NutriMind will adjust all calorie targets, macro ratios, AI suggestions, and risk thresholds to match.
        </p>
      </div>

      {/* Current Active Profile Banner */}
      {healthProfile && activeProfile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`glass-panel p-4 border-l-4 flex items-center gap-4 ${activeProfile.color.includes('blue') ? 'border-l-blue-400' : activeProfile.color.includes('emerald') ? 'border-l-emerald-400' : activeProfile.color.includes('orange') ? 'border-l-orange-400' : activeProfile.color.includes('pink') ? 'border-l-pink-400' : 'border-l-purple-400'}`}
        >
          <div className={activeProfile.accent}>{activeProfile.icon}</div>
          <div>
            <div className="text-xs text-muted uppercase tracking-wider font-semibold">Active Profile</div>
            <div className="font-bold text-foreground">{activeProfile.label}</div>
            <div className="text-xs text-muted mt-0.5">
              {healthProfile.calories} kcal | {healthProfile.protein}g protein | {healthProfile.carbs}g carbs | {healthProfile.fat}g fat
            </div>
          </div>
          <CheckCircle2 className="ml-auto text-accent-neon shrink-0" size={22} />
        </motion.div>
      )}

      {/* Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {PROFILES.map(profile => (
          <motion.button
            key={profile.key}
            onClick={() => setSelected(profile.key === selected ? null : profile.key)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`text-left glass-panel p-5 flex flex-col gap-3 border-2 transition-all duration-200 relative overflow-hidden
              bg-gradient-to-br ${profile.color}
              ${selected === profile.key ? 'ring-2 ring-accent-neon ring-offset-1 ring-offset-background scale-[1.01]' : ''}
            `}
          >
            {selected === profile.key && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent-neon flex items-center justify-center">
                <CheckCircle2 size={12} className="text-background" />
              </div>
            )}
            <div className={profile.accent}>{profile.icon}</div>
            <div>
              <h3 className="font-bold text-foreground text-base">{profile.label}</h3>
              <p className="text-muted text-xs mt-1 leading-relaxed">{profile.description}</p>
            </div>
            {profile.targets && (
              <div className="flex gap-3 text-xs">
                <span className="bg-background/50 px-2 py-1 rounded-lg border border-border/50">{profile.targets.calories} kcal</span>
                <span className="bg-background/50 px-2 py-1 rounded-lg border border-border/50">{profile.targets.protein}g P</span>
                <span className="bg-background/50 px-2 py-1 rounded-lg border border-border/50">{profile.targets.carbs}g C</span>
              </div>
            )}
            {profile.tips.length > 0 && (
              <ul className="text-xs text-muted/80 space-y-1 mt-1">
                {profile.tips.slice(0, 2).map((tip, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <ChevronRight size={10} className={profile.accent} />
                    {tip}
                  </li>
                ))}
              </ul>
            )}
          </motion.button>
        ))}
      </div>

      {/* Custom inputs */}
      <AnimatePresence>
        {selected === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="glass-panel p-6"
          >
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Sliders size={18} className="text-accent-purple" /> Custom Targets
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'calories', label: 'Daily Calories', unit: 'kcal', min: 1000, max: 5000 },
                { key: 'protein', label: 'Protein', unit: 'g', min: 50, max: 300 },
                { key: 'carbs', label: 'Carbs', unit: 'g', min: 50, max: 500 },
                { key: 'fat', label: 'Fat', unit: 'g', min: 20, max: 200 },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs text-muted uppercase tracking-wider font-semibold block mb-2">{field.label}</label>
                  <input
                    type="number"
                    min={field.min} max={field.max}
                    value={customVals[field.key]}
                    onChange={e => setCustomVals(v => ({ ...v, [field.key]: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-accent-purple/60 focus:ring-1 focus:ring-accent-purple/30 text-sm"
                  />
                  <span className="text-xs text-muted mt-1 block">{field.unit}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apply Button */}
      <div className="shrink-0 flex items-center gap-4">
        <motion.button
          onClick={handleApply}
          disabled={!selected}
          whileHover={{ scale: selected ? 1.02 : 1 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-3 bg-gradient-to-r from-accent-neon to-accent-purple text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {applied ? '✅ Profile Activated!' : 'Activate Health Profile'}
        </motion.button>
        {applied && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-accent-neon">
            Your targets, AI suggestions, and risk meter have all been updated!
          </motion.span>
        )}
      </div>

      {/* Tips for selected profile */}
      <AnimatePresence>
        {selected && selected !== 'custom' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass-panel p-5"
          >
            {(() => {
              const p = PROFILES.find(pr => pr.key === selected);
              return (
                <>
                  <h3 className={`font-bold text-sm uppercase tracking-wider mb-3 ${p.accent}`}>{p.label} — Key Protocols</h3>
                  <ul className="space-y-2">
                    {p.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <ChevronRight size={14} className={`${p.accent} shrink-0 mt-0.5`} />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default HealthProfile;
