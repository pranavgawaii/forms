import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '../components/ProtectedRoute';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { supabase } from '@/lib/supabase';

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects to login if not authenticated', async () => {
        (supabase.auth.getSession as any).mockResolvedValue({ data: { session: null }, error: null });
        (supabase.auth.onAuthStateChange as any).mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <AuthProvider>
                    <Routes>
                        <Route path="/auth" element={<div>Login Page</div>} />
                        <Route path="/protected" element={
                            <ProtectedRoute>
                                <div>Secret Content</div>
                            </ProtectedRoute>
                        } />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        expect(await screen.findByText(/Login Page/i)).toBeInTheDocument();
        expect(screen.queryByText(/Secret Content/i)).not.toBeInTheDocument();
    });

    it('renders children if authenticated', async () => {
        (supabase.auth.getSession as any).mockResolvedValue({
            data: { session: { user: { id: 'u1' } } },
            error: null
        });
        (supabase.auth.onAuthStateChange as any).mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <AuthProvider>
                    <Routes>
                        <Route path="/protected" element={
                            <ProtectedRoute>
                                <div>Secret Content</div>
                            </ProtectedRoute>
                        } />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        expect(await screen.findByText(/Secret Content/i)).toBeInTheDocument();
    });
});
