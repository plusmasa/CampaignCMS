const express = require('express');
const router = express.Router();

// Placeholder responder used for all report routes
function placeholder(_req, res) {
  return res.json({ success: true, data: { message: 'Your report will appear here.' } });
}

// Keep routes for demo flow; return placeholder content
router.get('/campaigns/:id', placeholder);
router.get('/overview', placeholder);
router.get('/performance', placeholder);
router.get('/summary', placeholder);
router.get('/analytics', placeholder);
router.post('/campaigns/:id/generate', placeholder);

module.exports = router;