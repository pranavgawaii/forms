import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppShell from '../components/AppShell';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { supabase } from '@/lib/supabase';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
});

describe('AppShell', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (supabase.auth.getSession as any).mockResolvedValue({
            data: { session: { user: { id: 'u1', email: 'test@t.com' } } },
            error: null
        });
        (supabase.auth.onAuthStateChange as any).mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
        (supabase.from as any).mockImplementation(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { full_name: 'Test Admin', role: 'admin' }, error: null }),
        }));
    });

    it('renders the sidebar and nested routes via Outlet', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={['/app']}>
                    <AuthProvider>
                        <Routes>
                            <Route path="/app" element={<AppShell />}>
                                <Route index element={<div>Test Dashboard Content</div>} />
                            </Route>
                        </Routes>
                    </AuthProvider>
                </MemoryRouter>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Test Dashboard Content/i)).toBeInTheDocument();
        expect(screen.getByText(/Forms Overview/i)).toBeInTheDocument();
        expect(screen.getByText(/Test Admin/i)).toBeInTheDocument();
    });
});
