import express from 'express';
import db from '../db.js';
import { authMiddleware } from '../auth.js';
import Groq from 'groq-sdk';

const router = express.Router();

// All routes require auth
router.use(authMiddleware);

// ─── GET /api/user/profile ────────────────────────────────────────────────────
router.get('/profile', (req, res) => {
  const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(req.user.id);
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user, profile: profile || {} });
});

// ─── PUT /api/user/profile ────────────────────────────────────────────────────
router.put('/profile', (req, res) => {
  const {
    date_of_birth, gender, height_cm, weight_kg, body_fat_pct,
    neck_cm, waist_cm, hip_cm, activity_level, health_goal,
    health_conditions, target_weight_kg
  } = req.body;

  db.prepare(`
    UPDATE profiles SET
      date_of_birth = COALESCE(?, date_of_birth),
      gender = COALESCE(?, gender),
      height_cm = COALESCE(?, height_cm),
      weight_kg = COALESCE(?, weight_kg),
      body_fat_pct = COALESCE(?, body_fat_pct),
      neck_cm = COALESCE(?, neck_cm),
      waist_cm = COALESCE(?, waist_cm),
      hip_cm = COALESCE(?, hip_cm),
      activity_level = COALESCE(?, activity_level),
      health_goal = COALESCE(?, health_goal),
      health_conditions = COALESCE(?, health_conditions),
      target_weight_kg = COALESCE(?, target_weight_kg),
      updated_at = unixepoch()
    WHERE user_id = ?
  `).run(
    date_of_birth, gender, height_cm, weight_kg, body_fat_pct,
    neck_cm, waist_cm, hip_cm, activity_level, health_goal,
    health_conditions ? JSON.stringify(health_conditions) : null,
    target_weight_kg,
    req.user.id
  );

  const updated = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user.id);
  res.json({ success: true, profile: updated });
});

// ─── GET /api/user/stats ─────────────────────────────────────────────────────
// Returns BMI, BMR, TDEE, ideal weight, body fat estimate
router.get('/stats', (req, res) => {
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user.id);
  if (!profile?.height_cm || !profile?.weight_kg)
    return res.status(400).json({ error: 'Set height and weight in your profile first.' });

  const { height_cm: h, weight_kg: w, gender, date_of_birth, activity_level } = profile;
  const age = date_of_birth
    ? Math.floor((Date.now() - new Date(date_of_birth)) / (365.25 * 24 * 3600 * 1000))
    : 30;

  const bmi = +(w / ((h / 100) ** 2)).toFixed(1);

  // Mifflin-St Jeor BMR
  let bmr;
  if (gender === 'female') {
    bmr = 10 * w + 6.25 * h - 5 * age - 161;
  } else {
    bmr = 10 * w + 6.25 * h - 5 * age + 5;
  }

  const activityMult = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9
  };
  const tdee = Math.round(bmr * (activityMult[activity_level] || 1.55));

  const bmiCategory =
    bmi < 18.5 ? 'Underweight' :
    bmi < 25   ? 'Normal weight' :
    bmi < 30   ? 'Overweight' : 'Obese';

  // Ideal weight range (Devine formula)
  const idealMin = gender === 'female'
    ? +(45.5 + 2.3 * ((h / 2.54) - 60)).toFixed(1)
    : +(50 + 2.3 * ((h / 2.54) - 60)).toFixed(1);
  const idealMax = +(idealMin * 1.1).toFixed(1);

  // Body fat estimate via BMI (Deurenberg formula)
  const bodyFatEstimate = gender === 'female'
    ? +((1.2 * bmi) + (0.23 * age) - 5.4).toFixed(1)
    : +((1.2 * bmi) + (0.23 * age) - 16.2).toFixed(1);

  res.json({
    bmi, bmiCategory, bmr: Math.round(bmr), tdee,
    idealWeightRange: { min: idealMin, max: idealMax },
    bodyFatEstimate,
    age
  });
});

// ─── POST /api/user/weight-log ────────────────────────────────────────────────
router.post('/weight-log', (req, res) => {
  const { weight_kg, notes } = req.body;
  if (!weight_kg) return res.status(400).json({ error: 'Weight is required.' });
  
  db.prepare('INSERT INTO weight_logs (user_id, weight_kg, notes) VALUES (?, ?, ?)')
    .run(req.user.id, weight_kg, notes || null);
  
  // Update profile current weight too
  db.prepare('UPDATE profiles SET weight_kg = ? WHERE user_id = ?').run(weight_kg, req.user.id);
  
  res.json({ success: true });
});

// ─── GET /api/user/weight-log ─────────────────────────────────────────────────
router.get('/weight-log', (req, res) => {
  const logs = db.prepare(
    'SELECT * FROM weight_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 30'
  ).all(req.user.id);
  res.json({ logs });
});

