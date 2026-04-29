import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogPortal, DialogOverlay } from '@/components/ui/dialog';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { toast } from '@/hooks/use-toast';
import {
  Search, Loader2, CheckCircle2, XCircle, Clock, Globe, RefreshCw, Power, PowerOff, ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  fetchAllCustomDomainsApi,
  approveCustomDomainApi,
  rejectCustomDomainApi,
  deactivateCustomDomainApi,
  reactivateCustomDomainApi,
  type CustomDomainDTO,
  type CustomDomainStatus,
} from '@/lib/api';

type FilterStatus = 'all' | CustomDomainStatus;

const STATUS_BADGE: Record<CustomDomainStatus, JSX.Element> = {
  pending: <Badge variant="outline" className="gap-1 text-amber-700 border-amber-200 bg-amber-50"><Clock className="h-3 w-3" /> Pending</Badge>,
  active: <Badge variant="outline" className="gap-1 text-green-700 border-green-200 bg-green-50"><CheckCircle2 className="h-3 w-3" /> Active</Badge>,
  inactive: <Badge variant="outline" className="gap-1 text-slate-700 border-slate-200 bg-slate-50"><PowerOff className="h-3 w-3" /> Inactive</Badge>,
  rejected: <Badge variant="outline" className="gap-1 text-red-700 border-red-200 bg-red-50"><XCircle className="h-3 w-3" /> Rejected</Badge>,
};

