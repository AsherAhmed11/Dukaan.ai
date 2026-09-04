const { validationResult } = require('express-validator');

/**
 * validate — wraps express-validator chains.
 *
 * Usage:
 *   router.post('/route', [body('field').notEmpty()], validate, handler)
 *
 * Returns 422 with structured error list if validation fails, otherwise calls next().
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
