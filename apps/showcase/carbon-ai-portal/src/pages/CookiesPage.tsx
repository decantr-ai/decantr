import { css } from '@decantr/css';
import { Cookie } from 'lucide-react';

const sections = [
  { id: 'what', title: 'What Are Cookies' },
  { id: 'how', title: 'How We Use Cookies' },
  { id: 'types', title: 'Types of Cookies' },
  { id: 'manage', title: 'Managing Cookies' },
  { id: 'contact', title: 'Contact Us' },
];

export function CookiesPage() {
  return (
    <div className={css('_px4 _py12')}>
      <div
        className={css('_flex _gap8')}
        style={{ maxWidth: '1000px', margin: '0 auto' }}
      >
        {/* TOC sidebar */}
        <aside
          className={css('_none _lg:flex _col _gap2 _shrink0 _sticky')}
          style={{ width: '220px', top: '80px', alignSelf: 'flex-start' }}
        >
          <span className={css('_textxs _fontsemi _fgmuted _uppercase _mb2')}>
            On this page
          </span>
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={'toc-link'}>
              {s.title}
            </a>
          ))}
        </aside>

        {/* Content */}
        <article className={css('_flex1') + ' legal-content'}>
          <div className={css('_flex _aic _gap3 _mb6')}>
            <Cookie size={24} style={{ color: 'var(--d-primary)' }} />
            <h1 className={css('_heading2 _fgtext')}>Cookie Policy</h1>
          </div>
          <p>
            Last updated: March 15, 2026. This Cookie Policy explains how Carbon AI uses
            cookies and similar technologies when you visit our website or use our services.
          </p>

          <h2 id="what">What Are Cookies</h2>
          <p>
            Cookies are small text files placed on your device by websites you visit. They
            are widely used to make websites work more efficiently and to provide information
            to site owners. Cookies may be &quot;session&quot; cookies (deleted when you close your browser)
            or &quot;persistent&quot; cookies (remaining until they expire or you delete them).
          </p>

          <h2 id="how">How We Use Cookies</h2>
          <p>We use cookies to:</p>
          <ul>
            <li>Keep you signed in to your account</li>
            <li>Remember your preferences and settings</li>
            <li>Understand how you interact with our service</li>
            <li>Improve the performance and reliability of our platform</li>
            <li>Protect against fraud and unauthorized access</li>
          </ul>

          <h2 id="types">Types of Cookies We Use</h2>
          <h3>Essential Cookies</h3>
          <p>
            These cookies are necessary for the service to function. They enable core
            features like authentication, session management, and security. You cannot
            opt out of these cookies.
          </p>
          <h3>Preference Cookies</h3>
          <p>
            These cookies remember your settings, such as theme preference and language
            selection. They are not strictly necessary but improve your experience.
          </p>
          <h3>Analytics Cookies</h3>
          <p>
            We use privacy-respecting analytics to understand usage patterns. These cookies
            collect aggregate, anonymous data. We do not use third-party advertising cookies.
          </p>

          <h2 id="manage">Managing Cookies</h2>
          <p>
            Most browsers allow you to control cookies through their settings. You can
            typically choose to block all cookies, accept all cookies, or be notified
            when a cookie is set. Note that blocking essential cookies may prevent
            you from using some features of our service.
          </p>

          <h2 id="contact">Contact Us</h2>
          <p>
            If you have questions about our use of cookies, please contact us at
            privacy@carbonai.dev.
          </p>
        </article>
      </div>
    </div>
  );
}
