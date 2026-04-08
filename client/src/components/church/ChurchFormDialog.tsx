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
import type { ChurchDTO } from '@/lib/api';

interface ChurchFormData {
  denomination_name: string;
  description: string;
  address: string;
  state: string;
  country: string;
  location: string;
}

const EMPTY: ChurchFormData = {
  denomination_name: '',
  description: '',
  address: '',
  state: '',
  country: '',
  location: '',
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ChurchFormData) => Promise<void>;
  initial?: ChurchDTO | null;
  loading?: boolean;
}

const ChurchFormDialog: React.FC<Props> = ({ open, onOpenChange, onSubmit, initial, loading }) => {
  const isEdit = !!initial;

  const [form, setForm] = useState<ChurchFormData>(() =>
    initial
      ? {
          denomination_name: initial.denomination_name ?? '',
          description: initial.description ?? '',
          address: initial.address ?? '',
          state: initial.state ?? '',
          country: initial.country ?? '',
          location: initial.location ?? '',
        }
      : { ...EMPTY }
  );

  React.useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              denomination_name: initial.denomination_name ?? '',
              description: initial.description ?? '',
              address: initial.address ?? '',
              state: initial.state ?? '',
              country: initial.country ?? '',
              location: initial.location ?? '',
            }
          : { ...EMPTY }
      );
    }
  }, [open, initial]);

  const update = (key: keyof ChurchFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const isValid = form.denomination_name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Church' : 'Register New Church'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="cf-name">Church Name *</Label>
            <Input
              id="cf-name"
              placeholder="e.g. Salvation Ministry"
              value={form.denomination_name}
              onChange={(e) => update('denomination_name', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cf-address">Address</Label>
              <Input
                id="cf-address"
                placeholder="123 Main Street"
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf-location">City / Location</Label>
              <Input
                id="cf-location"
                placeholder="Lagos"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cf-state">State</Label>
              <Input
                id="cf-state"
                placeholder="Lagos"
                value={form.state}
                onChange={(e) => update('state', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf-country">Country</Label>
              <Input
                id="cf-country"
                placeholder="Nigeria"
                value={form.country}
                onChange={(e) => update('country', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cf-desc">Description</Label>
            <Textarea
              id="cf-desc"
              placeholder="A brief description of the church..."
              rows={3}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Church'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChurchFormDialog;
