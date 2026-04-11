import React from 'react';
import { Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { useChurch } from '@/components/church/ChurchProvider';
import MainLayout from '@/components/layout/MainLayout';
import MemberLayout from '@/components/layout/MemberLayout';

const DashboardPage: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuth();
  const { effectiveRole, branchRole } = useChurch();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Any /member route should render the member portal for all authenticated roles.
  if (location.pathname.startsWith('/member')) {
    return <MemberLayout />;
  }

  // Show admin layout for global admins/super_admins AND for branch-level admins/coordinators
  const showAdminLayout =
    effectiveRole === 'super_admin' ||
    effectiveRole === 'admin' ||
    branchRole === 'admin' ||
    branchRole === 'coordinator';

  return showAdminLayout ? <MainLayout /> : <MemberLayout />;
};

export default DashboardPage;