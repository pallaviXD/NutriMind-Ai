// Advanced Local AI Simulator — NutriMind OS

const FOOD_DB = {
  'chicken':  { cal: 165, p: 31,   c: 0,    f: 3.6, unit: '100g' },
  'rice':     { cal: 130, p: 2.7,  c: 28,   f: 0.3, unit: '100g' },
  'broccoli': { cal: 55,  p: 3.7,  c: 11,   f: 0.6, unit: '100g' },
  'egg':      { cal: 78,  p: 6,    c: 0.6,  f: 5,   unit: '1 each' },
  'eggs':     { cal: 78,  p: 6,    c: 0.6,  f: 5,   unit: '1 each' },
  'oats':     { cal: 389, p: 16.9, c: 66.3, f: 6.9, unit: '100g' },
  'whey':     { cal: 120, p: 24,   c: 3,    f: 1,   unit: '1 scoop (30g)' },
  'protein':  { cal: 120, p: 24,   c: 3,    f: 1,   unit: '1 scoop (30g)' },
  'pizza':    { cal: 285, p: 12,   c: 36,   f: 10,  unit: '1 slice' },
  'burger':   { cal: 354, p: 20,   c: 29,   f: 17,  unit: '1 burger' },
  'apple':    { cal: 95,  p: 0.5,  c: 25,   f: 0.3, unit: '1 medium' },
  'banana':   { cal: 105, p: 1.3,  c: 27,   f: 0.4, unit: '1 medium' },
  'yogurt':   { cal: 100, p: 17,   c: 6,    f: 0.7, unit: '100g' },
  'avocado':  { cal: 160, p: 2,    c: 9,    f: 15,  unit: '1 medium' },
  'salmon':   { cal: 208, p: 28,   c: 0,    f: 10,  unit: '100g' },
  'pasta':    { cal: 131, p: 5,    c: 25,   f: 1.1, unit: '100g cooked' },
  'bread':    { cal: 79,  p: 2.7,  c: 15,   f: 1,   unit: '1 slice' },
  'milk':     { cal: 61,  p: 3.2,  c: 4.8,  f: 3.3, unit: '100ml' },
};

const delay = ms => new Promise(res => setTimeout(res, ms));

const MOTIVATIONAL_QUOTES = [
  "Progress is progress, no matter how small. Keep going! 💪",
  "Your body is your most prized possession. Take care of it.",
  "Every expert was once a beginner. Stay consistent.",
  "You don't have to be perfect. Just be better than yesterday.",
  "Small daily improvements lead to stunning results over time.",
];

const getRandom = arr => arr[Math.floor(Math.random() * arr.length)];

