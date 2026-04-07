import React, { useState } from "react";
import {
  useForgotPassword,
  useVerifyOtp,
  useSetNewPassword,
} from "../../hooks/useAuthQuery";

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
}

type Step = "email" | "otp" | "new-password" | "success";

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSwitchToLogin,
}) => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const forgotMutation = useForgotPassword();
  const verifyMutation = useVerifyOtp();
  const resetMutation = useSetNewPassword();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    forgotMutation.mutate(email, { onSuccess: () => setStep("otp") });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    verifyMutation.mutate(
      { email, otp },
      { onSuccess: (isValid) => isValid && setStep("new-password") }
    );
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword || newPassword.length < 6) return;
    resetMutation.mutate(
      { email, newPassword },
      { onSuccess: () => setStep("success") }
    );
  };

  const error =
    forgotMutation.error?.message ||
    verifyMutation.error?.message ||
    resetMutation.error?.message ||
    (newPassword !== confirmPassword && confirmPassword
      ? "Passwords do not match"
      : "");

  const isPending =
    forgotMutation.isPending ||
    verifyMutation.isPending ||
    resetMutation.isPending;

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h2 style={styles.cardTitle}>
          {step === "success" ? "Password Reset" : "Forgot Password"}
        </h2>
        <p style={styles.cardDescription}>
          {step === "email" && "Enter your email to receive a reset code"}
          {step === "otp" && "Enter the OTP code sent to your email"}
          {step === "new-password" && "Set your new password"}
          {step === "success" && "Your password has been reset successfully"}
        </p>
      </div>
      <div style={styles.cardContent}>
        {error && (
          <div style={styles.alert}>
            <p style={styles.alertText}>{error}</p>
          </div>
        )}

        {step === "email" && (
          <EmailStep
            email={email}
            setEmail={setEmail}
            onSubmit={handleSendOtp}
            isPending={isPending}
          />
        )}

        {step === "otp" && (
          <OtpStep
            otp={otp}
            setOtp={setOtp}
            onSubmit={handleVerifyOtp}
            isPending={isPending}
          />
        )}

        {step === "new-password" && (
          <NewPasswordStep
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            onSubmit={handleResetPassword}
            isPending={isPending}
          />
        )}

        {step === "success" && (
          <button type="button" style={styles.button} onClick={onSwitchToLogin}>
            Back to Login
          </button>
        )}

        {step !== "success" && (
          <div style={styles.footer}>
            <button
              type="button"
              style={styles.link}
              onClick={onSwitchToLogin}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function EmailStep({
  email,
  setEmail,
  onSubmit,
  isPending,
}: {
  email: string;
  setEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}) {
  return (
    <form onSubmit={onSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label htmlFor="fp-email" style={styles.label}>Email</label>
        <input
          id="fp-email"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
      </div>
      <button type="submit" style={styles.button} disabled={isPending}>
        {isPending ? "Sending..." : "Send Reset Code"}
      </button>
    </form>
  );
}

function OtpStep({
  otp,
  setOtp,
  onSubmit,
  isPending,
}: {
  otp: string;
  setOtp: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}) {
  return (
    <form onSubmit={onSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label htmlFor="fp-otp" style={styles.label}>OTP Code</label>
        <input
          id="fp-otp"
          type="text"
          placeholder="Enter 6-digit code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          maxLength={6}
          style={styles.input}
        />
      </div>
      <button type="submit" style={styles.button} disabled={isPending}>
        {isPending ? "Verifying..." : "Verify Code"}
      </button>
    </form>
  );
}

function NewPasswordStep({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onSubmit,
  isPending,
}: {
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}) {
  return (
    <form onSubmit={onSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label htmlFor="fp-newpw" style={styles.label}>New Password</label>
        <input
          id="fp-newpw"
          type="password"
          placeholder="At least 6 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          style={styles.input}
        />
      </div>
      <div style={styles.formGroup}>
        <label htmlFor="fp-confirmpw" style={styles.label}>Confirm Password</label>
        <input
          id="fp-confirmpw"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={styles.input}
        />
      </div>
      <button type="submit" style={styles.button} disabled={isPending}>
        {isPending ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: "100%",
    maxWidth: "448px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow:
      "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  cardHeader: {
    padding: "24px 24px 0 24px",
    marginBottom: "4px",
  },
  cardTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center",
    margin: "0 0 8px 0",
    color: "#0f172a",
  },
  cardDescription: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
    margin: 0,
  },
  cardContent: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  alert: {
    padding: "12px 16px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "6px",
  },
  alertText: {
    color: "#991b1b",
    fontSize: "14px",
    margin: 0,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#0f172a",
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#ffffff",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  footer: {
    textAlign: "center",
    fontSize: "14px",
  },
  link: {
    color: "#2563eb",
    background: "none",
    border: "none",
    padding: 0,
    fontSize: "14px",
    cursor: "pointer",
    textDecoration: "underline",
  },
};
