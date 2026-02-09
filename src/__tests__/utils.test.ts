import { describe, it, expect } from 'vitest';
import {
    cn,
    slugify,
    createLocalField,
    getFormTemplate,
    getTemplateFields,
    toBuilderState,
    buildOptionsPayload
} from '../lib/utils';
import { FormFieldRecord, FormRecord } from '../types/forms';

describe('utils', () => {
    describe('cn', () => {
        it('merges class names correctly', () => {
            expect(cn('a', 'b')).toBe('a b');
            expect(cn('a', { b: true, c: false })).toBe('a b');
        });
    });

    describe('slugify', () => {
        it('transforms strings to slugs', () => {
            expect(slugify('Hello World')).toBe('hello-world');
            expect(slugify('Test! @#$%^&*')).toBe('test-'); // Note: current implementation keeps trailing dash if non-alphanumeric follows
            expect(slugify('  multi  word  ')).toBe('multi-word');
        });

        it('returns a random slug for empty input', () => {
            expect(slugify('')).toMatch(/^form-[a-z0-9]{5}$/);
        });
    });

    describe('createLocalField', () => {
        it('creates an editable field with defaults', () => {
            const field = createLocalField('short_text', 2);
            expect(field.fieldType).toBe('short_text');
            expect(field.label).toContain('3'); // index + 1
            expect(field.required).toBe(true);
            expect(field.choices).toEqual([]);
        });
    });

    describe('buildOptionsPayload', () => {
        it('returns choices for select fields', () => {
            const payload = buildOptionsPayload({
                fieldType: 'select',
                choices: ['A', ' B ', ''],
                label: '',
                id: '',
                required: true,
                helpText: ''
            });
            expect(payload?.choices).toEqual(['A', ' B ']);
        });

        it('returns min/max for number fields', () => {
            const payload = buildOptionsPayload({
                fieldType: 'number',
                min: 1,
                max: 10,
                label: '',
                id: '',
                required: true,
                helpText: '',
                choices: []
            });
            expect(payload).toEqual({ min: 1, max: 10 });
        });
    });

    describe('getFormTemplate', () => {
        it('returns a template by key', () => {
            const template = getFormTemplate('student');
            expect(template?.key).toBe('student');
        });

        it('returns null for unknown key', () => {
            expect(getFormTemplate('unknown')).toBeNull();
        });
    });

    describe('getTemplateFields', () => {
        it('returns fields for a valid template', () => {
            const fields = getTemplateFields('student');
            expect(fields.length).toBeGreaterThan(0);
        });

        it('returns student fields by default for unknown template', () => {
            const fields = getTemplateFields('unknown');
            expect(fields[0].label).toBe('Full Name');
        });
    });

    describe('toBuilderState', () => {
        it('converts DB records to builder state', () => {
            const mockForm: any = {
                id: '1',
                title: 'Test',
                description: 'Desc',
                slug: 'test',
                status: 'draft',
                is_public: true,
                theme: { preset: 'royal-blue', deadline: null },
            };
            const mockFields: any[] = [
                {
                    id: 'f1',
                    label: 'Field 1',
                    field_type: 'short_text',
                    required: true,
                    help_text: 'Help',
                    options: null,
                    sort_order: 0
                }
            ];

            const state = toBuilderState(mockForm, mockFields);
            expect(state.title).toBe('Test');
            expect(state.fields[0].dbId).toBe('f1');
        });
    });
});
