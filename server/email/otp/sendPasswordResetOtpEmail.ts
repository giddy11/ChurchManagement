import emailService from "../email.service";
import { churchFlowEmail, styles } from "../email.layout";

export async function sendPasswordResetOtpEmail(to: string, otp: string) {
  const subject = "Password Reset Code â€” Church Flow";

  const html = churchFlowEmail(`
    <h2 style="${styles.heading}">Password Reset Verification</h2>
    <p style="${styles.paragraph}">Hello,</p>
    <p style="${styles.paragraph}">
      We received a request to reset your Church Flow password. Use the verification code below to proceed:
    </p>
    <div style="${styles.codeBox}">${otp}</div>
    <p style="${styles.paragraph}">
      This code will expire in <strong>10 minutes</strong>. If you didn't request a password reset, you can safely ignore this email â€” your password will remain unchanged.
    </p>
    <div style="${styles.warningBox}">
      <strong>Important:</strong> Do not share this code with anyone. Church Flow support will never ask for your verification code.
    </div>
  `, "Your Church Flow password reset code");

  const text = `Church Flow â€” Password Reset\n\nYour password reset code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nDo not share this code with anyone.\n\nIf you didn't request a password reset, you can safely ignore this email.`;

  return emailService.sendEmail(to, subject, text, html);
}
