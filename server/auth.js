import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const SECRET = process.env.JWT_SECRET || 'nutrimind_fallback_secret';

export const signToken = (payload) =>
  jwt.sign(payload, SECRET, { expiresIn: '7d' });

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
};

export const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const payload = verifyToken(auth.slice(7));
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });
  req.user = payload;
  next();
};
