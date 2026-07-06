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
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields are required.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ error: 'Invalid email address.' });

    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing)
      return res.status(409).json({ error: 'An account with this email already exists.' });

    const hash = await bcrypt.hash(password, 12);
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const { lastInsertRowid } = await db.prepare(`
      INSERT INTO users (name, email, password_hash, is_verified, verify_token, verify_token_expires)
      VALUES (?, ?, ?, 0, ?, ?)
    `).run(name.trim(), email.toLowerCase().trim(), hash, verifyToken, verifyExpires);

    await db.prepare('INSERT INTO profiles (user_id) VALUES (?)').run(lastInsertRowid);

    try {
      await sendVerificationEmail(name.trim(), email.toLowerCase().trim(), verifyToken);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr);
    }

    res.json({
      success: true,
      requiresVerification: true,
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup. Please try again.' });
  }
});

// ─── GET /api/auth/verify/:token ──────────────────────────────────────────────
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ success: false, error: 'Verification token is missing.' });

    const user = await db.prepare(
      'SELECT id, name, email, is_verified, verify_token_expires FROM users WHERE verify_token = ?'
    ).get(token);

    if (!user)
      return res.status(400).json({ success: false, error: 'Invalid verification token.' });

    if (user.is_verified)
      return res.json({ success: true, message: 'Email already verified. You can sign in.' });

    if (user.verify_token_expires < Date.now())
      return res.status(400).json({ success: false, error: 'Verification token has expired. Please sign up again.' });

    await db.prepare(
      'UPDATE users SET is_verified = 1, verify_token = NULL, verify_token_expires = NULL WHERE id = ?'
    ).run(user.id);

    // Send welcome email async — don't block the response
    sendWelcomeEmail(user.name, user.email).catch(console.error);

    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ success: false, error: 'Server error during verification.' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user)
      return res.status(401).json({ error: 'Invalid email or password.' });

    if (user.is_verified === 0)
      return res.status(403).json({ error: 'Please verify your email before logging in.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password.' });

    const profile = await db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);
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
