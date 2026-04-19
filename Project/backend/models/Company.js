const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:     { type: String, required: true, trim: true },
  notes:    { type: String, default: '' },
  status:   {
    type: String,
    enum: ['Dream', 'Applied', 'Interviewing', 'Offer', 'Rejected', ''],
    default: ''
  },
  priority: { type: String, default: '' },
  lastContact: { type: String, default: '' },
  recruiterName: { type: String, default: '' },
  recruiterEmail: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  // ── Custom column values ────────────────────────────────────────────────────
  // Keys = column id (e.g. "custom_abc123"), values = strings.
  // Mirrors Application.extraData so the dynamic column system works identically.
  extraData: { type: Map, of: String, default: {} }
}, { timestamps: true });

module.exports = mongoose.models.Company || mongoose.model('Company', companySchema);
