import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { signToken } from '../auth.js';

const router = express.Router();

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields are required.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ error: 'Invalid email address.' });

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing)
      return res.status(409).json({ error: 'An account with this email already exists.' });

    const hash = await bcrypt.hash(password, 12);

    const { lastInsertRowid } = db.prepare(`
      INSERT INTO users (name, email, password_hash, is_verified)
      VALUES (?, ?, ?, 1)
    `).run(name.trim(), email.toLowerCase().trim(), hash);

    db.prepare('INSERT INTO profiles (user_id) VALUES (?)').run(lastInsertRowid);

    const token = signToken({ id: lastInsertRowid, email: email.toLowerCase(), name: name.trim() });

    res.json({
      success: true,
      token,
      user: { id: lastInsertRowid, name: name.trim(), email: email.toLowerCase() },
      profileComplete: false,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup. Please try again.' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user)
      return res.status(401).json({ error: 'Invalid email or password.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password.' });

    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);
    const profileComplete = !!(profile?.height_cm && profile?.weight_kg && profile?.health_goal !== 'general');

    const token = signToken({ id: user.id, email: user.email, name: user.name });
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email },
      profileComplete,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

export default router;
