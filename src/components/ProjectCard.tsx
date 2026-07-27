import { ArrowUpRight } from "lucide-react";
import type { Project } from "../data/projects";
import Parallax from "./Parallax";

interface ProjectCardProps {
  project: Project;
  /** Dark surface (home Work section) vs light surface (portfolio page). */
  theme?: "light" | "dark";
  /** Tighter card for multi-item carousels. */
  compact?: boolean;
}

export default function ProjectCard({ project, theme = "light", compact = false }: ProjectCardProps) {
  const dark = theme === "dark";
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border transition-colors duration-300 ${
        dark
          ? "border-white/10 bg-navy-800/40 hover:border-white/25"
          : "border-navy-900/10 bg-white hover:border-navy-900/25"
      }`}
    >
      {/* Media: live screenshot drifts on scroll, or a branded gradient tile */}
      <div
        className={`relative overflow-hidden bg-navy-900 ${compact ? "aspect-[16/11]" : "aspect-[16/10]"}`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient}`} aria-hidden />
        {project.image ? (
          <Parallax y={compact ? 14 : 26} className="absolute -inset-y-[10%] inset-x-0">
            <img
              src={project.image}
              alt={`${project.name} website`}
              loading="lazy"
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </Parallax>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
            <span
              className={`font-display font-semibold text-white/90 ${
                compact ? "text-2xl" : "text-5xl"
              }`}
            >
              {project.name}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/40 transition-colors duration-300" />
        <span
          className={`absolute top-3 right-3 flex items-center justify-center rounded-full bg-white/90 text-navy-900 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ${
            compact ? "h-8 w-8" : "h-10 w-10"
          }`}
        >
          <ArrowUpRight size={compact ? 14 : 18} />
        </span>
        <div
          className={`absolute top-0 left-0 bg-coral-500 ${compact ? "w-9 h-9" : "w-12 h-12"}`}
          style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
          aria-hidden
        />
      </div>

      {/* Body */}
      <div className={`flex flex-1 flex-col ${compact ? "p-4" : "p-6"}`}>
        <p className={`font-mono text-xs text-coral-500 ${compact ? "mb-1.5" : "mb-3"}`}>
          {project.category}
        </p>
        <h3
          className={`font-display ${compact ? "text-base mb-1" : "text-xl mb-2"} ${
            dark ? "text-white" : "text-navy-900"
          }`}
        >
          {project.name}
        </h3>
        <p
          className={`leading-relaxed ${compact ? "text-xs line-clamp-2" : "text-sm"} ${
            dark ? "text-slate-300" : "text-slate-500"
          }`}
        >
          {project.summary}
        </p>
        {!compact && (
          <div className="mt-5 flex flex-wrap gap-2">
            {project.stack.map((t) => (
              <span
                key={t}
                className={`font-mono text-[11px] px-2.5 py-1 rounded-full ${
                  dark ? "bg-white/10 text-slate-300" : "bg-navy-900/5 text-slate-500"
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}
