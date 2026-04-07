import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  fetchUsers,
  fetchUserStatistics,
  fetchActivities,
  fetchRecentActivities,
  fetchRoles,
  fetchHealth,
  backendLogin,
  getBackendToken,
  setBackendToken,
} from '@/lib/api';
import { getAllUsers } from '@/lib/auth';
import { useAuth } from '@/components/auth/AuthProvider';
import { format } from 'date-fns';
import {
  Users,
  Activity,
  Shield,
  Heart,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  UserX,
  Clock,
  Server,
  LogIn,
  LogOut,
  WifiOff,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface BackendUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  role?: { name: string };
  is_active: boolean;
  createdAt?: string;
  phone_number?: string;
}

interface LocalUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  joinDate: string;
}

interface DisplayUser {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  joinDate: string;
  source: 'local' | 'backend';
}

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, any>;
  user?: { email: string; full_name?: string };
  createdAt: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: { role: string; count: number }[];
}

interface RoleInfo {
  id: string;
  name: string;
  permissions?: { id: string; name: string }[];
}

interface HealthInfo {
  status: string;
  timestamp: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  approve: 'bg-emerald-100 text-emerald-800',
  reject: 'bg-orange-100 text-orange-800',
  status_change: 'bg-yellow-100 text-yellow-800',
  lock: 'bg-gray-100 text-gray-800',
  unlock: 'bg-teal-100 text-teal-800',
  assign: 'bg-purple-100 text-purple-800',
  dispatch: 'bg-indigo-100 text-indigo-800',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Component ───────────────────────────────────────────────────────────────
const SuperAdmin = () => {
  const { user: currentUser } = useAuth();

  // Backend connection state
  const [isBackendConnected, setIsBackendConnected] = useState(!!getBackendToken());
  const [backendEmail, setBackendEmail] = useState('');
  const [backendPassword, setBackendPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Data state
  const [displayUsers, setDisplayUsers] = useState<DisplayUser[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [activitiesTotal, setActivitiesTotal] = useState(0);
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [health, setHealth] = useState<HealthInfo | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [activityActionFilter, setActivityActionFilter] = useState('all');
  const [activityEntityFilter, setActivityEntityFilter] = useState('all');
  const [activityPage, setActivityPage] = useState(0);
  const PAGE_SIZE = 25;

  // ─── Load local users always ─────────────────────────────────────────────
  const loadLocalUsers = useCallback(() => {
    const localUsers: LocalUser[] = getAllUsers(currentUser?.id ?? '');
    return localUsers.map<DisplayUser>((u) => ({
      id: u.id,
      email: u.email,
      name: `${u.firstName} ${u.lastName}`.trim() || u.email,
      role: u.role,
      status: 'active',
      joinDate: u.joinDate,
      source: 'local',
    }));
  }, [currentUser?.id]);

  // ─── Backend data fetch ──────────────────────────────────────────────────
  const loadBackendData = useCallback(async () => {
    if (!getBackendToken()) return;
    setLoading(true);
    try {
      const [usersRes, statsRes, recentRes, rolesRes, healthRes] =
        await Promise.allSettled([
          fetchUsers(),
          fetchUserStatistics(),
          fetchRecentActivities(10),
          fetchRoles(),
          fetchHealth(),
        ]);

      if (usersRes.status === 'fulfilled') {
        const backendUsers: DisplayUser[] = (usersRes.value.data as BackendUser[]).map((u) => ({
          id: u.id,
          email: u.email,
          name: u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
          role: u.role?.name || '—',
          status: u.is_active ? 'active' : 'inactive',
          joinDate: u.createdAt || '',
          source: 'backend' as const,
        }));
        setDisplayUsers(backendUsers);
      }
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (recentRes.status === 'fulfilled') setRecentActivities(recentRes.value.data);
      if (rolesRes.status === 'fulfilled') setRoles(rolesRes.value.data);
      if (healthRes.status === 'fulfilled') setHealth(healthRes.value);

      // Detect token expiry
      const anyUnauthorized = [usersRes, statsRes].some(
        (r) => r.status === 'rejected' && String((r as PromiseRejectedResult).reason).includes('401')
      );
      if (anyUnauthorized) {
        setBackendToken(null);
        setIsBackendConnected(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadActivities = useCallback(async () => {
    if (!getBackendToken()) return;
    const params: Record<string, string> = {
      limit: String(PAGE_SIZE),
      offset: String(activityPage * PAGE_SIZE),
    };
    if (activityActionFilter !== 'all') params.action = activityActionFilter;
    if (activityEntityFilter !== 'all') params.entityType = activityEntityFilter;
    try {
      const res = await fetchActivities(params);
      setActivities(res.data);
      setActivitiesTotal(res.total);
    } catch { /* silent */ }
  }, [activityActionFilter, activityEntityFilter, activityPage]);

  // ─── Initialise on mount ──────────────────────────────────────────────────
  useEffect(() => {
    // Always show local users immediately
    setDisplayUsers(loadLocalUsers());
    // Load backend data if already connected
    if (getBackendToken()) {
      loadBackendData();
      loadActivities();
    }
  }, [loadLocalUsers, loadBackendData, loadActivities]);

  useEffect(() => {
    if (isBackendConnected) loadActivities();
  }, [isBackendConnected, loadActivities]);

  // ─── Backend login ────────────────────────────────────────────────────────
  const handleBackendLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const token = await backendLogin(backendEmail, backendPassword);
      setBackendToken(token);
      setIsBackendConnected(true);
      setBackendEmail('');
      setBackendPassword('');
      await loadBackendData();
      await loadActivities();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleBackendLogout = () => {
    setBackendToken(null);
    setIsBackendConnected(false);
    setActivities([]);
    setRecentActivities([]);
    setRoles([]);
    setStats(null);
    setHealth(null);
    // Restore local users
    setDisplayUsers(loadLocalUsers());
  };

  // ─── Derived data ───────────────────────────────────────────────────────
  const filteredUsers = displayUsers.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      !q ||
      u.email?.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const actionOptions = [
    'create', 'update', 'delete', 'approve', 'reject',
    'lock', 'unlock', 'dispatch', 'assign', 'status_change',
  ];

  const entityOptions = [
    'user', 'approval', 'asset', 'inventory', 'work_order',
    'maintenance_schedule', 'vehicle', 'inspection',
    'fuel_log', 'technician', 'vendor', 'cost_record', 'vessel', 'report',
  ];

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Developer Console
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Application monitoring &amp; user oversight
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isBackendConnected ? (
            <>
              {health && (
                <Badge
                  variant={health.status === 'OK' ? 'default' : 'destructive'}
                  className="gap-1"
                >
                  {health.status === 'OK' ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  API {health.status}
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={() => { loadBackendData(); loadActivities(); }} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleBackendLogout} className="gap-1 text-red-600 border-red-200 hover:bg-red-50">
                <LogOut className="h-4 w-4" />
                Disconnect API
              </Button>
            </>
          ) : (
            <Badge variant="secondary" className="gap-1 text-muted-foreground">
              <WifiOff className="h-3 w-3" />
              API offline
            </Badge>
          )}
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-7xl">
        {/* ─── Backend connect panel (shown when not connected) ─── */}
        {!isBackendConnected && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-800">
                <LogIn className="h-4 w-4" />
                Connect to Backend API
              </CardTitle>
              <p className="text-xs text-amber-700 mt-1">
                Activity logs, roles, and live stats require a backend session. Enter your server credentials below.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBackendLogin} className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-amber-800 font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    className="h-8 w-56 text-sm"
                    value={backendEmail}
                    onChange={(e) => setBackendEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-amber-800 font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-8 w-44 text-sm"
                    value={backendPassword}
                    onChange={(e) => setBackendPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" size="sm" disabled={loginLoading}>
                  <LogIn className="h-4 w-4 mr-1" />
                  {loginLoading ? 'Connecting…' : 'Connect'}
                </Button>
                {loginError && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {loginError}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* ───── OVERVIEW TAB ───── */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats?.totalUsers ?? displayUsers.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">
                    {stats?.activeUsers ?? '—'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
                  <UserX className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-500">
                    {stats?.inactiveUsers ?? '—'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Roles Defined</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{roles.length}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent activity feed */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[360px] pr-3">
                    {recentActivities.length === 0 && (
                      <div className="py-10 text-center">
                        <WifiOff className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {isBackendConnected
                            ? 'No recent activity recorded'
                            : 'Connect to backend API to view activity logs'}
                        </p>
                      </div>
                    )}
                    <div className="space-y-3">
                      {recentActivities.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-start gap-3 rounded-lg border p-3 text-sm"
                        >
                          <div className="mt-0.5">
                            <Badge
                              className={`text-[10px] px-1.5 py-0 ${actionColors[a.action] || 'bg-gray-100 text-gray-700'}`}
                            >
                              {a.action}
                            </Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{a.description}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {a.user?.email || 'system'} &middot;{' '}
                              <span className="capitalize">{a.entityType?.replace('_', ' ')}</span>
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeAgo(a.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* User distribution by role */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" /> Users by Role
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.usersByRole && stats.usersByRole.length > 0 ? (
                    <div className="space-y-3">
                      {stats.usersByRole.map((r) => (
                        <div key={r.role} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{r.role}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{
                                  width: `${Math.min(100, (r.count / (stats.totalUsers || 1)) * 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">{r.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">No data</p>
                  )}

                  <Separator className="my-4" />

                  {/* Health info */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5" /> API Health
                    </h4>
                    {health ? (
                      <div className="text-xs space-y-1 text-muted-foreground">
                        <p>
                          Status:{' '}
                          <span className={health.status === 'OK' ? 'text-green-600' : 'text-red-500'}>
                            {health.status}
                          </span>
                        </p>
                        <p>Checked: {format(new Date(health.timestamp), 'PPpp')}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Unavailable</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ───── USERS TAB ───── */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or role…"
                  className="pl-8"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <Badge variant="outline" className="gap-1">
                {isBackendConnected ? 'Backend data' : 'Local data'}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </p>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name || '—'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.role || '—'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.status === 'active' ? 'default' : 'destructive'}
                            className="text-[11px]"
                          >
                            {user.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.joinDate ? format(new Date(user.joinDate), 'PP') : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ───── ACTIVITY LOGS TAB ───── */}
          <TabsContent value="activity" className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={activityActionFilter} onValueChange={(v) => { setActivityActionFilter(v); setActivityPage(0); }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actionOptions.map((a) => (
                    <SelectItem key={a} value={a} className="capitalize">
                      {a.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={activityEntityFilter} onValueChange={(v) => { setActivityEntityFilter(v); setActivityPage(0); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {entityOptions.map((e) => (
                    <SelectItem key={e} value={e} className="capitalize">
                      {e.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className="ml-auto text-sm text-muted-foreground">
                {activitiesTotal} total record{activitiesTotal !== 1 ? 's' : ''}
              </p>
            </div>

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
                          {!isBackendConnected
                            ? 'Connect to the backend API above to view activity logs'
                            : loading
                            ? 'Loading activity logs…'
                            : 'No activity logs found'}
                        </TableCell>
                      </TableRow>
                    )}
                    {activities.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          <Badge
                            className={`text-[10px] ${actionColors[a.action] || 'bg-gray-100 text-gray-700'}`}
                          >
                            {a.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize text-sm">
                          {a.entityType?.replace('_', ' ') || '—'}
                        </TableCell>
                        <TableCell className="text-sm max-w-[300px] truncate">
                          {a.description}
                        </TableCell>
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

            {/* Pagination */}
            {activitiesTotal > PAGE_SIZE && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {activityPage + 1} of {Math.ceil(activitiesTotal / PAGE_SIZE)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activityPage === 0}
                    onClick={() => setActivityPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={(activityPage + 1) * PAGE_SIZE >= activitiesTotal}
                    onClick={() => setActivityPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ───── SYSTEM TAB ───── */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Roles overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Roles &amp; Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {roles.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No roles defined
                    </p>
                  )}
                  <div className="space-y-3">
                    {roles.map((role) => (
                      <div key={role.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-medium text-sm capitalize">{role.name}</span>
                          <Badge variant="secondary" className="text-[10px]">
                            {role.permissions?.length ?? 0} permissions
                          </Badge>
                        </div>
                        {role.permissions && role.permissions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 8).map((p) => (
                              <Badge
                                key={p.id}
                                variant="outline"
                                className="text-[10px] font-normal"
                              >
                                {p.name}
                              </Badge>
                            ))}
                            {role.permissions.length > 8 && (
                              <Badge variant="outline" className="text-[10px] font-normal">
                                +{role.permissions.length - 8} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Server status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Server className="h-4 w-4" /> Server Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Status</span>
                      {health ? (
                        <Badge variant={health.status === 'OK' ? 'default' : 'destructive'}>
                          {health.status}
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Unreachable</Badge>
                      )}
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last Checked</span>
                      <span className="text-sm text-muted-foreground">
                        {health ? format(new Date(health.timestamp), 'PPpp') : '—'}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Users</span>
                      <span className="text-sm font-medium">
                        {stats?.totalUsers ?? displayUsers.length}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Logged Activities</span>
                      <span className="text-sm font-medium">{activitiesTotal}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Defined Roles</span>
                      <span className="text-sm font-medium">{roles.length}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => { loadBackendData(); loadActivities(); }}
                    disabled={loading || !isBackendConnected}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Re-check All
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SuperAdmin;