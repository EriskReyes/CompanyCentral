import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes    from './routes/auth.js';
import teamRoutes    from './routes/team.js';
import companyRoutes from './routes/company.js';

const app = express();

app.use(cors({
  origin:      process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',    authRoutes);
app.use('/api/team',    teamRoutes);
app.use('/api/company', companyRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
