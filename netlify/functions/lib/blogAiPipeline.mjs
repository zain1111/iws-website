/**
 * AI blog publisher pipeline — NewsAPI topics + Gemini article/SEO + Cloudflare Flux image.
 * Used by Netlify functions (manual + scheduled).
 */

import { createClient } from "@supabase/supabase-js";

const RESERVED = new Set([
  "about",
  "services",
  "portfolio",
  "blog",
  "admin",
  "contact",
  "login",
  "signup",
]);

function env(name, fallback = "") {
  return (process.env[name] || fallback).trim();
}

function slugify(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function wordCount(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

function supabaseAdmin() {
  const url = env("SUPABASE_URL") || env("VITE_SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function geminiGenerate(prompt, { json = false } = {}) {
  const key = env("GEMINI_API_KEY");
  if (!key) throw new Error("Missing GEMINI_API_KEY");

  // gemini-2.0-flash free-tier quota is 0 (retired); use 2.5 Flash by default
  const model = env("GEMINI_MODEL", "gemini-2.5-flash");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 8192,
      ...(json ? { responseMimeType: "application/json" } : {}),
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Gemini error ${res.status}`);
  }
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  if (!text) throw new Error("Gemini returned empty content");
  return text;
}

async function fetchTrendSeeds() {
  const key = env("NEWS_API_KEY");
  const seeds = [];

  if (key) {
    const queries = [
      { q: "artificial intelligence OR generative AI OR LLM", bucket: "ai" },
      { q: "SaaS OR software as a service OR B2B software", bucket: "saas" },
      { q: "web development OR frontend OR web design OR Next.js", bucket: "web" },
    ];
    for (const { q, bucket } of queries) {
      try {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&sortBy=publishedAt&pageSize=8&apiKey=${encodeURIComponent(key)}`;
        const res = await fetch(url);
        const data = await res.json();
        for (const article of data.articles || []) {
          if (!article.title || article.title === "[Removed]") continue;
          seeds.push({
            bucket,
            title: article.title,
            description: article.description || "",
            source: article.source?.name || "NewsAPI",
            url: article.url || "",
          });
        }
      } catch {
        /* continue with other queries / Gemini fallback */
      }
    }
  }

  if (seeds.length < 3) {
    const fallback = await geminiGenerate(
      `List 6 currently trending article angles for a web agency blog. Return JSON array of objects with keys: bucket ("ai"|"saas"|"web"), title, description. Include at least 2 "ai" items. No markdown.`,
      { json: true },
    );
    const parsed = JSON.parse(fallback.replace(/^```json\s*|\s*```$/g, ""));
    for (const item of parsed) {
      seeds.push({
        bucket: item.bucket || "ai",
        title: item.title,
        description: item.description || "",
        source: "Gemini trends",
        url: "",
      });
    }
  }

  return seeds;
}

function pickTopics(seeds, count = 3) {
  const ai = seeds.filter((s) => s.bucket === "ai");
  const saas = seeds.filter((s) => s.bucket === "saas");
  const web = seeds.filter((s) => s.bucket === "web");
  const picked = [];

  const take = (arr) => {
    while (arr.length && picked.length < count) {
      const i = Math.floor(Math.random() * arr.length);
      picked.push(arr.splice(i, 1)[0]);
    }
  };

  // Guarantee at least one AI article
  take(ai.length ? ai : seeds);
  take(saas);
  take(web);
  take(seeds.filter((s) => !picked.includes(s)));
  return picked.slice(0, count);
}

async function generateArticle(topic) {
  const prompt = `You are an expert B2B content strategist and SEO writer for Integrated Web Solutions (IWS), a web design & engineering agency.

Write an original blog article inspired by this trending seed (do NOT plagiarize; rewrite into practical agency-angled insight):
Bucket: ${topic.bucket}
Headline seed: ${topic.title}
Context: ${topic.description}
Source hint: ${topic.source}

Return ONLY valid JSON with these keys:
- title (compelling, SEO-friendly, under 70 chars)
- slug (kebab-case, no reserved words: about,services,portfolio,blog,admin)
- excerpt (140-170 chars)
- content (markdown-lite: use ## and ### headings, short paragraphs, - bullet lists, optional > quotes. MINIMUM 650 words. Include intro, 3-5 H2 sections, practical takeaways, conclusion. Natural keyword usage.)
- meta_title (under 60 chars)
- meta_description (140-160 chars, with CTA)
- focus_keyword (2-4 words)
- image_alt (descriptive alt text)
- image_prompt (detailed Flux image prompt: modern tech editorial illustration, no text/logos/watermarks, 16:9, professional)

Audience: founders, marketers, and product teams. Tone: clear, expert, no fluff.`;

  let raw = await geminiGenerate(prompt, { json: true });
  raw = raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
  let article = JSON.parse(raw);

  if (wordCount(article.content) < 600) {
    const expand = await geminiGenerate(
      `Expand this blog article to at least 650 words while keeping the same JSON schema and improving SEO. Return JSON only.\n\n${JSON.stringify(article)}`,
      { json: true },
    );
    article = JSON.parse(expand.replace(/^```json\s*/i, "").replace(/\s*```$/i, ""));
  }

  let slug = slugify(article.slug || article.title);
  if (!slug || RESERVED.has(slug)) slug = `${slugify(article.title)}-${Date.now().toString(36)}`;
  article.slug = slug;
  article.source_topic = `${topic.bucket}: ${topic.title}`;
  return article;
}

