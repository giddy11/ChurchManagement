/**
 * GoogleAuthCallback
 *
 * Landing route for the server-side Google OAuth code flow.
 *
 * Flow:
 *   1. User on a custom domain clicks "Continue with Google".
 *   2. Browser is redirected to /api/auth/google/start?return_to=<this-url>.
 *   3. Backend redirects to Google's consent screen.
 *   4. Google redirects to /api/auth/google/callback.
 *   5. Backend exchanges the code, signs the user in, redirects the browser
 *      back to the original frontend URL with tokens in the URL fragment:
 *        https://<custom-domain>/auth/google/callback#access_token=…&refresh_token=…
 *
 * This page reads the fragment, stores the tokens, then routes the user to
 * their dashboard. Tokens never leave the browser via the network because
 * fragments are not sent in HTTP requests.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setTokens } from '@/services/auth.service';
import { useQueryClient } from '@tanstack/react-query';

const GoogleAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fragment = window.location.hash.replace(/^#/, '');
    const params = new URLSearchParams(fragment);

    const errMsg = params.get('google_error');
    if (errMsg) {
      setError(decodeURIComponent(errMsg));
      return;
    }

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      setError('Sign-in response was missing tokens.');
      return;
    }

    setTokens(accessToken, refreshToken);
    // Wipe the fragment so the tokens aren't kept in browser history.
    window.history.replaceState(null, '', window.location.pathname);

    // Force the auth profile to refetch with the new tokens.
    queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });

    navigate('/dashboard', { replace: true });
  }, [navigate, queryClient]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {error ? (
        <div>
          <p style={{ color: '#c00', fontSize: '15px' }}>{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            style={{
              marginTop: 16,
              padding: '10px 20px',
              fontSize: 14,
              borderRadius: 6,
              border: '1px solid #d0d5dd',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            Back to sign-in
          </button>
        </div>
      ) : (
        <p style={{ color: '#444', fontSize: 15 }}>Signing you in…</p>
      )}
    </div>
  );
};

export default GoogleAuthCallback;
