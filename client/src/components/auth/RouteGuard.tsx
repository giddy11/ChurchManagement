import React from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Role = 'super_admin' | 'admin' | 'member';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[]; // Omit to allow any authenticated user
  requireAuth?: boolean; // Defaults to true
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) return null;

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const roleAllowed = (): boolean => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    const role = (user?.role as Role | undefined) || 'member';
    return allowedRoles.includes(role);
  };

  if (!roleAllowed()) {
    return (
      <AlertDialog open onOpenChange={(open) => { if (!open) navigate('/dashboard', { replace: true }); }}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Permission denied</AlertDialogTitle>
            <AlertDialogDescription>
              You don't have permission to access this page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => navigate('/dashboard', { replace: true })}>
              Go to Dashboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
