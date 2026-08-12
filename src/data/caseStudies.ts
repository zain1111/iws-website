/**
 * Long-form case studies for AdSense / SEO depth.
 * Slugs must match `PROJECTS` in projects.ts.
 */

export interface CaseStudy {
  slug: string;
  /** Short label under the title */
  role: string;
  challenge: string;
  approach: string[];
  outcome: string;
  deliverables: string[];
  timeline: string;
  highlights: { label: string; value: string }[];
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "bionicvo",
    role: "Product web application",
    challenge:
      "BionicVO needed a production web app for professional voice cloning — not a marketing brochure. Actors had to audition, buyers needed to browse samples and run cloning flows, and the whole experience had to feel fast and trustworthy for a media product still in active development.",
    approach: [
      "Mapped the core loops first: browse talent, clone a voice, manage an account, and apply as an actor — then designed UI around those jobs.",
      "Built the application in Next.js with clear route boundaries so marketing, app shell, and account flows could evolve independently.",
      "Prioritized performance and empty states so early users never hit a dead end while features were still shipping.",
      "Kept visual design restrained so the product felt like a tool, not a hype landing page.",
    ],
    outcome:
      "A staging-ready application surface the team can iterate on: sample browsing, cloning entry points, actor onboarding, and account management wired for real usage — engineered for a clean hand-off to ongoing product work.",
    deliverables: [
      "App IA & primary user flows",
      "Next.js / React UI implementation",
      "Actor apply & account surfaces",
      "Performance-minded front-end structure",
    ],
    timeline: "Multi-sprint product build",
    highlights: [
      { label: "Type", value: "AI SaaS app" },
      { label: "Stack", value: "Next.js · Node · React" },
      { label: "Focus", value: "Cloning + onboarding" },
    ],
  },
  {
    slug: "ricekids",
    role: "Nonprofit marketing site",
    challenge:
      "Rice Kids needed a story-led website that could turn first-time visitors into donors without burying the mission under clutter. The organization touches hundreds of thousands of lives through education — the site had to carry that weight while keeping donation paths obvious on mobile.",
    approach: [
      "Led with impact narrative: hero, project stories, and proof points before asking for money.",
      "Designed low-friction donation and contact paths that stay visible across key pages.",
      "Structured news/media and program sections so the nonprofit can publish without developer help.",
      "Built on a modern React stack for speed and maintainability.",
    ],
    outcome:
      "A live nonprofit presence that balances emotional storytelling with clear conversion paths — donors can understand the work and act in a few taps.",
    deliverables: [
      "Brand-aligned site design",
      "Impact & program storytelling",
      "Donation / support pathways",
      "Next.js implementation",
    ],
    timeline: "Design + build engagement",
    highlights: [
      { label: "Type", value: "Nonprofit" },
      { label: "Stack", value: "Next.js · React · Tailwind" },
      { label: "Focus", value: "Donations + stories" },
    ],
  },
  {
    slug: "humanistai",
    role: "Editorial publishing platform",
    challenge:
      "The Humanist AI needed a high-cadence editorial site covering people and ideas in AI — with topic hubs, podcasts, and events — that a lean team could run daily without touching code.",
    approach: [
      "Designed an editorial system around featured stories, topic taxonomy, and recurring content types.",
      "Implemented a CMS-backed theme so writers can publish, categorize, and update without engineering.",
      "Tuned SEO foundations (titles, structure, internal hubs) for a growing news archive.",
      "Kept the reading experience clean so long-form and short news both feel intentional.",
    ],
    outcome:
      "A living publication the team can ship to every day — structured for growth, not a one-off brochure that collapses under volume.",
    deliverables: [
      "Editorial IA & templates",
      "CMS theme implementation",
      "Topic hubs & content types",
      "On-page SEO foundations",
    ],
    timeline: "Platform + launch content",
    highlights: [
      { label: "Type", value: "Media / publishing" },
      { label: "Stack", value: "CMS · Custom theme · SEO" },
      { label: "Focus", value: "Daily publishing" },
    ],
  },
  {
    slug: "ledgerist",
    role: "SaaS product UI",
    challenge:
      "Your Ledger needed a focused personal-finance app experience: secure sign-in, recovery, and a private workspace — without bloating the first release with features that distract from the core ledger job.",
    approach: [
      "Started with auth as a product surface: email sign-in, recovery, and account creation that feel polished on day one.",
      "Designed a dark-mode workspace optimized for scanning numbers and recurring entries.",
      "Kept the stack lean (React + Vite) so the client could iterate quickly after hand-off.",
      "Separated marketing concerns from the authenticated app shell.",
    ],
    outcome:
      "A credible SaaS entry point — users can create an account, recover access, and land in a private ledger UI ready for ongoing feature work.",
    deliverables: [
      "Auth & recovery flows",
      "Dark-mode product UI",
      "React / Vite app shell",
      "Hand-off ready structure",
    ],
    timeline: "MVP product sprint",
    highlights: [
      { label: "Type", value: "Fintech SaaS" },
      { label: "Stack", value: "React · Vite · Auth" },
      { label: "Focus", value: "Secure workspace" },
    ],
  },
  {
    slug: "vanguard",
    role: "Brand + conversion site",
    challenge:
      "Vanguard Student Labs needed a premium site for an elite student capstone incubator — cinematic enough to feel exclusive, clear enough to explain Founder / Author / Scholar tracks, and direct enough to drive private consultations.",
    approach: [
      "Built a conversion narrative: cinematic hero → track stories → outcomes → private inquiry.",
      "Wrote and designed track pages so ambitious students instantly see which path fits.",
      "Implemented in React/Vite/Tailwind for a fast, modern marketing stack.",
      "Kept consultation CTAs persistent without turning the page into a form farm.",
    ],
    outcome:
      "A live brand site that sells the incubator’s ambition while making the next step — a private consultation — obvious.",
    deliverables: [
      "Brand marketing site",
      "Track narratives & outcomes",
      "Consultation conversion path",
      "React implementation",
    ],
    timeline: "Brand site engagement",
    highlights: [
      { label: "Type", value: "Education brand" },
      { label: "Stack", value: "React · Vite · Tailwind" },
      { label: "Focus", value: "Consultations" },
    ],
  },
];

export const CASE_STUDY_SLUGS = new Set(CASE_STUDIES.map((c) => c.slug));

export function getCaseStudy(slug: string) {
  return CASE_STUDIES.find((c) => c.slug === slug) ?? null;
}
