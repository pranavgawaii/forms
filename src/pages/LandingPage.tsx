import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen px-4 pb-16 pt-6 sm:px-6">
      <header className="premium-panel mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-5">
        <div className="flex items-center gap-4">
          <img src="/mitadt_logo.png" alt="MIT ADT Logo" className="h-12 w-auto" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-700">Premium Placement Platform</p>
            <h1 className="brand-heading text-xl font-semibold text-ink-900">PlacePro- MIT ADT</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={user ? '/app/forms' : '/auth'}
            className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-brand-300 hover:bg-brand-50"
          >
            {user ? 'Go to Dashboard' : 'Login'}
          </Link>
          <Link to="/auth" className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-800">
            Start Building
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 pt-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
            Built for placement cells and academic teams
          </p>
          <h2 className="brand-heading mt-6 text-4xl font-semibold leading-tight text-ink-900 sm:text-5xl">
            Premium form workflows for campus placements.
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-ink-600">
            Launch branded application forms, collect structured student responses, and export analytics in one polished dashboard.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth" className="rounded-xl bg-ink-900 px-5 py-3 text-sm font-semibold text-white shadow-luxe transition hover:bg-ink-800">
              Create your first form
            </Link>
            <a href="#features" className="rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-700 transition hover:bg-ink-50">
              Explore features
            </a>
          </div>
        </div>

        <div className="premium-panel rounded-3xl p-6">
          <h3 className="brand-heading text-2xl font-semibold text-ink-900">What You Get</h3>
          <ul id="features" className="mt-5 space-y-3 text-sm text-ink-700">
            <li className="rounded-xl border border-white/80 bg-white/70 px-4 py-3">Live form builder with branded themes and instant preview</li>
            <li className="rounded-xl border border-white/80 bg-white/70 px-4 py-3">Secure public links for student submissions without login</li>
            <li className="rounded-xl border border-white/80 bg-white/70 px-4 py-3">Response dashboard, quick filtering, and one-click CSV export</li>
            <li className="rounded-xl border border-white/80 bg-white/70 px-4 py-3">Supabase Auth and RLS-backed data ownership</li>
          </ul>

          <div className="mt-6 rounded-2xl bg-gradient-to-r from-ink-900 via-ink-800 to-brand-800 p-4 text-white shadow-soft">
            <p className="text-xs uppercase tracking-[0.14em] text-brand-100">Institution-ready</p>
            <p className="mt-1 text-sm text-white/90">PlacePro- MIT ADT is optimized for placements, internships, and student coordination workflows.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
