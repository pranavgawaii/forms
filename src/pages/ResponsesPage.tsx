import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { exportResponsesToCsv } from '../lib/csv';
import { getResponsesBundle } from '../lib/formApi';
import { useAuth } from '../context/AuthContext';
import type { FormFieldRecord, FormResponseRecord } from '../types/forms';

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

const fieldAnswerToText = (field: FormFieldRecord, response: FormResponseRecord): string => {
  if (!response.answers) return '-';
  const value = response.answers[field.id];
  if (Array.isArray(value)) return value.join(', ');
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
};

const ResponsesPage = () => {
  const { id } = useParams();
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<FormResponseRecord | null>(null);

  const { user } = useAuth();
  const responsesQuery = useQuery({
    queryKey: ['responses', id, user?.id],
    queryFn: () => getResponsesBundle(id!),
    enabled: Boolean(id),
  });

  const keyFields = useMemo(() => {
    const fields = responsesQuery.data?.fields || [];
    return fields.filter((field) =>
      field.field_type !== 'section_title' &&
      field.label.toLowerCase() !== 'full name' &&
      field.label.toLowerCase() !== 'email'
    ).slice(0, 3);
  }, [responsesQuery.data?.fields]);

  const filteredResponses = useMemo(() => {
    const responses = responsesQuery.data?.responses || [];
    return responses.filter((response) => {
      const submittedDate = new Date(response.submitted_at);
      if (startDate) {
        const minDate = new Date(`${startDate}T00:00:00`);
        if (submittedDate < minDate) return false;
      }
      if (endDate) {
        const maxDate = new Date(`${endDate}T23:59:59`);
        if (submittedDate > maxDate) return false;
      }
      if (!searchText.trim()) return true;

      const firstField = keyFields[0] ? fieldAnswerToText(keyFields[0], response) : '';
      const stack = `${response.respondent_email ?? ''} ${firstField}`.toLowerCase();
      return stack.includes(searchText.toLowerCase());
    });
  }, [endDate, keyFields, responsesQuery.data?.responses, searchText, startDate]);

  if (responsesQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24 animate-pulse rounded-2xl bg-white border border-ink-100" />
        <div className="h-96 animate-pulse rounded-2xl bg-white border border-ink-100" />
      </div>
    );
  }

  if (responsesQuery.isError || !responsesQuery.data) {
    return (
      <div className="premium-card bg-red-50 border-red-100 p-6 text-sm text-red-800">
        <p className="font-semibold">Unable to load responses</p>
        <p className="mt-1 opacity-90">{(responsesQuery.error as Error)?.message}</p>
      </div>
    );
  }

  const { form, fields } = responsesQuery.data;

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/app/forms" className="text-sm font-medium text-ink-500 hover:text-ink-800 transition-colors">Forms</Link>
            <span className="text-ink-300">/</span>
            <span className="text-sm font-medium text-ink-900 truncate max-w-[200px]">{form.title}</span>
          </div>
          <h2 className="text-3xl font-bold font-display text-ink-900 tracking-tight">Responses</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`/f/${form.slug}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            View Live Form
          </a>
          <button
            type="button"
            onClick={() => exportResponsesToCsv({ formTitle: form.title, fields, responses: filteredResponses })}
            disabled={filteredResponses.length === 0}
            className="btn-primary flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className="premium-card p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            placeholder="Search by email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
          />
        </div>
        <div className="flex gap-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-ink-600"
            aria-label="Start Date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-ink-600"
            aria-label="End Date"
          />
        </div>
      </div>

      {filteredResponses.length === 0 ? (
        <div className="premium-card p-12 text-center">
          <div className="mx-auto h-16 w-16 bg-ink-50 rounded-full flex items-center justify-center text-ink-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14 2z" /><polyline points="14 2 14 8 20 8" /></svg>
          </div>
          <p className="text-lg font-semibold text-ink-900">No responses found</p>
          <p className="text-ink-500 text-sm mt-1">Share your form link to start collecting data.</p>
        </div>
      ) : (
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-50 border-b border-ink-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-ink-900 w-48">Submitted</th>
                  <th className="px-6 py-4 font-semibold text-ink-900">Respondent</th>
                  {keyFields.map((field) => (
                    <th key={field.id} className="px-6 py-4 font-normal text-ink-500 truncate max-w-[200px]">
                      {field.label}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 bg-white">
                {filteredResponses.map((response) => (
                  <tr key={response.id} className="hover:bg-brand-50/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-ink-900 whitespace-nowrap">
                      {formatDateTime(response.submitted_at)}
                    </td>
                    <td className="px-6 py-4 text-ink-600">
                      {response.respondent_email || <span className="text-ink-400 italic">Anonymous</span>}
                    </td>
                    {keyFields.map((field) => (
                      <td key={field.id} className="px-6 py-4 text-ink-600 truncate max-w-[200px]">
                        {fieldAnswerToText(field, response)}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedResponse(response)}
                        className="text-brand-600 font-medium hover:text-brand-800 transition-colors text-xs uppercase tracking-wide opacity-0 group-hover:opacity-100"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-floating max-w-2xl w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-ink-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-display text-ink-900">Response Details</h3>
                <p className="text-sm text-ink-500 mt-1">{formatDateTime(selectedResponse.submitted_at)}</p>
              </div>
              <button onClick={() => setSelectedResponse(null)} className="p-2 hover:bg-ink-100 rounded-full transition-colors text-ink-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-ink-400">Respondent Email</label>
                <p className="mt-1 text-ink-900 font-medium text-lg">{selectedResponse.respondent_email || 'Anonymous'}</p>
              </div>
              <div className="h-px bg-ink-100 w-full" />
              <div className="space-y-6">
                {fields.map((field) => {
                  if (field.field_type === 'section_title') return null;
                  return (
                    <div key={field.id}>
                      <p className="text-sm font-medium text-ink-500 mb-1.5">{field.label}</p>
                      <div className="text-ink-900 bg-ink-50 p-3 rounded-lg text-sm border border-ink-100">
                        {fieldAnswerToText(field, selectedResponse)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t border-ink-100 bg-ink-50 rounded-b-2xl flex justify-end">
              <button onClick={() => setSelectedResponse(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ResponsesPage;
