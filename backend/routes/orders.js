const express = require('express');
const router = express.Router();
const serialize = require('node-serialize');
const axios = require('axios');
const _ = require('lodash');

router.post('/create', (req, res) => {
  const { items, shipping, payment } = req.body;

  // VULN: Prototype Pollution via lodash merge
  const orderDefaults = { status: 'pending', currency: 'USD' };
  const order = _.merge({}, orderDefaults, req.body);

  res.json({ orderId: Date.now(), ...order });
});

router.post('/webhook', (req, res) => {
  const { callbackUrl, payload } = req.body;

  // VULN: SSRF - server-side request to user-controlled URL
  axios.post(callbackUrl, payload).then(response => {
    res.json({ status: 'webhook delivered' });
  }).catch(err => {
    res.status(500).json({ error: 'Webhook delivery failed' });
  });
});

router.post('/calculate', (req, res) => {
  const { expression } = req.body;

  // VULN: eval() with user-controlled input
  try {
    const total = eval('(' + expression + ')');
    res.json({ total });
  } catch (e) {
    res.status(400).json({ error: 'Invalid expression' });
  }
});

router.post('/restore', (req, res) => {
  const { data } = req.body;

  // VULN: Insecure deserialization
  try {
    const order = serialize.unserialize(data);
    res.json({ restored: order });
  } catch (e) {
    res.status(400).json({ error: 'Invalid order data' });
  }
});

router.get('/redirect', (req, res) => {
  const { url } = req.query;

  // VULN: Open Redirect
  res.redirect(url);
});

router.post('/discount', (req, res) => {
  const { code } = req.body;

  // VULN: Prototype Pollution via direct assignment
  const config = {};
  for (const key in req.body) {
    config[key] = req.body[key];
  }

  res.json({ discount: config.discount || 0 });
});

module.exports = router;
