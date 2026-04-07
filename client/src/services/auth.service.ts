import {
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:7777/api";

// Tokens are stored in HttpOnly cookies set by the server.
// We only track lightweight flags in memory.
let sessionActive = false;
// Set to true after an explicit logout or session expiry — prevents the
// useProfile query from re-firing and causing an infinite refresh loop.
let sessionInvalidated = false;

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
    profile_img?: string;
  };
  role: any;
  permissions: any[];
  isNewUser?: boolean;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
    profile_img?: string;
  };
  church: {
    id: string;
    denomination_name: string;
    description?: string;
    location?: string;
    state?: string;
    country?: string;
    address?: string;
  };
  role: any;
  permissions: any[];
}

/** Called after a successful login to mark the session as active. */
export function setTokens(_accessToken: string, _refreshToken: string): void {
  sessionActive = true;
}

/** Returns true if the session is active (used for react-query enabled flag). */
export function getAccessToken(): string | null {
  // Cookies are HttpOnly — not readable from JS.
  // We use sessionActive to track state in memory.
  // On a fresh page load, attempt a profile fetch; a 401 means no session.
  return sessionActive ? 'cookie' : null;
}

export function clearTokens(): void {
  sessionActive = false;
  sessionInvalidated = true;
  // Remove legacy localStorage tokens if present from old version
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

function onTokenRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<void> {
  // The refresh_token cookie is sent automatically with credentials: 'include'
  const res = await fetch(`${API_BASE}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    clearTokens();
    throw new Error("Session expired");
  }
  sessionActive = true;
  sessionInvalidated = false;
}

export async function authFetch(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  let res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    const refreshed = await handleTokenRefresh();
    if (refreshed) {
      res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });
    }
  }

  return res;
}

async function handleTokenRefresh(): Promise<boolean> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshSubscribers.push(() => resolve(true));
    });
  }

  isRefreshing = true;
  try {
    await refreshAccessToken();
    onTokenRefreshed();
    return true;
  } catch {
    clearTokens();
    window.dispatchEvent(new CustomEvent("auth:session-expired"));
    return false;
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
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Login failed");
  sessionActive = true;
  sessionInvalidated = false;
  return body.data;
}

export async function apiGoogleSignIn(
  idToken: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Google sign-in failed");
  sessionActive = true;
  sessionInvalidated = false;
  return body.data;
}

export async function apiRegister(
  email: string,
  full_name: string,
  password: string,
  church: {
    denomination_name: string;
    description?: string;
    location?: string;
    state?: string;
    country?: string;
    address?: string;
  }
): Promise<RegisterResponse> {
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  const idToken = await credential.user.getIdToken();

  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, full_name, ...church }),
  });
  const body = await res.json();
  if (!res.ok) {
    await credential.user.delete();
    throw new Error(body.message || "Registration failed");
  }
  return body.data;
}

export async function apiForgotPassword(email: string): Promise<{ otpSent: boolean }> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Failed to send reset code");
  return body.data;
}

export async function apiVerifyResetOtp(email: string, otp: string): Promise<{ isValid: boolean }> {
  const res = await fetch(`${API_BASE}/auth/verify-reset-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Invalid code");
  return body.data;
}

export async function apiSetNewPassword(email: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/set-new-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, newPassword }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Failed to set password");
}

export async function apiLogout(): Promise<void> {
  try {
    await authFetch("/auth/logout", { method: "POST" });
  } finally {
    clearTokens();
  }
}

export async function apiFetchProfile(): Promise<any> {
  // If the session was explicitly invalidated (logout / expired), return null
  // immediately without making a network call. This prevents the infinite loop:
  // queryClient.clear() → refetch → 401 → refresh → fail → clear() → repeat.
  if (sessionInvalidated) return null;

  // Use a plain fetch (not authFetch) so a 401 here is treated as "no session"
  // rather than triggering an access-token refresh cycle.
  const res = await fetch(`${API_BASE}/user/profile`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (res.status === 401) return null;
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Failed to fetch profile");
  sessionActive = true;
  return body.data;
}



