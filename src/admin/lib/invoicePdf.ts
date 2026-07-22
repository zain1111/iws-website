import { jsPDF } from "jspdf";
import logoUrl from "../../assets/logo-color.png";
import type { Invoice, InvoiceItem } from "../../types/database";

export const SALES_EMAIL = "sales@theiwsolutions.com";

export function emptyItem(): InvoiceItem {
  return { title: "", description: "", quantity: 1, unit_price: 0 };
}

/** Normalize older invoices that only stored `description`. */
export function normalizeItem(item: Partial<InvoiceItem> & { description?: string }): InvoiceItem {
  const title = (item.title ?? "").trim();
  const description = (item.description ?? "").trim();
  if (title) {
    return {
      title,
      description,
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.unit_price) || 0,
    };
  }
  return {
    title: description || "Line item",
    description: "",
    quantity: Number(item.quantity) || 1,
    unit_price: Number(item.unit_price) || 0,
  };
}

export function normalizeItems(items: InvoiceItem[] | null | undefined): InvoiceItem[] {
  return (items ?? []).map(normalizeItem);
}

export function invoiceTotal(items: InvoiceItem[]) {
  return normalizeItems(items).reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
}

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

function money(currency: string, n: number) {
  return `${currency} ${n.toFixed(2)}`;
}

/**
 * Branded IWS invoice PDF — navy / coral / paper palette.
 */
