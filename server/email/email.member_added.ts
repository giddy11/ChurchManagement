import emailService from "./email.service";

export interface MemberAddedContext {
  fullName: string;
  email: string;
  password: string;
  branchName?: string;
  churchName?: string;
}

export async function sendMemberAddedEmail(to: string, ctx: MemberAddedContext) {
  const { fullName, email, password, branchName, churchName } = ctx;
  const displayOrg = branchName ?? churchName ?? "Your Church";
  const loginUrl = process.env.CLIENT_URL || "http://localhost:5173";

  const subject = `Welcome to ${displayOrg} — Your Account Details`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to ${displayOrg}</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f4f6fb;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d9488,#0891b2);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                Welcome to ${displayOrg}
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                Your member account has been created
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;font-size:15px;color:#374151;">
                Hi <strong>${fullName}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
                You have been added as a member of <strong>${displayOrg}</strong>.
                Below are your login credentials. Please keep them safe.
              </p>

              <!-- Credentials box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;">
                          <span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">Email</span><br/>
                          <span style="font-size:15px;color:#111827;font-weight:500;">${email}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0 6px;border-top:1px solid #e2e8f0;margin-top:8px;">
                          <span style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">Temporary Password</span><br/>
                          <span style="display:inline-block;margin-top:6px;font-size:18px;font-weight:700;letter-spacing:2px;color:#0d9488;background:#f0fdfa;border:1px dashed #99f6e4;border-radius:6px;padding:6px 16px;">${password}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 20px;">
                    <p style="margin:0;font-size:14px;color:#92400e;line-height:1.6;">
                      ⚠️ <strong>Important:</strong> This is a temporary password. Please log in and change it immediately to keep your account secure.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display:inline-block;padding:13px 36px;background:linear-gradient(135deg,#0d9488,#0891b2);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:0.02em;">
                      Log In Now →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                This email was sent because an admin added you to <strong>${displayOrg}</strong>.<br/>
                If you did not expect this, please contact your church administrator.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Welcome to ${displayOrg}!\n\nYour member account has been created.\n\nEmail: ${email}\nTemporary Password: ${password}\n\nIMPORTANT: Please log in and change your password immediately.\n\nLogin: ${loginUrl}`;

  await emailService.sendEmail(to, subject, text, html);
}
