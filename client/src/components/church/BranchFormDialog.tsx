import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { BranchDTO } from '@/lib/api';

interface BranchFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pastor_name: string;
  description: string;
  is_headquarters: boolean;
}

const EMPTY: BranchFormData = {
  name: '',
  address: '',
  city: '',
  state: '',
  country: '',
  pastor_name: '',
  description: '',
  is_headquarters: false,
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BranchFormData) => Promise<void>;
  initial?: BranchDTO | null;
  loading?: boolean;
}

const BranchFormDialog: React.FC<Props> = ({ open, onOpenChange, onSubmit, initial, loading }) => {
  const isEdit = !!initial;

  const toForm = (b: BranchDTO): BranchFormData => ({
    name: b.name ?? '',
    address: b.address ?? '',
    city: b.city ?? '',
    state: b.state ?? '',
    country: b.country ?? '',
    pastor_name: b.pastor_name ?? '',
    description: b.description ?? '',
    is_headquarters: b.is_headquarters ?? false,
  });

  const [form, setForm] = useState<BranchFormData>(() => (initial ? toForm(initial) : { ...EMPTY }));

  React.useEffect(() => {
    if (open) setForm(initial ? toForm(initial) : { ...EMPTY });
  }, [open, initial]);

  const set = (key: keyof BranchFormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="bf-name">Branch Name *</Label>
            <Input id="bf-name" placeholder="e.g. Lagos Central Branch" value={form.name}
              onChange={(e) => set('name', e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bf-pastor">Branch Pastor</Label>
            <Input id="bf-pastor" placeholder="e.g. Pastor John Doe" value={form.pastor_name}
              onChange={(e) => set('pastor_name', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bf-address">Address</Label>
              <Input id="bf-address" placeholder="123 Main Street" value={form.address}
                onChange={(e) => set('address', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bf-city">City</Label>
              <Input id="bf-city" placeholder="Lagos" value={form.city}
                onChange={(e) => set('city', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bf-state">State</Label>
              <Input id="bf-state" placeholder="Lagos State" value={form.state}
                onChange={(e) => set('state', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bf-country">Country</Label>
              <Input id="bf-country" placeholder="Nigeria" value={form.country}
                onChange={(e) => set('country', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bf-desc">Description</Label>
            <Textarea id="bf-desc" placeholder="Brief description of this branch..." rows={3}
              value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="bf-hq"
              type="checkbox"
              checked={form.is_headquarters}
              onChange={(e) => set('is_headquarters', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="bf-hq" className="cursor-pointer">Mark as Headquarters</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!form.name.trim() || loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Branch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BranchFormDialog;
