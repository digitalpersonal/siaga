
import React, { useState } from 'react';
import { supabase } from '../utils/supabase';

interface LandingLoginSectionProps {
    onRegisterClick: () => void;
}

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

export const LandingLoginSection: React.FC<LandingLoginSectionProps> = ({ onRegisterClick }) => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getSyntheticEmail = (phoneNumber: string) => {
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        return `${cleanPhone}@siaga.app`;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || !password) {
            setError("Preencha telefone e senha.");
            return;
        }

        setLoading(true);
        setError(null);
        
        const email = getSyntheticEmail(phone);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            if (error.message.includes("Invalid login credentials")) {
                setError("Dados incorretos. Verifique e tente novamente.");
            } else {
                setError("Erro ao acessar. Tente novamente.");
            }
            setLoading(false);
        }
        // Success redirects automatically via onAuthStateChange in App.tsx
    };

    return (
        <section id="login-section" className="py-20 bg-stone-100 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                    
                    {/* Left Side: Info */}
                    <div className="md:w-1/2 bg-teal-700 p-12 text-white flex flex-col justify-center relative">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Acesso ao Cidadão</h2>
                        <p className="text-teal-100 text-lg mb-8 leading-relaxed relative z-10">
                            Acesse sua conta para visualizar seus agendamentos, histórico de consultas e atualizar seus dados cadastrais de forma segura e rápida.
                        </p>
                        <ul className="space-y-4 relative z-10">
                            <li className="flex items-center">
                                <div className="bg-teal-600 p-2 rounded-full mr-3"><ArrowRightIcon /></div>
                                <span>Consulta de Agendamentos</span>
                            </li>
                            <li className="flex items-center">
                                <div className="bg-teal-600 p-2 rounded-full mr-3"><ArrowRightIcon /></div>
                                <span>Histórico</span>
                            </li>
                            <li className="flex items-center">
                                <div className="bg-teal-600 p-2 rounded-full mr-3"><ArrowRightIcon /></div>
                                <span>Status de Transporte</span>
                            </li>
                        </ul>
                    </div>

                    {/* Right Side: Login Form */}
                    <div className="md:w-1/2 p-12 flex flex-col justify-center bg-white">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-stone-800">Entrar no Sistema</h3>
                            <p className="text-stone-500 mt-2">Use seu número de celular cadastrado.</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-stone-600 mb-2" htmlFor="login-phone">Celular (WhatsApp)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <PhoneIcon />
                                    </div>
                                    <input 
                                        type="tel" 
                                        id="login-phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                        placeholder="(XX) 99999-9999"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-stone-600 mb-2" htmlFor="login-pass">Senha</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockIcon />
                                    </div>
                                    <input 
                                        type="password" 
                                        id="login-pass"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                        placeholder="Sua senha de acesso"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-teal-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-teal-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Acessando...
                                    </span>
                                ) : 'Acessar Conta'}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-stone-100 text-center">
                            <p className="text-stone-500 text-sm">Ainda não tem cadastro?</p>
                            <button 
                                onClick={onRegisterClick}
                                className="mt-2 text-teal-600 font-bold hover:text-teal-800 hover:underline transition-colors"
                            >
                                Criar meu cadastro agora
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
        </section>
    );
};
