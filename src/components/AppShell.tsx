import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  FilePlus,
  CircleUser,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';

const navLinkStyles = ({ isActive }: { isActive: boolean }) =>
  cn(
    "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
    isActive
      ? "bg-zinc-900 text-white shadow-xl shadow-zinc-200"
      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
  );

const AppShell = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen lg:flex bg-[#fafafa]">
      {/* Sidebar */}
      <aside className="border-b border-black/5 bg-white lg:w-72 lg:border-b-0 lg:border-r lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:justify-between z-20 transition-all duration-500">
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-lg">
                <ShieldCheck size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="brand-heading text-lg font-black tracking-tight text-zinc-950 leading-none">PlacePro</h1>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">Secure Console</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="px-4 mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Management</p>
                <nav className="space-y-1">
                  <NavLink to="/app/forms" className={navLinkStyles} end>
                    <LayoutDashboard size={18} />
                    <span>Forms Overview</span>
                  </NavLink>
                  <NavLink to="/app/forms/new" className={navLinkStyles}>
                    <FilePlus size={18} />
                    <span>Create New Form</span>
                  </NavLink>
                </nav>
              </div>

              <div>
                <p className="px-4 mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">System</p>
                <nav className="space-y-1">
                  <NavLink to="/app/account" className={navLinkStyles}>
                    <Settings size={18} />
                    <span>Account Settings</span>
                  </NavLink>
                </nav>
              </div>
            </div>
          </div>

          {/* Profile Section & Logout */}
          <div className="mt-auto p-6 border-t border-black/5">
            <div className="mb-6 rounded-2xl bg-zinc-50 border border-black/5 p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-black/5 text-zinc-950 shadow-sm">
                <CircleUser size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-xs font-bold text-zinc-950">{profile?.full_name ?? 'Administrator'}</p>
                <p className="truncate text-[10px] font-bold uppercase tracking-wider text-zinc-400">CN-CRTP Admin</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="group w-full flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-bold text-zinc-600 transition-all hover:bg-red-50 hover:border-red-100 hover:text-red-600 active:scale-[0.98]"
            >
              <LogOut size={16} className="transition-transform group-hover:-translate-x-1" />
              <span>Log Out</span>
            </button>
            <p className="mt-6 text-center text-[8px] font-bold uppercase tracking-[0.3em] text-zinc-300">
              MIT ADT — Pranav Gawai
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-h-screen lg:ml-72 flex-1 p-4 lg:p-10 relative">
        <div className="mx-auto max-w-6xl animate-in fade-in duration-700">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppShell;
