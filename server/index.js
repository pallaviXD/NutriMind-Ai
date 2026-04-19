import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;
const isProd = process.env.NODE_ENV === 'production';

// Security headers
app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors({ origin: isProd ? '*' : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'] }));
app.use(express.json({ limit: '10kb' }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: 'Too many requests, please try again later.' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many auth attempts, please try again later.' } });

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: Date.now() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Serve built frontend in production
if (isProd) {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🧬 NutriMind OS running on http://0.0.0.0:${PORT}`);
  console.log(`🤖 Groq AI: ${process.env.GROQ_API_KEY ? 'configured ✓' : 'NOT SET ✗'}`);
  console.log(`🔐 JWT: configured ✓\n`);
});
