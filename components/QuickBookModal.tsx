
import React, { useState, useMemo } from 'react';
import type { ProfessionalUser, Service, Appointment } from '../types';
import { supabase } from '../utils/supabase';

interface QuickBookModalProps {
    user: ProfessionalUser;
    appointmentsForToday: Appointment[];
    onClose: () => void;
    onBookingSuccess: () => void;
}

// Icons
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const CheckCircleIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export const QuickBookModal: React.FC<QuickBookModalProps> = ({ user, appointmentsForToday, onClose, onBookingSuccess }) => {
    const [clientName, setClientName] = useState('');
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [justSelectedTime, setJustSelectedTime] = useState<string | null>(null);
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const availableTimeSlots = useMemo(() => {
        const slots = [];
        const { settings } = user;
        if (!settings.workHours) return [];

        const dayOfWeek = today.getDay();
        const isWorkDay = settings.workDays.includes(dayOfWeek);
        const isBlockedDay = settings.blockedDays.includes(todayStr);

        if (!isWorkDay || isBlockedDay) return [];

        const bookedTimes = appointmentsForToday
            .map(a => a.time.substring(0, 5));
        
        const blockedSlotsForDay = settings.blockedTimeSlots?.[todayStr] || [];

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        const startHour = parseInt(settings.workHours.start.split(':')[0]);
        const endHour = parseInt(settings.workHours.end.split(':')[0]);
        const lunchStart = parseInt(settings.workHours.lunchStart?.split(':')[0] || '12');
        const lunchEnd = parseInt(settings.workHours.lunchEnd?.split(':')[0] || '13');

        for (let h = startHour; h < endHour; h++) {
            for (let m = 0; m < 60; m += 30) {
                // Skip lunch hours
                if (h >= lunchStart && h < lunchEnd) continue;

                // Skip past times
                if (h < currentHour || (h === currentHour && m < currentMinute)) {
                    continue;
                }

                const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                
                if (!bookedTimes.includes(time) && !blockedSlotsForDay.includes(time)) {
                    slots.push(time);
                }
            }
        }
        return slots;

    }, [user, appointmentsForToday, todayStr]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!clientName || !selectedService || !selectedTime) {
            setError("Por favor, preencha todos os campos.");
            return;
        }

        setIsSubmitting(true);

        const trimmedClientName = clientName.trim();
        
        const appointmentData = {
            // client_id is null because we are not creating a user account
            professional_id: user.id,
            client_name: trimmedClientName,
            professional_name: user.name,
            professional_image_url: user.imageUrl,
            service_name: selectedService.name,
            date: todayStr,
            time: selectedTime,
            price: selectedService.price,
            status: 'upcoming' as const
        };
        
        const { error: insertError } = await supabase.from('appointments').insert([appointmentData]);

        if (insertError) {
            console.error("Error creating quick appointment:", insertError);
            setError("Não foi possível criar o agendamento. Verifique se o horário ainda está disponível.");
            setIsSubmitting(false);
        } else {
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative text-center">
                    <CheckCircleIcon />
                    <h3 className="text-2xl font-bold text-stone-800 mt-4">Agendamento Criado!</h3>
                    <p className="text-stone-600 mt-2">
                        O agendamento para <strong>{clientName}</strong> às <strong>{selectedTime}</strong> foi confirmado.
                    </p>
                    <button 
                        onClick={onBookingSuccess} 
                        className="mt-6 w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors duration-300"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[90vh]">
                 <button onClick={onClose} aria-label="Fechar" className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 transition-colors">
                    <XIcon />
                </button>
                <h2 className="text-2xl font-bold text-center text-stone-800 mb-4">Agendamento Rápido</h2>
                
                <form id="quick-book-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto space-y-4 pr-2">
                    <div>
                        <label htmlFor="client-name" className="block text-stone-600 mb-1 font-semibold">Nome do Cidadão</label>
                        <input 
                            type="text" 
                            id="client-name" 
                            required 
                            value={clientName} 
                            onChange={e => setClientName(e.target.value)} 
                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300" 
                            placeholder="Ex: João Silva"
                        />
                    </div>
                     <div>
                        <label className="block text-stone-600 mb-1 font-semibold">Serviço</label>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                             {user.services.length > 0 ? user.services.map(service => (
                                <div
                                    key={service.id}
                                    onClick={() => setSelectedService(service)}
                                    className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${selectedService?.id === service.id ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200' : 'border-stone-200 hover:bg-stone-100'}`}
                                >
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-semibold text-stone-800">{service.name}</span>
                                        <span className="text-stone-600">R$ {service.price.toFixed(2)}</span>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-stone-500">Nenhum serviço cadastrado.</p>}
                        </div>
                    </div>
                     <div>
                        <label className="block text-stone-600 mb-1 font-semibold">Horários Disponíveis (Hoje)</label>
                        {availableTimeSlots.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2">
                                {availableTimeSlots.map(time => (
                                    <button
                                        type="button"
                                        key={time}
                                        onClick={() => {
                                            setSelectedTime(time);
                                            setJustSelectedTime(time);
                                            setTimeout(() => setJustSelectedTime(null), 300);
                                        }}
                                        className={`p-2 rounded-lg text-sm transition-colors duration-200 ${selectedTime === time ? 'bg-teal-600 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'} ${justSelectedTime === time ? 'animate-pop' : ''}`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-stone-500 bg-stone-50 p-4 rounded-lg">Nenhum horário disponível para hoje.</p>
                        )}
                    </div>
                </form>

                <div className="mt-auto flex-shrink-0 pt-4 border-t">
                    {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
                    <button 
                        type="submit" 
                        form="quick-book-form"
                        disabled={isSubmitting}
                        className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors duration-300 disabled:bg-teal-300"
                    >
                       {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
                    </button>
                </div>

            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
                @keyframes pop {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                .animate-pop { animation: pop 0.3s ease-out; }
            `}</style>
        </div>
    );
};
