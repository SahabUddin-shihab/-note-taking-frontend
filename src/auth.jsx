import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api, getToken, setToken, setUnauthorizedHandler } from './api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    if (getToken()) api('/auth/me').then((r) => setUser(r.data)).catch(() => setToken(null)).finally(() => setLoading(false));
  }, []);
  const start = (d) => {
    setToken(d.token);
    setUser(d.user);
  };
  const login = async (b) => start((await api('/auth/login', { method: 'POST', body: b })).data);
  const register = async (b) => start((await api('/auth/register', { method: 'POST', body: b })).data);
  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch { /* token already invalid */ }
    setToken(null);
    setUser(null);
  };
  return <Ctx.Provider value={{
    user,
    setUser,
    loading,
    login,
    register,
    logout
  }}>
    {children}
  </Ctx.Provider>;
}

// UX guards only; the server enforces every permission.
export function Protected({ children, admin }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="mute">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
