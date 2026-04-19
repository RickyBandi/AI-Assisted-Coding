const User        = require('../models/User');
const Application = require('../models/Application');
const Document    = require('../models/Document');
const Company     = require('../models/Company');

exports.getAdminDashboard = async (req, res) => {
  try {
    const [totalUsers, totalApps, totalDocs, totalCompanies] = await Promise.all([
      User.countDocuments(), Application.countDocuments(),
      Document.countDocuments(), Company.countDocuments()
    ]);
    return res.json({ ok: true, stats: { totalUsers, totalApps, totalDocs, totalCompanies } });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load admin dashboard.' });
  }
};

exports.getAdminUsers = async (req, res) => {
  try {
    const [totalUsers, totalApps, totalDocs, totalCompanies] = await Promise.all([
      User.countDocuments(), Application.countDocuments(),
      Document.countDocuments(), Company.countDocuments()
    ]);
    const users = await User.find().sort('-createdAt').lean();
    const safeUsers = users.map(({ password, ...u }) => u);
    return res.json({ ok: true, stats: { totalUsers, totalApps, totalDocs, totalCompanies }, users: safeUsers });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load users.' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin','user'].includes(role)) return res.status(400).json({ error: 'Invalid role.' });
    await User.findByIdAndUpdate(req.params.id, { role });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update role.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.session.userId.toString())
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    await Promise.all([
      User.findByIdAndDelete(targetId),
      Application.deleteMany({ user: targetId }),
      Document.deleteMany({ user: targetId }),
      Company.deleteMany({ user: targetId })
    ]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete user.' });
  }
};
