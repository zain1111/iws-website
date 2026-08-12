/**
 * Dynamic sitemap at /sitemap.xml (Edge — runs before SPA redirects).
 */

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

export default async (request) => {
  const origin = new URL(request.url).origin;
  const staticPages = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/blog", changefreq: "daily", priority: "0.9" },
    { path: "/portfolio", changefreq: "weekly", priority: "0.8" },
    { path: "/portfolio/bionicvo", changefreq: "monthly", priority: "0.75" },
    { path: "/portfolio/ricekids", changefreq: "monthly", priority: "0.75" },
    { path: "/portfolio/humanistai", changefreq: "monthly", priority: "0.75" },
    { path: "/portfolio/ledgerist", changefreq: "monthly", priority: "0.75" },
    { path: "/portfolio/vanguard", changefreq: "monthly", priority: "0.75" },
    { path: "/services", changefreq: "monthly", priority: "0.8" },
    { path: "/about", changefreq: "monthly", priority: "0.7" },
    { path: "/contact", changefreq: "monthly", priority: "0.7" },
    { path: "/privacy", changefreq: "yearly", priority: "0.3" },
    { path: "/terms", changefreq: "yearly", priority: "0.3" },
  ];

  const entries = staticPages.map((p) =>
    urlEntry(p.path === "/" ? `${origin}/` : `${origin}${p.path}`, {
      changefreq: p.changefreq,
      priority: p.priority,
    }),
  );

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("VITE_SUPABASE_ANON_KEY");

  if (supabaseUrl && anon) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/blog_posts?status=eq.published&select=slug,published_at,updated_at&order=published_at.desc`,
        {
          headers: {
            apikey: anon,
            Authorization: `Bearer ${anon}`,
          },
        },
      );
      if (res.ok) {
        const posts = await res.json();
        for (const post of posts || []) {
          const lastmod = String(post.updated_at || post.published_at || "").slice(0, 10);
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
      /* static pages only */
    }
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

export const config = { path: "/sitemap.xml" };
