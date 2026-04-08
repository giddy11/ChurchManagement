import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:7777/api";

// Tokens are stored in HttpOnly cookies set by the server.
// We only track lightweight flags in memory.
let sessionActive = false;
// Persisted to sessionStorage so it survives the page reload triggered by logout.
// This prevents useProfile from firing on the /login page after logout,
// which would make spurious /user/profile (401) and /auth/refresh-token (400) calls.
let sessionInvalidated = sessionStorage.getItem('session_invalidated') === '1';

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
  sessionStorage.setItem('session_invalidated', '1');
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
  // Authenticate with Firebase first — Firebase owns the password.
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  const idToken = await credential.user.getIdToken();

  // Exchange the Firebase ID token for our server's HttpOnly cookies.
  const res = await fetch(`${API_BASE}/auth/firebase-login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || "Login failed");
  sessionActive = true;
  sessionInvalidated = false;
  sessionStorage.removeItem('session_invalidated');
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
  sessionStorage.removeItem('session_invalidated');
  return body.data;
}

export async function apiRegister(
  email: string,
  full_name: string,
  password: string,
  church?: {
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
    body: JSON.stringify({ idToken, full_name, ...(church ?? {}) }),
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
  // Use plain fetch so a 401 (expired access token) does NOT trigger
  // the refresh-token cycle. The server will still clear the cookies.
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {});
}

export async function apiFetchProfile(): Promise<any> {
  // If the session was explicitly invalidated (logout / expired), return null
  // immediately without making a network call. This prevents the infinite loop
  // after logout: queryClient.clear() → refetch → 401 → refresh → fail → repeat.
  if (sessionInvalidated) return null;

  // Use authFetch so an expired access token is transparently refreshed via
  // the refresh-token cookie before retrying the profile request.
  const res = await authFetch('/user/profile');

  if (res.status === 401) return null;
  const body = await res.json();
  if (!res.ok) throw new Error(body.message || 'Failed to fetch profile');
  sessionActive = true;
  return body.data;
}



