const Application = require('../models/Application');
const Document    = require('../models/Document');
const mongoose    = require('mongoose');

exports.getAnalytics = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.userId.toString());
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1); twelveMonthsAgo.setHours(0,0,0,0);

    const [statusAgg, topCompanies, jobTypeAgg, monthlyAgg, docActivityAgg, total] = await Promise.all([
      Application.aggregate([{ $match:{ user:userId }},{ $group:{ _id:'$status', count:{ $sum:1 }}}]),
      Application.aggregate([{ $match:{ user:userId }},{ $group:{ _id:'$company', count:{ $sum:1 }}},{ $sort:{ count:-1 }},{ $limit:8 }]),
      Application.aggregate([{ $match:{ user:userId }},{ $group:{ _id:'$jobType', count:{ $sum:1 }}}]),
      Application.aggregate([
        { $match:{ user:userId, appliedDate:{ $gte:twelveMonthsAgo }}},
        { $group:{ _id:{ year:{ $year:'$appliedDate' }, month:{ $month:'$appliedDate' }}, count:{ $sum:1 }}},
        { $sort:{ '_id.year':1, '_id.month':1 }}
      ]),
      Document.aggregate([
        { $match:{ user:userId, createdAt:{ $gte:twelveMonthsAgo }}},
        { $group:{ _id:{ year:{ $year:'$createdAt' }, month:{ $month:'$createdAt' }}, count:{ $sum:1 }}},
        { $sort:{ '_id.year':1, '_id.month':1 }}
      ]),
      Application.countDocuments({ user:userId })
    ]);

    const months=[], monthlyCounts=[], docActivityCounts=[];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth()-i);
      const y=d.getFullYear(), m=d.getMonth()+1;
      months.push(d.toLocaleString('default',{ month:'short', year:'2-digit' }));
      const fa = monthlyAgg.find(x=>x._id.year===y&&x._id.month===m);
      monthlyCounts.push(fa ? fa.count : 0);
      const fd = docActivityAgg.find(x=>x._id.year===y&&x._id.month===m);
      docActivityCounts.push(fd ? fd.count : 0);
    }

    const statusLabels=['Wishlist','Applied','Interview','Offer','Rejected'];
    const statusCounts=statusLabels.map(s=>{ const f=statusAgg.find(x=>x._id===s); return f?f.count:0; });
    const offers=statusCounts[3], interviews=statusCounts[2], applied=statusCounts[1];
    const responseRate=applied>0?Math.round((interviews/applied)*100):0;
    const offerRate=interviews>0?Math.round((offers/interviews)*100):0;

    return res.json({
      ok: true,
      stats: { total, offers, interviews, responseRate, offerRate },
      chartData: {
        months, monthlyCounts, statusLabels, statusCounts, docActivityCounts,
        companyLabels: topCompanies.map(c=>c._id||'Unknown'),
        companyCounts: topCompanies.map(c=>c.count),
        jobTypeLabels: jobTypeAgg.map(j=>j._id||'Unknown'),
        jobTypeCounts: jobTypeAgg.map(j=>j.count)
      }
    });
  } catch (err) {
    console.error('[analyticsController]', err);
    return res.status(500).json({ error: 'Failed to load analytics.' });
  }
};
