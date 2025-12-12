
import React from 'react';

// Medical Icon (Stethoscope)
const StethoscopeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 0 1 5 2h14a.3.3 0 0 1 .2.3v3.4a.3.3 0 0 1-.2.3l-5 5v3.4a1 1 0 0 0 .3.7l1.4 1.4a2 2 0 0 1 0 2.8l-1.4 1.4a2 2 0 0 1-2.8 0l-1.4-1.4a1 1 0 0 0-.3-.7v-3.4l-5-5a.3.3 0 0 1-.2-.3V2.3z"></path><path d="M12 11V2"></path></svg>
);

// Dental Icon (Smile/Tooth representation)
const ToothIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
        <path d="M7 10h10v4H7z" opacity="0" /> {/* Spacer */}
    </svg>
);

const categories = [
    { name: 'Consultas Médicas', description: 'Agendamento com Clínico Geral, Pediatra, Ginecologista e especialistas.', Icon: StethoscopeIcon },
    { name: 'Odontologia', description: 'Tratamentos dentários básicos, limpeza, extrações e urgências.', Icon: ToothIcon },
];

interface ServiceCategoriesProps {
    onCategoryClick: (categoryName: string) => void;
}

export const ServiceCategories: React.FC<ServiceCategoriesProps> = ({ onCategoryClick }) => {
    return (
        <section id="services-section" className="py-16 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800">Serviços de Saúde</h2>
                    <p className="text-stone-500 mt-2 text-lg max-w-2xl mx-auto">Selecione a especialidade desejada para visualizar os profissionais e horários disponíveis na rede municipal.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {categories.map((category) => (
                        <button 
                            key={category.name} 
                            onClick={() => onCategoryClick(category.name)}
                            className="bg-stone-50 p-8 rounded-xl border border-stone-200 shadow-sm hover:shadow-lg hover:border-teal-200 hover:-translate-y-1 transition-all duration-300 text-center w-full focus:outline-none group"
                        >
                            <div className="inline-flex items-center justify-center p-4 bg-white text-teal-600 rounded-full mb-6 shadow-sm group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                                <category.Icon />
                            </div>
                            <h3 className="text-xl font-bold text-stone-800 mb-3">{category.name}</h3>
                            <p className="text-stone-500 leading-relaxed">{category.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};
