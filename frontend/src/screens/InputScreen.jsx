import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './InputScreen.css';

// ── Web Speech API feature detection ─────────────────────────────────────────
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

// ── Copy constants ─────────────────────────────────────────────────────────────
const COPY = {
  en: {
    tagline:     'Turn your business description into a live website',
    placeholder: 'Describe your business... What do you sell? Where are you? What are your services?',
    micHint:     'Tap mic to speak',
    micStop:     'Listening… tap to stop',
    submit:      'Generate My Website ✦',
    submitting:  'Generating…',
    charLabel:   (n) => `${n} characters`,
    noSpeech:    '⚠ Voice not supported in this browser. Please type instead.',
    loginPrompt: 'You need to log in first.',
    loginLink:   'Go to Login',
    errorGeneric:'Something went wrong. Please try again.',
  },
  ur: {
    tagline:     'اپنے کاروبار کی تفصیل سے ایک زندہ ویب سائٹ بنائیں',
    placeholder: 'اپنے کاروبار کے بارے میں بتائیں… آپ کیا بیچتے ہیں؟ کہاں ہیں؟ کیا سروسز ہیں؟',
    micHint:     'مائک دبائیں اور بولیں',
    micStop:     'سن رہا ہوں… روکنے کے لیے دبائیں',
    submit:      'میری ویب سائٹ بنائیں ✦',
    submitting:  'بن رہا ہے…',
    charLabel:   (n) => `${n} حروف`,
    noSpeech:    '⚠ آپ کا براؤزر آواز کو سپورٹ نہیں کرتا۔ براہ کرم ٹائپ کریں۔',
    loginPrompt: 'پہلے لاگ ان کریں',
    loginLink:   'لاگ ان کریں',
    errorGeneric:'کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔',
  },
};

