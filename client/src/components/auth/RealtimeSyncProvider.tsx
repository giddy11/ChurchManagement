import React from 'react';
import { useSocket } from '@/components/auth/SocketProvider';
import { useChurch } from '@/components/church/ChurchProvider';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

/**
 * Bridge component that connects Socket.IO events to TanStack Query
 * cache invalidation. Must be rendered inside both SocketProvider
 * and ChurchProvider.
 */
const RealtimeSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const { currentBranch } = useChurch();

  useRealtimeSync({ socket, branchId: currentBranch?.id });

  return <>{children}</>;
};

export default RealtimeSyncProvider;
