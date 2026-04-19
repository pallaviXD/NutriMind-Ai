import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'] }));
app.use(express.json());

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: Date.now() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🧬 NutriMind OS Backend running on http://localhost:${PORT}`);
  console.log(`📧 Email: ${process.env.EMAIL_USER}`);
  console.log(`🔐 JWT: configured\n`);
});
