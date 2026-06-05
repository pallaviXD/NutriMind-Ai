import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, ChevronDown, ChevronUp, Clock, Flame, RepeatIcon, Sparkles, RefreshCw, History, ArrowLeft, Calendar, Zap, Loader2, AlertCircle } from 'lucide-react';
import { useGlobalState } from '../context/GlobalContext';
import { useAuth } from '../context/AuthContext';

// ─── Fallback static plans (used when no AI plan exists yet) ──────────────────
const STATIC_PLANS = {
  gym: {
    title: 'Hypertrophy Split',
    subtitle: '7-Day Push / Pull / Legs Split',
    days: [
      { day: 'Day 1 — Push (Chest, Shoulders, Triceps)', exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '8-10', rest: '90s', muscles: 'Chest' },
        { name: 'Overhead Press', sets: 3, reps: '8-12', rest: '90s', muscles: 'Shoulders' },
        { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '60s', muscles: 'Upper Chest' },
        { name: 'Lateral Raises', sets: 4, reps: '12-15', rest: '45s', muscles: 'Deltoids' },
        { name: 'Tricep Rope Pushdown', sets: 3, reps: '12-15', rest: '45s', muscles: 'Triceps' },
      ]},
      { day: 'Day 2 — Pull (Back, Biceps)', exercises: [
        { name: 'Deadlift', sets: 4, reps: '5-6', rest: '3min', muscles: 'Posterior Chain' },
        { name: 'Barbell Rows', sets: 3, reps: '8-10', rest: '90s', muscles: 'Lats / Rhomboids' },
        { name: 'Pull-Ups or Lat Pulldown', sets: 3, reps: '8-12', rest: '90s', muscles: 'Lats' },
        { name: 'Face Pulls', sets: 3, reps: '15-20', rest: '45s', muscles: 'Rear Delts' },
        { name: 'Barbell Curl', sets: 3, reps: '10-12', rest: '60s', muscles: 'Biceps' },
      ]},
      { day: 'Day 3 — Legs', exercises: [
        { name: 'Back Squat', sets: 4, reps: '6-8', rest: '3min', muscles: 'Quads / Glutes' },
        { name: 'Romanian Deadlift', sets: 3, reps: '8-10', rest: '2min', muscles: 'Hamstrings' },
        { name: 'Leg Press', sets: 3, reps: '10-12', rest: '90s', muscles: 'Quads' },
        { name: 'Walking Lunges', sets: 3, reps: '12 each', rest: '60s', muscles: 'Glutes / Quads' },
        { name: 'Calf Raises', sets: 4, reps: '15-20', rest: '45s', muscles: 'Calves' },
      ]},
      { day: 'Day 4 — Rest / Active Recovery', exercises: [
        { name: 'Light Jog or Walk', sets: 1, reps: '20 min', rest: '—', muscles: 'Cardio' },
        { name: 'Full Body Stretching', sets: 1, reps: '15 min', rest: '—', muscles: 'Flexibility' },
      ]},
      { day: 'Day 5 — Push (Volume)', exercises: [
        { name: 'Dumbbell Flat Press', sets: 4, reps: '10-12', rest: '60s', muscles: 'Chest' },
        { name: 'Arnold Press', sets: 3, reps: '10-12', rest: '60s', muscles: 'Shoulders' },
        { name: 'Cable Flyes', sets: 3, reps: '12-15', rest: '45s', muscles: 'Chest' },
        { name: 'Overhead Tricep Extension', sets: 3, reps: '12-15', rest: '45s', muscles: 'Triceps' },
      ]},
      { day: 'Day 6 — Pull (Width)', exercises: [
        { name: 'Wide-Grip Pull-Ups', sets: 4, reps: '8-10', rest: '90s', muscles: 'Lats' },
        { name: 'Seated Cable Row', sets: 3, reps: '10-12', rest: '60s', muscles: 'Mid Back' },
        { name: 'Hammer Curls', sets: 3, reps: '10-12', rest: '60s', muscles: 'Biceps' },
        { name: 'Shrugs', sets: 3, reps: '12-15', rest: '45s', muscles: 'Traps' },
      ]},
      { day: 'Day 7 — Active Recovery', exercises: [
        { name: 'Light Jog or Cycle', sets: 1, reps: '20 min', rest: '—', muscles: 'Cardio' },
        { name: 'Foam Rolling', sets: 1, reps: '10 min', rest: '—', muscles: 'Recovery' },
      ]},
    ],
    nutrition: ['Eat 1g protein per lb of bodyweight', 'Caloric surplus of 200-300 kcal', 'Creatine 5g/day', 'Pre-workout meal 90 min before training'],
  },
  general: {
    title: 'General Wellness Plan',
    subtitle: '7-Day Balanced Fitness Plan',
    days: [
      { day: 'Day 1 — Full Body', exercises: [
        { name: 'Bodyweight Squat', sets: 3, reps: '15', rest: '45s', muscles: 'Legs' },
        { name: 'Push-Ups', sets: 3, reps: '10-15', rest: '45s', muscles: 'Chest' },
        { name: 'Plank', sets: 3, reps: '30-45s', rest: '30s', muscles: 'Core' },
      ]},
      { day: 'Day 2 — Cardio', exercises: [
        { name: '20-min brisk walk or jog', sets: 1, reps: '20 min', rest: '—', muscles: 'Cardio' },
      ]},
      { day: 'Day 3 — Core', exercises: [
        { name: 'Dead Bug', sets: 3, reps: '10 each', rest: '30s', muscles: 'Deep Core' },
        { name: 'Glute Bridge', sets: 3, reps: '15', rest: '45s', muscles: 'Glutes' },
      ]},
      { day: 'Day 4 — Upper Body', exercises: [
        { name: 'Dumbbell Overhead Press', sets: 3, reps: '10-12', rest: '60s', muscles: 'Shoulders' },
        { name: 'Dumbbell Row', sets: 3, reps: '10 each', rest: '60s', muscles: 'Back' },
      ]},
      { day: 'Day 5 — HIIT', exercises: [
        { name: 'Jumping Jacks', sets: 3, reps: '45s on / 15s off', rest: '—', muscles: 'Full Body' },
        { name: 'Mountain Climbers', sets: 3, reps: '40s on / 20s off', rest: '—', muscles: 'Core' },
      ]},
      { day: 'Day 6 — Yoga', exercises: [
        { name: 'Sun Salutation', sets: 3, reps: '5 rounds', rest: '—', muscles: 'Full Body' },
      ]},
      { day: 'Day 7 — Rest', exercises: [
        { name: '30-min walk', sets: 1, reps: '30 min', rest: '—', muscles: 'Recovery' },
      ]},
    ],
    nutrition: ['Eat whole foods 80% of the time', 'Drink at least 2L water', 'Sleep 7-8 hours', 'Include fruits and vegetables daily'],
  },
};

