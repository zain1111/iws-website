import type { AppCurrency } from "../../types/database";
import { APP_CURRENCIES } from "../../types/database";

export function CurrencySelect({
  value,
  onChange,
  className = "",
  id,
}: {
  value: AppCurrency;
  onChange: (value: AppCurrency) => void;
  className?: string;
  id?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as AppCurrency)}
      className={
        className ||
        "rounded-xl border border-navy-900/15 px-4 py-3 font-mono text-sm bg-white outline-none focus:border-coral-500"
      }
    >
      {APP_CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
