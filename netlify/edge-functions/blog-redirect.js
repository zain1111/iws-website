/**
 * True HTTP 301 for deleted blog slugs → /blog (or stored target).
 * Skips known marketing routes, admin, assets, and static files.
 */

const RESERVED = new Set([
  "",
  "about",
  "services",
  "portfolio",
  "blog",
  "admin",
  "contact",
  "privacy",
  "terms",
  "login",
  "signup",
  "robots.txt",
  "sitemap.xml",
  "favicon.png",
  "index.html",
]);

export default async (request) => {
  if (request.method !== "GET" && request.method !== "HEAD") return;

  const url = new URL(request.url);
  const path = url.pathname;

  if (
    path.startsWith("/admin") ||
    path.startsWith("/assets") ||
    path.startsWith("/.netlify") ||
    path.includes(".")
  ) {
    return;
  }

  const slug = path.replace(/^\/+|\/+$/g, "");
  if (!slug || slug.includes("/") || RESERVED.has(slug)) return;

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("VITE_SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anon) return;

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/blog_redirects?slug=eq.${encodeURIComponent(slug)}&select=target&limit=1`,
      {
        headers: {
          apikey: anon,
          Authorization: `Bearer ${anon}`,
        },
      },
    );
    if (!res.ok) return;
    const rows = await res.json();
    const targetPath = rows?.[0]?.target;
    if (!targetPath) return;

    const location = targetPath.startsWith("http")
      ? targetPath
      : new URL(targetPath, url.origin).toString();

    return Response.redirect(location, 301);
  } catch {
    return;
  }
};

export const config = { path: "/*" };
