import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { deleteForm, duplicateForm, getFormsOverview } from '../lib/formApi';
import StatusBadge from '../components/StatusBadge';

const formatDate = (value: string) =>
  new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

const FormsListPage = () => {
  const queryClient = useQueryClient();

  const formsQuery = useQuery({
    queryKey: ['forms-overview'],
    queryFn: getFormsOverview,
  });

  const duplicateMutation = useMutation({
    mutationFn: duplicateForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms-overview'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms-overview'] });
    },
  });

  if (formsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-8">
          <div className="h-10 w-48 animate-pulse rounded-xl bg-ink-100" />
          <div className="h-10 w-32 animate-pulse rounded-xl bg-ink-100" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-white border border-ink-100" />
          ))}
        </div>
      </div>
    );
  }

  if (formsQuery.isError) {
    return (
      <div className="premium-card bg-red-50 border-red-100 p-6 text-sm text-red-800">
        <p className="font-semibold">Unable to load your dashboard</p>
        <p className="mt-1 opacity-90">{(formsQuery.error as Error).message}</p>
      </div>
    );
  }

  const forms = formsQuery.data ?? [];

  if (forms.length === 0) {
    return (
      <section className="premium-card p-12 text-center max-w-2xl mx-auto mt-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 shadow-sm border border-brand-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
        </div>
        <h2 className="text-2xl font-bold font-display text-ink-900">Start your first campaign</h2>
        <p className="mt-3 text-ink-500 max-w-md mx-auto">Create beautiful, engaging forms for student applications, feedback, or registrations in minutes.</p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/app/forms/new" className="btn-primary w-full sm:w-auto text-center">
            Create Blank Form
          </Link>
          <Link
            to="/app/forms/new?template=student"
            className="btn-secondary w-full sm:w-auto text-center"
          >
            Use Student Template
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display text-ink-900 tracking-tight">Dashboard</h2>
          <p className="text-ink-500 font-medium">Overview of your active forms and collection status</p>
        </div>
        <Link to="/app/forms/new" className="btn-primary flex items-center gap-2 self-start md:self-auto">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          New Form
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map((form) => (
          <div key={form.id} className="premium-card group hover:scale-[1.02] hover:shadow-floating transition-all duration-300 flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-4">
                <StatusBadge status={form.status as any} />
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => duplicateMutation.mutate(form.id)}
                    className="p-2 text-ink-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this form?')) {
                        deleteMutation.mutate(form.id);
                      }
                    }}
                    className="p-2 text-ink-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>

              <Link to={`/app/forms/${form.id}/edit`} className="block group-hover:text-brand-700 transition-colors">
                <h3 className="text-xl font-bold text-ink-900 mb-2 line-clamp-1">{form.title}</h3>
                <p className="text-sm text-ink-500 line-clamp-2 min-h-[2.5rem]">{form.description || 'No description provided'}</p>
              </Link>
            </div>

            <div className="border-t border-ink-100 p-4 bg-ink-50/50 rounded-b-2xl mt-auto">
              <div className="flex items-center justify-between text-xs font-medium text-ink-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5" title="Responses">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                    {form.responseCount}
                  </span>
                  <span>{formatDate(form.updated_at)}</span>
                </div>
                <div className="flex gap-3">
                  <a href={`/f/${form.slug}`} target="_blank" rel="noreferrer" className="hover:text-brand-600 transition-colors">
                    Preview
                  </a>
                  <Link to={`/app/forms/${form.id}/responses`} className="hover:text-brand-600 transition-colors">
                    View Results
                  </Link>
                  <Link to={`/app/forms/${form.id}/edit`} className="hover:text-brand-600 transition-colors">
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FormsListPage;
