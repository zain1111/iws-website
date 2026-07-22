import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import type { Client, Project } from "../../types/database";

type FormMode = "create" | "edit";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  notes: "",
};

export default function ClientsPage() {
  const { user, isAdmin } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [mode, setMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [c, p] = await Promise.all([
      supabase.from("clients").select("*").order("name"),
      supabase.from("projects").select("*").order("title"),
    ]);
    if (c.error) setError(c.error.message);
    setClients((c.data as Client[]) ?? []);
    setProjects((p.data as Project[]) ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!isAdmin) return <Navigate to="/admin" replace />;

  function resetForm() {
    setMode("create");
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  function fillFromClient(client: Client) {
    setMode("edit");
    setEditingId(client.id);
    setForm({
      name: client.name,
      email: client.email ?? "",
      phone: client.phone ?? "",
      company: client.company ?? "",
      address: client.address ?? "",
      notes: client.notes ?? "",
    });
    setError(null);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveClient(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setError(null);
    setMessage(null);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
    };

    if (!payload.name) {
      setError("Client name is required");
      setBusy(false);
      return;
    }

    if (mode === "edit" && editingId) {
      const { error: err } = await supabase.from("clients").update(payload).eq("id", editingId);
      setBusy(false);
      if (err) {
        setError(err.message);
        return;
      }
      setMessage("Client updated");
      resetForm();
      await load();
      return;
    }

    const { error: err } = await supabase.from("clients").insert({
      ...payload,
      created_by: user.id,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMessage("Client saved");
    resetForm();
    await load();
  }

  async function deleteClient(client: Client) {
    const linked = projects.filter((p) => p.client_id === client.id);
    const ok = window.confirm(
      linked.length
        ? `Delete ${client.name}? ${linked.length} project(s) will be unlinked.`
        : `Delete ${client.name}? This cannot be undone.`,
    );
    if (!ok) return;

    const { error: err } = await supabase.from("clients").delete().eq("id", client.id);
    if (err) {
      setError(err.message);
      return;
    }
    if (editingId === client.id) resetForm();
    setMessage(`Deleted ${client.name}`);
    await load();
  }

  function projectsFor(clientId: string) {
    return projects.filter((p) => p.client_id === clientId);
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs text-coral-500 mb-2">// admin only</p>
        <h1 className="font-display text-3xl text-navy-900 font-semibold">Clients</h1>
        <p className="text-slate-500 text-sm mt-2">
          Store client details, link them to projects, and pull them into invoices.
        </p>
      </header>

      <form onSubmit={saveClient} className="rounded-2xl border border-navy-900/10 bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg text-navy-900">
            {mode === "edit" ? "Edit client" : "New client"}
          </h2>
          {mode === "edit" && (
            <button
              type="button"
              onClick={() => resetForm()}
              className="font-mono text-xs text-slate-500 hover:text-coral-500"
            >
              Cancel edit
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Client / contact name"
            className="rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500"
          />
          <input
            value={form.company}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            placeholder="Company (optional)"
            className="rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500"
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Email"
            className="rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500"
          />
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="Phone"
            className="rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500"
          />
        </div>
        <textarea
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          placeholder="Address (optional)"
          rows={2}
          className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500"
        />
        <textarea
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Internal notes (optional)"
          rows={2}
          className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500"
        />

        {error && <p className="font-mono text-xs text-coral-500">{error}</p>}
        {message && <p className="font-mono text-xs text-sky-500">{message}</p>}
        <button
          type="submit"
          disabled={busy}
          className="bg-navy-900 text-white font-display text-sm px-6 py-2.5 rounded-full hover:bg-coral-500 disabled:opacity-60"
        >
          {busy ? "Saving…" : mode === "edit" ? "Update client" : "Save client"}
        </button>
      </form>

      <ul className="space-y-3">
        {clients.map((client) => {
          const linked = projectsFor(client.id);
          return (
            <li
              key={client.id}
              className="rounded-2xl border border-navy-900/10 bg-white p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div>
                <p className="font-display text-lg text-navy-900">{client.name}</p>
                {client.company && (
                  <p className="font-mono text-xs text-sky-400 mt-0.5">{client.company}</p>
                )}
                <p className="font-mono text-xs text-slate-400 mt-1">
                  {[client.email, client.phone].filter(Boolean).join(" · ") || "No contact yet"}
                </p>
                {linked.length > 0 && (
                  <p className="text-xs text-slate-500 mt-2 font-display">
                    Projects: {linked.map((p) => p.title).join(", ")}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fillFromClient(client)}
                  className="border border-navy-900/15 font-display text-sm px-4 py-2 rounded-full hover:border-coral-500 hover:text-coral-500"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void deleteClient(client)}
                  className="border border-coral-500/40 text-coral-500 font-display text-sm px-4 py-2 rounded-full hover:bg-coral-500 hover:text-white"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
        {clients.length === 0 && (
          <li className="text-sm text-slate-500 font-display">No clients yet.</li>
        )}
      </ul>
    </div>
  );
}
