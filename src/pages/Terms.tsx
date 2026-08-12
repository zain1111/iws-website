import { Link } from "react-router-dom";
import { PolicyLayout } from "../components/PolicyLayout";
import { CONTACT } from "../data/contact";

export default function TermsPage() {
  return (
    <PolicyLayout eyebrow="legal" title="Terms of Service">
      <p className="text-sm text-slate-500">Last updated: August 12, 2026</p>
      <p>
        These Terms of Service (“Terms”) govern your use of{" "}
        <a href="https://theiwsolutions.com">theiwsolutions.com</a> (the “Site”) operated by
        Integrated Web Solutions (“IWS”, “we”, “us”). By using the Site, you agree to these Terms.
      </p>

      <h2>Services</h2>
      <p>
        The Site describes our web design, development, and related digital services. Project work
        is governed by a separate proposal, statement of work, or freelance platform contract
        (Upwork, Fiverr, etc.) when you hire us.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not misuse the Site, attempt unauthorized access, or disrupt our systems</li>
        <li>Do not scrape or copy content for commercial reuse without written permission</li>
        <li>Do not use the Site for unlawful purposes</li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        Site design, branding, copy, and original content belong to IWS or our licensors unless
        otherwise noted. Client project trademarks and live product UIs remain those clients’
        property. Portfolio case studies describe work we delivered; they do not transfer ownership
        of client brands.
      </p>

      <h2>Blog & content</h2>
      <p>
        Articles and case studies are for general information. They are not legal, financial, or
        professional advice. We may update or remove content at any time.
      </p>

      <h2>Third-party links</h2>
      <p>
        The Site may link to third-party sites (Calendly, Upwork, client websites, ads). We are not
        responsible for their content, privacy practices, or availability.
      </p>

      <h2>Disclaimer</h2>
      <p>
        The Site is provided “as is.” To the fullest extent permitted by law, we disclaim warranties
        of merchantability, fitness for a particular purpose, and non-infringement. We do not
        guarantee uninterrupted or error-free access.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, IWS is not liable for indirect, incidental, or
        consequential damages arising from your use of the Site. Our total liability for Site use
        claims is limited to USD $100.
      </p>

      <h2>Privacy</h2>
      <p>
        How we handle personal data is described in our{" "}
        <Link to="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Contact</h2>
      <p>
        Integrated Web Solutions — {CONTACT.location}
        <br />
        <a href={CONTACT.mailtoHref}>{CONTACT.email}</a>
        <br />
        {CONTACT.phoneDisplay}
      </p>

      <h2>Changes</h2>
      <p>
        We may update these Terms. The “Last updated” date will change when we do. Continued use
        after changes constitutes acceptance.
      </p>
    </PolicyLayout>
  );
}
