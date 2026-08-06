import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Layers,
  Settings,
  Coins,
  Megaphone,
  Ticket,
  Star,
  FileText,
  CreditCard,
  LogOut,
  X,
  Cpu,
} from "lucide-react";
import { clearAdminToken } from "@/lib/api";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/users", label: "User List", icon: Users },
  { to: "/subscriptions", label: "Subscriptions", icon: Layers },
  { to: "/credits", label: "Credits", icon: Coins },
  { to: "/ai-configs", label: "AI Models", icon: Cpu },
  { to: "/promos", label: "Promos", icon: Ticket },
  { to: "/reviews", label: "Reviews", icon: Star },
  { to: "/broadcast", label: "Broadcast", icon: Megaphone },
  { to: "/site-pages", label: "Site pages", icon: FileText },
  { to: "/billing", label: "Billing", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: Settings },
];

type SidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

function SidebarNav({
  showClose,
  onClose,
  onLogoutClick,
}: {
  showClose?: boolean;
  onClose?: () => void;
  onLogoutClick: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-4 flex shrink-0 items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold">
            X
          </div>
          <span className="text-lg font-semibold tracking-wide">PioneerX</span>
        </div>
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-admin-muted hover:bg-white/5 hover:text-white"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-1 pr-0.5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-admin-accent-soft text-white shadow-glow border border-indigo-500/30"
                  : "text-admin-muted hover:text-white hover:bg-white/5",
              ].join(" ")
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-3 shrink-0 border-t border-admin-border pt-3">
        <button
          type="button"
          onClick={onLogoutClick}
          className="flex w-full items-center gap-3 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/15 hover:text-red-200"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  function doLogout() {
    clearAdminToken();
    setConfirmOpen(false);
    onMobileClose?.();
    navigate("/login", { replace: true });
  }

  return (
    <>
      {/* Desktop sidebar — full height of layout, does not scroll with content */}
      <aside className="hidden h-full w-[220px] shrink-0 rounded-2xl border border-admin-border bg-admin-panel p-5 lg:block">
        <SidebarNav onLogoutClick={() => setConfirmOpen(true)} />
      </aside>

      <div
        className={[
          "fixed inset-0 z-[100] lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        <div
          className={[
            "absolute inset-0 bg-black/60 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onClick={onMobileClose}
          aria-hidden
        />
        <aside
          className={[
            "absolute left-0 top-0 flex h-full w-[min(280px,88vw)] flex-col border-r border-admin-border bg-admin-panel p-5 shadow-2xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <SidebarNav
            showClose
            onClose={onMobileClose}
            onLogoutClick={() => setConfirmOpen(true)}
          />
        </aside>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            onClick={() => setConfirmOpen(false)}
            aria-hidden
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-admin-border bg-admin-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Log out?</h3>
            <p className="mt-2 text-sm text-admin-muted leading-relaxed">
              Are you sure you want to log out of the admin panel? You can
              continue if you change your mind.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-lg border border-admin-border px-4 py-2.5 text-sm font-medium text-admin-muted transition hover:bg-white/5 hover:text-white"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={doLogout}
                className="flex-1 rounded-lg bg-[#ef4444] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#dc2626]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
