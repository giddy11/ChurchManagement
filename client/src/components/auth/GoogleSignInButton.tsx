import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useGoogleSignIn } from "../../hooks/useAuthQuery";
import { useAuth } from "./AuthProvider";
import { useDomain } from "@/components/domain/DomainProvider";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/api\/?$/, "") ||
  "http://localhost:4000";

export const GoogleSignInButton: React.FC = () => {
  const { loginWithResponse } = useAuth();
  const { isCustomDomain } = useDomain();
  const googleMutation = useGoogleSignIn();

  // Main-domain flow — origin is registered with Google, so the SDK works directly.
  const googleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      googleMutation.mutate(tokenResponse.access_token, {
        onSuccess: (data) => loginWithResponse(data),
      });
    },
    onError: () => {
      console.error("Google login failed");
    },
  });

  const handleClick = () => {
    if (!isCustomDomain) {
      googleLogin();
      return;
    }

    // Custom-domain flow — full-page redirect through the API. The API has a
    // single Google-registered redirect URI and round-trips the original page
    // URL back to us via a signed `state` parameter. The user only ever sees
    // their own custom domain and Google's consent screen — nothing else.
    const returnTo = `${window.location.origin}/auth/google/callback`;
    const startUrl = `${API_BASE_URL}/api/auth/google/start?return_to=${encodeURIComponent(returnTo)}`;
    window.location.href = startUrl;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={googleMutation.isPending}
      style={styles.googleButton}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: 8 }}>
        <path
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
          fill="#4285F4"
        />
        <path
          d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
          fill="#34A853"
        />
        <path
          d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
          fill="#FBBC05"
        />
        <path
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
          fill="#EA4335"
        />
      </svg>
      {googleMutation.isPending ? "Signing in..." : "Continue with Google"}
    </button>
  );
};

const styles = {
  googleButton: {
    width: "100%",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "500" as const,
    color: "#344054",
    backgroundColor: "#ffffff",
    border: "1px solid #d0d5dd",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s",
  },
};
