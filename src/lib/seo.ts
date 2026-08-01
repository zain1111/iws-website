const SITE_NAME = "Integrated Web Solutions";
const DEFAULT_TITLE = "Integrated Web Solutions — Websites that ship, not just launch";
const SITE_ORIGIN =
  typeof window !== "undefined" ? window.location.origin : "https://theiwsolutions.com";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(id: string, data: Record<string, unknown>) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export type BlogSeoInput = {
  title: string;
  slug: string;
  excerpt?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  focus_keyword?: string | null;
  image_alt?: string | null;
  featured_image_url?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
};

/** Apply on-page SEO tags for a blog post (SPA-friendly). Returns a cleanup fn. */
export function applyBlogPostSeo(post: BlogSeoInput) {
  const title = (post.meta_title || post.title).trim();
  const description = (post.meta_description || post.excerpt || "").trim().slice(0, 160);
  const url = `${SITE_ORIGIN}/${post.slug}`;
  const image = post.featured_image_url || undefined;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;

  const prevTitle = document.title;
  document.title = fullTitle;

  upsertMeta("name", "description", description);
  if (post.focus_keyword) upsertMeta("name", "keywords", post.focus_keyword);

  upsertMeta("property", "og:type", "article");
  upsertMeta("property", "og:site_name", SITE_NAME);
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:url", url);
  if (image) upsertMeta("property", "og:image", image);

  upsertMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", description);
  if (image) upsertMeta("name", "twitter:image", image);

  upsertLink("canonical", url);

  upsertJsonLd("blog-post-jsonld", {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: image ? [image] : undefined,
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at || post.published_at || undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_ORIGIN,
    },
    keywords: post.focus_keyword || undefined,
  });

  return () => {
    document.title = prevTitle || DEFAULT_TITLE;
    document.getElementById("blog-post-jsonld")?.remove();
  };
}
