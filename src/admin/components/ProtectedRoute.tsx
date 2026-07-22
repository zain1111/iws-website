import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { loading, session, isApproved, isAdmin, configured } = useAuth();
  const location = useLocation();

  if (!configured) {
    return <Navigate to="/admin/setup" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-sm text-slate-500">
        Loading workspace…
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (!isApproved) {
    return <Navigate to="/admin/pending" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
