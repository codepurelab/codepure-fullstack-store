const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

router.get('/', (req, res) => {
  const { category, sort } = req.query;

  // VULN: SQL Injection via query params
  const query = `SELECT * FROM products WHERE category = '${category}' ORDER BY ${sort}`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch products' });
    res.json(results);
  });
});

router.get('/search', (req, res) => {
  const term = req.query.q;

  // VULN: XSS - Reflected in response
  res.send(`<h1>Search results for: ${term}</h1><div id="results"></div>`);
});

router.get('/export/:format', (req, res) => {
  const format = req.params.format;

  // VULN: Command Injection via exec
  exec(`convert-products --format ${format} --output /tmp/export`, (err, stdout) => {
    if (err) return res.status(500).json({ error: 'Export failed' });
    res.json({ message: 'Export complete', output: stdout });
  });
});

router.get('/image/:filename', (req, res) => {
  // VULN: Path Traversal
  const filePath = path.join('/uploads/products/', req.params.filename);
  res.sendFile(filePath);
});

router.post('/import', (req, res) => {
  const { url } = req.body;

  // VULN: SSRF - fetching user-supplied URL
  const axios = require('axios');
  axios.get(url).then(response => {
    res.json({ imported: response.data.length });
  }).catch(err => {
    res.status(500).json({ error: 'Import failed' });
  });
});

router.post('/bulk-price', (req, res) => {
  const { formula } = req.body;

  // VULN: eval() with user input
  const result = eval(formula);
  res.json({ calculatedPrice: result });
});

router.get('/reviews/:id', (req, res) => {
  // VULN: XSS via EJS template rendering
  res.render('review', { productId: req.params.id, comment: req.query.comment });
});

module.exports = router;
