import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Label } from '@/components/ui/label';
import {
  UserPlus,
  Search,
  Users,
  Shield,
  Download,
  Upload,
  Trash2,
  Edit,
  Mail,
  Phone,
  Loader2,
  User,
} from 'lucide-react';
import { useChurch } from '@/components/church/ChurchProvider';
import { useMemberCrud } from '@/hooks/useMemberCrud';
import type { MemberDTO } from '@/hooks/useMemberCrud';
import AddMemberDialog from './AddMemberDialog';
import ImportMembersDialog from './ImportMembersDialog';
import ConfirmDialog from '@/components/ui/confirm-dialog';

// ── Export helpers ────────────────────────────────────────────────────────────
function exportToCSV(members: MemberDTO[]) {
  const cols = ['full_name', 'email', 'phone_number', 'role', 'is_active'];
  const escape = (v: unknown) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? '"' + s.replace(/"/g, '""') + '"'
      : s;
  };
  const header = cols.join(',');
  const rows = members.map((m) => cols.map((c) => escape((m as any)[c])).join(','));
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'members_export.csv'; a.click();
  URL.revokeObjectURL(url);
}

// ── Edit Member Dialog ────────────────────────────────────────────────────────
interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberDTO | null;
  onSave: (id: string, data: { full_name?: string; role?: string; is_active?: boolean }) => Promise<boolean>;
  saving?: boolean;
}

