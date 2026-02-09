import { supabase, supabaseAnon } from './supabase';
import type { EditableField, FieldType, FormBuilderState, FormFieldRecord, FormRecord, FormResponseRecord } from '../types/forms';
import { buildOptionsPayload, slugify } from './utils';

interface FormOverview extends FormRecord {
  responseCount: number;
}

const normalizeForm = (row: any): FormRecord => ({
  id: row.id,
  owner_id: row.owner_id,
  title: row.title,
  description: row.description,
  slug: row.slug,
  is_public: row.is_public,
  status: row.status,
  theme: row.theme,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const normalizeField = (row: any): FormFieldRecord => ({
  id: row.id,
  form_id: row.form_id,
  label: row.label,
  field_type: row.field_type as FieldType,
  required: row.required,
  help_text: row.help_text,
  options: row.options,
  sort_order: row.sort_order,
  created_at: row.created_at,
});

const normalizeResponse = (row: any): FormResponseRecord => ({
  id: row.id,
  form_id: row.form_id,
  submitted_at: row.submitted_at,
  respondent_email: row.respondent_email,
  answers: row.answers || {},
});

const randomSuffix = () => Math.random().toString(36).slice(2, 6);

export const getFormsOverview = async (): Promise<FormOverview[]> => {
  const { data: formsData, error: formsError } = await supabase
    .from('forms')
    .select(
      `
        id,
        owner_id,
        title,
        description,
        slug,
        is_public,
        status,
        theme,
        created_at,
        updated_at,
        form_responses(count)
      `,
    )
    .order('updated_at', { ascending: false });

  if (formsError) {
    throw formsError;
  }

  return (formsData ?? []).map((row: any) => {
    const rawCount = Array.isArray(row.form_responses) ? row.form_responses[0]?.count : row.form_responses?.count;
    const count = Number(rawCount ?? 0);
    return {
      ...normalizeForm(row),
      responseCount: Number.isFinite(count) ? count : 0,
    };
  });
};

export const duplicateForm = async (formId: string): Promise<{ id: string }> => {
  const { data: formData, error: formError } = await supabase.from('forms').select('*').eq('id', formId).single();
  if (formError) {
    throw formError;
  }

  const { data: fieldData, error: fieldError } = await supabase
    .from('form_fields')
    .select('*')
    .eq('form_id', formId)
    .order('sort_order', { ascending: true });

  if (fieldError) {
    throw fieldError;
  }

  const baseSlug = slugify(`${formData.slug}-copy`);
  const duplicatedSlug = `${baseSlug}-${randomSuffix()}`;

  const { data: insertedForm, error: insertFormError } = await supabase
    .from('forms')
    .insert({
      owner_id: formData.owner_id,
      title: `${formData.title} (Copy)`,
      description: formData.description,
      slug: duplicatedSlug,
      is_public: formData.is_public,
      status: 'draft',
      theme: formData.theme,
    })
    .select('id')
    .single();

  if (insertFormError) {
    throw insertFormError;
  }

  const fieldsToInsert = (fieldData ?? []).map((field) => ({
    form_id: insertedForm.id,
    label: field.label,
    field_type: field.field_type,
    required: field.required,
    help_text: field.help_text,
    options: field.options,
    sort_order: field.sort_order,
  }));

  if (fieldsToInsert.length > 0) {
    const { error: insertFieldsError } = await supabase.from('form_fields').insert(fieldsToInsert);
    if (insertFieldsError) {
      throw insertFieldsError;
    }
  }

  return insertedForm;
};

export const deleteForm = async (formId: string) => {
  const { error } = await supabase.from('forms').delete().eq('id', formId);
  if (error) {
    throw error;
  }
};

const prepareFieldsPayload = (formId: string, fields: EditableField[]) => {
  return fields.map((field, index) => ({
    ...(field.dbId ? { id: field.dbId } : {}),
    form_id: formId,
    label: field.label,
    field_type: field.fieldType,
    required: field.fieldType === 'section_title' ? false : field.required,
    help_text: field.helpText.trim() || null,
    options: buildOptionsPayload(field),
    sort_order: index,
  }));
};

export const saveFormWithFields = async (state: FormBuilderState) => {
  const basePayload = {
    title: state.title.trim(),
    description: state.description.trim() || null,
    slug: slugify(state.slug || state.title),
    status: state.status,
    is_public: state.isPublic,
    theme: { preset: state.themePreset, deadline: state.deadline },
  };

  if (state.id) {
    const { data: updatedForm, error: updateError } = await supabase
      .from('forms')
      .update(basePayload)
      .eq('id', state.id)
      .select('*')
      .single();

    if (updateError) {
      throw updateError;
    }

    const { error: deleteError } = await supabase.from('form_fields').delete().eq('form_id', state.id);
    if (deleteError) {
      throw deleteError;
    }

    const fieldsPayload = prepareFieldsPayload(state.id, state.fields);
    if (fieldsPayload.length > 0) {
      const { error: insertError } = await supabase.from('form_fields').insert(fieldsPayload);
      if (insertError) {
        throw insertError;
      }
    }

    return normalizeForm(updatedForm);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to create a form.');
  }

  let insertedForm: any = null;
  let lastInsertError: any = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = attempt === 0 ? basePayload.slug : `${basePayload.slug}-${randomSuffix()}`;
    const { data, error: insertError } = await supabase
      .from('forms')
      .insert({
        ...basePayload,
        owner_id: user.id,
        slug,
      })
      .select('*')
      .single();

    if (!insertError) {
      insertedForm = data;
      break;
    }

    const isSlugConflict = insertError.code === '23505';
    if (!isSlugConflict) {
      console.error('Database Error during form creation:', insertError);
      throw new Error(`Database error (${insertError.code}): ${insertError.message}`);
    }

    lastInsertError = insertError;
  }

  if (!insertedForm) {
    throw lastInsertError ?? new Error('Could not create form.');
  }

  const fieldsPayload = prepareFieldsPayload(insertedForm.id, state.fields);
  if (fieldsPayload.length > 0) {
    const { error: insertFieldsError } = await supabase.from('form_fields').insert(fieldsPayload);
    if (insertFieldsError) {
      throw insertFieldsError;
    }
  }

  return normalizeForm(insertedForm);
};

export const getFormBuilderData = async (formId: string) => {
  const [{ data: formData, error: formError }, { data: fieldRows, error: fieldError }] = await Promise.all([
    supabase.from('forms').select('*').eq('id', formId).single(),
    supabase.from('form_fields').select('*').eq('form_id', formId).order('sort_order', { ascending: true }),
  ]);

  if (formError) {
    throw formError;
  }

  if (fieldError) {
    throw fieldError;
  }

  return {
    form: normalizeForm(formData),
    fields: (fieldRows ?? []).map(normalizeField),
  };
};

export const getPublicFormBySlug = async (slug: string) => {
  // 1. Attempt to resolve the current user (Owner)
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  // 2. Define the query based on authentication status
  let query = supabase.from('forms').select('*').eq('slug', slug);

  // If not logged in, strict filtering applies immediately to ensure we find the public form
  // even if RLS is open or misconfigured, and to match the 'anon' expectation.
  if (!userId) {
    query = query.eq('is_public', true).eq('status', 'live');
  }

  const { data: formData, error: formError } = await query.single();

  if (formError) {
    console.error('getPublicFormBySlug Error:', formError);
    // If we are logged in but tried to view a non-existent or inaccessible form
    throw formError;
  }

  // 3. Double-check access (Redundant for anon due to query filters, but critical for Owners viewing drafts)
  const isOwner = userId && formData.owner_id === userId;
  const isPubliclyAccessible = formData.status === 'live' && formData.is_public;

  if (!isOwner && !isPubliclyAccessible) {
    throw new Error('Form not available (Private or Draft)');
  }

  // 4. Load Fields
  const { data: fieldRows, error: fieldError } = await supabase
    .from('form_fields')
    .select('*')
    .eq('form_id', formData.id)
    .order('sort_order', { ascending: true });

  if (fieldError) {
    throw fieldError;
  }

  return {
    form: normalizeForm(formData),
    fields: (fieldRows ?? []).map(normalizeField),
  };
};

export const submitPublicResponse = async (params: {
  formId: string;
  answers: Record<string, string | number | string[]>;
  respondentEmail: string | null;
}) => {
  const { error } = await supabaseAnon.from('form_responses').insert({
    form_id: params.formId,
    answers: params.answers,
    respondent_email: params.respondentEmail,
  });

  if (error) {
    throw error;
  }
};

export const getResponsesBundle = async (formId: string) => {
  const [{ data: formData, error: formError }, { data: fieldRows, error: fieldError }, { data: responseRows, error: responseError }] =
    await Promise.all([
      supabase.from('forms').select('*').eq('id', formId).single(),
      supabase.from('form_fields').select('*').eq('form_id', formId).order('sort_order', { ascending: true }),
      supabase.from('form_responses').select('*').eq('form_id', formId).order('submitted_at', { ascending: false }),
    ]);

  if (formError) {
    console.error('getResponsesBundle Error (form):', formError);
    throw formError;
  }

  if (fieldError) {
    console.error('getResponsesBundle Error (fields):', fieldError);
    throw fieldError;
  }

  if (responseError) {
    console.error('getResponsesBundle Error (responses):', responseError);
    throw responseError;
  }

  return {
    form: normalizeForm(formData),
    fields: (fieldRows ?? []).map(normalizeField),
    responses: (responseRows ?? []).map(normalizeResponse),
  };
};