export default function InputScreen() {
  const navigate        = useNavigate();
  const { token }       = useAuth();

  const [lang,        setLang]        = useState('ur');       // "ur" | "en"
  const [text,        setText]        = useState('');
  const [listening,   setListening]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState(null);

  const recogRef  = useRef(null);   // SpeechRecognition instance
  const isRTL     = lang === 'ur';
  const copy      = COPY[lang];

  // ── Reset recognition when language changes ───────────────────────────────
  useEffect(() => {
    if (listening) stopListening();
  }, [lang]); // eslint-disable-line

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => () => stopListening(), []);

  // ── Web Speech API ────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!SpeechRecognition) return;

    const recog = new SpeechRecognition();
    recog.lang        = lang === 'ur' ? 'ur-PK' : 'en-US';
    recog.continuous  = true;       // keep listening until manually stopped
    recog.interimResults = false;   // only fire on finalised results

    recog.onresult = (e) => {
      const transcript = Array.from(e.results)
        .slice(e.resultIndex)
        .map((r) => r[0].transcript)
        .join(' ');
      // Append transcribed text to existing textarea content
      setText((prev) => (prev ? `${prev} ${transcript}` : transcript).trim());
    };

    recog.onerror = (e) => {
      console.error('SpeechRecognition error:', e.error);
      setListening(false);
    };

    recog.onend = () => setListening(false);

    recog.start();
    recogRef.current = recog;
    setListening(true);
  }, [lang]);

  const stopListening = useCallback(() => {
    if (recogRef.current) {
      recogRef.current.stop();
      recogRef.current = null;
    }
    setListening(false);
  }, []);

  const toggleMic = () => (listening ? stopListening() : startListening());

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setError(null);
    setSubmitting(true);
    if (listening) stopListening();

    try {
      const { data } = await api.post('/api/business/generate', {
        text: text.trim(),
        language: lang,
      });
      // Navigate to review screen — ReviewScreen fetches by :id
      navigate(`/review/${data.business._id}`);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.details?.[0]?.message ||
        copy.errorGeneric;
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Language switch — clear error + stop mic ──────────────────────────────
  const switchLang = (l) => {
    setLang(l);
    setError(null);
  };

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="is-root">
        <div className="is-card">
          <div className="is-header">
            <div className="is-logo">
              <span className="is-logo-dot" />
              <span className="is-logo-text">Dukaan<span>.ai</span></span>
            </div>
          </div>
          <div className="is-gate">
            <h2>{COPY[lang].loginPrompt}</h2>
            <p>Create an account to generate your business website.</p>
            <button
              className="is-submit-btn"
              onClick={() => navigate('/login')}
              style={{ maxWidth: 220, margin: '0 auto' }}
            >
              {COPY[lang].loginLink}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="is-root">
      <div className="is-card">

        {/* ── Logo + tagline ─────────────────────────────────────────────── */}
        <div className="is-header">
          <div className="is-logo">
            <span className="is-logo-dot" />
            <span className="is-logo-text">Dukaan<span>.ai</span></span>
          </div>
          <p className={`is-tagline${isRTL ? ' rtl' : ''}`}
             style={isRTL ? { fontFamily: "'Noto Nastaliq Urdu', serif" } : {}}>
            {copy.tagline}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* ── Language toggle ──────────────────────────────────────────── */}
          <div className="is-lang-row">
            <span className="is-lang-label">Language</span>
            <div className="is-lang-toggle" role="group" aria-label="Language selector">
              <button
                type="button"
                id="lang-en"
                className={`is-lang-btn${lang === 'en' ? ' active' : ''}`}
                onClick={() => switchLang('en')}
                aria-pressed={lang === 'en'}
              >
                English
              </button>
              <button
                type="button"
                id="lang-ur"
                className={`is-lang-btn urdu${lang === 'ur' ? ' active' : ''}`}
                onClick={() => switchLang('ur')}
                aria-pressed={lang === 'ur'}
              >
                اردو
              </button>
            </div>
          </div>

          {/* ── Textarea ─────────────────────────────────────────────────── */}
          <div className="is-textarea-wrap">
            <textarea
              id="business-description"
              className={`is-textarea${isRTL ? ' rtl' : ''}`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={copy.placeholder}
              maxLength={2000}
              required
              aria-label="Business description"
              aria-required="true"
            />
            <span className={`is-char-count${isRTL ? ' rtl' : ''}`}>
              {copy.charLabel(text.length)}
            </span>
          </div>

          {/* ── Mic row ──────────────────────────────────────────────────── */}
          {!SpeechRecognition && (
            <p className="is-no-speech">{copy.noSpeech}</p>
          )}
          {SpeechRecognition && (
            <div className="is-mic-row">
              <span className={`is-mic-hint${isRTL ? ' rtl' : ''}`}
                    style={isRTL ? { fontFamily: "'Noto Nastaliq Urdu', serif" } : {}}>
                {listening ? copy.micStop : copy.micHint}
              </span>
              <button
                type="button"
                id="mic-button"
                className={`is-mic-btn${listening ? ' listening' : ''}`}
                onClick={toggleMic}
                disabled={submitting}
                aria-label={listening ? 'Stop recording' : 'Start voice recording'}
                title={listening ? 'Stop' : 'Speak'}
              >
                {listening ? '⏹' : '🎙'}
              </button>
            </div>
          )}

          {/* ── Error ────────────────────────────────────────────────────── */}
          {error && (
            <div className="is-error" role="alert">
              {error}
            </div>
          )}

          {/* ── Submit ───────────────────────────────────────────────────── */}
          <button
            type="submit"
            id="generate-btn"
            className={`is-submit-btn${isRTL ? ' urdu' : ''}`}
            disabled={submitting || text.trim().length < 10}
            aria-busy={submitting}
          >
            {submitting ? (
              <>
                <span className="is-spinner" aria-hidden="true" />
                {copy.submitting}
              </>
            ) : copy.submit}
          </button>

        </form>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <p className="is-footer">
          Already have a business?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/review/me'); }}>
            View yours
          </a>
        </p>

      </div>
    </div>
  );
}
