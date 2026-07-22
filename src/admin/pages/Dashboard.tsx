import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import type { StickyNote, Task } from "../../types/database";
import StickyNotesBoard from "../components/StickyNotesBoard";

export default function Dashboard() {
  const { profile, user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [taskRes, noteRes] = await Promise.all([
      supabase
        .from("tasks")
        .select("*, project:projects(id,title)")
        .eq("assigned_to", user.id)
        .neq("status", "done")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("sticky_notes")
        .select("*")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true }),
    ]);
    setTasks((taskRes.data as Task[]) ?? []);
    setNotes((noteRes.data as StickyNote[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-10">
      <header>
        <p className="font-mono text-xs text-coral-500 mb-2">// dashboard</p>
        <h1 className="font-display text-3xl lg:text-4xl text-navy-900 font-semibold">
          Welcome back, {profile?.full_name?.split(" ")[0] ?? "team"}
        </h1>
        <p className="text-slate-500 mt-2 max-w-xl">
          Sticky notes for your own headspace. Tasks assigned to you show up below.
          {!isAdmin && (
            <>
              {" "}
              Your salary slips live in{" "}
              <Link to="/admin/salaries" className="text-coral-500 hover:underline">
                Salaries
              </Link>
              .
            </>
          )}
        </p>
      </header>

      <section>
        <div className="flex items-end justify-between gap-4 mb-4">
          <h2 className="font-display text-xl text-navy-900">Sticky notes</h2>
          <p className="font-mono text-[11px] text-slate-400">Private to you</p>
        </div>
        <StickyNotesBoard notes={notes} userId={user!.id} onChange={setNotes} />
      </section>

      <section>
        <div className="flex items-end justify-between gap-4 mb-4">
          <h2 className="font-display text-xl text-navy-900">Your open tasks</h2>
          <Link to="/admin/tasks" className="font-mono text-xs text-coral-500 hover:text-coral-400">
            View all →
          </Link>
        </div>
        {loading ? (
          <p className="font-mono text-sm text-slate-400">Loading…</p>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-navy-900/15 p-8 text-center text-slate-500 text-sm">
            No open tasks assigned to you yet.
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-4">
            {tasks.map((t) => (
              <li key={t.id} className="rounded-2xl border border-navy-900/10 bg-white p-5">
                <p className="font-mono text-[10px] text-coral-500 uppercase tracking-wide mb-2">{t.status}</p>
                <p className="font-display text-lg text-navy-900">{t.title}</p>
                {t.project && (
                  <p className="font-mono text-xs text-slate-400 mt-2">
                    {(t.project as { title?: string }).title}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {isAdmin && (
        <section className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/admin/users"
            className="rounded-2xl bg-navy-900 text-white p-6 hover:bg-navy-800 transition-colors"
          >
            <p className="font-mono text-xs text-sky-400 mb-2">Admin</p>
            <p className="font-display text-xl">Manage users →</p>
          </Link>
          <Link
            to="/admin/invoices"
            className="rounded-2xl border border-navy-900/10 bg-white p-6 hover:border-coral-500 transition-colors"
          >
            <p className="font-mono text-xs text-coral-500 mb-2">Admin</p>
            <p className="font-display text-xl text-navy-900">Create invoices →</p>
          </Link>
        </section>
      )}
    </div>
  );
}
