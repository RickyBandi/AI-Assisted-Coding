const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Resume', 'Cover Letter', 'Portfolio', 'Certificate', 'Other'], default: 'Resume' },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String },
  size: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
