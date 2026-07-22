import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Catches Supabase auth redirects that land on the site root with a hash like:
 * #error=access_denied&error_code=otp_expired&error_description=...
 * and sends the user to /admin/login with a readable message.
 */
export default function AuthHashRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const error = params.get("error");
    const code = params.get("error_code");
    const description = params.get("error_description");

    if (error || code) {
      const message =
        code === "otp_expired"
          ? "That email link has expired or was already used. Sign in, or ask an admin to confirm your account in Supabase."
          : description?.replace(/\+/g, " ") || "Email verification failed. Please try signing in again.";

      window.history.replaceState(null, "", window.location.pathname);
      navigate(`/admin/login?error=${encodeURIComponent(message)}`, { replace: true });
      return;
    }

    // Successful magic-link / confirm tokens also arrive in the hash; send to admin.
    if (params.get("access_token") || params.get("type") === "signup" || params.get("type") === "recovery") {
      window.history.replaceState(null, "", "/admin/login");
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  return null;
}
