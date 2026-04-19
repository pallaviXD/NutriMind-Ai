import express from 'express';
import db from '../db.js';
import { authMiddleware } from '../auth.js';

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

export default router;
