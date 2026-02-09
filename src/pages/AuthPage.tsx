import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] bg-dotted px-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-zinc-200/50 border border-black/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="p-8 sm:p-12">
          <div className="mb-8 flex justify-center">
            <img src="/mitadt_logo.png" alt="MIT ADT Logo" className="h-16 w-auto object-contain" />
          </div>

          <div className="text-center mb-10">
            <h1 className="brand-heading text-2xl font-extrabold text-ink-900 tracking-tight">
              PlacePro
            </h1>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
              MIT ADT UNIVERSITY (CN-CRTP)
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 ml-1">
                Academic Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full h-[42px] px-4 text-sm bg-zinc-50 border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder:text-zinc-300"
                placeholder="teacher@college.edu"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  required
                  minLength={6}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full h-[42px] pl-4 pr-10 text-sm bg-zinc-50 border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder:text-zinc-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-ink-900 transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-[11px] text-red-600 font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-600 font-medium">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[42px] rounded-xl border border-black/10 bg-white text-sm font-bold text-ink-900 shadow-sm hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
            >
              {submitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="p-6 border-t border-black/5 bg-zinc-50/50 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400">
            Secure Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
