const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

router.get('/profile/:id', (req, res) => {
  const userId = req.params.id;

  // FIX: NoSQL injection - use safe query without $where
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  mongoose.connection.db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(userId) }, (err, user) => {
    if (err) return res.status(500).json({ error: 'Query failed' });
    res.json(user);
  });
});

router.get('/search', (req, res) => {
  const { pattern } = req.query;

  // FIX: Regex DoS - validate pattern length and complexity
  if (!pattern || pattern.length > 50) {
    return res.status(400).json({ error: 'Invalid search pattern' });
  }
  const safePattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(safePattern, 'i');
  mongoose.connection.db.collection('users').find({ email: regex }).toArray((err, users) => {
    if (err) return res.status(500).json({ error: 'Search failed' });
    res.json(users);
  });
});

router.get('/avatar/:userId', (req, res) => {
  // FIX: Path traversal - validate and resolve path safely
  const userId = path.basename(req.params.userId);
  const avatarDir = path.resolve('/uploads/avatars');
  const avatarPath = path.resolve(avatarDir, userId + '.png');
  if (!avatarPath.startsWith(avatarDir)) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  fs.readFile(avatarPath, (err, data) => {
    if (err) return res.status(404).json({ error: 'Avatar not found' });
    res.contentType('image/png').send(data);
  });
});

router.post('/export', (req, res) => {
  const { userId, format } = req.body;

  // FIX: Command injection - use execFile with validated args
  const allowedFormats = ['csv', 'json'];
  if (!allowedFormats.includes(format)) {
    return res.status(400).json({ error: 'Invalid format' });
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  execFile('user-export', ['--id', userId, '--format', format], (err, stdout) => {
    if (err) return res.status(500).json({ error: 'Export failed' });
    res.json({ data: stdout });
  });
});

router.post('/preferences', (req, res) => {
  const { userId, settings } = req.body;

  // FIX: NoSQL injection - validate userId and restrict settings keys
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  const allowedKeys = ['theme', 'language', 'notifications'];
  const safeSettings = {};
  for (const key of allowedKeys) {
    if (key in settings) {
      safeSettings[key] = settings[key];
    }
  }
  mongoose.connection.db.collection('users').updateOne(
    { _id: new mongoose.Types.ObjectId(userId) },
    { $set: safeSettings },
    (err) => {
      if (err) return res.status(500).json({ error: 'Update failed' });
      res.json({ message: 'Preferences updated' });
    }
  );
});

module.exports = router;
