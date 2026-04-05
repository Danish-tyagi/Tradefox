import { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/authService';

const USER_KEY = 'tf_user';
const TOKEN_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const saveSession = (userData, accessToken, refreshToken) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    setUser(userData);
  };

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    saveSession(data.user, data.accessToken, data.refreshToken);
    return data;
  }, []);

  const signup = useCallback(async (credentials) => {
    const data = await authService.signup(credentials);
    saveSession(data.user, data.accessToken, data.refreshToken);
    return data;
  }, []);

  const logout = useCallback(() => {
    authService.logout().catch(() => {});
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setUser(null);
  }, []);

  const updateBalance = useCallback((newBalance) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, balance: newBalance };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateBalance, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
