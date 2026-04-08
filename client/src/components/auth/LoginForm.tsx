import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useLogin } from '../../hooks/useAuthQuery';
import { GoogleSignInButton } from './GoogleSignInButton';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onSwitchToForgotPassword,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { isAuthenticated, loginWithResponse } = useAuth();
  const loginMutation = useLogin();
  const navigate = useNavigate();

  // Navigate only after React has committed the auth state update
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          loginWithResponse(data);
        },
      }
    );
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h2 style={styles.cardTitle}>Welcome Back</h2>
        <p style={styles.cardDescription}>Sign in to your church account</p>
      </div>
      <div style={styles.cardContent}>
        <form onSubmit={handleSubmit} style={styles.form}>
          {loginMutation.error && (
            <div style={styles.alert}>
              <p style={styles.alertText}>{loginMutation.error.message}</p>
            </div>
          )}

          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {onSwitchToForgotPassword && (
            <div style={{ textAlign: 'right' as const }}>
              <button
                type="button"
                style={styles.link}
                onClick={onSwitchToForgotPassword}
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loginMutation.isPending ? styles.buttonDisabled : {}),
            }}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={styles.divider}>
            <span style={styles.dividerText}>or</span>
          </div>

          <GoogleSignInButton />

          <div style={styles.footer}>
            <span style={styles.footerText}>Don't have an account? </span>
            <button type="button" style={styles.link} onClick={onSwitchToRegister}>
              Register here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  card: {
    width: '100%',
    maxWidth: '448px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '24px 24px 0 24px',
    marginBottom: '4px',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '0 0 8px 0',
    color: '#0f172a',
  },
  cardDescription: {
    textAlign: 'center' as const,
    color: '#64748b',
    fontSize: '14px',
    margin: 0,
  },
  cardContent: {
    padding: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  alert: {
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
  },
  alertText: {
    color: '#991b1b',
    fontSize: '14px',
    margin: 0,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#0f172a',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },
  button: {
    width: '100%',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  footer: {
    textAlign: 'center' as const,
    fontSize: '14px',
  },
  footerText: {
    color: '#64748b',
  },
  link: {
    color: '#2563eb',
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: '14px',
    fontWeight: 'normal',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  dividerText: {
    flex: '1 1 0',
    textAlign: 'center' as const,
    fontSize: '13px',
    color: '#94a3b8',
    position: 'relative' as const,
  },
};