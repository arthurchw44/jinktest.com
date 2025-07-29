import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import type {  ReactNode} from 'react';
import { apiLogin, apiGetProfile } from '../api/apiAuth';
import type { UserResponse } from '../api/apiAuth';

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token') ?? null
  );
  const [loading, setLoading] = useState<boolean>(true);

  // bootstrap – validate token on first load
  useEffect(() => {
    const bootstrap = async () => {
      if (!token) return setLoading(false);
      try {
        const u = await apiGetProfile();
        setUser(u);
      } catch {
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [token]);

  const login = async (username: string, password: string) => {
    const res = await apiLogin({ username, password });
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('token', res.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