export const simulateLocalAI = async (input, context) => {
  await delay(1000 + Math.random() * 800);
  const lower = input.toLowerCase().trim();
  const { calories, macros, meals, pantry, healthProfile } = context;

  const res = {
    message: '',
    newMeals: null,
    newCalories: null,
    newMacros: null,
    profileLabel: null,
    riskLevel: null,
    insights: null,
    pantryUpdate: null,
  };

  // ─── 1. FOOD LOGGING ───────────────────────────────────────────────────────
  const logTriggers = ['ate', 'had', 'just ate', 'eaten', 'consumed', 'drank', 'drink'];
  const isLogging = logTriggers.some(t => lower.includes(t));

  if (isLogging) {
    // Find which food is mentioned
    let foundKey = null;
    for (const key of Object.keys(FOOD_DB)) {
      if (lower.includes(key)) { foundKey = key; break; }
    }

    if (foundKey) {
      const food = FOOD_DB[foundKey];
      // Parse quantity  e.g. "200g", "3 eggs", "2 slices"
      const numMatch = lower.match(/(\d+(?:\.\d+)?)\s*(g|ml|kg|scoop|slice|piece|serving|cup)?/);
      let multiplier = 1;
      let qty = `1 serving`;

      if (numMatch) {
        const amt = parseFloat(numMatch[1]);
        const unit = numMatch[2] || '';
        if (food.unit === '100g' || food.unit === '100ml') {
          multiplier = amt / 100;
          qty = `${amt}${unit || 'g'}`;
        } else {
          multiplier = amt;
          qty = `${amt} ${foundKey}`;
        }
      }

      const addCal = Math.round(food.cal * multiplier);
      const addP   = Math.round(food.p   * multiplier);
      const addC   = Math.round(food.c   * multiplier);
      const addF   = Math.round(food.f   * multiplier);

      const newCals = { ...calories, current: calories.current + addCal };
      const newMac  = {
        ...macros,
        protein: macros.protein + addP,
        carbs:   macros.carbs   + addC,
        fat:     macros.fat     + addF,
      };

      // Auto-assign to next pending meal slot
      const mealKeys = ['breakfast', 'lunch', 'dinner', 'snacks'];
      const slot = mealKeys.find(k => meals[k].status === 'pending') || 'snacks';
      const newMeals = {
        ...meals,
        [slot]: { title: `${qty} ${foundKey}`, cal: addCal, status: 'completed' }
      };

      // Diabetes: warn about high carbs
      const isDiabetic = healthProfile?.goal === 'diabetes';
      let extraNote = '';
      if (isDiabetic && addC > 30) {
        extraNote = ` ⚠️ Heads up: this meal is relatively high in carbs (${addC}g). Consider pairing it with fiber-rich veggies to reduce the glycemic impact.`;
        res.riskLevel = 'Medium';
      } else if ((foundKey === 'pizza' || foundKey === 'burger')) {
        extraNote = ` No stress about a treat! Let's make sure your next meal is protein-heavy to rebalance. 💪`;
        res.riskLevel = 'Medium';
      } else {
        res.riskLevel = 'Low';
      }

      res.newCalories = newCals;
      res.newMacros   = newMac;
      res.newMeals    = newMeals;
      res.insights    = {
        adaptation: `Logged ${addCal} kcal to ${slot}. Remaining budget: ${Math.max(0, newCals.target - newCals.current)} kcal.`,
        behavioral: `+${addP}g protein, +${addC}g carbs, +${addF}g fat tracked. ${getRandom(MOTIVATIONAL_QUOTES)}`
      };
      res.message = `✅ Logged **${qty} of ${foundKey}** → ${addCal} kcal | ${addP}g protein | ${addC}g carbs | ${addF}g fat.${extraNote}`;
      return res;
    }

    // Food mentioned but not in DB
    res.message = `I heard you ate something, but I couldn't identify the specific food. Try being more specific, like "I ate 200g of chicken" or "I had 3 eggs".`;
    return res;
  }

  // ─── 2. QUICK ACTIONS ──────────────────────────────────────────────────────
  if (lower.includes('skipped a meal')) {
    const slot = ['breakfast','lunch','dinner'].find(k => meals[k].status === 'pending') || 'dinner';
    res.newMeals = { ...meals, [slot]: { title: 'Skipped', cal: 0, status: 'skipped' } };
    res.riskLevel = 'Medium';
    res.insights = {
      adaptation: `${slot} skipped. Redistributing calorie budget to remaining meals.`,
      behavioral: 'Irregular meal timing detected. Try to stay consistent for better metabolic health.'
    };
    res.message = `⚠️ Marked **${slot}** as skipped. Skipping meals occasionally is okay, but prolonged skipping can slow your metabolism. Make sure to hydrate and eat a balanced next meal!`;
    return res;
  }

  if (lower.includes('junk food')) {
    res.riskLevel = 'High';
    res.insights = {
      adaptation: 'High-sodium, high-fat intake detected. Increasing hydration recommendation.',
      behavioral: 'Junk food pattern logged. Suggest planning next 2 meals in advance to break the cycle.'
    };
    res.message = `🍕 Junk food logged! No shame — it happens. Here's the plan: drink 500ml of water now, go for a 15-min walk if possible, and make your next meal high in protein + fiber to get back on track. You're still in control! 💪`;
    return res;
  }

  if (lower.includes('low budget')) {
    res.insights = {
      adaptation: 'Budget constraint active. Switching to high-protein, low-cost meal recommendations.',
      behavioral: 'Econmic stress may affect food choices. Smart planning activated.'
    };
    res.message = `💰 Budget mode activated! Here are your best high-protein, low-cost options:\n\n• **Eggs** — ~₹10/egg, 6g protein each\n• **Oats** — cheap, filling, ~17g protein/100g\n• **Lentils** — ~₹60/kg, 9g protein/100g cooked\n• **Chicken thighs** — cheaper than breast, same protein\n\nWant me to plan a full day of meals under ₹200?`;
    return res;
  }

  if (lower.includes('high protein')) {
    const pLeft = Math.max(0, macros.targetProtein - macros.protein);
    res.insights = {
      adaptation: `High-protein goal active. Need ${pLeft}g more protein today.`,
      behavioral: 'Protein-prioritization behavior detected. Excellent for muscle retention and satiety.'
    };
    res.message = `💪 High-protein mode! You still need **${pLeft}g of protein** today. Best options from your pantry:\n\n• Chicken breast: 31g/100g\n• Whey shake: 24g/scoop\n• Greek yogurt: 17g/100g\n• Eggs: 6g each\n\nTry: 150g chicken + 1 scoop whey shake = ~70g protein in one go!`;
    return res;
  }

  // ─── 3. RECIPE / WHAT TO EAT ───────────────────────────────────────────────
  if (lower.includes('recipe') || lower.includes('what should i eat') || lower.includes('what to eat') || lower.includes('cook') || lower.includes('suggest') || lower.includes('meal idea')) {
    const pLeft   = Math.max(0, macros.targetProtein - macros.protein);
    const calsLeft = Math.max(0, calories.target - calories.current);
    const isDiabetic = healthProfile?.goal === 'diabetes';
    const isGym = healthProfile?.goal === 'gym';

    if (calsLeft < 300) {
      res.message = `You're close to your daily target with only **${calsLeft} kcal** left. I'd recommend a light option:\n\n• 1 apple + black coffee\n• A small handful of nuts (unsalted)\n\nSave the rest for hydration. Great work today! 🌟`;
      return res;
    }

    const hasPantryItem = item => pantry.some(p => p.toLowerCase().includes(item));

    if (isDiabetic) {
      res.message = `🩺 Diabetic-friendly suggestion based on your pantry:\n\n**Low-GI Chicken Bowl**\n1. 150g grilled chicken breast (protein: 46g)\n2. 100g steamed broccoli\n3. 1 medium avocado (healthy fats)\n\nThis meal is very low glycemic, high fiber, and high protein. No blood sugar spikes! ✅`;
    } else if (isGym) {
      res.message = `🏋️ Gym-optimized meal suggestion:\n\n**Mass Builder Plate**\n1. 200g chicken breast (62g protein)\n2. 150g cooked rice (40g carbs)\n3. 1 scoop whey post-workout (24g protein)\n\nTotal: ~${Math.round(200*1.65 + 150*1.30 + 120)} kcal | 86g protein | 67g carbs\n\nEat the solid food within 1 hour of your workout! 🔥`;
    } else if (hasPantryItem('chicken') && pLeft > 30) {
      res.message = `Based on your pantry and a remaining **${pLeft}g protein** target, here's tonight's blueprint:\n\n**Lemon Herb Chicken & Rice**\n1. Pan-sear 150g chicken with olive oil and lemon\n2. Serve over 100g steamed rice\n3. Side of broccoli for fiber and micronutrients\n\n~650 kcal | 55g protein | 58g carbs\n\nWant me to log this meal when you're done?`;
    } else {
      res.message = `Quick high-protein idea with what you have:\n\n**Power Omelette**\n• 3 eggs + a splash of milk\n• Dice in whatever veggies are in the fridge\n• Optional: sprinkle some cheese\n\n~340 kcal | 24g protein | Takes 5 minutes!\n\nType "I ate 3 eggs" when you're done and I'll log it instantly. 🍳`;
    }
    return res;
  }

  // ─── 4. MENTAL / MOTIVATION ────────────────────────────────────────────────
  if (lower.includes('fail') || lower.includes('give up') || lower.includes('hard') || lower.includes('tired') || lower.includes('demotivated') || lower.includes('lazy') || lower.includes('cheat')) {
    res.riskLevel = 'Medium';
    res.insights = {
      adaptation: 'Pausing strict optimization. Prioritizing user psychological recovery.',
      behavioral: 'Motivational friction detected. Reducing targets by 20% for the next 24h.'
    };
    res.message = `I hear you, and that feeling is 100% normal. 💙\n\nHere's the truth: **the fact that you're still here and logging means you haven't given up.** Progress is nonlinear.\n\n📌 Quick reset protocol:\n1. Drink a big glass of water right now\n2. Step outside for 5 minutes\n3. Don't track calories for the next hour — just eat something nourishing\n4. Come back and we'll plan tomorrow together\n\n${getRandom(MOTIVATIONAL_QUOTES)}`;
    return res;
  }

  // ─── 5. GREETING / HELP ────────────────────────────────────────────────────
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('help') || lower === '') {
    const pct = Math.round((calories.current / calories.target) * 100) || 0;
    res.message = `Hey! 👋 I'm NutriMind, your AI health partner. You're at **${pct}%** of today's goal.\n\nHere's what I can do:\n• **Log meals** → "I ate 200g of chicken"\n• **Get recipes** → "What should I cook tonight?"\n• **Quick actions** → Use the buttons above\n• **Motivation** → Just talk to me!\n• **Budget meals** → "I have a low budget today"\n\nWhat would you like to do?`;
    return res;
  }

  // ─── 6. WATER / HYDRATION ──────────────────────────────────────────────────
  if (lower.includes('water') || lower.includes('hydrat')) {
    res.message = `💧 Hydration check! The standard recommendation is **8 glasses (2L) per day**, but if you're active or in a hot climate, aim for 3L+.\n\nPro tip: drink 500ml of water first thing in the morning before any food. It kickstarts your metabolism and reduces false hunger signals. Set a reminder every 2 hours!`;
    return res;
  }

  // ─── 7. WEIGHT / BMI ───────────────────────────────────────────────────────
  if (lower.includes('weight') || lower.includes('bmi') || lower.includes('kg') || lower.includes('lbs')) {
    res.message = `For accurate weight tracking, I recommend:\n\n• Weigh yourself **same time every morning** (after bathroom, before eating)\n• Track weekly averages, not daily fluctuations\n• Weight can vary 1-2kg daily due to water retention — don't stress!\n\nIf you tell me your current weight and goal weight, I can refine your calorie targets for a more precise timeline. 🎯`;
    return res;
  }

  // ─── 8. FALLBACK ───────────────────────────────────────────────────────────
  res.message = `I'm not sure I understood that fully. Here are some things you can ask me:\n\n• "I ate 150g of salmon" — to log a meal\n• "What should I cook?" — for recipe ideas\n• "I feel tired today" — for motivation\n• "I skipped lunch" — to mark a meal\n• "I have a low budget" — for budget meal ideas\n\nJust talk to me naturally! 😊`;
  return res;
};