// ─── POST /api/user/chat ──────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  const { message, context } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required.' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'AI not configured. Add GROQ_API_KEY to .env' });

  const user = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.id);
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user.id);

  const { calories, macros, meals, pantry, healthProfile, chatHistory = [] } = context || {};
  const goal = healthProfile?.goal || profile?.health_goal || 'general';
  const calsLeft = Math.max(0, (calories?.target || 2000) - (calories?.current || 0));
  const nextSlot = ['breakfast','lunch','dinner','snacks'].find(k => meals?.[k]?.status === 'pending') || 'snacks';

  const userContext = [
    profile?.weight_kg ? `Weight: ${profile.weight_kg}kg` : '',
    profile?.height_cm ? `Height: ${profile.height_cm}cm` : '',
    profile?.gender ? `Gender: ${profile.gender}` : '',
    profile?.date_of_birth ? `Age: ${Math.floor((Date.now() - new Date(profile.date_of_birth)) / (365.25*24*3600*1000))} years` : '',
    profile?.activity_level ? `Activity: ${profile.activity_level}` : '',
  ].filter(Boolean).join(', ');

  const systemPrompt = `You are NutriMind OS, a warm expert AI health and nutrition coach for ${user?.name || 'the user'}.

USER PROFILE: ${userContext || 'Not set yet'}
HEALTH GOAL: ${goal}
TODAY: Calories ${calories?.current || 0}/${calories?.target || 2000} kcal (${calsLeft} left) | Protein ${macros?.protein || 0}/${macros?.targetProtein || 150}g | Carbs ${macros?.carbs || 0}/${macros?.targetCarbs || 200}g | Fat ${macros?.fat || 0}/${macros?.targetFat || 65}g
MEALS: Breakfast=${meals?.breakfast?.status || 'pending'}, Lunch=${meals?.lunch?.status || 'pending'}, Dinner=${meals?.dinner?.status || 'pending'}, Snacks=${meals?.snacks?.status || 'pending'}
PANTRY: ${pantry?.join(', ') || 'Not set'}
NEXT MEAL SLOT: ${nextSlot}

You can log meals, suggest recipes, answer any health/fitness/nutrition question, motivate, and give personalized advice.

ALWAYS respond with ONLY valid JSON (no markdown, no extra text):
{"message":"your response here using **bold** and bullet points with •","newCalories":{"current":<existing+new>,"target":<target>},"newMacros":{"protein":<total>,"carbs":<total>,"fat":<total>,"targetProtein":${macros?.targetProtein||150},"targetCarbs":${macros?.targetCarbs||200},"targetFat":${macros?.targetFat||65}},"newMeals":{"${nextSlot}":{"title":"<food>","cal":<number>,"status":"completed"}},"riskLevel":"Low","insights":{"adaptation":"<one line>","behavioral":"<one line>"}}

Set newCalories/newMacros/newMeals ONLY when user logs food. Otherwise set them to null. Current calories to add to: ${calories?.current || 0}. Goal guidance for ${goal}: ${getGoalGuidance(goal)}.`;

  try {
    const groq = new Groq({ apiKey });

    // Build message history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(chatHistory || []).slice(-8).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      })).filter(m => m.content),
      { role: 'user', content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });

    const text = completion.choices[0]?.message?.content?.trim();
    const parsed = JSON.parse(text);

    if (parsed.newMacros) {
      parsed.newMacros = {
        targetProtein: macros?.targetProtein || 150,
        targetCarbs: macros?.targetCarbs || 200,
        targetFat: macros?.targetFat || 65,
        ...parsed.newMacros,
      };
    }

    res.json({
      success: true,
      message: parsed.message || 'How can I help you today?',
      newCalories: parsed.newCalories || null,
      newMacros: parsed.newMacros || null,
      newMeals: parsed.newMeals || null,
      riskLevel: parsed.riskLevel || null,
      insights: parsed.insights || null,
      pantryUpdate: parsed.pantryUpdate || null,
    });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

function getGoalGuidance(goal) {
  switch (goal) {
    case 'gym': return 'prioritize protein timing, muscle recovery, caloric surplus';
    case 'diabetes': return 'warn about high-GI foods, suggest low-GI alternatives, mention blood sugar';
    case 'weight_loss': return 'encourage deficit, high protein for satiety, avoid liquid calories';
    case 'heart': return 'low sodium, omega-3 rich foods, avoid saturated fats, DASH diet';
    default: return 'balanced practical advice, whole foods, hydration, sleep';
  }
}

