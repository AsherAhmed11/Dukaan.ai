import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './ReviewScreen.css';

function ReviewScreen() {
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // ── Fetch the owner's draft business on mount ──────────────────────────
  useEffect(() => {
    async function fetchBusiness() {
      try {
        const res = await api.get('/api/business/mine');
        setBusiness(res.data.business || res.data);
      } catch (err) {
        setError(
          err.response?.data?.error ||
          'Could not load your business. Please try generating again.'
        );
      } finally {
        setLoading(false);
      }
    }
    fetchBusiness();
  }, []);

  // ── Generic field updater (supports nested paths like "location.city") ─
  function updateField(path, value) {
    setBusiness((prev) => {
      const updated = { ...prev };
      const keys = path.split('.');
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  }

  // ── Services array helpers ───────────────────────────────────────────
  function updateService(index, field, value) {
    setBusiness((prev) => {
      const services = [...(prev.services || [])];
      services[index] = { ...services[index], [field]: value };
      return { ...prev, services };
    });
  }

  function addService() {
    setBusiness((prev) => ({
      ...prev,
      services: [...(prev.services || []), { name: '', description: '', price: '' }],
    }));
  }

  function removeService(index) {
    setBusiness((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  }

  // ── Save changes (draft only) ────────────────────────────────────────
  async function handleSave() {
    setSaving(true);
    setSaveMsg('');
    setError('');
    try {
      const payload = {
        businessName: business.businessName,
        category: business.category,
        tagline: business.tagline,
        about: business.about,
        services: business.services,
        location: business.location,
        contact: business.contact,
        hours: business.hours,
        themeColor: business.themeColor,
      };
      await api.put(`/api/business/${business._id}`, payload);
      setSaveMsg('Changes saved.');
      setTimeout(() => setSaveMsg(''), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  }

  // ── Publish ───────────────────────────────────────────────────────────
  async function handlePublish() {
    setPublishing(true);
    setError('');
    try {
      // Save any unsaved edits first
      await handleSave();
      const res = await api.put(`/api/business/${business._id}/publish`);
      const slug = res.data.business?.slug || res.data.slug || business.slug;
      navigate(`/site/${slug}`);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Could not publish. Make sure your business name is filled in.'
      );
      setPublishing(false);
    }
  }

  // ── Loading state ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="review-wrap">
        <div className="review-card">
          <div className="skeleton-line" style={{ width: '60%' }} />
          <div className="skeleton-line" style={{ width: '90%' }} />
          <div className="skeleton-line" style={{ width: '80%' }} />
          <div className="skeleton-line" style={{ width: '70%' }} />
        </div>
      </div>
    );
  }

  // ── Error state (no business loaded at all) ─────────────────────────
  if (!business) {
    return (
      <div className="review-wrap">
        <div className="review-card">
          <p className="review-error">{error || 'No business found.'}</p>
          <button className="btn-secondary" onClick={() => navigate('/')}>
            Back to Input
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="review-wrap">
      <div className="review-card">
        <h1>Review &amp; Edit Your Business Page</h1>
        <p className="review-sub">Check everything below, then publish when ready.</p>

        {error && <div className="review-banner error">{error}</div>}
        {saveMsg && <div className="review-banner success">{saveMsg}</div>}

        <label>Business Name</label>
        <input
          type="text"
          value={business.businessName || ''}
          onChange={(e) => updateField('businessName', e.target.value)}
        />

        <label>Category</label>
        <input
          type="text"
          value={business.category || ''}
          onChange={(e) => updateField('category', e.target.value)}
        />

        <label>Tagline</label>
        <input
          type="text"
          value={business.tagline || ''}
          onChange={(e) => updateField('tagline', e.target.value)}
        />

        <label>About</label>
        <textarea
          rows={4}
          value={business.about || ''}
          onChange={(e) => updateField('about', e.target.value)}
        />

        <label>Services</label>
        {(business.services || []).map((s, i) => (
          <div className="service-row" key={i}>
            <input
              type="text"
              placeholder="Name"
              value={s.name || ''}
              onChange={(e) => updateService(i, 'name', e.target.value)}
            />
            <input
              type="text"
              placeholder="Description"
              value={s.description || ''}
              onChange={(e) => updateService(i, 'description', e.target.value)}
            />
            <input
              type="text"
              placeholder="Price"
              value={s.price || ''}
              onChange={(e) => updateService(i, 'price', e.target.value)}
            />
            <button
              type="button"
              className="btn-remove"
              onClick={() => removeService(i)}
              aria-label="Remove service"
            >
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="btn-add" onClick={addService}>
          + Add Service
        </button>

        <div className="row-2">
          <div>
            <label>Area</label>
            <input
              type="text"
              value={business.location?.area || ''}
              onChange={(e) => updateField('location.area', e.target.value)}
            />
          </div>
          <div>
            <label>City</label>
            <input
              type="text"
              value={business.location?.city || ''}
              onChange={(e) => updateField('location.city', e.target.value)}
            />
          </div>
        </div>

        <label>Address (optional)</label>
        <input
          type="text"
          value={business.location?.address || ''}
          onChange={(e) => updateField('location.address', e.target.value)}
        />

        <div className="row-2">
          <div>
            <label>Phone</label>
            <input
              type="text"
              value={business.contact?.phone || ''}
              onChange={(e) => updateField('contact.phone', e.target.value)}
            />
          </div>
          <div>
            <label>WhatsApp</label>
            <input
              type="text"
              value={business.contact?.whatsapp || ''}
              onChange={(e) => updateField('contact.whatsapp', e.target.value)}
            />
          </div>
        </div>

        <label>Hours</label>
        <input
          type="text"
          value={business.hours || ''}
          onChange={(e) => updateField('hours', e.target.value)}
        />

        <label>Theme Color</label>
        <div className="color-row">
          <input
            type="color"
            value={business.themeColor || '#22c55e'}
            onChange={(e) => updateField('themeColor', e.target.value)}
          />
          <span>{business.themeColor}</span>
        </div>

        <div className="review-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleSave}
            disabled={saving || publishing}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handlePublish}
            disabled={saving || publishing || !business.businessName}
          >
            {publishing ? 'Publishing…' : 'Publish ✨'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewScreen;