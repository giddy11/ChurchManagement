import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { useChurch } from '@/components/church/ChurchProvider';
import MainLayout from '@/components/layout/MainLayout';
import MemberLayout from '@/components/layout/MemberLayout';
import JoinBranchDialog from '@/components/auth/JoinBranchDialog';

const DashboardPage: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { effectiveRole, branchRole, myBranches, isMembershipsReady } = useChurch();
  const [joinDismissed, setJoinDismissed] = useState(false);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Show admin layout for global admins/super_admins AND for branch-level admins/coordinators
  const showAdminLayout =
    effectiveRole === 'super_admin' ||
    effectiveRole === 'admin' ||
    branchRole === 'admin' ||
    branchRole === 'coordinator';

  console.log('[Dashboard] layout decision —', {
    pathname: location.pathname,
    effectiveRole,
    branchRole,
    showAdminLayout,
  });

  // Any /member route should render the member portal — BUT only for non-admin roles.
  // If the user switches to an admin branch while on a /member route, show admin layout.
  if (location.pathname.startsWith('/member') && !showAdminLayout) {
    return <MemberLayout />;
  }

  // Show join prompt for regular members who aren't in any branch yet
  const isRegularMember = effectiveRole === 'member';
  const hasNoBranch = isMembershipsReady && myBranches.length === 0;
  const showJoinPrompt = isRegularMember && hasNoBranch && !joinDismissed;

  return (
    <>
      {showAdminLayout ? <MainLayout /> : <MemberLayout />}
      <JoinBranchDialog
        open={showJoinPrompt}
        onOpenChange={(open) => { if (!open) setJoinDismissed(true); }}
      />
    </>
  );
};

export default DashboardPage;