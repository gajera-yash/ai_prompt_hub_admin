import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import {
  LayoutDashboard,
  FileText,
  LogOut,
  Menu,
  X,
  Layers,
  Settings,
  Terminal,
  MessageSquare,
  Bell,
  ChevronRight,
  UserCircle2,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", value: "dashboard", icon: LayoutDashboard },
  { label: "Prompts", value: "prompts", icon: FileText },
  { label: "Categories", value: "categories", icon: Layers },
  { label: "Feedback", value: "feedback", icon: MessageSquare },
  { label: "Notifications", value: "notifications", icon: Bell },
  { label: "Ad Settings", value: "ads", icon: Settings },
];

export default function Layout({ children, activeTab, onTabChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeItem = NAV_ITEMS.find((item) => item.value === activeTab);
  const pageTitle = activeItem?.label ?? "Workspace";

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 shadow-sm">
              <Terminal size={17} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900">Prompt Hub</h1>
              <p className="mt-0.5 text-[11px] text-slate-400">Admin workspace</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-5 custom-scrollbar">
          <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Menu</p>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.value;
            return (
              <button
                key={item.value}
                onClick={() => {
                  onTabChange(item.value);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-800"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon
                  size={18}
                  strokeWidth={2}
                  className={isActive ? "text-indigo-600" : "text-slate-400"}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
              </button>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-slate-200 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} strokeWidth={2} className="text-slate-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="relative z-10 flex h-screen min-w-0 w-full flex-1 flex-col overflow-hidden lg:ml-64 lg:w-auto">
        <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-full items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={20} />
              </button>
              <div>
                <div className="hidden items-center gap-1 text-xs text-slate-400 sm:flex">
                  <span>Admin</span>
                  <ChevronRight size={13} />
                  <span className="font-medium text-slate-600">{pageTitle}</span>
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:mt-1">{pageTitle}</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white py-1.5 pl-2 pr-3">
                <UserCircle2 size={22} className="text-slate-400" />
                <span className="hidden max-w-40 truncate text-sm font-medium text-slate-700 md:block">
                  {auth.currentUser?.email || "Admin account"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 custom-scrollbar sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}