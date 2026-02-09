import { vi, describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import ResponsesPage from '../pages/ResponsesPage';
import { renderWithProviders } from '../test/testUtils';
import * as formApi from '../lib/formApi';

// Mock formApi
vi.mock('../lib/formApi', () => ({
    getResponsesBundle: vi.fn(),
}));

describe('Performance & Scale', () => {
    it('renders 100 responses efficiently', async () => {
        const responses = Array.from({ length: 100 }, (_, i) => ({
            id: `res-${i}`,
            submitted_at: new Date().toISOString(),
            respondent_email: `tester-${i}@test.com`,
            answers: { f1: `Name ${i}` },
        }));

        (formApi.getResponsesBundle as any).mockResolvedValue({
            form: { id: '1', title: 'Scale Test' },
            fields: [{ id: 'f1', label: 'Name', field_type: 'short_text' }],
            responses,
        });

        const startTime = performance.now();
        renderWithProviders(<ResponsesPage />, { route: '/app/forms/1/responses', path: '/app/forms/:id/responses' });

        await waitFor(() => {
            expect(screen.getByText('tester-99@test.com')).toBeInTheDocument();
        }, { timeout: 5000 });

        const endTime = performance.now();
        expect(endTime - startTime).toBeLessThan(2000); // Relaxed for slow environment
    });
});
