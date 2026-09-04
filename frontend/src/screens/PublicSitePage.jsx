import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './PublicSitePage.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build a WhatsApp click-to-chat URL.
 * Strips everything except digits from the phone string.
 * Pre-fills a greeting so the owner immediately knows where the lead came from.
 */
function whatsappUrl(phone) {
  const digits = String(phone).replace(/[^0-9]/g, '');
  const greeting = encodeURIComponent('السلام علیکم! I found your business on Dukaan.ai.');
  return `https://wa.me/${digits}?text=${greeting}`;
}

/** Returns true if any sub-field of an object is non-null / non-empty */
function hasContent(obj) {
  if (!obj) return false;
  return Object.values(obj).some((v) => v !== null && v !== undefined && v !== '');
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="psp-skeleton">
      <div className="psp-skel-hero">
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div className="psp-skel-block badge" />
          <div className="psp-skel-block title" />
          <div className="psp-skel-block tag"   />
        </div>
      </div>
      <div className="psp-skel-content">
        <div className="psp-skel-block para" />
        <div className="psp-skel-block para" style={{ height: 120 }} />
        <div className="psp-skel-block para" style={{ width: '60%', height: 48 }} />
      </div>
    </div>
  );
}

// ── Not found ─────────────────────────────────────────────────────────────────
function NotFound({ slug }) {
  const navigate = useNavigate();
  return (
    <div className="psp-center">
      <span style={{ fontSize: '2.5rem' }}>🏪</span>
      <h2>Business not found</h2>
      <p>
        <strong style={{ color: '#e8f5e9' }}>/{slug}</strong> doesn't exist or isn't published yet.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: '0.5rem',
          padding: '0.6rem 1.25rem',
          borderRadius: 10,
          border: 'none',
          background: '#22c55e',
          color: '#0d1a11',
          fontWeight: 700,
          cursor: 'pointer',
          fontSize: '0.9rem',
        }}
      >
        Go to Dukaan.ai
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PublicSitePage() {
  const { slug }   = useParams();
  const [business, setBusiness] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setNotFound(false);
      try {
        const { data } = await api.get(`/api/business/${slug}`);
        if (!cancelled) setBusiness(data.business);
      } catch (err) {
        if (!cancelled) {
          setNotFound(err.response?.status === 404 || true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading)  return <Skeleton />;
  if (notFound || !business) return <NotFound slug={slug} />;

  const {
    businessName, category, tagline, about,
    services = [], location, contact, hours, themeColor,
    rawInputLanguage,
  } = business;

  const accent  = themeColor || '#22c55e';
  const isRTL   = rawInputLanguage === 'ur';

  const showLocation = hasContent(location);
  const showContact  = hasContent(contact);
  const showServices = Array.isArray(services) && services.length > 0;
  const showHours    = !!hours;

  return (
    <div
      className={`psp-root${isRTL ? ' rtl' : ''}`}
      style={{ '--accent': accent }}
    >

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="psp-hero">
        <div className="psp-hero-inner">
          {category && (
            <span className="psp-category-badge">{category}</span>
          )}
          <h1 className="psp-business-name">
            {businessName || 'Untitled Business'}
          </h1>
          {tagline && (
            <p className="psp-tagline">{tagline}</p>
          )}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="psp-content">

        {/* About */}
        {about && (
          <section className="psp-section" aria-label="About">
            <p className="psp-section-title">About</p>
            <p className="psp-about">{about}</p>
          </section>
        )}

        {/* Services */}
        {showServices && (
          <section className="psp-section" aria-label="Services">
            <p className="psp-section-title">Services</p>
            <div className="psp-services-grid">
              {services.map((svc, i) => (
                <div className="psp-service-card" key={i}>
                  {svc.name && (
                    <p className="psp-service-name">{svc.name}</p>
                  )}
                  {svc.description && (
                    <p className="psp-service-desc">{svc.description}</p>
                  )}
                  {svc.price && (
                    <span className="psp-service-price">{svc.price}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        {showContact && (
          <section className="psp-section" aria-label="Contact">
            <p className="psp-section-title">Contact</p>
            <div className="psp-contact-list">

              {contact.phone && (
                <div className="psp-contact-item">
                  <span className="psp-contact-icon" aria-hidden="true">📞</span>
                  <a
                    href={`tel:${contact.phone}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {contact.phone}
                  </a>
                </div>
              )}

              {contact.whatsapp && (
                <a
                  id="whatsapp-cta"
                  className="psp-wa-btn"
                  href={whatsappUrl(contact.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Chat on WhatsApp with ${businessName}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chat on WhatsApp
                </a>
              )}

            </div>
          </section>
        )}

        {/* Location */}
        {showLocation && (
          <section className="psp-section" aria-label="Location">
            <p className="psp-section-title">Location</p>
            <div className="psp-location-block">
              <span className="psp-contact-icon" aria-hidden="true">📍</span>
              <div>
                {[location.address, location.area, location.city]
                  .filter(Boolean)
                  .join(', ')}
              </div>
            </div>
          </section>
        )}

        {/* Hours */}
        {showHours && (
          <section className="psp-section" aria-label="Business hours">
            <p className="psp-section-title">Hours</p>
            <div className="psp-hours-block">
              <span className="psp-hours-dot" aria-hidden="true" />
              <span>{hours}</span>
            </div>
          </section>
        )}

      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="psp-footer">
        Powered by <a href="/" rel="noopener">Dukaan.ai</a>
        {' '}— Build your business website in minutes
      </footer>

    </div>
  );
}
