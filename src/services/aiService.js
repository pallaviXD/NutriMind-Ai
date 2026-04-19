// NutriMind OS — AI Service (calls backend /api/user/chat → Gemini)

export const simulateLocalAI = async (input, context) => {
  const token = localStorage.getItem('nm_token');

  try {
    const res = await fetch('/api/user/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: input, context }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      console.error('Chat API error:', data.error);
      return fallback(input, context);
    }

    return {
      message: data.message || '🤔 No response. Try again!',
      newCalories: data.newCalories || null,
      newMacros: data.newMacros || null,
      newMeals: data.newMeals || null,
      profileLabel: data.profileLabel || null,
      riskLevel: data.riskLevel || null,
      insights: data.insights || null,
      pantryUpdate: data.pantryUpdate || null,
    };
  } catch (err) {
    console.error('Network error:', err);
    return fallback(input, context);
  }
};

// ─── Smart fallback when backend/AI is unavailable ───────────────────────────
const FOOD_DB = {
  chicken: { cal: 165, p: 31, c: 0, f: 3.6 },
  rice:    { cal: 130, p: 2.7, c: 28, f: 0.3 },
  egg:     { cal: 78,  p: 6,  c: 0.6, f: 5 },
  eggs:    { cal: 78,  p: 6,  c: 0.6, f: 5 },
  oats:    { cal: 389, p: 16.9, c: 66.3, f: 6.9 },
  banana:  { cal: 105, p: 1.3, c: 27, f: 0.4 },
  apple:   { cal: 95,  p: 0.5, c: 25, f: 0.3 },
  salmon:  { cal: 208, p: 28, c: 0, f: 10 },
  bread:   { cal: 79,  p: 2.7, c: 15, f: 1 },
  milk:    { cal: 61,  p: 3.2, c: 4.8, f: 3.3 },
  yogurt:  { cal: 100, p: 17, c: 6, f: 0.7 },
  pasta:   { cal: 131, p: 5, c: 25, f: 1.1 },
};

const fallback = async (input, context) => {
  await new Promise(r => setTimeout(r, 600));
  const lower = input.toLowerCase();
  const { calories, macros, meals } = context;

  const base = {
    message: '', newMeals: null, newCalories: null, newMacros: null,
    profileLabel: null, riskLevel: null, insights: null, pantryUpdate: null,
  };

  // Food logging
  if (['ate', 'had', 'eaten', 'consumed', 'drank'].some(t => lower.includes(t))) {
    const key = Object.keys(FOOD_DB).find(k => lower.includes(k));
    if (key) {
      const food = FOOD_DB[key];
      const amt = parseFloat(lower.match(/(\d+(?:\.\d+)?)/)?.[1] || '100');
      const m = amt / 100;
      const addCal = Math.round(food.cal * m);
      const slot = ['breakfast','lunch','dinner','snacks'].find(k => meals[k].status === 'pending') || 'snacks';
      return {
        ...base,
        newCalories: { ...calories, current: calories.current + addCal },
        newMacros: { ...macros, protein: macros.protein + Math.round(food.p * m), carbs: macros.carbs + Math.round(food.c * m), fat: macros.fat + Math.round(food.f * m) },
        newMeals: { [slot]: { title: `${amt}g ${key}`, cal: addCal, status: 'completed' } },
        message: `✅ Logged **${amt}g of ${key}** → ${addCal} kcal added to ${slot}.`,
        riskLevel: 'Low',
      };
    }
  }

  return {
    ...base,
    message: `🔌 AI is offline right now. The server may be starting up — try again in a moment!\n\nIn the meantime you can still log meals like:\n• "I ate 200g chicken"\n• "I had 3 eggs for breakfast"`,
  };
};
