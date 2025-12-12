
import React, { useState, useEffect } from 'react';
import type { DriverUser, Appointment } from '../types';
import { supabase } from '../utils/supabase';

const BusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const SmallXIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;

export const DriverDashboard: React.FC<{ user: DriverUser }> = ({ user }) => {
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransportData = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('date', selectedDate)
            .eq('locationType', 'external')
            .neq('status', 'cancelled')
            .order('time', { ascending: true });
        
        if (error) console.error("Error fetching transport data:", error);
        else setAppointments(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchTransportData();
    }, [selectedDate]);

    const handleTransportStatusUpdate = async (id: string, status: 'pending' | 'present' | 'absent') => {
        // Optimistic update
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, transportStatus: status } : a));

        const { error } = await supabase
            .from('appointments')
            .update({ transportStatus: status })
            .eq('id', id);
        
        if (error) {
            alert('Erro ao atualizar status.');
            fetchTransportData(); // Revert on error
        }
    };

    const passengersCount = appointments.reduce((acc, curr) => acc + 1 + (curr.hasCompanion ? 1 : 0), 0);

    return (
        <div className="container mx-auto px-4 py-6 bg-stone-100 min-h-screen">
            <div className="flex flex-col gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-stone-800 flex items-center">
                        <BusIcon /> Painel do Motorista
                    </h1>
                    <p className="text-stone-500 text-sm mt-1">Olá, {user.name.split(' ')[0]}. Bom trabalho!</p>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200">
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Data da Viagem</label>
                    <div className="flex gap-2">
                        <input 
                            type="date" 
                            value={selectedDate} 
                            onChange={e => setSelectedDate(e.target.value)} 
                            className="flex-grow p-3 border border-stone-300 rounded-lg text-lg font-semibold text-stone-800"
                        />
                        <button onClick={fetchTransportData} className="bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700">
                            <RefreshIcon />
                        </button>
                    </div>
                </div>

                <div className="bg-amber-100 p-4 rounded-xl border border-amber-200 flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-amber-800 uppercase">Total Passageiros</p>
                        <p className="text-xs text-amber-700">Incluindo acompanhantes</p>
                    </div>
                    <span className="text-4xl font-black text-amber-800">{passengersCount}</span>
                </div>
            </div>

            {loading ? <p className="text-center py-8">Carregando lista...</p> : (
                <div className="space-y-3">
                    {appointments.length > 0 ? appointments.map(appt => (
                        <div key={appt.id} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${appt.transportStatus === 'present' ? 'border-green-500' : appt.transportStatus === 'absent' ? 'border-red-500' : 'border-stone-300'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg text-stone-800">{appt.client_name}</h3>
                                    <p className="text-sm text-stone-500">{appt.service_name}</p>
                                </div>
                                <span className="text-xl font-mono font-bold text-stone-700">{appt.time}</span>
                            </div>
                            
                            {appt.hasCompanion && (
                                <div className="bg-amber-50 text-amber-800 px-3 py-1 rounded-md text-sm font-semibold inline-block mb-3 border border-amber-100">
                                    +1 Acompanhante
                                </div>
                            )}

                            <div className="flex gap-2 mt-2">
                                <button 
                                    onClick={() => handleTransportStatusUpdate(appt.id, 'present')}
                                    className={`flex-1 py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition-colors ${appt.transportStatus === 'present' ? 'bg-green-600 text-white' : 'bg-stone-100 text-stone-500 hover:bg-green-100 hover:text-green-700'}`}
                                >
                                    <CheckIcon /> Embarcou
                                </button>
                                <button 
                                    onClick={() => handleTransportStatusUpdate(appt.id, 'absent')}
                                    className={`flex-1 py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition-colors ${appt.transportStatus === 'absent' ? 'bg-red-600 text-white' : 'bg-stone-100 text-stone-500 hover:bg-red-100 hover:text-red-700'}`}
                                >
                                    <SmallXIcon /> Faltou
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 bg-white rounded-xl shadow-sm">
                            <p className="text-stone-500">Nenhuma viagem agendada para hoje.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
