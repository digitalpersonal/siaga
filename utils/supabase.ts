import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://awtmbbjldxbikrfgaxma.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3dG1iYmpsZHhiaWtyZmdheG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTg2MTMsImV4cCI6MjA3ODQ3NDYxM30.rV0dclu_OnVmr-LqvndDKy1W2Hna_wXMYJNqoNxcsbc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
