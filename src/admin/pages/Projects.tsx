import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import type { Client, Profile, Project } from "../../types/database";

export default function ProjectsPage() {
  const { user, isAdmin } = useAuth();
  const [projects, setProjects] = useState<(Project & { client?: Client | null })[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([
      supabase
        .from("projects")
        .select("*, client:clients(*)")
        .order("created_at", { ascending: false }),
      isAdmin
        ? supabase.from("clients").select("*").order("name")
        : Promise.resolve({ data: [] as Client[], error: null }),
    ]);
    setProjects((p.data as (Project & { client?: Client | null })[]) ?? []);
    setClients((c.data as Client[]) ?? []);
  }, [isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createProject(e: FormEvent) {
    e.preventDefault();
    if (!user || !isAdmin) return;
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("projects")
      .insert({
        title: title.trim(),
        description: description.trim() || null,
        client_id: clientId || null,
        created_by: user.id,
        status: "active",
      })
      .select()
      .single();

    if (err || !data) {
      setError(err?.message ?? "Failed to create project");
      setBusy(false);
      return;
    }

    await supabase.from("project_members").insert({ project_id: data.id, user_id: user.id });
    setTitle("");
    setDescription("");
    setClientId("");
    setBusy(false);
    await load();
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs text-coral-500 mb-2">// projects</p>
        <h1 className="font-display text-3xl text-navy-900 font-semibold">Projects</h1>
      </header>

      {isAdmin && (
        <form onSubmit={createProject} className="rounded-2xl border border-navy-900/10 bg-white p-6 space-y-4">
          <h2 className="font-display text-lg text-navy-900">Start a project</h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Project title"
            className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short brief (optional)"
            rows={3}
            className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500"
          />
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500 bg-white"
          >
            <option value="">No client linked</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company ? `${c.name} (${c.company})` : c.name}
              </option>
            ))}
          </select>
          {clients.length === 0 && (
            <p className="font-mono text-[11px] text-slate-400">
              Add clients in{" "}
              <Link to="/admin/clients" className="text-coral-500 hover:underline">
                Clients
              </Link>{" "}
              first to link them here.
            </p>
          )}
          {error && <p className="font-mono text-xs text-coral-500">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="bg-navy-900 text-white font-display text-sm px-5 py-2.5 rounded-full hover:bg-coral-500 disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create project"}
          </button>
        </form>
      )}

      <ul className="grid sm:grid-cols-2 gap-4">
        {projects.map((p) => (
          <li key={p.id}>
            <Link
              to={`/admin/projects/${p.id}`}
              className="block rounded-2xl border border-navy-900/10 bg-white p-6 h-full hover:border-coral-500 transition-colors"
            >
              <p className="font-mono text-[10px] text-sky-400 uppercase tracking-wide mb-2">{p.status}</p>
              <h3 className="font-display text-xl text-navy-900">{p.title}</h3>
              {p.client && (
                <p className="font-mono text-xs text-coral-500 mt-2">
                  Client: {p.client.company || p.client.name}
                </p>
              )}
              {p.description && <p className="text-sm text-slate-500 mt-2 line-clamp-2">{p.description}</p>}
            </Link>
          </li>
        ))}
      </ul>
      {projects.length === 0 && (
        <p className="text-slate-400 text-sm font-mono">No projects yet.</p>
      )}
    </div>
  );
}

export async function loadApprovedMembers(): Promise<Profile[]> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("status", "approved")
    .order("full_name");
  return (data as Profile[]) ?? [];
}
