import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { EditableField, FieldType, FormBuilderState } from '../types/forms';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const randomSuffix = () => Math.random().toString(36).slice(2, 7);

export const slugify = (value: string): string => {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return normalized.length > 0 ? normalized : `form-${randomSuffix()}`;
};

export const createLocalField = (fieldType: FieldType, index: number): EditableField => ({
  id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  label: defaultLabel(fieldType, index),
  fieldType,
  required: fieldType !== 'section_title',
  helpText: '',
  choices: fieldType === 'select' || fieldType === 'checkbox' ? ['Option 1', 'Option 2'] : [],
});

const defaultLabel = (type: FieldType, index: number) => {
  const labelMap: Record<FieldType, string> = {
    short_text: 'Short answer question',
    long_text: 'Long answer question',
    email: 'Email address',
    number: 'Number input',
    date: 'Date input',
    select: 'Select an option',
    checkbox: 'Choose one or more',
    section_title: 'Section heading',
  };

  return `${labelMap[type]} ${index + 1}`;
};

export const buildOptionsPayload = (field: EditableField) => {
  if (field.fieldType === 'select' || field.fieldType === 'checkbox') {
    return { choices: field.choices.filter((choice) => choice.trim()) };
  }

  if (field.fieldType === 'number') {
    return {
      ...(typeof field.min === 'number' ? { min: field.min } : {}),
      ...(typeof field.max === 'number' ? { max: field.max } : {}),
    };
  }

  if (field.fieldType === 'section_title') {
    return {
      sectionDescription: field.sectionDescription ?? '',
    };
  }

  return null;
};

export const toBuilderState = (
  form: {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    status: 'draft' | 'live' | 'closed';
    is_public: boolean;
    theme: { preset?: string; deadline?: string | null } | null;
  },
  fields: Array<{
    id: string;
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
  }>
): FormBuilderState => ({
  id: form.id,
  title: form.title,
  description: form.description ?? '',
  slug: form.slug,
  status: form.status,
  isPublic: form.is_public,
  themePreset: form.theme?.preset ?? 'royal-blue',
  deadline: form.theme?.deadline ?? null,
  fields: fields.map((field) => ({
    id: `local-${field.id}`,
    dbId: field.id,
    label: field.label,
    fieldType: field.field_type,
    required: field.required,
    helpText: field.help_text ?? '',
    choices: field.options?.choices ?? [],
    min: field.options?.min,
    max: field.options?.max,
    sectionDescription: field.options?.sectionDescription,
  })),
});

