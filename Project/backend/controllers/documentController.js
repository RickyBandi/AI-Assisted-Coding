const Document = require('../models/Document');
const mongoose = require('mongoose');
const fs       = require('fs');
const path     = require('path');

exports.getDocuments = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.userId.toString());
    const docs   = await Document.find({ user: userId }).sort('-createdAt').lean();
    return res.json({ ok: true, docs: docs || [] });
  } catch (err) {
    console.error('[documentController] getDocuments:', err);
    return res.status(500).json({ error: 'Failed to load documents.' });
  }
};

exports.postDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Please select a file.' });
    const { name, type } = req.body;
    const doc = await Document.create({
      user:         req.session.userId,
      name:         (name || '').trim() || req.file.originalname,
      type:         type || 'Resume',
      filename:     req.file.filename,
      originalName: req.file.originalname,
      mimetype:     req.file.mimetype,
      size:         req.file.size
    });
    return res.json({ ok: true, doc });
  } catch (err) {
    console.error('[documentController] postDocument:', err);
    return res.status(500).json({ error: 'Upload failed.' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id:  req.params.id,
      user: new mongoose.Types.ObjectId(req.session.userId.toString())
    });
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    try {
      const filePath = path.join(__dirname, '../uploads', doc.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (fsErr) {
      console.warn('[documentController] File removal warning:', fsErr.message);
    }
    await doc.deleteOne();
    return res.json({ ok: true });
  } catch (err) {
    console.error('[documentController] deleteDocument:', err);
    return res.status(500).json({ error: 'Failed to delete document' });
  }
};
