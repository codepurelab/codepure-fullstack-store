const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/database');

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // FIX: Read JWT secret from env
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, email: user.email } });
  });
});

router.post('/register', (req, res) => {
  const { email, password, name } = req.body;

  // FIX: Use bcrypt instead of MD5
  bcrypt.hash(password, 12, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Hashing failed' });

    const query = "INSERT INTO users (email, password, name) VALUES (?, ?, ?)";
    db.query(query, [email, hashedPassword, name], (err, result) => {
      if (err) return res.status(500).json({ error: 'Registration failed' });
      res.status(201).json({ message: 'User registered', userId: result.insertId });
    });
  });
});

router.post('/reset-password', (req, res) => {
  const { token, newPassword } = req.body;

  // FIX: Verify JWT token instead of hardcoded master key
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    bcrypt.hash(newPassword, 12, (err, hashed) => {
      if (err) return res.status(500).json({ error: 'Hashing failed' });
      db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, decoded.id], (err) => {
        if (err) return res.status(500).json({ error: 'Reset failed' });
        res.json({ message: 'Password reset successful' });
      });
    });
  } catch (e) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
