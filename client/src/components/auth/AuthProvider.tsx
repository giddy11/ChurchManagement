import React, { createContext, useContext, useEffect, useCallback, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProfile } from '@/hooks/useAuthQuery';
import {
  clearTokens,
  type AuthResponse,
} from '@/services/auth.service';
import { disconnectSocket } from '@/services/socket.service';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  profile_img?: string;
  role?: any;
  permissions?: any[];
}

interface AuthContextType {
  user: AuthUser | null;
  loginWithResponse: (data: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfile();

  const loginWithResponse = useCallback(
    (data: AuthResponse) => {
      // Tokens are in HttpOnly cookies set by the server — nothing to store here.
      // Just cache user/role/permissions so the UI updates immediately.
      queryClient.setQueryData(['auth', 'profile'], {
        ...data.user,
        role: data.role,
        permissions: data.permissions,
      });
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    clearTokens();
    disconnectSocket();
    queryClient.clear();
    window.location.replace('/login');
  }, [queryClient]);

  useEffect(() => {
    const handleSessionExpired = () => logout();
    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, [logout]);

  const user: AuthUser | null = profile
    ? {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        profile_img: profile.profile_img,
        role: profile.role,
        permissions: profile.permissions,
      }
    : null;

  const value: AuthContextType = {
    user,
    loginWithResponse,
    logout,
    isAuthenticated: !!user,
    isLoading: isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};