import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { fetchPublicDenominations, submitJoinRequestApi } from '@/lib/api';
import { toast } from 'sonner';
import { Search, ChevronRight, CheckCircle, Loader2, ChurchIcon } from 'lucide-react';

interface Denomination {
  id: string;
  denomination_name: string;
  branches: Array<{ id: string; name: string; city?: string; country?: string }>;
}

interface JoinBranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful request submission so parent can re-check membership */
  onSuccess?: () => void;
}

type Step = 'search' | 'branches' | 'done';

const JoinBranchDialog: React.FC<JoinBranchDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const [step, setStep] = useState<Step>('search');
  const [denominations, setDenominations] = useState<Denomination[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedDenom, setSelectedDenom] = useState<Denomination | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchPublicDenominations()
      .then((d) => setDenominations(d ?? []))
      .catch(() => setDenominations([]))
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = denominations.filter((d) =>
    d.denomination_name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelectDenom = (denom: Denomination) => {
    setSelectedDenom(denom);
    setSelectedBranchId('');
    setStep('branches');
  };

  const handleSubmit = async () => {
    if (!selectedBranchId) return;
    setSubmitting(true);
    try {
      await submitJoinRequestApi(selectedBranchId, message || undefined);
      setStep('done');
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep('search');
    setSearchText('');
    setSelectedDenom(null);
    setSelectedBranchId('');
    setMessage('');
  };

  const handleClose = (v: boolean) => {
    onOpenChange(v);
    if (!v) setTimeout(reset, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChurchIcon className="h-5 w-5 text-blue-600" />
            {step === 'done' ? 'Request Submitted!' : 'Join a Branch'}
          </DialogTitle>
        </DialogHeader>

        {/* ─── Done ─────────────────────────────────────────────── */}
        {step === 'done' && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="text-base font-medium">Your join request has been submitted.</p>
            <p className="text-sm text-muted-foreground">
              The branch admin will review your request and you'll be added once it's approved.
            </p>
            <Button className="w-full" onClick={() => handleClose(false)}>
              Close
            </Button>
          </div>
        )}

        {/* ─── Search denominations ─────────────────────────────── */}
        {step === 'search' && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Search for your church denomination and select the branch you belong to.
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search denomination name…"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto flex flex-col gap-1">
                {filtered.length === 0 && (
                  <p className="text-sm text-center text-muted-foreground py-6">No denominations found.</p>
                )}
                {filtered.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleSelectDenom(d)}
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg hover:bg-accent text-left transition-colors"
                  >
                    <span className="text-sm font-medium">{d.denomination_name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{d.branches.length} branch{d.branches.length !== 1 ? 'es' : ''}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            )}
            <Button variant="ghost" className="text-sm mt-1" onClick={() => handleClose(false)}>
              I'll do this later
            </Button>
          </div>
        )}

        {/* ─── Select branch ────────────────────────────────────── */}
        {step === 'branches' && selectedDenom && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep('search')} className="text-sm text-blue-600 hover:underline">
                ← Back
              </button>
              <span className="text-sm font-semibold">{selectedDenom.denomination_name}</span>
            </div>
            <p className="text-sm text-muted-foreground">Select the branch you attend.</p>
            <div className="max-h-52 overflow-y-auto flex flex-col gap-1">
              {selectedDenom.branches.length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-4">No branches found for this denomination.</p>
              )}
              {selectedDenom.branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBranchId(b.id)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-left transition-colors border ${
                    selectedBranchId === b.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-transparent hover:bg-accent'
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">{b.name}</p>
                    {(b.city || b.country) && (
                      <p className="text-xs text-muted-foreground">{[b.city, b.country].filter(Boolean).join(', ')}</p>
                    )}
                  </div>
                  {selectedBranchId === b.id && <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                </button>
              ))}
            </div>
            {selectedBranchId && (
              <div className="flex flex-col gap-2">
                <Textarea
                  placeholder="Optional message to the admin…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  className="resize-none text-sm"
                />
                <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Request to Join
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JoinBranchDialog;
