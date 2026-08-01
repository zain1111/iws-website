import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import type { BlogAdSlot } from "../../types/database";

export default function AdminBlogAdsPage() {
  const { isAdmin } = useAuth();
  const [slots, setSlots] = useState<BlogAdSlot[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from("blog_ad_slots").select("*").order("slot_key");
    if (err) setError(err.message);
    setSlots((data as BlogAdSlot[]) ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isAdmin) return <Navigate to="/admin" replace />;

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    const now = new Date().toISOString();
    const { error: err } = await supabase.from("blog_ad_slots").upsert(
      slots.map((s) => ({
        slot_key: s.slot_key,
        label: s.label,
        ad_code: s.ad_code,
        updated_at: now,
      })),
    );
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMessage("Ad codes saved — they appear on all blog pages.");
    await load();
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl space-y-6">
      <div>
        <p className="font-mono text-xs text-coral-500 mb-2">// blog ads</p>
        <h1 className="font-display text-3xl text-navy-900 font-semibold">Blog AdSense slots</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
          Paste the full AdSense unit code for each placement. These codes show on every blog post
          (and the listing banner). Leave a slot empty to hide that placement.
        </p>
      </div>

      {error && <p className="font-mono text-xs text-coral-500">{error}</p>}
      {message && <p className="font-mono text-xs text-sky-500">{message}</p>}

      <form onSubmit={save} className="space-y-5">
        {slots.map((slot, i) => (
          <label key={slot.slot_key} className="block rounded-2xl border border-navy-900/10 bg-white p-5 space-y-2">
            <span className="font-display text-navy-900">{slot.label}</span>
            <p className="font-mono text-[11px] text-slate-400">{slot.slot_key}</p>
            <textarea
              value={slot.ad_code}
              onChange={(e) => {
                const next = [...slots];
                next[i] = { ...slot, ad_code: e.target.value };
                setSlots(next);
              }}
              rows={5}
              placeholder='Paste AdSense <ins class="adsbygoogle">… code here'
              className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-xs outline-none focus:border-coral-500"
            />
          </label>
        ))}

        {slots.length === 0 && (
          <p className="text-sm text-slate-500">
            No ad slots found. Run <code className="font-mono text-xs">supabase/add_blog.sql</code> in
            Supabase first.
          </p>
        )}

        <button
          type="submit"
          disabled={busy || slots.length === 0}
          className="bg-navy-900 text-white font-display text-sm px-6 py-3 rounded-full hover:bg-coral-500 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save ad codes"}
        </button>
      </form>
    </div>
  );
}
