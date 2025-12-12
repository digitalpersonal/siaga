
import React, { useState, useEffect } from 'react';
import type { DriverUser, Appointment } from '../types';
import { supabase } from '../utils/supabase';

const BusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const SmallXIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 00-2-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const GridIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const WhatsappIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>;

export const DriverDashboard: React.FC<{ user: DriverUser }> = ({ user }) => {
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

    const fetchTransportData = async () => {
        setLoading(true);
        // 1. Fetch Appointments
        const { data: apptData, error: apptError } = await supabase
            .from('appointments')
            .select('*')
            .eq('date', selectedDate)
            .eq('locationType', 'external')
            .neq('status', 'cancelled')
            .order('time', { ascending: true });
        
        if (apptError) {
            console.error("Error fetching transport data:", apptError);
            setLoading(false);
            return;
        }

        const appointmentsList = apptData || [];

        // 2. Fetch Profiles to get Addresses (using client_id from appointments)
        if (appointmentsList.length > 0) {
            const clientIds = appointmentsList.map(a => a.client_id).filter(Boolean);
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, address, whatsapp')
                .in('id', clientIds);

            if (!profilesError && profilesData) {
                // Map profiles for O(1) access
                const profileMap = profilesData.reduce((acc, profile) => {
                    acc[profile.id] = profile;
                    return acc;
                }, {} as Record<string, any>);

                // 3. Merge Data
                const mergedAppointments = appointmentsList.map(appt => ({
                    ...appt,
                    client_address: profileMap[appt.client_id]?.address || 'Endereço não cadastrado',
                    client_whatsapp: profileMap[appt.client_id]?.whatsapp || ''
                }));
                
                setAppointments(mergedAppointments);
            } else {
                // If profile fetch fails, show appts anyway
                setAppointments(appointmentsList);
            }
        } else {
            setAppointments([]);
        }
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

    const handleOpenMap = (address: string) => {
        if (!address) return;
        const encodedAddress = encodeURIComponent(address + ', Guaranésia - MG'); // Adding city context
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    };

    const handleOpenWhatsapp = (phone: string) => {
        if (!phone) return;
        const cleanPhone = phone.replace(/\D/g, '');
        window.open(`https://wa.me/55${cleanPhone}`, '_blank');
    }

    const passengersCount = appointments.reduce((acc, curr) => acc + 1 + (curr.hasCompanion ? 1 : 0), 0);

    return (
        <div className="container mx-auto px-4 py-6 bg-stone-100 min-h-screen">
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-stone-800 flex items-center">
                            <BusIcon /> Painel do Motorista
                        </h1>
                        <p className="text-stone-500 text-sm mt-1">Olá, {user.name.split(' ')[0]}. Bom trabalho!</p>
                    </div>
                    <div className="flex bg-white rounded-lg shadow-sm border border-stone-200 p-1">
                        <button 
                            onClick={() => setViewMode('cards')} 
                            className={`p-2 rounded-md transition-all ${viewMode === 'cards' ? 'bg-teal-100 text-teal-700' : 'text-stone-400 hover:text-stone-600'}`}
                            title="Modo Cartões (Chamada)"
                        >
                            <GridIcon />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')} 
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-teal-100 text-teal-700' : 'text-stone-400 hover:text-stone-600'}`}
                            title="Modo Lista (Endereços)"
                        >
                            <ListIcon />
                        </button>
                    </div>
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
                <>
                    {appointments.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-xl shadow-sm">
                            <p className="text-stone-500">Nenhuma viagem agendada para hoje.</p>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'cards' && (
                                <div className="space-y-3">
                                    {appointments.map(appt => (
                                        <div key={appt.id} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${appt.transportStatus === 'present' ? 'border-green-500' : appt.transportStatus === 'absent' ? 'border-red-500' : 'border-stone-300'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-lg text-stone-800">{appt.client_name}</h3>
                                                    {appt.client_address && (
                                                        <p 
                                                            onClick={() => handleOpenMap(appt.client_address!)}
                                                            className="text-xs text-stone-600 mt-1 flex items-start cursor-pointer hover:underline"
                                                        >
                                                            <MapPinIcon />
                                                            {appt.client_address}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="text-xl font-mono font-bold text-stone-700">{appt.time}</span>
                                            </div>
                                            <p className="text-sm text-stone-500 mb-2">{appt.service_name}</p>
                                            
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
                                    ))}
                                </div>
                            )}

                            {viewMode === 'list' && (
                                <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                                    <table className="min-w-full divide-y divide-stone-200">
                                        <thead className="bg-stone-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Passageiro</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Endereço / Contato</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-stone-200">
                                            {appointments.map(appt => (
                                                <tr key={appt.id} className={appt.transportStatus === 'absent' ? 'bg-red-50' : appt.transportStatus === 'present' ? 'bg-green-50' : ''}>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm font-bold text-stone-800">{appt.client_name}</div>
                                                        <div className="text-xs text-stone-500 mt-1">{appt.time} - {appt.hasCompanion ? 'Com Acomp.' : 'Sozinho'}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {appt.client_address ? (
                                                            <div 
                                                                className="text-sm text-stone-700 cursor-pointer hover:text-teal-600 hover:underline flex items-start mb-1"
                                                                onClick={() => handleOpenMap(appt.client_address!)}
                                                            >
                                                                <span className="mr-1 mt-0.5"><MapPinIcon /></span>
                                                                {appt.client_address}
                                                            </div>
                                                        ) : <span className="text-xs text-stone-400">Endereço não disponível</span>}
                                                        
                                                        {appt.client_whatsapp && (
                                                            <button 
                                                                onClick={() => handleOpenWhatsapp(appt.client_whatsapp!)}
                                                                className="text-xs flex items-center text-green-600 hover:text-green-800 font-medium"
                                                            >
                                                                <WhatsappIcon /> {appt.client_whatsapp}
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            appt.transportStatus === 'present' ? 'bg-green-100 text-green-800' : 
                                                            appt.transportStatus === 'absent' ? 'bg-red-100 text-red-800' : 
                                                            'bg-stone-100 text-stone-800'}`}>
                                                            {appt.transportStatus === 'present' ? 'Embarcou' : appt.transportStatus === 'absent' ? 'Faltou' : 'Pendente'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};
