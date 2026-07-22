import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { AuthShell, Field } from "./Login";
import { SUPER_ADMIN_EMAIL } from "../../lib/supabase";

export default function AdminSignup() {
  const { signUp, session, configured, loading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  if (!configured) return <Navigate to="/admin/setup" replace />;
  if (!loading && session) return <Navigate to="/admin" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNeedsConfirm(false);
    const { error: err, needsEmailConfirm } = await signUp(
      fullName.trim(),
      email.trim().toLowerCase(),
      password,
    );
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    if (needsEmailConfirm) {
      setNeedsConfirm(true);
      return;
    }
    navigate("/admin/pending");
  }

  return (
    <AuthShell
      title="Request team access"
      subtitle={`New accounts need approval from ${SUPER_ADMIN_EMAIL} before entering the workspace.`}
    >
      {needsConfirm ? (
        <div className="rounded-xl border border-navy-900/10 bg-white p-5 space-y-3">
          <p className="font-display text-navy-900">Check your email</p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Supabase sent a confirmation link. After you confirm, come back and{" "}
            <Link to="/admin/login" className="text-coral-500 underline">
              sign in
            </Link>
            . For local testing, you can also disable email confirmation in the Supabase dashboard
            (see instructions below the form).
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Full name" value={fullName} onChange={setFullName} required />
          <Field label="Work email" type="email" value={email} onChange={setEmail} required />
          <Field label="Password" type="password" value={password} onChange={setPassword} required />
          {error && <p className="font-mono text-xs text-coral-500">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-navy-900 text-white font-display font-medium py-3 rounded-full hover:bg-coral-500 transition-colors disabled:opacity-60"
          >
            {busy ? "Submitting…" : "Submit request"}
          </button>
        </form>
      )}
      <p className="mt-6 font-mono text-xs text-slate-500 text-center">
        Already have an account?{" "}
        <Link to="/admin/login" className="text-coral-500 hover:text-coral-400">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
