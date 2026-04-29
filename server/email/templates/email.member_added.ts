import emailService from "../email.service";
import { churchFlowEmail, styles } from "../email.layout";

export interface MemberAddedContext {
  fullName: string;
  email: string;
  password: string;
  branchName?: string;
  churchName?: string;
}

export async function sendMemberAddedEmail(to: string, ctx: MemberAddedContext) {
  const { fullName, email, password, branchName, churchName } = ctx;
  const displayOrg = branchName ?? churchName ?? "your church";
  const loginUrl = process.env.URL || "http://localhost:5173";

  const subject = `Welcome to ${displayOrg} â€” Church Flow`;

  const html = churchFlowEmail(`
    <h2 style="${styles.heading}">Welcome to ${displayOrg}!</h2>
    <p style="${styles.paragraph}">Hi <strong>${fullName}</strong>,</p>
    <p style="${styles.paragraph}">
      You have been added as a member of <strong>${displayOrg}</strong> on Church Flow. Below are your login credentials â€” please keep them safe.
    </p>

    <!-- Credentials -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="${styles.credentialBox}">
      <tr>
        <td style="padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="padding:6px 0;">
                <span style="${styles.credentialLabel}">Email</span><br/>
                <span style="${styles.credentialValue}">${email}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0 6px;border-top:1px solid #E2E8F0;">
                <span style="${styles.credentialLabel}">Temporary Password</span><br/>
                <span style="display:inline-block;margin-top:6px;font-size:18px;font-weight:700;letter-spacing:2px;color:#6366F1;background:#EEF2FF;border:1px dashed #C7D2FE;border-radius:6px;padding:6px 16px;">${password}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="${styles.warningBox}">
      âš ï¸ <strong>Important:</strong> This is a temporary password. Please log in and change it immediately to keep your account secure.
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 0;">
          <a href="${loginUrl}" style="${styles.button}">Log In Now â†’</a>
        </td>
      </tr>
    </table>
  `, "Your Church Flow account has been created");

  const text = `Welcome to ${displayOrg} â€” Church Flow\n\nHi ${fullName},\n\nYou have been added as a member of ${displayOrg}.\n\nEmail: ${email}\nTemporary Password: ${password}\n\nIMPORTANT: Please log in and change your password immediately.\n\nLogin: ${loginUrl}`;

  await emailService.sendEmail(to, subject, text, html);
}
