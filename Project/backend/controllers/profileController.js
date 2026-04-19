const User = require('../models/User');
const fs   = require('fs');
const path = require('path');

exports.getProfile = async (req, res) => {
  try {
    const Application = require('../models/Application');
    const Company     = require('../models/Company');
    const Document    = require('../models/Document');
    const userId = req.session.userId;
    const [user, totalApps, totalCompanies, totalDocs, interviews, offers] = await Promise.all([
      User.findById(userId).lean(),
      Application.countDocuments({ user: userId }),
      Company.countDocuments({ user: userId }),
      Document.countDocuments({ user: userId }),
      Application.countDocuments({ user: userId, status: 'Interview' }),
      Application.countDocuments({ user: userId, status: 'Offer' })
    ]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...safeUser } = user;
    return res.json({ ok: true, user: safeUser, stats: { totalApps, totalCompanies, totalDocs, interviews, offers } });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, title, location, bio } = req.body;
    const update = { name, title, location, bio };
    if (req.file) {
      const user = await User.findById(req.session.userId);
      if (user.avatar) {
        const old = path.join(__dirname, '../uploads', user.avatar);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      update.avatar = req.file.filename;
      req.session.userAvatar = req.file.filename;
    }
    const updated = await User.findByIdAndUpdate(req.session.userId, update, { new: true }).lean();
    req.session.userName = name;
    const { password: _, ...safeUser } = updated;
    return res.json({ ok: true, user: safeUser });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match.' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    const user = await User.findById(req.session.userId);
    if (!(await user.matchPassword(oldPassword))) return res.status(401).json({ error: 'Old password is incorrect.' });
    user.password = newPassword;
    await user.save();
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to change password.' });
  }
};
