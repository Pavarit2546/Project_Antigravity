import { createContext, useContext, useMemo, useState } from 'react';
import { api, getToken, setToken } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('jwtUser');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (credentials) => {
    const data = await api.login(credentials);
    setToken(data.token);
    localStorage.setItem('jwtUser', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (credentials) => {
    const data = await api.register(credentials);
    setToken(data.token);
    localStorage.setItem('jwtUser', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('jwtUser');
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user && getToken()), login, register, logout }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
