
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { ProfessionalUser, Appointment, Service, Specialty } from '../types';
import { supabase, getInitials, getColor } from '../utils/supabase';
import { ProfessionalCalendar } from '../components/ProfessionalCalendar';
import { QuickBookModal } from '../components/QuickBookModal';

interface ProfessionalDashboardProps {
    user: ProfessionalUser;
    onProfileUpdate: (updatedFields: Partial<ProfessionalUser>) => void;
}

// Icons
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const CogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const ClipboardListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 00-2-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
);
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const ArchiveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
);
const DogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-stone-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 5.2a2 2 0 0 1 2-2.2h.4a2 2 0 0 1 2 2.2v.3a2 2 0 0 1-2 2.2h-.4a2 2 0 0 1-2-2.2v-.3Z"></path><path d="M9.5 14.5A2.5 2.5 0 0 1 7 12V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3a2.5 2.5 0 0 1-2.5 2.5h-3Z"></path><path d="M11 14v3a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-3"></path><path d="M10 14h.01"></path><path d="M14 14h.01"></path><path d="M7 17v-2.3a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2V17"></path><path d="M5 14a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1"></path><path d="M19 14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1"></path></svg>;
const PlusCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const BlockedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);
const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
);
const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
    </svg>
);
const ChartBarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const AppointmentNoteEditor: React.FC<{
    appointment: Appointment;
    onUpdate: (updatedAppointment: Appointment) => void;
}> = ({ appointment, onUpdate }) => {
    const [notes, setNotes] = useState(appointment.notes || '');
    const [isSaving, setIsSaving] = useState(false);
    
    const handleSave = async () => {
        if (notes === (appointment.notes || '')) return;
        setIsSaving(true);
        const { data, error } = await supabase
            .from('appointments')
            .update({ notes })
            .eq('id', appointment.id)
            .select()
            .single();

        if (error) {
            alert('Erro ao salvar anotação.');
            console.error(error);
        } else if (data) {
            onUpdate(data);
        }
        setIsSaving(false);
    };

    return (
        <div className="mt-3 border-t pt-3">
            <label className="text-xs font-semibold text-stone-600">Anotações</label>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicionar anotações sobre o cidadão ou serviço..."
                className="w-full p-2 border border-stone-200 rounded-md text-sm mt-1 focus:ring-1 focus:ring-teal-400 focus:outline-none"
                rows={2}
            />
            <button
                onClick={handleSave}
                disabled={isSaving || notes === (appointment.notes || '')}
                className="mt-1 text-xs bg-stone-200 text-stone-700 font-semibold py-1 px-3 rounded-md hover:bg-stone-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isSaving ? 'Salvando...' : 'Salvar Anotação'}
            </button>
        </div>
    );
};

