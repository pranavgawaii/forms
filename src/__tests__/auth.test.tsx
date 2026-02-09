import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import AuthPage from '../pages/AuthPage';
import { renderWithProviders } from '../test/testUtils';
import { supabase } from '@/lib/supabase';

// Supabase is already mocked in src/test/mocks/supabase.ts
// We import it here to set specific mock responses for each test.

describe('AuthPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form correctly', () => {
        renderWithProviders(<AuthPage />);
        expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Academic Email$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    });

    it('shows error on invalid login', async () => {
        (supabase.auth.signInWithPassword as any).mockResolvedValueOnce({
            error: { message: 'Invalid login credentials' },
        });

        renderWithProviders(<AuthPage />);

        fireEvent.change(screen.getByLabelText(/^Academic Email$/i), { target: { value: 'wrong@test.com' } });
        fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        await waitFor(() => {
            expect(screen.getByText(/Invalid login credentials/i)).toBeInTheDocument();
        });
    });

    it('shows success message on valid login', async () => {
        (supabase.auth.signInWithPassword as any).mockResolvedValueOnce({
            data: { user: { id: 'test-user-id' } },
            error: null,
        });

        renderWithProviders(<AuthPage />);

        fireEvent.change(screen.getByLabelText(/^Academic Email$/i), { target: { value: 'admin@college.edu' } });
        fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'correctpass' } });
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        await waitFor(() => {
            expect(screen.getByText(/Login successful/i)).toBeInTheDocument();
        });
    });

    it('toggles password visibility', () => {
        renderWithProviders(<AuthPage />);
        const passwordInput = screen.getByLabelText(/^Password$/i);
        const toggleButton = screen.getByRole('button', { name: /Show password/i });

        expect(passwordInput).toHaveAttribute('type', 'password');
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
    });
});
