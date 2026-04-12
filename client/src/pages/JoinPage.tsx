import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { useChurch } from '@/components/church/ChurchProvider';
import { fetchInviteInfo, useInviteCodeApi, type InviteInfoDTO } from '@/lib/api';
import { Church, Loader2, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const JoinPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { refreshChurches } = useChurch();
  const code = params.get('code') ?? '';

  const [inviteInfo, setInviteInfo] = useState<InviteInfoDTO | null>(null);
  const [fetchError, setFetchError] = useState('');
  const [fetching, setFetching] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!code) {
      setFetchError('No invite code provided.');
      setFetching(false);
      return;
    }
    fetchInviteInfo(code)
      .then((res) => {
        if (res.data) setInviteInfo(res.data);
        else setFetchError(res.message || 'Invalid or expired invite link.');
      })
      .catch(() => setFetchError('Could not load invite details.'))
      .finally(() => setFetching(false));
  }, [code]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      // Redirect to login, preserving the invite URL as return destination
      navigate(`/login?returnTo=${encodeURIComponent(`/join?code=${code}`)}`);
      return;
    }
    setJoining(true);
    try {
      await useInviteCodeApi(code);
      setJoined(true);
      toast.success('You have joined the branch!');
      // Refresh profile + myBranches so the new membership is immediately switchable
      refreshChurches();
    } catch (err: any) {
      toast.error(err.message || 'Failed to join branch.');
    } finally {
      setJoining(false);
    }
  };

  if (authLoading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-8 text-white text-center">
          <Church className="h-10 w-10 mx-auto mb-2 opacity-90" />
          <h1 className="text-xl font-bold">Church Invite</h1>
          <p className="text-blue-200 text-sm mt-1">You've been invited to join a branch</p>
        </div>

        <div className="p-6">
          {fetchError ? (
            <div className="flex flex-col items-center gap-3 text-center py-4">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="font-medium text-destructive">{fetchError}</p>
              <Button variant="outline" onClick={() => navigate('/')}>Go Home</Button>
            </div>
          ) : joined ? (
            <div className="flex flex-col items-center gap-3 text-center py-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <p className="font-semibold text-lg">You're in!</p>
              <p className="text-sm text-muted-foreground">
                You've successfully joined <span className="font-medium">{inviteInfo?.branch.name}</span>.
              </p>
              <Button className="w-full" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          ) : inviteInfo ? (
            <div className="flex flex-col gap-4">
              <div className="bg-slate-50 rounded-lg p-4 flex flex-col gap-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Denomination</p>
                <p className="font-semibold">{inviteInfo.denomination.denomination_name}</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span><span className="font-medium">{inviteInfo.branch.name}</span>
                    {(inviteInfo.branch.city || inviteInfo.branch.country) && (
                      <span className="text-muted-foreground"> · {[inviteInfo.branch.city, inviteInfo.branch.country].filter(Boolean).join(', ')}</span>
                    )}
                  </span>
                </div>
              </div>

              {inviteInfo.expires_at && (
                <p className="text-xs text-muted-foreground text-center">
                  Expires {new Date(inviteInfo.expires_at).toLocaleDateString()}
                </p>
              )}

              <Button className="w-full" onClick={handleJoin} disabled={joining}>
                {joining && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isAuthenticated ? `Join ${inviteInfo.branch.name}` : 'Sign in to Join'}
              </Button>

              {!isAuthenticated && (
                <p className="text-xs text-center text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => navigate(`/register?returnTo=${encodeURIComponent(`/join?code=${code}`)}`)}
                  >
                    Sign up
                  </button>
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default JoinPage;
