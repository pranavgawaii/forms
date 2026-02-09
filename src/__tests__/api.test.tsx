import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as formApi from '../lib/formApi';
import { supabase, supabaseAnon } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => {
    const createChain = () => {
        const chain: any = {
            select: vi.fn(() => chain),
            eq: vi.fn(() => chain),
            order: vi.fn(() => chain),
            single: vi.fn(() => chain),
            insert: vi.fn(() => chain),
            delete: vi.fn(() => chain),
            update: vi.fn(() => chain),
            // Mocking the promise-like behavior of Supabase queries
            then: vi.fn((onFulfilled) => Promise.resolve({ data: null, error: null }).then(onFulfilled)),
        };
        return chain;
    };

    const formsChain = createChain();
    const fieldsChain = createChain();
    const responsesChain = createChain();

    const fromMock = vi.fn((table: string) => {
        if (table === 'forms') return formsChain;
        if (table === 'form_fields') return fieldsChain;
        if (table === 'form_responses') return responsesChain;
        return createChain();
    });

    const mockSupabase = {
        from: fromMock,
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }),
            getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
            onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
    };

    return {
        supabase: mockSupabase,
        supabaseAnon: mockSupabase,
    };
});

describe('formApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getFormsOverview fetches forms', async () => {
        const mockForms = [{ id: '1', title: 'Form 1', form_responses: { count: 5 } }];
        const chain = supabase.from('forms') as any;
        chain.then.mockImplementation((onFulfilled: any) => Promise.resolve({ data: mockForms, error: null }).then(onFulfilled));

        const result = await formApi.getFormsOverview();
        expect(result[0].id).toBe('1');
    });

    it('submitPublicResponse inserts data', async () => {
        const chain = supabaseAnon.from('form_responses') as any;
        chain.then.mockImplementation((onFulfilled: any) => Promise.resolve({ error: null }).then(onFulfilled));

        await formApi.submitPublicResponse({
            formId: '1',
            answers: {},
            respondentEmail: 'test@t.com'
        });

        expect(chain.insert).toHaveBeenCalled();
    });

    it('duplicateForm clones form and fields', async () => {
        const formsChain = supabase.from('forms') as any;
        const fieldsChain = supabase.from('form_fields') as any;

        // Mock get form
        formsChain.then
            .mockImplementationOnce((fn: any) => Promise.resolve({ data: { id: 'f1', owner_id: 'u1', slug: 's1' }, error: null }).then(fn))
            // Mock insert form
            .mockImplementationOnce((fn: any) => Promise.resolve({ data: { id: 'f_new' }, error: null }).then(fn));

        // Mock get fields
        fieldsChain.then
            .mockImplementationOnce((fn: any) => Promise.resolve({ data: [{ label: 'L1', field_type: 'short_text' }], error: null }).then(fn))
            // Mock insert fields
            .mockImplementationOnce((fn: any) => Promise.resolve({ error: null }).then(fn));

        const result = await formApi.duplicateForm('f1');
        expect(result.id).toBe('f_new');
    });

    it('saveFormWithFields updates form and fields', async () => {
        const formsChain = supabase.from('forms') as any;
        const fieldsChain = supabase.from('form_fields') as any;

        formsChain.then.mockImplementationOnce((fn: any) => Promise.resolve({ data: { id: 'f1' }, error: null }).then(fn));
        fieldsChain.then.mockImplementation((fn: any) => Promise.resolve({ data: [], error: null }).then(fn));

        const mockState: any = {
            id: 'f1',
            title: 'Updated',
            description: '',
            fields: [
                { id: 'field1', dbId: 'db1', label: 'L1', fieldType: 'short_text', helpText: '', choices: [] }
            ]
        };

        await formApi.saveFormWithFields(mockState);
        expect(formsChain.update).toHaveBeenCalled();
    });
});
