const Application       = require('../models/Application');
const Company           = require('../models/Company');
const SpreadsheetColumn = require('../models/SpreadsheetColumn');
const mongoose          = require('mongoose');

const DEFAULT_COLS = [
  { id:'company',     label:'Company',     type:'text',     order:0, width:160, dbField:true,  options:[] },
  { id:'jobTitle',    label:'Role',        type:'text',     order:1, width:180, dbField:true,  options:[] },
  { id:'status',      label:'Status',      type:'dropdown', order:2, width:145, dbField:true,
    options:[
      { label:'Wishlist',  color:'blue'   },
      { label:'Applied',   color:'purple' },
      { label:'Interview', color:'yellow' },
      { label:'Offer',     color:'green'  },
      { label:'Rejected',  color:'red'    }
    ]
  },
  { id:'appliedDate', label:'Applied Date', type:'date',    order:3, width:145, dbField:true,  options:[] },
  { id:'location',    label:'Location',     type:'text',    order:4, width:140, dbField:true,  options:[] },
  { id:'salary',      label:'Salary',       type:'text',    order:5, width:130, dbField:true,  options:[] },
  { id:'notes',       label:'Notes',        type:'text',    order:6, width:220, dbField:true,  options:[] }
];

// ── GET /api/applications ─────────────────────────────────────────────────────
exports.getApplications = async (req, res) => {
  try {
    const userId = req.session.userId;
    const apps = await Application.find({ user: userId })
      .sort('-appliedDate').limit(500).lean();

    let colDoc = await SpreadsheetColumn.findOne({ user: userId, page: 'applications' }).lean();
    if (!colDoc) {
      const created = await SpreadsheetColumn.create({ user: userId, page: 'applications', columns: DEFAULT_COLS });
      colDoc = created.toObject();
    }

    const serializedApps = apps.map(app => ({
      ...app,
      extraData: app.extraData || {}
    }));

    return res.json({ ok: true, apps: serializedApps, columns: colDoc.columns || DEFAULT_COLS });
  } catch (err) {
    console.error('[applicationController] getApplications:', err);
    return res.status(500).json({ error: 'Failed to load applications.' });
  }
};

// ── POST /api/applications ────────────────────────────────────────────────────
exports.postCreateApplicationJson = async (req, res) => {
  try {
    const userId = req.session.userId;
    const app = await Application.create({
      user:        userId,
      jobTitle:    req.body.jobTitle    || 'New Role',
      company:     req.body.company     || 'Company Name',
      location:    req.body.location    || '',
      status:      req.body.status      || 'Applied',
      salary:      req.body.salary      || '',
      appliedDate: (req.body.appliedDate && new Date(req.body.appliedDate) <= new Date())
                    ? new Date(req.body.appliedDate) : new Date(),
      notes:       req.body.notes       || '',
      extraData:   {}
    });
    const appObj = app.toObject();
    appObj.extraData = app.extraData || {};
    return res.json({ ok: true, application: appObj });
  } catch (err) {
    console.error('[applicationController] postCreate:', err);
    return res.status(500).json({ error: 'Failed to create application' });
  }
};

// ── PATCH /api/applications/:id ───────────────────────────────────────────────
exports.patchApplication = async (req, res) => {
  try {
    const userId = req.session.userId;
    const namedFields = ['jobTitle','company','location','status','appliedDate','salary','notes','jobType','jobUrl','jobDescription'];
    const setUpdate = {}, extraUpdate = {};

    Object.keys(req.body).forEach(key => {
      const val = req.body[key];
      if (val === undefined) return;
      if (namedFields.includes(key)) {
        if (key === 'appliedDate') {
          setUpdate[key] = (val === null || val === '') ? null : (() => {
            const d = new Date(val);
            return (!isNaN(d) && d <= new Date()) ? d : new Date();
          })();
        } else {
          setUpdate[key] = typeof val === 'string' ? val.trim() : val;
        }
      } else {
        extraUpdate[`extraData.${key}`] = String(val || '');
      }
    });

    const updateDoc = {};
    const combined = { ...setUpdate, ...extraUpdate };
    if (Object.keys(combined).length > 0) updateDoc.$set = combined;

    if (!updateDoc.$set) {
      const existing = await Application.findOne({ _id: req.params.id, user: userId }).lean();
      if (!existing) return res.status(404).json({ error: 'Not found' });
      return res.json({ ok: true, application: existing });
    }

    const updated = await Application.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      updateDoc,
      { new: true, runValidators: false }
    );
    if (!updated) return res.status(404).json({ error: 'Application not found' });
    return res.json({ ok: true, application: updated });
  } catch (err) {
    console.error('[applicationController] patchApplication:', err);
    return res.status(500).json({ error: 'Failed to update' });
  }
};

// ── DELETE /api/applications/:id ──────────────────────────────────────────────
exports.deleteApplicationJson = async (req, res) => {
  try {
    await Application.findOneAndDelete({ _id: req.params.id, user: req.session.userId });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[applicationController] delete:', err);
    return res.status(500).json({ error: 'Failed' });
  }
};
