import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { LayoutDashboard, FileText, LogOut, Menu, X, Layers, FolderTree, Settings, Terminal, MessageSquare, Bell } from "lucide-react";

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

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex font-sans selection:bg-blue-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto shadow-xl lg:shadow-none flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-black rounded-lg">
              <Terminal size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 tracking-tight">
                Prompt Hub
              </h1>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-50 lg:hidden transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
            Overview
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.value;
            return (
              <button
                key={item.value}
                onClick={() => {
                  onTabChange(item.value);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <item.icon
                  size={18}
                  className={isActive ? "text-blue-600" : "text-gray-400"}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} className="text-gray-400 group-hover:text-red-600" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10 w-full overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 bg-white sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-50 lg:hidden transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden lg:block">
              <h2 className="text-lg font-semibold text-gray-900 capitalize tracking-tight">
                {activeTab.replace(/([A-Z])/g, ' $1').trim()}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-100 text-xs font-medium text-green-700">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
               Live
             </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}