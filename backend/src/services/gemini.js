const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Gemini client (singleton) ─────────────────────────────────────────────────
let genAI = null;

function getClient() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

// ── System prompt — THE core AI instruction (do NOT modify without testing) ───
const SYSTEM_PROMPT = `You are an assistant that turns a Pakistani small business owner's spoken or typed description (in Urdu, English, or Roman Urdu/mixed) into structured, professional website content.

Rules:
- If input is in Urdu or Roman Urdu, understand it but OUTPUT content in {preferredLanguage} — clear, simple, professional tone (not overly formal).
- Never invent facts not implied by the input (no fake prices, fake hours) — leave those fields empty if not mentioned, don't hallucinate.
- Keep tone appropriate for a local Pakistani small business audience — warm, direct, trustworthy — not generic Silicon Valley SaaS tone.
- Extract services as a list, even if the owner described them in one run-on sentence.

Output ONLY valid JSON, no preamble, no markdown fences:
{
  "businessName": string,
  "category": string,
  "tagline": string (under 12 words),
  "about": string (2-3 sentences),
  "services": [{ "name": string, "description": string, "price": string|null }],
  "location": { "area": string|null, "city": string|null },
  "contact": { "phone": string|null, "whatsapp": string|null },
  "hours": string|null,
  "themeColor": string (a hex code fitting the business category's mood)
}`;

// ── Fields we expect back from Gemini ─────────────────────────────────────────
const EXPECTED_FIELDS = [
  'businessName', 'category', 'tagline', 'about',
  'services', 'location', 'contact', 'hours', 'themeColor',
];

/**
 * Parse a raw Gemini text response into a validated JS object.
 * Strips markdown fences / preamble if the model accidentally wraps them.
 * Throws if the JSON is malformed or missing critical fields.
 */
function parseAIResponse(raw) {
  // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  cleaned = cleaned.trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Gemini returned invalid JSON: ${e.message}\n\nRaw response:\n${raw.substring(0, 500)}`);
  }

  // Sanity check: at minimum businessName must exist
  if (!parsed.businessName || typeof parsed.businessName !== 'string') {
    throw new Error('Gemini response missing required field: businessName');
  }

  // Build a clean object with only the fields we expect
  const result = {};
  for (const field of EXPECTED_FIELDS) {
    if (parsed[field] !== undefined) {
      result[field] = parsed[field];
    }
  }

  return result;
}

/**
 * callGemini — sends the business description to Gemini and returns structured data.
 *
 * @param {string} rawInputText     - the owner's spoken/typed business description
 * @param {string} inputLanguage    - "ur" or "en"
 * @param {string} preferredLanguage - the owner's preferred output language ("ur" or "en")
 * @param {number} [maxRetries=1]   - retry once on malformed JSON before giving up
 * @returns {Promise<object>}       - parsed AI data matching Business schema fields
 */
async function callGemini(rawInputText, inputLanguage, preferredLanguage, maxRetries = 1) {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Interpolate preferredLanguage into system prompt
  const langLabel = preferredLanguage === 'ur' ? 'Urdu' : 'English';
  const systemInstruction = SYSTEM_PROMPT.replace('{preferredLanguage}', langLabel);

  const userMessage = `User's business description (language: ${inputLanguage}):\n"${rawInputText}"`;

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json', // forces JSON mode where supported
        },
      });

      const response = result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error('Gemini returned an empty response');
      }

      return parseAIResponse(text);
    } catch (err) {
      lastError = err;
      console.error(`Gemini attempt ${attempt + 1} failed: ${err.message}`);

      // Don't retry on auth/quota errors — only on parse failures
      if (err.message.includes('API key') || err.message.includes('quota') || err.status === 403) {
        throw err;
      }
    }
  }

  // All retries exhausted
  throw lastError;
}

module.exports = { callGemini, parseAIResponse };
