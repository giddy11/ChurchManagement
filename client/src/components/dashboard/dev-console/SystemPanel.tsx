import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Shield, Server, Heart, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import type { RoleInfo, HealthInfo, UserStats } from './types';

interface SystemPanelProps {
  roles: RoleInfo[];
  health: HealthInfo | null;
  stats: UserStats | null;
  userCount: number;
  activityTotal: number;
  loading: boolean;
  onRefresh: () => void;
}

const SystemPanel: React.FC<SystemPanelProps> = ({
  roles,
  health,
  stats,
  userCount,
  activityTotal,
  loading,
  onRefresh,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <RolesCard roles={roles} />
    <ServerCard
      health={health}
      stats={stats}
      userCount={userCount}
      activityTotal={activityTotal}
      loading={loading}
      onRefresh={onRefresh}
    />
  </div>
);

const RolesCard: React.FC<{ roles: RoleInfo[] }> = ({ roles }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base flex items-center gap-2">
        <Shield className="h-4 w-4" /> Roles &amp; Permissions
      </CardTitle>
    </CardHeader>
    <CardContent>
      {roles.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">No roles defined</p>
      )}
      <div className="space-y-3">
        {roles.map((role) => (
          <div key={role.id} className="rounded-lg border p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-medium text-sm capitalize">{role.name}</span>
              <Badge variant="secondary" className="text-[10px]">{role.permissions?.length ?? 0} permissions</Badge>
            </div>
            {role.permissions && role.permissions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {role.permissions.slice(0, 8).map((p) => (
                  <Badge key={p.id} variant="outline" className="text-[10px] font-normal">{p.name}</Badge>
                ))}
                {role.permissions.length > 8 && (
                  <Badge variant="outline" className="text-[10px] font-normal">+{role.permissions.length - 8} more</Badge>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const ServerCard: React.FC<{
  health: HealthInfo | null;
  stats: UserStats | null;
  userCount: number;
  activityTotal: number;
  loading: boolean;
  onRefresh: () => void;
}> = ({ health, stats, userCount, activityTotal, loading, onRefresh }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base flex items-center gap-2">
        <Server className="h-4 w-4" /> Server Status
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="rounded-lg border p-4 space-y-3">
        <ServerRow label="API Status">
          {health ? (
            <Badge variant={health.status === 'OK' ? 'default' : 'destructive'}>{health.status}</Badge>
          ) : (
            <Badge variant="destructive">Unreachable</Badge>
          )}
        </ServerRow>
        <Separator />
        <ServerRow label="Last Checked">
          <span className="text-sm text-muted-foreground">{health ? format(new Date(health.timestamp), 'PPpp') : '—'}</span>
        </ServerRow>
        <Separator />
        <ServerRow label="Total Users">
          <span className="text-sm font-medium">{stats?.totalUsers ?? userCount}</span>
        </ServerRow>
        <Separator />
        <ServerRow label="Logged Activities">
          <span className="text-sm font-medium">{activityTotal}</span>
        </ServerRow>
        <Separator />
        <ServerRow label="API Health">
          {health ? (
            <span className={`text-sm ${health.status === 'OK' ? 'text-green-600' : 'text-red-500'}`}>
              <Heart className="h-3.5 w-3.5 inline mr-1" />{health.status}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Unavailable</span>
          )}
        </ServerRow>
      </div>
      <Button variant="outline" className="w-full" onClick={onRefresh} disabled={loading}>
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Re-check All
      </Button>
    </CardContent>
  </Card>
);

const ServerRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm">{label}</span>
    {children}
  </div>
);

export default SystemPanel;
