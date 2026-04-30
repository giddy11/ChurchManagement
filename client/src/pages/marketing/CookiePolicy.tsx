import React from 'react';
import MarketingPageLayout from '@/components/landing/MarketingPageLayout';

const CookiePolicy: React.FC = () => (
  <MarketingPageLayout
    eyebrow="Legal"
    title="Cookie Policy"
    subtitle="This page explains what cookies and similar storage technologies ChurchFlow uses, why we use them, and the choices you have."
    lastUpdated="April 30, 2026"
  >
    <h2>1. What are cookies?</h2>
    <p>
      Cookies are small text files that a website places on your browser or
      device when you visit it. They allow the site to remember information
      about your visit, such as whether you are signed in. We also use
      similar technologies — like <strong>localStorage</strong> and{' '}
      <strong>sessionStorage</strong> — that browsers use to store
      information locally on your device.
    </p>

    <h2>2. How ChurchFlow uses cookies</h2>
    <p>
      We keep our use of cookies deliberately small and we do not use
      third-party advertising or tracking cookies. The categories below
      describe the cookies and storage we set:
    </p>

    <h3>Strictly necessary</h3>
    <ul>
      <li>
        <strong>Authentication tokens.</strong> A short-lived access token
        and a longer-lived refresh token are stored so you remain signed in
        across pages and tabs. Without these, the Service cannot function.
      </li>
      <li>
        <strong>Session state.</strong> A small amount of data about your
        active church, branch, or in-progress workflow is kept locally so
        you don't lose context when you reload the page.
      </li>
      <li>
        <strong>Custom-domain branding cache.</strong> When you visit a
        branded custom domain, branding details (logo, colours, name) may be
        cached briefly to avoid a flash of unstyled content.
      </li>
    </ul>

    <h3>Functional</h3>
    <ul>
      <li>
        <strong>Preferences.</strong> Choices such as light/dark mode,
        sidebar collapse state, and recently used filters are remembered so
        the app feels familiar each time you return.
      </li>
      <li>
        <strong>PWA install &amp; reload prompts.</strong> A flag is stored
        so we don't repeatedly prompt you to install the app or reload after
        a deployment.
      </li>
    </ul>

    <h3>Analytics &amp; performance</h3>
    <p>
      We use minimal, privacy-respecting analytics to understand aggregated
      usage of the platform (for example, which features are used most). We
      do not use cookies that build a cross-site advertising profile of you.
    </p>

    <h2>3. Cookies set by third parties</h2>
    <p>The Service uses a small number of trusted third-party services:</p>
    <ul>
      <li>
        <strong>Google Sign-In.</strong> If you choose to sign in with Google,
        Google will set its own cookies as part of the OAuth flow. Google's
        use of those cookies is governed by its own privacy and cookie
        policies.
      </li>
      <li>
        <strong>Cloudinary.</strong> Images uploaded through ChurchFlow are
        stored on Cloudinary. Loading those images may set technical cookies
        on Cloudinary's domain.
      </li>
    </ul>

    <h2>4. Managing cookies</h2>
    <p>
      Most browsers let you view, manage, and delete cookies through their
      settings. You can also set your browser to block cookies or to alert
      you when cookies are being set. Note that blocking strictly necessary
      cookies will prevent core parts of the Service (such as signing in)
      from working.
    </p>
    <p>
      You can clear ChurchFlow's locally-stored authentication and
      preference data at any time by signing out of your account and
      clearing site data for ChurchFlow in your browser.
    </p>

    <h2>5. Changes to this policy</h2>
    <p>
      We may update this Cookie Policy as our use of cookies evolves. When
      we make material changes, we will update the "Last updated" date at
      the top of this page.
    </p>

    <h2>6. Questions</h2>
    <p>
      If you have any questions about how we use cookies, email us at{' '}
      <a href="mailto:theunitedchurchflow@gmail.com">
        theunitedchurchflow@gmail.com
      </a>
      .
    </p>
  </MarketingPageLayout>
);

export default CookiePolicy;
