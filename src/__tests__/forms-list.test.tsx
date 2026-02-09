import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import FormsListPage from '../pages/FormsListPage';
import { renderWithProviders } from '../test/testUtils';
import * as formApi from '../lib/formApi';

// Mock formApi
vi.mock('../lib/formApi', () => ({
    getFormsOverview: vi.fn(),
    duplicateForm: vi.fn(),
    deleteForm: vi.fn(),
}));

const mockForms = [
    {
        id: 'form-1',
        title: 'Test Form 1',
        description: 'Description 1',
        status: 'live',
        slug: 'test-form-1',
        responseCount: 5,
        updated_at: new Date().toISOString(),
    },
];

describe('FormsListPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (formApi.getFormsOverview as any).mockResolvedValue(mockForms);
    });

    it('renders forms dashboard with forms', async () => {
        renderWithProviders(<FormsListPage />);

        await waitFor(() => {
            expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
            expect(screen.getByText(/Test Form 1/i)).toBeInTheDocument();
            expect(screen.getByText('5')).toBeInTheDocument(); // Response count
        });
    });

    it('shows empty state when no forms exist', async () => {
        (formApi.getFormsOverview as any).mockResolvedValue([]);
        renderWithProviders(<FormsListPage />);

        await waitFor(() => {
            expect(screen.getByText(/Start your first campaign/i)).toBeInTheDocument();
        });
    });

    it('calls delete mutation when clicking delete and confirming', async () => {
        window.confirm = vi.fn().mockReturnValue(true);
        (formApi.deleteForm as any).mockResolvedValue({});

        renderWithProviders(<FormsListPage />);

        await waitFor(() => {
            const deleteButtons = screen.getAllByTitle(/Delete/i);
            fireEvent.click(deleteButtons[0]);
        });

        expect(window.confirm).toHaveBeenCalled();
        expect(formApi.deleteForm).toHaveBeenCalledWith('form-1', expect.anything());
    });

    it('calls duplicate mutation when clicking duplicate', async () => {
        (formApi.duplicateForm as any).mockResolvedValue({});

        renderWithProviders(<FormsListPage />);

        await waitFor(() => {
            const duplicateButtons = screen.getAllByTitle(/Duplicate/i);
            fireEvent.click(duplicateButtons[0]);
        });

        expect(formApi.duplicateForm).toHaveBeenCalledWith('form-1', expect.anything());
    });
});
