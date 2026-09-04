const mongoose = require('mongoose');
const slugify = require('slugify');

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const serviceSchema = new mongoose.Schema(
  {
    name:        { type: String, trim: true },
    description: { type: String, trim: true },
    price:       { type: String, trim: true, default: null }, // null = not mentioned
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    area:    { type: String, trim: true, default: null },
    city:    { type: String, trim: true, default: null },
    address: { type: String, trim: true, default: null },
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    phone:    { type: String, trim: true, default: null },
    whatsapp: { type: String, trim: true, default: null },
  },
  { _id: false }
);

// ── Main Business schema ──────────────────────────────────────────────────────

const businessSchema = new mongoose.Schema(
  {
    // ── Ownership ─────────────────────────────────────────────────────────────
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Business must belong to a user'],
      index: true,
    },

    // ── Unique public identifier ──────────────────────────────────────────────
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ── Raw audit input ───────────────────────────────────────────────────────
    // Stored verbatim so we can re-run AI extraction without data loss
    rawInputText: {
      type: String,
      required: [true, 'Raw input text is required'],
    },
    rawInputLanguage: {
      type: String,
      enum: {
        values: ['ur', 'en'],
        message: 'rawInputLanguage must be "ur" or "en"',
      },
      required: [true, 'Input language is required'],
    },

    // ── AI-extracted / AI-generated fields ───────────────────────────────────
    // All are optional at creation — filled in by the AI generation step
    businessName: { type: String, trim: true, default: null },
    category:     { type: String, trim: true, default: null }, // e.g. "Tailor", "Bakery"
    tagline:      { type: String, trim: true, default: null }, // ≤ 12 words
    about:        { type: String, trim: true, default: null }, // 2-3 sentence paragraph
    services:     { type: [serviceSchema], default: [] },
    location:     { type: locationSchema, default: () => ({}) },
    contact:      { type: contactSchema,  default: () => ({}) },
    hours:        { type: String, trim: true, default: null }, // free-text, e.g. "9am–9pm Mon–Sat"
    themeColor:   { type: String, trim: true, default: null }, // hex, e.g. "#4A90E2"

    // ── Lifecycle ─────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: ['draft', 'published'],
        message: 'Status must be "draft" or "published"',
      },
      default: 'draft',
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
  }
);

// ── Pre-save: auto-generate slug from businessName or rawInputText ────────────
businessSchema.pre('save', async function (next) {
  // Only regenerate slug when businessName changes or slug is absent
  if (!this.isModified('businessName') && this.slug) return next();

  const base = this.businessName || this.rawInputText.substring(0, 40);
  let candidate = slugify(base, { lower: true, strict: true });

  // Ensure uniqueness by appending a short random suffix if needed
  const existing = await mongoose.model('Business').findOne({ slug: candidate });
  if (existing && existing._id.toString() !== this._id.toString()) {
    candidate = `${candidate}-${Math.random().toString(36).substring(2, 7)}`;
  }

  this.slug = candidate;
  next();
});

// ── Clean up JSON output ──────────────────────────────────────────────────────
businessSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Business', businessSchema);
