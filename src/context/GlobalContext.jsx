import React, { createContext, useContext, useEffect, useState } from 'react';
import { simulateLocalAI } from '../services/aiService';

const GlobalContext = createContext();

export const useGlobalState = () => useContext(GlobalContext);

const setTodayTime = (hours, minutes) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const createSchedule = (profile) => {
  const now = new Date();
  const goal = profile?.goal || 'general';
  const isGymGoal = goal === 'gym';
  const scheduleItems = [
    {
      id: 'wake', title: 'Wake Up', time: setTodayTime(7, 0), priority: 'High',
      details: 'Start your day with a glass of water and set your intentions.',
      actionLabel: 'Acknowledge',
    },
    {
      id: 'hydration', title: 'Hydration Reminder', time: setTodayTime(7, 15), priority: 'Medium',
      details: 'Drink 1–2 glasses of water to support digestion and energy.',
      actionLabel: 'Log water',
    },
    {
      id: 'breakfast', title: 'Breakfast', time: setTodayTime(8, 0), priority: 'High',
      details: 'Fuel up with a balanced meal aligned with your calorie target.',
      actionLabel: 'View breakfast',
    },
    {
      id: 'snack', title: 'Healthy Snack', time: setTodayTime(11, 0), priority: 'Low',
      details: 'Choose a protein-rich snack to stay steady until lunch.',
      actionLabel: 'Log snack',
    },
    {
      id: 'lunch', title: 'Lunch', time: setTodayTime(13, 30), priority: 'High',
      details: 'Aim for a nutrient-dense lunch to support afternoon focus.',
      actionLabel: 'View lunch',
    },
    {
      id: 'workout', title: 'Workout Session', time: setTodayTime(isGymGoal ? 18 : 17, 45), priority: isGymGoal ? 'High' : 'Medium',
      details: 'Complete your planned movement session for strength and energy.',
      actionLabel: 'Start workout',
    },
    {
      id: 'dinner', title: 'Dinner', time: setTodayTime(20, 0), priority: 'Medium',
      details: 'Finish your day with a light, balanced dinner and recovery support.',
      actionLabel: 'View dinner',
    },
    {
      id: 'winddown', title: 'Sleep Preparation', time: setTodayTime(22, 30), priority: 'Low',
      details: 'Begin winding down to improve sleep quality and recovery.',
      actionLabel: 'Prep for sleep',
    },
  ];

  return scheduleItems.map(item => {
    const lateThreshold = 30 * 60 * 1000;
    const isLate = now - item.time > lateThreshold;
    const defaultStatus = now > item.time && isLate ? 'missed' : 'pending';
    return {
      ...item,
      status: defaultStatus,
      notified: false,
    };
  });
};

// Quick actions map to natural-language strings the AI can parse
const QUICK_ACTION_MAP = {
  skipped_meal: 'I skipped a meal today',
  ate_junk:     'I ate junk food today',
  low_budget:   'I have a low budget today',
  high_protein: 'I want high protein today',
};

