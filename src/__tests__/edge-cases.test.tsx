import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import PublicFormPage from '../pages/PublicFormPage';
import { renderWithProviders } from '../test/testUtils';
import * as formApi from '../lib/formApi';

// Mock formApi
vi.mock('../lib/formApi', () => ({
    getPublicFormBySlug: vi.fn(),
    submitPublicResponse: vi.fn(),
}));

describe('Edge Cases', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('handles submission with very long text responses', async () => {
        const longText = 'A'.repeat(1000);
        (formApi.getPublicFormBySlug as any).mockResolvedValue({
            form: { id: '1', title: 'Edge Case', status: 'live', is_public: true },
            fields: [{ id: 'f1', label: 'Comment', field_type: 'long_text', required: true }],
        });
        (formApi.submitPublicResponse as any).mockResolvedValue({});

        renderWithProviders(<PublicFormPage />, { route: '/f/edge', path: '/f/:slug' });

        await waitFor(() => {
            fireEvent.change(screen.getByLabelText(/Comment/i), { target: { value: longText } });
            fireEvent.click(screen.getByText(/Submit Form/i));
        });

        expect(formApi.submitPublicResponse).toHaveBeenCalledWith(expect.objectContaining({
            answers: { f1: longText }
        }), expect.anything());
    });

    it('shows error if API fails during submission', async () => {
        (formApi.getPublicFormBySlug as any).mockResolvedValue({
            form: { id: '1', title: 'Error Test', status: 'live', is_public: true },
            fields: [{ id: 'f1', label: 'Name', field_type: 'short_text', required: true }],
        });
        (formApi.submitPublicResponse as any).mockRejectedValue(new Error('Network error'));

        renderWithProviders(<PublicFormPage />, { route: '/f/error', path: '/f/:slug' });

        await waitFor(() => {
            fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test' } });
            fireEvent.click(screen.getByText(/Submit Form/i));
        });

        await waitFor(() => {
            expect(screen.getByText(/Submission failed/i)).toBeInTheDocument();
            expect(screen.getByText(/Network error/i)).toBeInTheDocument();
        });
    });
});
