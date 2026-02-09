import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinkStyles = ({ isActive }: { isActive: boolean }) =>
  `relative block rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
    isActive 
      ? 'bg-ink-900 text-white shadow-md shadow-ink-900/10' 
      : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
  }`;

const AppShell = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar */}
      <aside className="border-b border-ink-200 bg-white p-5 lg:w-72 lg:border-b-0 lg:border-r lg:p-6 lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:justify-between z-10 transition-all">
        <div>
          <div className="mb-10 pl-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600">Admin Console</span>
            <div className="mt-3 flex items-center gap-3 text-ink-900">
              <img src="/mitadt_logo.png" alt="MIT ADT Logo" className="h-12 w-auto object-contain" />
              <h1 className="text-lg font-bold font-display tracking-tight leading-tight">PlacePro<br/><span className="text-sm font-medium text-ink-500">MIT ADT</span></h1>
            </div>
          </div>

          <nav className="space-y-1">
            <NavLink to="/app/forms" className={navLinkStyles} end>
              Forms Overview
            </NavLink>
            <NavLink to="/app/account" className={navLinkStyles}>
              Settings & Profile
            </NavLink>
          </nav>
        </div>

        <div>
          <div className="mb-4 rounded-2xl border border-ink-100 bg-brand-50/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-ink-900 shadow-sm border border-ink-100">
                {profile?.full_name?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-semibold text-ink-900">{profile?.full_name ?? 'Admin User'}</p>
                <p className="truncate text-xs font-medium text-ink-500 capitalize">{profile?.role ?? 'Admin'}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 shadow-sm transition-all hover:bg-ink-50 hover:border-ink-300 text-center"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="min-h-screen bg-surface-soft lg:ml-72 flex-1 p-4 lg:p-8 relative">
        <div className="mx-auto max-w-6xl space-y-8">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppShell;