export const GlobalProvider = ({ children }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profileLabel, setProfileLabel] = useState('Baseline Optimizer');
  const [riskLevel, setRiskLevel] = useState('Low');
  const [dailyCompletion, setDailyCompletion] = useState(0);

  // Health Profile
  const [healthProfile, setHealthProfile] = useState(null); // null = not set up yet

  const [calories, setCalories] = useState({ current: 0, target: 2400 });
  const [macros, setMacros] = useState({
    protein: 0, carbs: 0, fat: 0,
    targetProtein: 150, targetCarbs: 250, targetFat: 80
  });

  const [meals, setMeals] = useState({
    breakfast: { title: 'Not logged yet', cal: 0, status: 'pending' },
    lunch:     { title: 'Not logged yet', cal: 0, status: 'pending' },
    dinner:    { title: 'Not logged yet', cal: 0, status: 'pending' },
    snacks:    { title: 'Not logged yet', cal: 0, status: 'pending' }
  });

  const [pantry, setPantry] = useState([
    'Chicken Breast (500g)', 'Rice (1kg)', 'Broccoli (2 heads)',
    'Eggs (12)', 'Oats (500g)', 'Whey Protein', 'Olive Oil',
    'Greek Yogurt', 'Avocado (2)'
  ]);

  const [schedule, setSchedule] = useState(createSchedule(null));

  // Single source of truth for ALL chat messages (shared across Left Panel + context)
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'ai',
      text: '👋 NutriMind OS online! I can log your meals, suggest recipes from your pantry, help you stay motivated, or answer health questions. Try: "I ate 200g of chicken" or "What should I cook tonight?"'
    }
  ]);

  const [insights, setInsights] = useState({
    adaptation: 'System initialized. Awaiting daily input to calibrate your metabolic engine.',
    behavioral: 'No behavioral patterns detected yet. Start logging your first meal!'
  });

  // Core: process any user text input or quick-action type
  const processUserInput = async (rawInput, contextParams = {}) => {
    // Map quick-action types to human strings
    const input = QUICK_ACTION_MAP[rawInput] || rawInput;
    if (isAnalyzing || !input.trim()) return;

    setIsAnalyzing(true);
    // Push user message immediately so UI updates at once
    setChatHistory(prev => [...prev, { role: 'user', text: input }]);

    try {
      const response = await simulateLocalAI(input, {
        calories, macros, meals, pantry, chatHistory, healthProfile, ...contextParams
      });

      // If the AI returned an error (backend failure, not network), show as system warning
      if (response.isError) {
        setChatHistory(prev => [...prev, {
          role: 'system',
          text: response.message,
        }]);
        return;
      }

      if (response.newMeals)    setMeals(prev => ({ ...prev, ...response.newMeals }));
      if (response.newCalories) setCalories(prev => ({ ...prev, ...response.newCalories }));
      if (response.newMacros)   setMacros(prev => ({ ...prev, ...response.newMacros }));
      if (response.profileLabel) setProfileLabel(response.profileLabel);
      if (response.riskLevel)   setRiskLevel(response.riskLevel);
      if (response.insights)    setInsights(prev => ({ ...prev, ...response.insights }));
      if (response.pantryUpdate) setPantry(response.pantryUpdate);

      // Persist meal to DB when AI logs food
      if (response.newMeals) {
        const token = localStorage.getItem('nm_token');
        const slot = Object.keys(response.newMeals)[0];
        const meal = response.newMeals[slot];
        if (meal?.cal > 0 && meal?.status === 'completed') {
          fetch('/api/user/meal-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              food_name: meal.title,
              calories: meal.cal,
              protein: response.newMacros ? (response.newMacros.protein - macros.protein) : 0,
              carbs: response.newMacros ? (response.newMacros.carbs - macros.carbs) : 0,
              fat: response.newMacros ? (response.newMacros.fat - macros.fat) : 0,
              meal_type: slot,
            }),
          }).catch(console.error);
        }
      }

      // Recompute daily completion based on newly set calories
      const updatedCals = response.newCalories || calories;
      const pct = Math.min(100, Math.round((updatedCals.current / updatedCals.target) * 100));
      if (response.newCalories || response.newMeals) setDailyCompletion(pct);

      setChatHistory(prev => [...prev, { role: 'ai', text: response.message }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, {
        role: 'system',
        text: '⚠️ Neural core error. Please try again.'
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Apply health profile: adjust targets based on profile type
  const applyHealthProfile = (profile) => {
    setHealthProfile(profile);
    let newTargets = {};
    switch (profile.goal) {
      case 'gym':
        newTargets = { targetProtein: 180, targetCarbs: 220, targetFat: 70 };
        setCalories(prev => ({ ...prev, target: 2800 }));
        setProfileLabel('Gym Mode — Hypertrophy');
        break;
      case 'diabetes':
        newTargets = { targetProtein: 130, targetCarbs: 130, targetFat: 60 };
        setCalories(prev => ({ ...prev, target: 1800 }));
        setProfileLabel('Diabetic Protocol — Low GI');
        break;
      case 'weight_loss':
        newTargets = { targetProtein: 160, targetCarbs: 150, targetFat: 55 };
        setCalories(prev => ({ ...prev, target: 1600 }));
        setProfileLabel('Fat-Loss Engine — Deficit Mode');
        break;
      case 'heart':
        newTargets = { targetProtein: 120, targetCarbs: 200, targetFat: 45 };
        setCalories(prev => ({ ...prev, target: 1900 }));
        setProfileLabel('Cardiac Care — Low Sodium Plan');
        break;
      case 'custom':
        newTargets = {
          targetProtein: profile.protein || 150,
          targetCarbs: profile.carbs || 200,
          targetFat: profile.fat || 65
        };
        setCalories(prev => ({ ...prev, target: profile.calories || 2200 }));
        setProfileLabel('Custom Health Blueprint');
        break;
      default:
        newTargets = { targetProtein: 150, targetCarbs: 250, targetFat: 80 };
        setCalories(prev => ({ ...prev, target: 2400 }));
        setProfileLabel('Baseline Optimizer');
    }
    setMacros(prev => ({ ...prev, ...newTargets }));

    // Greet with profile-specific message
    setChatHistory(prev => [...prev, {
      role: 'ai',
      text: `✅ Health profile activated: **${profile.label || profile.goal}**. I've adjusted your calorie targets, macro ratios, and risk thresholds to match your goal. Let's start tracking!`
    }]);
  };

  const notifyInApp = (message) => {
    setChatHistory(prev => [...prev, { role: 'system', text: `🔔 ${message}` }]);
  };

  const notifyBrowser = (title, message) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, { body: message, icon: '/logo192.png' });
    }
  };

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => null);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSchedule(prev => prev.map(item => {
        const now = new Date();
        if (item.status !== 'pending') return item;

        const targetTime = item.time;
        const minutesUntil = Math.round((targetTime - now) / 60000);
        if (minutesUntil <= 15 && minutesUntil >= 0 && !item.notified) {
          notifyInApp(`Your planned ${item.title.toLowerCase()} starts in ${minutesUntil} minutes.`);
          notifyBrowser('NutriMind Reminder', `Your planned ${item.title.toLowerCase()} starts in ${minutesUntil} minutes.`);
          return { ...item, notified: true };
        }

        if (now > new Date(targetTime.getTime() + 30 * 60000) && !item.notified && item.status === 'pending') {
          notifyInApp(`You missed your planned ${item.title.toLowerCase()}. You can still complete it or adjust your day.`);
          notifyBrowser('NutriMind Reminder', `You missed your planned ${item.title.toLowerCase()}.`);
          return { ...item, status: 'missed', notified: true };
        }

        return item;
      }));
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSchedule(createSchedule(healthProfile));
  }, [healthProfile]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const completeScheduleItem = (itemId) => {
    setSchedule(prev => {
      const updated = prev.map(item => item.id === itemId ? { ...item, status: 'completed' } : item);
      const completedItem = prev.find(item => item.id === itemId);
      if (completedItem) {
        notifyInApp(`Nice work! ${completedItem.title} is marked complete.`);
        notifyBrowser('NutriMind', `${completedItem.title} completed.`);
      }
      return updated;
    });
  };

  const regenerateSchedule = () => setSchedule(createSchedule(healthProfile, calories, meals, macros));

  const charts = {
    consistency: [
      { day: 'Mon', value: 80 },
      { day: 'Tue', value: 95 },
      { day: 'Wed', value: 90 },
      { day: 'Thu', value: 85 },
      { day: 'Fri', value: 70 },
      { day: 'Today', value: dailyCompletion || 5 }
    ],
    macros: [
      { name: 'Protein', value: macros.protein > 0 ? macros.protein : 1 },
      { name: 'Carbs',   value: macros.carbs   > 0 ? macros.carbs   : 1 },
      { name: 'Fat',     value: macros.fat      > 0 ? macros.fat     : 1 }
    ]
  };

  return (
    <GlobalContext.Provider value={{
      isAnalyzing, profileLabel, riskLevel, dailyCompletion,
      calories, macros, meals, pantry, chatHistory, insights, charts,
      healthProfile, schedule,
      processUserInput, setPantry, applyHealthProfile,
      completeScheduleItem, regenerateSchedule
    }}>
      {children}
    </GlobalContext.Provider>
  );
};
