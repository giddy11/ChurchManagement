import React, { createContext, useContext, useEffect, useCallback, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProfile } from '@/hooks/useAuthQuery';
import {
  getAccessToken,
  clearTokens,
  setTokens,
  type AuthResponse,
} from '@/services/auth.service';
import { disconnectSocket } from '@/services/socket.service';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  profile_img?: string;
  role?: any;
  groups?: any[];
  permissions?: any[];
  effectivePermissions?: string[];
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
  const hasToken = !!getAccessToken();
  const { data: profile, isLoading } = useProfile();

  const loginWithResponse = useCallback(
    (data: AuthResponse) => {
      setTokens(data.accessToken, data.refreshToken);
      queryClient.setQueryData(['auth', 'profile'], data.user);
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    clearTokens();
    disconnectSocket();
    queryClient.clear();
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
        groups: profile.groups,
        permissions: profile.permissions,
        effectivePermissions: profile.effectivePermissions,
      }
    : null;

  const value: AuthContextType = {
    user,
    loginWithResponse,
    logout,
    isAuthenticated: !!user || hasToken,
    isLoading: hasToken && isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};