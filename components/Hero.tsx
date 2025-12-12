
import React from 'react';

export const Hero: React.FC = () => {
    
    const handleScrollToLogin = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const targetId = 'login-section';
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            // Calcula a altura do header (aprox 80px) + um espaçamento extra (20px)
            const headerOffset = 100;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Gerencia o foco para acessibilidade
            targetElement.setAttribute('tabindex', '-1');
            targetElement.focus({ preventScroll: true });
        }
    };

    const handleScrollToUnits = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const targetId = 'professionals';
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            // Calcula a altura do header (aprox 80px) + um espaçamento extra (20px)
            const headerOffset = 100;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Gerencia o foco para acessibilidade
            targetElement.setAttribute('tabindex', '-1');
            targetElement.focus({ preventScroll: true });
        }
    };

    return (
        <section 
            id="hero-section"
            className="relative py-24 md:py-40 bg-cover bg-center" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop')" }}
        >
            <div className="absolute inset-0 bg-teal-900/80"></div>
            <div className="container mx-auto px-6 text-center relative z-10">
                <div className="animate-fade-in-down">
                    <div className="inline-block bg-white/20 border border-white/30 rounded-full px-4 py-1 mb-6 backdrop-blur-sm">
                        <span className="text-white font-semibold text-sm uppercase tracking-wider">Gestão de Saúde Pública</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight text-white">
                        Saúde em primeiro lugar,<br/>sem filas e sem complicação.
                    </h2>
                    <p className="text-lg md:text-xl text-teal-50 mb-8 max-w-3xl mx-auto font-light">
                        Bem-vindo ao SIAGA Saúde. O sistema oficial de agendamento de consultas médicas, odontológicas e exames para <strong>Guaranésia e Região</strong>.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a 
                            href="#login-section" 
                            onClick={handleScrollToLogin}
                            className="bg-white text-teal-700 font-bold py-3 px-8 rounded-lg hover:bg-stone-100 transition-all shadow-lg hover:shadow-xl cursor-pointer"
                        >
                            Agendar Consulta
                        </a>
                        <a 
                            href="#professionals" 
                            onClick={handleScrollToUnits}
                            className="bg-teal-700/50 backdrop-blur-md border border-teal-500 text-white font-semibold py-3 px-8 rounded-lg hover:bg-teal-700 transition-all cursor-pointer"
                        >
                            Unidades de Saúde
                        </a>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-down {
                    0% {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 1s ease-out forwards;
                }
            `}</style>
        </section>
    );
};