const Workouts = () => {
  const { healthProfile } = useGlobalState();
  const { profile } = useAuth();
  const goalKey = healthProfile?.goal || profile?.health_goal || 'general';

  // State
  const [currentPlan, setCurrentPlan] = useState(null);
  const [planMeta, setPlanMeta] = useState({ version: null, createdAt: null, cached: false });
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [viewingHistoryPlan, setViewingHistoryPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const [openDay, setOpenDay] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const token = localStorage.getItem('nm_token');

  // Fetch the latest plan on mount
  const fetchLatest = useCallback(async () => {
    try {
      const res = await fetch('/api/user/workout-plan/latest', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setCurrentPlan(data.plan);
        setPlanMeta({ version: data.version, createdAt: data.createdAt, cached: true });
      }
    } catch (err) {
      console.error('Failed to fetch latest plan:', err);
    } finally {
      setHasLoaded(true);
    }
  }, [token]);

  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  // Generate a new plan via AI
  const generatePlan = async (forceRegenerate = false) => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/user/workout-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ goal: goalKey, forceRegenerate }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Failed to generate workout plan.');
        return;
      }
      setCurrentPlan(data.plan);
      setPlanMeta({ version: data.version, createdAt: data.createdAt, cached: data.cached });
      setOpenDay(0);
      setViewingHistoryPlan(null);
    } catch (err) {
      console.error('Generate plan error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Fetch history
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/user/workout-plan/history?limit=20', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.plans || []);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load a specific plan from history
  const loadHistoryPlan = async (planId) => {
    try {
      const res = await fetch(`/api/user/workout-plan/${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setViewingHistoryPlan(data.plan);
        setPlanMeta({ version: data.version, createdAt: data.createdAt, cached: true });
        setOpenDay(0);
        setShowHistory(false);
      }
    } catch (err) {
      console.error('Failed to load plan:', err);
    }
  };

  const handleShowHistory = () => {
    setShowHistory(true);
    fetchHistory();
  };

  // The plan to display — either a history plan, the current AI plan, or the static fallback
  const displayPlan = viewingHistoryPlan || currentPlan || STATIC_PLANS[goalKey] || STATIC_PLANS.general;
  const isStaticFallback = !viewingHistoryPlan && !currentPlan;

  const formatDate = (unixTs) => {
    if (!unixTs) return '';
    const d = new Date(unixTs * 1000);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // ─── History Panel ────────────────────────────────────────────────────────────
  if (showHistory) {
    return (
      <div className="h-full p-6 flex flex-col gap-6 overflow-y-auto">
        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={() => setShowHistory(false)}
            className="p-2 rounded-xl border border-border hover:border-accent-neon/40 hover:bg-accent-neon/5 transition-all"
          >
            <ArrowLeft size={18} className="text-muted" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <History className="text-accent-purple" size={28} />
              Workout Plan History
            </h1>
            <p className="text-muted text-sm mt-1">Your previously generated workout plans</p>
          </div>
        </div>

        {isLoadingHistory ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-accent-neon" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <History size={48} className="text-muted/30 mx-auto mb-3" />
              <p className="text-muted text-sm">No workout plans generated yet.</p>
              <p className="text-muted/60 text-xs mt-1">Generate your first AI plan to see it here.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((h, i) => (
              <motion.button
                key={h.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => loadHistoryPlan(h.id)}
                className="w-full glass-panel p-4 flex items-center justify-between hover:border-accent-neon/30 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-neon/10 border border-accent-neon/20 flex items-center justify-center text-accent-neon font-bold text-sm">
                    v{h.version}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Workout Plan v{h.version}</p>
                    <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                      <Calendar size={10} />
                      {formatDate(h.created_at)}
                    </p>
                  </div>
                </div>
                <ChevronDown size={16} className="text-muted group-hover:text-accent-neon transition-colors -rotate-90" />
              </motion.button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Main Workout View ────────────────────────────────────────────────────────
  return (
    <div className="h-full p-6 flex flex-col gap-6 overflow-y-auto">
      {/* Header */}
      <div className="shrink-0">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Dumbbell className="text-accent-neon" size={28} />
              {displayPlan.title}
            </h1>
            <p className="text-muted text-sm mt-1">{displayPlan.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShowHistory}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium text-muted hover:border-accent-purple/40 hover:text-accent-purple hover:bg-accent-purple/5 transition-all"
            >
              <History size={14} />
              History
            </button>
            <button
              onClick={() => generatePlan(false)}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-neon/10 border border-accent-neon/30 text-xs font-semibold text-accent-neon hover:bg-accent-neon/20 hover:border-accent-neon/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Generate AI Plan
                </>
              )}
            </button>
            {currentPlan && (
              <button
                onClick={() => generatePlan(true)}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-medium text-muted hover:border-accent-cyan/40 hover:text-accent-cyan hover:bg-accent-cyan/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="Force regenerate a new plan"
              >
                <RefreshCw size={14} />
                Regenerate
              </button>
            )}
          </div>
        </div>

        {/* Plan metadata badge */}
        {planMeta.version && !isStaticFallback && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-3 flex-wrap"
          >
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-neon/10 border border-accent-neon/20 text-xs font-medium text-accent-neon">
              <Zap size={10} />
              AI Generated — v{planMeta.version}
            </span>
            {planMeta.createdAt && (
              <span className="text-xs text-muted flex items-center gap-1">
                <Calendar size={10} />
                {formatDate(planMeta.createdAt)}
              </span>
            )}
            {planMeta.cached && (
              <span className="text-xs text-accent-cyan/70">⚡ Served from cache</span>
            )}
            {viewingHistoryPlan && (
              <button
                onClick={() => { setViewingHistoryPlan(null); setOpenDay(0); }}
                className="text-xs text-muted hover:text-accent-neon transition-colors underline underline-offset-2"
              >
                ← Back to latest
              </button>
            )}
          </motion.div>
        )}

        {/* Static fallback notice */}
        {isStaticFallback && hasLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-accent-purple/5 border border-accent-purple/20 text-xs text-accent-purple"
          >
            <AlertCircle size={14} />
            Showing a default plan. Click <strong>"Generate AI Plan"</strong> to get a personalized workout tailored to your profile.
          </motion.div>
        )}

        {/* Error display */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400"
          >
            <AlertCircle size={14} />
            {error}
          </motion.div>
        )}
      </div>

      {/* Day accordion */}
      <div className="flex flex-col gap-4">
        {displayPlan.days.map((d, i) => (
          <div key={i} className="glass-panel overflow-hidden">
            <button onClick={() => setOpenDay(openDay === i ? -1 : i)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-accent-neon/5 transition-colors"
            >
              <div>
                <span className="text-xs text-accent-neon font-semibold uppercase tracking-wider">Session {i + 1}</span>
                <h3 className="font-bold text-foreground mt-0.5">{d.day}</h3>
              </div>
              {openDay === i ? <ChevronUp size={18} className="text-muted" /> : <ChevronDown size={18} className="text-muted" />}
            </button>

            <AnimatePresence>
              {openDay === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                  <div className="px-5 pb-5 space-y-3 border-t border-border/50">
                    <div className="grid grid-cols-4 text-xs font-semibold uppercase tracking-wider text-muted pt-4 px-1">
                      <span className="col-span-2">Exercise</span>
                      <span>Sets × Reps</span>
                      <span>Rest</span>
                    </div>
                    {d.exercises.map((ex, j) => (
                      <motion.div key={j} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: j * 0.05 }}
                        className="grid grid-cols-4 items-center p-3 rounded-xl bg-background/50 border border-border/50 hover:border-accent-neon/20 transition-all group"
                      >
                        <div className="col-span-2">
                          <div className="font-semibold text-sm text-foreground">{ex.name}</div>
                          <div className="text-xs text-muted mt-0.5">{ex.muscles}</div>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-mono">
                          <RepeatIcon size={12} className="text-accent-neon" />
                          <span>{ex.sets} × {ex.reps}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted">
                          <Clock size={12} />
                          <span>{ex.rest}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Nutrition tips */}
      {displayPlan.nutrition && displayPlan.nutrition.length > 0 && (
        <div className="glass-panel p-6 border-l-4 border-l-accent-purple shrink-0">
          <h3 className="font-bold text-sm uppercase tracking-wider text-accent-purple mb-4 flex items-center gap-2">
            <Flame size={16} /> Nutrition Protocols for {displayPlan.title}
          </h3>
          <ul className="space-y-2">
            {displayPlan.nutrition.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <span className="text-accent-neon mt-0.5">→</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Workouts;
