import emailService from "./email.service";
import { churchFlowEmail, styles } from "./email.layout";

export async function sendWelcomeEmail(to: string, firstName?: string) {
  const name = firstName || "there";
  const loginUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const subject = "Welcome to Church Flow!";

  const html = churchFlowEmail(`
    <h2 style="${styles.heading}">Welcome to Church Flow!</h2>
    <p style="${styles.paragraph}">Hi ${name},</p>
    <p style="${styles.paragraph}">
      Your email has been verified and your Church Flow account is now active. We're excited to have you on board!
    </p>
    <p style="${styles.paragraph}">
      Church Flow helps churches manage their members, branches, and communications — all in one place.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 0;">
          <a href="${loginUrl}" style="${styles.button}">Go to Dashboard →</a>
        </td>
      </tr>
    </table>
    <div style="${styles.infoBox}">
      <strong>Getting started:</strong> Create or join a church, invite your team, and start managing your congregation today.
    </div>
  `, "Welcome to Church Flow — your account is ready");

  const text = `Welcome to Church Flow!\n\nHi ${name},\n\nYour email has been verified and your account is now active.\n\nGet started: ${loginUrl}`;

  return emailService.sendEmail(to, subject, text, html);
}
