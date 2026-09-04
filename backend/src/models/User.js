const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SUPPORTED_LANGUAGES = ['ur', 'en'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^\+?[0-9]{10,15}$/, 'Please provide a valid phone number'],
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // allows multiple null values (email is optional)
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // never returned in queries by default
    },
    preferredLanguage: {
      type: String,
      enum: {
        values: SUPPORTED_LANGUAGES,
        message: `Preferred language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`,
      },
      default: 'ur',
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// ── Instance method: compare plain password against stored hash ────────────────
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// ── Strip sensitive fields from JSON responses ────────────────────────────────
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
