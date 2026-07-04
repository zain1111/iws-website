export interface Service {
  id: string;
  tag: string;
  title: string;
  /** Short line for home grid cards. */
  summary: string;
  /** Expanded copy for the services page. */
  detail: string;
  bullets: string[];
  stack: string[];
  gradient: string;
}

export const SERVICES: Service[] = [
  {
    id: "web-design",
    tag: "design",
    title: "Web Design",
    summary: "Interfaces built around how your customers actually decide, not a template's idea of pretty.",
    detail:
      "We design around conversion paths, not Dribbble shots. Every layout decision ties back to how your audience evaluates, compares, and buys — so the site earns trust before they ever read a word.",
    bullets: [
      "UX research & wireframes before pixels",
      "Brand-aligned visual systems",
      "Mobile-first responsive layouts",
      "Design handoff your devs can actually build",
    ],
    stack: ["Figma", "Design Systems", "Prototyping"],
    gradient: "from-sky-400 to-blue-600",
  },
  {
    id: "custom-development",
    tag: "build",
    title: "Custom Development",
    summary: "React, Next.js, and MERN builds engineered for speed, and built to be handed off cleanly.",
    detail:
      "No page builders, no bloated themes. We write production-grade frontends and APIs tailored to your product — fast loads, clean architecture, and code your team can extend without calling us for every tweak.",
    bullets: [
      "React, Next.js & MERN stack builds",
      "REST & GraphQL API integration",
      "Performance-first component architecture",
      "Documented handoff & staging workflows",
    ],
    stack: ["React", "Next.js", "Node.js", "TypeScript"],
    gradient: "from-blue-500 to-navy-700",
  },
  {
    id: "wordpress-cms",
    tag: "cms",
    title: "WordPress & CMS",
    summary: "Content your team can actually edit — without breaking the layout every time.",
    detail:
      "WordPress done properly: custom themes, sane block editors, and field structures that keep marketing teams independent without wrecking the design every time someone publishes a post.",
    bullets: [
      "Custom WordPress themes & plugins",
      "ACF / block editor workflows",
      "Role-based content permissions",
      "Migration from legacy CMS platforms",
    ],
    stack: ["WordPress", "PHP", "ACF", "WooCommerce"],
    gradient: "from-navy-700 to-slate-500",
  },
  {
    id: "ecommerce",
    tag: "sell",
    title: "E-Commerce",
    summary: "Storefronts tuned for checkout completion, not just browsing.",
    detail:
      "We optimize the full purchase funnel — product discovery, cart friction, payment flows, and post-purchase — so revenue isn't left on the table by a pretty but leaky storefront.",
    bullets: [
      "Shopify & WooCommerce builds",
      "Checkout & conversion optimization",
      "Inventory & payment integrations",
      "Speed tuning for product catalogs",
    ],
    stack: ["Shopify", "WooCommerce", "Stripe"],
    gradient: "from-blue-600 to-sky-400",
  },
  {
    id: "seo-performance",
    tag: "grow",
    title: "SEO & Performance",
    summary: "Technical SEO and Core Web Vitals work that compounds instead of decaying after launch.",
    detail:
      "Launch-day speed isn't enough. We bake in technical SEO, schema, crawlability, and Core Web Vitals monitoring so rankings and load times keep improving instead of silently degrading.",
    bullets: [
      "Core Web Vitals & Lighthouse audits",
      "Technical SEO & structured data",
      "Image & asset optimization pipelines",
      "Ongoing performance monitoring",
    ],
    stack: ["SEO", "Core Web Vitals", "Analytics"],
    gradient: "from-navy-800 to-blue-500",
  },
  {
    id: "care-maintenance",
    tag: "care",
    title: "Care & Maintenance",
    summary: "Monitoring, updates, and a real human to call when something breaks at 11pm.",
    detail:
      "Sites need upkeep after launch. We handle security patches, uptime monitoring, content support, and emergency fixes — so you're not scrambling alone when something breaks in production.",
    bullets: [
      "Security updates & dependency patches",
      "Uptime & error monitoring",
      "Content & layout support hours",
      "Priority emergency response",
    ],
    stack: ["Monitoring", "Backups", "Support SLA"],
    gradient: "from-slate-500 to-navy-900",
  },
];
