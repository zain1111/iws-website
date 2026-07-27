import ricekids from "../assets/portfolio/ricekids.jpg";
import amaterasu from "../assets/portfolio/amaterasu.jpg";
import amotrial from "../assets/portfolio/amotrial.jpg";
import bionicvo from "../assets/portfolio/bionicvo.jpg";
import healthcarechief from "../assets/portfolio/healthcarechief.jpg";
import garberbros from "../assets/portfolio/garberbros.jpg";
import humanistai from "../assets/portfolio/humanistai.jpg";
import yachtlens from "../assets/portfolio/yachtlens.jpg";
import lifescivoice from "../assets/portfolio/lifescivoice.jpg";
import vanguard from "../assets/portfolio/vanguard.jpg";
import lslinstitute from "../assets/portfolio/lslinstitute.jpg";
import ledgerist from "../assets/portfolio/ledgerist.jpg";
import mrtex from "../assets/portfolio/mrtex.jpg";
import walkercenter from "../assets/portfolio/walkercenter.jpg";
import wulfdesigns from "../assets/portfolio/wulfdesigns.jpg";
import kashmirblue from "../assets/portfolio/kashmirblue.jpg";

export type Category =
  | "AI & SaaS"
  | "Media & Publishing"
  | "Business & Corporate"
  | "Marketing"
  | "Nonprofit";

export interface Project {
  slug: string;
  name: string;
  category: Category;
  /** Short tech chips shown on the card. */
  stack: string[];
  /** One-line summary for cards. */
  summary: string;
  /** Longer paragraph for the detail column. */
  detail: string;
  url: string;
  /** Optional live screenshot; falls back to the branded gradient tile. */
  image?: string;
  /** Fallback gradient (also used as the loading backdrop behind screenshots). */
  gradient: string;
  /**
   * Homepage pin order (1 = first). Only projects with `featured` appear
   * on the home Work section; lower numbers sort first on /portfolio too.
   */
  featured?: number;
}

/**
 * Single source of truth for portfolio work. The home page shows the
 * `featured` subset (sorted by pin order); the /portfolio page shows
 * everything with featured projects pinned to the top.
 */
