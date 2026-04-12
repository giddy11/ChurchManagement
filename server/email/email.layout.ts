/**
 * Shared Church Flow email layout.
 * All transactional emails should use this wrapper for consistent branding.
 */

const BRAND_COLOR = "#6366F1";
const BRAND_GRADIENT = "linear-gradient(135deg, #6366F1, #8B5CF6)";

export function churchFlowEmail(body: string, preheader?: string): string {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Church Flow</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#F3F4F6;color:#1F2937;-webkit-font-smoothing:antialiased;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#F3F4F6;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);max-width:600px;width:100%;">

          <!-- ====== HEADER ====== -->
          <tr>
            <td style="background:${BRAND_GRADIENT};padding:30px 40px;text-align:center;">
              <h1 style="margin:0;color:#FFFFFF;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                ⛪ Church Flow
              </h1>
            </td>
          </tr>

          <!-- ====== BODY ====== -->
          <tr>
            <td style="padding:36px 40px;">
              ${body}
            </td>
          </tr>

          <!-- ====== FOOTER ====== -->
          <tr>
            <td style="background-color:#F9FAFB;border-top:1px solid #E5E7EB;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-size:13px;color:#6B7280;">
                Powered by <strong style="color:${BRAND_COLOR};">Church Flow</strong>
              </p>
              <p style="margin:0 0 6px;font-size:12px;color:#9CA3AF;">
                Simplifying church management, one click at a time.
              </p>
              <p style="margin:0 0 6px;font-size:12px;color:#9CA3AF;">
                &copy; ${year} Church Flow. All rights reserved.
              </p>
              <p style="margin:0;font-size:12px;color:#9CA3AF;">
                Need help? <a href="mailto:support@churchflow.app" style="color:${BRAND_COLOR};text-decoration:none;">support@churchflow.app</a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Sub-footer -->
        <p style="margin:16px 0 0;font-size:11px;color:#9CA3AF;text-align:center;">
          You received this email because you have an account with Church Flow.<br/>
          If you didn't expect this, please contact support.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ── Reusable inline-style fragments ─────────────────────────────────── */

export const styles = {
  heading: `color:#1F2937;font-size:22px;font-weight:700;margin:0 0 16px;text-align:center;`,
  paragraph: `font-size:15px;line-height:1.7;color:#4B5563;margin:0 0 16px;`,
  codeBox: `background-color:#EEF2FF;border:1px solid #C7D2FE;border-radius:8px;padding:18px;text-align:center;font-size:28px;font-weight:700;letter-spacing:6px;color:${BRAND_COLOR};font-family:'Courier New',monospace;margin:24px 0;`,
  button: `display:inline-block;padding:14px 32px;background:${BRAND_GRADIENT};color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;`,
  warningBox: `background-color:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:14px 18px;margin:20px 0;font-size:14px;color:#92400E;line-height:1.6;`,
  infoBox: `background-color:#F0F9FF;border:1px solid #BAE6FD;border-radius:8px;padding:14px 18px;margin:20px 0;font-size:14px;color:#0C4A6E;line-height:1.6;`,
  credentialBox: `background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;margin:20px 0;`,
  credentialLabel: `font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#6B7280;`,
  credentialValue: `font-size:15px;color:#111827;font-weight:500;`,
  muted: `font-size:13px;color:#9CA3AF;line-height:1.6;`,
} as const;
