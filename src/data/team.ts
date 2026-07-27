import zain from "../assets/team/zain.png";
import noreen from "../assets/team/noreen.jpeg";
import saffa from "../assets/team/saffa.jpeg";
import roumena from "../assets/team/roumena.jpeg";
import mohsin from "../assets/team/mohsin.jpeg";
import ahmed from "../assets/team/ahmed-ali.png";
import bilal from "../assets/team/bilal-faisal.png";
import { CONTACT } from "./contact";

export interface TeamMember {
  name: string;
  role: string;
  image: string;
  linkedin?: string;
  /** When true, shown in the dedicated founder block instead of the team grid. */
  founder?: boolean;
}

export const FOUNDER: TeamMember = {
  name: "Zain Azeem",
  role: "Founder / Project Manager",
  image: zain,
  linkedin: CONTACT.linkedin,
  founder: true,
};

export const TEAM: TeamMember[] = [
  {
    name: "Bilal Faisal",
    role: "Co Founder / Principal Software Architect",
    image: bilal,
  },
  {
    name: "Noreen Shoukat",
    role: "Operational Manager",
    image: noreen,
  },
  {
    name: "Roumena K.",
    role: "Digital Marketing Expert",
    image: roumena,
  },
  {
    name: "Saffa Imran",
    role: "Business Developer",
    image: saffa,
  },
  {
    name: "Mohsin Riaz",
    role: "Senior Developer",
    image: mohsin,
  },
  {
    name: "Ahmed Ali",
    role: "Social Media Expert",
    image: ahmed,
  },
];

export const COMPANY_STATS = [
  { value: "350+", label: "Projects delivered" },
  { value: "200+", label: "Happy clients" },
  { value: "12+", label: "Skilled experts" },
  { value: "8+", label: "Years of expertise" },
] as const;

export const VALUES = [
  "Performance-driven builds",
  "Scalable architecture",
  "User-centric design",
  "Seamless functionality",
  "Optimized for growth",
  "Reliable & secure delivery",
] as const;
