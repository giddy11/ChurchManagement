import emailService from "../email.service";
import { churchFlowEmail, styles } from "../email.layout";

export async function send2FACodeEmail(to: string, code: string) {
  const subject = "Your Login Code â€” Church Flow";

  const html = churchFlowEmail(`
    <h2 style="${styles.heading}">Two-Factor Authentication</h2>
    <p style="${styles.paragraph}">Hello,</p>
    <p style="${styles.paragraph}">
      Someone is trying to sign in to your Church Flow account. Use the code below to complete the login:
    </p>
    <div style="${styles.codeBox}">${code}</div>
    <p style="${styles.paragraph}">
      This code will expire in <strong>10 minutes</strong>.
    </p>
    <div style="${styles.warningBox}">
      <strong>Wasn't you?</strong> If you didn't attempt to sign in, someone may have your password. We recommend changing your password immediately.
    </div>
  `, "Your Church Flow 2FA code");

  const text = `Church Flow â€” Two-Factor Authentication\n\nYour 2FA verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't attempt to sign in, please change your password immediately.`;

  return emailService.sendEmail(to, subject, text, html);
}
