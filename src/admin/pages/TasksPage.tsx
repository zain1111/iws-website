import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import type { Task, TaskStatus } from "../../types/database";

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In progress",
  ready_for_you: "Ready for you",
  done: "Completed",
};

export default function TasksPage() {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    let q = supabase
      .from("tasks")
      .select("*, project:projects(id,title), assignee:profiles!assigned_to(id,full_name)")
      .order("created_at", { ascending: false });

    if (!isAdmin) {
      q = q.eq("assigned_to", user.id);
    }

    const { data } = await q;
    setTasks((data as Task[]) ?? []);
  }, [user, isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(id: string, status: TaskStatus) {
    await supabase.from("tasks").update({ status }).eq("id", id);
    await load();
  }

  async function deleteTask(task: Task) {
    if (!isAdmin) return;
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    await supabase.from("tasks").delete().eq("id", task.id);
    await load();
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs text-coral-500 mb-2">// tasks</p>
        <h1 className="font-display text-3xl text-navy-900 font-semibold">
          {isAdmin ? "All tasks" : "My tasks"}
        </h1>
      </header>

      <ul className="space-y-3">
        {tasks.map((t) => (
          <li
            key={t.id}
            className="rounded-2xl border border-navy-900/10 bg-white p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
          >
            <div>
              <p className="font-display text-lg text-navy-900">{t.title}</p>
              <p className="font-mono text-xs text-slate-400 mt-1">
                {t.project ? (
                  <Link
                    to={`/admin/projects/${(t.project as { id: string }).id}`}
                    className="text-coral-500 hover:underline"
                  >
                    {(t.project as { title: string }).title}
                  </Link>
                ) : (
                  "No project"
                )}
                {" · "}
                {(t.assignee as { full_name?: string } | null)?.full_name ?? "Unassigned"}
                {" · "}
                {STATUS_LABEL[t.status] ?? t.status}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {!isAdmin && t.status === "todo" && (
                <button
                  type="button"
                  onClick={() => void setStatus(t.id, "in_progress")}
                  className="font-mono text-[11px] px-3 py-1 rounded-full bg-navy-900 text-white"
                >
                  Start → In progress
                </button>
              )}
              {!isAdmin && t.status === "in_progress" && (
                <button
                  type="button"
                  onClick={() => void setStatus(t.id, "ready_for_you")}
                  className="font-mono text-[11px] px-3 py-1 rounded-full bg-coral-500 text-white"
                >
                  Ready for you
                </button>
              )}
              {!isAdmin && t.status === "ready_for_you" && (
                <span className="font-mono text-[11px] text-sky-500 px-2">Waiting on admin</span>
              )}
              {isAdmin && t.status !== "done" && (
                <button
                  type="button"
                  onClick={() => void setStatus(t.id, "done")}
                  className="font-mono text-[11px] px-3 py-1 rounded-full border border-navy-900/15 hover:bg-navy-900 hover:text-white"
                >
                  Mark completed
                </button>
              )}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => void deleteTask(t)}
                  className="font-mono text-[11px] px-3 py-1 rounded-full border border-coral-500/40 text-coral-500"
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {tasks.length === 0 && <p className="font-mono text-sm text-slate-400">No tasks yet.</p>}
    </div>
  );
}
