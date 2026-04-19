const Application = require('../models/Application');
const Company     = require('../models/Company');
const Document    = require('../models/Document');
const mongoose    = require('mongoose');

exports.getDashboard = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.userId.toString());

    const [totalApps, totalCompanies, totalDocs, interviews] = await Promise.all([
      Application.countDocuments({ user: userId }),
      Company.countDocuments({ user: userId }),
      Document.countDocuments({ user: userId }),
      Application.countDocuments({ user: userId, status: 'Interview' })
    ]);

    const recentApps = await Application.find({ user: userId })
      .sort({ createdAt: -1 }).limit(5).lean();

    const recentDocs = await Document.find({ user: userId })
      .sort({ createdAt: -1 }).limit(3).lean();

    const statusAgg = await Application.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAgg = await Application.aggregate([
      { $match: { user: userId, appliedDate: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$appliedDate' }, month: { $month: '$appliedDate' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const months = [], monthlyCounts = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear(), m = d.getMonth() + 1;
      months.push(d.toLocaleString('default', { month: 'short' }));
      const found = monthlyAgg.find(x => x._id.year === y && x._id.month === m);
      monthlyCounts.push(found ? found.count : 0);
    }

    const statusLabels = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'];
    const statusCounts = statusLabels.map(s => {
      const f = statusAgg.find(x => x._id === s); return f ? f.count : 0;
    });

    return res.json({
      ok: true,
      stats:      { totalApps, totalCompanies, totalDocs, interviews },
      recentApps,
      recentDocs,
      chartData:  { months, monthlyCounts, statusLabels, statusCounts }
    });
  } catch (err) {
    console.error('[dashboardController]', err);
    return res.status(500).json({ error: 'Failed to load dashboard.' });
  }
};
