/** Pakistan CNIC: 11111-1111111-1 (5-7-1) */
export function digitsOnlyCnic(value: string) {
  return value.replace(/\D/g, "").slice(0, 13);
}

export function formatCnic(value: string | null | undefined) {
  const digits = digitsOnlyCnic(value ?? "");
  if (!digits) return "";
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export function isValidCnic(value: string | null | undefined) {
  return digitsOnlyCnic(value ?? "").length === 13;
}
