import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { CurrencySelect } from "../components/CurrencySelect";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import type { AppCurrency, Profile, Salary } from "../../types/database";
import { money, periodLabel, salaryNet } from "../lib/financeStats";
import { downloadSalarySlip } from "../lib/salarySlipPdf";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

function currentYear() {
  return new Date().getFullYear();
}

function currentMonth() {
  return new Date().getMonth() + 1;
}

export default function SalariesPage() {
  const { user, isAdmin } = useAuth();
  const [salaries, setSalaries] = useState<(Salary & { profile?: Profile })[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [taxDeduction, setTaxDeduction] = useState("0");
  const [loanDeduction, setLoanDeduction] = useState("0");
  const [currency, setCurrency] = useState<AppCurrency>("PKR");
  const [periodYear, setPeriodYear] = useState(currentYear);
  const [periodMonth, setPeriodMonth] = useState(currentMonth);
  const [paidOn, setPaidOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [slipBusy, setSlipBusy] = useState<string | null>(null);

  const [filterYear, setFilterYear] = useState<number | "all">("all");
  const [filterMonth, setFilterMonth] = useState<number | "all">("all");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    if (isAdmin) {
      const [sal, people] = await Promise.all([
        supabase
          .from("salaries")
          .select("*, profile:profiles!user_id(*)")
          .order("period_year", { ascending: false })
          .order("period_month", { ascending: false }),
        supabase.from("profiles").select("*").eq("status", "approved").order("full_name"),
      ]);
      if (sal.error) setError(sal.error.message);
      setSalaries((sal.data as (Salary & { profile?: Profile })[]) ?? []);
      setMembers((people.data as Profile[]) ?? []);
    } else {
      const { data, error: err } = await supabase
        .from("salaries")
        .select("*")
        .eq("user_id", user.id)
        .order("period_year", { ascending: false })
        .order("period_month", { ascending: false });
      if (err) setError(err.message);
      setSalaries((data as Salary[]) ?? []);
    }

    setLoading(false);
  }, [user, isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    return salaries.filter((s) => {
      if (filterYear !== "all" && s.period_year !== filterYear) return false;
      if (filterMonth !== "all" && s.period_month !== filterMonth) return false;
      return true;
    });
  }, [salaries, filterYear, filterMonth]);

  const yearsAvailable = useMemo(() => {
    const set = new Set(salaries.map((s) => s.period_year));
    if (set.size === 0) set.add(currentYear());
    return [...set].sort((a, b) => b - a);
  }, [salaries]);

  async function uploadScreenshot(userId: string, selected: File) {
    const ext = selected.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${userId}/${periodYear}-${String(periodMonth).padStart(2, "0")}-${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("salary-transfers").upload(path, selected, {
      cacheControl: "3600",
      upsert: false,
      contentType: selected.type || "image/png",
    });
    if (upErr) throw new Error(upErr.message);
    return path;
  }

  async function saveSalary(e: FormEvent) {
    e.preventDefault();
    if (!user || !isAdmin) return;
    setBusy(true);
    setError(null);
    setMessage(null);

    const value = Number(amount);
    const tax = Number(taxDeduction) || 0;
    const loan = Number(loanDeduction) || 0;
    if (!memberId || !Number.isFinite(value) || value < 0) {
      setError("Select a member and enter a valid gross salary");
      setBusy(false);
      return;
    }
    if (tax < 0 || loan < 0) {
      setError("Deductions cannot be negative");
      setBusy(false);
      return;
    }
    if (tax + loan > value) {
      setError("Tax + loan cannot exceed gross salary");
      setBusy(false);
      return;
    }

    try {
      let path: string | undefined;
      if (file) path = await uploadScreenshot(memberId, file);

      const payload: {
        user_id: string;
        amount: number;
        tax_deduction: number;
        loan_deduction: number;
        currency: AppCurrency;
        period_year: number;
        period_month: number;
        paid_on: string;
        notes: string | null;
        created_by: string;
        transfer_screenshot_path?: string;
      } = {
        user_id: memberId,
        amount: value,
        tax_deduction: tax,
        loan_deduction: loan,
        currency,
        period_year: periodYear,
        period_month: periodMonth,
        paid_on: paidOn,
        notes: notes.trim() || null,
        created_by: user.id,
      };
      if (path) payload.transfer_screenshot_path = path;

      const { error: err } = await supabase.from("salaries").upsert(payload, {
        onConflict: "user_id,period_year,period_month",
      });
      if (err) throw new Error(err.message);

      setMessage(`Salary saved for ${periodLabel(periodYear, periodMonth)}`);
      setAmount("");
      setTaxDeduction("0");
      setLoanDeduction("0");
      setNotes("");
      setFile(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save salary");
    } finally {
      setBusy(false);
    }
  }

  async function deleteSalary(row: Salary) {
    if (!isAdmin) return;
    if (!window.confirm(`Delete salary for ${periodLabel(row.period_year, row.period_month)}?`)) return;
    if (row.transfer_screenshot_path) {
      await supabase.storage.from("salary-transfers").remove([row.transfer_screenshot_path]);
    }
    await supabase.from("salaries").delete().eq("id", row.id);
    await load();
  }

  async function viewScreenshot(path: string) {
    const { data, error: err } = await supabase.storage
      .from("salary-transfers")
      .createSignedUrl(path, 60 * 10);
    if (err || !data?.signedUrl) {
      setError(err?.message ?? "Could not open screenshot");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function handleSlip(row: Salary & { profile?: Profile }) {
    if (!user) return;
    setSlipBusy(row.id);
    try {
      let profile = row.profile;
      if (!profile) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name,email,phone,cnic")
          .eq("id", row.user_id)
          .single();
        profile = data as Profile | undefined;
      }
      await downloadSalarySlip(row, {
        full_name: profile?.full_name ?? "Employee",
        email: profile?.email ?? "",
        cnic: profile?.cnic ?? null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate slip");
    } finally {
      setSlipBusy(null);
    }
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (loading) return <p className="font-mono text-sm text-slate-400">Loading salaries…</p>;

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs text-coral-500 mb-2">// salaries</p>
        <h1 className="font-display text-3xl text-navy-900 font-semibold">
          {isAdmin ? "Salaries" : "My salary slips"}
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          {isAdmin
            ? "Record member salaries in USD or PKR with transfer proof."
            : "Download your salary slip for any paid month."}
        </p>
      </header>

      {error && <p className="font-mono text-xs text-coral-500">{error}</p>}
      {message && <p className="font-mono text-xs text-sky-500">{message}</p>}

      {isAdmin && (
        <section className="rounded-2xl border border-navy-900/10 bg-white p-6 space-y-5">
          <h2 className="font-display text-lg text-navy-900">Record salary payment</h2>
          <form onSubmit={saveSalary} className="grid sm:grid-cols-2 gap-4">
            <select
              required
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm bg-white outline-none focus:border-coral-500"
            >
              <option value="">Select member…</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.email})
                </option>
              ))}
            </select>
            <div className="grid grid-cols-[1fr_110px] gap-3">
              <input
                required
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Gross salary"
                className="rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-sm outline-none focus:border-coral-500"
              />
              <CurrencySelect value={currency} onChange={setCurrency} />
            </div>
            <input
              type="number"
              min={0}
              step="0.01"
              value={taxDeduction}
              onChange={(e) => setTaxDeduction(e.target.value)}
              placeholder="Tax deduction"
              className="rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-sm outline-none focus:border-coral-500"
            />
            <input
              type="number"
              min={0}
              step="0.01"
              value={loanDeduction}
              onChange={(e) => setLoanDeduction(e.target.value)}
              placeholder="Loan deduction"
              className="rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-sm outline-none focus:border-coral-500"
            />
            <p className="sm:col-span-2 font-mono text-[11px] text-slate-400">
              Net preview:{" "}
              {money(
                currency,
                Math.max(
                  0,
                  (Number(amount) || 0) - (Number(taxDeduction) || 0) - (Number(loanDeduction) || 0),
                ),
              )}
            </p>
            <select
              value={periodMonth}
              onChange={(e) => setPeriodMonth(Number(e.target.value))}
              className="rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm bg-white"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={periodYear}
              onChange={(e) => setPeriodYear(Number(e.target.value))}
              className="rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-sm outline-none focus:border-coral-500"
            />
            <label className="block space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">Paid on</span>
              <input
                type="date"
                required
                value={paidOn}
                onChange={(e) => setPaidOn(e.target.value)}
                className="w-full rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-sm outline-none focus:border-coral-500"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">
                Transfer screenshot
              </span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-xl border border-navy-900/15 px-4 py-2.5 font-mono text-xs file:mr-3 file:rounded-full file:border-0 file:bg-navy-900 file:text-white file:px-3 file:py-1"
              />
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              rows={2}
              className="sm:col-span-2 rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500"
            />
            <button
              type="submit"
              disabled={busy}
              className="sm:col-span-2 w-fit bg-navy-900 text-white font-display text-sm px-6 py-2.5 rounded-full hover:bg-coral-500 disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save salary"}
            </button>
          </form>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <select
          value={filterYear === "all" ? "all" : String(filterYear)}
          onChange={(e) => setFilterYear(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="rounded-xl border border-navy-900/15 px-4 py-2.5 font-display text-sm bg-white"
        >
          <option value="all">All years</option>
          {yearsAvailable.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          value={filterMonth === "all" ? "all" : String(filterMonth)}
          onChange={(e) => setFilterMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="rounded-xl border border-navy-900/15 px-4 py-2.5 font-display text-sm bg-white"
        >
          <option value="all">All months</option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <ul className="space-y-3">
        {filtered.map((s) => (
          <li
            key={s.id}
            className="rounded-2xl border border-navy-900/10 bg-white p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div>
              {isAdmin && (
                <p className="font-display text-lg text-navy-900">{s.profile?.full_name ?? "Member"}</p>
              )}
              <p className={`font-display ${isAdmin ? "text-sm text-slate-600 mt-0.5" : "text-lg text-navy-900"}`}>
                {periodLabel(s.period_year, s.period_month)}
              </p>
              <p className="font-mono text-xs text-slate-400 mt-1">
                Gross {money(s.currency, Number(s.amount))}
                {(Number(s.tax_deduction) > 0 || Number(s.loan_deduction) > 0) && (
                  <>
                    {" "}
                    · Tax {money(s.currency, Number(s.tax_deduction || 0))} · Loan{" "}
                    {money(s.currency, Number(s.loan_deduction || 0))}
                  </>
                )}{" "}
                · Net {money(s.currency, salaryNet(s))} · Paid {s.paid_on}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {s.transfer_screenshot_path && (
                <button
                  type="button"
                  onClick={() => void viewScreenshot(s.transfer_screenshot_path!)}
                  className="border border-navy-900/15 font-display text-sm px-4 py-2 rounded-full hover:border-coral-500 hover:text-coral-500"
                >
                  {isAdmin ? "Screenshot" : "View transfer"}
                </button>
              )}
              <button
                type="button"
                disabled={slipBusy === s.id}
                onClick={() => void handleSlip(s)}
                className="bg-navy-900 text-white font-display text-sm px-4 py-2 rounded-full hover:bg-coral-500 disabled:opacity-60"
              >
                {slipBusy === s.id ? "Preparing…" : "Download slip"}
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => void deleteSalary(s)}
                  className="border border-coral-500/40 text-coral-500 font-display text-sm px-4 py-2 rounded-full hover:bg-coral-500 hover:text-white"
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-sm text-slate-500 font-display">No salary records for this filter.</li>
        )}
      </ul>
    </div>
  );
}
