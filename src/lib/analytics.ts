declare global {
  interface Window {
    dataLayer?: IArguments[];
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

/** Send a GA4 custom event (no-ops if gtag isn't loaded). */
export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

/** Book-a-call CTA clicks. */
export function trackBookCall(location: string) {
  trackEvent("book_call_click", {
    event_category: "engagement",
    event_label: location,
    cta_location: location,
  });
}

/** Portfolio project card opened (external live site). */
export function trackPortfolioProject(project: {
  slug: string;
  name: string;
  category: string;
  source?: string;
}) {
  trackEvent("portfolio_project_click", {
    event_category: "portfolio",
    event_label: project.name,
    project_slug: project.slug,
    project_name: project.name,
    project_category: project.category,
    link_source: project.source ?? "portfolio",
  });
}

/** Homepage scroll milestones (25 / 50 / 75 / 90). */
export function trackScrollDepth(percent: number, page_path: string) {
  trackEvent("scroll_depth", {
    event_category: "engagement",
    percent_scrolled: percent,
    page_path,
  });
}
