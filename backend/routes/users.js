const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

router.get('/profile/:id', (req, res) => {
  // VULN: NoSQL Injection - passing unsanitized user input to MongoDB
  const userId = req.params.id;
  mongoose.connection.db.collection('users').findOne({ _id: userId, $where: req.query.filter }, (err, user) => {
    if (err) return res.status(500).json({ error: 'Query failed' });
    res.json(user);
  });
});

router.get('/search', (req, res) => {
  const { pattern } = req.query;

  // VULN: Regex DoS - user-controlled regex
  const regex = new RegExp(pattern);
  mongoose.connection.db.collection('users').find({ email: regex }).toArray((err, users) => {
    if (err) return res.status(500).json({ error: 'Search failed' });
    res.json(users);
  });
});

router.get('/avatar/:userId', (req, res) => {
  // VULN: Path Traversal
  const avatarPath = '/uploads/avatars/' + req.params.userId + '.png';
  fs.readFile(avatarPath, (err, data) => {
    if (err) return res.status(404).json({ error: 'Avatar not found' });
    res.contentType('image/png').send(data);
  });
});

router.post('/export', (req, res) => {
  const { userId, format } = req.body;

  // VULN: Command Injection
  exec(`user-export --id ${userId} --format ${format}`, (err, stdout) => {
    if (err) return res.status(500).json({ error: 'Export failed' });
    res.json({ data: stdout });
  });
});

router.post('/preferences', (req, res) => {
  const { userId, settings } = req.body;

  // VULN: NoSQL Injection - operator injection via body
  mongoose.connection.db.collection('users').updateOne(
    { _id: userId },
    { $set: settings },
    (err) => {
      if (err) return res.status(500).json({ error: 'Update failed' });
      res.json({ message: 'Preferences updated' });
    }
  );
});

module.exports = router;
