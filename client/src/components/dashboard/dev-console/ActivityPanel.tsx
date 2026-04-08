import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchActivities } from '@/lib/api';
import { format } from 'date-fns';
import { actionColors } from './helpers';
import type { ActivityLog } from './types';

const PAGE_SIZE = 25;

const ACTION_OPTIONS = [
  'create', 'update', 'delete', 'approve', 'reject',
  'lock', 'unlock', 'dispatch', 'assign', 'status_change',
  'login', 'register', 'logout',
];

const ENTITY_OPTIONS = [
  'user', 'church', 'branch', 'auth', 'approval', 'asset',
  'inventory', 'work_order', 'maintenance_schedule', 'vehicle',
  'inspection', 'fuel_log', 'technician', 'vendor',
  'cost_record', 'vessel', 'report',
];

const ActivityPanel: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {
      limit: String(PAGE_SIZE),
      offset: String(page * PAGE_SIZE),
    };
    if (actionFilter !== 'all') params.action = actionFilter;
    if (entityFilter !== 'all') params.entityType = entityFilter;
    try {
      const res = await fetchActivities(params);
      setActivities(res.data);
      setTotal(res.total);
    } catch { /* silent */ }
    setLoading(false);
  }, [actionFilter, entityFilter, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <Filters
        actionFilter={actionFilter}
        entityFilter={entityFilter}
        onActionChange={(v) => { setActionFilter(v); setPage(0); }}
        onEntityChange={(v) => { setEntityFilter(v); setPage(0); }}
        total={total}
      />
      <ActivityTable activities={activities} loading={loading} />
      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}
    </div>
  );
};

const Filters: React.FC<{
  actionFilter: string;
  entityFilter: string;
  onActionChange: (v: string) => void;
  onEntityChange: (v: string) => void;
  total: number;
}> = ({ actionFilter, entityFilter, onActionChange, onEntityChange, total }) => (
  <div className="flex flex-wrap items-center gap-3">
    <Select value={actionFilter} onValueChange={onActionChange}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Action type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Actions</SelectItem>
        {ACTION_OPTIONS.map((a) => (
          <SelectItem key={a} value={a} className="capitalize">{a.replace('_', ' ')}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Select value={entityFilter} onValueChange={onEntityChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Entity type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Entities</SelectItem>
        {ENTITY_OPTIONS.map((e) => (
          <SelectItem key={e} value={e} className="capitalize">{e.replace('_', ' ')}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <p className="ml-auto text-sm text-muted-foreground">
      {total} total record{total !== 1 ? 's' : ''}
    </p>
  </div>
);

const ActivityTable: React.FC<{ activities: ActivityLog[]; loading: boolean }> = ({ activities, loading }) => (
  <Card>
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Action</TableHead>
            <TableHead className="w-[120px]">Entity</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="w-[160px]">Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                {loading ? 'Loading activity logs…' : 'No activity logs found'}
              </TableCell>
            </TableRow>
          )}
          {activities.map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                <Badge className={`text-[10px] ${actionColors[a.action] || 'bg-gray-100 text-gray-700'}`}>
                  {a.action}
                </Badge>
              </TableCell>
              <TableCell className="capitalize text-sm">{a.entityType?.replace('_', ' ') || '—'}</TableCell>
              <TableCell className="text-sm max-w-[300px] truncate">{a.description}</TableCell>
              <TableCell className="text-sm">{a.user?.email || 'system'}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(a.createdAt), 'PP p')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

const Pagination: React.FC<{ page: number; totalPages: number; onChange: (p: number) => void }> = ({
  page,
  totalPages,
  onChange,
}) => (
  <div className="flex items-center justify-between">
    <p className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</p>
    <div className="flex gap-2">
      <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onChange(page - 1)}>Previous</Button>
      <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)}>Next</Button>
    </div>
  </div>
);

export default ActivityPanel;
