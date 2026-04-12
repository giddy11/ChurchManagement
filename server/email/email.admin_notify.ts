import emailService from "./email.service";
import { churchFlowEmail, styles } from "./email.layout";

/**
 * Notify branch admins when someone joins via invite link.
 */
export async function sendInviteJoinNotification(
  to: string,
  memberName: string,
  memberEmail: string,
  branchName: string
) {
  const subject = `New member joined ${branchName} — Church Flow`;
  const loginUrl = process.env.URL || "http://localhost:5173";

  const html = churchFlowEmail(`
    <h2 style="${styles.heading}">New Member Joined</h2>
    <p style="${styles.paragraph}">Hello Admin,</p>
    <p style="${styles.paragraph}">
      <strong>${memberName}</strong> (${memberEmail}) has joined <strong>${branchName}</strong> using an invite link and has been automatically added as a member.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 0;">
          <a href="${loginUrl}" style="${styles.button}">View Members →</a>
        </td>
      </tr>
    </table>
  `, "A new member joined your branch on Church Flow");

  const text = `Church Flow — New Member\n\n${memberName} (${memberEmail}) has joined "${branchName}" using an invite link.\n\nView members: ${loginUrl}`;

  await emailService.sendEmail(to, subject, text, html);
}

/**
 * Notify branch admins about a new join request.
 */
export async function sendJoinRequestNotification(
  to: string,
  requesterName: string,
  requesterEmail: string,
  branchName: string,
  message?: string
) {
  const subject = `New join request for ${branchName} — Church Flow`;
  const loginUrl = process.env.URL || "http://localhost:5173";

  const html = churchFlowEmail(`
    <h2 style="${styles.heading}">New Join Request</h2>
    <p style="${styles.paragraph}">Hello Admin,</p>
    <p style="${styles.paragraph}">
      <strong>${requesterName}</strong> (${requesterEmail}) has requested to join <strong>${branchName}</strong>.
    </p>
    ${message ? `
    <div style="${styles.infoBox}">
      <strong>Message from requester:</strong> "${message}"
    </div>
    ` : ""}
    <p style="${styles.paragraph}">
      Please log in to review and approve or reject this request.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 0;">
          <a href="${loginUrl}" style="${styles.button}">Review Request →</a>
        </td>
      </tr>
    </table>
  `, "Someone wants to join your branch on Church Flow");

  const text = `Church Flow — Join Request\n\n${requesterName} (${requesterEmail}) has requested to join "${branchName}".${message ? `\n\nMessage: "${message}"` : ""}\n\nPlease log in to review: ${loginUrl}`;

  await emailService.sendEmail(to, subject, text, html);
}

/**
 * Notify a user about the outcome of their join request.
 */
export async function sendJoinDecisionNotification(
  to: string,
  userName: string,
  branchName: string,
  decision: "approved" | "rejected"
) {
  const loginUrl = process.env.URL || "http://localhost:5173";
  const approved = decision === "approved";

  const subject = approved
    ? `You've been approved to join ${branchName} — Church Flow`
    : `Update on your request to join ${branchName} — Church Flow`;

  const html = churchFlowEmail(`
    <h2 style="${styles.heading}">${approved ? "You're In!" : "Request Update"}</h2>
    <p style="${styles.paragraph}">Hi ${userName},</p>
    ${approved ? `
    <p style="${styles.paragraph}">
      Great news! Your request to join <strong>${branchName}</strong> has been approved. You can now log in and access your branch.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 0;">
          <a href="${loginUrl}" style="${styles.button}">Go to Dashboard →</a>
        </td>
      </tr>
    </table>
    ` : `
    <p style="${styles.paragraph}">
      Unfortunately, your request to join <strong>${branchName}</strong> has been reviewed and was not approved at this time.
    </p>
    <p style="${styles.paragraph}">
      If you believe this is a mistake, please reach out to the branch administrator.
    </p>
    `}
  `, approved ? "Your join request was approved" : "Update on your join request");

  const text = approved
    ? `Church Flow\n\nHi ${userName},\n\nYour request to join "${branchName}" has been approved!\n\nLog in: ${loginUrl}`
    : `Church Flow\n\nHi ${userName},\n\nYour request to join "${branchName}" was not approved at this time.\n\nIf you believe this is a mistake, please contact the branch administrator.`;

  await emailService.sendEmail(to, subject, text, html);
}
