const WHATSAPP_MESSAGE =
  "Hi Zain, I'd like to book a free strategy call about a project.";

export const CONTACT = {
  email: "info@theiwsolutions.com",
  phone: "+923090083051",
  phoneDisplay: "+92 309 008 3051",
  location: "Lahore, Pakistan",
  linkedin: "https://www.linkedin.com/in/zain-azeem1",
  upwork:
    "https://www.upwork.com/freelancers/~01a505408c8515b6ca?mp_source=share",
  whatsappHref: `https://wa.me/923090083051?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`,
  mailtoHref: "mailto:info@theiwsolutions.com",
  /** Primary booking link — Calendly 30‑min strategy call */
  calendlyUrl: "https://calendly.com/zain-theiwsolutions/30min",
} as const;
