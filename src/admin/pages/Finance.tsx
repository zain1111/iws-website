import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CurrencySelect } from "../components/CurrencySelect";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import type { AppCurrency, Expense, Invoice, Salary } from "../../types/database";
import { EXPENSE_CATEGORIES } from "../../types/database";
import {
  expenseCategoryBreakdownConverted,
  money,
  monthlyExpenseSeriesConverted,
  monthlyPaidSeriesConverted,
  monthlyPayrollSeriesConverted,
  parseIssueDate,
  salaryNet,
  statusBreakdownConverted,
  sumConverted,
  withTotals,
} from "../lib/financeStats";

const FX_STORAGE_KEY = "iws-usd-to-pkr";
const DEFAULT_USD_TO_PKR = 280;

function readStoredRate() {
  const raw = localStorage.getItem(FX_STORAGE_KEY);
  const n = raw ? Number(raw) : DEFAULT_USD_TO_PKR;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_USD_TO_PKR;
}

export default function FinancePage() {
  const { user, isAdmin } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [displayCurrency, setDisplayCurrency] = useState<AppCurrency>("USD");
  const [usdToPkr, setUsdToPkr] = useState(readStoredRate);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("general");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<AppCurrency>("PKR");
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user || !isAdmin) return;
    setLoading(true);
    setError(null);
    const [inv, exp, sal] = await Promise.all([
      supabase.from("invoices").select("*").order("issue_date", { ascending: false }),
      supabase.from("expenses").select("*").order("expense_date", { ascending: false }),
      supabase
        .from("salaries")
        .select("*")
        .order("paid_on", { ascending: false })
        .order("period_year", { ascending: false }),
    ]);
    if (inv.error) setError(inv.error.message);
    if (exp.error) setError(exp.error.message);
    if (sal.error) setError(sal.error.message);
    setInvoices((inv.data as Invoice[]) ?? []);
    setExpenses((exp.data as Expense[]) ?? []);
    setSalaries((sal.data as Salary[]) ?? []);
    setLoading(false);
  }, [user, isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  const invoiceRows = useMemo(() => withTotals(invoices), [invoices]);

  const stats = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const to = displayCurrency;
    const rate = usdToPkr;

    const paid = invoiceRows.filter((i) => i.status === "paid");
    const paidMonth = paid.filter((i) => {
      const d = parseIssueDate(i.issue_date);
      return d.getFullYear() === y && d.getMonth() === m;
    });
    const paidYtd = paid.filter((i) => parseIssueDate(i.issue_date).getFullYear() === y);

    const expMonth = expenses.filter((e) => {
      const d = parseIssueDate(e.expense_date);
      return d.getFullYear() === y && d.getMonth() === m;
    });
    const expYtd = expenses.filter((e) => parseIssueDate(e.expense_date).getFullYear() === y);

    // Use paid_on (payment date) so "Salaries paid this month" matches cash leaving the account.
    const payrollMonth = salaries.filter((s) => {
      const d = parseIssueDate(s.paid_on);
      return d.getFullYear() === y && d.getMonth() === m;
    });
    const payrollYtd = salaries.filter((s) => parseIssueDate(s.paid_on).getFullYear() === y);

    const revenueMonth = sumConverted(paidMonth, to, rate);
    const revenueYtd = sumConverted(paidYtd, to, rate);
    const expensesMonth = sumConverted(
      expMonth.map((e) => ({ amount: Number(e.amount), currency: e.currency })),
      to,
      rate,
    );
    const expensesYtd = sumConverted(
      expYtd.map((e) => ({ amount: Number(e.amount), currency: e.currency })),
      to,
      rate,
    );
    const payrollMonthTotal = sumConverted(
      payrollMonth.map((s) => ({ amount: salaryNet(s), currency: s.currency })),
      to,
      rate,
    );
    const payrollYtdTotal = sumConverted(
      payrollYtd.map((s) => ({ amount: salaryNet(s), currency: s.currency })),
      to,
      rate,
    );

    return {
      monthLabel: now.toLocaleString("en-US", { month: "long", year: "numeric" }),
      year: y,
      revenueMonth,
      netMonth: revenueMonth - expensesMonth - payrollMonthTotal,
      revenueYtd,
      expensesMonth,
      payrollMonth: payrollMonthTotal,
      netYtd: revenueYtd - expensesYtd - payrollYtdTotal,
    };
  }, [invoiceRows, expenses, salaries, displayCurrency, usdToPkr]);

  const revenueSeries = useMemo(
    () => monthlyPaidSeriesConverted(invoiceRows, displayCurrency, usdToPkr, 12),
    [invoiceRows, displayCurrency, usdToPkr],
  );
  const expenseSeries = useMemo(
    () => monthlyExpenseSeriesConverted(expenses, displayCurrency, usdToPkr, 12),
    [expenses, displayCurrency, usdToPkr],
  );
  const payrollSeries = useMemo(
    () => monthlyPayrollSeriesConverted(salaries, displayCurrency, usdToPkr, 12),
    [salaries, displayCurrency, usdToPkr],
  );
  const compareSeries = useMemo(
    () =>
      revenueSeries.map((r, i) => ({
        label: r.label,
        revenue: r.revenue,
        expenses: expenseSeries[i]?.expenses ?? 0,
        payroll: payrollSeries[i]?.payroll ?? 0,
      })),
    [revenueSeries, expenseSeries, payrollSeries],
  );
  const statusData = useMemo(
    () => statusBreakdownConverted(invoiceRows, displayCurrency, usdToPkr),
    [invoiceRows, displayCurrency, usdToPkr],
  );
  const categoryData = useMemo(
    () => expenseCategoryBreakdownConverted(expenses, displayCurrency, usdToPkr),
    [expenses, displayCurrency, usdToPkr],
  );

  async function saveExpense(e: FormEvent) {
    e.preventDefault();
    if (!user || !isAdmin) return;
    setBusy(true);
    setError(null);
    setMessage(null);

    const value = Number(amount);
    if (!title.trim() || !Number.isFinite(value) || value < 0) {
      setError("Enter a title and valid amount");
      setBusy(false);
      return;
    }

    const { error: err } = await supabase.from("expenses").insert({
      title: title.trim(),
      category,
      amount: value,
      currency,
      expense_date: expenseDate,
      notes: notes.trim() || null,
      created_by: user.id,
    });

    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMessage("Expense saved");
    setTitle("");
    setAmount("");
    setNotes("");
    setCategory("general");
    await load();
  }

  async function deleteExpense(row: Expense) {
    if (!window.confirm(`Delete expense "${row.title}"?`)) return;
    await supabase.from("expenses").delete().eq("id", row.id);
    await load();
  }

  if (!isAdmin) {
    return <Navigate to="/admin/salaries" replace />;
  }

  if (loading) {
    return <p className="font-mono text-sm text-slate-400">Loading finance…</p>;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-coral-500 mb-2">// finance</p>
          <h1 className="font-display text-3xl text-navy-900 font-semibold">Finance</h1>
          <p className="text-slate-500 text-sm mt-2 max-w-2xl">
            All figures convert into your selected currency. Payroll lives in{" "}
            <Link to="/admin/salaries" className="text-coral-500 hover:underline">
              Salaries
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">
              Display currency
            </span>
            <CurrencySelect value={displayCurrency} onChange={setDisplayCurrency} />
          </label>
          <label className="block space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-wide text-slate-400">
              1 USD = PKR
            </span>
            <input
              type="number"
              min={1}
              step="0.01"
              value={usdToPkr}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (!Number.isFinite(n) || n <= 0) return;
                setUsdToPkr(n);
                localStorage.setItem(FX_STORAGE_KEY, String(n));
              }}
              className="w-28 rounded-xl border border-navy-900/15 px-3 py-3 font-mono text-sm outline-none focus:border-coral-500"
            />
          </label>
        </div>
      </header>

      {error && <p className="font-mono text-xs text-coral-500">{error}</p>}
      {message && <p className="font-mono text-xs text-sky-500">{message}</p>}

      <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          label={`Earned · ${stats.monthLabel}`}
          value={money(displayCurrency, stats.revenueMonth)}
          hint="Paid invoices this month (converted)"
        />
        <StatCard
          label="Net month (rev − exp − payroll)"
          value={money(displayCurrency, stats.netMonth)}
          hint="This month’s operating net"
          accent
        />
        <StatCard
          label={`Revenue YTD ${stats.year}`}
          value={money(displayCurrency, stats.revenueYtd)}
          hint="Paid invoices year to date"
          dark
        />
        <StatCard
          label="Office expenses this month"
          value={money(displayCurrency, stats.expensesMonth)}
          hint="Recorded expenses this month"
        />
        <StatCard
          label="Salaries paid this month"
          value={money(displayCurrency, stats.payrollMonth)}
          hint="Net payroll by payment date this month"
        />
        <StatCard
          label="Net YTD (rev − exp − payroll)"
          value={money(displayCurrency, stats.netYtd)}
          hint="Year to date operating net"
        />
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-navy-900/10 bg-white p-5">
          <h2 className="font-display text-lg text-navy-900 mb-1">Monthly paid revenue</h2>
          <p className="font-mono text-[11px] text-slate-400 mb-4">{displayCurrency}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#5B5D62" }} />
                <YAxis tick={{ fontSize: 11, fill: "#5B5D62" }} />
                <Tooltip
                  formatter={(value) => money(displayCurrency, Number(value ?? 0))}
                  contentStyle={{ borderRadius: 12, borderColor: "#E8ECF0" }}
                />
                <Bar dataKey="revenue" fill="#10263B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-navy-900/10 bg-white p-5">
          <h2 className="font-display text-lg text-navy-900 mb-1">Invoice pipeline</h2>
          <p className="font-mono text-[11px] text-slate-400 mb-4">{displayCurrency}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => money(displayCurrency, Number(value ?? 0))}
                  contentStyle={{ borderRadius: 12, borderColor: "#E8ECF0" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-navy-900/10 bg-white p-5 lg:col-span-2">
          <h2 className="font-display text-lg text-navy-900 mb-1">
            Revenue vs expenses vs payroll
          </h2>
          <p className="font-mono text-[11px] text-slate-400 mb-4">{displayCurrency}</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={compareSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#5B5D62" }} />
                <YAxis tick={{ fontSize: 11, fill: "#5B5D62" }} />
                <Tooltip
                  formatter={(value) => money(displayCurrency, Number(value ?? 0))}
                  contentStyle={{ borderRadius: 12, borderColor: "#E8ECF0" }}
                />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#10263B" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#5CB0E5" radius={[6, 6, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="payroll"
                  name="Payroll"
                  stroke="#FF5A45"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#FF5A45" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-navy-900/10 bg-white p-5 lg:col-span-2">
          <h2 className="font-display text-lg text-navy-900 mb-1">Expenses by category</h2>
          <p className="font-mono text-[11px] text-slate-400 mb-4">{displayCurrency}</p>
          <div className="h-64">
            {categoryData.length === 0 ? (
              <p className="font-display text-sm text-slate-400 pt-16 text-center">
                No expenses yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={95}>
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => money(displayCurrency, Number(value ?? 0))}
                    contentStyle={{ borderRadius: 12, borderColor: "#E8ECF0" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-navy-900/10 bg-white p-6 space-y-5">
        <h2 className="font-display text-lg text-navy-900">Add office expense</h2>
        <form onSubmit={saveExpense} className="grid sm:grid-cols-2 gap-4">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Expense title (e.g. Office rent)"
            className="rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm outline-none focus:border-coral-500"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-navy-900/15 px-4 py-3 font-display text-sm bg-white outline-none focus:border-coral-500"
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
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
              placeholder="Amount"
              className="rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-sm outline-none focus:border-coral-500"
            />
            <CurrencySelect value={currency} onChange={setCurrency} />
          </div>
          <input
            type="date"
            required
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className="rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-sm outline-none focus:border-coral-500"
          />
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
            {busy ? "Saving…" : "Save expense"}
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg text-navy-900">Expense history</h2>
        <ul className="space-y-3">
          {expenses.map((row) => (
            <li
              key={row.id}
              className="rounded-2xl border border-navy-900/10 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <p className="font-display text-lg text-navy-900">{row.title}</p>
                <p className="font-mono text-xs text-slate-400 mt-1">
                  {row.category} · {money(row.currency, Number(row.amount))} · {row.expense_date}
                </p>
                {row.notes && <p className="text-sm text-slate-500 mt-1">{row.notes}</p>}
              </div>
              <button
                type="button"
                onClick={() => void deleteExpense(row)}
                className="border border-coral-500/40 text-coral-500 font-display text-sm px-4 py-2 rounded-full hover:bg-coral-500 hover:text-white"
              >
                Delete
              </button>
            </li>
          ))}
          {expenses.length === 0 && (
            <li className="text-sm text-slate-500 font-display">No expenses recorded yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  dark,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  dark?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        dark
          ? "border-navy-900 bg-navy-900 text-white"
          : accent
            ? "border-coral-500/30 bg-white"
            : "border-navy-900/10 bg-white"
      }`}
    >
      <p
        className={`font-mono text-[10px] uppercase tracking-wide ${
          dark ? "text-sky-300" : "text-slate-400"
        }`}
      >
        {label}
      </p>
      <p
        className={`font-display text-2xl font-semibold mt-2 ${
          dark || accent ? "text-coral-400" : "text-navy-900"
        }`}
      >
        {value}
      </p>
      <p className={`font-mono text-[11px] mt-2 ${dark ? "text-slate-300" : "text-slate-400"}`}>
        {hint}
      </p>
    </div>
  );
}