async function generateImage(prompt) {
  const account = env("CLOUDFLARE_ACCOUNT_ID");
  const token = env("CLOUDFLARE_API_TOKEN");
  if (!account || !token) throw new Error("Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN");

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: String(prompt).slice(0, 2000),
        steps: 4,
      }),
    },
  );
  const data = await res.json();
  if (!res.ok || !data?.success) {
    throw new Error(data?.errors?.[0]?.message || `Cloudflare AI error ${res.status}`);
  }
  const b64 = data.result?.image;
  if (!b64) throw new Error("Cloudflare AI returned no image");
  return Buffer.from(b64, "base64");
}

async function resolveAuthorId(supabase) {
  const configured = env("BLOG_AI_AUTHOR_ID");
  if (configured) return configured;

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .in("role", ["super_admin", "admin"])
    .eq("status", "approved")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data?.id) throw new Error("No admin profile found for BLOG_AI_AUTHOR_ID");
  return data.id;
}

async function uniqueSlug(supabase, base) {
  let slug = base;
  for (let i = 0; i < 8; i++) {
    const { data } = await supabase.from("blog_posts").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${base}-${i + 2}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/**
 * @param {{ trigger?: 'manual'|'schedule', count?: number, createdBy?: string|null }} opts
 */
export async function runBlogAiPipeline(opts = {}) {
  const trigger = opts.trigger || "manual";
  const count = Math.min(Math.max(opts.count || 3, 1), 3);
  const supabase = supabaseAdmin();
  const authorId = opts.createdBy || (await resolveAuthorId(supabase));
  const log = [];

  const { data: runRow, error: runErr } = await supabase
    .from("blog_ai_runs")
    .insert({
      status: "running",
      trigger,
      articles_requested: count,
      articles_published: 0,
      log: [],
      created_by: opts.createdBy || null,
    })
    .select("*")
    .single();
  if (runErr) throw new Error(runErr.message);

  const runId = runRow.id;
  const published = [];

  try {
    log.push({ step: "trends", message: "Fetching trending seeds" });
    const seeds = await fetchTrendSeeds();
    const topics = pickTopics(seeds, count);
    log.push({ step: "topics", message: "Selected topics", topics: topics.map((t) => t.title) });

    for (const topic of topics) {
      try {
        log.push({ step: "generate", topic: topic.title });
        const article = await generateArticle(topic);
        article.slug = await uniqueSlug(supabase, article.slug);

        log.push({ step: "image", slug: article.slug });
        const imageBuf = await generateImage(article.image_prompt);
        const imagePath = `ai/${article.slug}-${Date.now()}.jpg`;
        const { error: upErr } = await supabase.storage.from("blog-images").upload(imagePath, imageBuf, {
          contentType: "image/jpeg",
          upsert: false,
        });
        if (upErr) throw new Error(upErr.message);

        const now = new Date().toISOString();
        const { data: post, error: insErr } = await supabase
          .from("blog_posts")
          .insert({
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt || "",
            content: article.content,
            featured_image_path: imagePath,
            status: "published",
            fiverr_url: null,
            upwork_url: null,
            published_at: now,
            created_by: authorId,
            updated_at: now,
            meta_title: article.meta_title || article.title,
            meta_description: article.meta_description || article.excerpt || "",
            focus_keyword: article.focus_keyword || "",
            image_alt: article.image_alt || article.title,
            source_topic: article.source_topic,
            ai_generated: true,
          })
          .select("id, title, slug")
          .single();
        if (insErr) throw new Error(insErr.message);

        published.push(post);
        log.push({ step: "published", slug: post.slug, title: post.title });
      } catch (err) {
        log.push({
          step: "article_error",
          topic: topic.title,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    const status =
      published.length === 0 ? "failed" : published.length < count ? "partial" : "success";

    await supabase
      .from("blog_ai_runs")
      .update({
        status,
        articles_published: published.length,
        log,
        finished_at: new Date().toISOString(),
        error: published.length === 0 ? "No articles published" : null,
      })
      .eq("id", runId);

    return { runId, status, published, log };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.push({ step: "fatal", error: message });
    await supabase
      .from("blog_ai_runs")
      .update({
        status: "failed",
        articles_published: published.length,
        log,
        error: message,
        finished_at: new Date().toISOString(),
      })
      .eq("id", runId);
    throw err;
  }
}

export async function assertAuthorized(req) {
  const cronSecret = env("BLOG_AI_CRON_SECRET");
  const headerSecret = req.headers.get("x-cron-secret") || "";
  if (cronSecret && headerSecret && headerSecret === cronSecret) {
    return { mode: "cron", userId: null };
  }

  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) throw new Error("Unauthorized");

  const url = env("SUPABASE_URL") || env("VITE_SUPABASE_URL");
  const anon = env("SUPABASE_ANON_KEY") || env("VITE_SUPABASE_ANON_KEY");
  const service = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !service) throw new Error("Supabase env incomplete");

  const userClient = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) throw new Error("Invalid session");

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, status")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile || profile.status !== "approved" || !["admin", "super_admin"].includes(profile.role)) {
    throw new Error("Admin only");
  }
  return { mode: "admin", userId: profile.id };
}
