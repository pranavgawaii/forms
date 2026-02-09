import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type AuthTab = 'login' | 'register';

const AuthPage = () => {
  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();

  if (user) {
    return <Navigate to="/app/forms" replace />;
  }

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    resetMessages();
    setSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    setSuccess('Login successful. Redirecting...');
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    resetMessages();
    setSubmitting(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setSubmitting(false);
      setError(signUpError.message);
      return;
    }

    if (data.user) {
      await supabase.from('users_profile').upsert({
        id: data.user.id,
        full_name: fullName,
      });
    }

    setSubmitting(false);

    if (data.session) {
      setSuccess('Account created. Redirecting...');
      return;
    }

    setSuccess('Account created. Check your inbox to verify your email, then login.');
    setTab('login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="premium-panel w-full max-w-md rounded-3xl p-6">
        <div className="mb-6 flex justify-center">
           <img src="/mitadt_logo.png" alt="MIT ADT Logo" className="h-24 w-auto drop-shadow-sm" />
        </div>
        <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Placement Operations Suite</p>
        <h1 className="brand-heading mt-2 text-center text-3xl font-semibold text-ink-900">PlacePro- MIT ADT</h1>
        <p className="mt-2 text-center text-sm text-ink-600">Sign in to create polished forms and manage campus responses.</p>

        <div className="mt-6 grid grid-cols-2 rounded-xl border border-ink-100 bg-white/80 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              resetMessages();
            }}
            className={`rounded-lg px-3 py-2 transition ${tab === 'login' ? 'bg-ink-900 text-white shadow-soft' : 'text-ink-500 hover:text-ink-700'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              resetMessages();
            }}
            className={`rounded-lg px-3 py-2 transition ${tab === 'register' ? 'bg-ink-900 text-white shadow-soft' : 'text-ink-500 hover:text-ink-700'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="mt-5 space-y-4">
          {tab === 'register' ? (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink-700">Full name</span>
              <input
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="premium-input w-full px-3 py-2.5 text-sm"
                placeholder="Dr. Aditi Kulkarni"
              />
            </label>
          ) : null}

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink-700">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="premium-input w-full px-3 py-2.5 text-sm"
              placeholder="teacher@college.edu"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink-700">Password</span>
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="premium-input w-full px-3 py-2.5 text-sm"
              placeholder="At least 6 characters"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Please wait...' : tab === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
