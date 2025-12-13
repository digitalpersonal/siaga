
import React, { useState } from 'react';
import { supabase } from '../utils/supabase';

interface SysAdminAuthModalProps {
    onClose: () => void;
}

const ShieldCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const SysAdminAuthModal: React.FC<SysAdminAuthModalProps> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            
            if (error) throw error;
            
            // Login bem-sucedido
            onClose();
            
        } catch (err: any) {
            setError("Credenciais inválidas ou erro de conexão.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-stone-900/90 z-[100] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-stone-800 rounded-2xl shadow-2xl w-full max-w-md p-8 relative border border-stone-700">
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-stone-300 transition-colors">
                    <XIcon />
                </button>

                <div className="flex flex-col items-center text-center mb-6">
                    <ShieldCheckIcon />
                    <h2 className="text-2xl font-bold text-white">Acesso Administrativo</h2>
                    <p className="text-stone-400 text-sm mt-2">Área restrita para gestão global do sistema.</p>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-800 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-stone-400 text-xs font-bold uppercase mb-1">Email Corporativo</label>
                        <input 
                            type="email" 
                            required 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className="w-full bg-stone-700 border border-stone-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                            placeholder="admin@sistema.com"
                        />
                    </div>

                    <div>
                        <label className="block text-stone-400 text-xs font-bold uppercase mb-1">Senha</label>
                        <input 
                            type="password" 
                            required 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="w-full bg-stone-700 border border-stone-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-indigo-900/20 mt-4"
                    >
                        {loading ? 'Verificando...' : 'Acessar Painel'}
                    </button>
                </form>
            </div>
        </div>
    );
};
