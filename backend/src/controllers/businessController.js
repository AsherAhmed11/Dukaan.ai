const Business = require('../models/Business');

// ── POST /api/business/generate ──────────────────────────────────────────────
/**
 * THE CORE ROUTE (stub — AI call wired in Phase 2)
 *
 * Receives: { text: string, language: "ur"|"en" }
 * Phase 1:  Saves rawInputText + rawInputLanguage as a draft Business.
 * Phase 2:  Will call Gemini here, merge returned JSON, then save.
 */
const generateBusiness = async (req, res, next) => {
  try {
    const { text, language } = req.body;

    // Phase 2: AI extraction goes here.
    // const aiData = await callGemini(text, language, req.user.preferredLanguage);

    const business = await Business.create({
      ownerId:          req.user._id,
      rawInputText:     text,
      rawInputLanguage: language,
      // Phase 2: spread aiData fields here
      // ...aiData,
      status: 'draft',
    });

    res.status(201).json({ business });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/business/:id ─────────────────────────────────────────────────────
/**
 * Owner manually edits any AI-generated field before publishing.
 * Whitelist updatable fields — never allow ownerId or status change here.
 */
const EDITABLE_FIELDS = [
  'businessName', 'category', 'tagline', 'about',
  'services', 'location', 'contact', 'hours', 'themeColor', 'slug',
];

const updateBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;

    const business = await Business.findOne({ _id: id, ownerId: req.user._id });
    if (!business) {
      return res.status(404).json({ error: 'Business not found or access denied' });
    }

    // Apply only whitelisted fields from request body
    EDITABLE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        business[field] = req.body[field];
      }
    });

    await business.save();
    res.json({ business });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/business/:id/publish ─────────────────────────────────────────────
const publishBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;

    const business = await Business.findOne({ _id: id, ownerId: req.user._id });
    if (!business) {
      return res.status(404).json({ error: 'Business not found or access denied' });
    }

    if (!business.businessName) {
      return res.status(400).json({
        error: 'Cannot publish — businessName is required before going live',
      });
    }

    business.status = 'published';
    await business.save();

    res.json({ business });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/business/:slug — PUBLIC ──────────────────────────────────────────
const getBusinessBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const business = await Business.findOne({ slug, status: 'published' }).populate(
      'ownerId',
      'name phone'
    );

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json({ business });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/business/mine — PROTECTED ────────────────────────────────────────
const getMyBusiness = async (req, res, next) => {
  try {
    // MVP: one business per owner. Sort by createdAt desc in case of future multi.
    const business = await Business.findOne({ ownerId: req.user._id }).sort({ createdAt: -1 });

    if (!business) {
      return res.status(404).json({ error: 'No business found — create one first' });
    }

    res.json({ business });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateBusiness,
  updateBusiness,
  publishBusiness,
  getBusinessBySlug,
  getMyBusiness,
};
