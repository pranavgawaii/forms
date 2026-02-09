import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import ResponsesPage from '../pages/ResponsesPage';
import { renderWithProviders } from '../test/testUtils';
import * as formApi from '../lib/formApi';

// Mock formApi
vi.mock('../lib/formApi', () => ({
    getResponsesBundle: vi.fn(),
}));

const mockResponsesBundle = {
    form: { id: 'form-1', title: 'Test Responses', slug: 'test' },
    fields: [
        { id: 'f1', label: 'Name', field_type: 'short_text', required: true, help_text: '', options: null },
        { id: 'f2', label: 'Score', field_type: 'number', required: true, help_text: '', options: null },
    ],
    responses: [
        {
            id: 'res-1',
            submitted_at: new Date().toISOString(),
            respondent_email: 'tester@test.com',
            answers: { f1: 'Alice', f2: 95 },
        },
    ],
};

describe('ResponsesPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (formApi.getResponsesBundle as any).mockResolvedValue(mockResponsesBundle);
    });

    it('renders response table with data', async () => {
        renderWithProviders(<ResponsesPage />, { route: '/app/forms/form-1/responses', path: '/app/forms/:id/responses' });

        expect(await screen.findByText('tester@test.com')).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('95')).toBeInTheDocument();
    });

    it('opens response details modal on click', async () => {
        renderWithProviders(<ResponsesPage />, { route: '/app/forms/form-1/responses', path: '/app/forms/:id/responses' });

        const viewButton = await screen.findByRole('button', { name: /View Details/i });
        fireEvent.click(viewButton);

        expect(await screen.findByRole('heading', { name: /Response Details/i })).toBeInTheDocument();
        // Use getAll because Alice appears in both row and modal
        expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(1);
    });

    it('filters responses by search text', async () => {
        renderWithProviders(<ResponsesPage />, { route: '/app/forms/form-1/responses', path: '/app/forms/:id/responses' });

        const searchInput = await screen.findByPlaceholderText(/Search by email/i);
        fireEvent.change(searchInput, { target: { value: 'nomatch' } });

        expect(await screen.findByText(/No responses found/i)).toBeInTheDocument();
    });
});
