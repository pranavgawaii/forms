import type { FormFieldRecord, FormResponseRecord } from '../types/forms';

const escapeCsv = (value: string) => {
  const normalized = value.replace(/\r?\n/g, ' ').replace(/"/g, '""');
  return `"${normalized}"`;
};

const toCell = (value: unknown): string => {
  if (Array.isArray(value)) {
    return escapeCsv(value.join('; '));
  }

  if (value === null || value === undefined) {
    return '""';
  }

  return escapeCsv(String(value));
};

const sanitizeFilename = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'form';

export const exportResponsesToCsv = (params: {
  formTitle: string;
  fields: FormFieldRecord[];
  responses: FormResponseRecord[];
}) => {
  const answerFields = params.fields.filter((field) => field.field_type !== 'section_title');
  const headers = ['submitted_at', ...answerFields.map((field) => field.label)];

  const lines = [headers.map(escapeCsv).join(',')];

  for (const response of params.responses) {
    const row = [toCell(response.submitted_at)];

    for (const field of answerFields) {
      const answer = response.answers ? response.answers[field.id] : undefined;
      row.push(toCell(answer));
    }

    lines.push(row.join(','));
  }

  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${sanitizeFilename(params.formTitle)}-responses.csv`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
};
