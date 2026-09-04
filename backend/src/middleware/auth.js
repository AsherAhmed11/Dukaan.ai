const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — JWT auth middleware
 *
 * Expects:  Authorization: Bearer <token>
 * Attaches: req.user  (the authenticated User document, without passwordHash)
 * Rejects:  401 if token missing, invalid, or user no longer exists
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorised — no token provided' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify signature + expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      const message =
        jwtErr.name === 'TokenExpiredError'
          ? 'Token expired — please log in again'
          : 'Invalid token';
      return res.status(401).json({ error: message });
    }

    // 3. Confirm user still exists in DB (handles deleted accounts)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * generateToken — signs and returns a JWT for a given user id
 * @param {string} id  - MongoDB ObjectId string
 * @returns {string}   - signed JWT
 */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

module.exports = { protect, generateToken };
