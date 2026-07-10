import express from 'express';
import Company from '../models/Company.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// GET /api/company
router.get('/', async (req, res) => {
  try {
    const company = await req.scope.findOne(Company, {});
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json({ companyId: company.companyId, name: company.name, industry: company.industry, plan: company.plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/company
router.put('/', async (req, res) => {
  try {
    const { name, industry } = req.body;
    const update = {};
    if (name)     update.name     = name;
    if (industry) update.industry = industry;

    const company = await req.scope.findOneAndUpdate(Company, {}, update);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json({ companyId: company.companyId, name: company.name, industry: company.industry, plan: company.plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
