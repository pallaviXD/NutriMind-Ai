import express from 'express';
import crypto from 'crypto';
import db from '../db.js';
import { authMiddleware } from '../auth.js';
import Groq from 'groq-sdk';

const router = express.Router();
router.use(authMiddleware);

// ─── Helper: compute deterministic hash for cache key ─────────────────────────
function computeHash(obj) {
  return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex');
}

// ─── POST /api/user/workout-plan ──────────────────────────────────────────────
// Generate a new AI workout plan (or return cached if same request_hash)
router.post('/workout-plan', async (req, res) => {
  const { goal, forceRegenerate } = req.body;
  const userId = req.user.id;

  const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);
  if (!profile?.height_cm || !profile?.weight_kg) {
    return res.status(400).json({ error: 'Complete your health profile first.' });
  }

  const user = db.prepare('SELECT name FROM users WHERE id = ?').get(userId);

  // Build the hash key from user profile + goal
  const hashInput = {
    userId,
    goal: goal || profile.health_goal || 'general',
    height_cm: profile.height_cm,
    weight_kg: profile.weight_kg,
    gender: profile.gender,
    activity_level: profile.activity_level,
    health_conditions: profile.health_conditions,
  };
  const requestHash = computeHash(hashInput);

  // Check cache (unless force regenerate)
  if (!forceRegenerate) {
    const cached = db.prepare(
      'SELECT * FROM workout_plans WHERE user_id = ? AND request_hash = ? ORDER BY created_at DESC LIMIT 1'
    ).get(userId, requestHash);

    if (cached) {
      return res.json({
        success: true,
        cached: true,
        plan: JSON.parse(cached.plan_data),
        version: cached.version,
        createdAt: cached.created_at,
        requestHash: cached.request_hash,
      });
    }
  }

  // No cache hit — generate via AI
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'AI not configured. Add GROQ_API_KEY to .env' });

  const effectiveGoal = goal || profile.health_goal || 'general';
  const age = profile.date_of_birth
    ? Math.floor((Date.now() - new Date(profile.date_of_birth)) / (365.25 * 24 * 3600 * 1000))
    : 30;
  const conditions = profile.health_conditions && profile.health_conditions !== '[]'
    ? JSON.parse(profile.health_conditions) : [];

  const goalDescriptions = {
    gym: 'Hypertrophy / muscle building — progressive overload, push-pull-legs or upper-lower split',
    weight_loss: 'Fat loss — HIIT, calorie-burning circuits, strength to preserve lean mass',
    diabetes: 'Diabetic-friendly — low impact, post-meal walks, resistance bands, blood sugar management',
    heart: 'Cardiac health — Zone 2 cardio, low-intensity steady state, light resistance, breathing exercises',
    general: 'General wellness — balanced full body, cardio, flexibility, active recovery',
  };

  const prompt = `You are an expert certified personal trainer and exercise physiologist.

Create a complete, personalized 7-day workout plan for:
- Name: ${user?.name || 'User'}
- Age: ${age} years
- Gender: ${profile.gender || 'not specified'}
- Height: ${profile.height_cm}cm, Weight: ${profile.weight_kg}kg
- Activity Level: ${profile.activity_level || 'moderate'}
- Health Goal: ${effectiveGoal} — ${goalDescriptions[effectiveGoal] || goalDescriptions.general}
- Health Conditions: ${conditions.length ? conditions.join(', ') : 'none'}

Respond ONLY with valid JSON in this exact structure:
{
  "title": "Plan Title",
  "subtitle": "Short subtitle describing the plan",
  "days": [
    {
      "day": "Day 1 — Focus Area",
      "exercises": [
        { "name": "Exercise Name", "sets": 3, "reps": "8-10", "rest": "60s", "muscles": "Target Muscles" }
      ]
    }
  ],
  "nutrition": ["tip1", "tip2", "tip3", "tip4"]
}

Requirements:
- Exactly 7 days
- Day 7 should always be active recovery
- 3-6 exercises per day
- Include warm-up movements on training days
- Tailor intensity and exercise selection to the health conditions listed
- Nutrition tips must be specific to the goal (4 tips)
- sets must be a number, reps must be a string, rest must be a string`;

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    let plan;
    try {
      plan = JSON.parse(raw);
    } catch {
      // Attempt repair: strip markdown fences
      const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      plan = JSON.parse(cleaned);
    }

    // Determine version (increment from latest for same user+hash)
    const latest = db.prepare(
      'SELECT version FROM workout_plans WHERE user_id = ? AND request_hash = ? ORDER BY version DESC LIMIT 1'
    ).get(userId, requestHash);
    const newVersion = (latest?.version || 0) + 1;

    // Save to DB
    db.prepare(
      'INSERT INTO workout_plans (user_id, request_hash, plan_data, version) VALUES (?, ?, ?, ?)'
    ).run(userId, requestHash, JSON.stringify(plan), newVersion);

    const saved = db.prepare(
      'SELECT * FROM workout_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
    ).get(userId);

    res.json({
      success: true,
      cached: false,
      plan,
      version: newVersion,
      createdAt: saved.created_at,
      requestHash,
    });
  } catch (err) {
    console.error('Workout plan generation error:', err.message);
    res.status(500).json({ error: 'Failed to generate workout plan. ' + err.message });
  }
});

// ─── GET /api/user/workout-plan/latest ────────────────────────────────────────
// Returns the most recent workout plan for the user
router.get('/workout-plan/latest', (req, res) => {
  const plan = db.prepare(
    'SELECT * FROM workout_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
  ).get(req.user.id);

  if (!plan) {
    return res.json({ success: true, plan: null });
  }

  res.json({
    success: true,
    plan: JSON.parse(plan.plan_data),
    version: plan.version,
    createdAt: plan.created_at,
    requestHash: plan.request_hash,
  });
});

// ─── GET /api/user/workout-plan/history ───────────────────────────────────────
// Returns all past workout plans for the user (most recent first)
router.get('/workout-plan/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const plans = db.prepare(
    'SELECT id, request_hash, version, created_at FROM workout_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
  ).all(req.user.id, limit);

  res.json({ success: true, plans });
});

// ─── GET /api/user/workout-plan/:id ───────────────────────────────────────────
// Returns a specific workout plan by its ID
router.get('/workout-plan/:id', (req, res) => {
  const plan = db.prepare(
    'SELECT * FROM workout_plans WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.user.id);

  if (!plan) {
    return res.status(404).json({ error: 'Workout plan not found.' });
  }

  res.json({
    success: true,
    plan: JSON.parse(plan.plan_data),
    version: plan.version,
    createdAt: plan.created_at,
    requestHash: plan.request_hash,
  });
});

export default router;
