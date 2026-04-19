const mongoose = require('mongoose');

// ── Option sub-schema (for dropdown columns) ──────────────────────────────────
const optionSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  color: {
    type: String,
    enum: ['blue','purple','yellow','green','red','orange','pink','gray'],
    default: 'blue'
  }
}, { _id: true });

// ── Column sub-schema ─────────────────────────────────────────────────────────
const columnSchema = new mongoose.Schema({
  id:      { type: String, required: true },   // e.g. "company", "status", "custom_abc123"
  label:   { type: String, required: true, trim: true },
  type:    {
    type: String,
    enum: ['text', 'number', 'date', 'dropdown'],
    default: 'text'
  },
  options: [optionSchema],                     // only used when type === 'dropdown'
  order:   { type: Number, default: 0 },
  width:   { type: Number, default: 140 },
  dbField: { type: Boolean, default: false }   // true = maps to a named Application/Company field
}, { _id: false });

// ── SpreadsheetColumn document ────────────────────────────────────────────────
// One document per user per page.
const spreadsheetColumnSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  page: {
    type: String,
    enum: ['applications', 'companies'],
    required: true
  },
  columns: [columnSchema]
}, { timestamps: true });

spreadsheetColumnSchema.index({ user: 1, page: 1 }, { unique: true });

module.exports = mongoose.model('SpreadsheetColumn', spreadsheetColumnSchema);
