import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Usuário mockado para acesso direto sem login
  const [user] = useState<User | null>({
    uid: 'mock-user-123',
    email: 'admin@rentalpro.com',
    displayName: 'Administrador',
    photoURL: 'https://picsum.photos/seed/user/200/200',
  });
  const [loading] = useState(false);

  const signInWithGoogle = async () => {};
  const logout = async () => {};

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
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