const createTemplateFieldId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `template-${crypto.randomUUID()}`;
  }

  return `template-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const buildStudentTemplateFields = (): EditableField[] => [
  {
    id: createTemplateFieldId(),
    label: 'Full Name',
    fieldType: 'short_text',
    required: true,
    helpText: '',
    choices: [],
  },
  {
    id: createTemplateFieldId(),
    label: 'Institutional Email',
    fieldType: 'email',
    required: true,
    helpText: 'Use your institute-issued email id.',
    choices: [],
  },
  {
    id: createTemplateFieldId(),
    label: 'Program / Branch',
    fieldType: 'select',
    required: true,
    helpText: '',
    choices: ['CSE', 'IT', 'ECE', 'ENTC', 'Mechanical', 'Civil'],
  },
  {
    id: createTemplateFieldId(),
    label: 'Year',
    fieldType: 'select',
    required: true,
    helpText: '',
    choices: ['First', 'Second', 'Third', 'Final'],
  },
  {
    id: createTemplateFieldId(),
    label: 'CGPA / Percentage',
    fieldType: 'number',
    required: false,
    helpText: 'Enter CGPA or percentage.',
    choices: [],
    min: 0,
    max: 100,
  },
  {
    id: createTemplateFieldId(),
    label: 'Why are you applying for this position/course?',
    fieldType: 'long_text',
    required: true,
    helpText: '',
    choices: [],
  },
  {
    id: createTemplateFieldId(),
    label: 'Any previous relevant experience?',
    fieldType: 'long_text',
    required: false,
    helpText: '',
    choices: [],
  },
  {
    id: createTemplateFieldId(),
    label: 'How can we contact you (phone, etc.)?',
    fieldType: 'short_text',
    required: true,
    helpText: '',
    choices: [],
  },
];

const buildPlacementCoordinatorTemplateFields = (): EditableField[] => [
  {
    id: createTemplateFieldId(),
    label: 'Full Name',
    fieldType: 'short_text',
    required: true,
    helpText: '',
    choices: [],
  },
  {
    id: createTemplateFieldId(),
    label: 'College Roll Number',
    fieldType: 'short_text',
    required: true,
    helpText: '',
    choices: [],
  },
  {
    id: createTemplateFieldId(),
    label: 'Institutional Email',
    fieldType: 'email',
    required: true,
    helpText: '',
    choices: [],
  },
  {
    id: createTemplateFieldId(),
    label: 'Program / Branch',
    fieldType: 'select',
    required: true,
    helpText: '',
    choices: ['CSE', 'IT', 'ECE', 'ENTC', 'Mechanical', 'Civil'],
  },
  {
    id: createTemplateFieldId(),
    label: 'Current Year',
    fieldType: 'select',
    required: true,
    helpText: '',
    choices: ['First', 'Second', 'Third', 'Final'],
  },
  {
    id: createTemplateFieldId(),
    label: 'Current CGPA',
    fieldType: 'number',
    required: true,
    helpText: 'Enter your latest CGPA out of 10.',
    choices: [],
    min: 0,
    max: 10,
  },
  {
    id: createTemplateFieldId(),
    label: 'Roles you are interested in',
    fieldType: 'checkbox',
    required: true,
    helpText: '',
    choices: [
      'Placement Operations',
      'Corporate Outreach',
      'Data and Analytics',
      'Events and Engagement',
      'Communication and Design',
    ],
  },
  {
    id: createTemplateFieldId(),
    label: 'Why do you want to be a Student Placement Coordinator?',
    fieldType: 'long_text',
    required: true,
    helpText: '',
    choices: [],
  },
  {
    id: createTemplateFieldId(),
    label: 'Describe any relevant leadership or coordination experience.',
    fieldType: 'long_text',
    required: true,
    helpText: '',
    choices: [],
  },
  {
    id: createTemplateFieldId(),
    label: 'Availability (hours per week)',
    fieldType: 'select',
    required: true,
    helpText: '',
    choices: ['Less than 5', '5-10', '10-15', '15+'],
  },
  {
    id: createTemplateFieldId(),
    label: 'Contact Number',
    fieldType: 'short_text',
    required: true,
    helpText: '',
    choices: [],
  },
];

const buildRecruitmentTemplateFields = (): EditableField[] => [
  {
    id: createTemplateFieldId(),
    label: 'Full Name',
    fieldType: 'short_text',
    required: true,
    helpText: '',
    choices: [],
  },
  {
    id: createTemplateFieldId(),
    label: 'Email address',
    fieldType: 'email',
    required: true,
    helpText: '',
    choices: [],
  },
  {
    id: createTemplateFieldId(),
    label: 'WhatsApp Number',
    fieldType: 'number',
    required: true,
    helpText: '',
    choices: [],
    min: 0,
  },
  {
    id: createTemplateFieldId(),
    label: 'Enrollment Number',
    fieldType: 'short_text',
    required: true,
    helpText: '',
    choices: [],
  },
  {
    id: createTemplateFieldId(),
    label: 'Department/Branch',
    fieldType: 'select',
    required: true,
    helpText: '',
    choices: ['CSE', 'IT', 'ECE', 'ME', 'CE', 'Aero', 'Design', 'Other'],
  },
  {
    id: createTemplateFieldId(),
    label: 'Current Year of Study',
    fieldType: 'select',
    required: true,
    helpText: '',
    choices: ['1st Year', '2nd Year', '3rd Year'],
  },
  {
    id: createTemplateFieldId(),
    label: 'Club Name & Role',
    fieldType: 'short_text',
    required: true,
    helpText: "If you're not from any Club type *NA*",
    choices: [],
  },
  {
    id: createTemplateFieldId(),
    label: 'Why do you want to join the Placement Cell?',
    fieldType: 'long_text',
    required: true,
    helpText: 'Describe your motivation and what you aim to achieve.',
    choices: [],
  },
  {
    id: createTemplateFieldId(),
    label: 'Relevant Experience',
    fieldType: 'long_text',
    required: true,
    helpText: 'Any previous leadership roles or event management experience.',
    choices: [],
  },
];

export type FormTemplateKey = 'student' | 'placement-coordinator' | 'recruitment';

export interface FormTemplateDefinition {
  key: FormTemplateKey;
  name: string;
  title: string;
  description: string;
  slug: string;
}

const FORM_TEMPLATE_LIST: Array<FormTemplateDefinition & { buildFields: () => EditableField[] }> = [
  {
    key: 'student',
    name: 'Student Application / Feedback',
    title: 'Student Application / Feedback Form',
    description: 'Collect academic and placement-related details from students.',
    slug: 'student-application-feedback-form',
    buildFields: buildStudentTemplateFields,
  },
  {
    key: 'placement-coordinator',
    name: 'Student Placement Coordinator Application',
    title: 'Student Placement Coordinator Application',
    description: 'Collect applications for the student placement coordinator team.',
    slug: 'student-placement-coordinator-application',
    buildFields: buildPlacementCoordinatorTemplateFields,
  },
  {
    key: 'recruitment',
    name: 'Placement Cell Recruitment',
    title: 'Placement Cell Member Recruitment 2026',
    description: 'Application form for joining the placement cell coordination team.',
    slug: 'placement-cell-member-recruitment',
    buildFields: buildRecruitmentTemplateFields,
  },
];

export const FORM_TEMPLATES: FormTemplateDefinition[] = FORM_TEMPLATE_LIST.map(
  ({ key, name, title, description, slug }) => ({
    key,
    name,
    title,
    description,
    slug,
  }),
);

export const getFormTemplate = (key: string | null | undefined): FormTemplateDefinition | null => {
  return FORM_TEMPLATES.find((template) => template.key === key) ?? null;
};

export const getTemplateFields = (key: string | null | undefined = 'student'): EditableField[] => {
  const template = FORM_TEMPLATE_LIST.find((item) => item.key === key);
  if (!template) {
    return buildStudentTemplateFields();
  }

  return template.buildFields();
};
