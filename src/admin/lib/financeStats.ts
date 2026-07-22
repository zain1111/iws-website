import type { AppCurrency, Expense, Invoice, Salary } from "../../types/database";
import { APP_CURRENCIES } from "../../types/database";
import { invoiceTotal, normalizeItems } from "./invoicePdf";

export function parseIssueDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function salaryNet(salary: Pick<Salary, "amount" | "tax_deduction" | "loan_deduction">) {
  return Math.max(
    0,
    Number(salary.amount) - Number(salary.tax_deduction || 0) - Number(salary.loan_deduction || 0),
  );
}

export function money(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Show both currencies without converting (e.g. "USD 1,200.00 · PKR 450,000.00") */
export function moneyPair(amounts: Record<AppCurrency, number>) {
  return APP_CURRENCIES.map((c) => money(c, amounts[c] ?? 0)).join(" · ");
}

export function periodLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function normalizeCurrency(value: string | null | undefined): AppCurrency {
  return value === "PKR" ? "PKR" : "USD";
}

/** Convert amount between USD and PKR using `usdToPkr` (1 USD = N PKR). */
export function convertAmount(
  amount: number,
  from: AppCurrency,
  to: AppCurrency,
  usdToPkr: number,
) {
  if (!Number.isFinite(amount) || amount === 0) return 0;
  const rate = usdToPkr > 0 ? usdToPkr : 1;
  if (from === to) return amount;
  if (from === "USD" && to === "PKR") return amount * rate;
  return amount / rate;
}

export function sumConverted(
  rows: { amount?: number; total?: number; currency: string }[],
  to: AppCurrency,
  usdToPkr: number,
) {
  return rows.reduce((sum, row) => {
    const from = normalizeCurrency(row.currency);
    return sum + convertAmount(row.total ?? row.amount ?? 0, from, to, usdToPkr);
  }, 0);
}

export function withTotals(invoices: Invoice[]) {
  return invoices.map((inv) => ({
    ...inv,
    currency: normalizeCurrency(inv.currency),
    items: normalizeItems(inv.items),
    total: invoiceTotal(normalizeItems(inv.items)),
  }));
}

export type InvoiceWithTotal = ReturnType<typeof withTotals>[number];

export function emptyCurrencyMap(): Record<AppCurrency, number> {
  return { USD: 0, PKR: 0 };
}

export function sumByCurrency(
  rows: { amount?: number; total?: number; currency: string }[],
): Record<AppCurrency, number> {
  const map = emptyCurrencyMap();
  for (const row of rows) {
    const c = normalizeCurrency(row.currency);
    map[c] += row.total ?? row.amount ?? 0;
  }
  return map;
}

export function monthlyPaidSeriesConverted(
  invoices: InvoiceWithTotal[],
  to: AppCurrency,
  usdToPkr: number,
  months = 12,
) {
  const now = new Date();
  const keys: { label: string; year: number; month: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push({
      label: d.toLocaleString("en-US", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    });
  }

  return keys.map((k) => {
    const paid = invoices.filter((inv) => {
      if (inv.status !== "paid") return false;
      const d = parseIssueDate(inv.issue_date);
      return d.getFullYear() === k.year && d.getMonth() + 1 === k.month;
    });
    return {
      ...k,
      revenue: sumConverted(paid, to, usdToPkr),
      count: paid.length,
    };
  });
}

export function monthlyExpenseSeriesConverted(
  expenses: Expense[],
  to: AppCurrency,
  usdToPkr: number,
  months = 12,
) {
  const now = new Date();
  const keys: { label: string; year: number; month: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push({
      label: d.toLocaleString("en-US", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    });
  }

  return keys.map((k) => {
    const rows = expenses.filter((e) => {
      const d = parseIssueDate(e.expense_date);
      return d.getFullYear() === k.year && d.getMonth() + 1 === k.month;
    });
    return {
      ...k,
      expenses: sumConverted(
        rows.map((e) => ({ amount: Number(e.amount), currency: e.currency })),
        to,
        usdToPkr,
      ),
      count: rows.length,
    };
  });
}

export function monthlyPayrollSeriesConverted(
  salaries: Salary[],
  to: AppCurrency,
  usdToPkr: number,
  months = 12,
) {
  const now = new Date();
  const keys: { label: string; year: number; month: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push({
      label: d.toLocaleString("en-US", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    });
  }

  return keys.map((k) => {
    // Cashflow month: when the salary was paid, not the labeled period.
    const rows = salaries.filter((s) => {
      const d = parseIssueDate(s.paid_on);
      return d.getFullYear() === k.year && d.getMonth() + 1 === k.month;
    });
    return {
      ...k,
      payroll: sumConverted(
        rows.map((row) => ({ amount: salaryNet(row), currency: row.currency })),
        to,
        usdToPkr,
      ),
      count: rows.length,
    };
  });
}

export function statusBreakdownConverted(
  invoices: InvoiceWithTotal[],
  to: AppCurrency,
  usdToPkr: number,
) {
  const groups: Record<string, number> = { paid: 0, sent: 0, draft: 0 };
  for (const inv of invoices) {
    groups[inv.status] =
      (groups[inv.status] ?? 0) +
      convertAmount(inv.total, normalizeCurrency(inv.currency), to, usdToPkr);
  }
  return [
    { name: "Paid", key: "paid", value: groups.paid, fill: "#FF5A45" },
    { name: "Sent", key: "sent", value: groups.sent, fill: "#5CB0E5" },
    { name: "Draft", key: "draft", value: groups.draft, fill: "#A7ACB3" },
  ];
}

export function expenseCategoryBreakdownConverted(
  expenses: Expense[],
  to: AppCurrency,
  usdToPkr: number,
) {
  const map = new Map<string, number>();
  for (const e of expenses) {
    const converted = convertAmount(
      Number(e.amount),
      normalizeCurrency(e.currency),
      to,
      usdToPkr,
    );
    map.set(e.category, (map.get(e.category) ?? 0) + converted);
  }
  const colors = ["#10263B", "#FF5A45", "#5CB0E5", "#1E496E", "#A7ACB3", "#FF7A61"];
  return [...map.entries()].map(([name, value], i) => ({
    name,
    value,
    fill: colors[i % colors.length],
  }));
}
