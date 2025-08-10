const express = require('express');
const { getTypes } = require('../utils/campaignTypes');
const { successResponse } = require('../utils/responses');
const { handleAsyncError } = require('../utils/middleware');

const router = express.Router();

// GET /api/campaign-types - List supported types and presets
router.get('/', handleAsyncError(async (req, res) => {
  const types = getTypes();
  res.json(successResponse(types));
}));

module.exports = router;