export const PROJECTS: Project[] = [
  {
    slug: "ricekids",
    name: "Rice Kids",
    category: "Nonprofit",
    stack: ["Next.js", "React", "Tailwind"],
    summary: "A story-first nonprofit site built to turn visitors into donors.",
    detail:
      "Rice Kids enables pathways from poverty to prosperity via education for communities marginalized by racial, economic, and social inequity — over half a million lives touched. We built an impact-led site with a compelling hero, project stories, news & media, and clear, low-friction donation paths.",
    url: "https://ricekids.org/",
    image: ricekids,
    gradient: "from-blue-500 to-navy-700",
    featured: 2,
  },
  {
    slug: "amaterasu",
    name: "Amaterasu AI",
    category: "AI & SaaS",
    stack: ["React", "WebGL", "Scroll Motion"],
    summary: "An immersive, scroll-driven brand experience for an AI studio.",
    detail:
      "A fully motion-led site where every section is bound to scroll position — parallax, progress timelines, and a 'click to enter' reveal. Built to make an AI product feel alive the moment it loads.",
    url: "https://amaterasu.ai/",
    image: amaterasu,
    gradient: "from-blue-500 to-navy-700",
  },
  {
    slug: "bionicvo",
    name: "BionicVO",
    category: "AI & SaaS",
    stack: ["Next.js", "Node", "React"],
    summary: "A voice-cloning platform built on real, professional voice actors.",
    detail:
      "\"Professional VO cloning — the very best voice actors in the business, no synthetic voices.\" We built the web application: sample browsing, cloning flows, actor onboarding (\"Apply as Actor\"), and account management, engineered for speed and a clean hand-off.",
    url: "https://staging-app.bionicvo.us/",
    image: bionicvo,
    gradient: "from-sky-400 to-blue-600",
    featured: 1,
  },
  {
    slug: "humanistai",
    name: "The Humanist AI",
    category: "Media & Publishing",
    stack: ["CMS", "Custom Theme", "SEO"],
    summary: "An editorial platform covering the people and ideas shaping AI.",
    detail:
      "A high-cadence news publication with featured stories, topic hubs, podcast and events sections — structured so a lean editorial team can publish daily without touching code.",
    url: "https://thehumanistai.com/",
    image: humanistai,
    gradient: "from-navy-700 to-blue-600",
    featured: 3,
  },
  {
    slug: "garberbros",
    name: "Garber Bros",
    category: "Business & Corporate",
    stack: ["WordPress", "PHP", "MySQL"],
    summary: "Corporate site for a 55-year Gulf-coast marine transporter.",
    detail:
      "A vessel-and-barge fleet operator serving the oil & gas industry out of Morgan City, LA. We built a credible, content-managed corporate presence with fleet listings, employment, and a live lock-status section.",
    url: "https://garberbrosinc.com/",
    image: garberbros,
    gradient: "from-blue-600 to-navy-900",
  },
  {
    slug: "amotrial",
    name: "AMO Trial Lawyers",
    category: "Business & Corporate",
    stack: ["Web Design", "CMS", "SEO"],
    summary: "Conversion-focused site for a Louisiana trial-law firm.",
    detail:
      "Built around what wins clients for a litigation firm: bold positioning, verifiable case results, attorney profiles, and fast intake paths across personal injury, insurance, and family law.",
    url: "https://rsslawoffice.com/",
    image: amotrial,
    gradient: "from-slate-500 to-navy-800",
  },
  {
    slug: "yachtlens",
    name: "YachtLens Media",
    category: "Marketing",
    stack: ["React", "Vite", "Tailwind"],
    summary: "Brand + media site for a YouTube-first yacht production group.",
    detail:
      "'Where yacht buyers watch.' A punchy marketing site for a video-media brand serving builders, brokers, and marine brands — media-kit downloads, service breakdowns, and booking, tuned for reach and retention.",
    url: "https://yachtlens.com/",
    image: yachtlens,
    gradient: "from-sky-400 to-blue-600",
    featured: 5,
  },
  {
    slug: "lifescivoice",
    name: "Life Sciences Voice",
    category: "Media & Publishing",
    stack: ["WordPress", "PHP", "SEO"],
    summary: "High-volume editorial platform for life-sciences executives.",
    detail:
      "A content-dense news magazine covering R&D, clinical, commercial, and regulatory beats — architected with taxonomy, related-content, and performance work to keep a large article archive fast and discoverable.",
    url: "https://lifescivoice.com/",
    image: lifescivoice,
    gradient: "from-navy-700 to-slate-500",
  },
  {
    slug: "healthcarechief",
    name: "Healthcare Chief",
    category: "Media & Publishing",
    stack: ["WordPress", "PHP", "SEO"],
    summary: "A news and insights hub for healthcare decision-makers.",
    detail:
      "An editorial destination for healthcare leaders spanning Health, Technology & AI, Pharma, Procurement, and Insights beats — a clean, search-driven reading experience with a taxonomy built to scale as coverage grows.",
    url: "https://healthcarechief.com/",
    image: healthcarechief,
    gradient: "from-blue-500 to-navy-700",
  },
  {
    slug: "vanguard",
    name: "Vanguard Student Labs",
    category: "Business & Corporate",
    stack: ["React", "Vite", "Tailwind"],
    summary: "Premium brand site for an elite student capstone incubator.",
    detail:
      "A conversion-focused site for a capstone project incubator helping ambitious students launch foundations, publish books, and produce independent research. Built around a cinematic hero, clear track narratives (Founder, Author, Scholar), case outcomes, and a private consultation path.",
    url: "https://vanguardstudentlabs.com/",
    image: vanguard,
    gradient: "from-navy-900 to-slate-600",
  },
  {
    slug: "lslinstitute",
    name: "Life Sciences Leadership Institute",
    category: "Nonprofit",
    stack: ["React", "Vite", "Tailwind"],
    summary: "Institutional site for a non-profit executive leadership forum.",
    detail:
      "An independent non-profit convening global life-sciences executives around operational strategy and health equity. We designed a restrained, trust-forward presence — manifesto, programs, charter, and executive inquiry — tuned for a high-discretion audience.",
    url: "https://lslinstitute.org/",
    image: lslinstitute,
    gradient: "from-slate-400 to-navy-800",
  },
  {
    slug: "ledgerist",
    name: "Your Ledger",
    category: "AI & SaaS",
    stack: ["React", "Vite", "Auth"],
    summary: "Personal finance ledger app with secure per-device sign-in.",
    detail:
      "A dark-mode SaaS ledger for tracking finances with email authentication, password recovery, and account creation. Built as a focused product UI — clean auth flows first, then a private data workspace once signed in.",
    url: "https://ledgerist.netlify.app/",
    image: ledgerist,
    gradient: "from-navy-900 to-sky-600",
    featured: 4,
  },
  {
    slug: "mrtex",
    name: "MR Tex",
    category: "Business & Corporate",
    stack: ["HTML", "CSS", "JS"],
    summary: "Apparel sourcing site for a Bangladesh garment buying house.",
    detail:
      "Strategic apparel sourcing for global brands — factory vetting, quality assurance, and shipment coordination. A dark, product-led corporate site with capabilities, case studies, and a clear path to start a conversation.",
    url: "https://mrtex.net/",
    image: mrtex,
    gradient: "from-navy-900 to-blue-600",
  },
  {
    slug: "walkercenter",
    name: "The Walker Center",
    category: "Nonprofit",
    stack: ["WordPress", "CMS", "SEO"],
    summary: "Trust-first nonprofit site for addiction recovery programs.",
    detail:
      "Helping thousands recover from addiction since 1976. Built around program discovery, admissions confidence, FAQ, and alumni community — with clear calls to explore treatment paths and get help now.",
    url: "https://www.thewalkercenter.org/",
    image: walkercenter,
    gradient: "from-slate-500 to-navy-800",
  },
  {
    slug: "wulfdesigns",
    name: "Wulf Designs",
    category: "Marketing",
    stack: ["WordPress", "CMS", "SEO"],
    summary: "Event lighting brand site from concept to on-site execution.",
    detail:
      "Expert lighting solutions for every event — creative design, technical expertise, and on-site support. A dark, high-impact marketing site with project showcases, services, testimonials, and a fast contact path.",
    url: "https://wulfdesigns.net/",
    image: wulfdesigns,
    gradient: "from-navy-900 to-coral-500",
  },
  {
    slug: "kashmirblue",
    name: "Kashmir Blue Energy",
    category: "Business & Corporate",
    stack: ["React", "Vite", "Tailwind"],
    summary: "Corporate site for expert oilfield and well services.",
    detail:
      "Expert oilfield services delivering reliable well solutions across the energy sector. A clear service-line structure covering work above and below ground, with safety, careers, and contact paths for operators who need a credible field partner.",
    url: "https://kashmirblue.netlify.app/",
    image: kashmirblue,
    gradient: "from-sky-500 to-navy-900",
  },
];

/** Featured projects for the homepage, sorted by pin order. */
export const FEATURED = PROJECTS.filter((p) => p.featured != null).sort(
  (a, b) => (a.featured ?? 0) - (b.featured ?? 0),
);

/** Portfolio list with featured pins first, then the rest in definition order. */
export function sortedProjects(list: Project[] = PROJECTS) {
  return [...list].sort((a, b) => {
    const af = a.featured ?? Number.POSITIVE_INFINITY;
    const bf = b.featured ?? Number.POSITIVE_INFINITY;
    if (af !== bf) return af - bf;
    return 0;
  });
}

export const CATEGORIES: ("All" | Category)[] = [
  "All",
  "AI & SaaS",
  "Media & Publishing",
  "Business & Corporate",
  "Marketing",
  "Nonprofit",
];
