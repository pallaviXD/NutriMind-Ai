import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, ChevronDown, ChevronUp, Play, Clock, Flame, RepeatIcon } from 'lucide-react';
import { useGlobalState } from '../context/GlobalContext';

const WORKOUT_PLANS = {
  gym: {
    title: 'Hypertrophy Split',
    subtitle: '4-Day Push / Pull / Legs + Full Body',
    days: [
      {
        day: 'Day 1 — Push (Chest, Shoulders, Triceps)',
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: '8-10', rest: '90s', muscles: 'Chest' },
          { name: 'Overhead Press', sets: 3, reps: '8-12', rest: '90s', muscles: 'Shoulders' },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '60s', muscles: 'Upper Chest' },
          { name: 'Lateral Raises', sets: 4, reps: '12-15', rest: '45s', muscles: 'Deltoids' },
          { name: 'Tricep Rope Pushdown', sets: 3, reps: '12-15', rest: '45s', muscles: 'Triceps' },
        ]
      },
      {
        day: 'Day 2 — Pull (Back, Biceps)',
        exercises: [
          { name: 'Deadlift', sets: 4, reps: '5-6', rest: '3min', muscles: 'Posterior Chain' },
          { name: 'Barbell Rows', sets: 3, reps: '8-10', rest: '90s', muscles: 'Lats / Rhomboids' },
          { name: 'Pull-Ups or Lat Pulldown', sets: 3, reps: '8-12', rest: '90s', muscles: 'Lats' },
          { name: 'Face Pulls', sets: 3, reps: '15-20', rest: '45s', muscles: 'Rear Delts' },
          { name: 'Barbell Curl', sets: 3, reps: '10-12', rest: '60s', muscles: 'Biceps' },
        ]
      },
      {
        day: 'Day 3 — Legs',
        exercises: [
          { name: 'Back Squat', sets: 4, reps: '6-8', rest: '3min', muscles: 'Quads / Glutes' },
          { name: 'Romanian Deadlift', sets: 3, reps: '8-10', rest: '2min', muscles: 'Hamstrings' },
          { name: 'Leg Press', sets: 3, reps: '10-12', rest: '90s', muscles: 'Quads' },
          { name: 'Walking Lunges', sets: 3, reps: '12 each', rest: '60s', muscles: 'Glutes / Quads' },
          { name: 'Calf Raises', sets: 4, reps: '15-20', rest: '45s', muscles: 'Calves' },
        ]
      },
      {
        day: 'Day 4 — Full Body + Core',
        exercises: [
          { name: 'Power Clean or Box Jump', sets: 3, reps: '5', rest: '2min', muscles: 'Explosive Power' },
          { name: 'Close-Grip Bench Press', sets: 3, reps: '8-10', rest: '90s', muscles: 'Triceps / Chest' },
          { name: 'Cable Row', sets: 3, reps: '10-12', rest: '60s', muscles: 'Back' },
          { name: 'Plank', sets: 3, reps: '60s hold', rest: '45s', muscles: 'Core' },
          { name: 'Ab Wheel Rollout', sets: 3, reps: '10-12', rest: '45s', muscles: 'Abs' },
        ]
      }
    ],
    nutrition: ['Eat 1g protein per lb of bodyweight', 'Caloric surplus of 200-300 kcal', 'Creatine 5g/day', 'Pre-workout meal 90 min before training']
  },
  diabetes: {
    title: 'Diabetic-Friendly Fitness Plan',
    subtitle: 'Low Impact + Glucose Management',
    days: [
      {
        day: 'Day 1 — Low Impact Cardio',
        exercises: [
          { name: '15-min brisk walk (post meal)', sets: 1, reps: '15 min', rest: '—', muscles: 'Whole Body' },
          { name: 'Seated Leg Raises', sets: 2, reps: '15 each', rest: '30s', muscles: 'Quads' },
          { name: 'Resistance Band Row', sets: 2, reps: '12', rest: '45s', muscles: 'Back' },
          { name: 'Deep Breathing / Diaphragm Work', sets: 1, reps: '5 min', rest: '—', muscles: 'Stress Reduction' },
        ]
      },
      {
        day: 'Day 2 — Resistance Band Full Body',
        exercises: [
          { name: 'Band Squat', sets: 3, reps: '15', rest: '45s', muscles: 'Legs' },
          { name: 'Band Chest Press', sets: 3, reps: '12', rest: '45s', muscles: 'Chest' },
          { name: 'Band Deadlift', sets: 3, reps: '12', rest: '60s', muscles: 'Back / Glutes' },
          { name: 'Band Lateral Walk', sets: 2, reps: '10 each', rest: '30s', muscles: 'Hip Abductors' },
        ]
      },
      {
        day: 'Day 3 — Yoga & Flexibility',
        exercises: [
          { name: 'Cat-Cow Stretch', sets: 1, reps: '10 each way', rest: '—', muscles: 'Spine' },
          { name: 'Warrior I & II Poses', sets: 1, reps: '30s each', rest: '—', muscles: 'Full Body' },
          { name: 'Child\'s Pose', sets: 1, reps: '60s hold', rest: '—', muscles: 'Back / Hips' },
          { name: 'Savasana (relaxation)', sets: 1, reps: '5 min', rest: '—', muscles: 'Recovery' },
        ]
      }
    ],
    nutrition: ['Walk 15 min after every meal', 'Check blood sugar before/after exercise', 'Carry fast glucose (juice/dextrose tabs) while training', 'Prefer low-GI pre-workout snacks (apple + nut butter)']
  },
  weight_loss: {
    title: 'Fat-Loss & HIIT Program',
    subtitle: '5-Day Calorie-Burning Protocol',
    days: [
      {
        day: 'Day 1 — HIIT Circuit',
        exercises: [
          { name: 'Jumping Jacks', sets: 3, reps: '45s on / 15s off', rest: '—', muscles: 'Full Body' },
          { name: 'Burpees', sets: 3, reps: '30s on / 30s off', rest: '—', muscles: 'Full Body' },
          { name: 'Mountain Climbers', sets: 3, reps: '40s on / 20s off', rest: '—', muscles: 'Core / Legs' },
          { name: 'High Knees', sets: 3, reps: '45s on / 15s off', rest: '—', muscles: 'Cardio' },
          { name: 'Jump Squats', sets: 3, reps: '30s on / 30s off', rest: '—', muscles: 'Legs / Glutes' },
        ]
      },
      {
        day: 'Day 2 — Strength + Cardio Finisher',
        exercises: [
          { name: 'Goblet Squat (dumbbell)', sets: 4, reps: '12-15', rest: '45s', muscles: 'Legs' },
          { name: 'Push-Ups', sets: 3, reps: 'Max', rest: '60s', muscles: 'Chest / Triceps' },
          { name: 'Dumbbell Rows', sets: 3, reps: '12 each', rest: '45s', muscles: 'Back' },
          { name: '10-min steady jog (finisher)', sets: 1, reps: '10 min', rest: '—', muscles: 'Cardio' },
        ]
      },
      {
        day: 'Day 3 — Yoga + Active Recovery',
        exercises: [
          { name: 'Sun Salutation flow', sets: 3, reps: '5 rounds', rest: '60s', muscles: 'Full Body' },
          { name: 'Pigeon Pose', sets: 1, reps: '60s each', rest: '—', muscles: 'Hips' },
          { name: 'Foam Rolling', sets: 1, reps: '10 min', rest: '—', muscles: 'Recovery' },
        ]
      }
    ],
    nutrition: ['Maintain calorie deficit (300-500 kcal below TDEE)', 'High protein to preserve muscle (1.6g/kg)', 'Drink water before meals to reduce hunger', 'Avoid liquid calories']
  },
  heart: {
    title: 'Cardiac Health Protocol',
    subtitle: 'Zone 2 Cardio + Light Strength',
    days: [
      {
        day: 'Day 1 — Zone 2 Walk/Cycle',
        exercises: [
          { name: 'Brisk Walk / Stationary Bike', sets: 1, reps: '30-40 min at 60-70% max HR', rest: '—', muscles: 'Heart / Legs' },
          { name: 'Gentle Neck Rolls', sets: 1, reps: '10 each', rest: '—', muscles: 'Neck' },
          { name: 'Diaphragmatic Breathing', sets: 1, reps: '5 min', rest: '—', muscles: 'Parasympathetic NS' },
        ]
      },
      {
        day: 'Day 2 — Light Strength',
        exercises: [
          { name: 'Chair Squats (bodyweight)', sets: 3, reps: '12', rest: '60s', muscles: 'Legs' },
          { name: 'Wall Push-Ups', sets: 2, reps: '10-12', rest: '60s', muscles: 'Chest / Arms' },
          { name: 'Seated Band Row', sets: 2, reps: '12', rest: '60s', muscles: 'Back' },
          { name: 'Standing Calf Raises', sets: 2, reps: '15', rest: '30s', muscles: 'Calves' },
        ]
      }
    ],
    nutrition: ['Limit sodium to <1500mg/day', 'Eat omega-3 rich foods (salmon, walnuts, flaxseed)', 'Avoid saturated fats and trans fats', 'DASH diet recommended']
  },
  general: {
    title: 'General Wellness Plan',
    subtitle: 'Balanced Fitness for Everyone',
    days: [
      {
        day: 'Day 1 — Full Body',
        exercises: [
          { name: 'Bodyweight Squat', sets: 3, reps: '15', rest: '45s', muscles: 'Legs' },
          { name: 'Push-Ups', sets: 3, reps: '10-15', rest: '45s', muscles: 'Chest' },
          { name: 'Plank', sets: 3, reps: '30-45s', rest: '30s', muscles: 'Core' },
          { name: 'Lunges', sets: 2, reps: '10 each', rest: '45s', muscles: 'Legs / Glutes' },
        ]
      },
      {
        day: 'Day 2 — Cardio + Flexibility',
        exercises: [
          { name: '20-min brisk walk or jog', sets: 1, reps: '20 min', rest: '—', muscles: 'Cardio' },
          { name: 'Hip flexor stretch', sets: 2, reps: '30s each', rest: '—', muscles: 'Hips' },
          { name: 'Shoulder rolls', sets: 2, reps: '10', rest: '—', muscles: 'Shoulders' },
        ]
      }
    ],
    nutrition: ['Eat whole foods 80% of the time', 'Drink at least 2L water per day', 'Sleep 7-8 hours for recovery', 'Include fruits and vegetables daily']
  }
};

const Workouts = () => {
  const { healthProfile } = useGlobalState();
  const goalKey = healthProfile?.goal || 'general';
  const plan = WORKOUT_PLANS[goalKey] || WORKOUT_PLANS.general;
  const [openDay, setOpenDay] = useState(0);

  return (
    <div className="h-full p-6 flex flex-col gap-6 overflow-y-auto">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Dumbbell className="text-accent-neon" size={28} />
          {plan.title}
        </h1>
        <p className="text-muted text-sm mt-1">{plan.subtitle}</p>
      </div>

      {/* Day accordion */}
      <div className="flex flex-col gap-4">
        {plan.days.map((d, i) => (
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
      <div className="glass-panel p-6 border-l-4 border-l-accent-purple shrink-0">
        <h3 className="font-bold text-sm uppercase tracking-wider text-accent-purple mb-4 flex items-center gap-2">
          <Flame size={16} /> Nutrition Protocols for {plan.title}
        </h3>
        <ul className="space-y-2">
          {plan.nutrition.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
              <span className="text-accent-neon mt-0.5">→</span> {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Workouts;
