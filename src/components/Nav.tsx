import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { CONTACT } from "../data/contact";
import { openCalendlyPopup } from "../lib/calendly";
import logoColor from "../assets/logo-color.png";
import logoWhite from "../assets/logo-white.png";
import { RESERVED_PATHS } from "../lib/blog";

const NAV_LINKS = [
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

function isLikelyBlogPost(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length !== 1) return false;
  return !RESERVED_PATHS.has(parts[0]);
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const onDarkHero =
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/portfolio" ||
    pathname.startsWith("/portfolio/") ||
    pathname === "/services" ||
    pathname === "/blog" ||
    pathname === "/contact" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    isLikelyBlogPost(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const lightText = onDarkHero && !scrolled;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-paper/90 backdrop-blur-md shadow-[0_1px_0_0_rgba(16,24,31,0.08)]" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 h-20">
        <Link to="/" className="relative flex items-center h-14 lg:h-16" aria-label="Integrated Web Solutions — home">
          <img
            src={logoColor}
            alt="Integrated Web Solutions"
            className={`h-14 lg:h-16 w-auto transition-opacity duration-300 ${scrolled ? "opacity-100" : "opacity-0"}`}
          />
          <img
            src={logoWhite}
            alt=""
            aria-hidden
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-14 lg:h-16 w-auto transition-opacity duration-300 ${scrolled ? "opacity-0" : "opacity-100"}`}
          />
        </Link>

        <ul className={`hidden md:flex items-center gap-9 font-display text-[15px] ${lightText ? "text-white" : "text-navy-900"}`}>
          {NAV_LINKS.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={`relative py-1 hover:text-coral-500 transition-colors after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-coral-500 hover:after:w-full after:transition-all after:duration-300 ${
                  pathname === l.to ? "text-coral-500 after:w-full" : ""
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <a
            href={CONTACT.upwork}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 font-display text-sm px-5 py-2.5 rounded-full border transition-colors duration-300 ${
              lightText
                ? "border-white/40 text-white hover:border-[#14a800] hover:bg-[#14a800]/10"
                : "border-navy-900/20 text-navy-900 hover:border-[#14a800] hover:text-[#14a800]"
            }`}
          >
            Upwork
            <span aria-hidden>↗</span>
          </a>
          <a
            href={CONTACT.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              void openCalendlyPopup("nav");
            }}
            className="inline-flex items-center gap-2 bg-navy-900 text-white font-display text-sm px-5 py-2.5 rounded-full hover:bg-coral-500 transition-colors duration-300"
          >
            Book a call
            <span aria-hidden>→</span>
          </a>
        </div>

        <button
          className={`md:hidden flex flex-col gap-1.5 p-2 ${scrolled || open || !onDarkHero ? "text-navy-900" : "text-white"}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`block h-0.5 w-6 bg-current transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-current transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="md:hidden bg-paper border-t border-navy-900/10 px-6 pb-6"
        >
          <ul className="flex flex-col gap-4 pt-4 font-display text-navy-900">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} onClick={() => setOpen(false)} className={pathname === l.to ? "text-coral-500" : ""}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={CONTACT.upwork}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="inline-block border border-navy-900/20 text-navy-900 px-5 py-2.5 rounded-full hover:border-[#14a800] hover:text-[#14a800] transition-colors"
              >
                Upwork ↗
              </a>
            </li>
            <li>
              <a
                href={CONTACT.calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  void openCalendlyPopup("nav_mobile");
                }}
              >
                Book a call
              </a>
            </li>
          </ul>
        </motion.div>
      )}
    </header>
  );
}
