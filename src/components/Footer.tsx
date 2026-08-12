import { Link } from "react-router-dom";
import logoWhite from "../assets/logo-white.png";
import { CONTACT } from "../data/contact";

export default function Footer() {
  return (
    <footer className="bg-navy-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          <div className="md:col-span-2">
            <img src={logoWhite} alt="Integrated Web Solutions" className="h-9 w-auto mb-4 brightness-0 invert" />
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
              Design and engineering for brands who want a site that actually
              performs — not just one that looks nice in a pitch deck.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-sky-400 mb-4 uppercase tracking-wide">Sitemap</p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link to="/about" className="hover:text-coral-500 transition-colors">About</Link></li>
              <li><Link to="/services" className="hover:text-coral-500 transition-colors">Services</Link></li>
              <li><Link to="/portfolio" className="hover:text-coral-500 transition-colors">Portfolio</Link></li>
              <li><Link to="/blog" className="hover:text-coral-500 transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-coral-500 transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-xs text-sky-400 mb-4 uppercase tracking-wide">Get in touch</p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <a href={CONTACT.mailtoHref} className="hover:text-coral-500 transition-colors">
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:text-coral-500 transition-colors">
                  {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>{CONTACT.location}</li>
              <li className="flex gap-4 pt-2">
                <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-coral-500 transition-colors">LinkedIn</a>
                <a href={CONTACT.upwork} target="_blank" rel="noopener noreferrer" className="hover:text-coral-500 transition-colors">Upwork</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="font-mono text-xs text-slate-500">
            <span className="text-coral-500">/*</span> © {new Date().getFullYear()} Integrated Web Solutions. Built in-house. <span className="text-coral-500">*/</span>
          </p>
          <p className="font-mono text-xs text-slate-500 flex flex-wrap gap-4">
            <Link to="/privacy" className="hover:text-coral-500 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-coral-500 transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-coral-500 transition-colors">Contact</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
