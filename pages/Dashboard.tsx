import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { User, Appointment } from '../types';
import { supabase } from '../utils/supabase';
import { AppointmentCard } from '../components/AppointmentCard';
import { BookingModal } from '../components/BookingModal';

interface DashboardProps {
    user: User;
}

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const ClockIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('client_id', user.id)
            .order('date', { ascending: false })
            .order('time', { ascending: false });

        if (error) {
            console.error("Error fetching appointments:", error);
            setError("Não foi possível carregar seus agendamentos.");
        } else {
            setAppointments(data || []);
        }
        setLoading(false);
    }, [user.id]);

    useEffect(() => {
        if (user) {
            fetchAppointments();
        }
    }, [user, fetchAppointments]);

    const handleAppointmentUpdate = useCallback((updatedAppointment: Appointment) => {
        setAppointments(currentAppointments => 
            currentAppointments.map(appt => 
                appt.id === updatedAppointment.id ? updatedAppointment : appt
            )
        );
    }, []);

    const filteredAppointments = useMemo(() => {
        if (!startDate && !endDate) {
            return appointments;
        }
        return appointments.filter(appt => {
            const apptDate = appt.date;
            const start = startDate || '0000-01-01';
            const end = endDate || '9999-12-31';
            return apptDate >= start && apptDate <= end;
        });
    }, [appointments, startDate, endDate]);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingAppointments = filteredAppointments.filter(a => new Date(a.date + 'T00:00:00') >= today && a.status === 'upcoming');
    const pastAppointments = filteredAppointments.filter(a => new Date(a.date + 'T00:00:00') < today || a.status === 'completed' || a.status === 'cancelled');

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
    };
    
    const handleBookingClose = () => {
        setIsBookingModalOpen(false);
        // Refresh appointments to show the new one immediately
        fetchAppointments();
    };

    const hasActiveFilter = startDate || endDate;

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-stone-800">Olá, {user.name.split(' ')[0]}!</h1>
                    <p className="text-stone-500 mt-2 text-lg">Bem-vindo(a) de volta! Aqui estão seus agendamentos.</p>
                </div>
                <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors flex items-center shadow-md whitespace-nowrap"
                >
                    <PlusIcon />
                    Novo Agendamento
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md mb-8 flex flex-col sm:flex-row items-center gap-4 flex-wrap">
                <label htmlFor="start-date" className="font-semibold text-stone-700 shrink-0">Filtrar por data:</label>
                <div className="flex-grow flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <input 
                        id="start-date"
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-2 border border-stone-300 rounded-lg w-full"
                        aria-label="Data de início"
                    />
                    <span className="text-stone-500 self-center">até</span>
                     <input 
                        id="end-date"
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-2 border border-stone-300 rounded-lg w-full"
                        aria-label="Data de fim"
                    />
                </div>
                <button 
                    onClick={handleClearFilters}
                    className="w-full sm:w-auto bg-stone-200 text-stone-700 font-semibold py-2 px-4 rounded-lg hover:bg-stone-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!hasActiveFilter}
                >
                    Limpar Filtros
                </button>
            </div>
            
            {loading && <p>Carregando agendamentos...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
                <>
                    {hasActiveFilter && (
                        <div className="mb-6 text-center text-stone-600">
                           <p>Exibindo {filteredAppointments.length} agendamento(s) para o período selecionado.</p>
                        </div>
                    )}
                    <div className="grid lg:grid-cols-1 gap-8">
                        {/* Upcoming Appointments */}
                        <section>
                            <div className="flex items-center mb-4">
                                <CalendarIcon />
                                <h2 className="text-2xl font-bold text-stone-700">Próximos Agendamentos</h2>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                {upcomingAppointments.length > 0 ? (
                                    <div className="space-y-4">
                                        {upcomingAppointments.map(appt => <AppointmentCard key={appt.id} appointment={appt} onUpdate={handleAppointmentUpdate} />)}
                                    </div>
                                ) : (
                                    <p className="text-stone-500 text-center py-4">
                                        {hasActiveFilter ? 'Nenhum agendamento futuro encontrado para este período.' : 'Você não tem nenhum agendamento futuro.'}
                                    </p>
                                )}
                            </div>
                        </section>
                        
                        {/* Past Appointments */}
                        <section>
                            <div className="flex items-center mb-4">
                                <ClockIcon />
                                <h2 className="text-2xl font-bold text-stone-700">Histórico de Serviços</h2>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                {pastAppointments.length > 0 ? (
                                    <div className="space-y-4">
                                        {pastAppointments.map(appt => <AppointmentCard key={appt.id} appointment={appt} onUpdate={handleAppointmentUpdate} />)}
                                    </div>
                                ) : (
                                     <p className="text-stone-500 text-center py-4">
                                        {hasActiveFilter ? 'Nenhum agendamento passado encontrado para este período.' : 'Seu histórico de agendamentos está vazio.'}
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>
                </>
            )}
            
            {isBookingModalOpen && (
                <BookingModal
                    user={user}
                    onClose={handleBookingClose}
                />
            )}
        </div>
    );
};