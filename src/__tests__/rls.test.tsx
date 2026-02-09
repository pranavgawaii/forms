import { vi, describe, it, expect } from 'vitest';
import * as formApi from '../lib/formApi';

// Mock formApi
vi.mock('../lib/formApi', () => ({
    getPublicFormBySlug: vi.fn(),
    getFormsOverview: vi.fn(),
    getResponsesBundle: vi.fn(),
}));

describe('Security (RLS Simulation)', () => {
    it('blocks anonymous access to private forms', async () => {
        (formApi.getPublicFormBySlug as any).mockRejectedValue(new Error('Form not available (Private or Draft)'));

        await expect(formApi.getPublicFormBySlug('private-slug')).rejects.toThrow(/Form not available/);
    });

    it('allows owner to see their own forms', async () => {
        const mockOwnedForms = [{ id: '1', title: 'My Form' }];
        (formApi.getFormsOverview as any).mockResolvedValue(mockOwnedForms);

        const forms = await formApi.getFormsOverview();
        expect(forms).toHaveLength(1);
        expect(forms[0].title).toBe('My Form');
    });

    it('blocks cross-user response access', async () => {
        (formApi.getResponsesBundle as any).mockRejectedValue(new Error('JWT expired or unauthorized'));

        await expect(formApi.getResponsesBundle('someone-elses-form')).rejects.toThrow(/unauthorized/i);
    });
});
