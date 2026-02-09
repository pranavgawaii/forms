import { AIInputWithSuggestions } from './AIInputWithSuggestions';
import type { FormFieldRecord } from '../types/forms';

type FieldValue = string | number | string[];

interface DynamicFieldProps {
  field: FormFieldRecord;
  value?: FieldValue;
  onChange?: (value: FieldValue) => void;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

const inputBaseClass =
  'w-full px-4 py-2 text-base sm:text-sm text-ink-900 border border-black/10 rounded-xl sm:rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all disabled:cursor-not-allowed disabled:bg-ink-100 placeholder:text-zinc-400';

const DynamicField = ({ field, value, onChange, error, disabled = false, readOnly = false }: DynamicFieldProps) => {
  const choices = field.options?.choices ?? [];

  if (field.field_type === 'section_title') {
    return (
      <div className="mt-8 mb-5 border-b border-ink-100 pb-2">
        <h3 className="brand-heading text-xl sm:text-2xl font-bold text-ink-900">{field.label}</h3>
        {(field.options?.sectionDescription || field.help_text) && (
          <p className="mt-2 text-sm text-ink-500">{field.options?.sectionDescription ?? field.help_text}</p>
        )}
      </div>
    );
  }

  return (
    <div className="group animate-in fade-in slide-in-from-bottom-2 duration-500">
      <label htmlFor={field.id} className="block text-sm font-semibold text-ink-900 mb-1.5 transition-colors group-focus-within:text-brand-700">
        {field.label}
        {field.required ? <span className="ml-1 text-red-500 font-bold">*</span> : null}
      </label>
      {field.help_text ? <p className="mb-2 text-xs text-ink-400 font-medium">{field.help_text}</p> : null}

      {(field.field_type === 'short_text' || field.field_type === 'email') && (
        <input
          type={field.field_type === 'email' ? 'email' : 'text'}
          id={field.id}
          placeholder={field.field_type === 'email' ? 'example@email.com' : 'Your answer...'}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange?.(event.target.value)}
          disabled={disabled || readOnly}
          className={inputBaseClass}
        />
      )}

      {field.field_type === 'long_text' && (
        <AIInputWithSuggestions
          id={field.id}
          placeholder="Describe in detail..."
          minHeight={100}
          maxHeight={300}
          value={typeof value === 'string' ? value : ''}
          onChange={(val) => onChange?.(val)}
          disabled={disabled || readOnly}
          className="py-0"
        />
      )}

      {field.field_type === 'number' && (
        <input
          type="number"
          id={field.id}
          min={typeof field.options?.min === 'number' ? field.options.min : undefined}
          max={typeof field.options?.max === 'number' ? field.options.max : undefined}
          value={typeof value === 'string' || typeof value === 'number' ? value : ''}
          onChange={(event) => onChange?.(event.target.value)}
          disabled={disabled}
          readOnly={readOnly}
          className={inputBaseClass}
        />
      )}

      {field.field_type === 'date' && (
        <input
          type="date"
          id={field.id}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange?.(event.target.value)}
          disabled={disabled}
          readOnly={readOnly}
          className={inputBaseClass}
        />
      )}

      {field.field_type === 'select' && (
        <select
          id={field.id}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange?.(event.target.value)}
          disabled={disabled || readOnly}
          className={inputBaseClass}
        >
          <option value="">Select an option</option>
          {choices.map((choice) => (
            <option key={choice} value={choice}>
              {choice}
            </option>
          ))}
        </select>
      )}

      {field.field_type === 'checkbox' && (
        <div className="mt-2 space-y-2 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          {choices.map((choice) => {
            const selectedValues = Array.isArray(value) ? value : [];
            const checked = selectedValues.includes(choice);

            return (
              <label key={choice} className="flex items-center gap-3 text-sm text-ink-700 cursor-pointer group/label">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled || readOnly}
                  className="w-4 h-4 rounded border-black/10 text-black focus:ring-black/5"
                  onChange={(event) => {
                    if (!onChange) {
                      return;
                    }

                    if (event.target.checked) {
                      onChange([...selectedValues, choice]);
                    } else {
                      onChange(selectedValues.filter((item) => item !== choice));
                    }
                  }}
                />
                <span className="group-hover/label:text-black transition-colors">{choice}</span>
              </label>
            );
          })}
        </div>
      )}

      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
};

export default DynamicField;
