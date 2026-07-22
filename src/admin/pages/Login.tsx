import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminLogin() {
  const { signIn, session, isApproved, loading, configured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const linkError = useMemo(() => searchParams.get("error"), [searchParams]);

  if (!configured) return <Navigate to="/admin/setup" replace />;
  if (!loading && session) {
    return <Navigate to={isApproved ? (location.state as { from?: string })?.from || "/admin" : "/admin/pending"} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await signIn(email.trim(), password);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    navigate("/admin");
  }

  return (
    <AuthShell
      title="Sign in to workspace"
      subtitle="Team members and admins use the same portal."
    >
      {(linkError || error) && (
        <p className="mb-4 font-mono text-xs text-coral-500 leading-relaxed">{linkError || error}</p>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field label="Password" type="password" value={password} onChange={setPassword} required />
        {error && !linkError && <p className="font-mono text-xs text-coral-500">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-coral-500 text-white font-display font-medium py-3 rounded-full hover:bg-coral-400 transition-colors disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 font-mono text-xs text-slate-500 text-center">
        Need access?{" "}
        <Link to="/admin/signup" className="text-coral-500 hover:text-coral-400">
          Request an account
        </Link>
      </p>
    </AuthShell>
  );
}

export function Field({
  label,
  type = "text",
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-xs text-slate-500 uppercase tracking-wide">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-navy-900/15 bg-white px-4 py-3 font-display text-sm text-navy-900 outline-none focus:border-coral-500"
      />
    </label>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-6 py-16 relative overflow-hidden">
      <div
        className="absolute -top-20 -left-16 w-[360px] h-[440px] bg-gradient-to-br from-blue-500 to-navy-700 facet-cut opacity-70 pointer-events-none"
        aria-hidden
      />
      <div className="relative w-full max-w-md bg-paper rounded-2xl border border-white/10 p-8 shadow-xl">
        <p className="font-mono text-xs text-coral-500 mb-3">// iws admin</p>
        <h1 className="font-display text-3xl text-navy-900 font-semibold leading-tight">{title}</h1>
        <p className="text-slate-500 text-sm mt-2 mb-8">{subtitle}</p>
        {children}
        <a href="/" className="mt-8 block text-center font-mono text-xs text-slate-400 hover:text-navy-900">
          ← Back to website
        </a>
      </div>
    </div>
  );
}
