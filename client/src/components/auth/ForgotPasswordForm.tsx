import React, { useState } from "react";
import { useForgotPassword, useVerifyResetOtp, useSetNewPassword } from "../../hooks/useAuthQuery";

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
}

type Step = "email" | "otp" | "password" | "done";

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSwitchToLogin,
}) => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const forgotMutation = useForgotPassword();
  const verifyMutation = useVerifyResetOtp();
  const setPasswordMutation = useSetNewPassword();

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    forgotMutation.mutate(email, {
      onSuccess: (data: any) => {
        if (data?.otpSent === false) {
          setLocalError("Email could not be delivered. Contact your administrator.");
        } else {
          setStep("otp");
        }
      },
    });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    verifyMutation.mutate({ email, otp }, {
      onSuccess: (data) => {
        if (!data.isValid) {
          setLocalError("Invalid or expired code. Please try again.");
        } else {
          setStep("password");
        }
      },
    });
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    if (newPassword.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    setPasswordMutation.mutate({ email, newPassword }, {
      onSuccess: () => setStep("done"),
    });
  };

  const stepTitles: Record<Step, string> = {
    email: "Forgot Password",
    otp: "Enter Reset Code",
    password: "Set New Password",
    done: "Password Updated",
  };

  const stepDescriptions: Record<Step, string> = {
    email: "Enter your email and we'll send you a reset code",
    otp: `Enter the 6-digit code sent to ${email}`,
    password: "Choose a strong new password",
    done: "Your password has been updated successfully",
  };

  const activeError =
    localError ||
    forgotMutation.error?.message ||
    verifyMutation.error?.message ||
    setPasswordMutation.error?.message;

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h2 style={styles.cardTitle}>{stepTitles[step]}</h2>
        <p style={styles.cardDescription}>{stepDescriptions[step]}</p>
      </div>
      <div style={styles.cardContent}>

        {/* Step indicator */}
        <div style={styles.stepRow}>
          {(["email", "otp", "password"] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              <div style={{
                ...styles.stepDot,
                backgroundColor: step === "done" || ["email","otp","password"].indexOf(step) >= i
                  ? "#2563eb" : "#e2e8f0",
              }} />
              {i < 2 && <div style={styles.stepLine} />}
            </React.Fragment>
          ))}
        </div>

        {activeError && (
          <div style={styles.alert}>
            <p style={styles.alertText}>{activeError}</p>
          </div>
        )}

        {/* Step 1 – Email */}
        {step === "email" && (
          <form onSubmit={handleSendCode} style={styles.form}>
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
            <button
              type="submit"
              style={{ ...styles.button, ...(forgotMutation.isPending ? styles.buttonDisabled : {}) }}
              disabled={forgotMutation.isPending}
            >
              {forgotMutation.isPending ? "Sending..." : "Send Reset Code"}
            </button>
            <div style={styles.footer}>
              <button type="button" style={styles.link} onClick={onSwitchToLogin}>
                Back to Login
              </button>
            </div>
          </form>
        )}

        {/* Step 2 – OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="fp-otp" style={styles.label}>Reset Code</label>
              <input
                id="fp-otp"
                type="text"
                placeholder="Enter the code from your email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                autoFocus
                style={{ ...styles.input, letterSpacing: "6px", textAlign: "center", fontSize: "20px" }}
              />
            </div>
            <button
              type="submit"
              style={{ ...styles.button, ...(verifyMutation.isPending ? styles.buttonDisabled : {}) }}
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? "Verifying..." : "Verify Code"}
            </button>
            <div style={styles.footer}>
              <button type="button" style={styles.link} onClick={() => { setStep("email"); setOtp(""); setLocalError(""); forgotMutation.reset(); }}>
                Resend code
              </button>
            </div>
          </form>
        )}

        {/* Step 3 – New password */}
        {step === "password" && (
          <form onSubmit={handleSetPassword} style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="fp-pass" style={styles.label}>New Password</label>
              <input
                id="fp-pass"
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="fp-confirm" style={styles.label}>Confirm Password</label>
              <input
                id="fp-confirm"
                type="password"
                placeholder="Repeat your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            <button
              type="submit"
              style={{ ...styles.button, ...(setPasswordMutation.isPending ? styles.buttonDisabled : {}) }}
              disabled={setPasswordMutation.isPending}
            >
              {setPasswordMutation.isPending ? "Saving..." : "Save New Password"}
            </button>
          </form>
        )}

        {/* Step 4 – Done */}
        {step === "done" && (
          <div style={{ textAlign: "center" }}>
            <div style={styles.successIcon}>✓</div>
            <p style={{ color: "#166534", marginBottom: "16px" }}>
              Your password has been updated. You can now log in.
            </p>
            <button type="button" style={styles.button} onClick={onSwitchToLogin}>
              Go to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: "100%",
    maxWidth: "448px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)",
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
  stepRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0",
    marginBottom: "4px",
  },
  stepDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    transition: "background-color 0.3s",
  },
  stepLine: {
    flex: 1,
    height: "2px",
    backgroundColor: "#e2e8f0",
    maxWidth: "60px",
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
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
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
  successIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "#dcfce7",
    color: "#166534",
    fontSize: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
};

