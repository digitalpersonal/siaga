
import React, { useState, useMemo, useEffect } from 'react';
import type { ProfessionalUser, Appointment } from '../types';
import { supabase } from '../utils/supabase';
import { generateDailyAgenda, generatePrescription } from '../utils/pdfGenerator';

// Icons
const PrinterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;
const ClipboardListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 00-2-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
);
const DocumentTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);
const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const DogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-stone-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 5.2a2 2 0 0 1 2-2.2h.4a2 2 0 0 1 2 2.2v.3a2 2 0 0 1-2 2.2h-.4a2 2 0 0 1-2-2.2v-.3Z"></path><path d="M9.5 14.5A2.5 2.5 0 0 1 7 12V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3a2.5 2.5 0 0 1-2.5 2.5h-3Z"></path><path d="M11 14v3a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-3"></path><path d="M10 14h.01"></path><path d="M14 14h.01"></path><path d="M7 17v-2.3a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2V17"></path><path d="M5 14a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1"></path><path d="M19 14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1"></path></svg>;
const BlockedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
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
            <label className="text-xs font-semibold text-stone-600">Anotações Internas</label>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações sobre o atendimento (visível apenas para profissionais)..."
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

// Internal Modal for Prescription/Certificate
const PrescriptionModal: React.FC<{
    appointment: Appointment;
    professionalName: string;
    onClose: () => void;
}> = ({ appointment, professionalName, onClose }) => {
    const [content, setContent] = useState('');
    const [type, setType] = useState<'Receita Médica' | 'Atestado Médico'>('Receita Médica');

    const handleGenerate = () => {
        if (!content.trim()) {
            alert("O conteúdo não pode estar vazio.");
            return;
        }
        generatePrescription(type, professionalName, appointment.client_name, content);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 text-xl font-bold">&times;</button>
                <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center">
                    <DocumentTextIcon /> Emitir Documento
                </h3>
                
                <div className="mb-4">
                    <div className="flex gap-4 mb-2">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="docType" checked={type === 'Receita Médica'} onChange={() => setType('Receita Médica')} className="mr-2" />
                            Receita
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="docType" checked={type === 'Atestado Médico'} onChange={() => setType('Atestado Médico')} className="mr-2" />
                            Atestado
                        </label>
                    </div>
                    <textarea 
                        className="w-full p-3 border border-stone-300 rounded-lg h-40 focus:ring-2 focus:ring-teal-500 outline-none"
                        placeholder={type === 'Receita Médica' ? "Ex: Amoxicilina 500mg - Tomar de 8 em 8 horas..." : "Atesto para os devidos fins que..."}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                    ></textarea>
                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg">Cancelar</button>
                    <button onClick={handleGenerate} className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-teal-700">Imprimir PDF</button>
                </div>
            </div>
        </div>
    );
};

