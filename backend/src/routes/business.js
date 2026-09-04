const express = require('express');
const { body, param } = require('express-validator');
const {
  generateBusiness,
  updateBusiness,
  publishBusiness,
  getBusinessBySlug,
  getMyBusiness,
} = require('../controllers/businessController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// ── IMPORTANT: Static routes MUST come before parameterised ones ──────────────

// GET /api/business/mine  — protected, owner's own business
router.get('/mine', protect, getMyBusiness);

// POST /api/business/generate — protected, core AI route (stub for now)
router.post(
  '/generate',
  protect,
  [
    body('text')
      .trim()
      .notEmpty()
      .withMessage('Business description text is required')
      .isLength({ min: 10 })
      .withMessage('Please provide at least 10 characters describing your business'),
    body('language')
      .isIn(['ur', 'en'])
      .withMessage('language must be "ur" or "en"'),
  ],
  validate,
  generateBusiness
);

// PUT /api/business/:id — protected, owner edits AI-generated fields
router.put(
  '/:id',
  protect,
  [
    param('id').isMongoId().withMessage('Invalid business ID'),
  ],
  validate,
  updateBusiness
);

// PUT /api/business/:id/publish — protected, draft → published
router.put(
  '/:id/publish',
  protect,
  [
    param('id').isMongoId().withMessage('Invalid business ID'),
  ],
  validate,
  publishBusiness
);

// GET /api/business/:slug — PUBLIC, no auth
router.get('/:slug', getBusinessBySlug);

module.exports = router;
