import React, { createContext, useContext, useState } from 'react';
import { simulateLocalAI } from '../services/aiService';

const GlobalContext = createContext();

export const useGlobalState = () => useContext(GlobalContext);

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

      if (response.newMeals)    setMeals(prev => ({ ...prev, ...response.newMeals }));
      if (response.newCalories) setCalories(prev => ({ ...prev, ...response.newCalories }));
      if (response.newMacros)   setMacros(prev => ({ ...prev, ...response.newMacros }));
      if (response.profileLabel) setProfileLabel(response.profileLabel);
      if (response.riskLevel)   setRiskLevel(response.riskLevel);
      if (response.insights)    setInsights(prev => ({ ...prev, ...response.insights }));
      if (response.pantryUpdate) setPantry(response.pantryUpdate);

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
      healthProfile,
      processUserInput, setPantry, applyHealthProfile
    }}>
      {children}
    </GlobalContext.Provider>
  );
};
