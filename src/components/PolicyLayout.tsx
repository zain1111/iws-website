import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { openCalendlyPopup } from "../lib/calendly";
import { CONTACT } from "../data/contact";

/** Shared legal/policy page chrome — readable, content-first (AdSense trust pages). */
export function PolicyLayout({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <header className="bg-navy-900 pt-36 pb-16 lg:pt-44 lg:pb-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <p className="font-mono text-sm text-sky-400 mb-4">
            <span className="text-coral-500">//</span> {eyebrow}
          </p>
          <h1 className="font-display font-semibold text-white text-4xl sm:text-5xl leading-tight">
            {title}
          </h1>
        </div>
      </header>
      <article className="bg-paper py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 space-y-8 text-slate-600 text-base leading-relaxed [&_h2]:font-display [&_h2]:text-navy-900 [&_h2]:text-2xl [&_h2]:pt-4 [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-coral-500 [&_a]:hover:underline">
          {children}
          <p className="pt-8 border-t border-navy-900/10 font-mono text-xs text-slate-400">
            Questions?{" "}
            <Link to="/contact" className="text-coral-500 hover:underline">
              Contact us
            </Link>{" "}
            or email{" "}
            <a href={CONTACT.mailtoHref}>{CONTACT.email}</a>.
          </p>
        </div>
      </article>
    </>
  );
}

export function ContactCtaRow() {
  return (
    <div className="flex flex-wrap gap-3 pt-2">
      <button
        type="button"
        onClick={() => void openCalendlyPopup("contact_page")}
        className="bg-coral-500 text-white font-display text-sm px-6 py-3 rounded-full hover:bg-navy-900 transition-colors"
      >
        Book a free call
      </button>
      <a
        href={CONTACT.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="border border-navy-900/15 text-navy-900 font-display text-sm px-6 py-3 rounded-full hover:border-coral-500 transition-colors"
      >
        WhatsApp
      </a>
    </div>
  );
}
