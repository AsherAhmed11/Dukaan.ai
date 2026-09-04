import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginScreen.css';

export default function LoginScreen() {
  const navigate          = useNavigate();
  const { login, register, loading, error } = useAuth();
  const [mode, setMode]   = useState('login');    // 'login' | 'register'
  const [lang, setLang]   = useState('ur');

  const [form, setForm] = useState({
    name: '', phone: '', password: '', preferredLanguage: 'ur',
  });

  const isRTL = lang === 'ur';

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login({ phone: form.phone, password: form.password });
      } else {
        await register({
          name: form.name,
          phone: form.phone,
          password: form.password,
          preferredLanguage: form.preferredLanguage,
        });
      }
      navigate('/');
    } catch {
      // error displayed via context
    }
  };

  return (
    <div className="ls-root">
      <div className="ls-card">

        {/* Logo */}
        <div className="ls-header">
          <div className="ls-logo">
            <span className="ls-logo-dot" />
            <span className="ls-logo-text">Dukaan<span>.ai</span></span>
          </div>
          <p className="ls-sub">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Mode tabs */}
        <div className="ls-tabs" role="tablist">
          <button id="tab-login"    role="tab" className={`ls-tab${mode === 'login'    ? ' active' : ''}`} onClick={() => setMode('login')}>Login</button>
          <button id="tab-register" role="tab" className={`ls-tab${mode === 'register' ? ' active' : ''}`} onClick={() => setMode('register')}>Register</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {mode === 'register' && (
            <div className="ls-field">
              <label htmlFor="reg-name">Full Name</label>
              <input id="reg-name" type="text" placeholder="Ahmed Khan" value={form.name} onChange={set('name')} required />
            </div>
          )}

          <div className="ls-field">
            <label htmlFor="ls-phone">Phone Number</label>
            <input id="ls-phone" type="tel" placeholder="+92 300 1234567" value={form.phone} onChange={set('phone')} required />
          </div>

          <div className="ls-field">
            <label htmlFor="ls-password">Password</label>
            <input id="ls-password" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
          </div>

          {mode === 'register' && (
            <div className="ls-field">
              <label htmlFor="reg-lang">Preferred Language</label>
              <select id="reg-lang" value={form.preferredLanguage} onChange={set('preferredLanguage')}>
                <option value="ur">اردو (Urdu)</option>
                <option value="en">English</option>
              </select>
            </div>
          )}

          {error && <div className="ls-error" role="alert">{error}</div>}

          <button id="auth-submit" type="submit" className="ls-btn" disabled={loading}>
            {loading
              ? <span className="ls-spinner" />
              : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>

        </form>

        <p className="ls-footer">
          {mode === 'login'
            ? <>No account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('register'); }}>Register</a></>
            : <>Have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); }}>Log In</a></>}
        </p>

      </div>
    </div>
  );
}
