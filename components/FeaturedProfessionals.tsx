import React, { useState, useEffect } from 'react';
import type { Professional } from '../types';
import { supabase, getInitials, getColor } from '../utils/supabase';

interface FeaturedProfessionalsProps {
    onScheduleClick: (professional: Professional) => void;
}

const UserBadgeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
         <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
);

const LocationPinIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

const ProfessionalCard: React.FC<{ professional: Professional; onScheduleClick: (professional: Professional) => void }> = ({ professional, onScheduleClick }) => {
    const hasValidImage = professional.imageUrl && professional.imageUrl.startsWith('http');
    const unitName = professional.settings?.assignedUnit;
    
    return (
        <div className="bg-white rounded-lg shadow-md border border-stone-100 overflow-hidden transform transition-all duration-300 hover:shadow-xl flex flex-col">
            {hasValidImage ? (
                <img className="w-full h-48 object-cover object-top" src={professional.imageUrl} alt={professional.name} />
            ) : (
                <div className={`w-full h-48 flex items-center justify-center text-white font-bold ${getColor(professional.name)}`}>
                    <span className="text-5xl">{getInitials(professional.name)}</span>
                </div>
            )}
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-stone-800 mb-1">{professional.name}</h3>
                
                {unitName ? (
                    <p className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded w-fit mb-4 flex items-center border border-teal-100">
                        <LocationPinIcon className="w-3 h-3 mr-1" />
                        {unitName}
                    </p>
                ) : (
                    <p className="text-sm text-stone-500 mb-4 font-medium uppercase tracking-wide">Servidor Público</p>
                )}
                
                <div className="text-stone-600 mb-4 flex-grow">
                    {professional.specialties?.length > 0 ? (
                        professional.specialties.slice(0, 2).map((s, i) => (
                            <div key={i} className="flex items-center text-sm mb-1">
                                <span className="w-2 h-2 bg-rose-400 rounded-full mr-2"></span>
                                <p className="truncate">{s.name}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-stone-400 text-sm">Especialidades não listadas.</p>
                    )}
                </div>
                
                <div className="mt-auto">
                    <button 
                        onClick={() => onScheduleClick(professional)}
                        className="w-full bg-stone-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors duration-300 shadow-sm"
                    >
                        Ver Horários
                    </button>
                </div>
            </div>
        </div>
    );
};


export const FeaturedProfessionals: React.FC<FeaturedProfessionalsProps> = ({ onScheduleClick }) => {
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfessionals = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, specialties:specialty, imageUrl:image_url, services, settings') // Removed assignedUnit
                .eq('role', 'professional')
                .limit(4);

            if (error) {
                console.error("Error fetching professionals:", error.message);
                setError('Não foi possível carregar os servidores.');
            } else if (data) {
                setProfessionals(data as Professional[]);
            }
            setLoading(false);
        };

        fetchProfessionals();
    }, []);

    const renderContent = () => {
        if (loading) {
            return <div className="text-center py-8"><p>Carregando unidades...</p></div>;
        }
        if (error) {
            return <div className="text-center text-red-500 py-8">{error}</div>;
        }
        if (professionals.length > 0) {
            return (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {professionals.map((prof) => (
                        <ProfessionalCard key={prof.id} professional={prof} onScheduleClick={onScheduleClick} />
                    ))}
                </div>
            );
        }
        return (
            <div className="text-center py-8 bg-stone-50 rounded-lg">
                <p className="text-stone-500">Nenhum servidor ou unidade disponível no momento.</p>
            </div>
        );
    };

    return (
        <section id="professionals" className="py-16 bg-stone-50 border-t border-stone-200">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800">Unidades e Especialistas</h2>
                    <p className="text-stone-500 mt-2 text-lg">Servidores públicos prontos para atender você nas unidades municipais.</p>
                </div>
                {renderContent()}
            </div>
        </section>
    );
};