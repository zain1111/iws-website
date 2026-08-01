/**
 * Dynamic XML sitemap of marketing pages + published blog posts.
 * Served at /sitemap.xml via Netlify redirect.
 */

import { createClient } from "@supabase/supabase-js";

function siteOrigin(req) {
  const fromEnv = (process.env.SITE_URL || process.env.URL || "").replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  try {
    return new URL(req.url).origin;
  } catch {
    return "https://theiwsolutions.com";
  }
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(loc, { lastmod, changefreq, priority } = {}) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>${lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ""}${
      changefreq ? `\n    <changefreq>${changefreq}</changefreq>` : ""
    }${priority ? `\n    <priority>${priority}</priority>` : ""}
  </url>`;
}

export default async (req) => {
  const origin = siteOrigin(req);
  const staticPages = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/blog", changefreq: "daily", priority: "0.9" },
    { path: "/portfolio", changefreq: "weekly", priority: "0.8" },
    { path: "/services", changefreq: "monthly", priority: "0.8" },
    { path: "/about", changefreq: "monthly", priority: "0.7" },
  ];

  const entries = staticPages.map((p) =>
    urlEntry(`${origin}${p.path === "/" ? "" : p.path}` || `${origin}/`, {
      changefreq: p.changefreq,
      priority: p.priority,
    }),
  );

  try {
    const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
    const key = (
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      ""
    ).trim();

    if (url && key) {
      const supabase = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data } = await supabase
        .from("blog_posts")
        .select("slug, published_at, updated_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      for (const post of data || []) {
        const lastmod = (post.updated_at || post.published_at || "").slice(0, 10);
        entries.push(
          urlEntry(`${origin}/${post.slug}`, {
            lastmod: lastmod || undefined,
            changefreq: "weekly",
            priority: "0.7",
          }),
        );
      }
    }
  } catch {
    /* return static pages even if DB fails */
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
};
