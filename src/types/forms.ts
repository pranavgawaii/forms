export type FormStatus = 'draft' | 'live' | 'closed';

export type FieldType =
  | 'short_text'
  | 'long_text'
  | 'email'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'section_title';

export interface FormTheme {
  id: string;
  label: string;
  headerClass: string;
  accentClass: string;
  isDark: boolean;
}

export interface FormRecord {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  slug: string;
  is_public: boolean;
  status: FormStatus;
  theme: { preset?: string; deadline?: string | null } | null;
  created_at: string;
  updated_at: string;
}

export interface FormFieldRecord {
  id: string;
  form_id: string;
  label: string;
  field_type: FieldType;
  required: boolean;
  help_text: string | null;
  options: {
    choices?: string[];
    min?: number;
    max?: number;
    sectionDescription?: string;
  } | null;
  sort_order: number;
  created_at: string;
}

export interface FormResponseRecord {
  id: string;
  form_id: string;
  submitted_at: string;
  respondent_email: string | null;
  answers: Record<string, string | number | string[]>;
}

export interface FormBuilderState {
  id?: string;
  title: string;
  description: string;
  slug: string;
  status: FormStatus;
  isPublic: boolean;
  themePreset: string;
  deadline: string | null;
  fields: EditableField[];
}

export interface EditableField {
  id: string;
  dbId?: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  helpText: string;
  choices: string[];
  min?: number;
  max?: number;
  sectionDescription?: string;
}
