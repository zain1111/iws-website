import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const linkBase =
  "block px-4 py-2.5 rounded-xl font-display text-sm transition-colors";

export default function AdminShell() {
  const { profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const nav = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/projects", label: "Projects" },
    { to: "/admin/tasks", label: "My Tasks" },
    { to: "/admin/salaries", label: "Salaries" },
    ...(isAdmin
      ? [
          { to: "/admin/finance", label: "Finance" },
          { to: "/admin/users", label: "Users" },
          { to: "/admin/clients", label: "Clients" },
          { to: "/admin/invoices", label: "Invoices" },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-paper text-ink-900 flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-navy-900 text-white min-h-screen sticky top-0">
        <div className="px-6 pt-8 pb-6 border-b border-white/10">
          <p className="font-mono text-xs text-sky-400 mb-1">// iws workspace</p>
          <p className="font-display text-xl font-semibold">Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? "bg-coral-500 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <p className="font-display text-sm text-white truncate">{profile?.full_name}</p>
          <p className="font-mono text-[11px] text-slate-400 truncate mt-0.5">{profile?.email}</p>
          <p className="font-mono text-[10px] text-coral-400 uppercase tracking-wide mt-2">{profile?.role?.replace("_", " ")}</p>
          <button
            onClick={async () => {
              await signOut();
              navigate("/admin/login");
            }}
            className="mt-4 w-full text-left font-mono text-xs text-slate-400 hover:text-coral-400 transition-colors"
          >
            Sign out →
          </button>
          <a href="/" className="mt-2 block font-mono text-xs text-sky-400 hover:text-sky-300">
            ← Back to website
          </a>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden sticky top-0 z-40 bg-navy-900 text-white px-4 py-3 flex items-center justify-between">
          <p className="font-display font-medium">IWS Admin</p>
          <button
            onClick={async () => {
              await signOut();
              navigate("/admin/login");
            }}
            className="font-mono text-xs text-slate-300"
          >
            Sign out
          </button>
        </header>
        <nav className="md:hidden flex gap-2 overflow-x-auto px-4 py-3 bg-white border-b border-navy-900/10">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `shrink-0 px-3 py-1.5 rounded-full font-mono text-xs border ${
                  isActive
                    ? "bg-navy-900 text-white border-navy-900"
                    : "border-navy-900/15 text-navy-900"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 p-5 sm:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
