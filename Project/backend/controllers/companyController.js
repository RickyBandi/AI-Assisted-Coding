const Company           = require('../models/Company');
const SpreadsheetColumn = require('../models/SpreadsheetColumn');
const mongoose          = require('mongoose');

const DEFAULT_COLS = [
  { id:'name',           label:'Company',        type:'text',     order:0,  width:190, dbField:true,  options:[] },
  { id:'status',         label:'Status',         type:'dropdown', order:1,  width:145, dbField:true,
    options:[ {label:'Dream',color:'blue'},{label:'Applied',color:'purple'},{label:'Interviewing',color:'yellow'},{label:'Offer',color:'green'},{label:'Rejected',color:'red'} ]
  },
  { id:'priority',       label:'Priority',       type:'dropdown', order:2,  width:130, dbField:true,
    options:[ {label:'High',color:'red'},{label:'Medium',color:'yellow'},{label:'Low',color:'green'} ]
  },
  { id:'_appCount',      label:'Applications',   type:'number',   order:3,  width:130, dbField:false, options:[] },
  { id:'lastContact',    label:'Last Contact',   type:'date',     order:4,  width:150, dbField:true,  options:[] },
  { id:'recruiterName',  label:'Recruiter Name', type:'text',     order:5,  width:160, dbField:true,  options:[] },
  { id:'recruiterEmail', label:'Recruiter Email',type:'text',     order:6,  width:180, dbField:true,  options:[] },
  { id:'linkedin',       label:'LinkedIn URL',   type:'text',     order:7,  width:200, dbField:true,  options:[] },
  { id:'notes',          label:'Notes',          type:'text',     order:8,  width:240, dbField:true,  options:[] }
];

function serializeCompany(doc) {
  const obj = doc && typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  if (obj.extraData instanceof Map) obj.extraData = Object.fromEntries(obj.extraData);
  else obj.extraData = obj.extraData || {};
  return obj;
}

exports.getCompanies = async (req, res) => {
  try {
    const userId      = req.session.userId;
    const Application = require('../models/Application');
    const companies   = await Company.find({ user: userId }).sort('-createdAt').lean();

    if (companies.length > 0) {
      const counts = await Application.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId.toString()), company: { $in: companies.map(c=>c.name) } } },
        { $group: { _id: '$company', count: { $sum: 1 } } }
      ]);
      const countMap = {};
      counts.forEach(c => { countMap[c._id] = c.count; });
      companies.forEach(c => {
        c._appCount = countMap[c.name] || 0;
        if (c.extraData instanceof Map) c.extraData = Object.fromEntries(c.extraData);
        else c.extraData = c.extraData || {};
      });
    }

    let colDoc = await SpreadsheetColumn.findOne({ user: userId, page: 'companies' }).lean();
    if (!colDoc) {
      const created = await SpreadsheetColumn.create({ user: userId, page: 'companies', columns: DEFAULT_COLS });
      colDoc = created.toObject();
    }
    return res.json({ ok: true, companies: companies || [], columns: colDoc.columns || DEFAULT_COLS });
  } catch (err) {
    console.error('[companyController] getCompanies:', err);
    return res.status(500).json({ error: 'Failed to load companies.' });
  }
};

exports.postCompanyJson = async (req, res) => {
  try {
    const { name='New Company', notes='' } = req.body;
    const company = await Company.create({ user: req.session.userId, name, notes, extraData: {} });
    return res.json({ ok: true, company: serializeCompany(company) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create company' });
  }
};

exports.patchCompany = async (req, res) => {
  try {
    const userId = req.session.userId;
    const namedFields = ['name','notes','status','priority','lastContact','recruiterName','recruiterEmail','linkedin'];
    const setUpdate = {}, extraUpdate = {};

    Object.keys(req.body).forEach(key => {
      const val = req.body[key];
      if (val === undefined) return;
      if (namedFields.includes(key)) setUpdate[key] = typeof val === 'string' ? val.trim() : val;
      else if (key.startsWith('custom_') || key.startsWith('extra_')) extraUpdate[`extraData.${key}`] = String(val || '');
    });

    const combined = { ...setUpdate, ...extraUpdate };
    if (!Object.keys(combined).length) {
      const existing = await Company.findOne({ _id: req.params.id, user: userId }).lean();
      if (!existing) return res.status(404).json({ error: 'Not found' });
      return res.json({ ok: true, company: serializeCompany(existing) });
    }

    const updated = await Company.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { $set: combined },
      { new: true, runValidators: false }
    );
    if (!updated) return res.status(404).json({ error: 'Company not found' });
    return res.json({ ok: true, company: serializeCompany(updated) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update company' });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    await Company.findOneAndDelete({ _id: req.params.id, user: req.session.userId });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete company' });
  }
};
