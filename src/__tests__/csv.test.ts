import { describe, it, expect, vi } from 'vitest';
import { exportResponsesToCsv } from '../lib/csv';

describe('csv utils', () => {
    it('generates and downloads CSV', () => {
        // Mock DOM elements and URL methods
        const mockURL = { createObjectURL: vi.fn(() => 'blob:url'), revokeObjectURL: vi.fn() };
        global.URL = mockURL as any;

        const mockAnchor = {
            href: '',
            download: '',
            click: vi.fn(),
            remove: vi.fn()
        };
        const appendSpy = vi.spyOn(document.body, 'append').mockImplementation(() => { });
        const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);

        exportResponsesToCsv({
            formTitle: 'Test Form',
            fields: [
                { id: 'f1', label: 'Name', field_type: 'short_text' } as any,
                { id: 'f2', label: 'Section', field_type: 'section_title' } as any
            ],
            responses: [
                {
                    submitted_at: '2023-01-01',
                    answers: { f1: 'John' },
                    id: 'r1',
                    form_id: '1',
                    respondent_email: 'j@j.com'
                } as any
            ]
        });

        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(mockAnchor.download).toBe('test-form-responses.csv');
        expect(mockAnchor.click).toHaveBeenCalled();
        expect(mockURL.createObjectURL).toHaveBeenCalled();
    });
});
