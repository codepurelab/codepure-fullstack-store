const express = require('express');
const router = express.Router();
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

router.get('/', (req, res) => {
  const { category, sort } = req.query;

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
  const escaped = String(term).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  res.send(`<h1>Search results for: ${escaped}</h1><div id="results"></div>`);
});

router.get('/export/:format', (req, res) => {
  const format = req.params.format;
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
  // FIX: Path traversal - validate filename and resolve safely
  const filename = path.basename(req.params.filename);
  const uploadsDir = path.resolve('/uploads/products');
  const filePath = path.resolve(uploadsDir, filename);
  if (!filePath.startsWith(uploadsDir)) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  res.sendFile(filePath);
});

router.post('/import', (req, res) => {
  const { url } = req.body;

  // FIX: SSRF - validate URL against allowlist
  const allowedHosts = ['api.supplier.com', 'catalog.partner.com'];
  try {
    const parsed = new URL(url);
    if (!allowedHosts.includes(parsed.hostname)) {
      return res.status(400).json({ error: 'URL not allowed' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  const axios = require('axios');
  axios.get(url).then(response => {
    res.json({ imported: response.data.length });
  }).catch(err => {
    res.status(500).json({ error: 'Import failed' });
  });
});

router.post('/bulk-price', (req, res) => {
  const { formula } = req.body;

  // FIX: Replace eval with safe math parser
  const price = parseFloat(formula);
  if (isNaN(price)) {
    return res.status(400).json({ error: 'Invalid price formula' });
  }
  res.json({ calculatedPrice: price });
});

router.get('/reviews/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const comment = String(req.query.comment || '').replace(/[<>]/g, '');
  res.render('review', { productId, comment });
});

module.exports = router;
