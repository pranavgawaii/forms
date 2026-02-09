import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import DynamicField from '../components/DynamicField';
import { getPublicFormBySlug, submitPublicResponse } from '../lib/formApi';
import { getThemeById } from '../lib/themePresets';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import type { FormFieldRecord } from '../types/forms';

type Answers = Record<string, string | number | string[]>;
type Errors = Record<string, string>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateAnswers = (fields: FormFieldRecord[], answers: Answers): Errors => {
  const errors: Errors = {};
  for (const field of fields) {
    if (field.field_type === 'section_title') continue;
    const value = answers[field.id];
    if (field.required) {
      if (field.field_type === 'checkbox') {
        if (!Array.isArray(value) || value.length === 0) {
          errors[field.id] = 'This field is required.';
          continue;
        }
      } else if (!String(value ?? '').trim()) {
        errors[field.id] = 'This field is required.';
        continue;
      }
    }
    if (field.field_type === 'email' && String(value ?? '').trim()) {
      if (!emailRegex.test(String(value))) {
        errors[field.id] = 'Enter a valid email address.';
      }
    }
    if (field.field_type === 'number' && String(value ?? '').trim()) {
      const numericValue = Number(value);
      if (Number.isNaN(numericValue)) {
        errors[field.id] = 'Enter a valid number.';
        continue;
      }
    }
  }
  return errors;
};