const EditMemberDialog: React.FC<EditMemberDialogProps> = ({ open, onOpenChange, member, onSave, saving }) => {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('member');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (member) {
      setFullName(member.full_name || `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim());
      setRole(member.role || 'member');
      setIsActive(member.is_active !== false);
    }
  }, [member]);

  const handleSave = async () => {
    if (!member) return;
    const ok = await onSave(member.id, { full_name: fullName, role, is_active: isActive });
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-4 w-4 text-teal-600" /> Edit Member
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="edit-active"
              checked={isActive}
              onCheckedChange={(v) => setIsActive(Boolean(v))}
            />
            <Label htmlFor="edit-active" className="cursor-pointer">Active</Label>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── View Member Dialog ────────────────────────────────────────────────────────
const ViewMemberDialog: React.FC<{ member: MemberDTO | null; onClose: () => void }> = ({ member, onClose }) => {
  if (!member) return null;
  const name = member.full_name || `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim() || member.email;
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <Dialog open={!!member} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-4 w-4 text-teal-600" /> Member Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-teal-700">{initials}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-base">{name}</p>
              <Badge variant={member.role === 'admin' || member.role === 'super_admin' ? 'destructive' : 'secondary'} className="text-xs mt-1">
                {member.role}
              </Badge>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span>{member.email}</span>
            </div>
            {member.phone_number && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{member.phone_number}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${member.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {member.is_active !== false ? '● Active' : '○ Inactive'}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Member Row ────────────────────────────────────────────────────────────────
const MemberRow: React.FC<{
  member: MemberDTO;
  selected: boolean;
  onToggle: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ member, selected, onToggle, onView, onEdit, onDelete }) => {
  const name = member.full_name || `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim() || member.email;
  const initials = name.slice(0, 2).toUpperCase();
  const isAdmin = member.role === 'admin' || member.role === 'super_admin';

  return (
    <Card className={`hover:shadow-sm transition-shadow ${selected ? 'ring-2 ring-teal-400' : ''}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <Checkbox checked={selected} onCheckedChange={onToggle} onClick={(e) => e.stopPropagation()} />
          <button
            onClick={onView}
            className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 hover:bg-teal-200 transition-colors"
          >
            <span className="text-sm font-semibold text-teal-700">{initials}</span>
          </button>
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onView}>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
              <Badge
                variant={isAdmin ? 'destructive' : 'secondary'}
                className="text-[10px] px-1.5 py-0"
              >
                {member.role}
              </Badge>
              {member.is_active === false && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-gray-400">inactive</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              <span className="flex items-center gap-1 truncate"><Mail className="h-3 w-3 flex-shrink-0" />{member.email}</span>
              {member.phone_number && (
                <span className="hidden sm:flex items-center gap-1"><Phone className="h-3 w-3" />{member.phone_number}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onEdit} title="Edit">
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={onDelete} title="Remove">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ChurchMemberManagement: React.FC = () => {
  const { currentChurch, currentBranch, effectiveRole } = useChurch();
  const { members, loading, saving, load, create, update, remove, removeMany, importMembers } = useMemberCrud();

  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MemberDTO | null>(null);
  const [viewTarget, setViewTarget] = useState<MemberDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MemberDTO | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  useEffect(() => { load(); }, [load, currentBranch]);

  const filtered = members.filter((m) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    const name = (m.full_name || `${m.first_name ?? ''} ${m.last_name ?? ''}`).toLowerCase();
    return name.includes(term) || m.email.toLowerCase().includes(term) || (m.phone_number || '').includes(term);
  });

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleSelectAll = () =>
    setSelectedIds(filtered.every((m) => selectedIds.has(m.id))
      ? new Set()
      : new Set(filtered.map((m) => m.id)));

  const handleBulkDelete = async () => {
    const ok = await removeMany(Array.from(selectedIds));
    if (ok) { setSelectedIds(new Set()); setBulkDeleteOpen(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await remove(deleteTarget.id);
    if (ok) setDeleteTarget(null);
  };

  const canManage = effectiveRole === 'admin' || effectiveRole === 'super_admin';
  const branchName = currentBranch?.name;
  const churchName = currentChurch?.denomination_name;
  const displayOrg = branchName ?? churchName ?? '';

  const adminCount = members.filter((m) => m.role === 'admin' || m.role === 'super_admin').length;
  const activeCount = members.filter((m) => m.is_active !== false).length;
  const allSelected = filtered.length > 0 && filtered.every((m) => selectedIds.has(m.id));
  const someSelected = filtered.some((m) => selectedIds.has(m.id)) && !allSelected;

  if (!currentChurch) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-gray-500">Please select a church first.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Members</h2>
          <p className="text-sm text-gray-500 mt-1">
            {displayOrg ? `Manage members of ${displayOrg}` : 'Manage church members'}
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => exportToCSV(members)}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4 mr-2" /> Import
            </Button>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => setAddOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" /> Add Member
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{members.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{adminCount}</p>
              <p className="text-xs text-gray-500">Admins</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* List Card */}
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-medium">
                All Members {loading && <Loader2 className="inline h-4 w-4 animate-spin ml-2" />}
              </CardTitle>
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkDeleteOpen(true)}
                  disabled={saving}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete {selectedIds.size} selected
                </Button>
              )}
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, phone..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length > 0 && canManage && (
            <div className="flex items-center gap-2 px-1 pb-3 border-b mb-3">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all"
                data-state={someSelected ? 'indeterminate' : allSelected ? 'checked' : 'unchecked'}
              />
              <span className="text-sm text-gray-500">
                {someSelected || allSelected ? `${selectedIds.size} selected` : 'Select all'}
              </span>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-200" />
              <p className="font-medium text-gray-500">No members found</p>
              <p className="text-sm">
                {search ? 'Try a different search term.' : 'Add members using the button above.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  selected={selectedIds.has(m.id)}
                  onToggle={() => toggleSelect(m.id)}
                  onView={() => setViewTarget(m)}
                  onEdit={() => setEditTarget(m)}
                  onDelete={() => setDeleteTarget(m)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddMemberDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={(data) => create({ ...data, branch_name: branchName, church_name: churchName })}
        saving={saving}
        branchName={branchName}
        churchName={churchName}
      />

      <EditMemberDialog
        open={!!editTarget}
        onOpenChange={(o) => { if (!o) setEditTarget(null); }}
        member={editTarget}
        onSave={update}
        saving={saving}
      />

      <ViewMemberDialog
        member={viewTarget}
        onClose={() => setViewTarget(null)}
      />

      <ImportMembersDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={importMembers}
        saving={saving}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Remove Member"
        description={`Remove "${deleteTarget?.full_name || deleteTarget?.email}"? They will be deactivated.`}
        onConfirm={handleDelete}
        loading={saving}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={(o) => { if (!o) setBulkDeleteOpen(false); }}
        title="Remove Selected Members"
        description={`Remove ${selectedIds.size} member(s)? They will be deactivated.`}
        onConfirm={handleBulkDelete}
        loading={saving}
        confirmLabel="Remove All"
        variant="danger"
        icon={<Trash2 className="h-6 w-6 text-red-600" />}
      />
    </div>
  );
};

export default ChurchMemberManagement;