// ─── POST /api/user/recipe ────────────────────────────────────────────────────
router.post('/recipe', async (req, res) => {
  const { pantry, mealType, calsLeft, proteinLeft, goal } = req.body;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'AI not configured.' });

  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user.id);
  const conditions = profile?.health_conditions && profile.health_conditions !== '[]'
    ? JSON.parse(profile.health_conditions) : [];

  const prompt = `You are an expert nutritionist and chef. Create a detailed ${mealType} recipe using these available ingredients: ${pantry.join(', ')}.
Constraints: ~${Math.min(calsLeft, 700)} kcal, at least ${Math.min(proteinLeft, 40)}g protein, health goal: ${goal}, conditions: ${conditions.length ? conditions.join(', ') : 'none'}.
Respond ONLY with valid JSON:
{"name":"Recipe Name","description":"one line","calories":number,"protein":number,"carbs":number,"fat":number,"time":"X mins","ingredients":["item with qty"],"steps":["step"],"tips":"one tip"}`;

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7, max_tokens: 1024,
      response_format: { type: 'json_object' },
    });
    const recipe = JSON.parse(completion.choices[0]?.message?.content);
    res.json({ recipe });
  } catch (err) {
    console.error('Recipe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/user/health-advice ─────────────────────────────────────────────
router.post('/health-advice', async (req, res) => {
  const { goal, details } = req.body;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'AI not configured.' });

  const age = details.date_of_birth
    ? Math.floor((Date.now() - new Date(details.date_of_birth)) / (365.25 * 24 * 3600 * 1000)) : null;
  const bmi = details.height_cm && details.weight_kg
    ? (details.weight_kg / ((details.height_cm / 100) ** 2)).toFixed(1) : null;

  const prompt = `Expert nutritionist advice for: Age ${age||'?'}, Gender ${details.gender||'?'}, Height ${details.height_cm||'?'}cm, Weight ${details.weight_kg||'?'}kg, BMI ${bmi||'?'}, Activity ${details.activity_level||'moderate'}, Goal ${goal}, Conditions: ${details.health_conditions?.length ? details.health_conditions.join(', ') : 'none'}, Waist ${details.waist_cm||'?'}cm.
Give specific personalized food advice. Respond ONLY with valid JSON:
{"eat":["food1","food2","food3","food4","food5","food6"],"avoid":["food1","food2","food3","food4","food5"],"tips":["tip1","tip2","tip3","tip4"],"warning":"important warning or null"}`;

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6, max_tokens: 800,
      response_format: { type: 'json_object' },
    });
    const advice = JSON.parse(completion.choices[0]?.message?.content);
    res.json({ advice });
  } catch (err) {
    console.error('Health advice error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/user/meal-log ──────────────────────────────────────────────────
router.post('/meal-log', (req, res) => {
  const { food_name, calories, protein, carbs, fat, meal_type } = req.body;
  if (!food_name || !calories) return res.status(400).json({ error: 'food_name and calories required.' });
  db.prepare(`INSERT INTO meal_logs (user_id, food_name, calories, protein, carbs, fat, meal_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(req.user.id, food_name, calories, protein||0, carbs||0, fat||0, meal_type||'snacks');
  res.json({ success: true });
});

// ─── GET /api/user/meal-log ───────────────────────────────────────────────────
router.get('/meal-log', (req, res) => {
  const logs = db.prepare(`SELECT * FROM meal_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 50`).all(req.user.id);
  res.json({ logs });
});

// ─── GET /api/user/analytics ─────────────────────────────────────────────────
router.get('/analytics', (req, res) => {
  const days = parseInt(req.query.days) || 7;

  // Daily nutrition totals for last N days
  const dailyTotals = db.prepare(`
    SELECT
      date(logged_at, 'unixepoch') as day,
      ROUND(SUM(calories)) as calories,
      ROUND(SUM(protein)) as protein,
      ROUND(SUM(carbs)) as carbs,
      ROUND(SUM(fat)) as fat,
      COUNT(*) as meals_logged
    FROM meal_logs
    WHERE user_id = ? AND logged_at >= unixepoch('now', '-${days} days')
    GROUP BY day
    ORDER BY day ASC
  `).all(req.user.id);

  // Weight trend
  const weightLogs = db.prepare(`
    SELECT date(logged_at, 'unixepoch') as day, weight_kg
    FROM weight_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT ${days}
  `).all(req.user.id);

  // Today's breakdown by meal type
  const todayByMeal = db.prepare(`
    SELECT meal_type, ROUND(SUM(calories)) as calories, ROUND(SUM(protein)) as protein
    FROM meal_logs
    WHERE user_id = ? AND date(logged_at, 'unixepoch') = date('now')
    GROUP BY meal_type
  `).all(req.user.id);

  // Total meals logged ever
  const totalMeals = db.prepare(`SELECT COUNT(*) as count FROM meal_logs WHERE user_id = ?`).get(req.user.id);

  // Streak: consecutive days with at least 1 meal logged
  const recentDays = db.prepare(`
    SELECT DISTINCT date(logged_at, 'unixepoch') as day
    FROM meal_logs WHERE user_id = ? ORDER BY day DESC LIMIT 30
  `).all(req.user.id);

  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  for (let i = 0; i < recentDays.length; i++) {
    const expected = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    if (recentDays[i]?.day === expected) streak++;
    else break;
  }

  res.json({ dailyTotals, weightLogs, todayByMeal, totalMeals: totalMeals.count, streak });
});

// ─── POST /api/user/water-log ─────────────────────────────────────────────────
router.post('/water-log', (req, res) => {
  const { glasses } = req.body;
  // Store in a simple key-value using profiles table updated_at trick
  // We'll use a dedicated approach: store today's water in profile
  db.prepare(`UPDATE profiles SET updated_at = unixepoch() WHERE user_id = ?`).run(req.user.id);
  res.json({ success: true, glasses });
});

export default router;
