
import React, { useState, useMemo, useEffect } from 'react';
import type { ProfessionalUser, Service, Appointment, User } from '../types';
import { supabase } from '../utils/supabase';
import { HEALTH_UNIT_DATA } from '../constants';

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

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const UserGroupIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const IdentificationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
    </svg>
);

const WhatsappIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
);

export const QuickBookModal: React.FC<QuickBookModalProps> = ({ user, appointmentsForToday, onClose, onBookingSuccess }) => {
    // Patient Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Form State
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [justSelectedTime, setJustSelectedTime] = useState<string | null>(null);
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Patient Search Logic (Unchanged)
    useEffect(() => {
        const searchPatients = async () => {
            if (searchTerm.length < 2) {
                setSearchResults([]);
                return;
            }
            setSearching(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'client')
                .or(`name.ilike.%${searchTerm}%,whatsapp.ilike.%${searchTerm}%,susCardNumber.ilike.%${searchTerm}%`)
                .limit(5);

            if (!error && data) setSearchResults(data as User[]);
            setSearching(false);
        };
        const timeoutId = setTimeout(searchPatients, 400);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleSelectPatient = (patient: User) => {
        setSelectedPatient(patient);
        setSearchTerm(patient.name);
        setShowResults(false);
    };

    const handleClearSelection = () => {
        setSelectedPatient(null);
        setSearchTerm('');
        setShowResults(false);
    };

    // Calculate Available Slots across all units
    const availableTimeSlots = useMemo(() => {
        const slots: { time: string; unitName: string }[] = [];
        const { settings } = user;
        const dayOfWeek = today.getDay();
        const isBlockedDay = settings.blockedDays.includes(todayStr);

        if (isBlockedDay) return [];

        const bookedTimes = appointmentsForToday.map(a => a.time.substring(0, 5));
        const blockedSlotsForDay = settings.blockedTimeSlots?.[todayStr] || [];
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // 1. Check legacy single schedule
        if (settings.workDays && settings.workDays.includes(dayOfWeek) && settings.workHours) {
             const startHour = parseInt(settings.workHours.start.split(':')[0]);
             const endHour = parseInt(settings.workHours.end.split(':')[0]);
             for (let h = startHour; h < endHour; h++) {
                for (let m = 0; m < 60; m += 30) {
                    // Simple skip lunch logic 12-13
                    if (h >= 12 && h < 13) continue;
                    if (h < currentHour || (h === currentHour && m < currentMinute)) continue;
                    
                    const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                    if (!bookedTimes.includes(time) && !blockedSlotsForDay.includes(time)) {
                        slots.push({ time, unitName: settings.assignedUnit || 'Unidade Padrão' });
                    }
                }
             }
        }

        // 2. Check new multi-schedule
        if (settings.schedule) {
            const activeSchedules = settings.schedule.filter(s => s.workDays.includes(dayOfWeek));
            activeSchedules.forEach(schedule => {
                const startHour = parseInt(schedule.start.split(':')[0]);
                const endHour = parseInt(schedule.end.split(':')[0]);
                
                for (let h = startHour; h < endHour; h++) {
                    for (let m = 0; m < 60; m += 30) {
                        if (h >= 12 && h < 13) continue;
                        if (h < currentHour || (h === currentHour && m < currentMinute)) continue;

                        const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                        // Add if not already booked or blocked (even if duplicates time across units, for quick book we assume sequential)
                        if (!bookedTimes.includes(time) && !blockedSlotsForDay.includes(time)) {
                             // Check if time already exists from legacy to avoid duplicates if mixed
                             if (!slots.some(s => s.time === time)) {
                                 slots.push({ time, unitName: schedule.unitName });
                             }
                        }
                    }
                }
            });
        }

        return slots.sort((a, b) => a.time.localeCompare(b.time));
    }, [user, appointmentsForToday, todayStr]);

    const handleTimeSelect = (time: string, unitName: string) => {
        setSelectedTime(time);
        setSelectedUnit(unitName);
        setJustSelectedTime(time);
        setTimeout(() => setJustSelectedTime(null), 300);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const finalClientName = selectedPatient ? selectedPatient.name : searchTerm;

        if (!finalClientName || !selectedService || !selectedTime) {
            setError("Por favor, preencha todos os campos.");
            return;
        }

        setIsSubmitting(true);

        const appointmentData = {
            client_id: selectedPatient?.id || null, 
            professional_id: user.id,
            client_name: finalClientName.trim(),
            professional_name: user.name,
            professional_image_url: user.imageUrl,
            service_name: selectedService.name,
            date: todayStr,
            time: selectedTime,
            price: selectedService.price,
            status: 'upcoming' as const,
            healthUnit: selectedUnit || user.settings.assignedUnit, // Important: save unit
            locationType: 'local'
        };
        
        const { error: insertError } = await supabase.from('appointments').insert([appointmentData]);

        if (insertError) {
            console.error("Error creating quick appointment:", insertError);
            setError("Não foi possível criar o agendamento. Verifique disponibilidade.");
            setIsSubmitting(false);
        } else {
            setSuccess(true);
        }
    };

    const handleSendConfirmation = () => {
        const patientName = selectedPatient ? selectedPatient.name : searchTerm;
        const patientPhone = selectedPatient?.whatsapp || '';
        
        const unitName = selectedUnit || user.settings?.assignedUnit;
        const unitData = HEALTH_UNIT_DATA.find(u => u.name === unitName);
        const unitPhone = unitData?.whatsapp;

        const dateObj = new Date(todayStr + 'T00:00:00');
        const dateFormatted = dateObj.toLocaleDateString('pt-BR');

        const message = `*SIAGA - Confirmação de Agendamento* 🗓️\n\n` +
            `Olá, *${patientName.split(' ')[0]}*!\n\n` +
            `Seu agendamento foi realizado com sucesso.\n` +
            `--------------------------------\n` +
            `🏥 *Serviço:* ${selectedService?.name}\n` +
            `👨‍⚕️ *Profissional:* ${user.name}\n` +
            `📅 *Data:* ${dateFormatted} (Hoje)\n` +
            `⏰ *Horário:* ${selectedTime}\n` +
            `--------------------------------\n\n` +
            `📍 *Local:* ${unitName || 'Unidade de Saúde'}\n\n` +
            `👉 *Por favor, responda com um "OK" para confirmar que está ciente.*\n\n` +
            (unitPhone ? `📞 Em caso de dúvidas, contate a unidade: ${unitPhone}` : '');

        const encodedMsg = encodeURIComponent(message);
        
        const url = patientPhone 
            ? `https://wa.me/55${patientPhone.replace(/\D/g, '')}?text=${encodedMsg}`
            : `https://wa.me/?text=${encodedMsg}`;
        
        window.open(url, '_blank');
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative text-center">
                    <CheckCircleIcon />
                    <h3 className="text-2xl font-bold text-stone-800 mt-4">Agendamento Criado!</h3>
                    <p className="text-stone-600 mt-2">
                        <strong>{selectedPatient?.name || searchTerm}</strong><br/>
                        {selectedTime} - {selectedUnit}
                    </p>
                    
                    <button 
                        onClick={handleSendConfirmation}
                        className="mt-6 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center shadow-md"
                    >
                        <WhatsappIcon />
                        Enviar Confirmação e Solicitar OK
                    </button>

                    <button onClick={onBookingSuccess} className="mt-3 w-full text-stone-500 font-semibold py-2 px-4 rounded-lg hover:bg-stone-100 transition-colors duration-300">
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
                    
                    {/* Patient Search Section (Same as previous) */}
                    <div className="relative">
                        <label htmlFor="client-search" className="block text-stone-600 mb-1 font-semibold">Paciente</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                            <input 
                                type="text" 
                                id="client-search" 
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if(!selectedPatient) setShowResults(true);
                                    if(selectedPatient && e.target.value !== selectedPatient.name) setSelectedPatient(null);
                                }}
                                onFocus={() => setShowResults(true)}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 ${selectedPatient ? 'border-teal-500 bg-teal-50 text-teal-900 font-semibold' : 'border-stone-300'}`}
                                placeholder="Nome, Celular ou Cartão SUS..."
                                autoComplete="off"
                            />
                            {selectedPatient && <button type="button" onClick={handleClearSelection} className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-red-500">&times;</button>}
                        </div>
                        {showResults && searchTerm.length >= 2 && !selectedPatient && (
                            <div className="absolute z-10 w-full bg-white mt-1 border border-stone-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {searching ? <div className="p-3 text-sm text-stone-500 text-center">Buscando na base...</div> : searchResults.length > 0 ? (
                                    searchResults.map(p => (
                                        <div key={p.id} onClick={() => handleSelectPatient(p)} className="p-3 hover:bg-teal-50 cursor-pointer border-b border-stone-100 last:border-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-sm text-stone-800">{p.name}</p>
                                                    <p className="text-xs text-stone-500 flex items-center mt-0.5">
                                                        {p.susCardNumber && <span className="flex items-center mr-2 bg-stone-100 px-1 rounded"><IdentificationIcon /> SUS: {p.susCardNumber}</span>}
                                                        {p.whatsapp || 'Sem tel'}
                                                    </p>
                                                </div>
                                                {p.permanentCompanion && <div className="bg-amber-100 text-amber-700 p-1 rounded-full" title={`Acompanhante: ${p.permanentCompanion}`}><UserGroupIcon /></div>}
                                            </div>
                                        </div>
                                    ))
                                ) : <div className="p-3 text-sm text-stone-500">Nenhum paciente encontrado. <br/><span className="text-xs">O nome digitado será usado como "Paciente Avulso".</span></div>}
                            </div>
                        )}
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
                            <div className="grid grid-cols-2 gap-2">
                                {availableTimeSlots.map(slot => (
                                    <button
                                        type="button"
                                        key={slot.time}
                                        onClick={() => handleTimeSelect(slot.time, slot.unitName)}
                                        className={`p-2 rounded-lg text-sm transition-colors duration-200 flex flex-col items-center ${selectedTime === slot.time ? 'bg-teal-600 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'} ${justSelectedTime === slot.time ? 'animate-pop' : ''}`}
                                    >
                                        <span className="font-bold">{slot.time}</span>
                                        <span className="text-[10px] opacity-90">{slot.unitName}</span>
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
                    <button type="submit" form="quick-book-form" disabled={isSubmitting} className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors duration-300 disabled:bg-teal-300">
                       {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
                    </button>
                </div>
            </div>
            <style>{`@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.3s ease-out forwards; } @keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } } .animate-pop { animation: pop 0.3s ease-out; }`}</style>
        </div>
    );
};
