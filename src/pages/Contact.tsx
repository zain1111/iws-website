import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ContactCtaRow } from "../components/PolicyLayout";
import { CONTACT } from "../data/contact";
import { EASE } from "../lib/motion";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Project inquiry from ${name.trim() || "website"}`);
    const body = encodeURIComponent(
      `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`,
    );
    window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
  }

  return (
    <>
      <section className="relative overflow-hidden bg-navy-900 pt-40 pb-20 lg:pt-48 lg:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-20 w-[400px] h-[480px] bg-gradient-to-br from-blue-500 to-navy-700 facet-cut opacity-70" />
          <div className="absolute inset-0 bg-navy-900/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="font-mono text-sm text-sky-400 mb-6"
          >
            <span className="text-coral-500">//</span> contact
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="font-display font-semibold text-white text-5xl sm:text-6xl tracking-tight max-w-3xl leading-[0.98]"
          >
            Tell us what you want to ship.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
            className="mt-6 max-w-xl text-slate-300 text-lg leading-relaxed"
          >
            Free 30-minute strategy call — scope, timeline, and budget, straight answers. Or reach
            us directly below.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
            className="mt-8"
          >
            <ContactCtaRow />
          </motion.div>
        </div>
      </section>

      <section className="bg-paper py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-14 lg:gap-20">
          <div className="space-y-8">
            <div>
              <p className="font-mono text-xs text-coral-500 uppercase tracking-wide mb-3">
                Studio
              </p>
              <h2 className="font-display text-3xl text-navy-900 font-semibold">
                Integrated Web Solutions
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                PSEB-certified web design & engineering team. We build conversion-ready sites and
                product UIs for growing brands.
              </p>
            </div>
            <ul className="space-y-4 text-slate-600">
              <li>
                <span className="font-mono text-[10px] uppercase text-slate-400 block mb-1">
                  Email
                </span>
                <a href={CONTACT.mailtoHref} className="text-navy-900 hover:text-coral-500">
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <span className="font-mono text-[10px] uppercase text-slate-400 block mb-1">
                  Phone / WhatsApp
                </span>
                <a
                  href={CONTACT.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy-900 hover:text-coral-500"
                >
                  {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <span className="font-mono text-[10px] uppercase text-slate-400 block mb-1">
                  Location
                </span>
                {CONTACT.location}
              </li>
              <li>
                <span className="font-mono text-[10px] uppercase text-slate-400 block mb-1">
                  Hours
                </span>
                Mon–Fri, 10:00–19:00 PKT (UTC+5). We reply within one business day.
              </li>
            </ul>
            <div className="flex flex-wrap gap-4 font-display text-sm">
              <a
                href={CONTACT.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral-500 hover:underline"
              >
                LinkedIn
              </a>
              <a
                href={CONTACT.upwork}
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral-500 hover:underline"
              >
                Upwork
              </a>
            </div>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-navy-900/10 bg-white p-6 sm:p-8 space-y-4"
          >
            <p className="font-mono text-xs text-slate-400 uppercase tracking-wide">Send a message</p>
            <label className="block space-y-1">
              <span className="font-mono text-[10px] text-slate-400 uppercase">Name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-mono text-[10px] text-slate-400 uppercase">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500"
              />
            </label>
            <label className="block space-y-1">
              <span className="font-mono text-[10px] text-slate-400 uppercase">Project notes</span>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Goals, timeline, links, budget range…"
                className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500"
              />
            </label>
            <button
              type="submit"
              className="w-full sm:w-auto bg-navy-900 text-white font-display text-sm px-6 py-3 rounded-full hover:bg-coral-500 transition-colors"
            >
              Open email draft →
            </button>
            <p className="font-mono text-[11px] text-slate-400">
              Opens your email app addressed to {CONTACT.email}. Prefer chat? Use WhatsApp or book a
              call.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}
