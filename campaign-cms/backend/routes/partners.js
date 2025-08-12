const express = require('express');
const { Partner } = require('../models');
const { successResponse } = require('../utils/responses');
const { handleAsyncError } = require('../utils/middleware');
const router = express.Router();

// GET /api/partners - list partners (active first); supports ?includeInactive=true
router.get('/', handleAsyncError(async (req, res) => {
  const includeInactive = String(req.query.includeInactive || 'false').toLowerCase() === 'true';
  const where = includeInactive ? {} : { active: true };
  const partners = await Partner.findAll({ where, order: [['active', 'DESC'], ['name', 'ASC']] });
  res.json(successResponse(partners));
}));

module.exports = router;
