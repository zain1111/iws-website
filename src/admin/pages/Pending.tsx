import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { AuthShell } from "./Login";

export default function AdminPending() {
  const { session, profile, isApproved, signOut, loading, configured } = useAuth();

  if (!configured) return <Navigate to="/admin/setup" replace />;
  if (!loading && !session) return <Navigate to="/admin/login" replace />;
  if (!loading && isApproved) return <Navigate to="/admin" replace />;

  const rejected = profile?.status === "rejected";

  return (
    <AuthShell
      title={rejected ? "Request declined" : "Waiting for approval"}
      subtitle={
        rejected
          ? "Your signup was not approved. Contact the founder if you believe this is a mistake."
          : "Your account is pending review. You'll get access once an admin approves your request."
      }
    >
      <div className="rounded-xl border border-navy-900/10 bg-white p-5">
        <p className="font-mono text-xs text-slate-500 uppercase tracking-wide">Status</p>
        <p className={`font-display text-2xl mt-1 ${rejected ? "text-coral-500" : "text-navy-900"}`}>
          {profile?.status ?? "pending"}
        </p>
        <p className="text-sm text-slate-500 mt-3">{profile?.email}</p>
      </div>
      <button
        onClick={() => void signOut()}
        className="mt-6 w-full border border-navy-900/15 font-display text-sm py-3 rounded-full hover:border-coral-500 hover:text-coral-500 transition-colors"
      >
        Sign out
      </button>
      <Link to="/" className="mt-4 block text-center font-mono text-xs text-slate-400">
        ← Website
      </Link>
    </AuthShell>
  );
}
