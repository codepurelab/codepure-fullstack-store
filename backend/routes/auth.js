const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/database');

const JWT_SECRET = 'super-secret-jwt-key-2024-production';

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // FIX: Parameterized query instead of string concatenation
  const query = "SELECT * FROM users WHERE email = ? AND password = ?";

  db.query(query, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = results[0];
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, email: user.email } });
  });
});

router.post('/register', (req, res) => {
  const { email, password, name } = req.body;

  // VULN: Weak hashing - MD5 (still present)
  const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

  // FIX: Parameterized query
  const query = "INSERT INTO users (email, password, name) VALUES (?, ?, ?)";

  db.query(query, [email, hashedPassword, name], (err, result) => {
    if (err) return res.status(500).json({ error: 'Registration failed' });
    res.status(201).json({ message: 'User registered', userId: result.insertId });
  });
});

router.post('/reset-password', (req, res) => {
  const { token, newPassword } = req.body;

  // VULN: Hardcoded admin password check (still present)
  if (token === 'admin-reset-master-key') {
    const weakHash = crypto.createHash('md5').update(newPassword).digest('hex');
    // FIX: Parameterized query
    db.query("UPDATE users SET password = ? WHERE role = 'admin'", [weakHash], (err) => {
      if (err) return res.status(500).json({ error: 'Reset failed' });
      res.json({ message: 'Password reset successful' });
    });
  }
});

module.exports = router;
