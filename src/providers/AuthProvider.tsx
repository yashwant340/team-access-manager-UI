// src/context/auth.provider.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import axios from '../api/axiosInstance'; // your configured axios instance
import { getDashboardRoute } from '../utils/RoleUtils';
import { useNavigate } from 'react-router-dom';

type User = {
  username: string;
  platformRole: string;
  teamId?: number;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  login: (newToken: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const fetchUser = async () => {
      if (token) {
        try {
          const response = await axios.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
          navigate(getDashboardRoute(response.data.platformRole));

        } catch (err) {
          console.error('Failed to fetch user info:', err);
          logout(); // Invalid token
        }
      } else {
        setUser(null);
      }
    };

  useEffect(() => {
      fetchUser();
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    fetchUser();
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook to access auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
