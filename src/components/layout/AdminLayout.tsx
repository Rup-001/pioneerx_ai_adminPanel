import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-admin-bg">
      {/* Mobile top bar */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-admin-border bg-admin-bg px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-xl border border-admin-border bg-admin-panel p-2 text-admin-muted hover:text-white"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold">
            X
          </div>
          <span className="text-sm font-semibold tracking-wide">
            PioneerX Admin
          </span>
        </div>
        <div className="w-10" aria-hidden />
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 gap-4 overflow-hidden p-3 sm:p-4 md:gap-5 md:p-6">
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        {/* Only the main column scrolls — sidebar stays put */}
        <main className="scrollbar-hide min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-auto pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
