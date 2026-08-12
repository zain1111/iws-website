export interface ServicePageContent {
  heroLine: string;
  whoFor: string[];
  includes: string[];
  process: { title: string; body: string }[];
  timeline: string;
  deliverables: string[];
  faqs: { q: string; a: string }[];
  relatedCaseSlugs: string[];
}

export interface Service {
  id: string;
  tag: string;
  title: string;
  /** Short line for home grid cards. */
  summary: string;
  /** Expanded copy for the services index page. */
  detail: string;
  bullets: string[];
  stack: string[];
  gradient: string;
  /** Long-form detail page content. */
  page: ServicePageContent;
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
    page: {
      heroLine:
        "Conversion-first web design for brands that need a site to sell, book, or explain — not just look expensive.",
      whoFor: [
        "Founders launching or rebuilding a marketing site",
        "Teams stuck with a pretty template that doesn’t convert",
        "Companies that need brand-level design without a 6-month agency circus",
        "Products that need a clear story before the first line of code",
      ],
      includes: [
        "Discovery workshop: goals, audience, competitors, success metrics",
        "Information architecture & key user journeys",
        "Wireframes for core templates before visual design",
        "High-fidelity UI in Figma (desktop + mobile)",
        "Component-minded design system basics (type, color, spacing, buttons)",
        "Interactive prototype of primary flows",
        "Developer-ready handoff with notes and assets",
      ],
      process: [
        {
          title: "Discover",
          body: "We align on business goals, buyer objections, and what “done” looks like. No moodboards before we know what the site must achieve.",
        },
        {
          title: "Structure",
          body: "Sitemap, page roles, and wireframes so content and conversion paths are clear before polish.",
        },
        {
          title: "Design",
          body: "Visual system, hero composition, and template designs that stay on-brand and mobile-first.",
        },
        {
          title: "Handoff",
          body: "Specs, assets, and a walkthrough so engineering can build without guessing intent.",
        },
      ],
      timeline: "Typically 2–5 weeks depending on page count and brand maturity",
      deliverables: [
        "Figma source file",
        "Responsive layouts for key templates",
        "Clickable prototype",
        "Design tokens / style notes",
        "Asset export package",
      ],
      faqs: [
        {
          q: "Do you only design, or also build?",
          a: "Both. Many clients start with design then continue into Custom Development with the same team so nothing gets lost in translation.",
        },
        {
          q: "Can you work inside our existing brand guidelines?",
          a: "Yes. We extend your brand into a digital system — or help define one if guidelines are incomplete.",
        },
        {
          q: "Will this work for SaaS and service businesses?",
          a: "Yes. We design for demos, waitlists, bookings, and lead gen — not just brochure aesthetics.",
        },
      ],
      relatedCaseSlugs: ["vanguard", "ricekids", "yachtlens"],
    },
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
    page: {
      heroLine:
        "Production React / Next.js engineering for marketing sites and product UIs that need to ship fast and stay maintainable.",
      whoFor: [
        "Startups that outgrew no-code or page builders",
        "Teams needing a custom web app or SaaS front-end",
        "Agencies / founders who want clean code ownership",
        "Products that need API integrations and auth flows",
      ],
      includes: [
        "Technical planning & repo setup",
        "Component architecture in React / Next.js / TypeScript",
        "API integration (REST or GraphQL)",
        "Auth, dashboards, and app-shell patterns when needed",
        "Performance budgets (images, code-splitting, Core Web Vitals)",
        "Staging deploy + QA pass",
        "Handoff docs and optional training call",
      ],
      process: [
        {
          title: "Scope",
          body: "We lock features, stack choices, and milestones so the build doesn’t drift mid-sprint.",
        },
        {
          title: "Build",
          body: "Iterative delivery in reviewable chunks — you see progress in staging, not a big-bang dump at the end.",
        },
        {
          title: "Harden",
          body: "Responsive QA, accessibility basics, performance passes, and edge-case fixes before launch.",
        },
        {
          title: "Launch & handoff",
          body: "Production deploy support, environment notes, and a clean codebase your team can own.",
        },
      ],
      timeline: "Typically 3–10 weeks depending on feature depth",
      deliverables: [
        "Source code in your repo",
        "Staging + production deploy setup",
        "Environment variable documentation",
        "Component / folder structure notes",
        "Launch checklist",
      ],
      faqs: [
        {
          q: "Do you use WordPress for custom apps?",
          a: "For product UIs and complex marketing sites we prefer React/Next.js. WordPress is great for editorial CMS needs — see our WordPress & CMS service.",
        },
        {
          q: "Will we own the code?",
          a: "Yes. Work is delivered into your repository with a documented handoff unless a contract says otherwise.",
        },
        {
          q: "Can you integrate our existing backend?",
          a: "Yes — REST, GraphQL, Supabase, Firebase, and custom APIs are common.",
        },
      ],
      relatedCaseSlugs: ["bionicvo", "ledgerist", "amaterasu"],
    },
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
    page: {
      heroLine:
        "Custom WordPress themes and editor workflows so marketing can publish safely — without destroying the design.",
      whoFor: [
        "Publishers and content-heavy brands",
        "Companies migrating off brittle legacy themes",
        "Teams that need non-developers to update pages",
        "Businesses that want WordPress without template junk",
      ],
      includes: [
        "Custom theme development (not bloated multipurpose themes)",
        "ACF / block patterns for structured editing",
        "Role-based permissions for editors vs admins",
        "Content migration from old CMS / site",
        "SEO-friendly templates and metadata fields",
        "Performance cleanup (scripts, images, caching basics)",
        "Editor training session",
      ],
      process: [
        {
          title: "Audit",
          body: "We review content types, plugins, and pain points so we rebuild the CMS around how your team actually works.",
        },
        {
          title: "Model content",
          body: "Custom fields and templates for pages, posts, and repeating modules — fewer “break the layout” accidents.",
        },
        {
          title: "Theme build",
          body: "Front-end implementation matched to design, with clean PHP/theme structure.",
        },
        {
          title: "Migrate & train",
          body: "Content move, QA, and a practical walkthrough for your editors.",
        },
      ],
      timeline: "Typically 3–8 weeks depending on content volume and migrations",
      deliverables: [
        "Custom WordPress theme",
        "Editor field groups / patterns",
        "Migrated content (as scoped)",
        "Staging + production setup",
        "Editor guide / training call",
      ],
      faqs: [
        {
          q: "Page builder or custom theme?",
          a: "We prefer custom themes and structured fields. Page builders are used only when they clearly serve the client’s editing model.",
        },
        {
          q: "Can you handle WooCommerce?",
          a: "Yes for storefronts that fit WordPress. For complex product apps we often recommend a custom stack instead.",
        },
        {
          q: "Do you maintain the site after launch?",
          a: "Yes — see Care & Maintenance for updates, monitoring, and support hours.",
        },
      ],
      relatedCaseSlugs: ["humanistai", "lifescivoice", "healthcarechief"],
    },
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
    page: {
      heroLine:
        "Shopify and WooCommerce storefronts engineered for product discovery, trust, and checkout completion.",
      whoFor: [
        "Brands launching a first serious store",
        "Merchants stuck with a slow or confusing theme",
        "Teams needing payment / inventory integrations",
        "Catalogs that must stay fast as SKUs grow",
      ],
      includes: [
        "Store IA: collections, PDPs, cart, and checkout path",
        "Theme or custom storefront build (Shopify / Woo)",
        "Payment and shipping configuration support",
        "Conversion UX: trust blocks, variants, upsells (as scoped)",
        "Speed work for image-heavy catalogs",
        "Analytics events for funnel visibility",
        "Launch QA across devices",
      ],
      process: [
        {
          title: "Funnel map",
          body: "We map browse → product → cart → checkout and remove obvious friction before building polish.",
        },
        {
          title: "Build storefront",
          body: "Templates, product modules, and integrations wired for real merchandising workflows.",
        },
        {
          title: "Optimize",
          body: "Performance, mobile checkout, and trust content so visitors can finish the purchase.",
        },
        {
          title: "Go live",
          body: "Launch checklist, payment tests, and a handoff your ops team can run.",
        },
      ],
      timeline: "Typically 3–8 weeks depending on catalog size and integrations",
      deliverables: [
        "Live storefront on Shopify or WooCommerce",
        "Configured products / collections (as scoped)",
        "Payment & shipping setup support",
        "Analytics / conversion event basics",
        "Ops handoff notes",
      ],
      faqs: [
        {
          q: "Shopify or WooCommerce?",
          a: "Shopify is usually faster to operate for pure commerce. WooCommerce fits when WordPress content and store need to live together. We’ll recommend based on your ops reality.",
        },
        {
          q: "Do you handle product photography?",
          a: "We optimize and implement assets; photography is typically client-provided or a separate vendor.",
        },
        {
          q: "Can you connect ERP or inventory tools?",
          a: "Often yes via native apps or APIs — scoped per project after we see the stack.",
        },
      ],
      relatedCaseSlugs: ["mrtex", "wulfdesigns", "kashmirblue"],
    },
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
    page: {
      heroLine:
        "Technical SEO and performance engineering so your site can be crawled, indexed, and fast — after launch, not only on launch day.",
      whoFor: [
        "Sites with indexing or crawl issues",
        "Marketing teams fighting slow Core Web Vitals",
        "Businesses that need clean metadata and schema",
        "Teams preparing for AdSense / search quality reviews",
      ],
      includes: [
        "Technical SEO audit (indexation, canonicals, sitemap, robots)",
        "On-page structure: titles, headings, internal links",
        "Structured data where it helps (Article, Organization, etc.)",
        "Core Web Vitals remediation plan + implementation",
        "Image, font, and JS performance passes",
        "Analytics / Search Console alignment",
        "Prioritized backlog your team can keep shipping",
      ],
      process: [
        {
          title: "Measure",
          body: "Baseline Lighthouse, CWV field data (when available), crawl samples, and Search Console signals.",
        },
        {
          title: "Fix foundations",
          body: "Indexation, redirects, metadata, and sitemap hygiene before chasing vanity keywords.",
        },
        {
          title: "Speed",
          body: "Cut render-blocking weight, optimize media, and improve LCP/INP/CLS on key templates.",
        },
        {
          title: "Monitor",
          body: "Leave you with a checklist and optional Care plan so gains don’t decay.",
        },
      ],
      timeline: "Audit in 1–2 weeks; implementation often 2–6 weeks depending on codebase",
      deliverables: [
        "Written audit with prioritized fixes",
        "Implemented technical / performance changes (as scoped)",
        "Updated sitemap / robots guidance",
        "Before/after metrics snapshot",
        "Ongoing recommendations",
      ],
      faqs: [
        {
          q: "Do you do link building or content writing?",
          a: "Our focus is technical SEO, on-page structure, and performance. Content strategy can be paired with your team or our blog/case-study work.",
        },
        {
          q: "Can you fix a React SPA’s SEO issues?",
          a: "Yes — we address routing, meta tags, sitemaps, and rendering concerns common to SPAs and hybrid apps.",
        },
        {
          q: "How soon will rankings move?",
          a: "Technical fixes improve crawlability quickly; ranking movement still depends on content quality and competition.",
        },
      ],
      relatedCaseSlugs: ["humanistai", "lifescivoice", "ricekids"],
    },
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
    page: {
      heroLine:
        "Post-launch care with monitoring, updates, and human support — so production issues don’t become all-nighters for your team.",
      whoFor: [
        "Teams without an in-house web maintainer",
        "Sites that need monthly updates and backups",
        "Clients who want a known response path for incidents",
        "Marketing teams that need small content/layout help",
      ],
      includes: [
        "Dependency and security update cadence",
        "Uptime / error monitoring setup or oversight",
        "Backup verification routines",
        "Monthly support hours for content and small fixes",
        "Priority incident response (SLA by plan)",
        "Light performance and plugin hygiene",
        "Clear monthly summary of what changed",
      ],
      process: [
        {
          title: "Onboard",
          body: "Access, environments, monitoring, and a baseline health check.",
        },
        {
          title: "Maintain",
          body: "Scheduled updates, backups, and small requests from your queue.",
        },
        {
          title: "Respond",
          body: "When something breaks, you get a real engineer path — not a ticket black hole.",
        },
        {
          title: "Report",
          body: "Simple monthly notes: updates applied, incidents handled, recommended next fixes.",
        },
      ],
      timeline: "Ongoing monthly retainer after a short onboarding week",
      deliverables: [
        "Care plan with response expectations",
        "Monitoring & backup configuration",
        "Monthly update log",
        "Support channel (email / agreed tool)",
        "Optional after-hours emergency path",
      ],
      faqs: [
        {
          q: "Is this only for sites you built?",
          a: "Primarily yes. We can take over external sites after an audit if the stack is maintainable.",
        },
        {
          q: "What’s not included?",
          a: "Large new features and redesigns are scoped as projects. Care covers maintenance, monitoring, and small changes within hours.",
        },
        {
          q: "How fast do you respond?",
          a: "Depends on the plan. We’ll define business-hours and emergency response targets before kickoff.",
        },
      ],
      relatedCaseSlugs: ["garberbros", "walkercenter", "lslinstitute"],
    },
  },
];

export function getService(id: string) {
  return SERVICES.find((s) => s.id === id) ?? null;
}

export const SERVICE_IDS = SERVICES.map((s) => s.id);
