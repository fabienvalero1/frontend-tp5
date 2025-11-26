import React, { createContext, useContext, useState, useMemo } from 'react';

// Types
interface User {
  username: string;
  password: string;
  role: 'admin' | 'user' | 'guest';
}

type AuthContextType = {
  isAuthenticated: boolean;
  userRole: 'admin' | 'user' | 'guest' | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

// Users data (local, simulé)
const usersData: User[] = [
  { username: 'admin', password: 'admin', role: 'admin' },
  { username: 'user', password: 'user', role: 'user' },
  { username: 'guest', password: 'guest', role: 'guest' }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | 'guest' | null>(null);

  const login = (username: string, password: string) => {
    const user = usersData.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      setIsAuthenticated(true);
      setUserRole(user.role);
      return true;
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
  };

  const value = useMemo(() => ({ isAuthenticated, userRole, login, logout }), [isAuthenticated, userRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
