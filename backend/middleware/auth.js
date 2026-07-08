import jwt from 'jsonwebtoken';
import { createScope } from '../utils/tenantScope.js';

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId    = payload.userId;
    req.companyId = payload.companyId;
    req.role      = payload.role;
    req.scope     = createScope(payload.companyId);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function generateTokens(user, companyId) {
  const payload = { userId: user._id, companyId, role: user.role };
  const accessToken  = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '20m' });
  const refreshToken = jwt.sign({ userId: user._id, companyId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

export function setRefreshCookie(res, refreshToken) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000,
    path:     '/api/auth/refresh',
  });
}
