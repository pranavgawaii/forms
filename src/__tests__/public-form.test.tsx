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

const mockPublicForm = {
    form: {
        id: 'form-1',
        title: 'Public Test Form',
        description: 'Public Description',
        slug: 'public-test',
        status: 'live',
        is_public: true,
        theme: { preset: 'royal-blue' },
    },
    fields: [
        {
            id: 'field-1',
            label: 'Your Name',
            field_type: 'short_text',
            required: true,
            help_text: null,
            options: null,
        },
        {
            id: 'field-2',
            label: 'Your Email',
            field_type: 'email',
            required: true,
            help_text: null,
            options: null,
        },
    ],
};

describe('PublicFormPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (formApi.getPublicFormBySlug as any).mockResolvedValue(mockPublicForm);
    });

    it('renders public form with fields', async () => {
        renderWithProviders(<PublicFormPage />, { route: '/f/public-test', path: '/f/:slug' });

        expect(await screen.findByText('Public Test Form')).toBeInTheDocument();
        expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Your Email/i)).toBeInTheDocument();
    });

    it('shows validation errors when submitting empty required fields', async () => {
        renderWithProviders(<PublicFormPage />, { route: '/f/public-test', path: '/f/:slug' });

        const submitButton = await screen.findByText(/Submit Form/i);
        fireEvent.click(submitButton);

        expect(await screen.findAllByText(/This field is required/i)).toHaveLength(2);
    });

    it('shows success screen after valid submission', async () => {
        (formApi.submitPublicResponse as any).mockResolvedValue({});
        renderWithProviders(<PublicFormPage />, { route: '/f/public-test', path: '/f/:slug' });

        fireEvent.change(await screen.findByLabelText(/Your Name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText(/Your Email/i), { target: { value: 'john@example.com' } });
        fireEvent.click(screen.getByText(/Submit Form/i));

        expect(await screen.findByText(/Recorded!/i)).toBeInTheDocument();
        expect(screen.getByText(/Your response has been successfully submitted/i)).toBeInTheDocument();
    });

    it('handles "Form not available" state', async () => {
        (formApi.getPublicFormBySlug as any).mockRejectedValue(new Error('Form not available'));
        renderWithProviders(<PublicFormPage />, { route: '/f/private-slug' });

        await waitFor(() => {
            expect(screen.getByText(/Form not available/i)).toBeInTheDocument();
        });
    });
});
