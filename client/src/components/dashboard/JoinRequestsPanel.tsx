import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  fetchJoinRequestsApi,
  reviewJoinRequestApi,
  type JoinRequestDTO,
} from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface JoinRequestsPanelProps {
  churchId: string;
  branchId: string;
}

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const JoinRequestsPanel: React.FC<JoinRequestsPanelProps> = ({ churchId, branchId }) => {
  const [requests, setRequests] = useState<JoinRequestDTO[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchJoinRequestsApi(churchId, branchId, filter === 'all' ? undefined : filter)
      .then((r) => setRequests(r.data ?? []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [churchId, branchId, filter]);

  const handleReview = async (req: JoinRequestDTO, decision: 'approved' | 'rejected') => {
    setReviewing(req.id);
    try {
      const updated = await reviewJoinRequestApi(churchId, branchId, req.id, decision);
      toast.success(`Request ${decision}.`);
      setRequests((prev) => prev.map((r) => r.id === req.id ? updated.data : r));
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setReviewing(null);
    }
  };

  const displayName = (r: JoinRequestDTO) =>
    r.user?.full_name || [r.user?.first_name, r.user?.last_name].filter(Boolean).join(' ') || r.user?.email || r.user_id;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-base">Join Requests</h3>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={load} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No {filter === 'all' ? '' : filter} requests.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {requests.map((req) => (
            <div
              key={req.id}
              className="flex items-start justify-between gap-3 rounded-lg border p-3"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="font-medium text-sm truncate">{displayName(req)}</p>
                {req.user?.email && (
                  <p className="text-xs text-muted-foreground truncate">{req.user.email}</p>
                )}
                {req.message && (
                  <p className="text-xs text-slate-600 mt-1 italic">"{req.message}"</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[req.status]}`}>
                    {req.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                    {req.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {req.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                    {req.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                  {req.joined_via === 'invite_link' && (
                    <Badge variant="outline" className="text-xs px-1.5 h-5">via invite</Badge>
                  )}
                </div>
              </div>

              {req.status === 'pending' && (
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-green-600 hover:bg-green-700"
                    disabled={reviewing === req.id}
                    onClick={() => handleReview(req, 'approved')}
                  >
                    {reviewing === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 text-xs"
                    disabled={reviewing === req.id}
                    onClick={() => handleReview(req, 'rejected')}
                  >
                    <XCircle className="h-3 w-3 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JoinRequestsPanel;
