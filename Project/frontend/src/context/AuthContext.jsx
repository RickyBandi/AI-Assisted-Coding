import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: verify token with the server and restore user state
  useEffect(() => {
    authAPI.me()
      .then(r => setUser(r.data.user))
      .catch(() => {
        // Token invalid or expired — clear it
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const r = await authAPI.login({ email, password });
    // Store JWT so axios interceptor sends it on every future request
    if (r.data.token) {
      localStorage.setItem('token', r.data.token);
    }
    setUser(r.data.user);
    return r.data.user;
  };

  const register = async (name, email, password, confirmPassword) => {
    const r = await authAPI.register({ name, email, password, confirmPassword });
    if (r.data.token) {
      localStorage.setItem('token', r.data.token);
    }
    setUser(r.data.user);
    return r.data.user;
  };

  const logout = async () => {
    await authAPI.logout().catch(() => {}); // don't block UI if server is down
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
