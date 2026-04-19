import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const createTransport = () => {
  if (!process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'YOUR_APP_PASSWORD_HERE') {
    console.warn('⚠️  EMAIL_PASS not set in .env — emails will be logged to console only');
    return null;
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

let transporter = createTransport();

const sendMail = async (to, subject, html) => {
  if (!transporter) {
    console.log(`\n📧 [EMAIL TO: ${to}]\nSubject: ${subject}\n${html.replace(/<[^>]*>/g, '')}\n`);
    return { messageId: 'console-only' };
  }
  return transporter.sendMail({
    from: `"NutriMind OS" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export const sendVerificationEmail = async (name, email, token) => {
  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5175'}/verify-email?token=${token}`;
  return sendMail(email, 'Verify your NutriMind OS account', `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#09090b;color:#fafafa;padding:40px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="color:#0ea5e9;font-size:28px;margin:0;">NutriMind <span style="color:#8b5cf6;">OS</span></h1>
        <p style="color:#a1a1aa;margin-top:8px;">Your AI Health Intelligence Platform</p>
      </div>
      <h2 style="color:#fafafa;">Hi ${name}! 👋</h2>
      <p style="color:#a1a1aa;line-height:1.6;">Welcome to NutriMind OS! You're one step away from your personalized health intelligence system.</p>
      <p style="color:#a1a1aa;line-height:1.6;">Click the button below to verify your email and activate your account:</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${verifyUrl}" style="background:linear-gradient(135deg,#0ea5e9,#8b5cf6);color:white;padding:16px 40px;border-radius:50px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
          ✅ Verify My Account
        </a>
      </div>
      <p style="color:#a1a1aa;font-size:12px;">Or copy this link: <a href="${verifyUrl}" style="color:#0ea5e9;">${verifyUrl}</a></p>
      <p style="color:#a1a1aa;font-size:12px;">This link expires in 24 hours. If you didn't sign up, ignore this email.</p>
      <hr style="border:1px solid #27272a;margin:32px 0;" />
      <p style="color:#52525b;font-size:11px;text-align:center;">NutriMind OS — AI-Powered Health Intelligence</p>
    </div>
  `);
};

export const sendWelcomeEmail = async (name, email) => {
  return sendMail(email, 'Welcome to NutriMind OS! 🎉', `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#09090b;color:#fafafa;padding:40px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="color:#0ea5e9;font-size:28px;margin:0;">NutriMind <span style="color:#8b5cf6;">OS</span></h1>
      </div>
      <h2>Account Verified! 🎉</h2>
      <p style="color:#a1a1aa;line-height:1.6;">Hi ${name}! Your NutriMind OS account is now active.</p>
      <p style="color:#a1a1aa;line-height:1.6;">Here's what you can do next:</p>
      <ul style="color:#a1a1aa;line-height:2;">
        <li>🏋️ Set your Health Profile (Gym, Diabetic, Weight Loss, Cardiac)</li>
        <li>📊 Track meals with natural language: "I ate 200g of chicken"</li>
        <li>🍳 Get AI Kitchen recipes based on what's in your pantry</li>
        <li>💪 Follow your personalized workout plan</li>
      </ul>
      <div style="text-align:center;margin:32px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5175'}" style="background:linear-gradient(135deg,#0ea5e9,#8b5cf6);color:white;padding:16px 40px;border-radius:50px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
          Open NutriMind OS →
        </a>
      </div>
    </div>
  `);
};