const PatientHistoryModal: React.FC<{
    clientName: string;
    clientId: string;
    onClose: () => void;
}> = ({ clientName, clientId, onClose }) => {
    const [history, setHistory] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const { data } = await supabase
                .from('appointments')
                .select('*')
                .eq('client_id', clientId)
                .neq('status', 'upcoming') // Only past/completed
                .order('date', { ascending: false });
            setHistory(data || []);
            setLoading(false);
        };
        fetchHistory();
    }, [clientId]);

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative max-h-[80vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 text-xl font-bold">&times;</button>
                <h3 className="text-xl font-bold text-stone-800 mb-1">Prontuário / Histórico</h3>
                <p className="text-sm text-stone-500 mb-4">Paciente: {clientName}</p>
                
                <div className="overflow-y-auto flex-grow pr-2 space-y-3">
                    {loading ? <p>Carregando...</p> : history.length === 0 ? <p className="text-stone-500 italic">Nenhum histórico encontrado.</p> : (
                        history.map(appt => (
                            <div key={appt.id} className="border border-stone-200 rounded-lg p-3 bg-stone-50">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-stone-700">{appt.service_name}</span>
                                    <span className="text-xs text-stone-500 flex items-center"><ClockIcon /> {new Date(appt.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-stone-600 mb-2">Prof: {appt.professional_name}</p>
                                {appt.notes && (
                                    <div className="bg-white p-2 rounded border border-stone-200 text-sm text-stone-700">
                                        {appt.notes}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export const DayDetailPanel: React.FC<{
    selectedDate: Date;
    appointments: Appointment[];
    settings: ProfessionalUser['settings'];
    professionalName: string;
    onClose: () => void;
    onAppointmentUpdate: (updatedAppointment: Appointment) => void;
}> = ({ selectedDate, appointments, settings, professionalName, onClose, onAppointmentUpdate }) => {
    
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [prescriptionModalAppt, setPrescriptionModalAppt] = useState<Appointment | null>(null);
    const [historyModalClient, setHistoryModalClient] = useState<{name: string, id: string} | null>(null);

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

    const handlePrintAgenda = () => {
        generateDailyAgenda(professionalName, selectedDate, appointments.sort((a,b) => a.time.localeCompare(b.time)));
    };

    const handleOpenWhatsapp = (phone: string) => {
        if (!phone) return;
        const cleanPhone = phone.replace(/\D/g, '');
        window.open(`https://wa.me/55${cleanPhone}`, '_blank');
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
        <div className="bg-white p-6 rounded-xl shadow-lg border w-full lg:w-1/3 animate-fade-in-right flex flex-col h-full max-h-[800px]">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-xl font-bold text-stone-800">
                    {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <button onClick={onClose} aria-label="Fechar painel de detalhes do dia" className="text-stone-500 hover:text-stone-800 p-1 rounded-full hover:bg-stone-100 transition-colors text-2xl font-bold leading-none">&times;</button>
            </div>
            
            <button 
                onClick={handlePrintAgenda}
                className="w-full mb-4 bg-stone-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center hover:bg-stone-800 transition-colors shadow-sm flex-shrink-0"
            >
                <PrinterIcon /> <span className="ml-2">Imprimir Agenda do Dia</span>
            </button>

            <div className="bg-stone-50 p-3 rounded-lg text-center mb-4 flex-shrink-0 border border-stone-200">
                <p className="font-semibold text-stone-700">
                    {appointments.length > 0
                        ? `Você tem ${appointments.length} agendamento(s) para este dia.`
                        : "Nenhum agendamento para este dia."}
                </p>
            </div>
            
            <div className="space-y-4 overflow-y-auto pr-2 flex-grow custom-scrollbar">
                {timeSlots.map(time => {
                    const appointment = getAppointmentForSlot(time);
                    const isBlocked = settings.blockedTimeSlots && settings.blockedTimeSlots[selectedDate.toISOString().split('T')[0]]?.includes(time);
                    
                    if (appointment) {
                        return (
                             <div key={time} className="bg-white border border-stone-200 shadow-sm rounded-lg p-4 transition-all hover:shadow-md">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-2 pb-2 border-b border-stone-100">
                                    <div className="flex items-center">
                                        <span className="bg-teal-100 text-teal-800 text-sm font-bold px-2 py-0.5 rounded mr-2">{time}</span>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${appointment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {appointment.status === 'upcoming' ? 'Agendado' : appointment.status === 'completed' ? 'Concluído' : 'Cancelado'}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => setHistoryModalClient({name: appointment.client_name, id: appointment.client_id})}
                                        className="text-xs text-stone-500 hover:text-teal-600 flex items-center transition-colors"
                                        title="Ver histórico do paciente"
                                    >
                                        <ClipboardListIcon /> Histórico
                                    </button>
                                </div>

                                {/* Body */}
                                <div>
                                    <p className="font-bold text-lg text-stone-800">{appointment.client_name}</p>
                                    <p className="text-sm text-teal-600 font-medium mb-2">{appointment.service_name}</p>
                                    
                                    {/* Patient Contact Details */}
                                    <div className="text-xs text-stone-500 space-y-1 mb-3 bg-stone-50 p-2 rounded">
                                        {appointment.client_whatsapp ? (
                                            <button onClick={() => handleOpenWhatsapp(appointment.client_whatsapp!)} className="flex items-center hover:text-green-600 transition-colors">
                                                <PhoneIcon /> <span className="underline">{appointment.client_whatsapp}</span>
                                            </button>
                                        ) : (
                                            <span className="flex items-center text-stone-400"><PhoneIcon /> Sem contato</span>
                                        )}
                                        {appointment.client_address && (
                                            <div className="flex items-start">
                                                <MapPinIcon />
                                                <span className="truncate max-w-[200px]" title={appointment.client_address}>{appointment.client_address}</span>
                                            </div>
                                        )}
                                        {appointment.pet_name && (
                                            <p className="flex items-center text-teal-600"><DogIcon /> {appointment.pet_name} ({appointment.pet_breed})</p>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <AppointmentNoteEditor appointment={appointment} onUpdate={onAppointmentUpdate} />
                                
                                <div className="mt-3 flex gap-2">
                                    <button 
                                        onClick={() => setPrescriptionModalAppt(appointment)}
                                        className="flex-grow text-xs font-bold py-2 px-2 bg-stone-100 text-stone-700 rounded hover:bg-stone-200 transition-colors flex items-center justify-center border border-stone-200"
                                    >
                                        <DocumentTextIcon /> Receita / Atestado
                                    </button>
                                </div>

                                {appointment.status === 'upcoming' && (
                                    <div className="flex gap-2 mt-3 pt-3 border-t border-stone-100">
                                        <button
                                            onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                                            disabled={loadingAction === appointment.id}
                                            className="text-xs font-bold py-2 px-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 flex-1 border border-red-100"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                                            disabled={loadingAction === appointment.id}
                                            className="text-xs font-bold py-2 px-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 flex-1 shadow-sm"
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
                            <div key={time} className="bg-stone-50 border border-stone-200 p-3 rounded-lg flex items-center opacity-70">
                                <BlockedIcon />
                                <span className="text-stone-400 text-sm line-through ml-2">{time} - Bloqueado</span>
                            </div>
                        )
                    }
                    return (
                        <div key={time} className="flex justify-between items-center bg-white p-3 rounded-lg border border-stone-100 hover:bg-stone-50 transition-colors">
                            <span className="text-stone-400 font-mono text-sm">{time}</span>
                            <span className="text-xs text-stone-300 font-medium">Disponível</span>
                        </div>
                    )
                })}
            </div>

            {prescriptionModalAppt && (
                <PrescriptionModal 
                    appointment={prescriptionModalAppt}
                    professionalName={professionalName}
                    onClose={() => setPrescriptionModalAppt(null)}
                />
            )}

            {historyModalClient && (
                <PatientHistoryModal 
                    clientName={historyModalClient.name}
                    clientId={historyModalClient.id}
                    onClose={() => setHistoryModalClient(null)}
                />
            )}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f5f5f4;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #d6d3d1;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};
