import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import type { Client, Invoice, InvoiceItem, InvoiceStatus, Project } from "../../types/database";
import {
  downloadInvoicePdf,
  emptyItem,
  invoiceTotal,
  normalizeItems,
  viewInvoicePdf,
} from "../lib/invoicePdf";

type FormMode = "create" | "edit";
type PageView = "list" | "form";

const STATUS_OPTIONS: InvoiceStatus[] = ["draft", "sent", "paid"];

function billToName(client: Client) {
  return client.company?.trim() || client.name;
}

function monthLabel(date: Date) {
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function monthName(date: Date) {
  return date.toLocaleString("en-US", { month: "long" });
}

function shiftMonth(base: Date, delta: number) {
  return new Date(base.getFullYear(), base.getMonth() + delta, 1);
}

/** e.g. July-August 2026, or December 2025-January 2026 across years */
function monthRangeLabel(from: Date, to: Date) {
  if (from.getFullYear() === to.getFullYear()) {
    return `${monthName(from)}-${monthName(to)} ${to.getFullYear()}`;
  }
  return `${monthLabel(from)}-${monthLabel(to)}`;
}

type DescriptionPresetId =
  | ""
  | "post_last"
  | "advance_current"
  | "post_last_current"
  | "advance_current_next"
  | "custom";

function descriptionPresets(reference = new Date()) {
  const current = monthLabel(reference);
  const last = shiftMonth(reference, -1);
  const next = shiftMonth(reference, 1);

  return [
    {
      id: "post_last" as const,
      label: "Post Payment of last month",
      value: `Post Payment of ${monthLabel(last)}`,
    },
    {
      id: "advance_current" as const,
      label: "Advance Payment of current month",
      value: `Advance Payment of ${current}`,
    },
    {
      id: "post_last_current" as const,
      label: "Post Payment of last and current month",
      value: `Post Payment of ${monthRangeLabel(last, reference)}`,
    },
    {
      id: "advance_current_next" as const,
      label: "Advance Payment of current and next month",
      value: `Advance Payment of ${monthRangeLabel(reference, next)}`,
    },
  ];
}

function matchDescriptionPreset(description: string): DescriptionPresetId {
  const trimmed = description.trim();
  if (!trimmed) return "";
  const match = descriptionPresets().find((p) => p.value === trimmed);
  return match?.id ?? "custom";
}

function suggestInvoiceNumber() {
  return `IWS-${Date.now().toString().slice(-8)}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function parseIssueDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function sumByCurrency(rows: Invoice[]) {
  const map = new Map<string, number>();
  for (const inv of rows) {
    const cur = inv.currency || "USD";
    map.set(cur, (map.get(cur) ?? 0) + invoiceTotal(inv.items));
  }
  return map;
}

function formatMoneyMap(map: Map<string, number>) {
  if (map.size === 0) return "USD 0.00";
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([cur, amount]) => `${cur} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    .join(" · ");
}

export default function InvoicesPage() {
  const { user, isAdmin } = useAuth();
  const [view, setView] = useState<PageView>("list");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<(Project & { client?: Client | null })[]>([]);
  const [mode, setMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [invoiceNumber, setInvoiceNumber] = useState(suggestInvoiceNumber);
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [issueDate, setIssueDate] = useState(todayIso);
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [status, setStatus] = useState<InvoiceStatus>("draft");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);
  const [busy, setBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState<string | null>(null);
  const [pdfAction, setPdfAction] = useState<"view" | "download" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [inv, clientRows, projectRows] = await Promise.all([
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("*").order("name"),
      supabase.from("projects").select("*, client:clients(*)").order("title"),
    ]);
    if (inv.error) {
      setError(inv.error.message);
      setInvoices([]);
    } else {
      const rows = ((inv.data as Invoice[]) ?? []).map((row) => ({
        ...row,
        items: normalizeItems(row.items),
      }));
      setInvoices(rows);
    }
    setClients((clientRows.data as Client[]) ?? []);
    setProjects((projectRows.data as (Project & { client?: Client | null })[]) ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const paidThisMonth = invoices.filter((inv) => {
      if (inv.status !== "paid") return false;
      const d = parseIssueDate(inv.issue_date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const outstanding = invoices.filter((inv) => inv.status === "sent" || inv.status === "draft");
    const sentOnly = outstanding.filter((inv) => inv.status === "sent");
    const pendingOnly = outstanding.filter((inv) => inv.status === "draft");

    const paidYtd = invoices.filter((inv) => {
      if (inv.status !== "paid") return false;
      const d = parseIssueDate(inv.issue_date);
      return d.getFullYear() === year;
    });

    return {
      monthLabel: monthLabel(now),
      year,
      monthPaid: formatMoneyMap(sumByCurrency(paidThisMonth)),
      monthPaidCount: paidThisMonth.length,
      outstanding: formatMoneyMap(sumByCurrency(outstanding)),
      sent: formatMoneyMap(sumByCurrency(sentOnly)),
      pending: formatMoneyMap(sumByCurrency(pendingOnly)),
      sentCount: sentOnly.length,
      pendingCount: pendingOnly.length,
      ytd: formatMoneyMap(sumByCurrency(paidYtd)),
      ytdCount: paidYtd.length,
    };
  }, [invoices]);

  if (!isAdmin) return <Navigate to="/admin" replace />;

  function applyClient(client: Client | null | undefined) {
    if (!client) {
      setClientId("");
      return;
    }
    setClientId(client.id);
    setClientName(billToName(client));
    setClientEmail(client.email ?? "");
  }

  function selectSavedClient(id: string) {
    setClientId(id);
    if (!id) return;
    const client = clients.find((c) => c.id === id);
    if (client) {
      setClientName(billToName(client));
      setClientEmail(client.email ?? "");
    }
  }

  function selectProject(id: string) {
    setProjectId(id);
    if (!id) return;
    const project = projects.find((p) => p.id === id);
    if (project?.client) applyClient(project.client);
    else if (project?.client_id) {
      const client = clients.find((c) => c.id === project.client_id);
      applyClient(client);
    }
  }

  function resetForm(nextNumber = suggestInvoiceNumber()) {
    setMode("create");
    setEditingId(null);
    setInvoiceNumber(nextNumber);
    setClientId("");
    setProjectId("");
    setClientName("");
    setClientEmail("");
    setIssueDate(todayIso());
    setDueDate("");
    setCurrency("USD");
    setStatus("draft");
    setNotes("");
    setItems([emptyItem()]);
    setError(null);
  }

  function openCreate() {
    resetForm();
    setMessage(null);
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function backToList() {
    resetForm();
    setMessage(null);
    setView("list");
  }

  function fillFromInvoice(inv: Invoice, opts: { mode: FormMode; number?: string }) {
    setMode(opts.mode);
    setEditingId(opts.mode === "edit" ? inv.id : null);
    setInvoiceNumber(opts.number ?? inv.invoice_number);
    setClientId(inv.client_id ?? "");
    setProjectId("");
    setClientName(inv.client_name);
    setClientEmail(inv.client_email ?? "");
    setIssueDate(inv.issue_date);
    setDueDate(inv.due_date ?? "");
    setCurrency(inv.currency || "USD");
    setStatus(opts.mode === "create" ? "draft" : inv.status);
    setNotes(inv.notes ?? "");
    setItems(normalizeItems(inv.items).length ? normalizeItems(inv.items) : [emptyItem()]);
    setError(null);
    setMessage(null);
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateItem(idx: number, patch: Partial<InvoiceItem>) {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  }

  async function saveInvoice(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setError(null);
    setMessage(null);

    const number = invoiceNumber.trim();
    if (!number) {
      setError("Invoice number is required");
      setBusy(false);
      return;
    }

    const cleaned = normalizeItems(items).filter((i) => i.title.trim());
    if (cleaned.length === 0) {
      setError("Add at least one line item with a title");
      setBusy(false);
      return;
    }

    const payload = {
      invoice_number: number,
      client_id: clientId || null,
      client_name: clientName.trim(),
      client_email: clientEmail.trim() || null,
      issue_date: issueDate || todayIso(),
      due_date: dueDate || null,
      items: cleaned,
      notes: notes.trim() || null,
      status,
      currency: currency.trim() || "USD",
    };

    if (mode === "edit" && editingId) {
      const { error: err } = await supabase.from("invoices").update(payload).eq("id", editingId);
      setBusy(false);
      if (err) {
        setError(err.message);
        return;
      }
      setMessage("Invoice updated");
      resetForm();
      setView("list");
      await load();
      return;
    }

    const { error: err } = await supabase.from("invoices").insert({
      ...payload,
      created_by: user.id,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMessage("Invoice saved");
    resetForm();
    setView("list");
    await load();
  }

  async function handlePdf(inv: Invoice, action: "view" | "download") {
    setPdfBusy(inv.id);
    setPdfAction(action);
    setError(null);
    try {
      const payload = { ...inv, items: normalizeItems(inv.items) };
      if (action === "view") await viewInvoicePdf(payload);
      else await downloadInvoicePdf(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate PDF");
    } finally {
      setPdfBusy(null);
      setPdfAction(null);
    }
  }

  async function deleteInvoice(inv: Invoice) {
    const ok = window.confirm(
      `Delete invoice ${inv.invoice_number} for ${inv.client_name}? This cannot be undone.`,
    );
    if (!ok) return;

    setError(null);
    setMessage(null);
    const { error: err } = await supabase.from("invoices").delete().eq("id", inv.id);
    if (err) {
      setError(err.message);
      return;
    }
    if (editingId === inv.id) {
      resetForm();
      setView("list");
    }
    setMessage(`Deleted ${inv.invoice_number}`);
    setInvoices((prev) => prev.filter((i) => i.id !== inv.id));
  }

  const previewTotal = invoiceTotal(items.filter((i) => i.title.trim()));

  if (view === "form") {
    return (
      <div className="space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={backToList}
              className="font-mono text-xs text-slate-400 hover:text-coral-500"
            >
              ← Back to invoices
            </button>
            <h1 className="font-display text-3xl text-navy-900 font-semibold mt-2">
              {mode === "edit" ? "Edit invoice" : "Create invoice"}
            </h1>
          </div>
        </header>

        <form onSubmit={saveInvoice} className="rounded-2xl border border-navy-900/10 bg-white p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">
                Load from project
              </span>
              <select
                value={projectId}
                onChange={(e) => selectProject(e.target.value)}
                className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500 bg-white"
              >
                <option value="">Select a project to fill client…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                    {p.client ? ` — ${billToName(p.client)}` : " — no client"}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">
                Saved client
              </span>
              <select
                value={clientId}
                onChange={(e) => selectSavedClient(e.target.value)}
                className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500 bg-white"
              >
                <option value="">Manual / no saved client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company ? `${c.name} (${c.company})` : c.name}
                    {c.email ? ` · ${c.email}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">
                Invoice number
              </span>
              <input
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="IWS-00000001"
                className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-sm outline-none focus:border-coral-500"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500 bg-white"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <input
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client name (Bill to)"
              className="rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500"
            />
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="Client email"
              className="rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500"
            />
            <label className="block space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">
                Issue date
              </span>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-sm outline-none focus:border-coral-500"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-sm outline-none focus:border-coral-500"
              />
            </label>
          <label className="block space-y-1.5 sm:col-span-2 max-w-[200px]">
            <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">
              Currency
            </span>
            <select
              value={currency === "PKR" ? "PKR" : "USD"}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-sm outline-none focus:border-coral-500 bg-white"
            >
              <option value="USD">USD</option>
              <option value="PKR">PKR</option>
            </select>
          </label>
          </div>

          <div className="space-y-3">
            <p className="font-mono text-xs text-slate-500 uppercase tracking-wide">Line items</p>
            {items.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-navy-900/10 bg-paper/40 p-3 grid gap-2 sm:grid-cols-[1fr_72px_96px_auto]"
              >
                <div className="space-y-2 sm:col-span-1">
                  <input
                    value={item.title}
                    onChange={(e) => updateItem(idx, { title: e.target.value })}
                    placeholder="Title (e.g. Website redesign)"
                    className="w-full rounded-lg border border-navy-900/15 px-3 py-2 font-display text-sm outline-none focus:border-coral-500"
                  />
                  <select
                    value={matchDescriptionPreset(item.description)}
                    onChange={(e) => {
                      const id = e.target.value as DescriptionPresetId;
                      if (!id || id === "custom") return;
                      const preset = descriptionPresets().find((p) => p.id === id);
                      if (preset) updateItem(idx, { description: preset.value });
                    }}
                    aria-label="Description preset"
                    className="w-full rounded-lg border border-navy-900/15 px-3 py-2 font-display text-xs text-slate-700 outline-none focus:border-coral-500 bg-white"
                  >
                    <option value="">Description preset…</option>
                    {descriptionPresets().map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label} — {preset.value}
                      </option>
                    ))}
                    {matchDescriptionPreset(item.description) === "custom" && (
                      <option value="custom">Custom description</option>
                    )}
                  </select>
                  <textarea
                    value={item.description}
                    onChange={(e) => updateItem(idx, { description: e.target.value })}
                    placeholder="Or type a custom description"
                    rows={2}
                    className="w-full rounded-lg border border-navy-900/15 px-3 py-2 font-display text-xs text-slate-600 outline-none focus:border-coral-500 resize-y"
                  />
                </div>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                  aria-label="Quantity"
                  className="rounded-lg border border-navy-900/15 px-3 py-2 font-mono text-sm h-10 self-start"
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) => updateItem(idx, { unit_price: Number(e.target.value) })}
                  aria-label="Unit price"
                  className="rounded-lg border border-navy-900/15 px-3 py-2 font-mono text-sm h-10 self-start"
                />
                <button
                  type="button"
                  onClick={() =>
                    setItems((prev) => (prev.length === 1 ? [emptyItem()] : prev.filter((_, i) => i !== idx)))
                  }
                  className="font-mono text-xs text-slate-400 hover:text-coral-500 px-2 self-start h-10"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setItems((prev) => [...prev, emptyItem()])}
              className="font-mono text-xs text-coral-500"
            >
              + Add line
            </button>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm"
          />

          <p className="font-display text-navy-900">
            Total:{" "}
            <span className="text-coral-500">
              {currency} {previewTotal.toFixed(2)}
            </span>
          </p>
          {error && <p className="font-mono text-xs text-coral-500">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="bg-navy-900 text-white font-display text-sm px-6 py-2.5 rounded-full hover:bg-coral-500 disabled:opacity-60"
            >
              {busy ? "Saving…" : mode === "edit" ? "Update invoice" : "Save invoice"}
            </button>
            <button
              type="button"
              onClick={backToList}
              className="border border-navy-900/15 font-display text-sm px-6 py-2.5 rounded-full hover:border-coral-500 hover:text-coral-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-coral-500 mb-2">// admin only</p>
          <h1 className="font-display text-3xl text-navy-900 font-semibold">Invoices</h1>
          <p className="text-slate-500 text-sm mt-2">Revenue overview and invoice list.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="bg-navy-900 text-white font-display text-sm px-5 py-2.5 rounded-full hover:bg-coral-500"
        >
          Create new invoice
        </button>
      </header>

      {message && <p className="font-mono text-xs text-sky-500">{message}</p>}
      {error && <p className="font-mono text-xs text-coral-500">{error}</p>}

      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-navy-900/10 bg-white p-5">
          <p className="font-mono text-[10px] uppercase tracking-wide text-slate-400">
            Earned this month
          </p>
          <p className="font-display text-2xl text-navy-900 font-semibold mt-2">{stats.monthPaid}</p>
          <p className="font-mono text-[11px] text-slate-400 mt-2">
            {stats.monthLabel} · {stats.monthPaidCount} paid
          </p>
        </div>
        <div className="rounded-2xl border border-navy-900/10 bg-white p-5">
          <p className="font-mono text-[10px] uppercase tracking-wide text-slate-400">
            Sent invoices
          </p>
          <p className="font-display text-2xl text-navy-900 font-semibold mt-2">{stats.sent}</p>
          <p className="font-mono text-[11px] text-slate-400 mt-2">{stats.sentCount} awaiting payment</p>
        </div>
        <div className="rounded-2xl border border-navy-900/10 bg-white p-5">
          <p className="font-mono text-[10px] uppercase tracking-wide text-slate-400">
            Pending (draft)
          </p>
          <p className="font-display text-2xl text-navy-900 font-semibold mt-2">{stats.pending}</p>
          <p className="font-mono text-[11px] text-slate-400 mt-2">{stats.pendingCount} drafts</p>
        </div>
        <div className="rounded-2xl border border-navy-900/10 bg-navy-900 text-white p-5">
          <p className="font-mono text-[10px] uppercase tracking-wide text-sky-300">
            Revenue YTD {stats.year}
          </p>
          <p className="font-display text-2xl font-semibold mt-2 text-coral-400">{stats.ytd}</p>
          <p className="font-mono text-[11px] text-slate-300 mt-2">{stats.ytdCount} paid invoices</p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg text-navy-900">All invoices</h2>
          <p className="font-mono text-xs text-slate-400">{invoices.length} total</p>
        </div>
        <ul className="space-y-3">
          {invoices.map((inv) => (
            <li
              key={inv.id}
              className="rounded-2xl border border-navy-900/10 bg-white p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div>
                <p className="font-mono text-xs text-sky-400">{inv.invoice_number}</p>
                <p className="font-display text-lg text-navy-900 mt-1">{inv.client_name}</p>
                <p className="font-mono text-xs text-slate-400 mt-1">
                  {inv.status} · {inv.currency} {invoiceTotal(inv.items).toFixed(2)} · {inv.issue_date}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fillFromInvoice(inv, { mode: "edit" })}
                  className="border border-navy-900/15 font-display text-sm px-4 py-2 rounded-full hover:border-coral-500 hover:text-coral-500"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() =>
                    fillFromInvoice(inv, {
                      mode: "create",
                      number: `${inv.invoice_number}-COPY`,
                    })
                  }
                  className="border border-navy-900/15 font-display text-sm px-4 py-2 rounded-full hover:border-coral-500 hover:text-coral-500"
                >
                  Clone
                </button>
                <button
                  type="button"
                  disabled={pdfBusy === inv.id}
                  onClick={() => void handlePdf(inv, "view")}
                  className="border border-navy-900/15 font-display text-sm px-4 py-2 rounded-full hover:border-coral-500 hover:text-coral-500 disabled:opacity-60"
                >
                  {pdfBusy === inv.id && pdfAction === "view" ? "Opening…" : "View PDF"}
                </button>
                <button
                  type="button"
                  disabled={pdfBusy === inv.id}
                  onClick={() => void handlePdf(inv, "download")}
                  className="bg-navy-900 text-white font-display text-sm px-4 py-2 rounded-full hover:bg-coral-500 disabled:opacity-60"
                >
                  {pdfBusy === inv.id && pdfAction === "download" ? "Preparing…" : "Download PDF"}
                </button>
                <button
                  type="button"
                  onClick={() => void deleteInvoice(inv)}
                  className="border border-coral-500/40 text-coral-500 font-display text-sm px-4 py-2 rounded-full hover:bg-coral-500 hover:text-white"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {invoices.length === 0 && (
            <li className="text-sm text-slate-500 font-display">No invoices yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
