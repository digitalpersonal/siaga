
import React, { useState, useCallback, useRef } from 'react';
import type { User } from '../types';

interface HeaderProps {
    user: User | null;
    onLoginClick: () => void;
    onSignUpClick: () => void;
    onLogout: () => void;
}

const LogoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-teal-600">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
    </svg>
);

export const Header: React.FC<HeaderProps> = ({ user, onLoginClick, onSignUpClick, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const headerRef = useRef<HTMLElement>(null);
    
    const navLinks = [
        { name: "Início", href: "#hero-section" },
        { name: "Serviços Públicos", href: "#services-section" },
        { name: "Unidades", href: "#professionals" },
        { name: "Fale Conosco", href: "#footer" }
    ];

    /**
     * Handles smooth scrolling with dynamic offset for sticky header and accessibility focus management.
     */
    const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const targetId = href.substring(1);
        
        if (targetId === "" || href === "#") {
             window.scrollTo({ top: 0, behavior: 'smooth' });
             setIsMenuOpen(false);
             return;
        }

        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            // Dynamic header height calculation
            const headerHeight = headerRef.current?.offsetHeight || 80;
            const extraPadding = 10; // Extra breathing room
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerHeight - extraPadding;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Accessibility: Move focus to the target element so screen readers know context changed
            // We use preventScroll: true because we handled the scrolling manually above
            targetElement.setAttribute('tabindex', '-1');
            targetElement.focus({ preventScroll: true });

            // Remove tabindex on blur to keep DOM clean
            const handleBlur = () => {
                targetElement.removeAttribute('tabindex');
                targetElement.removeEventListener('blur', handleBlur);
            };
            targetElement.addEventListener('blur', handleBlur);
        }

        setIsMenuOpen(false);
    }, []);

    const handleLogoutClick = () => {
        onLogout();
        setIsMenuOpen(false);
    }
    
    const handleLoginClick = () => {
        onLoginClick();
        setIsMenuOpen(false);
    }
    
    const handleSignUpClick = () => {
        onSignUpClick();
        setIsMenuOpen(false);
    }

    return (
        <header ref={headerRef} className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg shadow-sm border-b border-stone-100 transition-all duration-300">
            <div className="container mx-auto px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <a href="#hero-section" onClick={(e) => !user && handleNavClick(e, '#hero-section')} className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg p-1">
                            <LogoIcon />
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-bold text-stone-800 leading-none">SIAGA</h1>
                                <span className="text-xs text-stone-500 font-medium tracking-wider">Portal do Cidadão</span>
                            </div>
                        </a>
                    </div>
                    
                    {/* Desktop Navigation */}
                    {!user && (
                        <nav className="hidden md:flex items-center space-x-8" aria-label="Navegação Principal">
                            {navLinks.map(link => (
                                <a 
                                    key={link.name} 
                                    href={link.href} 
                                    onClick={(e) => handleNavClick(e, link.href)} 
                                    className="text-stone-600 hover:text-teal-600 transition-colors duration-300 cursor-pointer font-medium text-sm lg:text-base focus:outline-none focus:text-teal-700"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </nav>
                    )}
                    
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                             <div className="flex items-center space-x-4">
                                <span className="font-semibold text-stone-700">Olá, {user.name.split(' ')[0]}</span>
                                <button onClick={onLogout} className="text-stone-600 hover:text-teal-600 transition-colors duration-300 text-sm font-medium">Sair</button>
                            </div>
                        ) : (
                            <>
                                <button onClick={onLoginClick} className="text-stone-600 hover:text-teal-600 transition-colors duration-300 font-medium text-sm">Acesso Servidor</button>
                                <button onClick={onSignUpClick} className="bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 transition-transform duration-300 hover:scale-105 font-semibold shadow-md shadow-teal-200 text-sm">Entrar com Gov.br</button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)} 
                            className="text-stone-600 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg p-1 flex items-center space-x-1"
                            aria-expanded={isMenuOpen}
                            aria-controls="mobile-menu"
                            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                        >
                            <span className="font-medium text-sm">{isMenuOpen ? 'Fechar' : 'Menu'}</span>
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div id="mobile-menu" className="md:hidden mt-4 animate-fade-in-down">
                        <nav className="flex flex-col space-y-4 pb-4">
                             {!user && navLinks.map(link => (
                                <a 
                                    key={link.name} 
                                    href={link.href} 
                                    onClick={(e) => handleNavClick(e, link.href)} 
                                    className="text-stone-600 hover:text-teal-600 transition-colors duration-300 cursor-pointer text-lg font-medium border-b border-stone-50 pb-2"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <div className={`flex flex-col space-y-3 pt-2 ${!user ? 'border-t border-stone-100' : ''}`}>
                                {user ? (
                                    <>
                                        <span className="font-semibold text-stone-700 text-left px-1">Olá, {user.name.split(' ')[0]}</span>
                                        <button onClick={handleLogoutClick} className="text-left text-stone-600 hover:text-teal-600 transition-colors duration-300 px-1 py-2 font-medium">Sair</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={handleLoginClick} className="text-left text-stone-600 hover:text-teal-600 transition-colors duration-300 py-2 font-medium">Acesso Servidor</button>
                                        <button onClick={handleSignUpClick} className="w-full bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 transition-all duration-300 font-bold shadow-md">Entrar com Gov.br</button>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fade-in-down {
                    0% {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.3s ease-out forwards;
                }
            `}</style>
        </header>
    );
};
