const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// ── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, phone, email, password, preferredLanguage } = req.body;

    // Duplicate check — phone is the primary unique identifier
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(409).json({ error: 'An account with this phone number already exists' });
    }

    // Hash password (salt rounds = 12)
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      phone,
      email: email || undefined, // omit if not provided so sparse index works correctly
      passwordHash,
      preferredLanguage: preferredLanguage || 'ur',
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    // passwordHash is select:false so we must explicitly request it
    const user = await User.findOne({ phone }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    const token = generateToken(user._id.toString());

    // Remove passwordHash before sending (toJSON transform handles this,
    // but calling toJSON explicitly is cleaner after .select('+passwordHash'))
    const userObj = user.toJSON();

    res.json({ token, user: userObj });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  // req.user is already attached by the protect middleware
  res.json({ user: req.user });
};

module.exports = { register, login, getMe };
