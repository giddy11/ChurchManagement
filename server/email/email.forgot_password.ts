import emailService from "./email.service";
import { churchFlowEmail, styles } from "./email.layout";

export async function sendPasswordLink(to: string, link: string) {
  const subject = "Reset Your Password — Church Flow";

  const html = churchFlowEmail(`
    <h2 style="${styles.heading}">Password Reset Requested</h2>
    <p style="${styles.paragraph}">Hello,</p>
    <p style="${styles.paragraph}">
      We received a request to reset your Church Flow password. Click the button below to create a new password:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 0;">
          <a href="${link}" style="${styles.button}">Reset Password</a>
        </td>
      </tr>
    </table>
    <p style="${styles.paragraph}">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <div style="${styles.infoBox}">
      <span style="word-break:break-all;font-size:13px;">${link}</span>
    </div>
    <p style="${styles.paragraph}">
      This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.
    </p>
    <div style="${styles.warningBox}">
      <strong>Security notice:</strong> Church Flow will never ask you for your password via email. If you didn't request this reset, your account may have been targeted. Consider enabling two-factor authentication.
    </div>
  `, "Reset your Church Flow password");

  const text = `Church Flow — Password Reset\n\nWe received a request to reset your password.\n\nReset link: ${link}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.`;

  return emailService.sendEmail(to, subject, text, html);
}
