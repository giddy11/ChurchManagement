import React from 'react';
import MarketingPageLayout from '@/components/landing/MarketingPageLayout';

const PrivacyPolicy: React.FC = () => (
  <MarketingPageLayout
    eyebrow="Legal"
    title="Privacy Policy"
    subtitle="This policy describes what personal information ChurchFlow collects, why we collect it, how we use it, and the choices you have."
    lastUpdated="April 30, 2026"
  >
    <h2>1. Who we are</h2>
    <p>
      ChurchFlow ("ChurchFlow", "we", "us", "our") provides software that
      helps churches and denominations manage their congregations, branches,
      events, and communications. This Privacy Policy applies to all visitors
      and users of the ChurchFlow platform, including users who access the
      platform through a custom domain operated by a church.
    </p>

    <h2>2. Information we collect</h2>
    <p>We collect information in three ways:</p>
    <ul>
      <li>
        <strong>Information you give us.</strong> When you register for an
        account, create a church, add a branch, invite a member, or contact
        us, you provide information such as your name, email address, phone
        number, postal address, role, profile photo, and password.
      </li>
      <li>
        <strong>Information about people you add.</strong> Church admins and
        coordinators may add member or visitor records that include personal
        details such as names, contact information, family relationships,
        attendance history, and notes. We process this information solely on
        behalf of the church under their instructions.
      </li>
      <li>
        <strong>Information collected automatically.</strong> Like most web
        services, our servers log technical information such as IP address,
        device type, browser, pages visited, and timestamps. We use cookies
        and similar technologies for sign-in, security, and to remember your
        preferences. See our <a href="/cookies">Cookie Policy</a> for more
        detail.
      </li>
    </ul>

    <h2>3. How we use information</h2>
    <ul>
      <li>To provide, maintain, and improve the ChurchFlow platform.</li>
      <li>To authenticate users, secure accounts, and prevent abuse.</li>
      <li>
        To send transactional emails (account verification, password resets,
        domain-approval notifications, event reminders, and similar).
      </li>
      <li>
        To respond to support requests and communicate important changes to
        the service.
      </li>
      <li>
        To produce aggregated, anonymised usage analytics that help us
        understand how the platform is used.
      </li>
    </ul>
    <p>
      We do <strong>not</strong> sell personal information, and we do not use
      member data to train third-party advertising or marketing systems.
    </p>

    <h2>4. Legal bases for processing</h2>
    <p>
      Where applicable law requires it, we rely on the following legal bases:
      performance of a contract (to deliver the service you signed up for),
      legitimate interests (to keep the service secure and improve it),
      consent (for optional communications and certain cookies), and
      compliance with legal obligations.
    </p>

    <h2>5. Sharing &amp; disclosure</h2>
    <p>We share information only in these limited circumstances:</p>
    <ul>
      <li>
        <strong>Within your church.</strong> Members and admins of the same
        branch can see information appropriate to their role (e.g. an admin
        can view all members; a coordinator can view their group; a member
        sees their own profile).
      </li>
      <li>
        <strong>Service providers.</strong> Trusted infrastructure providers
        that host our database, send transactional email, store uploaded
        images, and provide error monitoring. These providers are bound by
        contracts that limit how they use the data.
      </li>
      <li>
        <strong>Legal and safety.</strong> When required by law, court order,
        or to protect the rights, property, or safety of users and the public.
      </li>
      <li>
        <strong>Business transfers.</strong> In the unlikely event of a
        merger, acquisition, or asset sale, your information may be
        transferred, subject to this policy.
      </li>
    </ul>

    <h2>6. Data retention</h2>
    <p>
      We retain personal information for as long as your account is active or
      as needed to provide the service. Member and event data is retained for
      the lifetime of the church's account on ChurchFlow. When a church
      closes its account, we delete or anonymise its data within 90 days,
      except where we are legally required to retain it.
    </p>

    <h2>7. Your rights</h2>
    <p>
      Depending on where you live, you may have rights to access, correct,
      export, or delete your personal information, and to object to or
      restrict certain processing. You can exercise most of these rights from
      within your account settings, or by contacting us at the address below.
      We respond to verified requests within 30 days.
    </p>

    <h2>8. Security</h2>
    <p>
      We protect data with industry-standard measures including encryption in
      transit (TLS), encrypted password storage, role-based access control,
      and routine security reviews. No system is perfectly secure, however —
      so please use a strong, unique password and notify us immediately if
      you suspect unauthorised access.
    </p>

    <h2>9. Children</h2>
    <p>
      ChurchFlow is intended for use by adults acting on behalf of a church.
      Where churches record information about children (e.g. children's
      ministry attendance), the church is responsible for obtaining the
      necessary parental consent and for the lawfulness of that processing.
    </p>

    <h2>10. International transfers</h2>
    <p>
      Your data may be processed in countries other than the one you live in,
      including where our cloud providers are located. Where required, we
      use appropriate safeguards such as standard contractual clauses to
      protect transferred data.
    </p>

    <h2>11. Changes to this policy</h2>
    <p>
      We may update this Privacy Policy from time to time. When we make
      material changes, we will update the "Last updated" date at the top of
      this page and, where appropriate, notify you by email or in-app message.
    </p>

    <h2>12. Contact us</h2>
    <p>
      Questions about this policy or how we handle your data? Reach us at{' '}
      <a href="mailto:theunitedchurchflow@gmail.com">
        theunitedchurchflow@gmail.com
      </a>{' '}
      or through our <a href="/contact">contact page</a>.
    </p>
  </MarketingPageLayout>
);

export default PrivacyPolicy;
