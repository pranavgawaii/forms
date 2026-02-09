import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormBuilderPage from '../pages/FormBuilderPage';
import { renderWithProviders } from '../test/testUtils';
import * as formApi from '../lib/formApi';

// Mock formApi
vi.mock('../lib/formApi', () => ({
    getFormBuilderData: vi.fn(),
    saveFormWithFields: vi.fn(),
}));

describe('FormBuilderPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (formApi.getFormBuilderData as any).mockResolvedValue({
            form: { id: 'new', title: '', description: '', slug: '', status: 'draft', is_public: true, theme: null },
            fields: [],
        });
    });

    it('renders blank form builder', async () => {
        renderWithProviders(<FormBuilderPage />);

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Form Title/i)).toBeInTheDocument();
            expect(screen.getByText(/No fields yet/i)).toBeInTheDocument();
        });
    });

    it('allows adding a new field', async () => {
        renderWithProviders(<FormBuilderPage />);

        await waitFor(() => {
            const addFieldButton = screen.getByText(/\+ Short answer/i);
            fireEvent.click(addFieldButton);
        });

        expect(screen.getByText(/Short answer question 1/i)).toBeInTheDocument();
    });

    it('updates form title and description', async () => {
        renderWithProviders(<FormBuilderPage />);

        await waitFor(() => {
            const titleInput = screen.getByPlaceholderText(/Form Title/i);
            const descInput = screen.getByPlaceholderText(/Add context for respondents/i);

            fireEvent.change(titleInput, { target: { value: 'New Campaign' } });
            fireEvent.change(descInput, { target: { value: 'New registration form' } });

            expect(titleInput).toHaveValue('New Campaign');
            expect(descInput).toHaveValue('New registration form');
        });
    });

    it('allows adding different types of fields', async () => {
        const user = userEvent.setup();
        renderWithProviders(<FormBuilderPage />);

        await user.click(screen.getByText(/\+ Short answer/i));
        await user.click(screen.getByText(/\+ Paragraph/i));
        await user.click(screen.getByText(/\+ Dropdown/i));

        await waitFor(() => {
            expect(screen.getByText(/1\. short text/i)).toBeInTheDocument();
            expect(screen.getByText(/2\. long text/i)).toBeInTheDocument();
            expect(screen.getByText(/3\. select/i)).toBeInTheDocument();
        });
    });

    it('allows deleting a field', async () => {
        renderWithProviders(<FormBuilderPage />);

        await waitFor(() => {
            fireEvent.click(screen.getByText(/\+ Short answer/i));
        });

        expect(screen.getByText(/short text/i)).toBeInTheDocument();

        const deleteButton = screen.getByRole('button', { name: /Delete/i });
        fireEvent.click(deleteButton);

        expect(screen.queryByText(/short text/i)).not.toBeInTheDocument();
    });

    it('handles saving a form', async () => {
        (formApi.saveFormWithFields as any).mockResolvedValue({ id: 'saved-id', slug: 'saved-slug' });

        renderWithProviders(<FormBuilderPage />);

        await waitFor(() => {
            // Add a field first since saving requires at least 1 field
            fireEvent.click(screen.getByText(/\+ Short answer/i));
        });

        fireEvent.change(screen.getByPlaceholderText(/Form Title/i), { target: { value: 'Test Save' } });

        const saveButton = screen.getByRole('button', { name: /^Save$/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(formApi.saveFormWithFields).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Test Save',
                    status: 'draft',
                    isPublic: true,
                    description: '',
                    slug: 'test-save',
                    themePreset: 'royal-blue',
                }),
                expect.anything()
            );
        });
    });
});
