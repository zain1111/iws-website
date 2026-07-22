import { jsPDF } from "jspdf";
import logoUrl from "../../assets/logo-color.png";
import type { Profile, Salary } from "../../types/database";
import { money, periodLabel, salaryNet } from "./financeStats";
import { formatCnic } from "./cnic";

async function logoDataUrl(): Promise<string> {
  const res = await fetch(logoUrl);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function downloadSalarySlip(
  salary: Salary,
  employee: Pick<Profile, "full_name" | "email" | "cnic">,
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  const gross = Number(salary.amount);
  const tax = Number(salary.tax_deduction || 0);
  const loan = Number(salary.loan_deduction || 0);
  const net = salaryNet(salary);

  const navy: [number, number, number] = [16, 38, 59];
  const coral: [number, number, number] = [255, 90, 69];
  const sky: [number, number, number] = [92, 176, 229];
  const paper: [number, number, number] = [245, 247, 250];
  const slate: [number, number, number] = [91, 93, 98];

  doc.setFillColor(...paper);
  doc.rect(0, 0, pageW, 48, "F");
  doc.setFillColor(...coral);
  doc.rect(0, 0, pageW, 3.2, "F");

  try {
    const dataUrl = await logoDataUrl();
    doc.addImage(dataUrl, "PNG", margin, 10, 42, 18);
  } catch {
    doc.setTextColor(...navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Integrated Web Solutions", margin, 20);
  }

  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("SALARY SLIP", pageW - margin, 20, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...slate);
  doc.text(periodLabel(salary.period_year, salary.period_month), pageW - margin, 27, {
    align: "right",
  });

  doc.setDrawColor(...navy);
  doc.setLineWidth(0.35);
  doc.line(margin, 50, pageW - margin, 50);

  let y = 62;
  doc.setTextColor(...coral);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("EMPLOYEE", margin, y);
  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(employee.full_name, margin, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...slate);
  doc.text(employee.email, margin, y + 13);
  if (employee.cnic) {
    const cnic = formatCnic(employee.cnic);
    if (cnic) doc.text(`CNIC  ${cnic}`, margin, y + 19);
  }

  doc.setTextColor(...coral);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("PAYMENT DETAILS", margin + 95, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...slate);
  doc.text(`Paid on  ${salary.paid_on}`, margin + 95, y + 7);
  doc.text(`Period   ${periodLabel(salary.period_year, salary.period_month)}`, margin + 95, y + 13);

  y = 92;
  // Earnings / deductions table
  doc.setFillColor(...navy);
  doc.roundedRect(margin, y, pageW - margin * 2, 10, 1.8, 1.8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("DESCRIPTION", margin + 5, y + 6.5);
  doc.text("AMOUNT", pageW - margin - 5, y + 6.5, { align: "right" });
  y += 14;

  const rows: { label: string; value: number; muted?: boolean }[] = [
    { label: "Gross salary", value: gross },
    { label: "Tax deduction", value: tax, muted: true },
    { label: "Loan deduction", value: loan, muted: true },
  ];

  for (const row of rows) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...(row.muted ? slate : navy));
    doc.text(row.label, margin + 5, y);
    const prefix = row.muted && row.value > 0 ? "− " : "";
    doc.text(`${prefix}${money(salary.currency, row.value)}`, pageW - margin - 5, y, {
      align: "right",
    });
    y += 7;
  }

  y += 4;
  doc.setDrawColor(...coral);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  doc.setFillColor(...navy);
  doc.roundedRect(margin, y, pageW - margin * 2, 26, 2.5, 2.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Net salary credited", margin + 6, y + 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...coral);
  doc.text(money(salary.currency, net), margin + 6, y + 20);

  y += 36;
  if (salary.notes) {
    doc.setTextColor(...coral);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("NOTES", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...slate);
    const lines = doc.splitTextToSize(salary.notes, pageW - margin * 2);
    doc.text(lines, margin, y + 6);
    y += 6 + lines.length * 5 + 8;
  }

  doc.setFillColor(...paper);
  doc.roundedRect(margin, y, pageW - margin * 2, 28, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...slate);
  const notice = doc.splitTextToSize(
    "This is an electronically generated salary slip and does not require any signature. It confirms salary payment by Integrated Web Solutions for the period stated above.",
    pageW - margin * 2 - 8,
  );
  doc.text(notice, margin + 4, y + 8);
  doc.setTextColor(...sky);
  doc.text("hr@theiwsolutions.com · www.theiwsolutions.com", margin + 4, y + 8 + notice.length * 4 + 4);

  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(...navy);
  doc.rect(0, pageH - 16, pageW, 16, "F");
  doc.setFillColor(...coral);
  doc.rect(0, pageH - 16, pageW, 1.4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("Integrated Web Solutions — Confidential", margin, pageH - 7);

  const file = `salary-slip-${employee.full_name.replace(/\s+/g, "-").toLowerCase()}-${salary.period_year}-${String(salary.period_month).padStart(2, "0")}.pdf`;
  doc.save(file);
}
