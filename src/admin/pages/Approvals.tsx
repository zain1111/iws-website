import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/** Kept for old links — approvals now live under Users. */
export default function ApprovalsPage() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/admin" replace />;
  return <Navigate to="/admin/users?status=pending" replace />;
}
