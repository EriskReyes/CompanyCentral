import express from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

function formatMember(u) {
  return {
    id:                u._id,
    employeeCode:      u.employeeCode,
    firstName:         u.firstName,
    lastName:          u.lastName,
    name:              u.name,
    email:             u.email,
    role:              u.role,
    title:             u.title,
    dept:              u.dept,
    team:              u.team,
    empType:           u.empType,
    status:            u.status,
    startDate:         u.startDate,
    location:          u.location,
    phone:             u.phone,
    address:           u.address,
    emergencyName:     u.emergencyName,
    emergencyPhone:    u.emergencyPhone,
    emergencyRelation: u.emergencyRelation,
    notes:             u.notes,
    initials:          u.initials,
    color:             u.color,
  };
}

async function generateEmployeeCode(companyId) {
  const count = await User.countDocuments({ companyId });
  const num   = String(count + 1).padStart(3, '0');
  let code    = `EMP-${num}`;
  const taken = await User.findOne({ employeeCode: code, companyId });
  if (taken) code = `EMP-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  return code;
}

// GET /api/team/members
router.get('/members', async (req, res) => {
  try {
    const members = await req.scope.find(User);
    res.json(members.map(formatMember));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/team/members  — creates employee with all info
router.post('/members', async (req, res) => {
  try {
    const {
      firstName, lastName, email, role,
      title, dept, team, empType, startDate, location,
      phone, address,
      emergencyName, emergencyPhone, emergencyRelation,
      notes,
    } = req.body;

    if (!firstName || !email) {
      return res.status(400).json({ error: 'First name and email are required' });
    }

    const employeeCode = await generateEmployeeCode(req.companyId);
    const tempPassword = Math.random().toString(36).slice(2, 6).toUpperCase()
                       + Math.random().toString(36).slice(2, 6)
                       + Math.floor(Math.random() * 90 + 10);

    const member = await req.scope.create(User, {
      firstName,
      lastName:          lastName   || '',
      email,
      password:          tempPassword,
      role:              role       || 'employee',
      title:             title      || '',
      dept:              dept       || '',
      team:              team       || '',
      empType:           empType    || 'Full-time',
      startDate:         startDate  || '',
      location:          location   || '',
      phone:             phone      || '',
      address:           address    || {},
      emergencyName:     emergencyName     || '',
      emergencyPhone:    emergencyPhone    || '',
      emergencyRelation: emergencyRelation || '',
      notes:             notes      || '',
      employeeCode,
    });

    res.status(201).json({
      ...formatMember(member),
      tempPassword, // shown once to admin — not stored in plain text after this
    });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Email already in use in this company' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/team/members/:id  — update employee profile
router.put('/members/:id', async (req, res) => {
  try {
    const allowed = ['firstName','lastName','title','dept','team','empType','status',
                     'startDate','location','phone','address',
                     'emergencyName','emergencyPhone','emergencyRelation','notes','role'];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    if (update.firstName || update.lastName) {
      const current = await req.scope.findById(User, req.params.id);
      if (current) {
        update.name = `${update.firstName ?? current.firstName} ${update.lastName ?? current.lastName}`.trim();
      }
    }

    const updated = await req.scope.findByIdAndUpdate(User, req.params.id, update);
    if (!updated) return res.status(404).json({ error: 'Employee not found' });
    res.json(formatMember(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/team/members/:id/code  — change employee code
router.put('/members/:id/code', async (req, res) => {
  try {
    const code = req.body.employeeCode?.trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'Employee code required' });

    const taken = await User.findOne({ employeeCode: code, companyId: req.companyId, _id: { $ne: req.params.id } });
    if (taken) return res.status(409).json({ error: 'Employee code already in use' });

    const updated = await req.scope.findByIdAndUpdate(User, req.params.id, { employeeCode: code });
    if (!updated) return res.status(404).json({ error: 'Employee not found' });

    res.json({ employeeCode: updated.employeeCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/team/members/:id
router.delete('/members/:id', async (req, res) => {
  try {
    const deleted = await req.scope.findByIdAndDelete(User, req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Member not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