const PublicFormPage = () => {
  const { slug } = useParams();
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { user } = useAuth();

  const publicFormQuery = useQuery({
    queryKey: ['public-form', slug, user?.id],
    queryFn: () => getPublicFormBySlug(slug!),
    enabled: Boolean(slug),
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: submitPublicResponse,
    onSuccess: () => {
      setSubmitted(true);
      setSubmitError(null);
    },
    onError: (mutationError) => {
      setSubmitError((mutationError as Error).message);
    },
  });

  const emailField = useMemo(() => {
    return publicFormQuery.data?.fields.find((field) => field.field_type === 'email');
  }, [publicFormQuery.data?.fields]);

  const isDeadlinePassed = useMemo(() => {
    const deadline = publicFormQuery.data?.form?.theme?.deadline;
    if (!deadline) return false;
    return new Date() > new Date(deadline);
  }, [publicFormQuery.data?.form?.theme?.deadline]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    if (!publicFormQuery.data) return;
    if (isDeadlinePassed) return;

    const validationErrors = validateAnswers(publicFormQuery.data.fields, answers);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const payload: Answers = {};
    for (const field of publicFormQuery.data.fields) {
      if (field.field_type === 'section_title') continue;
      const value = answers[field.id];
      if (field.field_type === 'checkbox') {
        payload[field.id] = Array.isArray(value) ? value : [];
      } else if (field.field_type === 'number' && String(value ?? '').trim()) {
        payload[field.id] = Number(value);
      } else {
        payload[field.id] = String(value ?? '').trim();
      }
    }

    const respondentEmail = emailField ? String(payload[emailField.id] ?? '').trim() || null : null;

    try {
      await submitMutation.mutateAsync({
        formId: publicFormQuery.data.form.id,
        answers: payload,
        respondentEmail,
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (publicFormQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="premium-panel rounded-2xl px-5 py-3 text-sm font-semibold text-ink-600">Loading form...</div>
      </div>
    );
  }

  if (publicFormQuery.isError || !publicFormQuery.data) {
    const error = publicFormQuery.error as Error;
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-dotted flex-col gap-6">
        <div className="w-full max-w-lg rounded-3xl p-8 text-center bg-white shadow-xl border border-black/5">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-sm border border-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          </div>
          <h1 className="brand-heading text-2xl font-bold text-ink-900">Form not available</h1>
          <p className="mt-3 text-sm text-ink-600">
            {error?.message || "This form is unavailable, closed, or the link is invalid."}
          </p>
          <div className="mt-8">
            <a href="/app/forms" className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-black rounded-xl hover:bg-zinc-800 transition-colors">Back to Dashboard</a>
          </div>
        </div>
        <div className="w-full max-w-lg p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-black/5 text-[10px] font-mono text-zinc-500 overflow-hidden shadow-sm">
          <p className="font-bold mb-1 uppercase tracking-widest text-zinc-400">System Debug Info</p>
          <div className="grid grid-cols-2 gap-2">
            <div><span className="opacity-60">Slug:</span> {slug}</div>
            <div><span className="opacity-60">Status:</span> {publicFormQuery.status}</div>
            <div><span className="opacity-60">HasData:</span> {String(!!publicFormQuery.data)}</div>
            <div><span className="opacity-60">Error:</span> {error?.name || 'none'}</div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-dotted">
        <div className="w-full max-w-lg rounded-3xl p-12 text-center bg-white shadow-xl border border-black/5 animate-in fade-in zoom-in duration-500">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h1 className="brand-heading text-3xl font-bold text-ink-900">Recorded!</h1>
          <p className="mt-4 text-ink-600">Your response has been successfully submitted.<br />You can safely close this window.</p>
          <div className="mt-10">
            <button onClick={() => window.location.reload()} className="text-sm font-semibold text-zinc-400 hover:text-black transition-colors">Submit another response</button>
          </div>
        </div>
      </div>
    );
  }

  const { form, fields } = publicFormQuery.data;
  const selectedTheme = getThemeById(form.theme?.preset);

  return (
    <div className="min-h-screen bg-[#fafafa] bg-dotted px-0 sm:px-4 py-0 sm:py-10">
      <div className="mx-auto max-w-3xl sm:rounded-3xl bg-white shadow-2xl shadow-zinc-200/50 border-x border-b border-black/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        {form.status !== 'live' && (
          <div className="bg-zinc-900 px-6 py-2 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-white">
            Form Preview &mdash; {form.status} Mode
          </div>
        )}
        <div className={cn(
          "p-5 sm:p-10 border-b border-black/10 relative overflow-hidden",
          selectedTheme.headerClass
        )}>
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <div className="flex-1 w-full">
              <h1 className={cn(
                "brand-heading text-2xl sm:text-4xl font-extrabold leading-[1.1] tracking-tight",
                selectedTheme.isDark ? "text-white" : "text-ink-900"
              )}>
                {form.title}
              </h1>
              {form.description ? (
                <p className={cn(
                  "mt-2 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto",
                  selectedTheme.isDark ? "text-white/80" : "text-ink-500"
                )}>
                  {form.description}
                </p>
              ) : null}
              {form.theme?.deadline && (
                <div className={cn(
                  "mt-4 sm:mt-6 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] font-bold border",
                  selectedTheme.isDark
                    ? "bg-white/10 text-white border-white/10"
                    : "bg-zinc-50 text-zinc-500 border-black/5"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Due: {new Date(form.theme.deadline).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              )}
            </div>
          </div>
        </div>
        {isDeadlinePassed ? (
          <div className="p-10 sm:p-16 text-center text-ink-600">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-400 border border-black/5">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            </div>
            <h2 className="brand-heading text-xl sm:text-2xl font-bold text-ink-900 mb-2">Submission Closed</h2>
            <p className="text-sm text-zinc-500">The deadline for this form has passed.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-14 space-y-10 sm:space-y-12">
            <div className="space-y-8 sm:space-y-10">
              {fields.map((field) => (
                <DynamicField
                  key={field.id}
                  field={field}
                  value={answers[field.id]}
                  onChange={(value) => {
                    setAnswers((current) => ({ ...current, [field.id]: value }));
                    setErrors((current) => {
                      if (!current[field.id]) return current;
                      const next = { ...current };
                      delete next[field.id];
                      return next;
                    });
                  }}
                  error={errors[field.id]}
                  disabled={submitMutation.isPending}
                />
              ))}
            </div>
            {submitError && (
              <div className="rounded-2xl bg-red-50 p-4 text-xs sm:text-sm text-red-700 border border-red-100 flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="shrink-0 h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                <div>
                  <p className="font-bold">Submission failed</p>
                  <p className="opacity-80">{submitError}</p>
                </div>
              </div>
            )}
            <div className="pt-8 sm:pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-black/5">
              <button
                type="submit"
                disabled={submitMutation.isPending || isDeadlinePassed}
                className="w-full sm:w-auto rounded-xl sm:rounded-2xl border border-black/10 bg-white px-10 py-3.5 sm:px-12 sm:py-4 text-sm font-bold text-ink-900 shadow-sm hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] active:shadow-none"
              >
                {submitMutation.isPending ? 'Processing...' : 'Submit Form'}
              </button>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">Powered by</span>
                <span className="text-xs font-black text-ink-900">PlacePro</span>
              </div>
            </div>
          </form>
        )}
      </div>
      <p className="mt-10 mb-10 text-center text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400">MIT ADT University (CN-CRTP)</p>
    </div>
  );
};

export default PublicFormPage;
