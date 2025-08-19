import React, { createContext, useContext, useEffect, useState } from 'react';
import { setAuthToken, clearAuthToken, getAuthToken, isTokenValid } from '../utils/auth';
import { apiLogin, apiLogoutAll, apiLogout } from '../api/apiAuth';
import { apiGetUserByUsername } from '../api/apiUsers';

interface User {
  username: string;
  fullname: string;
  role: 'admin' | 'teacher' | 'student' | 'user';
  isActive?: boolean;
  // ...other properties
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  logoutAll: () => Promise<void>; // Add this line
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On cold app load, check for a JWT and fetch user profile if present.
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const token = getAuthToken();
      if (token && isTokenValid()) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          // Use the username from the JWT to fetch the fresh profile
          const freshUser = await apiGetUserByUsername(payload.username);
          setUser(freshUser);
        } catch (error) {
          console.error('Failed to fetch user profile from token:', error);
          clearAuthToken();
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Login: authenticate, store token, and fetch updated user profile
  const login = async (username: string, password: string) => {
    const response = await apiLogin({ username, password });
    setAuthToken(response.token);
    // Always fetch the full, up-to-date user profile from the API
    const fullUser = await apiGetUserByUsername(response.user.username);
    setUser(fullUser);
  };

  const logout = async() => {
    try{
      // const logoutMe = 
      await apiLogout();

    }catch (error) 
    {
      console.error('Logout failed:', error);   

    // Redirect will be handled by axios interceptor or route guards
    }finally {
      clearAuthToken();
      setUser(null);
    }
  };

  // Add the logoutAll function in the AuthProvider component
  const logoutAll = async () => {
    try {
      // Call the logout-all API endpoint
      // const logoutAllUser = 
      await apiLogoutAll();
      // await fetch('/api/auth/logout-all', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${getAuthToken()}`
      //   }
      // });
    } catch (error) {
      // Even if the API call fails, we should clear local state
      console.error('Failed to logout all sessions:', error);
    } finally {
      // Clear local state and redirect
      clearAuthToken();
      setUser(null);
      window.location.href = '/login';
    }
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, logoutAll }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
