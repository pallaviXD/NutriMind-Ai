import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../db.js';
import { signToken } from '../auth.js';
import { sendVerificationEmail, sendWelcomeEmail } from '../mailer.js';

const router = express.Router();

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, dateOfBirth } = req.body;

    if (!name || !email || !password || !dateOfBirth)
      return res.status(400).json({ error: 'All fields are required.' });
    if (password !== confirmPassword)
      return res.status(400).json({ error: 'Passwords do not match.' });
    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ error: 'Invalid email address.' });

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing)
      return res.status(409).json({ error: 'An account with this email already exists.' });

    const hash = await bcrypt.hash(password, 12);
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h

    const { lastInsertRowid } = db.prepare(`
      INSERT INTO users (name, email, password_hash, verify_token, verify_token_expires)
      VALUES (?, ?, ?, ?, ?)
    `).run(name.trim(), email.toLowerCase().trim(), hash, token, tokenExpires);

    // Create empty profile for this user
    db.prepare('INSERT INTO profiles (user_id) VALUES (?)').run(lastInsertRowid);

    // Send verification email
    await sendVerificationEmail(name, email, token);

    res.json({ 
      success: true, 
      message: `Verification email sent to ${email}. Please check your inbox (and spam folder).`
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup. Please try again.' });
  }
});

// ─── GET /api/auth/verify/:token ─────────────────────────────────────────────
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = db.prepare(
      'SELECT * FROM users WHERE verify_token = ?'
    ).get(token);

    if (!user)
      return res.status(400).json({ error: 'Invalid verification link.' });
    if (user.verify_token_expires < Date.now())
      return res.status(400).json({ error: 'Verification link has expired. Please request a new one.' });
    if (user.is_verified)
      return res.json({ success: true, message: 'Email already verified. You can log in.' });

    db.prepare(
      'UPDATE users SET is_verified = 1, verify_token = NULL, verify_token_expires = NULL WHERE id = ?'
    ).run(user.id);

    await sendWelcomeEmail(user.name, user.email);

    res.json({ success: true, message: 'Email verified! Your account is now active.' });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Server error during verification.' });
  }
});

// ─── POST /api/auth/resend-verification ──────────────────────────────────────
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email?.toLowerCase());

    if (!user) return res.status(404).json({ error: 'No account found with this email.' });
    if (user.is_verified) return res.json({ success: true, message: 'Already verified. Please log in.' });

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    db.prepare('UPDATE users SET verify_token = ?, verify_token_expires = ? WHERE id = ?')
      .run(token, tokenExpires, user.id);

    await sendVerificationEmail(user.name, user.email, token);
    res.json({ success: true, message: 'Verification email resent.' });
  } catch (err) {
    console.error('Resend error:', err);
    res.status(500).json({ error: 'Server error resending verification.' });
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

    if (!user.is_verified)
      return res.status(403).json({ 
        error: 'Email not verified.',
        unverified: true,
        email: user.email
      });

    // Load profile
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
