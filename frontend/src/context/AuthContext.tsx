import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRoleName } from '../types';
import { authApi } from '../services/api';
import { getCookie, setCookie, deleteCookie } from '../utils/cookies';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  hasRole: (role: UserRoleName) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  isCommTeam: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token') || getCookie('access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    deleteCookie('access_token');
    deleteCookie('refresh_token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      let storedToken = localStorage.getItem('token') || getCookie('access_token');
      const storedRefreshToken = localStorage.getItem('refresh_token') || getCookie('refresh_token');

      if (storedToken) {
        // Sync token in localStorage and cookies for browser visibility
        if (!localStorage.getItem('token')) localStorage.setItem('token', storedToken);
        if (!getCookie('access_token')) setCookie('access_token', storedToken, 24 * 3600);
        if (storedRefreshToken) {
          if (!localStorage.getItem('refresh_token')) localStorage.setItem('refresh_token', storedRefreshToken);
          if (!getCookie('refresh_token')) setCookie('refresh_token', storedRefreshToken, 7 * 24 * 3600);
        }

        try {
          const profile = await authApi.getMe();
          setUser(profile);
          setToken(storedToken);
          localStorage.setItem('user', JSON.stringify(profile));
        } catch (err) {
          // If access token failed, try to recover session with refresh token
          if (storedRefreshToken) {
            try {
              const refreshRes = await authApi.refreshToken(storedRefreshToken);
              storedToken = refreshRes.access_token;
              localStorage.setItem('token', refreshRes.access_token);
              setCookie('access_token', refreshRes.access_token, 24 * 3600);
              if (refreshRes.refresh_token) {
                localStorage.setItem('refresh_token', refreshRes.refresh_token);
                setCookie('refresh_token', refreshRes.refresh_token, 7 * 24 * 3600);
              }
              const profile = await authApi.getMe();
              setUser(profile);
              setToken(storedToken);
              localStorage.setItem('user', JSON.stringify(profile));
            } catch (refreshErr) {
              clearAuthData();
            }
          } else {
            clearAuthData();
          }
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await authApi.login(email, password);
      // Persist in localStorage
      localStorage.setItem('token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      localStorage.setItem('user', JSON.stringify(data.user));

      // Persist in cookies so Chrome DevTools (Application > Storage > Cookies) displays both tokens
      setCookie('access_token', data.access_token, 24 * 3600);
      if (data.refresh_token) {
        setCookie('refresh_token', data.refresh_token, 7 * 24 * 3600);
      }

      setToken(data.access_token);
      setUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    }
    clearAuthData();
    window.location.href = '/login';
  };

  const hasRole = (role: UserRoleName): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.some((r) => r.name.toUpperCase() === role.toUpperCase());
  };

  const isAdmin = hasRole('ADMIN');
  const isManager = hasRole('MANAGER');
  const isCommTeam = hasRole('COMMUNICATION_TEAM');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
        isAdmin,
        isManager,
        isCommTeam,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

