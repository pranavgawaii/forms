import { vi } from 'vitest';

export const mockSupabaseResponse = (data: any = null, error: any = null) => ({
    data,
    error,
});

const createMockQueryBuilder = (config: { data?: any; error?: any } = {}) => {
    const queryBuilder: any = {
        select: vi.fn().mockImplementation(() => queryBuilder),
        insert: vi.fn().mockImplementation(() => queryBuilder),
        update: vi.fn().mockImplementation(() => queryBuilder),
        delete: vi.fn().mockImplementation(() => queryBuilder),
        eq: vi.fn().mockImplementation(() => queryBuilder),
        neq: vi.fn().mockImplementation(() => queryBuilder),
        gt: vi.fn().mockImplementation(() => queryBuilder),
        lt: vi.fn().mockImplementation(() => queryBuilder),
        order: vi.fn().mockImplementation(() => queryBuilder),
        limit: vi.fn().mockImplementation(() => queryBuilder),
        single: vi.fn().mockImplementation(() => Promise.resolve({ data: config.data?.[0] ?? config.data, error: config.error })),
        maybeSingle: vi.fn().mockImplementation(() => Promise.resolve({ data: config.data?.[0] ?? config.data, error: config.error })),
        then: (resolve: any) => resolve({ data: config.data, error: config.error }),
    };
    return queryBuilder;
};

export const createMockSupabase = () => {
    const mock: any = {
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
            signInWithPassword: vi.fn(),
            signUp: vi.fn(),
            signOut: vi.fn(),
            getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
            onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
        from: vi.fn().mockImplementation(() => createMockQueryBuilder()),
        rpc: vi.fn(),
        storage: {
            from: vi.fn().mockReturnValue({
                upload: vi.fn(),
                getPublicUrl: vi.fn(),
                remove: vi.fn(),
            }),
        },
    };

    // Helper to set mock data for a specific table
    mock.setMockData = (table: string, data: any, error: any = null) => {
        mock.from.mockImplementation((targetTable: string) => {
            if (targetTable === table) {
                return createMockQueryBuilder({ data, error });
            }
            return createMockQueryBuilder();
        });
    };

    return mock;
};

export const mockSupabase = createMockSupabase();
export const mockSupabaseAnon = createMockSupabase();

vi.mock('@/lib/supabase', () => ({
    supabase: mockSupabase,
    supabaseAnon: mockSupabaseAnon,
}));
