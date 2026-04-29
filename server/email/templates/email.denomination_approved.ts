import emailService from "../email.service";
import { churchFlowEmail, styles } from "../email.layout";

const ADMIN_NOTIFY_EMAIL = process.env.EMAIL_USER || process.env.ADMIN_EMAIL || "theunitedchurchflow@gmail.com";

/**
 * Notifies the ChurchFlow admin that a new denomination request was submitted.
 */
export async function sendNewDenominationRequestAdminNotify(data: {
  denomination_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  reason?: string;
}) {
  const consoleUrl = process.env.URL
    ? `${process.env.URL}/superadmin`
    : "http://localhost:5173/superadmin";
  const subject = `New Denomination Request: ${data.denomination_name} â€” Church Flow`;

  const locationParts = [data.city, data.state, data.country].filter(Boolean).join(", ");

  const html = churchFlowEmail(
    `
    <h2 style="${styles.heading}">New Denomination Request</h2>
    <p style="${styles.paragraph}">A new denomination registration request has been submitted and is awaiting your review.</p>

    <div style="${styles.credentialBox}">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="padding:12px 18px;border-bottom:1px solid #E2E8F0;">
            <span style="${styles.credentialLabel}">Denomination Name</span><br/>
            <span style="${styles.credentialValue}">${data.denomination_name}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 18px;border-bottom:1px solid #E2E8F0;">
            <span style="${styles.credentialLabel}">Requester</span><br/>
            <span style="${styles.credentialValue}">${data.first_name} ${data.last_name}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 18px;border-bottom:1px solid #E2E8F0;">
            <span style="${styles.credentialLabel}">Email</span><br/>
            <span style="${styles.credentialValue}">${data.email}</span>
          </td>
        </tr>
        ${data.phone ? `
        <tr>
          <td style="padding:12px 18px;border-bottom:1px solid #E2E8F0;">
            <span style="${styles.credentialLabel}">Phone</span><br/>
            <span style="${styles.credentialValue}">${data.phone}</span>
          </td>
        </tr>` : ""}
        ${locationParts ? `
        <tr>
          <td style="padding:12px 18px;border-bottom:1px solid #E2E8F0;">
            <span style="${styles.credentialLabel}">Location</span><br/>
            <span style="${styles.credentialValue}">${locationParts}</span>
          </td>
        </tr>` : ""}
        ${data.reason ? `
        <tr>
          <td style="padding:12px 18px;">
            <span style="${styles.credentialLabel}">Additional Information</span><br/>
            <span style="${styles.credentialValue}">${data.reason}</span>
          </td>
        </tr>` : ""}
      </table>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 0;">
          <a href="${consoleUrl}" style="${styles.button}">Review in Developer Console â†’</a>
        </td>
      </tr>
    </table>
  `,
    `New denomination request: ${data.denomination_name}`
  );

  const text =
    `New Denomination Request\n\n` +
    `Denomination: ${data.denomination_name}\n` +
    `Requester: ${data.first_name} ${data.last_name} (${data.email})\n` +
    (locationParts ? `Location: ${locationParts}\n` : "") +
    `\nReview it in the Developer Console: ${consoleUrl}`;

  return emailService.sendEmail(ADMIN_NOTIFY_EMAIL, subject, text, html);
}

/**
 * Sends login credentials to a new denomination admin whose request was approved.
 */
export async function sendDenominationApprovedEmail(
  to: string,
  firstName: string,
  denominationName: string,
  tempPassword: string
) {
  const loginUrl = process.env.URL || "http://localhost:5173";
  const subject = `Your denomination "${denominationName}" has been approved â€” Church Flow`;

  const html = churchFlowEmail(
    `
    <h2 style="${styles.heading}">Your Denomination Has Been Approved!</h2>
    <p style="${styles.paragraph}">Hi ${firstName},</p>
    <p style="${styles.paragraph}">
      Great news! Your request to register <strong>${denominationName}</strong> on Church Flow has been approved.
      An account has been created for you and you can now log in using the credentials below.
    </p>

    <div style="${styles.credentialBox}">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="padding:14px 18px;border-bottom:1px solid #E2E8F0;">
            <span style="${styles.credentialLabel}">Email</span><br/>
            <span style="${styles.credentialValue}">${to}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 18px;">
            <span style="${styles.credentialLabel}">Temporary Password</span><br/>
            <span style="${styles.credentialValue}">${tempPassword}</span>
          </td>
        </tr>
      </table>
    </div>

    <div style="${styles.warningBox}">
      <strong>âš ï¸ Important:</strong> Please change your password immediately after logging in.
      Go to <strong>Settings â†’ Change Password</strong> to set a new secure password.
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 0;">
          <a href="${loginUrl}/login" style="${styles.button}">Log In to Church Flow â†’</a>
        </td>
      </tr>
    </table>

    <p style="${styles.paragraph}">
      Once logged in, you can start managing your denomination â€” add branches, invite members, and much more.
    </p>

    <p style="${styles.muted}">
      If you did not request this, please ignore this email or contact support.
    </p>
  `,
    `Your denomination "${denominationName}" has been approved on Church Flow`
  );

  const text =
    `Your denomination "${denominationName}" has been approved!\n\n` +
    `Hi ${firstName},\n\n` +
    `Your login credentials:\n` +
    `Email: ${to}\n` +
    `Temporary Password: ${tempPassword}\n\n` +
    `IMPORTANT: Please change your password immediately after logging in.\n\n` +
    `Log in here: ${loginUrl}/login`;

  return emailService.sendEmail(to, subject, text, html);
}

/**
 * Notifies the requester that their denomination request was rejected.
 */
export async function sendDenominationRejectedEmail(
  to: string,
  firstName: string,
  denominationName: string,
  rejectionReason: string
) {
  const subject = `Update on your denomination request â€” Church Flow`;

  const html = churchFlowEmail(
    `
    <h2 style="${styles.heading}">Denomination Request Update</h2>
    <p style="${styles.paragraph}">Hi ${firstName},</p>
    <p style="${styles.paragraph}">
      Thank you for your interest in registering <strong>${denominationName}</strong> on Church Flow.
      After reviewing your request, we are unable to approve it at this time.
    </p>

    <div style="${styles.warningBox}">
      <strong>Reason for rejection:</strong><br/>
      ${rejectionReason}
    </div>

    <p style="${styles.paragraph}">
      If you believe this decision was made in error, or if you have additional information
      that may support your request, please contact our support team.
    </p>
    <p style="${styles.muted}">
      Need help? <a href="mailto:support@churchflow.app" style="color:#6366F1;text-decoration:none;">support@churchflow.app</a>
    </p>
  `,
    `Your denomination request for "${denominationName}" has been reviewed`
  );

  const text =
    `Hi ${firstName},\n\n` +
    `Your request to register "${denominationName}" on Church Flow has been reviewed.\n\n` +
    `Unfortunately, we are unable to approve it at this time.\n\n` +
    `Reason: ${rejectionReason}\n\n` +
    `If you have questions, contact support@churchflow.app.`;

  return emailService.sendEmail(to, subject, text, html);
}
