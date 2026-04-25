import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit, Loader2 } from 'lucide-react';
import type { MemberDTO } from '@/hooks/useMemberCrud';
import type { UpdateMemberPayload } from '@/lib/api';

type ProfilePayload = UpdateMemberPayload & { role?: string };

interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberDTO | null;
  onSave: (id: string, data: ProfilePayload) => Promise<boolean>;
  onToggleBranchActive: (id: string, is_active: boolean) => Promise<boolean>;
  saving?: boolean;
  /** When false, role and active toggle are hidden (used when church/branch context is unavailable). */
  canManageBranchRole?: boolean;
}

interface FormState {
  first_name: string;
  last_name: string;
  middle_name: string;
  nick_name: string;
  phone_number: string;
  dob: string;
  gender: string;
  address_line: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  role: string;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  first_name: '',
  last_name: '',
  middle_name: '',
  nick_name: '',
  phone_number: '',
  dob: '',
  gender: '',
  address_line: '',
  city: '',
  state: '',
  country: '',
  postal_code: '',
  role: 'member',
  is_active: true,
};

/** Trim & normalize an empty string to undefined for diffing purposes. */
const norm = (v: string | null | undefined): string => (typeof v === 'string' ? v : '') ?? '';

/** Build a FormState from a member DTO so the dialog can be edited in place. */
function memberToForm(member: MemberDTO): FormState {
  return {
    first_name: norm(member.first_name),
    last_name: norm(member.last_name),
    middle_name: norm(member.middle_name),
    nick_name: norm(member.nick_name),
    phone_number: norm(member.phone_number),
    // The API returns ISO timestamps for dob; the <input type="date"> needs YYYY-MM-DD.
    dob: member.dob ? String(member.dob).slice(0, 10) : '',
    gender: norm(member.gender).toLowerCase(),
    address_line: norm(member.address_line),
    city: norm(member.city),
    state: norm(member.state),
    country: norm(member.country),
    postal_code: norm(member.postal_code),
    role: member.branch_role || member.role || 'member',
    is_active: member.branch_is_active !== false,
  };
}

/**
 * Compute the minimal diff between the original member and the current form
 * state so we only send fields the admin actually changed.
 *
 * Sending only diffs keeps the audit log clean and avoids accidentally
 * overwriting another admin's concurrent change.
 */
function buildDiff(member: MemberDTO, form: FormState): UpdateMemberPayload {
  const original = memberToForm(member);
  const payload: UpdateMemberPayload = {};

  const stringFields: Array<keyof FormState & keyof UpdateMemberPayload> = [
    'first_name',
    'last_name',
    'middle_name',
    'nick_name',
    'phone_number',
    'address_line',
    'city',
    'state',
    'country',
    'postal_code',
  ];
  for (const f of stringFields) {
    if (form[f].trim() !== original[f].trim()) {
      (payload as any)[f] = form[f].trim();
    }
  }

  if (form.dob !== original.dob) {
    payload.dob = form.dob ? form.dob : null;
  }
  if (form.gender !== original.gender) {
    payload.gender = form.gender || null;
  }
  return payload;
}

const EditMemberDialog: React.FC<EditMemberDialogProps> = ({
  open,
  onOpenChange,
  member,
  onSave,
  onToggleBranchActive,
  saving,
  canManageBranchRole = true,
}) => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (member) setForm(memberToForm(member));
  }, [member]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!member) return;
    const original = memberToForm(member);
    const diff = buildDiff(member, form);
    const payload: ProfilePayload = { ...diff };
    if (canManageBranchRole && form.role !== original.role) payload.role = form.role;

    const tasks: Promise<boolean>[] = [];
    if (Object.keys(payload).length > 0) tasks.push(onSave(member.id, payload));
    if (canManageBranchRole && form.is_active !== original.is_active) {
      tasks.push(onToggleBranchActive(member.id, form.is_active));
    }
    if (tasks.length === 0) {
      onOpenChange(false);
      return;
    }
    const results = await Promise.all(tasks);
    if (results.every(Boolean)) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-4 w-4 text-blue-600" /> Edit Member
          </DialogTitle>
        </DialogHeader>

        {/* Read-only identity */}
        {member?.email && (
          <p className="text-xs text-gray-500 -mt-2">
            {member.email} (email cannot be changed here)
          </p>
        )}

        {/* Personal info */}
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-first">First name</Label>
              <Input
                id="edit-first"
                value={form.first_name}
                onChange={(e) => update('first_name', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-last">Last name</Label>
              <Input
                id="edit-last"
                value={form.last_name}
                onChange={(e) => update('last_name', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-middle">Middle name</Label>
              <Input
                id="edit-middle"
                value={form.middle_name}
                onChange={(e) => update('middle_name', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-nick">Nickname</Label>
              <Input
                id="edit-nick"
                value={form.nick_name}
                onChange={(e) => update('nick_name', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-dob">Date of birth</Label>
              <Input
                id="edit-dob"
                type="date"
                value={form.dob}
                onChange={(e) => update('dob', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={form.gender || 'unspecified'} onValueChange={(v) => update('gender', v === 'unspecified' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="unspecified">—</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={form.phone_number}
                onChange={(e) => update('phone_number', e.target.value)}
              />
            </div>
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={form.address_line}
                onChange={(e) => update('address_line', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-city">City</Label>
              <Input
                id="edit-city"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-state">State</Label>
              <Input
                id="edit-state"
                value={form.state}
                onChange={(e) => update('state', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-country">Country</Label>
              <Input
                id="edit-country"
                value={form.country}
                onChange={(e) => update('country', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-postal">Postal code</Label>
              <Input
                id="edit-postal"
                value={form.postal_code}
                onChange={(e) => update('postal_code', e.target.value)}
              />
            </div>
          </div>

          {/* Branch role + active flag (hidden when no church/branch context) */}
          {canManageBranchRole && (
            <>
              <div className="space-y-1.5 pt-2">
                <Label>Branch role</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['member', 'coordinator', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => update('role', r)}
                      className={`px-2 py-2 text-sm rounded-md border transition-colors ${
                        form.role === r
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-active"
                  checked={form.is_active}
                  onCheckedChange={(v) => update('is_active', Boolean(v))}
                />
                <Label htmlFor="edit-active" className="cursor-pointer">
                  Active in this branch
                </Label>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMemberDialog;
