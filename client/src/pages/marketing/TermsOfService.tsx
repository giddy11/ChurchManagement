import React from 'react';
import MarketingPageLayout from '@/components/landing/MarketingPageLayout';

const TermsOfService: React.FC = () => (
  <MarketingPageLayout
    eyebrow="Legal"
    title="Terms of Service"
    subtitle="These Terms govern your access to and use of ChurchFlow. By creating an account or using the platform you agree to be bound by them."
    lastUpdated="April 30, 2026"
  >
    <h2>1. Agreement to terms</h2>
    <p>
      These Terms of Service ("Terms") form a binding agreement between you
      and ChurchFlow ("ChurchFlow", "we", "us") regarding your use of the
      ChurchFlow web application, related sites, and any custom-domain
      deployment thereof (together, the "Service"). If you are using the
      Service on behalf of a church or organisation, you represent that you
      have authority to bind that organisation to these Terms.
    </p>

    <h2>2. Eligibility &amp; accounts</h2>
    <ul>
      <li>You must be at least 18 years old to create an account.</li>
      <li>
        You agree to provide accurate information and to keep your password
        confidential. You are responsible for all activity that occurs under
        your account.
      </li>
      <li>
        Notify us immediately at{' '}
        <a href="mailto:theunitedchurchflow@gmail.com">
          theunitedchurchflow@gmail.com
        </a>{' '}
        if you suspect any unauthorised use of your account.
      </li>
    </ul>

    <h2>3. Acceptable use</h2>
    <p>You agree not to:</p>
    <ul>
      <li>
        Upload, store, or transmit content that is unlawful, defamatory,
        harassing, hateful, sexually explicit, or otherwise objectionable.
      </li>
      <li>
        Use the Service to send unsolicited bulk messages or for any
        deceptive, fraudulent, or illegal purpose.
      </li>
      <li>
        Reverse-engineer, decompile, or attempt to extract the source code of
        the Service except where permitted by law.
      </li>
      <li>
        Probe, scan, or test the vulnerability of the Service, or breach any
        security or authentication measures.
      </li>
      <li>
        Use the Service in a way that interferes with other users' enjoyment
        of it, or that places an unreasonable load on our infrastructure.
      </li>
    </ul>

    <h2>4. Your content</h2>
    <p>
      You retain ownership of all content you upload to the Service —
      including member records, event details, photos, and the configuration
      of any custom-domain landing pages. You grant ChurchFlow a worldwide,
      non-exclusive, royalty-free licence to host, store, reproduce, and
      display that content solely as necessary to provide the Service to you.
    </p>
    <p>
      You are responsible for ensuring you have the legal right to upload
      personal data about your members, visitors, and staff, and for
      obtaining any consents required by applicable privacy law.
    </p>

    <h2>5. Custom domains</h2>
    <p>
      Branches may register a custom domain to host their public branding
      and sign-up flow on ChurchFlow. Custom-domain requests are subject to
      review and approval. We may decline, deactivate, or remove a custom
      domain that violates these Terms, infringes a third party's rights, or
      misrepresents an unaffiliated organisation.
    </p>

    <h2>6. Free service &amp; future pricing</h2>
    <p>
      ChurchFlow is currently provided free of charge while the platform is
      growing. We may introduce paid plans in the future. If we do, we will
      give existing accounts reasonable advance notice and the opportunity to
      review the new pricing before any charges apply.
    </p>

    <h2>7. Service availability</h2>
    <p>
      We work hard to keep the Service running reliably, but we provide it
      "as is" and "as available". We do not guarantee uninterrupted, error-
      free, or completely secure operation. Planned maintenance and
      occasional downtime can occur.
    </p>

    <h2>8. Termination</h2>
    <p>
      You may close your account at any time from your account settings or
      by contacting us. We may suspend or terminate access to the Service if
      you violate these Terms, or if we are required to do so by law. After
      termination, we will delete or anonymise your data as described in our{' '}
      <a href="/privacy">Privacy Policy</a>.
    </p>

    <h2>9. Disclaimers &amp; limitation of liability</h2>
    <p>
      To the fullest extent permitted by law, ChurchFlow disclaims all
      warranties (express, implied, statutory, or otherwise) regarding the
      Service, including warranties of merchantability, fitness for a
      particular purpose, and non-infringement. In no event will ChurchFlow
      be liable for any indirect, incidental, special, consequential, or
      punitive damages, or any loss of data, revenue, or goodwill, arising
      out of or relating to your use of the Service.
    </p>

    <h2>10. Indemnification</h2>
    <p>
      You agree to indemnify and hold ChurchFlow harmless from any claim,
      loss, or demand (including reasonable legal fees) arising out of (a)
      your content, (b) your use of the Service, or (c) your violation of
      these Terms or any third-party rights.
    </p>

    <h2>11. Changes to the Service or these Terms</h2>
    <p>
      We may modify the Service or these Terms from time to time. When we
      make material changes, we will update the "Last updated" date at the
      top of this page and notify users of significant changes by email or
      in-app message. Continued use of the Service after changes take effect
      constitutes acceptance of the updated Terms.
    </p>

    <h2>12. Governing law</h2>
    <p>
      These Terms are governed by the laws of the Federal Republic of
      Nigeria, without regard to its conflict-of-law principles. Any dispute
      arising under these Terms will be resolved in the courts located in
      Rivers State, Nigeria, unless applicable law requires otherwise.
    </p>

    <h2>13. Contact</h2>
    <p>
      Questions about these Terms? Contact us at{' '}
      <a href="mailto:theunitedchurchflow@gmail.com">
        theunitedchurchflow@gmail.com
      </a>
      .
    </p>
  </MarketingPageLayout>
);

export default TermsOfService;
