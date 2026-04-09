import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, UserPlus } from 'lucide-react';

interface MemberFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
}

const EMPTY: MemberFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  role: 'member',
};

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: MemberFormData) => Promise<boolean>;
  saving?: boolean;
  branchName?: string;
  churchName?: string;
}

const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  saving,
  branchName,
  churchName,
}) => {
  const [form, setForm] = useState<MemberFormData>({ ...EMPTY });
  const [error, setError] = useState('');

  const set = (field: keyof MemberFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleClose = () => {
    setForm({ ...EMPTY });
    setError('');
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
      setError('First name, last name, and email are required.');
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    const ok = await onSave({
      ...form,
      email: form.email.trim().toLowerCase(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
    });
    if (ok) handleClose();
  };

  const displayOrg = branchName ?? churchName;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-teal-600" />
            Add Member{displayOrg ? ` to ${displayOrg}` : ''}
          </DialogTitle>
          {displayOrg && (
            <p className="text-sm text-gray-500 mt-1">
              A welcome email with login credentials will be sent automatically.
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="add-first">First Name *</Label>
              <Input
                id="add-first"
                placeholder="John"
                value={form.first_name}
                onChange={(e) => set('first_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-last">Last Name *</Label>
              <Input
                id="add-last"
                placeholder="Doe"
                value={form.last_name}
                onChange={(e) => set('last_name', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-email">Email *</Label>
            <Input
              id="add-email"
              type="email"
              placeholder="john.doe@example.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="add-phone">Phone Number</Label>
            <Input
              id="add-phone"
              type="tel"
              placeholder="+234 700 000 0000"
              value={form.phone_number}
              onChange={(e) => set('phone_number', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => set('role', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding…</>
              ) : (
                <><UserPlus className="h-4 w-4 mr-2" /> Add Member</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;
