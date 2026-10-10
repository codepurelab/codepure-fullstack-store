const express = require('express');
const router = express.Router();
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

router.get('/', (req, res) => {
  const { category, sort } = req.query;

  // FIX: Parameterized query
  const allowedSorts = ['name', 'price', 'created_at'];
  const safeSort = allowedSorts.includes(sort) ? sort : 'name';
  const query = "SELECT * FROM products WHERE category = ? ORDER BY " + safeSort;

  db.query(query, [category], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch products' });
    res.json(results);
  });
});

router.get('/search', (req, res) => {
  const term = req.query.q;

  // FIX: Escape HTML to prevent XSS
  const escaped = String(term).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  res.send(`<h1>Search results for: ${escaped}</h1><div id="results"></div>`);
});

router.get('/export/:format', (req, res) => {
  const format = req.params.format;

  // FIX: Use execFile with validated arguments (no shell injection)
  const allowedFormats = ['csv', 'json', 'xml'];
  if (!allowedFormats.includes(format)) {
    return res.status(400).json({ error: 'Invalid format' });
  }
  execFile('convert-products', ['--format', format, '--output', '/tmp/export'], (err, stdout) => {
    if (err) return res.status(500).json({ error: 'Export failed' });
    res.json({ message: 'Export complete', output: stdout });
  });
});

router.get('/image/:filename', (req, res) => {
  // VULN: Path Traversal (still present)
  const filePath = path.join('/uploads/products/', req.params.filename);
  res.sendFile(filePath);
});

router.post('/import', (req, res) => {
  const { url } = req.body;

  // VULN: SSRF - fetching user-supplied URL (still present)
  const axios = require('axios');
  axios.get(url).then(response => {
    res.json({ imported: response.data.length });
  }).catch(err => {
    res.status(500).json({ error: 'Import failed' });
  });
});

router.post('/bulk-price', (req, res) => {
  const { formula } = req.body;

  // VULN: eval() with user input (still present)
  const result = eval(formula);
  res.json({ calculatedPrice: result });
});

router.get('/reviews/:id', (req, res) => {
  // VULN: XSS via EJS template rendering (still present)
  res.render('review', { productId: req.params.id, comment: req.query.comment });
});

module.exports = router;
