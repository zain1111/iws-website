import { PolicyLayout } from "../components/PolicyLayout";
import { CONTACT } from "../data/contact";

export default function PrivacyPage() {
  return (
    <PolicyLayout eyebrow="legal" title="Privacy Policy">
      <p className="text-sm text-slate-500">Last updated: August 12, 2026</p>
      <p>
        Integrated Web Solutions (“IWS”, “we”, “us”) operates{" "}
        <a href="https://theiwsolutions.com">theiwsolutions.com</a> (the “Site”). This Privacy
        Policy explains what information we collect, how we use it, and the choices you have.
      </p>

      <h2>Who we are</h2>
      <p>
        Integrated Web Solutions is a web design and engineering studio based in{" "}
        {CONTACT.location}. Contact:{" "}
        <a href={CONTACT.mailtoHref}>{CONTACT.email}</a>, {CONTACT.phoneDisplay}.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Contact details</strong> you send us (name, email, phone, project notes) via email,
          WhatsApp, Calendly, or forms.
        </li>
        <li>
          <strong>Usage data</strong> such as pages viewed, approximate location, device/browser
          type, and referral source — collected through analytics tools (for example Google
          Analytics) when enabled.
        </li>
        <li>
          <strong>Advertising data</strong> if ads are shown (for example Google AdSense), which may
          use cookies or similar technologies to serve and measure ads.
        </li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>Respond to inquiries and deliver client work</li>
        <li>Improve the Site, content, and user experience</li>
        <li>Measure traffic and marketing performance</li>
        <li>Show relevant advertising where ads are enabled</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>Cookies & third parties</h2>
      <p>
        We and our partners may use cookies and similar technologies. Third-party services we may
        use include Google Analytics, Google AdSense, Calendly, and social or freelance platforms
        you choose to visit from our Site. Those services have their own privacy policies.
      </p>
      <p>
        You can control cookies through your browser settings. Blocking some cookies may affect Site
        features.
      </p>

      <h2>Google AdSense</h2>
      <p>
        Google may use cookies (including the DoubleClick cookie) to serve ads based on prior visits
        to this or other websites. You can opt out of personalized advertising via{" "}
        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
          Google Ads Settings
        </a>
        . Learn more about how Google uses data at{" "}
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener noreferrer"
        >
          policies.google.com/technologies/partner-sites
        </a>
        .
      </p>

      <h2>Data retention</h2>
      <p>
        We keep inquiry and project communications as long as needed to run the business and meet
        legal or contractual requirements. Analytics data is retained according to each provider’s
        settings.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on your location, you may request access, correction, or deletion of personal
        data we hold about you. Email{" "}
        <a href={CONTACT.mailtoHref}>{CONTACT.email}</a> and we will respond within a reasonable
        time.
      </p>

      <h2>Children</h2>
      <p>
        The Site is not directed at children under 13. We do not knowingly collect personal
        information from children.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy from time to time. The “Last updated” date at the top will
        change when we do. Continued use of the Site after changes means you accept the updated
        policy.
      </p>
    </PolicyLayout>
  );
}
