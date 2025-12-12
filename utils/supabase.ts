
import { createClient } from '@supabase/supabase-js';

// --- Safe Environment Access ---
// Helper to safely get env vars without crashing if import.meta is undefined
const getEnv = (key: string): string | undefined => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignore errors in environments where import.meta is not supported
  }
  return undefined;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Check configuration status
const isConfigured = !!supabaseUrl && !!supabaseAnonKey;

// --- Mock Client ---
// Used when Supabase credentials are missing to allow the UI to function for demo purposes.
const createMockClient = () => {
    console.warn('⚠️ SUPABASE NOT CONFIGURED: Running in Mock Mode. Data will not be persisted.');
    console.warn('To fix this, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    
    // Chainable mock object that mimics Supabase query builder
    const mockChain: any = {
        select: () => mockChain,
        eq: () => mockChain,
        neq: () => mockChain,
        gte: () => mockChain,
        lte: () => mockChain,
        in: () => mockChain,
        order: () => mockChain,
        limit: () => mockChain,
        single: async () => ({ data: null, error: null }),
        insert: async () => ({ data: null, error: null }),
        update: async () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
        delete: async () => ({ error: null }),
        // Allow the chain to be awaited directly to return a list result (empty array for mock)
        then: (resolve: (value: any) => void) => Promise.resolve({ data: [], error: null }).then(resolve)
    };

    return {
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signInWithPassword: async () => ({ error: { message: 'Modo Demo: Configure o Supabase para fazer login.' } }),
            signUp: async () => ({ error: { message: 'Modo Demo: Configure o Supabase para cadastrar.' } }),
            signOut: async () => ({ error: null }),
        },
        from: () => mockChain,
        storage: {
            from: () => ({
                upload: async () => ({ data: null, error: null }),
                getPublicUrl: () => ({ data: { publicUrl: 'https://via.placeholder.com/150' } })
            })
        },
        channel: () => ({
            on: () => ({ subscribe: () => {} })
        }),
        removeChannel: () => {}
    } as any;
};

// Export the client (Real or Mock)
export const supabase = isConfigured 
    ? createClient(supabaseUrl!, supabaseAnonKey!) 
    : createMockClient();

// --- UI Helper Functions ---

export const getInitials = (nameStr: string) => {
    if (!nameStr) return '?';
    const names = nameStr.split(' ');
    const initials = names.map(n => n[0]).join('').toUpperCase();
    return initials.length > 2 ? initials.substring(0, 2) : initials;
};

const colors = ['bg-rose-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'];
export const getColor = (nameStr: string) => {
    if (!nameStr) return colors[0];
    const charCodeSum = nameStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
};
