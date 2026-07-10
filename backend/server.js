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

const ALLOWED_ORIGINS = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim()); // origenes exactos permitidos
const VERCEL_PATTERN  = /^https:\/\/company-central[a-z0-9\-]*\.vercel\.app$/;                                  // acepta todas las preview URLs de Vercel

app.use(cors({
  origin: (origin, cb) => {
    if (!origin)                           return cb(null, true);              // permite llamadas sin origen (Postman, curl)
    if (ALLOWED_ORIGINS.includes(origin))  return cb(null, true);              // origen exacto en la lista
    if (VERCEL_PATTERN.test(origin))       return cb(null, true);              // cualquier preview URL del proyecto en Vercel
    cb(new Error('Not allowed by CORS'));                                       // cualquier otro origen bloqueado
  },
  credentials: true,                                                           // permite cookies httpOnly (refresh token)
}));
app.use(express.json());
app.use(cookieParser());

// Ruta raiz — identificacion publica de la API
app.get('/', (_req, res) => res.json({
  name:    'CompanyCentral API',    // nombre del proyecto
  status:  'online',                // siempre online si el servidor responde
  version: '1.0.0',                 // version actual
  docs:    '/api/health',           // endpoint para verificar estado detallado
}));

// Ruta de salud — estado real de la conexion a MongoDB y uptime del proceso
app.get('/api/health', (_req, res) => res.json({
  status:   'ok',                                                                          // servidor respondiendo
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',          // 1 = conectado, cualquier otro = desconectado
  uptime:   process.uptime(),                                                              // segundos desde que arranco el proceso
}));

app.use('/api/auth',    authRoutes);   // rutas de autenticacion y registro
app.use('/api/team',    teamRoutes);   // rutas de empleados
app.use('/api/company', companyRoutes); // rutas de datos de la empresa

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
