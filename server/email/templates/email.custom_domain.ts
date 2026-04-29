import emailService from "../email.service";
import { churchFlowEmail, styles } from "../email.layout";

const APP_URL = () => process.env.URL || "http://localhost:5173";

/** Notify all super admins that a branch admin submitted a custom-domain request. */
export async function sendCustomDomainRequestedToSuperAdmin(
  to: string,
  domain: string,
  branchName: string,
  denominationName: string,
  requesterEmail: string,
) {
  const subject = `New custom domain request: ${domain}`;
  const html = churchFlowEmail(`
    <h2 style="${styles.heading}">New Custom Domain Request</h2>
    <p style="${styles.paragraph}">A branch admin has requested a custom domain.</p>
    <div style="${styles.infoBox}">
      <strong>Domain:</strong> ${domain}<br/>
      <strong>Branch:</strong> ${branchName}<br/>
      <strong>Denomination:</strong> ${denominationName}<br/>
      <strong>Requested by:</strong> ${requesterEmail}
    </div>
    <p style="${styles.paragraph}">Review pending requests in the Developer Console.</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr><td align="center" style="padding:24px 0;">
        <a href="${APP_URL()}/superadmin" style="${styles.button}">Review Request â†’</a>
      </td></tr>
    </table>
  `, "A branch admin requested a custom domain");
  return emailService.sendEmail(to, subject, `New domain request: ${domain}`, html);
}

/** Notify the requesting branch admin of the super-admin's decision. */
export async function sendCustomDomainDecisionEmail(
  to: string,
  domain: string,
  branchName: string,
  decision: "approved" | "rejected",
  rejectionReason?: string,
) {
  const subject =
    decision === "approved"
      ? `âœ… Your custom domain ${domain} is live`
      : `Your custom domain request was rejected`;

  const body =
    decision === "approved"
      ? `
        <h2 style="${styles.heading}">Custom Domain Approved</h2>
        <p style="${styles.paragraph}">Great news â€” your custom domain for <strong>${branchName}</strong> is now active.</p>
        <div style="${styles.infoBox}">
          <strong>Domain:</strong> ${domain}<br/>
          Members visiting this domain will see your branch branding on the sign-in and sign-up pages.
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr><td align="center" style="padding:24px 0;">
            <a href="https://${domain}" style="${styles.button}">Open ${domain} â†’</a>
          </td></tr>
        </table>
        <p style="${styles.muted}">Make sure your DNS points <strong>${domain}</strong> to the Church Flow platform.</p>
      `
      : `
        <h2 style="${styles.heading}">Custom Domain Rejected</h2>
        <p style="${styles.paragraph}">Your custom domain request for <strong>${branchName}</strong> (<code>${domain}</code>) was not approved.</p>
        ${rejectionReason ? `<div style="${styles.warningBox}"><strong>Reason:</strong> ${rejectionReason}</div>` : ""}
        <p style="${styles.paragraph}">You can submit a new request from the Branches page.</p>
      `;

  const html = churchFlowEmail(body, decision === "approved" ? "Your custom domain is live" : "Custom domain rejected");
  const text =
    decision === "approved"
      ? `Your custom domain ${domain} is approved.`
      : `Your custom domain request for ${domain} was rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ""}`;
  return emailService.sendEmail(to, subject, text, html);
}

/** Notify branch admin when a previously active domain is deactivated. */
export async function sendCustomDomainDeactivatedEmail(
  to: string,
  domain: string,
  branchName: string,
) {
  const subject = `Your custom domain ${domain} was deactivated`;
  const html = churchFlowEmail(`
    <h2 style="${styles.heading}">Custom Domain Deactivated</h2>
    <p style="${styles.paragraph}">The custom domain <strong>${domain}</strong> for <strong>${branchName}</strong> has been deactivated by an administrator.</p>
    <p style="${styles.paragraph}">Members visiting this domain will no longer see your branded sign-in page. Please contact support if you believe this is in error.</p>
  `, "Custom domain deactivated");
  return emailService.sendEmail(to, subject, `Custom domain ${domain} deactivated.`, html);
}
