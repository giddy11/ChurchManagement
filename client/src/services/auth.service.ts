const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:7777/api";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
    profile_img?: string;
  };
  accessToken: string;
  refreshToken: string;
  role: any;
  groups: any[];
  permissions: any[];
  effectivePermissions: string[];
  isNewUser?: boolean;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${API_BASE}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    throw new Error("Refresh token expired");
  }

  const body = await res.json();
  const data = body.data as AuthResponse;
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

export async function authFetch(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const accessToken = getAccessToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options?.headers,
  };

  let res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (res.status === 401 && getRefreshToken()) {
    const newToken = await handleTokenRefresh();
    if (newToken) {
      const retryHeaders: HeadersInit = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };
      res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: retryHeaders,
      });
    }
  }

  return res;
}

async function handleTokenRefresh(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      addRefreshSubscriber(resolve);
    });
  }

  isRefreshing = true;
  try {
    const newToken = await refreshAccessToken();
    onTokenRefreshed(newToken);
    return newToken;
  } catch {
    clearTokens();
    window.dispatchEvent(new CustomEvent("auth:session-expired"));
    return null;
  } finally {
    isRefreshing = false;
  }
}

export async function apiLogin(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Login failed");
  return body.data;
}

export async function apiGoogleSignIn(
  idToken: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Google sign-in failed");
  return body.data;
}

export async function apiRegister(
  email: string,
  full_name: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, full_name, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Registration failed");
  return body.data;
}

export async function apiForgotPassword(email: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Failed to send OTP");
  return body.data?.otpSent ?? true;
}

export async function apiVerifyOtp(
  email: string,
  otp: string
): Promise<boolean> {
  const res = await fetch(`${API_BASE}/auth/verify-reset-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "OTP verification failed");
  return body.data?.isValid ?? false;
}

export async function apiSetNewPassword(
  email: string,
  newPassword: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/set-new-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, newPassword }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Failed to reset password");
}

export async function apiLogout(): Promise<void> {
  try {
    await authFetch("/auth/logout", { method: "POST" });
  } finally {
    clearTokens();
  }
}

export async function apiFetchProfile(): Promise<any> {
  const res = await authFetch("/user/profile");
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Failed to fetch profile");
  return body.data;
}
