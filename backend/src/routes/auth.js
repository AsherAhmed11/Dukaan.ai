const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('Phone is required')
      .matches(/^\+?[0-9]{10,15}$/)
      .withMessage('Invalid phone number format'),
    body('email')
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('preferredLanguage')
      .optional()
      .isIn(['ur', 'en'])
      .withMessage('preferredLanguage must be "ur" or "en"'),
  ],
  validate,
  register
);

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', protect, getMe);

module.exports = router;
