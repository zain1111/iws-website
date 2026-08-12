import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import type { BlogAiRun, BlogAiSettings } from "../../types/database";

const defaultSettings: BlogAiSettings = {
  id: 1,
  enabled: false,
  schedule_hour_utc: 6,
  daily_article_count: 1,
  ai_topic_count: 1,
  last_scheduled_run_on: null,
  updated_at: new Date().toISOString(),
};

function formatHourUtc(hour: number) {
  return `${String(hour).padStart(2, "0")}:00 UTC`;
}

function formatHourLocal(hourUtc: number) {
  const d = new Date();
  d.setUTCHours(hourUtc, 0, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function AdminBlogAiPage() {
  const { isAdmin, session } = useAuth();
  const [runs, setRuns] = useState<BlogAiRun[]>([]);
  const [settings, setSettings] = useState<BlogAiSettings>(defaultSettings);
  const [busy, setBusy] = useState(false);
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [manualCount, setManualCount] = useState(3);

  const load = useCallback(async () => {
    const [runsRes, settingsRes] = await Promise.all([
      supabase.from("blog_ai_runs").select("*").order("created_at", { ascending: false }).limit(40),
      supabase.from("blog_ai_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    if (runsRes.error) setError(runsRes.error.message);
    if (settingsRes.error) setError(settingsRes.error.message);
    setRuns((runsRes.data as BlogAiRun[]) ?? []);
    if (settingsRes.data) {
      const s = settingsRes.data as BlogAiSettings;
      setSettings(s);
      setManualCount(s.daily_article_count);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const hourOptions = useMemo(() => Array.from({ length: 24 }, (_, h) => h), []);

  if (!isAdmin) return <Navigate to="/admin" replace />;

  async function saveSettings(e: FormEvent) {
    e.preventDefault();
    setSettingsBusy(true);
    setError(null);
    setMessage(null);

    const daily = Math.min(Math.max(Number(settings.daily_article_count) || 1, 1), 3);
    const aiCount = Math.min(Math.max(Number(settings.ai_topic_count) || 0, 0), daily);

    const { error: err } = await supabase.from("blog_ai_settings").upsert({
      id: 1,
      enabled: settings.enabled,
      schedule_hour_utc: Number(settings.schedule_hour_utc),
      daily_article_count: daily,
      ai_topic_count: aiCount,
      updated_at: new Date().toISOString(),
    });

    if (err) {
      setError(err.message);
    } else {
      setMessage("Schedule settings saved");
      setSettings((s) => ({ ...s, daily_article_count: daily, ai_topic_count: aiCount }));
      setManualCount(daily);
    }
    setSettingsBusy(false);
  }

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
        body: JSON.stringify({
          count: manualCount,
          aiTopicCount: Math.min(settings.ai_topic_count, manualCount),
        }),
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

  async function deleteRun(id: string) {
    if (!window.confirm("Delete this run log?")) return;
    const { error: err } = await supabase.from("blog_ai_runs").delete().eq("id", id);
    if (err) setError(err.message);
    else await load();
  }

  async function clearAllRuns() {
    if (!window.confirm("Delete all AI publisher run logs? This cannot be undone.")) return;
    const { error: err } = await supabase.from("blog_ai_runs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (err) setError(err.message);
    else {
      setMessage("All run logs cleared");
      await load();
    }
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl space-y-6">
      <div>
        <p className="font-mono text-xs text-coral-500 mb-2">// blog ai</p>
        <h1 className="font-display text-3xl text-navy-900 font-semibold">AI Publisher</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
          Finds trending SaaS / web / AI topics, writes SEO articles (600+ words), generates images,
          and publishes on your schedule. Keep auto-publish <strong>off</strong> while AdSense is
          under review — prefer fewer, human-edited posts.
        </p>
      </div>

      <form
        onSubmit={(e) => void saveSettings(e)}
        className="rounded-2xl border border-navy-900/10 bg-white p-6 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-slate-400 uppercase tracking-wide">
            Daily schedule
          </p>
          <label className="inline-flex items-center gap-2 font-display text-sm text-navy-900">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings((s) => ({ ...s, enabled: e.target.checked }))}
              className="rounded border-navy-900/30"
            />
            Auto-publish enabled
          </label>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <label className="block space-y-1">
            <span className="font-mono text-[10px] text-slate-400 uppercase">Run time (UTC)</span>
            <select
              value={settings.schedule_hour_utc}
              onChange={(e) =>
                setSettings((s) => ({ ...s, schedule_hour_utc: Number(e.target.value) }))
              }
              className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm bg-white"
            >
              {hourOptions.map((h) => (
                <option key={h} value={h}>
                  {formatHourUtc(h)} ≈ {formatHourLocal(h)} local
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="font-mono text-[10px] text-slate-400 uppercase">Articles / day</span>
            <select
              value={settings.daily_article_count}
              onChange={(e) => {
                const daily = Number(e.target.value);
                setSettings((s) => ({
                  ...s,
                  daily_article_count: daily,
                  ai_topic_count: Math.min(s.ai_topic_count, daily),
                }));
              }}
              className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm bg-white"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </label>

          <label className="block space-y-1">
            <span className="font-mono text-[10px] text-slate-400 uppercase">AI topics of those</span>
            <select
              value={Math.min(settings.ai_topic_count, settings.daily_article_count)}
              onChange={(e) =>
                setSettings((s) => ({ ...s, ai_topic_count: Number(e.target.value) }))
              }
              className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm bg-white"
            >
              {Array.from({ length: settings.daily_article_count + 1 }, (_, n) => (
                <option key={n} value={n}>
                  {n} of {settings.daily_article_count}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="font-mono text-[11px] text-slate-400 leading-relaxed">
          Scheduler checks every hour. When the UTC hour matches, it publishes once per day.
          {settings.last_scheduled_run_on
            ? ` Last scheduled run: ${settings.last_scheduled_run_on}.`
            : " No scheduled run yet."}
        </p>

        <button
          type="submit"
          disabled={settingsBusy}
          className="bg-navy-900 text-white font-display text-sm px-6 py-3 rounded-full hover:bg-coral-500 disabled:opacity-50"
        >
          {settingsBusy ? "Saving…" : "Save schedule settings"}
        </button>
      </form>

      <div className="rounded-2xl border border-navy-900/10 bg-white p-6 space-y-4">
        <p className="font-mono text-[11px] text-slate-400 uppercase tracking-wide">Manual run</p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block space-y-1">
            <span className="font-mono text-[10px] text-slate-400 uppercase">Articles</span>
            <select
              value={manualCount}
              onChange={(e) => setManualCount(Number(e.target.value))}
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
          Uses your saved “AI topics” quota (capped by this run’s article count).
        </p>
      </div>

      {error && <p className="font-mono text-xs text-coral-500">{error}</p>}
      {message && <p className="font-mono text-xs text-sky-500">{message}</p>}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg text-navy-900">Recent runs</h2>
          {runs.length > 0 && (
            <button
              type="button"
              onClick={() => void clearAllRuns()}
              className="font-mono text-[11px] text-coral-500 hover:underline"
            >
              Clear all logs
            </button>
          )}
        </div>
        <ul className="space-y-3">
          {runs.map((run) => (
            <li key={run.id} className="rounded-2xl border border-navy-900/10 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-navy-900">
                  {run.trigger} · {run.status}
                </p>
                <div className="flex items-center gap-3">
                  <p className="font-mono text-[11px] text-slate-400">
                    {new Date(run.created_at).toLocaleString()}
                  </p>
                  <button
                    type="button"
                    onClick={() => void deleteRun(run.id)}
                    className="font-mono text-[11px] text-coral-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
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