const DayDetailPanel: React.FC<{
    selectedDate: Date;
    appointments: Appointment[];
    settings: ProfessionalUser['settings'];
    onClose: () => void;
    onAppointmentUpdate: (updatedAppointment: Appointment) => void;
}> = ({ selectedDate, appointments, settings, onClose, onAppointmentUpdate }) => {
    
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    const handleUpdateStatus = async (appointmentId: string, status: 'completed' | 'cancelled') => {
        if (status === 'cancelled' && !window.confirm('Tem certeza que deseja cancelar este agendamento?')) return;
        
        setLoadingAction(appointmentId);
        const { data, error } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', appointmentId)
            .select()
            .single();

        if (error) {
            alert(`Erro ao ${status === 'completed' ? 'finalizar' : 'cancelar'} o agendamento.`);
            console.error(error);
        } else if (data) {
            onAppointmentUpdate(data);
        }
        setLoadingAction(null);
    };

    const timeSlots = useMemo(() => {
        const slots = [];
        if (!settings.workHours) return [];
        const start = parseInt(settings.workHours.start.split(':')[0]);
        const end = parseInt(settings.workHours.end.split(':')[0]);
        for (let i = start; i < end; i++) {
            slots.push(`${String(i).padStart(2, '0')}:00`);
            slots.push(`${String(i).padStart(2, '0')}:30`);
        }
        return slots;
    }, [settings.workHours]);

    const getAppointmentForSlot = (time: string) => {
        return appointments.find(a => a.time.startsWith(time.substring(0, 5))); // Match HH:MM
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border w-full lg:w-1/3 animate-fade-in-right">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-stone-800">
                    {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <button onClick={onClose} aria-label="Fechar painel de detalhes do dia" className="text-stone-500 hover:text-stone-800 p-1 rounded-full hover:bg-stone-100 transition-colors text-2xl font-bold leading-none">&times;</button>
            </div>
            <div className="bg-stone-50 p-3 rounded-lg text-center mb-4">
                <p className="font-semibold text-stone-700">
                    {appointments.length > 0
                        ? `Você tem ${appointments.length} agendamento(s) para este dia.`
                        : "Nenhum agendamento para este dia."}
                </p>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {timeSlots.map(time => {
                    const appointment = getAppointmentForSlot(time);
                    const isBlocked = settings.blockedTimeSlots && settings.blockedTimeSlots[selectedDate.toISOString().split('T')[0]]?.includes(time);
                    
                    if (appointment) {
                        return (
                             <div key={time} className="bg-teal-50 border-l-4 border-teal-500 p-3 rounded-r-lg">
                                <p className="font-semibold text-teal-800">{time} - {appointment.service_name}</p>
                                <p className="text-sm text-teal-700">Cidadão: {appointment.client_name}</p>
                                {appointment.pet_name && (
                                    <p className="text-sm text-teal-600 flex items-center"><DogIcon /> {appointment.pet_name} ({appointment.pet_breed})</p>
                                )}
                                <AppointmentNoteEditor appointment={appointment} onUpdate={onAppointmentUpdate} />
                                {appointment.status === 'upcoming' && (
                                    <div className="flex gap-2 mt-2 border-t pt-2">
                                        <button
                                            onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                                            disabled={loadingAction === appointment.id}
                                            className="text-xs font-semibold py-1 px-3 rounded-md bg-stone-200 text-stone-700 hover:bg-stone-300 transition-colors disabled:opacity-50"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                                            disabled={loadingAction === appointment.id}
                                            className="text-xs font-semibold py-1 px-3 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                                        >
                                            Finalizar
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    }
                    if (isBlocked) {
                         return (
                            <div key={time} className="bg-stone-100 border-l-4 border-stone-300 p-3 rounded-r-lg flex items-center">
                                <BlockedIcon />
                                <span className="text-stone-500 line-through">{time} - Horário Bloqueado</span>
                            </div>
                        )
                    }
                    return (
                        <div key={time} className="flex justify-between items-center bg-white p-3 rounded-lg hover:bg-stone-50">
                            <span className="text-stone-600">{time} - Disponível</span>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

const ServiceEditor: React.FC<{ services: Service[]; userId: string; onServicesUpdate: (services: Service[]) => void; }> = ({ services, userId, onServicesUpdate }) => {
    const [localServices, setLocalServices] = useState(services || []);
    const [newServiceName, setNewServiceName] = useState('');
    const [newServicePrice, setNewServicePrice] = useState('');
    const [newServiceDuration, setNewServiceDuration] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleServiceChange = (index: number, field: keyof Service, value: any) => {
        const updatedServices = [...localServices];
        (updatedServices[index] as any)[field] = field === 'price' || field === 'duration' ? Number(value) : value;
        setLocalServices(updatedServices);
    };

    const handleRemoveService = (indexToRemove: number) => {
        if (window.confirm('Tem certeza que deseja remover este serviço? Esta ação não pode ser desfeita.')) {
            setLocalServices(prev => prev.filter((_, index) => index !== indexToRemove));
        }
    };

    const handleAddNewService = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newServiceName || !newServicePrice || !newServiceDuration) {
            alert("Por favor, preencha todos os campos do novo serviço.");
            return;
        }

        const newService: Service = {
            id: crypto.randomUUID(),
            name: newServiceName,
            price: Number(newServicePrice),
            duration: Number(newServiceDuration),
        };

        setLocalServices([...localServices, newService]);

        // Reset form fields
        setNewServiceName('');
        setNewServicePrice('');
        setNewServiceDuration('');
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        const { error } = await supabase
            .from('profiles')
            .update({ services: localServices })
            .eq('id', userId);
        
        setIsSaving(false);
        if (error) {
            alert("Erro ao salvar alterações.");
            console.error(error);
        } else {
            alert("Serviços atualizados com sucesso!");
            onServicesUpdate(localServices);
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-2xl font-bold text-stone-800 mb-4">Meus Serviços</h3>
            
            {localServices.length === 0 ? (
                <div className="text-center bg-stone-50 p-6 rounded-lg mb-6 border border-stone-200">
                    <p className="text-stone-600 font-medium">Você ainda não cadastrou nenhum serviço.</p>
                    <p className="text-stone-500 text-sm mt-1">Use o formulário abaixo para adicionar seu primeiro serviço e começar a receber agendamentos.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {localServices.map((service, index) => (
                        <div key={service.id || index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border rounded-lg bg-stone-50">
                            <div className="md:col-span-2">
                                <label className="text-xs font-medium text-stone-500">Nome do Serviço</label>
                                <input type="text" value={service.name} onChange={(e) => handleServiceChange(index, 'name', e.target.value)} className="mt-1 w-full p-2 border rounded-md border-stone-300" placeholder="Nome do Serviço" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-stone-500">Valor (R$)</label>
                                <input type="number" value={service.price} onChange={(e) => handleServiceChange(index, 'price', e.target.value)} className="mt-1 w-full p-2 border rounded-md border-stone-300" placeholder="Preço" />
                            </div>
                            <div className="flex items-end gap-2">
                                <div className="flex-grow">
                                    <label className="text-xs font-medium text-stone-500">Duração (min)</label>
                                    <input type="number" value={service.duration} onChange={(e) => handleServiceChange(index, 'duration', e.target.value)} className="mt-1 w-full p-2 border rounded-md border-stone-300" placeholder="Duração" />
                                </div>
                                <button onClick={() => handleRemoveService(index)} className="h-10 text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 flex justify-center items-center" aria-label="Remover serviço">
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            <div className="mt-8 border-t pt-6">
                <h4 className="text-xl font-bold text-stone-700 mb-3">Adicionar Novo Serviço</h4>
                <form onSubmit={handleAddNewService} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 bg-stone-50 border rounded-lg">
                     <div className="md:col-span-2">
                        <label htmlFor="new-service-name" className="text-sm font-medium text-stone-600">Nome do Serviço</label>
                        <input id="new-service-name" type="text" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} className="mt-1 w-full p-2 border rounded-md border-stone-300" placeholder="Ex: Atendimento Geral" />
                    </div>
                    <div>
                        <label htmlFor="new-service-price" className="text-sm font-medium text-stone-600">Valor (R$)</label>
                        <input id="new-service-price" type="number" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} className="mt-1 w-full p-2 border rounded-md border-stone-300" placeholder="Ex: 0" />
                    </div>
                    <div className="flex items-end gap-2">
                         <div className="flex-grow">
                             <label htmlFor="new-service-duration" className="text-sm font-medium text-stone-600">Duração (min)</label>
                            <input id="new-service-duration" type="number" value={newServiceDuration} onChange={(e) => setNewServiceDuration(e.target.value)} className="mt-1 w-full p-2 border rounded-md border-stone-300" placeholder="Ex: 60" />
                        </div>
                        <button type="submit" className="h-10 bg-stone-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-stone-800 transition-colors">Adicionar</button>
                    </div>
                </form>
            </div>

            <div className="mt-8 pt-6 border-t flex justify-end">
                <button onClick={handleSaveChanges} disabled={isSaving} className="bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSaving ? 'Salvando...' : 'Salvar Alterações nos Serviços'}
                </button>
            </div>
        </div>
    );
};

const TimeSlotBlockingModal: React.FC<{
    date: Date;
    settings: ProfessionalUser['settings'];
    onClose: () => void;
    onSave: (blockedSlots: string[]) => void;
    appointments: Appointment[];
}> = ({ date, settings, onClose, onSave, appointments }) => {
    const dateStr = date.toISOString().split('T')[0];
    const initialBlockedSlots = settings.blockedTimeSlots?.[dateStr] || [];
    const [blockedSlots, setBlockedSlots] = useState<string[]>(initialBlockedSlots);

    const timeSlots = useMemo(() => {
        const slots = [];
        if (!settings.workHours) return [];
        const start = parseInt(settings.workHours.start.split(':')[0]);
        const end = parseInt(settings.workHours.end.split(':')[0]);
        for (let i = start; i < end; i++) {
            slots.push(`${String(i).padStart(2, '0')}:00`);
            slots.push(`${String(i).padStart(2, '0')}:30`);
        }
        return slots;
    }, [settings.workHours]);

    const toggleSlot = (time: string) => {
        if (blockedSlots.includes(time)) {
            setBlockedSlots(prev => prev.filter(t => t !== time));
        } else {
            setBlockedSlots(prev => [...prev, time]);
        }
    };

    const handleSave = () => {
        onSave(blockedSlots);
    };

    const isBooked = (time: string) => {
        return appointments.some(a => a.time.startsWith(time));
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[90vh]">
                <button onClick={onClose} aria-label="Fechar" className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 transition-colors"><XIcon /></button>
                
                <h3 className="text-xl font-bold text-stone-800 mb-2">Bloquear Horários</h3>
                <p className="text-stone-500 text-sm mb-4">
                    Selecione os horários que deseja bloquear para o dia <strong>{date.toLocaleDateString('pt-BR')}</strong>.
                </p>

                <div className="flex-grow overflow-y-auto pr-2 mb-4">
                    <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map(time => {
                            const booked = isBooked(time);
                            const blocked = blockedSlots.includes(time);
                            return (
                                <button
                                    key={time}
                                    disabled={booked}
                                    onClick={() => toggleSlot(time)}
                                    className={`p-2 rounded-lg text-sm font-semibold transition-all border
                                        ${booked 
                                            ? 'bg-teal-100 text-teal-800 border-teal-200 cursor-not-allowed opacity-60' 
                                            : blocked 
                                                ? 'bg-red-500 text-white border-red-600 shadow-inner' 
                                                : 'bg-white text-stone-700 border-stone-200 hover:border-teal-500 hover:bg-stone-50'}
                                    `}
                                >
                                    {time}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-between items-center text-xs text-stone-500 mb-4 px-2">
                    <div className="flex items-center"><span className="w-3 h-3 bg-white border border-stone-300 rounded mr-1"></span> Disponível</div>
                    <div className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded mr-1"></span> Bloqueado</div>
                    <div className="flex items-center"><span className="w-3 h-3 bg-teal-100 rounded mr-1"></span> Agendado</div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                    <button onClick={onClose} className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-medium transition-colors">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-colors shadow-md">Salvar Bloqueios</button>
                </div>
            </div>
        </div>
    );
};

const AvailabilityManager: React.FC<{ 
    user: ProfessionalUser,
    appointmentsByDate: Map<string, Appointment[]>,
    onSettingsUpdate: (settings: ProfessionalUser['settings']) => void;
}> = ({ user, appointmentsByDate, onSettingsUpdate }) => {
    const [localSettings, setLocalSettings] = useState<ProfessionalUser['settings']>(user.settings);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);

    const isToday = (day: Date) => {
        const today = new Date();
        return day.getDate() === today.getDate() && day.getMonth() === today.getMonth() && day.getFullYear() === today.getFullYear();
    }
    
    // Calendar logic
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDay = firstDayOfMonth.getDay();

    const calendarDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < startingDay; i++) { days.push(null); }
        for (let i = 1; i <= daysInMonth; i++) { days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i)); }
        return days;
    }, [currentMonth, daysInMonth, startingDay]);
    
    // Time slots for selected day - used for list display
    const timeSlots = useMemo(() => {
        const slots = [];
        const { workHours } = localSettings;
        if (!workHours) return [];
        const start = parseInt(workHours.start.split(':')[0]);
        const end = parseInt(workHours.end.split(':')[0]);
        for (let i = start; i < end; i++) {
            slots.push(`${String(i).padStart(2, '0')}:00`);
            slots.push(`${String(i).padStart(2, '0')}:30`);
        }
        return slots;
    }, [localSettings.workHours]);

    const getAppointmentForSlot = (time: string) => {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const appointmentsForDay = appointmentsByDate.get(dateStr) || [];
        return appointmentsForDay.find(a => a.time.startsWith(time.substring(0, 5)));
    };

    // Handlers
    const toggleBlockDay = (day: Date) => {
        const dateStr = day.toISOString().split('T')[0];
        const newBlockedDays = localSettings.blockedDays.includes(dateStr)
            ? localSettings.blockedDays.filter(d => d !== dateStr)
            : [...localSettings.blockedDays, dateStr];
        setLocalSettings({ ...localSettings, blockedDays: newBlockedDays });
    };

    // Updated handler for modal save
    const handleTimeModalSave = (newBlockedSlots: string[]) => {
        const dateStr = selectedDate.toISOString().split('T')[0];
        setLocalSettings({
            ...localSettings,
            blockedTimeSlots: {
                ...localSettings.blockedTimeSlots,
                [dateStr]: newBlockedSlots
            }
        });
        setIsTimeModalOpen(false);
    };
    
     const handleSaveChanges = async () => {
        const { error } = await supabase
            .from('profiles')
            .update({ settings: localSettings })
            .eq('id', user.id);
        
        if (error) {
            alert("Erro ao salvar alterações.");
            console.error(error);
        } else {
            alert("Disponibilidade atualizada com sucesso!");
            onSettingsUpdate(localSettings);
        }
    };

    const isDayBlocked = localSettings.blockedDays.includes(selectedDate.toISOString().split('T')[0]);
    const appointmentsForSelectedDay = appointmentsByDate.get(selectedDate.toISOString().split('T')[0]) || [];

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-2xl font-bold text-stone-800 mb-4">Gerenciar Disponibilidade</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calendar View */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 rounded-full hover:bg-stone-100">&lt;</button>
                        <h2 className="text-xl font-bold text-stone-800">{currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}</h2>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 rounded-full hover:bg-stone-100">&gt;</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm font-semibold text-stone-500 mb-2">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                            if (!day) return <div key={`empty-${index}`} className="border rounded-lg h-20"></div>;
                            const dateStr = day.toISOString().split('T')[0];
                            const isBlocked = localSettings.blockedDays.includes(dateStr);
                            const isSelected = day.toDateString() === selectedDate.toDateString();
                            return (
                                <div key={dateStr} onClick={() => setSelectedDate(day)} className={`border rounded-lg h-20 p-2 text-left cursor-pointer ${isSelected ? 'bg-teal-600 text-white' : isBlocked ? 'bg-stone-200 text-stone-500' : 'bg-white hover:bg-teal-50'}`}>
                                    <span className={`font-semibold ${isToday(day) && !isSelected ? 'text-teal-600' : ''}`}>{day.getDate()}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Time Slot View for Selected Day */}
                <div>
                    <h4 className="text-xl font-bold text-stone-700 mb-3">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
                    
                    <div className="flex flex-col gap-2 mb-4">
                        <button onClick={() => toggleBlockDay(selectedDate)} className={`w-full py-2 px-4 rounded-lg transition-colors font-semibold ${isDayBlocked ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {isDayBlocked ? 'Desbloquear dia inteiro' : 'Bloquear dia inteiro'}
                        </button>
                        
                        <button 
                            onClick={() => setIsTimeModalOpen(true)}
                            disabled={isDayBlocked}
                            className="w-full py-2 px-4 rounded-lg transition-colors bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            <CogIcon /> Gerenciar Horários Específicos
                        </button>
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                         {isDayBlocked ? (
                            <p className="text-center text-stone-500 p-4 bg-stone-50 rounded-lg">Este dia está totalmente bloqueado.</p>
                        ) : timeSlots.map(time => {
                            const appointment = getAppointmentForSlot(time);
                            const isBlocked = localSettings.blockedTimeSlots?.[selectedDate.toISOString().split('T')[0]]?.includes(time);

                            if (appointment) {
                                return <div key={time} className="p-2 rounded bg-teal-50 text-teal-700 border border-teal-100 text-sm"><strong>{time}</strong> - Agendado com {appointment.client_name}</div>
                            }

                            if (isBlocked) {
                                return <div key={time} className="p-2 rounded bg-stone-100 text-stone-500 border border-stone-200 text-sm flex items-center"><BlockedIcon /><span className="line-through">{time} - Bloqueado</span></div>
                            }

                            return (
                                <div key={time} className="p-2 rounded bg-white border border-stone-100 text-stone-600 text-sm">
                                    {time} - Disponível
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            <button onClick={handleSaveChanges} className="mt-8 bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors shadow-md">Salvar Alterações</button>
            
            {isTimeModalOpen && (
                <TimeSlotBlockingModal
                    date={selectedDate}
                    settings={localSettings}
                    appointments={appointmentsForSelectedDay}
                    onClose={() => setIsTimeModalOpen(false)}
                    onSave={handleTimeModalSave}
                />
            )}
        </div>
    );
};

const ProfileSettings: React.FC<{
    user: ProfessionalUser;
    onProfileUpdate: (updatedFields: Partial<ProfessionalUser>) => void;
}> = ({ user, onProfileUpdate }) => {
    const [uploading, setUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(user.imageUrl);
    const [profileData, setProfileData] = useState({
        name: user.name,
        specialties: user.specialties || [],
        whatsapp: user.whatsapp || '',
        bio: user.bio || '',
    });
    const [newSpecialtyName, setNewSpecialtyName] = useState('');
    const [newSpecialtyPrice, setNewSpecialtyPrice] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    // Generated public link
    const publicLink = `${window.location.origin}/?ref=${user.id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(publicLink).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const handleShareWhatsapp = () => {
        const text = `Olá! Agende seu horário comigo através deste link: ${publicLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSpecialty = () => {
        if (newSpecialtyName.trim() && newSpecialtyPrice) {
            setProfileData(prev => ({
                ...prev,
                specialties: [...prev.specialties, { name: newSpecialtyName.trim(), price: Number(newSpecialtyPrice) }]
            }));
            setNewSpecialtyName('');
            setNewSpecialtyPrice('');
        } else {
             alert('Por favor, preencha o nome e o preço da especialidade.');
        }
    };
    
    const removeSpecialty = (indexToRemove: number) => {
        setProfileData(prev => ({
            ...prev,
            specialties: prev.specialties.filter((_, index) => index !== indexToRemove)
        }));
    };


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert("O arquivo é muito grande. O limite é 2MB.");
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert("Por favor, selecione um arquivo de imagem.");
                return;
            }
            
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!avatarFile) return;

        setUploading(true);
        try {
            const fileExt = avatarFile.name.split('.').pop();
            const filePath = `${user.id}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);
            
            if (!urlData.publicUrl) throw new Error("URL pública não encontrada.");
            
            const newImageUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ image_url: newImageUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;
            
            onProfileUpdate({ imageUrl: newImageUrl });
            alert("Foto de perfil atualizada!");
        } catch (error: any) {
            console.error("Erro ao atualizar a foto:", error);
            alert(`Erro: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };
    
    const handleProfileDetailsSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (profileData.specialties.length === 0) {
            alert('Por favor, adicione ao menos uma especialidade.');
            return;
        }

        setIsSaving(true);
        
        // First, handle photo upload if a new one is selected
        if (avatarFile) {
            await handleUpload();
        }

        // Then, update the rest of the profile data
        const { error } = await supabase
            .from('profiles')
            .update({
                name: profileData.name,
                specialty: profileData.specialties,
                whatsapp: profileData.whatsapp,
                bio: profileData.bio,
            })
            .eq('id', user.id);

        if (error) {
            alert('Erro ao salvar as alterações do perfil.');
            console.error(error);
        } else {
            alert('Perfil atualizado com sucesso!');
            onProfileUpdate(profileData);
        }
        setIsSaving(false);
    };

    const hasValidImage = previewUrl && (previewUrl.startsWith('http') || previewUrl.startsWith('blob'));

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            {/* Share Section */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-4">
                    <ShareIcon />
                    <h3 className="text-xl font-bold text-teal-800">Compartilhar meu Perfil</h3>
                </div>
                <p className="text-teal-700 mb-4 text-sm">
                    Envie este link para seus clientes para que eles possam agendar diretamente com você.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-grow relative">
                        <input 
                            type="text" 
                            readOnly 
                            value={publicLink} 
                            className="w-full pl-4 pr-4 py-2 border border-teal-300 rounded-lg bg-white text-stone-600 focus:outline-none" 
                        />
                    </div>
                    <button 
                        onClick={handleCopyLink}
                        className="flex items-center justify-center bg-white border border-teal-300 text-teal-600 font-semibold px-4 py-2 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                        <span className="mr-2"><CopyIcon /></span>
                        {copySuccess ? 'Copiado!' : 'Copiar'}
                    </button>
                    <button 
                        onClick={handleShareWhatsapp}
                        className="flex items-center justify-center bg-green-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                        WhatsApp
                    </button>
                </div>
            </div>

            <h3 className="text-2xl font-bold text-stone-800 mb-6">Configurações do Perfil</h3>
            <form onSubmit={handleProfileDetailsSave}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Avatar Section */}
                    <div className="md:col-span-1 flex flex-col items-center text-center">
                        {hasValidImage ? (
                            <img src={previewUrl} alt="Pré-visualização do perfil" className="w-40 h-40 rounded-full object-cover border-4 border-stone-200 mb-4" />
                        ) : (
                             <div className={`w-40 h-40 rounded-full flex items-center justify-center text-white font-bold ${getColor(user.name)} border-4 border-stone-200 mb-4`}>
                                <span className="text-5xl">{getInitials(user.name)}</span>
                            </div>
                        )}
                        <label className="cursor-pointer bg-stone-100 text-stone-700 font-semibold py-2 px-4 rounded-lg hover:bg-stone-200 transition-colors w-full">
                            <span>Escolher arquivo...</span>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                        <p className="text-xs text-stone-500 mt-2">Max 2MB. JPG, PNG.</p>
                        {avatarFile && <p className="text-xs text-stone-600 mt-1 font-semibold truncate w-full px-2">Arquivo: {avatarFile.name}</p>}
                    </div>

                    {/* Profile Details Form Section */}
                    <div className="md:col-span-2">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-stone-600 mb-1">Nome Completo</label>
                                <input id="name" name="name" type="text" value={profileData.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300" />
                            </div>
                            
                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-stone-600 mb-1">Biografia / Apresentação</label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={profileData.bio}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                                    rows={3}
                                    placeholder="Fale um pouco sobre sua experiência e especialidades..."
                                />
                                <p className="text-xs text-stone-500 mt-1">Essa descrição aparecerá para os pacientes no momento do agendamento.</p>
                            </div>

                           <div>
                                <label className="block text-sm font-medium text-stone-600 mb-1">Especialidades</label>
                                <div className="border rounded-lg p-2 space-y-2">
                                    {profileData.specialties.map((spec, index) => (
                                        <div key={index} className="flex items-center justify-between bg-stone-100 p-2 rounded-lg text-sm">
                                            <span>{spec.name} - R$ {spec.price.toFixed(2)}</span>
                                            <button type="button" onClick={() => removeSpecialty(index)} className="ml-2 text-red-500 hover:text-red-700 font-bold">&times;</button>
                                        </div>
                                    ))}
                                    <div className="flex items-end gap-2 border-t pt-2">
                                        <div className="flex-grow">
                                            <input 
                                                type="text" 
                                                value={newSpecialtyName} 
                                                onChange={e => setNewSpecialtyName(e.target.value)}
                                                className="w-full px-2 py-1 border rounded-lg text-sm"
                                                placeholder="Nome da Especialidade"
                                            />
                                        </div>
                                        <div className="w-24">
                                            <input 
                                                type="number" 
                                                value={newSpecialtyPrice} 
                                                onChange={e => setNewSpecialtyPrice(e.target.value)}
                                                className="w-full px-2 py-1 border rounded-lg text-sm"
                                                placeholder="Preço"
                                                step="0.01"
                                            />
                                        </div>
                                        <button type="button" onClick={handleAddSpecialty} className="h-9 bg-stone-700 text-white font-semibold px-3 rounded-lg hover:bg-stone-800 text-sm">Add</button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="whatsapp" className="block text-sm font-medium text-stone-600 mb-1">WhatsApp</label>
                                <input id="whatsapp" name="whatsapp" type="tel" value={profileData.whatsapp} onChange={handleInputChange} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300" placeholder="(XX) XXXXX-XXXX" />
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="mt-8 pt-6 border-t flex justify-end">
                     <button 
                        type="submit"
                        disabled={isSaving || uploading}
                        className="bg-teal-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSaving || uploading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
};


const AppointmentHistory: React.FC<{
    appointments: Appointment[];
    onUpdate: (updatedAppointment: Appointment) => void;
}> = ({ appointments, onUpdate }) => {
    const [filter, setFilter] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    const handleUpdateStatus = async (appointmentId: string, status: 'completed' | 'cancelled') => {
        if (status === 'cancelled' && !window.confirm('Tem certeza que deseja cancelar este agendamento?')) return;
        
        setLoadingAction(appointmentId);
        const { data, error } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', appointmentId)
            .select()
            .single();

        if (error) {
            alert(`Erro ao ${status === 'completed' ? 'finalizar' : 'cancelar'} o agendamento.`);
            console.error(error);
        } else if (data) {
            onUpdate(data);
        }
        setLoadingAction(null);
    };

    const filteredAppointments = useMemo(() => {
        return appointments
            .filter(appt => appt.status === filter)
            .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
    }, [appointments, filter]);

    const HistoryCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => (
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 flex flex-col sm:flex-row items-start gap-4 transition-all hover:shadow-md">
            <div className="flex-grow">
                <h4 className="font-bold text-stone-800">{appointment.service_name}</h4>
                <p className="text-sm text-stone-600">Cidadão: {appointment.client_name}</p>
                <p className="text-sm text-stone-500 mt-1 flex items-center">
                    <span className="mr-1">📅</span>
                    {new Date(appointment.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} às {appointment.time}
                </p>
                {appointment.notes && <p className="text-xs text-stone-500 mt-2 italic border-l-2 border-stone-300 pl-2">Nota: {appointment.notes}</p>}
            </div>
            <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                 <p className="font-bold text-lg text-teal-600">{appointment.price === 0 ? 'Gratuito' : `R$ ${appointment.price.toFixed(2)}`}</p>
                 
                {appointment.status === 'upcoming' && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                            disabled={loadingAction === appointment.id}
                            className="text-xs font-semibold py-1 px-3 rounded-md bg-stone-200 text-stone-700 hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                            disabled={loadingAction === appointment.id}
                            className="text-xs font-semibold py-1 px-3 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors disabled:opacity-50 shadow-sm"
                        >
                            Finalizar
                        </button>
                    </div>
                )}
                 {appointment.status !== 'upcoming' && (
                     <span className={`text-xs font-semibold px-2 py-1 rounded-full ${appointment.status === 'completed' ? 'bg-teal-100 text-teal-800' : 'bg-red-100 text-red-800'}`}>
                         {appointment.status === 'completed' ? 'Concluído' : 'Cancelado'}
                     </span>
                 )}
            </div>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-stone-100">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                 <h3 className="text-2xl font-bold text-stone-800 mb-4 md:mb-0">Histórico de Atendimentos</h3>
                 <div className="flex bg-stone-100 p-1 rounded-lg">
                    {(['upcoming', 'completed', 'cancelled'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                                filter === status 
                                    ? 'bg-white text-teal-700 shadow-sm' 
                                    : 'text-stone-500 hover:text-stone-700'
                            }`}
                        >
                            {status === 'upcoming' ? 'Agendados' : status === 'completed' ? 'Realizados' : 'Cancelados'}
                        </button>
                    ))}
                </div>
            </div>

            {filteredAppointments.length > 0 ? (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredAppointments.map(appt => <HistoryCard key={appt.id} appointment={appt} />)}
                </div>
            ) : (
                <div className="text-center py-12 bg-stone-50 rounded-lg border border-dashed border-stone-300">
                    <p className="text-stone-500 font-medium">Nenhum atendimento encontrado nesta categoria.</p>
                </div>
            )}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f5f5f4;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #d6d3d1;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
};

const ProfessionalReports: React.FC<{
    appointments: Appointment[];
}> = ({ appointments }) => {
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(1); // 1st of current month
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    const filteredAppointments = useMemo(() => {
        return appointments.filter(a => a.date >= startDate && a.date <= endDate);
    }, [appointments, startDate, endDate]);

    const metrics = useMemo(() => {
        const total = filteredAppointments.length;
        const completed = filteredAppointments.filter(a => a.status === 'completed').length;
        const cancelled = filteredAppointments.filter(a => a.status === 'cancelled').length;
        const revenue = filteredAppointments.reduce((acc, curr) => acc + (curr.status !== 'cancelled' ? curr.price : 0), 0);
        return { total, completed, cancelled, revenue };
    }, [filteredAppointments]);

    const exportCSV = () => {
        const headers = ["Data", "Hora", "Paciente", "Serviço", "Status", "Valor", "Observações"];
        const rows = filteredAppointments.map(a => [
            a.date,
            a.time,
            `"${a.client_name}"`,
            `"${a.service_name}"`,
            a.status,
            a.price,
            `"${a.notes || ''}"`
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `relatorio_atendimentos_${startDate}_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="text-2xl font-bold text-stone-800 flex items-center">
                        <ChartBarIcon /> <span className="ml-2">Relatórios de Desempenho</span>
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-lg border border-stone-200">
                            <span className="text-sm font-semibold text-stone-500">Período:</span>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-white border rounded px-2 py-1 text-sm" />
                            <span className="text-stone-400">-</span>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-white border rounded px-2 py-1 text-sm" />
                        </div>
                        <button onClick={exportCSV} className="flex items-center bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors shadow-sm text-sm whitespace-nowrap">
                            <DownloadIcon /> Exportar CSV
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="text-blue-600 font-bold text-sm uppercase">Total Agendamentos</p>
                        <p className="text-3xl font-extrabold text-blue-800">{metrics.total}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <p className="text-green-600 font-bold text-sm uppercase">Atendimentos Realizados</p>
                        <p className="text-3xl font-extrabold text-green-800">{metrics.completed}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <p className="text-red-600 font-bold text-sm uppercase">Cancelamentos</p>
                        <p className="text-3xl font-extrabold text-red-800">{metrics.cancelled}</p>
                    </div>
                    <div className="bg-stone-100 p-4 rounded-lg border border-stone-200">
                        <p className="text-stone-600 font-bold text-sm uppercase">Produção Estimada</p>
                        <p className="text-3xl font-extrabold text-stone-800">R$ {metrics.revenue.toFixed(2)}</p>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-stone-200">
                        <thead className="bg-stone-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase">Data</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase">Paciente</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase">Serviço</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-stone-200">
                            {filteredAppointments.length > 0 ? filteredAppointments.map(appt => (
                                <tr key={appt.id} className="hover:bg-stone-50">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-stone-900">{new Date(appt.date).toLocaleDateString()} <span className="text-stone-400 text-xs">{appt.time}</span></td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-stone-700 font-medium">{appt.client_name}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-stone-600">{appt.service_name}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            appt.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                            appt.status === 'cancelled' ? 'bg-stone-100 text-stone-800' : 
                                            'bg-blue-100 text-blue-800'}`}>
                                            {appt.status === 'upcoming' ? 'Agendado' : appt.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-stone-600">R$ {appt.price.toFixed(2)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-stone-500">Nenhum registro encontrado para este período.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


type Tab = 'agenda' | 'history' | 'services' | 'availability' | 'settings' | 'reports';

export const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({ user, onProfileUpdate }) => {
    const [activeTab, setActiveTab] = useState<Tab>('agenda');
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [localUser, setLocalUser] = useState(user);
    const [isQuickBookModalOpen, setIsQuickBookModalOpen] = useState(false);

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('professional_id', user.id);
        
        if (error) {
            console.error("Error fetching appointments:", error);
        } else {
            setAppointments(data || []);
        }
        setLoading(false);
    }, [user.id]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const appointmentsByDate = useMemo(() => {
        const map = new Map<string, Appointment[]>();
        appointments.forEach(appt => {
            const dateKey = appt.date;
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(appt);
        });
        return map;
    }, [appointments]);

    const handleDateSelect = useCallback((date: Date) => {
        setSelectedDate(date);
    }, []);
    
    const handleAppointmentCreated = useCallback(() => {
        fetchAppointments();
    }, [fetchAppointments]);
    
    const handleAppointmentUpdate = useCallback((updatedAppointment: Appointment) => {
        setAppointments(prev => prev.map(appt => appt.id === updatedAppointment.id ? updatedAppointment : appt));
    }, []);

    const appointmentsForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        const dateStr = selectedDate.toISOString().split('T')[0];
        return appointmentsByDate.get(dateStr) || [];
    }, [selectedDate, appointmentsByDate]);
    
    const handleServicesUpdate = (updatedServices: Service[]) => {
        const updatedFields = { services: updatedServices };
        setLocalUser(prevUser => ({ ...prevUser, ...updatedFields }));
        onProfileUpdate(updatedFields);
    };

    const handleSettingsUpdate = (updatedSettings: ProfessionalUser['settings']) => {
        const updatedFields = { settings: updatedSettings };
        setLocalUser(prevUser => ({ ...prevUser, ...updatedFields }));
        onProfileUpdate(updatedFields);
    };

    const handleLocalProfileUpdate = (updatedFields: Partial<ProfessionalUser>) => {
        setLocalUser(prev => ({ ...prev, ...updatedFields }));
        onProfileUpdate(updatedFields);
    };

    const TabButton: React.FC<{ tabName: Tab; label: string; icon: React.ReactNode; }> = ({ tabName, label, icon }) => (
         <button onClick={() => setActiveTab(tabName)} className={`flex items-center px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${activeTab === tabName ? 'bg-white text-teal-600 border-b-0' : 'bg-transparent text-stone-600 hover:bg-white/50'}`}>
            {icon}
            {label}
        </button>
    );

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-stone-800">Painel do Profissional</h1>
                <p className="text-stone-500 mt-2 text-lg">Bem-vindo(a), {user.name.split(' ')[0]}! Gerencie sua agenda aqui.</p>
            </div>
            
            <div className="border-b border-stone-200 flex items-center mb-6 flex-wrap">
                <TabButton tabName="agenda" label="Agenda" icon={<CalendarIcon />} />
                <TabButton tabName="history" label="Histórico" icon={<ArchiveIcon />} />
                <TabButton tabName="reports" label="Relatórios" icon={<ChartBarIcon />} />
                <TabButton tabName="services" label="Meus Serviços" icon={<ClipboardListIcon />} />
                <TabButton tabName="availability" label="Disponibilidade" icon={<CogIcon />} />
                <TabButton tabName="settings" label="Configurações" icon={<UserIcon />} />
            </div>

            <div id="tab-content">
                {loading && <p>Carregando...</p>}
                {!loading && activeTab === 'agenda' && (
                    <>
                         <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 mb-6 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-stone-700">Gestão da Agenda</h3>
                                <p className="text-xs text-stone-500">Ações rápidas para o dia a dia.</p>
                            </div>
                            <button 
                                onClick={() => setIsQuickBookModalOpen(true)}
                                className="flex items-center bg-teal-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-700 transition-transform duration-300 hover:scale-105 shadow-md"
                            >
                                <PlusCircleIcon />
                                Agendamento Rápido
                            </button>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-6">
                           <div className="flex-grow">
                                <ProfessionalCalendar 
                                    appointmentsByDate={appointmentsByDate}
                                    onDateSelect={handleDateSelect}
                                    settings={localUser.settings}
                                />
                           </div>
                            {selectedDate && (
                                <DayDetailPanel 
                                    selectedDate={selectedDate}
                                    appointments={appointmentsForSelectedDate}
                                    settings={localUser.settings}
                                    onClose={() => setSelectedDate(null)}
                                    onAppointmentUpdate={handleAppointmentUpdate}
                                />
                            )}
                        </div>
                    </>
                )}
                {activeTab === 'history' && <AppointmentHistory appointments={appointments} onUpdate={handleAppointmentUpdate} />}
                {activeTab === 'reports' && <ProfessionalReports appointments={appointments} />}
                {activeTab === 'services' && <ServiceEditor services={localUser.services} userId={user.id} onServicesUpdate={handleServicesUpdate} />}
                {activeTab === 'availability' && <AvailabilityManager user={localUser} appointmentsByDate={appointmentsByDate} onSettingsUpdate={handleSettingsUpdate} />}
                {activeTab === 'settings' && <ProfileSettings user={localUser} onProfileUpdate={handleLocalProfileUpdate} />}
            </div>
             {isQuickBookModalOpen && (
                <QuickBookModal
                    user={localUser}
                    appointmentsForToday={appointmentsByDate.get(new Date().toISOString().split('T')[0]) || []}
                    onClose={() => setIsQuickBookModalOpen(false)}
                    onBookingSuccess={() => {
                        setIsQuickBookModalOpen(false);
                        handleAppointmentCreated();
                    }}
                />
            )}
            <style>{`
                @keyframes fade-in-right {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-fade-in-right {
                    animation: fade-in-right 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
