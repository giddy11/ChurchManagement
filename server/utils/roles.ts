export type RoleName = 'super_admin' | 'admin' | 'member';

export interface RoleDefinition {
  name: RoleName;
  description: string;
  permissions: string[];
}

const ALL_PERMISSIONS = [
  'view_members', 'manage_members',
  'view_attendance', 'manage_attendance',
  'view_contributions', 'manage_contributions',
  'view_events', 'manage_events',
  'view_reports', 'manage_reports',
  'view_users', 'manage_users',
  'view_settings', 'manage_settings',
  'view_roles', 'manage_roles',
  'view_departments', 'manage_departments',
  'view_categories', 'manage_categories',
];

const ROLES: Record<RoleName, RoleDefinition> = {
  super_admin: {
    name: 'super_admin',
    description: 'Full system access',
    permissions: ALL_PERMISSIONS,
  },
  admin: {
    name: 'admin',
    description: 'Church administrator',
    permissions: [
      'view_members', 'manage_members',
      'view_attendance', 'manage_attendance',
      'view_contributions', 'manage_contributions',
      'view_events', 'manage_events',
      'view_reports',
      'view_users', 'manage_users',
      'view_settings',
      'view_departments',
      'view_categories',
    ],
  },
  member: {
    name: 'member',
    description: 'Regular church member',
    permissions: [
      'view_members',
      'view_attendance',
      'view_events',
      'view_contributions',
    ],
  },
};

export function getRoleDefinition(roleName: string): RoleDefinition {
  return ROLES[roleName as RoleName] ?? ROLES.member;
}

export function getPermissionsForRole(roleName: string): string[] {
  return getRoleDefinition(roleName).permissions;
}

export function isValidRole(roleName: string): roleName is RoleName {
  return roleName in ROLES;
}

export function getAllRoles(): RoleDefinition[] {
  return Object.values(ROLES);
}
