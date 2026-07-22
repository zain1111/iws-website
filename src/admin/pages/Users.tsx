import { createClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { SUPER_ADMIN_EMAIL, supabase } from "../../lib/supabase";
import type { Profile, UserRole, UserStatus } from "../../types/database";
import { formatCnic } from "../lib/cnic";

type StatusFilter = "all" | UserStatus;

const STATUS_OPTIONS: UserStatus[] = ["pending", "approved", "rejected"];
const ROLE_OPTIONS: UserRole[] = ["member", "admin", "super_admin"];

/** Separate client so creating a user does not replace the admin session. */
function signupClient() {
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  return createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: "iws-admin-create-user",
    },
  });
}

export default function UsersPage() {
  const { isAdmin, isSuperAdmin, user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCnic, setNewCnic] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("member");
  const [creating, setCreating] = useState(false);

  const statusFilter = (searchParams.get("status") as StatusFilter) || "all";

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) {
      setError(err.message);
      setUsers([]);
    } else {
      setUsers((data as Profile[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (!q) return true;
      return (
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? "").toLowerCase().includes(q) ||
        (u.cnic ?? "").toLowerCase().includes(q)
      );
    });
  }, [users, query, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: users.length,
      pending: users.filter((u) => u.status === "pending").length,
      approved: users.filter((u) => u.status === "approved").length,
      rejected: users.filter((u) => u.status === "rejected").length,
    };
  }, [users]);

  if (!isAdmin) return <Navigate to="/admin" replace />;

  function setFilter(next: StatusFilter) {
    if (next === "all") setSearchParams({});
    else setSearchParams({ status: next });
  }

  async function createUser(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setMessage(null);

    const email = newEmail.trim().toLowerCase();
    const fullName = newName.trim();
    const phone = newPhone.trim() || null;
    const cnic = formatCnic(newCnic) || null;
    const password = newPassword;

    if (!fullName || !email || password.length < 6) {
      setError("Name, email, and a password (min 6 characters) are required.");
      setCreating(false);
      return;
    }

    if (newRole === "super_admin" && !isSuperAdmin) {
      setError("Only a super admin can create another super admin.");
      setCreating(false);
      return;
    }

    const client = signupClient();
    const { data, error: signErr } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (signErr || !data.user) {
      setError(signErr?.message ?? "Could not create user");
      setCreating(false);
      return;
    }

    // Profile is created by trigger; admin updates phone/status/role
    const { error: updErr } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        cnic,
        status: "approved",
        role: newRole === "super_admin" && !isSuperAdmin ? "member" : newRole,
      })
      .eq("id", data.user.id);

    setCreating(false);
    if (updErr) {
      setError(
        `Account created, but profile update failed: ${updErr.message}. Approve them manually below.`,
      );
      await load();
      return;
    }

    setMessage(`Created ${fullName} (${email}) — approved and ready to sign in.`);
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewCnic("");
    setNewPassword("");
    setNewRole("member");
    await load();
  }

  async function updateUser(
    id: string,
    patch: Partial<Pick<Profile, "status" | "role" | "full_name" | "phone" | "cnic">>,
  ) {
    const target = users.find((u) => u.id === id);
    if (!target) return;

    if (target.email === SUPER_ADMIN_EMAIL && patch.role && patch.role !== "super_admin") {
      setError("Cannot demote the founder super admin account.");
      return;
    }
    if (id === user?.id && patch.role && patch.role !== profile?.role) {
      setError("You can't change your own role here.");
      return;
    }
    if (patch.role === "super_admin" && !isSuperAdmin) {
      setError("Only a super admin can grant super admin.");
      return;
    }

    setSavingId(id);
    setError(null);
    setMessage(null);
    const { error: err } = await supabase.from("profiles").update(patch).eq("id", id);
    setSavingId(null);
    if (err) {
      setError(err.message);
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs text-coral-500 mb-2">// admin only</p>
        <h1 className="font-display text-3xl text-navy-900 font-semibold">Users</h1>
        <p className="text-slate-500 text-sm mt-2">
          Add members, set phone numbers, approve access, and manage roles.
        </p>
      </header>

      <form
        onSubmit={createUser}
        className="rounded-2xl border border-navy-900/10 bg-white p-6 space-y-4"
      >
        <h2 className="font-display text-lg text-navy-900">Add member</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Full name"
            className="rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500"
          />
          <input
            required
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Email"
            className="rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500"
          />
          <input
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="Phone number"
            className="rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-sm outline-none focus:border-coral-500"
          />
          <input
            value={newCnic}
            onChange={(e) => setNewCnic(formatCnic(e.target.value))}
            placeholder="CNIC (11111-1111111-1)"
            inputMode="numeric"
            maxLength={15}
            className="rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-sm outline-none focus:border-coral-500"
          />
          <input
            required
            type="password"
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Temporary password (min 6)"
            className="rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-sm outline-none focus:border-coral-500"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as UserRole)}
            className="rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm bg-white outline-none focus:border-coral-500"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            {isSuperAdmin && <option value="super_admin">Super admin</option>}
          </select>
        </div>
        <p className="font-mono text-[11px] text-slate-400">
          They can sign in immediately with this password (if email confirmation is off in Supabase).
        </p>
        <button
          type="submit"
          disabled={creating}
          className="bg-navy-900 text-white font-display text-sm px-6 py-2.5 rounded-full hover:bg-coral-500 disabled:opacity-60"
        >
          {creating ? "Creating…" : "Create user"}
        </button>
      </form>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["pending", "Pending"],
              ["approved", "Approved"],
              ["rejected", "Rejected"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`font-mono text-xs px-3 py-1.5 rounded-full border transition-colors ${
                statusFilter === key
                  ? "bg-navy-900 text-white border-navy-900"
                  : "border-navy-900/15 text-slate-500 hover:border-coral-500 hover:text-coral-500"
              }`}
            >
              {label} ({counts[key]})
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, phone, or CNIC…"
          className="w-full lg:w-72 rounded-xl border border-navy-900/15 bg-white px-4 py-2.5 font-display text-sm outline-none focus:border-coral-500"
        />
      </div>

      {error && (
        <p className="font-mono text-xs text-coral-500 bg-coral-500/5 border border-coral-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}
      {message && (
        <p className="font-mono text-xs text-sky-500 bg-sky-500/5 border border-sky-500/20 rounded-xl px-4 py-3">
          {message}
        </p>
      )}

      {loading ? (
        <p className="font-mono text-sm text-slate-400">Loading users…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy-900/15 p-10 text-center text-slate-400 text-sm">
          No users match this filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-navy-900/10 bg-white">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-navy-900/10 bg-paper/80">
                <th className="font-mono text-[10px] uppercase tracking-wide text-slate-500 px-5 py-3">
                  User
                </th>
                <th className="font-mono text-[10px] uppercase tracking-wide text-slate-500 px-3 py-3">
                  Phone
                </th>
                <th className="font-mono text-[10px] uppercase tracking-wide text-slate-500 px-3 py-3">
                  CNIC
                </th>
                <th className="font-mono text-[10px] uppercase tracking-wide text-slate-500 px-3 py-3">
                  Status
                </th>
                <th className="font-mono text-[10px] uppercase tracking-wide text-slate-500 px-3 py-3">
                  Role
                </th>
                <th className="font-mono text-[10px] uppercase tracking-wide text-slate-500 px-3 py-3">
                  Joined
                </th>
                <th className="font-mono text-[10px] uppercase tracking-wide text-slate-500 px-5 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isSelf = u.id === user?.id;
                const isFounder = u.email === SUPER_ADMIN_EMAIL;
                const busy = savingId === u.id;
                return (
                  <tr key={u.id} className="border-b border-navy-900/5 last:border-0 align-top">
                    <td className="px-5 py-4">
                      <p className="font-display text-navy-900">{u.full_name}</p>
                      <p className="font-mono text-xs text-slate-400 mt-0.5">{u.email}</p>
                      {isSelf && (
                        <span className="inline-block mt-1 font-mono text-[10px] text-sky-400">
                          you
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      <input
                        defaultValue={u.phone ?? ""}
                        key={`${u.id}-phone-${u.phone ?? ""}`}
                        disabled={busy}
                        placeholder="—"
                        onBlur={(e) => {
                          const next = e.target.value.trim() || null;
                          if (next !== (u.phone ?? null)) {
                            void updateUser(u.id, { phone: next });
                          }
                        }}
                        className="w-36 rounded-lg border border-navy-900/15 px-2 py-1.5 font-mono text-xs bg-white disabled:opacity-50"
                      />
                    </td>
                    <td className="px-3 py-4">
                      <input
                        defaultValue={formatCnic(u.cnic)}
                        key={`${u.id}-cnic-${u.cnic ?? ""}`}
                        disabled={busy}
                        placeholder="11111-1111111-1"
                        inputMode="numeric"
                        maxLength={15}
                        onChange={(e) => {
                          e.target.value = formatCnic(e.target.value);
                        }}
                        onBlur={(e) => {
                          const next = formatCnic(e.target.value) || null;
                          const prev = formatCnic(u.cnic) || null;
                          if (next !== prev) {
                            void updateUser(u.id, { cnic: next });
                          }
                        }}
                        className="w-40 rounded-lg border border-navy-900/15 px-2 py-1.5 font-mono text-xs bg-white disabled:opacity-50"
                      />
                    </td>
                    <td className="px-3 py-4">
                      <select
                        value={u.status}
                        disabled={busy || isFounder}
                        onChange={(e) =>
                          void updateUser(u.id, { status: e.target.value as UserStatus })
                        }
                        className="rounded-lg border border-navy-900/15 px-2 py-1.5 font-mono text-xs bg-white disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-4">
                      <select
                        value={u.role}
                        disabled={busy || isSelf || (isFounder && !isSuperAdmin)}
                        onChange={(e) =>
                          void updateUser(u.id, { role: e.target.value as UserRole })
                        }
                        className="rounded-lg border border-navy-900/15 px-2 py-1.5 font-mono text-xs bg-white disabled:opacity-50"
                      >
                        {ROLE_OPTIONS.filter(
                          (r) => r !== "super_admin" || isSuperAdmin || u.role === "super_admin",
                        ).map((r) => (
                          <option key={r} value={r}>
                            {r.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {u.status === "pending" && (
                          <>
                            <button
                              disabled={busy}
                              onClick={() => void updateUser(u.id, { status: "approved" })}
                              className="font-display text-xs bg-navy-900 text-white px-3 py-1.5 rounded-full hover:bg-coral-500 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              disabled={busy}
                              onClick={() => void updateUser(u.id, { status: "rejected" })}
                              className="font-display text-xs border border-navy-900/15 px-3 py-1.5 rounded-full hover:border-coral-500 hover:text-coral-500 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {u.status === "approved" && u.role === "member" && (
                          <button
                            disabled={busy || isSelf}
                            onClick={() => void updateUser(u.id, { role: "admin" })}
                            className="font-display text-xs border border-navy-900/15 px-3 py-1.5 rounded-full hover:border-sky-400 hover:text-sky-400 disabled:opacity-50"
                          >
                            Make admin
                          </button>
                        )}
                        {u.status === "approved" && u.role === "admin" && !isFounder && (
                          <button
                            disabled={busy || isSelf}
                            onClick={() => void updateUser(u.id, { role: "member" })}
                            className="font-display text-xs border border-navy-900/15 px-3 py-1.5 rounded-full hover:border-coral-500 hover:text-coral-500 disabled:opacity-50"
                          >
                            Make member
                          </button>
                        )}
                        {u.status === "rejected" && (
                          <button
                            disabled={busy}
                            onClick={() =>
                              void updateUser(u.id, { status: "approved", role: "member" })
                            }
                            className="font-display text-xs bg-navy-900 text-white px-3 py-1.5 rounded-full hover:bg-coral-500 disabled:opacity-50"
                          >
                            Restore access
                          </button>
                        )}
                        {busy && (
                          <span className="font-mono text-[10px] text-slate-400 self-center">
                            saving…
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