async function buildInvoicePdf(invoice: Invoice) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  const items = normalizeItems(invoice.items);
  const total = invoiceTotal(items);

  const navy: [number, number, number] = [16, 38, 59];
  const coral: [number, number, number] = [255, 90, 69];
  const sky: [number, number, number] = [92, 176, 229];
  const paper: [number, number, number] = [245, 247, 250];
  const slate: [number, number, number] = [91, 93, 98];
  const muted: [number, number, number] = [167, 172, 179];
  const white: [number, number, number] = [255, 255, 255];

  // Atmosphere: soft header wash + coral top rail
  doc.setFillColor(...paper);
  doc.rect(0, 0, pageW, 48, "F");
  doc.setFillColor(...coral);
  doc.rect(0, 0, pageW, 3.2, "F");
  doc.setFillColor(...navy);
  doc.rect(0, 3.2, 3.5, 44.8, "F");

  // Logo
  try {
    const dataUrl = await logoDataUrl();
    doc.addImage(dataUrl, "PNG", margin, 10, 40, 17);
  } catch {
    doc.setTextColor(...navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Integrated Web Solutions", margin, 20);
  }

  // Right-side invoice identity
  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("INVOICE", pageW - margin, 18, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...slate);
  doc.text(invoice.invoice_number, pageW - margin, 25, { align: "right" });

  // Company contact under logo
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...slate);
  doc.text("Integrated Web Solutions", margin, 33);
  doc.setTextColor(...sky);
  doc.setFont("helvetica", "bold");
  doc.text(SALES_EMAIL, margin, 38);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...muted);
  doc.text("www.theiwsolutions.com", margin, 43);

  // Compact Bill to + details strip
  const metaY = 52;
  const metaH = 20;
  const leftW = contentW * 0.58;
  const gap = 4;
  const rightX = margin + leftW + gap;
  const rightW = contentW - leftW - gap;

  doc.setFillColor(...white);
  doc.setDrawColor(228, 232, 238);
  doc.setLineWidth(0.25);
  doc.roundedRect(margin, metaY, leftW, metaH, 1.8, 1.8, "FD");
  doc.roundedRect(rightX, metaY, rightW, metaH, 1.8, 1.8, "FD");
  doc.setFillColor(...coral);
  doc.rect(margin, metaY, 1.5, metaH, "F");
  doc.setFillColor(...navy);
  doc.rect(rightX, metaY, 1.5, metaH, "F");

  // Bill to (single compact column)
  doc.setTextColor(...coral);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("BILL TO", margin + 5, metaY + 6);

  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const name = doc.splitTextToSize(invoice.client_name, leftW - 12)[0] as string;
  doc.text(name, margin + 5, metaY + 12.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...slate);
  if (invoice.client_email) {
    doc.text(invoice.client_email, margin + 5, metaY + 17);
  }

  // Details as a tight inline grid
  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("DETAILS", rightX + 5, metaY + 6);

  const col1 = rightX + 5;
  const col2 = rightX + rightW * 0.52;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...muted);
  doc.text("ISSUE", col1, metaY + 11.5);
  doc.text("DUE", col2, metaY + 11.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...navy);
  doc.text(invoice.issue_date, col1, metaY + 16.5);
  doc.text(invoice.due_date || "—", col2, metaY + 16.5);

  // Line items table
  let y = metaY + metaH + 8;
  doc.setFillColor(...navy);
  doc.roundedRect(margin, y, contentW, 9, 1.8, 1.8, "F");
  doc.setTextColor(...white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("ITEM", margin + 5, y + 6);
  doc.text("QTY", margin + 112, y + 6);
  doc.text("RATE", margin + 132, y + 6);
  doc.text("AMOUNT", pageW - margin - 5, y + 6, { align: "right" });
  y += 14;

  items.forEach((item, idx) => {
    const amount = item.quantity * item.unit_price;
    const titleLines = doc.splitTextToSize(item.title || "Untitled", 95);
    const descLines = item.description
      ? doc.splitTextToSize(item.description, 95)
      : [];
    const blockH = Math.max(11, titleLines.length * 4.4 + descLines.length * 3.5 + 5);

    if (y + blockH > pageH - 52) {
      doc.addPage();
      y = margin + 8;
      doc.setFillColor(...navy);
      doc.roundedRect(margin, y, contentW, 10, 2, 2, "F");
      doc.setTextColor(...white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text("ITEM", margin + 5, y + 6.5);
      doc.text("QTY", margin + 112, y + 6.5);
      doc.text("RATE", margin + 132, y + 6.5);
      doc.text("AMOUNT", pageW - margin - 5, y + 6.5, { align: "right" });
      y += 16;
    }

    if (idx % 2 === 0) {
      doc.setFillColor(250, 251, 253);
      doc.roundedRect(margin, y - 4, contentW, blockH, 1.5, 1.5, "F");
    }

    doc.setFillColor(...coral);
    doc.rect(margin, y - 4, 1.4, blockH, "F");

    doc.setTextColor(...navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(titleLines, margin + 6, y);

    let textY = y + titleLines.length * 4.4;
    if (descLines.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...slate);
      doc.text(descLines, margin + 6, textY);
    }

    const midY = y + Math.min(4.5, blockH / 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...navy);
    doc.text(String(item.quantity), margin + 112, midY);
    doc.text(money(invoice.currency, item.unit_price), margin + 132, midY);
    doc.setFont("helvetica", "bold");
    doc.text(money(invoice.currency, amount), pageW - margin - 5, midY, { align: "right" });

    y += blockH + 1.5;
  });

  // Totals
  y += 8;
  if (y > pageH - 58) {
    doc.addPage();
    y = margin;
  }

  const totalsW = 78;
  const totalsX = pageW - margin - totalsW;
  doc.setFillColor(...navy);
  doc.roundedRect(totalsX, y, totalsW, 30, 2.5, 2.5, "F");
  doc.setFillColor(...coral);
  doc.rect(totalsX, y, totalsW, 2.2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 210, 220);
  doc.text("Subtotal", totalsX + 5, y + 12);
  doc.text(money(invoice.currency, total), totalsX + totalsW - 5, y + 12, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...white);
  doc.text("Total due", totalsX + 5, y + 23);
  doc.setTextColor(...coral);
  doc.text(money(invoice.currency, total), totalsX + totalsW - 5, y + 23, { align: "right" });

  // Notes
  if (invoice.notes) {
    const notesY = y + 8;
    const notesMaxW = contentW - totalsW - 10;
    doc.setTextColor(...coral);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("NOTES", margin, notesY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...slate);
    const noteLines = doc.splitTextToSize(invoice.notes, notesMaxW);
    doc.text(noteLines, margin, notesY + 6);
  }

  // Footer band
  doc.setFillColor(...navy);
  doc.rect(0, pageH - 20, pageW, 20, "F");
  doc.setFillColor(...coral);
  doc.rect(0, pageH - 20, pageW, 1.6, "F");
  doc.setTextColor(...white);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Thank you for your business.", margin, pageH - 9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...sky);
  doc.text(SALES_EMAIL, pageW - margin, pageH - 9, { align: "right" });

  return doc;
}

export async function downloadInvoicePdf(invoice: Invoice) {
  const doc = await buildInvoicePdf(invoice);
  doc.save(`${invoice.invoice_number}.pdf`);
}

/** Open the invoice PDF in a new browser tab. */
export async function viewInvoicePdf(invoice: Invoice) {
  const doc = await buildInvoicePdf(invoice);
  const blobUrl = doc.output("bloburl");
  window.open(blobUrl, "_blank", "noopener,noreferrer");
}
