import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import type {
  AttachmentKind,
  Client,
  Message,
  MessageAttachment,
  Profile,
  Project,
  ProjectMember,
  Task,
  TaskStatus,
} from "../../types/database";
import { loadApprovedMembers } from "./Projects";

function detectKind(url: string): AttachmentKind {
  if (/docs\.google\.com\/spreadsheets/i.test(url)) return "google_sheet";
  if (/docs\.google\.com\/document/i.test(url)) return "google_doc";
  return "link";
}

function billToName(client: Client) {
  return client.company?.trim() || client.name;
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In progress",
  ready_for_you: "Ready for you",
  done: "Completed",
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [project, setProject] = useState<(Project & { client?: Client | null }) | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [members, setMembers] = useState<(ProjectMember & { profile?: Profile })[]>([]);
  const [allPeople, setAllPeople] = useState<Profile[]>([]);
  const [tasks, setTasks] = useState<(Task & { assignee?: Profile | null })[]>([]);
  const [messages, setMessages] = useState<(Message & { profile?: Profile; attachments?: MessageAttachment[] })[]>([]);
  const [body, setBody] = useState("");
  const [attachUrl, setAttachUrl] = useState("");
  const [attachLabel, setAttachLabel] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [addMemberId, setAddMemberId] = useState("");
  const [clientBusy, setClientBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const loadMessages = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from("messages")
      .select("*, profile:profiles(*), attachments:message_attachments(*)")
      .eq("project_id", id)
      .order("created_at", { ascending: true });
    const next = (data as Message[]) ?? [];
    setMessages((prev) => {
      const changed =
        prev.length !== next.length ||
        prev[prev.length - 1]?.id !== next[next.length - 1]?.id ||
        prev[prev.length - 1]?.body !== next[next.length - 1]?.body;
      if (changed) {
        requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
      }
      return next;
    });
  }, [id]);

  const loadTasks = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from("tasks")
      .select("*, assignee:profiles!tasks_assigned_to_fkey(*)")
      .eq("project_id", id)
      .order("created_at", { ascending: false });
    setTasks((data as (Task & { assignee?: Profile | null })[]) ?? []);
  }, [id]);

  const loadMembers = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from("project_members")
      .select("*, profile:profiles(*)")
      .eq("project_id", id);
    setMembers((data as (ProjectMember & { profile?: Profile })[]) ?? []);
  }, [id]);

  const notifyPeers = useCallback(async (event: "chat" | "tasks" | "members") => {
    const channel = channelRef.current;
    if (!channel) return;
    await channel.send({
      type: "broadcast",
      event,
      payload: { at: Date.now() },
    });
  }, []);

  const load = useCallback(async () => {
    if (!id) return;
    const [p, people, clientRows] = await Promise.all([
      supabase.from("projects").select("*, client:clients(*)").eq("id", id).single(),
      isAdmin ? loadApprovedMembers() : Promise.resolve([]),
      isAdmin
        ? supabase.from("clients").select("*").order("name")
        : Promise.resolve({ data: [] as Client[], error: null }),
    ]);
    setProject(p.data as (Project & { client?: Client | null }) | null);
    setAllPeople(people);
    setClients((clientRows.data as Client[]) ?? []);
    await Promise.all([loadMembers(), loadTasks(), loadMessages()]);
  }, [id, isAdmin, loadMembers, loadTasks, loadMessages]);

  useEffect(() => {
    void load();
  }, [load]);

  // Live sync: broadcast (instant) + short poll fallback (reliable)
  useEffect(() => {
    if (!id) return;
    let active = true;

    async function connect() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        await supabase.realtime.setAuth(session.access_token);
      }
      if (!active) return;

      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      const channel = supabase
        .channel(`project-chat-${id}`, {
          config: { broadcast: { self: false } },
        })
        .on("broadcast", { event: "chat" }, () => {
          void loadMessages();
        })
        .on("broadcast", { event: "tasks" }, () => {
          void loadTasks();
        })
        .on("broadcast", { event: "members" }, () => {
          void loadMembers();
        })
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "messages", filter: `project_id=eq.${id}` },
          () => {
            void loadMessages();
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "tasks", filter: `project_id=eq.${id}` },
          () => {
            void loadTasks();
          },
        )
        .subscribe();

      channelRef.current = channel;
    }

    void connect();

    // Fallback so chat still updates if Realtime/publication is misconfigured
    const poll = window.setInterval(() => {
      void loadMessages();
    }, 2000);

    return () => {
      active = false;
      window.clearInterval(poll);
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [id, loadMessages, loadTasks, loadMembers]);

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!user || !id || !body.trim()) return;
    setError(null);
    const { data, error: err } = await supabase
      .from("messages")
      .insert({ project_id: id, user_id: user.id, body: body.trim() })
      .select()
      .single();
    if (err || !data) {
      setError(err?.message ?? "Could not send message");
      return;
    }

    if (attachUrl.trim()) {
      await supabase.from("message_attachments").insert({
        message_id: data.id,
        label: attachLabel.trim() || "Attachment",
        url: attachUrl.trim(),
        kind: detectKind(attachUrl.trim()),
      });
    }
    setBody("");
    setAttachUrl("");
    setAttachLabel("");
    await loadMessages();
    await notifyPeers("chat");
  }

  async function addMember(e: FormEvent) {
    e.preventDefault();
    if (!id || !addMemberId) return;
    await supabase.from("project_members").insert({ project_id: id, user_id: addMemberId });
    setAddMemberId("");
    await loadMembers();
    await notifyPeers("members");
  }

  async function removeMember(member: ProjectMember & { profile?: Profile }) {
    if (!isAdmin) return;
    const name = member.profile?.full_name ?? "this member";
    if (!window.confirm(`Remove ${name} from this project?`)) return;
    const { error: err } = await supabase.from("project_members").delete().eq("id", member.id);
    if (err) {
      setError(err.message);
      return;
    }
    await loadMembers();
    await notifyPeers("members");
  }

  async function createTask(e: FormEvent) {
    e.preventDefault();
    if (!user || !id || !taskTitle.trim()) return;
    await supabase.from("tasks").insert({
      project_id: id,
      title: taskTitle.trim(),
      assigned_to: taskAssignee || null,
      created_by: user.id,
      status: "todo" as TaskStatus,
    });
    setTaskTitle("");
    setTaskAssignee("");
    await loadTasks();
    await notifyPeers("tasks");
  }

  async function setTaskStatus(taskId: string, status: TaskStatus) {
    const { error: err } = await supabase.from("tasks").update({ status }).eq("id", taskId);
    if (err) {
      setError(err.message);
      return;
    }
    await loadTasks();
    await notifyPeers("tasks");
  }

  async function deleteTask(task: Task) {
    if (!isAdmin) return;
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    const { error: err } = await supabase.from("tasks").delete().eq("id", task.id);
    if (err) {
      setError(err.message);
      return;
    }
    await loadTasks();
    await notifyPeers("tasks");
  }

  async function deleteProject() {
    if (!isAdmin || !id || !project) return;
    const ok = window.confirm(
      `Delete project "${project.title}"? Messages, tasks, and memberships will be removed. This cannot be undone.`,
    );
    if (!ok) return;
    const { error: err } = await supabase.from("projects").delete().eq("id", id);
    if (err) {
      setError(err.message);
      return;
    }
    navigate("/admin/projects");
  }

  async function updateProjectClient(nextClientId: string) {
    if (!id || !isAdmin) return;
    setClientBusy(true);
    await supabase
      .from("projects")
      .update({ client_id: nextClientId || null })
      .eq("id", id);
    setClientBusy(false);
    await load();
  }

  if (!project) {
    return <p className="font-mono text-sm text-slate-400">Loading project…</p>;
  }

  const memberIds = new Set(members.map((m) => m.user_id));
  const candidates = allPeople.filter((p) => !memberIds.has(p.id));

  function canMemberAdvance(task: Task) {
    return Boolean(user && task.assigned_to === user.id);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/admin/projects" className="font-mono text-xs text-slate-400 hover:text-coral-500">
            ← Projects
          </Link>
          <h1 className="font-display text-3xl text-navy-900 font-semibold mt-2">{project.title}</h1>
          {project.description && <p className="text-slate-500 mt-2 max-w-2xl">{project.description}</p>}
          {project.client && (
            <p className="font-mono text-xs text-coral-500 mt-2">
              Client: {billToName(project.client)}
              {isAdmin && project.client.email ? ` · ${project.client.email}` : ""}
            </p>
          )}
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => void deleteProject()}
            className="border border-coral-500/40 text-coral-500 font-display text-sm px-4 py-2 rounded-full hover:bg-coral-500 hover:text-white"
          >
            Delete project
          </button>
        )}
      </div>

      {error && <p className="font-mono text-xs text-coral-500">{error}</p>}

      {isAdmin && (
        <section className="rounded-2xl border border-navy-900/10 bg-white p-5 space-y-3 max-w-xl">
          <h2 className="font-display text-lg text-navy-900">Linked client</h2>
          <select
            value={project.client_id ?? ""}
            disabled={clientBusy}
            onChange={(e) => void updateProjectClient(e.target.value)}
            className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500 bg-white disabled:opacity-60"
          >
            <option value="">No client linked</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company ? `${c.name} (${c.company})` : c.name}
              </option>
            ))}
          </select>
          <p className="font-mono text-[11px] text-slate-400">
            Manage clients in{" "}
            <Link to="/admin/clients" className="text-coral-500 hover:underline">
              Clients
            </Link>
            . Linked clients can be pulled into invoices.
          </p>
        </section>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <section className="rounded-2xl border border-navy-900/10 bg-white flex flex-col min-h-[480px]">
          <div className="px-5 py-4 border-b border-navy-900/10">
            <h2 className="font-display text-lg text-navy-900">Team conversation</h2>
            <p className="font-mono text-[11px] text-slate-400 mt-1">Live updates · attach Google Docs or Sheets</p>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[420px]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.user_id === user?.id ? "items-end" : "items-start"}`}>
                <p className="font-mono text-[10px] text-slate-400 mb-1">
                  {msg.profile?.full_name ?? "Member"} · {new Date(msg.created_at).toLocaleString()}
                </p>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.user_id === user?.id ? "bg-navy-900 text-white" : "bg-paper text-navy-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.body}</p>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {msg.attachments.map((a) => (
                        <li key={a.id}>
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`font-mono text-xs underline underline-offset-2 ${
                              msg.user_id === user?.id ? "text-sky-300" : "text-coral-500"
                            }`}
                          >
                            {a.kind === "google_sheet" ? "Sheet" : a.kind === "google_doc" ? "Doc" : "Link"}: {a.label} ↗
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={sendMessage} className="p-4 border-t border-navy-900/10 space-y-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={2}
              placeholder="Write a message…"
              className="w-full rounded-xl border border-navy-900/15 px-3 py-2 font-display text-sm outline-none focus:border-coral-500"
            />
            <div className="grid sm:grid-cols-2 gap-2">
              <input
                value={attachLabel}
                onChange={(e) => setAttachLabel(e.target.value)}
                placeholder="Attachment label (optional)"
                className="rounded-xl border border-navy-900/15 px-3 py-2 font-mono text-xs outline-none focus:border-coral-500"
              />
              <input
                value={attachUrl}
                onChange={(e) => setAttachUrl(e.target.value)}
                placeholder="Google Docs / Sheets URL"
                className="rounded-xl border border-navy-900/15 px-3 py-2 font-mono text-xs outline-none focus:border-coral-500"
              />
            </div>
            <button type="submit" className="bg-coral-500 text-white font-display text-sm px-5 py-2 rounded-full hover:bg-coral-400">
              Send
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-navy-900/10 bg-white p-5">
            <h3 className="font-display text-navy-900 mb-3">Members</h3>
            <ul className="space-y-2 mb-4">
              {members.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-slate-600 truncate">
                    {m.profile?.full_name ?? m.user_id.slice(0, 8)}
                  </span>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => void removeMember(m)}
                      className="font-mono text-[10px] text-coral-500 hover:underline shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {isAdmin && (
              <form onSubmit={addMember} className="space-y-2">
                <select
                  value={addMemberId}
                  onChange={(e) => setAddMemberId(e.target.value)}
                  className="w-full rounded-xl border border-navy-900/15 px-3 py-2 font-mono text-xs"
                >
                  <option value="">Add member…</option>
                  {candidates.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.email})
                    </option>
                  ))}
                </select>
                <button type="submit" className="w-full bg-navy-900 text-white font-display text-xs py-2 rounded-full">
                  Add to project
                </button>
              </form>
            )}
          </section>

          <section className="rounded-2xl border border-navy-900/10 bg-white p-5">
            <h3 className="font-display text-navy-900 mb-3">Tasks</h3>
            {isAdmin && (
              <form onSubmit={createTask} className="space-y-2 mb-4">
                <input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  placeholder="Task title"
                  className="w-full rounded-xl border border-navy-900/15 px-3 py-2 font-display text-sm"
                />
                <select
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full rounded-xl border border-navy-900/15 px-3 py-2 font-mono text-xs"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.profile?.full_name}
                    </option>
                  ))}
                </select>
                <button type="submit" className="w-full bg-coral-500 text-white font-display text-xs py-2 rounded-full">
                  Assign task
                </button>
              </form>
            )}
            <ul className="space-y-3">
              {tasks.map((t) => {
                const isAssignee = canMemberAdvance(t);
                return (
                  <li key={t.id} className="border-t border-navy-900/5 pt-3">
                    <p className="font-display text-sm text-navy-900">{t.title}</p>
                    <p className="font-mono text-[10px] text-slate-400 mt-1">
                      {t.assignee?.full_name ?? "Unassigned"} · {STATUS_LABEL[t.status] ?? t.status}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {isAssignee && t.status === "todo" && (
                        <button
                          type="button"
                          onClick={() => void setTaskStatus(t.id, "in_progress")}
                          className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-navy-900 text-white"
                        >
                          Start → In progress
                        </button>
                      )}
                      {isAssignee && t.status === "in_progress" && (
                        <button
                          type="button"
                          onClick={() => void setTaskStatus(t.id, "ready_for_you")}
                          className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-coral-500 text-white"
                        >
                          Mark ready for you
                        </button>
                      )}
                      {isAssignee && t.status === "ready_for_you" && (
                        <span className="font-mono text-[10px] text-sky-500">Waiting on admin review</span>
                      )}

                      {isAdmin && t.status !== "done" && (
                        <button
                          type="button"
                          onClick={() => void setTaskStatus(t.id, "done")}
                          className="font-mono text-[10px] px-2.5 py-1 rounded-full border border-navy-900/15 text-navy-900 hover:bg-navy-900 hover:text-white"
                        >
                          Mark completed
                        </button>
                      )}
                      {isAdmin && t.status === "done" && (
                        <span className="font-mono text-[10px] text-slate-400">Completed</span>
                      )}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => void deleteTask(t)}
                          className="font-mono text-[10px] px-2.5 py-1 rounded-full border border-coral-500/40 text-coral-500 hover:bg-coral-500 hover:text-white"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
