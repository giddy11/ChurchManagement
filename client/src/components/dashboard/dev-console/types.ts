export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, any>;
  user?: { email: string; full_name?: string };
  createdAt: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: { role: string; count: number }[];
}

export interface DisplayUser {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  joinDate: string;
}

export interface RoleInfo {
  id: string;
  name: string;
  permissions?: { id: string; name: string }[];
}

export interface HealthInfo {
  status: string;
  timestamp: string;
}

export interface BackendUser {
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
