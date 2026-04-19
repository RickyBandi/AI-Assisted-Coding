const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // ── Core named fields (dbField:true columns map here) ─────────────────────
  jobTitle:    { type: String, default: 'New Role', trim: true },
  company:     { type: String, default: 'Company Name', trim: true },
  companyRef:  { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  location:    { type: String, default: '' },
  salary:      { type: String, default: '' },
  status:      { type: String, default: 'Applied' },   // no enum — options come from SpreadsheetColumn
  appliedDate: { type: Date,   default: Date.now },
  notes:       { type: String, default: '' },

  // ── Dynamic extra columns (custom user-added columns) ─────────────────────
  // Keys are the column id (e.g. "custom_abc123"), values are strings
  extraData: { type: mongoose.Schema.Types.Mixed, default: {} },

  // ── Legacy fields kept for backward compat ────────────────────────────────
  jobType:        { type: String, default: 'Onsite' },
  jobDescription: { type: String, default: '' },
  jobUrl:         { type: String, default: '' }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Application', applicationSchema);
