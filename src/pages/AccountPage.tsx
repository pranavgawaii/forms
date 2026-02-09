import { useAuth } from '../context/AuthContext';

const AccountPage = () => {
  const { user, profile } = useAuth();

  return (
    <section className="premium-panel mx-auto max-w-3xl rounded-3xl p-6">
      <h2 className="brand-heading text-3xl font-semibold text-ink-900">Account</h2>
      <p className="mt-1 text-sm text-ink-600">Manage your PlacePro profile details.</p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-ink-100 bg-white/80 p-4">
          <dt className="text-xs uppercase tracking-[0.12em] text-ink-500">Full Name</dt>
          <dd className="mt-1 text-sm font-semibold text-ink-900">{profile?.full_name ?? 'Not set'}</dd>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white/80 p-4">
          <dt className="text-xs uppercase tracking-[0.12em] text-ink-500">Email</dt>
          <dd className="mt-1 text-sm font-semibold text-ink-900">{user?.email ?? '-'}</dd>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white/80 p-4">
          <dt className="text-xs uppercase tracking-[0.12em] text-ink-500">Role</dt>
          <dd className="mt-1 text-sm font-semibold capitalize text-ink-900">{profile?.role ?? 'admin'}</dd>
        </div>
      </dl>
    </section>
  );
};

export default AccountPage;
