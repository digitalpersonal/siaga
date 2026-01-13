
import React from 'react';

const PhoneIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);

const LockIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

interface FooterProps {
    onSysAdminClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSysAdminClick }) => {
    return (
        <footer id="footer" className="bg-stone-900 text-white">
            <div className="container mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left">
                    <div className="mb-6 md:mb-0">
                        <h2 className="text-2xl font-bold text-white mb-2">SIAGA Saúde</h2>
                        <p className="text-stone-400 text-sm max-w-md">
                            Sistema Integrado de Agendamento e Gestão de Atendimentos.<br/>
                            Facilitando o acesso à saúde em <strong>Guaranésia e Região</strong>.
                        </p>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-teal-500">Ouvidoria da Saúde</h3>
                        <p className="text-stone-400 text-sm mb-4">
                            Dúvidas sobre consultas, exames ou unidades?<br/>
                            Entre em contato com a secretaria.
                        </p>
                        <a
                            href="tel:136"
                            className="inline-flex items-center bg-teal-700 text-white font-bold py-2 px-6 rounded-full hover:bg-teal-600 transition-all duration-300"
                        >
                            <PhoneIcon />
                            Disque Saúde 136
                        </a>
                    </div>
                </div>
            </div>
            <div className="bg-black/30">
                <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-stone-500 text-sm text-center md:text-left">
                        © {new Date().getFullYear()} Guaranésia e Região | SIAGA Saúde v2.1 - Tecnologia a favor da vida
                    </p>
                    
                    {/* Botão Discreto para Admin Geral */}
                    {onSysAdminClick && (
                        <button 
                            onClick={onSysAdminClick} 
                            className="mt-2 md:mt-0 text-stone-700 hover:text-stone-500 transition-colors p-2 rounded-full opacity-50 hover:opacity-100"
                            aria-label="Acesso Administrativo do Sistema"
                            title="Acesso Mantenedor"
                        >
                            <LockIcon />
                        </button>
                    )}
                </div>
            </div>
        </footer>
    );
};
