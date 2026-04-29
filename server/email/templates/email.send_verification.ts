import emailService from "../email.service";
import { churchFlowEmail, styles } from "../email.layout";

export async function sendVerificationEmail(to: string, verificationCode: string) {
  const subject = "Verify Your Email â€” Church Flow";

  const html = churchFlowEmail(`
    <h2 style="${styles.heading}">Verify Your Email Address</h2>
    <p style="${styles.paragraph}">Hello,</p>
    <p style="${styles.paragraph}">
      Thank you for signing up for Church Flow! Please use the verification code below to confirm your email address:
    </p>
    <div style="${styles.codeBox}">${verificationCode}</div>
    <p style="${styles.paragraph}">
      This code will expire in <strong>10 minutes</strong>. If you didn't create an account with Church Flow, you can safely ignore this email.
    </p>
    <div style="${styles.infoBox}">
      <strong>Tip:</strong> For your security, never share this code with anyone. Church Flow will never ask for your verification code.
    </div>
  `, "Your Church Flow verification code");

  const text = `Church Flow â€” Email Verification\n\nYour verification code is: ${verificationCode}\n\nThis code will expire in 10 minutes.\n\nIf you didn't create an account, you can safely ignore this email.`;

  return emailService.sendEmail(to, subject, text, html);
}
