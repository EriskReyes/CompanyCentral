// CAMBIOS: CORS acepta multiples origenes (dev + Vercel), listen en 0.0.0.0 para Render
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes    from './routes/auth.js';
import teamRoutes    from './routes/team.js';
import companyRoutes from './routes/company.js';

const app = express();

const ALLOWED_ORIGINS = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',    authRoutes);
app.use('/api/team',    teamRoutes);
app.use('/api/company', companyRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

console.log('ENV CHECK — MONGODB_URI defined:', !!process.env.MONGODB_URI);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, '0.0.0.0', () => console.log(`Backend running on port ${PORT}`));
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
