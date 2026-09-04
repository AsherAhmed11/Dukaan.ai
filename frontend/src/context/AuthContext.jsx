import { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem('dukaan_token') || null);
  const [user,  setUser]    = useState(() => {
    try {
      const raw = localStorage.getItem('dukaan_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const _persist = (tkn, usr) => {
    localStorage.setItem('dukaan_token', tkn);
    localStorage.setItem('dukaan_user', JSON.stringify(usr));
    setToken(tkn);
    setUser(usr);
  };

  const register = useCallback(async ({ name, phone, password, preferredLanguage }) => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.post('/api/auth/register', { name, phone, password, preferredLanguage });
      _persist(data.token, data.user);
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      setError(msg); throw new Error(msg);
    } finally { setLoading(false); }
  }, []);

  const login = useCallback(async ({ phone, password }) => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.post('/api/auth/login', { phone, password });
      _persist(data.token, data.user);
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      setError(msg); throw new Error(msg);
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('dukaan_token');
    localStorage.removeItem('dukaan_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, loading, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
