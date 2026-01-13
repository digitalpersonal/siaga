
import React, { useState, useMemo } from 'react';
import type { Appointment } from '../types';
import { supabase } from '../utils/supabase';

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const AppointmentHistory: React.FC<{
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

    // Calculate counts for tabs
    const counts = useMemo(() => ({
        upcoming: appointments.filter(a => a.status === 'upcoming').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
    }), [appointments]);

    // Filter Logic
    const filteredAppointments = useMemo(() => {
        return appointments
            .filter(appt => appt.status === filter)
            .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
    }, [appointments, filter]);

    const HistoryCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => (
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 flex flex-col sm:flex-row items-start gap-4 transition-all hover:shadow-md animate-fade-in">
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

    const tabs = [
        { id: 'upcoming', label: 'Agendados', count: counts.upcoming },
        { id: 'completed', label: 'Realizados', count: counts.completed },
        { id: 'cancelled', label: 'Cancelados', count: counts.cancelled },
    ] as const;

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-stone-100">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                 <h3 className="text-2xl font-bold text-stone-800 mb-4 md:mb-0">Histórico de Atendimentos</h3>
                 <div className="flex bg-stone-100 p-1 rounded-lg overflow-x-auto max-w-full">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 whitespace-nowrap ${
                                filter === tab.id 
                                    ? 'bg-white text-teal-700 shadow-sm' 
                                    : 'text-stone-500 hover:text-stone-700'
                            }`}
                        >
                            {tab.label}
                            <span className={`ml-2 text-xs py-0.5 px-1.5 rounded-full ${filter === tab.id ? 'bg-teal-100 text-teal-800' : 'bg-stone-200 text-stone-600'}`}>
                                {tab.count}
                            </span>
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
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
