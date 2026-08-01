import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import type { BlogAiRun } from "../../types/database";

export default function AdminBlogAiPage() {
  const { isAdmin, session } = useAuth();
  const [runs, setRuns] = useState<BlogAiRun[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [count, setCount] = useState(3);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("blog_ai_runs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (err) setError(err.message);
    setRuns((data as BlogAiRun[]) ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isAdmin) return <Navigate to="/admin" replace />;

  async function runNow() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const token = session?.access_token;
      if (!token) throw new Error("Not signed in");

      const res = await fetch("/.netlify/functions/blog-ai-publish", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ count }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");

      setMessage(
        `Done (${data.status}): published ${data.published?.length ?? 0} article(s)` +
          (data.published?.length
            ? ` — ${data.published.map((p: { slug: string }) => `/${p.slug}`).join(", ")}`
            : ""),
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not run publisher");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl space-y-6">
      <div>
        <p className="font-mono text-xs text-coral-500 mb-2">// blog ai</p>
        <h1 className="font-display text-3xl text-navy-900 font-semibold">AI Publisher</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
          Finds trending SaaS / web / AI topics (NewsAPI + Gemini), writes 600+ word SEO articles,
          generates featured images (Cloudflare Flux), and publishes them automatically. Scheduled
          daily at 06:00 UTC for up to 3 posts (at least one AI topic).
        </p>
      </div>

      <div className="rounded-2xl border border-navy-900/10 bg-white p-6 space-y-4">
        <p className="font-mono text-[11px] text-slate-400 uppercase tracking-wide">Manual run</p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block space-y-1">
            <span className="font-mono text-[10px] text-slate-400 uppercase">Articles</span>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="block rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm bg-white"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => void runNow()}
            className="bg-navy-900 text-white font-display text-sm px-6 py-3 rounded-full hover:bg-coral-500 disabled:opacity-50"
          >
            {busy ? "Publishing… (1–3 min)" : "Generate & publish now"}
          </button>
        </div>
        <p className="font-mono text-[11px] text-slate-400">
          Requires Netlify env: GEMINI_API_KEY, NEWS_API_KEY, CLOUDFLARE_ACCOUNT_ID,
          CLOUDFLARE_API_TOKEN, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL, BLOG_AI_AUTHOR_ID (optional).
        </p>
      </div>

      {error && <p className="font-mono text-xs text-coral-500">{error}</p>}
      {message && <p className="font-mono text-xs text-sky-500">{message}</p>}

      <section className="space-y-3">
        <h2 className="font-display text-lg text-navy-900">Recent runs</h2>
        <ul className="space-y-3">
          {runs.map((run) => (
            <li
              key={run.id}
              className="rounded-2xl border border-navy-900/10 bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-navy-900">
                  {run.trigger} · {run.status}
                </p>
                <p className="font-mono text-[11px] text-slate-400">
                  {new Date(run.created_at).toLocaleString()}
                </p>
              </div>
              <p className="font-mono text-xs text-slate-500 mt-2">
                Published {run.articles_published}/{run.articles_requested}
                {run.error ? ` · ${run.error}` : ""}
              </p>
              {Array.isArray(run.log) && run.log.length > 0 && (
                <details className="mt-3">
                  <summary className="font-mono text-[11px] text-coral-500 cursor-pointer">
                    View log
                  </summary>
                  <pre className="mt-2 max-h-48 overflow-auto rounded-xl bg-navy-900/5 p-3 font-mono text-[10px] text-slate-600">
                    {JSON.stringify(run.log, null, 2)}
                  </pre>
                </details>
              )}
            </li>
          ))}
          {runs.length === 0 && (
            <li className="text-sm text-slate-500 font-display">
              No runs yet.{" "}
              <Link to="/admin/blog" className="text-coral-500 hover:underline">
                Blog posts
              </Link>{" "}
              stay available for manual editing.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
