import { authFetch, getAccessToken, setTokens, clearTokens } from '@/services/auth.service';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:7777/api';

// Legacy key support for SuperAdmin page
export const BACKEND_TOKEN_KEY = 'access_token';

export function getBackendToken(): string | null {
  return getAccessToken();
}

export function setBackendToken(token: string | null) {
  if (token) setTokens(token, '');
  else clearTokens();
}

// Backend login — returns a JWT token on success
export async function backendLogin(
  email: string,
  password: string
): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Login failed');
  const token = body.data?.accessToken || body.token || body.access_token;
  if (!token) throw new Error('Server did not return a token');
  return token;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await authFetch(endpoint, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Users
export const fetchUsers = () =>
  request<{ data: any[]; status: number; message: string }>('/user');

export const fetchUserStatistics = () =>
  request<{ data: any; status: number; message: string }>('/user/statistics');

// Activity Logs
export const fetchActivities = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return request<{ data: any[]; total: number; status: boolean; message: string }>(
    `/activities${qs}`
  );
};

export const fetchRecentActivities = (limit = 20) =>
  request<{ data: any[]; status: boolean; message: string }>(
    `/activities/recent?limit=${limit}`
  );

export const fetchActivityStats = (days = 30) =>
  request<{ data: { byAction: any[]; byEntity: any[]; daily: any[] }; status: boolean }>( 
    `/activities/stats?days=${days}`
  );

// Roles & Permissions
export const fetchRoles = () =>
  request<{ data: any[]; status: number; message: string }>('/roles-permissions/role');

export const fetchPermissions = () =>
  request<{ data: any[]; status: number; message: string }>('/roles-permissions/permission');

// Health
export const fetchHealth = () =>
  fetch(
    `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:7777'}/health`
  ).then((r) => r.json());

// Delete user
export const deleteUserById = (id: string) =>
  request<{ status: number; message: string }>(`/user/${id}`, { method: 'DELETE' });

// ─── Denominations (top-level church organisations) ───────────────────────
export interface BranchDTO {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pastor_name?: string;
  description?: string;
  is_headquarters: boolean;
  denomination_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChurchDTO {
  id: string;
  denomination_name: string;
  description?: string;
  location?: string;
  state?: string;
  country?: string;
  address?: string;
  admin_id: string;
  admin?: { id: string; email: string; full_name?: string };
  branches?: BranchDTO[];
  created_at: string;
  updated_at: string;
}

export const fetchChurches = () =>
  request<{ data: ChurchDTO[]; status: number; message: string }>('/churches');

export const fetchChurchById = (id: string) =>
  request<{ data: ChurchDTO; status: number; message: string }>(`/churches/${id}`);

export const createChurchApi = (data: {
  denomination_name: string;
  description?: string;
  location?: string;
  state?: string;
  country?: string;
  address?: string;
}) =>
  request<{ data: ChurchDTO; status: number; message: string }>('/churches', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateChurchApi = (id: string, data: Partial<{
  denomination_name: string;
  description?: string;
  location?: string;
  state?: string;
  country?: string;
  address?: string;
}>) =>
  request<{ data: ChurchDTO; status: number; message: string }>(`/churches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteChurchApi = (id: string) =>
  request<{ status: number; message: string }>(`/churches/${id}`, { method: 'DELETE' });

// ─── Branches ─────────────────────────────────────────────────────────────
export const fetchBranches = (denominationId: string) =>
  request<{ data: BranchDTO[]; status: number; message: string }>(`/churches/${denominationId}/branches`);

export const createBranchApi = (denominationId: string, data: {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pastor_name?: string;
  description?: string;
  is_headquarters?: boolean;
}) =>
  request<{ data: BranchDTO; status: number; message: string }>(`/churches/${denominationId}/branches`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateBranchApi = (denominationId: string, branchId: string, data: Partial<{
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pastor_name: string;
  description: string;
  is_headquarters: boolean;
}>) =>
  request<{ data: BranchDTO; status: number; message: string }>(`/churches/${denominationId}/branches/${branchId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteBranchApi = (denominationId: string, branchId: string) =>
  request<{ status: number; message: string }>(`/churches/${denominationId}/branches/${branchId}`, {
    method: 'DELETE',
  });