const CustomDomainsPanel: React.FC = () => {
  const [items, setItems] = useState<CustomDomainDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [approveTarget, setApproveTarget] = useState<CustomDomainDTO | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<CustomDomainDTO | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<CustomDomainDTO | null>(null);
  const [rejectTarget, setRejectTarget] = useState<CustomDomainDTO | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAllCustomDomainsApi();
      setItems(res.data ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const counts = {
    all: items.length,
    pending: items.filter((i) => i.status === 'pending').length,
    active: items.filter((i) => i.status === 'active').length,
    inactive: items.filter((i) => i.status === 'inactive').length,
    rejected: items.filter((i) => i.status === 'rejected').length,
  };

  const filtered = items.filter((i) => {
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      i.domain.toLowerCase().includes(q) ||
      (i.display_name ?? '').toLowerCase().includes(q) ||
      (i.church_name ?? '').toLowerCase().includes(q) ||
      (i.branch?.name ?? '').toLowerCase().includes(q) ||
      (i.denomination?.denomination_name ?? '').toLowerCase().includes(q)
    );
  });

  const handleApprove = async () => {
    if (!approveTarget) return;
    const target = approveTarget;
    setApproveTarget(null);
    setActionLoading(target.id);
    try {
      await approveCustomDomainApi(target.id);
      toast({ title: 'Domain approved', description: target.domain });
      load();
    } catch (err: any) {
      toast({ title: 'Failed to approve', description: err?.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) { setRejectError('Please provide a reason.'); return; }
    const target = rejectTarget;
    const reason = rejectReason.trim();
    setRejectTarget(null);
    setRejectReason('');
    setRejectError('');
    setActionLoading(target.id);
    try {
      await rejectCustomDomainApi(target.id, reason);
      toast({ title: 'Domain rejected', description: target.domain });
      load();
    } catch (err: any) {
      toast({ title: 'Failed to reject', description: err?.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    const target = deactivateTarget;
    setDeactivateTarget(null);
    setActionLoading(target.id);
    try {
      await deactivateCustomDomainApi(target.id);
      toast({ title: 'Domain deactivated', description: target.domain });
      load();
    } catch (err: any) {
      toast({ title: 'Failed to deactivate', description: err?.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async () => {
    if (!reactivateTarget) return;
    const target = reactivateTarget;
    setReactivateTarget(null);
    setActionLoading(target.id);
    try {
      await reactivateCustomDomainApi(target.id);
      toast({ title: 'Domain reactivated', description: target.domain });
      load();
    } catch (err: any) {
      toast({ title: 'Failed to reactivate', description: err?.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Custom Domains
          </h2>
          <p className="text-sm text-muted-foreground">
            Approve and manage branch custom domains across the platform.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'active', 'inactive', 'rejected'] as FilterStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterStatus === s
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}{' '}
            <span className="ml-1 opacity-70">({counts[s]})</span>
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by domain, branch, denomination..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><Globe className="h-10 w-10 mx-auto mb-2 opacity-40" /><p>No custom domains found.</p></CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead className="hidden md:table-cell">Branch</TableHead>
                    <TableHead className="hidden md:table-cell">Denomination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <div className="font-medium flex items-center gap-2">
                          {d.domain}
                          <a href={`https://${d.domain}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        {d.display_name && <div className="text-xs text-muted-foreground">{d.display_name}</div>}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{d.branch?.name ?? '—'}</TableCell>
                      <TableCell className="hidden md:table-cell">{d.denomination?.denomination_name ?? '—'}</TableCell>
                      <TableCell>{STATUS_BADGE[d.status]}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                        {d.created_at ? format(new Date(d.created_at), 'PP') : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {d.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" disabled={actionLoading === d.id}
                                onClick={() => setApproveTarget(d)}>
                                {actionLoading === d.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />}
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" disabled={actionLoading === d.id}
                                onClick={() => { setRejectTarget(d); setRejectReason(''); setRejectError(''); }}>
                                <XCircle className="h-4 w-4 mr-1 text-red-600" /> Reject
                              </Button>
                            </>
                          )}
                          {d.status === 'active' && (
                            <Button size="sm" variant="outline" disabled={actionLoading === d.id}
                              onClick={() => setDeactivateTarget(d)}>
                              <PowerOff className="h-4 w-4 mr-1" /> Deactivate
                            </Button>
                          )}
                          {(d.status === 'inactive' || d.status === 'rejected') && (
                            <Button size="sm" variant="outline" disabled={actionLoading === d.id}
                              onClick={() => setReactivateTarget(d)}>
                              <Power className="h-4 w-4 mr-1 text-green-600" /> Reactivate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={!!approveTarget}
        onOpenChange={() => setApproveTarget(null)}
        title="Approve custom domain?"
        description={`Approving "${approveTarget?.domain}" will make the branded sign-in pages live for that domain.`}
        onConfirm={handleApprove}
        confirmLabel="Approve"
        variant="success"
      />
      <ConfirmDialog
        open={!!deactivateTarget}
        onOpenChange={() => setDeactivateTarget(null)}
        title="Deactivate custom domain?"
        description={`"${deactivateTarget?.domain}" will stop resolving for this branch. The branch admin can request reactivation.`}
        onConfirm={handleDeactivate}
        confirmLabel="Deactivate"
        variant="danger"
      />
      <ConfirmDialog
        open={!!reactivateTarget}
        onOpenChange={() => setReactivateTarget(null)}
        title="Reactivate custom domain?"
        description={`"${reactivateTarget?.domain}" will go live again immediately.`}
        onConfirm={handleReactivate}
        confirmLabel="Reactivate"
        variant="success"
      />

      <Dialog open={!!rejectTarget} onOpenChange={(o) => { if (!o) { setRejectTarget(null); setRejectReason(''); setRejectError(''); } }}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent className="sm:max-w-md">
            <h3 className="text-lg font-semibold mb-1">Reject custom domain</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Please tell the requester why "{rejectTarget?.domain}" was rejected. They can edit and re-submit.
            </p>
            <Textarea
              placeholder="Reason for rejection"
              rows={4}
              value={rejectReason}
              onChange={(e) => { setRejectReason(e.target.value); if (rejectError) setRejectError(''); }}
            />
            {rejectError && <p className="text-xs text-red-600 mt-1">{rejectError}</p>}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReject}>Reject</Button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
};

export default CustomDomainsPanel;
