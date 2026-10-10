const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/create', (req, res) => {
  const { items, shipping, payment } = req.body;

  // FIX: No prototype pollution - explicit property copy
  const order = {
    status: 'pending',
    currency: 'USD',
    items: Array.isArray(items) ? items : [],
    shipping: typeof shipping === 'object' ? { address: shipping.address, city: shipping.city } : {},
  };

  res.json({ orderId: Date.now(), ...order });
});

router.post('/webhook', (req, res) => {
  const { callbackUrl, payload } = req.body;

  // FIX: Validate callback URL against allowlist
  const allowedHosts = ['webhook.partner.com', 'notifications.internal'];
  try {
    const parsed = new URL(callbackUrl);
    if (!allowedHosts.includes(parsed.hostname)) {
      return res.status(400).json({ error: 'Callback URL not allowed' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid callback URL' });
  }
  axios.post(callbackUrl, payload).then(response => {
    res.json({ status: 'webhook delivered' });
  }).catch(err => {
    res.status(500).json({ error: 'Webhook delivery failed' });
  });
});

router.post('/calculate', (req, res) => {
  const { expression } = req.body;

  // FIX: Safe math evaluation
  const total = parseFloat(expression);
  if (isNaN(total)) {
    return res.status(400).json({ error: 'Invalid expression' });
  }
  res.json({ total });
});

router.post('/restore', (req, res) => {
  const { data } = req.body;

  // FIX: Use JSON.parse instead of insecure deserialization
  try {
    const order = JSON.parse(data);
    res.json({ restored: order });
  } catch (e) {
    res.status(400).json({ error: 'Invalid order data' });
  }
});

router.get('/redirect', (req, res) => {
  const { url } = req.query;

  // FIX: Open redirect - validate against known paths
  const allowedPaths = ['/orders', '/checkout', '/account'];
  if (!allowedPaths.includes(url)) {
    return res.status(400).json({ error: 'Invalid redirect' });
  }
  res.redirect(url);
});

router.post('/discount', (req, res) => {
  const { code } = req.body;

  // FIX: No prototype pollution - explicit property access
  const discount = typeof req.body.discount === 'number' ? req.body.discount : 0;
  res.json({ discount });
});

module.exports = router;
