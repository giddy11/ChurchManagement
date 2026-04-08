import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { fetchActivityStats } from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

interface StatsData {
  byAction: { action: string; count: number }[];
  byEntity: { entityType: string; count: number }[];
  daily: { date: string; count: number }[];
}

const AnalyticsPanel: React.FC = () => {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchActivityStats(30);
      setData(res.data);
    } catch {
      /* toast handled upstream */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Unable to load analytics data
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <DailyTrendChart daily={data.daily} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActionBarChart byAction={data.byAction} />
        <EntityPieChart byEntity={data.byEntity} />
      </div>
    </div>
  );
};

const DailyTrendChart: React.FC<{ daily: StatsData['daily'] }> = ({ daily }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Activity Trends (30 Days)</CardTitle>
    </CardHeader>
    <CardContent>
      {daily.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No activity data</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={daily} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
            />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              labelFormatter={(v) => new Date(v).toLocaleDateString()}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorActivity)"
              name="Activities"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);

const ActionBarChart: React.FC<{ byAction: StatsData['byAction'] }> = ({ byAction }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Activity by Action</CardTitle>
    </CardHeader>
    <CardContent>
      {byAction.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No data</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={byAction} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="action" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
              {byAction.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);

const EntityPieChart: React.FC<{ byEntity: StatsData['byEntity'] }> = ({ byEntity }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Activity by Entity</CardTitle>
    </CardHeader>
    <CardContent>
      {byEntity.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No data</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={byEntity}
              dataKey="count"
              nameKey="entityType"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
              style={{ fontSize: 11 }}
            >
              {byEntity.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
);

export default AnalyticsPanel;
