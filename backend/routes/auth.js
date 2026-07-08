import express from 'express';
import jwt from 'jsonwebtoken';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { generateTokens, setRefreshCookie } from '../middleware/auth.js';

const router = express.Router();

function generateCompanyId() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `WC-${year}-${rand}`;
}

function formatUser(user) {
  return {
    id:           user._id,
    firstName:    user.firstName,
    lastName:     user.lastName,
    name:         user.name,
    email:        user.email,
    role:         user.role,
    title:        user.title,
    dept:         user.dept,
    initials:     user.initials,
    color:        user.color,
    status:       user.status,
    employeeCode: user.employeeCode,
    phone:        user.phone,
  };
}

// POST /api/auth/register — creates Company + admin User
router.post('/register', async (req, res) => {
  try {
    const { company: companyInput, admin } = req.body;

    if (!companyInput?.name || !companyInput?.industry || !admin?.name || !admin?.email || !admin?.password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const companyId = generateCompanyId();

    const company = await Company.create({
      companyId,
      name:     companyInput.name,
      industry: companyInput.industry,
      plan:     'free',
    });

    // Split full name into first/last
    const nameParts = admin.name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName  = nameParts.slice(1).join(' ');

    const user = await User.create({
      firstName,
      lastName,
      email:        admin.email,
      password:     admin.password,
      role:         'admin',
      companyId,
      title:        'Administrator',
      employeeCode: 'ADM-001',
    });

    company.adminId = user._id;
    await company.save();

    const { accessToken, refreshToken } = generateTokens(user, companyId);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      token:       accessToken,
      user:        formatUser(user),
      companyData: { companyId, name: company.name, industry: company.industry, plan: company.plan },
    });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Email already registered' });
    console.error('/register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login  (email + password)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const company = await Company.findOne({ companyId: user.companyId });
    if (!company) return res.status(500).json({ error: 'Company record not found' });

    const { accessToken, refreshToken } = generateTokens(user, user.companyId);
    setRefreshCookie(res, refreshToken);

    res.json({
      token:   accessToken,
      user:    formatUser(user),
      company: { companyId: company.companyId, name: company.name, industry: company.industry, plan: company.plan },
    });
  } catch (err) {
    console.error('/login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/employee-login  (companyId + employeeCode + password)
router.post('/employee-login', async (req, res) => {
  try {
    const { companyId, employeeCode, password } = req.body;

    if (!companyId || !employeeCode || !password) {
      return res.status(400).json({ error: 'Company ID, employee code and password are required' });
    }

    const company = await Company.findOne({ companyId: companyId.trim().toUpperCase() });
    if (!company) return res.status(401).json({ error: 'Company not found. Check your Company ID.' });

    const user = await User.findOne({
      employeeCode: employeeCode.trim().toUpperCase(),
      companyId:    company.companyId,
    }).select('+password');

    if (!user) return res.status(401).json({ error: 'Invalid employee code or password' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid employee code or password' });

    const { accessToken, refreshToken } = generateTokens(user, user.companyId);
    setRefreshCookie(res, refreshToken);

    res.json({
      token:   accessToken,
      user:    formatUser(user),
      company: { companyId: company.companyId, name: company.name, industry: company.industry, plan: company.plan },
    });
  } catch (err) {
    console.error('/employee-login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const { accessToken, refreshToken } = generateTokens(user, payload.companyId);
    setRefreshCookie(res, refreshToken);

    res.json({ token: accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

export default router;
