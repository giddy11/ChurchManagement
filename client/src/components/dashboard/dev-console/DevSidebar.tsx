import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Activity,
  Server,
  BarChart3,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type DevSection = 'overview' | 'analytics' | 'users' | 'activity' | 'system';

interface NavItem {
  id: DevSection;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'activity', label: 'Activity Logs', icon: Activity },
  { id: 'system', label: 'System', icon: Server },
];

interface DevSidebarProps {
  current: DevSection;
  onChange: (s: DevSection) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const DevSidebar: React.FC<DevSidebarProps> = ({ current, onChange, collapsed, onToggle }) => (
  <aside
    className={cn(
      'hidden md:flex flex-col border-r bg-white transition-all duration-200',
      collapsed ? 'w-16' : 'w-56'
    )}
  >
    <div className="flex items-center justify-between p-3 border-b">
      {!collapsed && (
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Dev Console</span>
        </div>
      )}
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </div>
    <nav className="flex-1 py-2 space-y-0.5 px-2">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            'flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm transition-colors',
            current === id
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
          title={collapsed ? label : undefined}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>{label}</span>}
        </button>
      ))}
    </nav>
  </aside>
);

export const MobileNav: React.FC<{ current: DevSection; onChange: (s: DevSection) => void }> = ({
  current,
  onChange,
}) => (
  <div className="flex md:hidden overflow-x-auto border-b bg-white px-2 py-1 gap-1">
    {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        onClick={() => onChange(id)}
        className={cn(
          'flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs transition-colors',
          current === id
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-muted-foreground hover:bg-muted'
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </button>
    ))}
  </div>
);

export default DevSidebar;
