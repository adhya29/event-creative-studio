import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface AdminUser {
  id?: string;
  email: string;
  role: string;
  full_name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('lumina_admin_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.verifyAuth();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          localStorage.removeItem('lumina_admin_token');
          setUser(null);
        }
      } catch {
        localStorage.removeItem('lumina_admin_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.loginAdmin({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('lumina_admin_token', res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: res.error || 'Invalid credentials' };
    } catch {
      return { success: false, error: 'Network error or server unavailable.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('lumina_admin_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: Boolean(user), user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
