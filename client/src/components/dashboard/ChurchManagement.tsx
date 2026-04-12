import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Church,
  Plus,
  Search,
  Users,
  MapPin,
  Trash2,
  Edit,
  Building,
  LayoutGrid,
  LayoutList,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useChurchCrud } from '@/hooks/useChurchCrud';
import ChurchFormDialog from '@/components/church/ChurchFormDialog';
import ChurchViewDialog from '@/components/church/ChurchViewDialog';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import type { ChurchDTO } from '@/lib/api';

const ChurchManagement: React.FC = () => {
  const { churches, loading, saving, load, create, update, remove } = useChurchCrud();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ChurchDTO | null>(null);
  const [viewTarget, setViewTarget] = useState<ChurchDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChurchDTO | null>(null);

  // Data is loaded automatically by useQuery

  const filtered = churches.filter((c) =>
    c.denomination_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreate = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit = (c: ChurchDTO) => { setEditTarget(c); setFormOpen(true); };
  const openView = (c: ChurchDTO) => setViewTarget(c);
  const openDelete = (c: ChurchDTO) => setDeleteTarget(c);

  const handleFormSubmit = async (data: any) => {
    const ok = editTarget
      ? await update(editTarget.id, data)
      : await create(data);
    if (ok) setFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await remove(deleteTarget.id);
    if (ok) setDeleteTarget(null);
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl">
      <Header onAdd={openCreate} viewMode={viewMode} onViewChange={setViewMode} />
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <SummaryCards total={churches.length} />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : viewMode === 'card' ? (
        <CardView churches={filtered} onView={openView} onEdit={openEdit} onDelete={openDelete} />
      ) : (
        <TableView churches={filtered} onView={openView} onEdit={openEdit} onDelete={openDelete} />
      )}

      <ChurchFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        initial={editTarget}
        loading={saving}
      />
      <ChurchViewDialog
        open={!!viewTarget}
        onOpenChange={() => setViewTarget(null)}
        church={viewTarget}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Church"
        description={`Are you sure you want to delete "${deleteTarget?.denomination_name}"? This action cannot be undone and will remove all branch associations.`}
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  );
};

/* ─── Sub-components ──────────────────────────────────── */

const Header: React.FC<{
  onAdd: () => void;
  viewMode: 'card' | 'table';
  onViewChange: (m: 'card' | 'table') => void;
}> = ({ onAdd, viewMode, onViewChange }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Churches</h2>
      <p className="text-sm text-gray-500 mt-1">Manage all registered churches on the platform</p>
    </div>
    <div className="flex items-center gap-2">
      <div className="border rounded-md flex">
        <Button
          variant={viewMode === 'card' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-9 w-9 rounded-r-none"
          onClick={() => onViewChange('card')}
          title="Card view"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'table' ? 'secondary' : 'ghost'}
          size="icon"
          className="h-9 w-9 rounded-l-none"
          onClick={() => onViewChange('table')}
          title="Table view"
        >
          <LayoutList className="h-4 w-4" />
        </Button>
      </div>
      <Button onClick={onAdd}>
        <Plus className="h-4 w-4 mr-2" />
        Add Church
      </Button>
    </div>
  </div>
);

const SearchBar: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div className="relative mb-6">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
    <Input className="pl-10" placeholder="Search churches..." value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const SummaryCards: React.FC<{ total: number }> = ({ total }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    <StatCard icon={Building} iconColor="text-blue-600" bgColor="bg-blue-100" value={total} label="Total Churches" />
    <StatCard icon={MapPin} iconColor="text-green-600" bgColor="bg-green-100" value={0} label="Total Branches" />
    <StatCard icon={Users} iconColor="text-purple-600" bgColor="bg-purple-100" value={0} label="Total Members" />
  </div>
);

const StatCard: React.FC<{
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  value: number;
  label: string;
}> = ({ icon: Icon, iconColor, bgColor, value, label }) => (
  <Card>
    <CardContent className="p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </CardContent>
  </Card>
);

const EmptyState: React.FC = () => (
  <Card>
    <CardContent className="p-8 text-center text-gray-500">
      <Church className="h-12 w-12 mx-auto mb-3 text-gray-300" />
      <p className="font-medium">No churches found</p>
      <p className="text-sm">Create a new church to get started</p>
    </CardContent>
  </Card>
);

interface ListProps {
  churches: ChurchDTO[];
  onView: (c: ChurchDTO) => void;
  onEdit: (c: ChurchDTO) => void;
  onDelete: (c: ChurchDTO) => void;
}

const CardView: React.FC<ListProps> = ({ churches, onView, onEdit, onDelete }) => {
  if (churches.length === 0) return <EmptyState />;
  return (
    <div className="space-y-3">
      {churches.map((church) => (
        <Card key={church.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onView(church)}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Church className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{church.denomination_name}</h3>
                  {church.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{church.description}</p>}
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {church.location && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" /> {church.location}{church.state ? `, ${church.state}` : ''}
                      </span>
                    )}
                    {church.country && <Badge variant="outline" className="text-[10px]">{church.country}</Badge>}
                  </div>
                </div>
              </div>
              <ActionButtons church={church} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const TableView: React.FC<ListProps> = ({ churches, onView, onEdit, onDelete }) => {
  if (churches.length === 0) return <EmptyState />;
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden sm:table-cell">State</TableHead>
                <TableHead className="hidden lg:table-cell">Country</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {churches.map((church) => (
                <TableRow key={church.id} className="cursor-pointer" onClick={() => onView(church)}>
                  <TableCell className="font-medium">{church.denomination_name}</TableCell>
                  <TableCell className="hidden md:table-cell">{church.location || '—'}</TableCell>
                  <TableCell className="hidden sm:table-cell">{church.state || '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell">{church.country || '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {church.created_at ? format(new Date(church.created_at), 'PP') : '—'}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <ActionButtons church={church} onEdit={onEdit} onDelete={onDelete} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const ActionButtons: React.FC<{
  church: ChurchDTO;
  onEdit: (c: ChurchDTO) => void;
  onDelete: (c: ChurchDTO) => void;
}> = ({ church, onEdit, onDelete }) => (
  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(church)} title="Edit">
      <Edit className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => onDelete(church)} title="Delete">
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
);

export default ChurchManagement;
