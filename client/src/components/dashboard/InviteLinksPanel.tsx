import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  fetchInviteLinksApi,
  createInviteLinkApi,
  deactivateInviteLinkApi,
  type InviteLinkDTO,
} from '@/lib/api';
import { toast } from 'sonner';
import { Link2, Plus, Copy, Trash2, Loader2, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface InviteLinksPanelProps {
  churchId: string;
  branchId: string;
}

const APP_BASE = window.location.origin;

const InviteLinksPanel: React.FC<InviteLinksPanelProps> = ({ churchId, branchId }) => {
  const [invites, setInvites] = useState<InviteLinkDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [deactivating, setDeactivating] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchInviteLinksApi(churchId, branchId)
      .then((r) => setInvites(r.data ?? []))
      .catch(() => setInvites([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [churchId, branchId]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await createInviteLinkApi(churchId, branchId, {
        expires_at: expiresAt || undefined,
        max_uses: maxUses ? Number(maxUses) : undefined,
      });
      setInvites((prev) => [res.data, ...prev]);
      toast.success('Invite link created.');
      setCreateDialogOpen(false);
      setExpiresAt('');
      setMaxUses('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create invite link.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (invite: InviteLinkDTO) => {
    setDeactivating(invite.id);
    try {
      await deactivateInviteLinkApi(churchId, branchId, invite.id);
      setInvites((prev) => prev.map((i) => i.id === invite.id ? { ...i, is_active: false } : i));
      toast.success('Invite link deactivated.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to deactivate invite link.');
    } finally {
      setDeactivating(null);
    }
  };

  const copyLink = (code: string) => {
    const url = `${APP_BASE}/join?code=${code}`;
    navigator.clipboard.writeText(url).then(() => toast.success('Invite link copied!'));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-base">Invite Links</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={load} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="sm" className="h-8 gap-1.5" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            New Link
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : invites.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center text-sm text-muted-foreground">
          <Link2 className="h-8 w-8 opacity-40" />
          <p>No invite links yet. Create one to share with your members.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {invites.map((inv) => {
            const url = `${APP_BASE}/join?code=${inv.code}`;
            const expired = inv.expires_at && new Date() > new Date(inv.expires_at);
            const exhausted = inv.max_uses !== null && inv.max_uses !== undefined && inv.uses_count >= inv.max_uses;
            const inactive = !inv.is_active || expired || exhausted;

            return (
              <div key={inv.id} className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${inactive ? 'opacity-60' : ''}`}>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">{inv.code}</code>
                    {inactive ? (
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-green-700 border-green-300">Active</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{url}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>{inv.uses_count} use{inv.uses_count !== 1 ? 's' : ''}{inv.max_uses ? ` / ${inv.max_uses}` : ''}</span>
                    {inv.expires_at && (
                      <span>Expires {new Date(inv.expires_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {!inactive && (
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyLink(inv.code)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {inv.is_active && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      disabled={deactivating === inv.id}
                      onClick={() => handleDeactivate(inv)}
                    >
                      {deactivating === inv.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Invite Link</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="expiresAt" className="text-sm">Expiry date <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                id="expiresAt"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="maxUses" className="text-sm">Max uses <span className="text-muted-foreground font-normal">(optional, leave blank for unlimited)</span></Label>
              <Input
                id="maxUses"
                type="number"
                min={1}
                placeholder="Unlimited"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InviteLinksPanel;
