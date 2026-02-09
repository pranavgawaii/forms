import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import DynamicField from '../components/DynamicField';
import StatusBadge from '../components/StatusBadge';
import { getFormBuilderData, saveFormWithFields } from '../lib/formApi';
import { getThemeById, THEME_PRESETS } from '../lib/themePresets';
import { cn, createLocalField, getFormTemplate, getTemplateFields, slugify, toBuilderState } from '../lib/utils';
import type { EditableField, FieldType, FormBuilderState, FormFieldRecord } from '../types/forms';

const createDefaultState = (): FormBuilderState => ({
  title: 'Untitled Form',
  description: '',
  slug: `form-${Math.random().toString(36).slice(2, 7)}`,
  status: 'draft',
  isPublic: true,
  themePreset: 'royal-blue',
  deadline: null,
  fields: [],
});

const fieldTypeButtons: Array<{ label: string; type: FieldType }> = [
  { label: 'Short answer', type: 'short_text' },
  { label: 'Paragraph', type: 'long_text' },
  { label: 'Email', type: 'email' },
  { label: 'Number', type: 'number' },
  { label: 'Date', type: 'date' },
  { label: 'Dropdown', type: 'select' },
  { label: 'Checkboxes', type: 'checkbox' },
  { label: 'Section', type: 'section_title' },
];

const FormBuilderPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [builder, setBuilder] = useState<FormBuilderState>(createDefaultState);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(id);
  const templateKey = searchParams.get('template');
  const selectedTemplate = getFormTemplate(templateKey);

  const editQuery = useQuery({
    queryKey: ['form-builder', id],
    queryFn: () => getFormBuilderData(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (!selectedTemplate || isEdit) {
      return;
    }

    setBuilder((current) => {
      if (current.fields.length > 0) {
        return current;
      }

      return {
        ...current,
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        slug: slugify(selectedTemplate.slug),
        fields: getTemplateFields(selectedTemplate.key),
      };
    });
  }, [isEdit, selectedTemplate]);

  useEffect(() => {
    if (!editQuery.data) {
      return;
    }

    const state = toBuilderState(editQuery.data.form, editQuery.data.fields);
    setBuilder(state);
  }, [editQuery.data]);

  const saveMutation = useMutation({
    mutationFn: saveFormWithFields,
    onSuccess: async (savedForm) => {
      setMessage('Saved successfully.');
      setError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['forms-overview'] }),
        queryClient.invalidateQueries({ queryKey: ['form-builder', savedForm.id] }),
      ]);

      setBuilder((current) => ({
        ...current,
        id: savedForm.id,
        slug: savedForm.slug,
      }));

      if (!isEdit) {
        navigate(`/app/forms/${savedForm.id}/edit`, { replace: true });
      }
    },
    onError: (mutationError) => {
      setMessage(null);
      setError((mutationError as Error).message);
    },
  });

  const previewFields = useMemo<FormFieldRecord[]>(
    () =>
      builder.fields.map((field, index) => ({
        id: field.dbId ?? `preview-${index}`,
        form_id: builder.id ?? 'preview',
        label: field.label,
        field_type: field.fieldType,
        required: field.fieldType === 'section_title' ? false : field.required,
        help_text: field.helpText || null,
        options:
          field.fieldType === 'select' || field.fieldType === 'checkbox'
            ? { choices: field.choices }
            : field.fieldType === 'number'
              ? {
                ...(typeof field.min === 'number' ? { min: field.min } : {}),
                ...(typeof field.max === 'number' ? { max: field.max } : {}),
              }
              : field.fieldType === 'section_title'
                ? {
                  sectionDescription: field.sectionDescription,
                }
                : null,
        sort_order: index,
        created_at: new Date().toISOString(),
      })),
    [builder.fields, builder.id],
  );

  if (isEdit && editQuery.isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-20 animate-pulse rounded-2xl bg-white/80" />
        <div className="h-96 animate-pulse rounded-2xl bg-white/80" />
      </div>
    );
  }

  if (isEdit && editQuery.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/90 p-6 text-sm text-red-700 shadow-soft">
        Could not load form. {(editQuery.error as Error).message}
      </div>
    );
  }

  const selectedTheme = getThemeById(builder.themePreset);

  const updateField = (fieldId: string, updater: (field: EditableField) => EditableField) => {
    setBuilder((current) => ({
      ...current,
      fields: current.fields.map((field) => (field.id === fieldId ? updater(field) : field)),
    }));
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    setBuilder((current) => {
      const index = current.fields.findIndex((item) => item.id === fieldId);
      if (index < 0) {
        return current;
      }

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.fields.length) {
        return current;
      }

      const nextFields = [...current.fields];
      const [item] = nextFields.splice(index, 1);
      nextFields.splice(targetIndex, 0, item);

      return {
        ...current,
        fields: nextFields,
      };
    });
  };

  const handleSave = async () => {
    setMessage(null);
    setError(null);

    if (!builder.title.trim()) {
      setError('Form title is required.');
      return;
    }

    await saveMutation.mutateAsync({
      ...builder,
      slug: slugify(builder.slug || builder.title),
    });
  };

  const publicUrl = `${window.location.origin}/f/${slugify(builder.slug || builder.title)}`;

  return (
    <section className="space-y-4">
      <div className="premium-panel rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={builder.title}
            onChange={(event) => {
              const title = event.target.value;
              setBuilder((current) => ({
                ...current,
                title,
                slug: current.id ? current.slug : slugify(title),
              }));
            }}
            className="premium-input min-w-[220px] flex-1 px-3 py-2 text-lg font-semibold text-ink-900"
          />

          <select
            value={builder.status}
            onChange={(event) =>
              setBuilder((current) => ({
                ...current,
                status: event.target.value as 'draft' | 'live' | 'closed',
              }))
            }
            className="premium-input px-3 py-2 text-sm text-ink-700"
          >
            <option value="draft">Draft</option>
            <option value="live">Live</option>
            <option value="closed">Closed</option>
          </select>

          <StatusBadge status={builder.status} />

          <button
            type="button"
            onClick={() => window.open(publicUrl, '_blank', 'noopener,noreferrer')}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(publicUrl);
                setMessage('Public link copied.');
              } catch {
                setError('Clipboard access is blocked. Copy the URL from the address bar.');
              }
            }}
            className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
          >
            Share
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-ink-800 disabled:opacity-70"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink-700">Description</span>
            <textarea
              rows={2}
              value={builder.description}
              onChange={(event) => setBuilder((current) => ({ ...current, description: event.target.value }))}
              className="premium-input w-full px-3 py-2 text-sm"
              placeholder="Add context for respondents"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="mb-1 block text-sm font-semibold text-ink-700">Theme</span>
              <select
                value={builder.themePreset}
                onChange={(event) => setBuilder((current) => ({ ...current, themePreset: event.target.value }))}
                className="premium-input w-full px-3 py-2 text-sm text-ink-700"
              >
                {THEME_PRESETS.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-ink-700 sm:mt-0">
              <input
                type="checkbox"
                checked={builder.isPublic}
                onChange={(event) => setBuilder((current) => ({ ...current, isPublic: event.target.checked }))}
              />
              Public link enabled
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm font-semibold text-ink-700">Submission Deadline</span>
              <input
                type="datetime-local"
                value={builder.deadline ?? ''}
                onChange={(event) => setBuilder((current) => ({ ...current, deadline: event.target.value || null }))}
                className="premium-input w-full px-3 py-2 text-sm text-ink-700"
              />
              <span className="text-xs text-ink-500">Leaving this empty means no deadline.</span>
            </label>
          </div>
        </div>

        {message ? <p className="mt-3 text-sm text-emerald-600">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="premium-panel space-y-4 rounded-2xl p-4">
          <div>
            <h2 className="brand-heading text-2xl font-semibold text-ink-900">Builder</h2>
            <p className="text-sm text-ink-600">Add and configure fields for your form.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {fieldTypeButtons.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() =>
                  setBuilder((current) => ({
                    ...current,
                    fields: [...current.fields, createLocalField(item.type, current.fields.length)],
                  }))
                }
                className="rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-ink-50"
              >
                + {item.label}
              </button>
            ))}
          </div>

          {builder.fields.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink-300 bg-white/70 p-5 text-sm text-ink-600">
              No fields yet. Start with a field type button above.
            </div>
          ) : (
            <div className="space-y-3">
              {builder.fields.map((field, index) => (
                <div key={field.id} className="rounded-xl border border-ink-100 bg-white/80 p-4 shadow-soft">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink-900">
                      {index + 1}. {field.fieldType.replace('_', ' ')}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveField(field.id, 'up')}
                        className="rounded-lg border border-ink-200 bg-white px-2 py-1 text-xs font-semibold text-ink-700"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveField(field.id, 'down')}
                        className="rounded-lg border border-ink-200 bg-white px-2 py-1 text-xs font-semibold text-ink-700"
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setBuilder((current) => ({
                            ...current,
                            fields: current.fields.filter((item) => item.id !== field.id),
                          }))
                        }
                        className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">Label</span>
                      <input
                        value={field.label}
                        onChange={(event) => updateField(field.id, (item) => ({ ...item, label: event.target.value }))}
                        className="premium-input w-full px-3 py-2 text-sm"
                      />
                    </label>

                    {field.fieldType !== 'section_title' && (
                      <label className="inline-flex items-center gap-2 text-sm font-semibold text-ink-700">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(event) => updateField(field.id, (item) => ({ ...item, required: event.target.checked }))}
                        />
                        Required field
                      </label>
                    )}

                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
                        {field.fieldType === 'section_title' ? 'Section description' : 'Help text'}
                      </span>
                      <input
                        value={field.fieldType === 'section_title' ? field.sectionDescription ?? '' : field.helpText}
                        onChange={(event) =>
                          updateField(field.id, (item) =>
                            field.fieldType === 'section_title'
                              ? { ...item, sectionDescription: event.target.value }
                              : { ...item, helpText: event.target.value },
                          )
                        }
                        className="premium-input w-full px-3 py-2 text-sm"
                      />
                    </label>

                    {(field.fieldType === 'select' || field.fieldType === 'checkbox') && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">Options</p>
                        <div className="space-y-2">
                          {field.choices.map((choice, optionIndex) => (
                            <div key={`${field.id}-option-${optionIndex}`} className="flex items-center gap-2">
                              <input
                                value={choice}
                                onChange={(event) =>
                                  updateField(field.id, (item) => ({
                                    ...item,
                                    choices: item.choices.map((currentChoice, currentIndex) =>
                                      currentIndex === optionIndex ? event.target.value : currentChoice,
                                    ),
                                  }))
                                }
                                className="premium-input flex-1 px-3 py-2 text-sm"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateField(field.id, (item) => ({
                                    ...item,
                                    choices: item.choices.filter((_, currentIndex) => currentIndex !== optionIndex),
                                  }))
                                }
                                className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-600"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateField(field.id, (item) => ({
                              ...item,
                              choices: [...item.choices, `Option ${item.choices.length + 1}`],
                            }))
                          }
                          className="mt-2 rounded-lg border border-ink-200 bg-white px-2 py-1 text-xs font-semibold text-ink-700"
                        >
                          Add option
                        </button>
                      </div>
                    )}

                    {field.fieldType === 'number' && (
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label>
                          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">Min</span>
                          <input
                            type="number"
                            value={typeof field.min === 'number' ? field.min : ''}
                            onChange={(event) =>
                              updateField(field.id, (item) => ({
                                ...item,
                                min: event.target.value ? Number(event.target.value) : undefined,
                              }))
                            }
                            className="premium-input w-full px-3 py-2 text-sm"
                          />
                        </label>
                        <label>
                          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">Max</span>
                          <input
                            type="number"
                            value={typeof field.max === 'number' ? field.max : ''}
                            onChange={(event) =>
                              updateField(field.id, (item) => ({
                                ...item,
                                max: event.target.value ? Number(event.target.value) : undefined,
                              }))
                            }
                            className="premium-input w-full px-3 py-2 text-sm"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="premium-panel rounded-2xl p-5 border border-black/5">
            <h2 className="brand-heading text-xl font-bold text-ink-900">Live preview</h2>
            <p className="text-xs text-ink-500 font-medium">This is how respondents will see your form.</p>
          </div>

          <div className="premium-panel overflow-hidden rounded-3xl border border-black/5 shadow-2xl shadow-zinc-200/50 bg-white bg-dotted">
            <div className={cn(
              "p-5 border-b border-black/10 flex flex-col items-center justify-center text-center",
              selectedTheme.headerClass
            )}>
              <div className="flex-1 w-full">
                <h3 className={cn(
                  "brand-heading text-lg font-extrabold leading-tight truncate",
                  selectedTheme.isDark ? "text-white" : "text-ink-900"
                )}>
                  {builder.title || 'Untitled Form'}
                </h3>
                {builder.description ? (
                  <p className={cn(
                    "mt-1 text-[10px] leading-relaxed line-clamp-2 mx-auto",
                    selectedTheme.isDark ? "text-white/80" : "text-ink-500"
                  )}>
                    {builder.description}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="p-6 space-y-8 bg-white min-h-[400px]">
              {previewFields.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-black/5 flex items-center justify-center mb-4 text-zinc-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Add fields to start preview</p>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="space-y-8">
                    {previewFields.map((field) => (
                      <DynamicField key={field.id} field={field} readOnly disabled value={field.field_type === 'checkbox' ? [] : ''} />
                    ))}
                  </div>
                  <div className="pt-8 border-t border-black/5 flex items-center justify-between">
                    <div className="rounded-xl border border-black/10 bg-white px-8 py-3 text-[10px] font-bold text-ink-900 shadow-sm opacity-60">
                      Submit Form
                    </div>
                    <div className="flex items-center gap-2 opacity-40">
                      <span className="text-[7px] font-bold uppercase tracking-wider text-zinc-400">Powered by</span>
                      <span className="text-[9px] font-black text-ink-900">PlacePro</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-black/5 bg-zinc-50/50 text-center">
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-400">MIT ADT University (CN-CRTP)</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FormBuilderPage;
