
import React, { useState, useEffect, useMemo } from 'react';
import type { DriverUser, Appointment, Trip } from '../types';
import { supabase } from '../utils/supabase';
import { generateTFDManifest } from '../utils/pdfGenerator';

// Icons otimizados para Mobile
const BusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const WhatsappIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

export const DriverDashboard: React.FC<{ user: DriverUser }> = ({ user }) => {
    const [myTrips, setMyTrips] = useState<Trip[]>([]);
    const [selectedTripId, setSelectedTripId] = useState<string>('');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    // Carregar viagens do motorista (Hoje em diante)
    useEffect(() => {
        const fetchTrips = async () => {
            const today = new Date().toISOString().split('T')[0];
            const { data } = await supabase
                .from('trips')
                .select('*')
                .eq('driver_id', user.id)
                .gte('date', today)
                .order('date', { ascending: true })
                .order('time', { ascending: true });
            
            setMyTrips(data || []);
            if (data && data.length > 0) {
                // Seleciona automaticamente a primeira viagem (a mais próxima)
                setSelectedTripId(data[0].id); 
            }
        };
        fetchTrips();
    }, [user.id]);

    // Carregar passageiros quando a viagem muda
    const fetchTransportData = async () => {
        if (!selectedTripId) {
            setAppointments([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        // Buscar passageiros vinculados à viagem selecionada
        const { data: apptData, error: apptError } = await supabase
            .from('appointments')
            .select('*')
            .eq('trip_id', selectedTripId)
            .neq('status', 'cancelled')
            .order('client_name', { ascending: true });
        
        if (apptError) {
            console.error("Erro ao buscar passageiros:", apptError);
            setLoading(false);
            return;
        }

        const appointmentsList = apptData || [];

        // Buscar endereços e telefones atualizados
        if (appointmentsList.length > 0) {
            const clientIds = appointmentsList.map(a => a.client_id).filter(Boolean);
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, address, whatsapp')
                .in('id', clientIds);

            if (profilesData) {
                const profileMap = profilesData.reduce((acc, profile) => {
                    acc[profile.id] = profile;
                    return acc;
                }, {} as Record<string, any>);

                const mergedAppointments = appointmentsList.map(appt => ({
                    ...appt,
                    client_address: profileMap[appt.client_id]?.address || 'Endereço não cadastrado',
                    client_whatsapp: profileMap[appt.client_id]?.whatsapp || ''
                }));
                setAppointments(mergedAppointments);
            } else {
                setAppointments(appointmentsList);
            }
        } else {
            setAppointments([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTransportData();
    }, [selectedTripId]);

    const handleTransportStatusUpdate = async (id: string, status: 'pending' | 'present' | 'absent') => {
        // Atualização Otimista
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, transportStatus: status } : a));

        const { error } = await supabase
            .from('appointments')
            .update({ transportStatus: status })
            .eq('id', id);
        
        if (error) {
            alert('Erro de conexão. Tente novamente.');
            fetchTransportData(); // Reverte em caso de erro
        }
    };

    const handleOpenMap = (address: string) => {
        if (!address) return;
        const encodedAddress = encodeURIComponent(address + ', Guaranésia - MG');
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    };

    const handleOpenWhatsapp = (phone: string) => {
        if (!phone) return;
        const cleanPhone = phone.replace(/\D/g, '');
        window.open(`https://wa.me/55${cleanPhone}`, '_blank');
    }

    const handleDownloadManifest = () => {
        const trip = myTrips.find(t => t.id === selectedTripId);
        if (trip && appointments.length > 0) {
            generateTFDManifest(trip, appointments);
        }
    };

    const selectedTripDetails = myTrips.find(t => t.id === selectedTripId);
    
    // Cálculos para a barra de progresso
    const totalPassengers = appointments.reduce((acc, curr) => acc + 1 + (curr.hasCompanion ? 1 : 0), 0);
    const presentPassengers = appointments.filter(a => a.transportStatus === 'present').reduce((acc, curr) => acc + 1 + (curr.hasCompanion ? 1 : 0), 0);
    const progressPercent = totalPassengers > 0 ? (presentPassengers / totalPassengers) * 100 : 0;

    return (
        <div className="container mx-auto pb-20 bg-stone-100 min-h-screen">
            {/* Header Fixo Mobile */}
            <div className="bg-white p-4 sticky top-0 z-20 shadow-md">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-xl font-bold text-stone-800 flex items-center">
                        <BusIcon /> Viagens
                    </h1>
                    <span className="text-xs font-semibold bg-stone-100 text-stone-600 px-2 py-1 rounded-full">
                        {user.name.split(' ')[0]}
                    </span>
                </div>

                {/* Seletor de Viagem */}
                <select 
                    value={selectedTripId} 
                    onChange={e => setSelectedTripId(e.target.value)} 
                    className="w-full p-3 border-2 border-teal-500 rounded-xl text-lg font-bold text-stone-800 bg-teal-50 outline-none"
                >
                    {myTrips.length === 0 && <option value="">Sem viagens agendadas</option>}
                    {myTrips.map(trip => (
                        <option key={trip.id} value={trip.id}>
                            {new Date(trip.date).toLocaleDateString()} - {trip.time} ➜ {trip.destination_name}
                        </option>
                    ))}
                </select>

                {/* Detalhes da Viagem Selecionada */}
                {selectedTripDetails && (
                    <div className="mt-3 flex justify-between items-center">
                        <div className="text-xs text-stone-500">
                            <span className="font-bold block">{selectedTripDetails.vehicle_name}</span>
                            <span>Capacidade: {selectedTripDetails.capacity}</span>
                        </div>
                        <button 
                            onClick={handleDownloadManifest}
                            className="bg-stone-800 text-white p-2 rounded-lg shadow active:scale-95 transition-transform"
                            title="Baixar Manifesto PDF"
                        >
                            <DownloadIcon />
                        </button>
                    </div>
                )}
            </div>

            {/* Barra de Progresso de Embarque */}
            {selectedTripDetails && (
                <div className="mx-4 mt-4 bg-white p-4 rounded-xl shadow-sm border border-stone-200">
                    <div className="flex justify-between text-sm font-bold text-stone-700 mb-1">
                        <span>Embarque</span>
                        <span>{presentPassengers} / {totalPassengers}</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-4 overflow-hidden">
                        <div 
                            className="bg-green-500 h-4 transition-all duration-500 ease-out" 
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Lista de Passageiros */}
            <div className="px-4 mt-4 space-y-4">
                {loading ? <p className="text-center py-8 text-stone-500">Carregando lista...</p> : (
                    <>
                        {appointments.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-xl shadow-sm">
                                <p className="text-stone-500">Nenhum passageiro nesta viagem.</p>
                            </div>
                        ) : (
                            appointments.map(appt => {
                                const isPresent = appt.transportStatus === 'present';
                                const isAbsent = appt.transportStatus === 'absent';
                                const cardColor = isPresent ? 'bg-green-50 border-green-300' : isAbsent ? 'bg-red-50 border-red-300' : 'bg-white border-stone-200';

                                return (
                                    <div key={appt.id} className={`p-4 rounded-xl shadow-sm border-2 transition-all ${cardColor}`}>
                                        
                                        {/* Cabeçalho do Card */}
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-extrabold text-lg text-stone-800 leading-tight">{appt.client_name}</h3>
                                                {appt.hasCompanion && (
                                                    <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded font-bold mt-1">
                                                        +1 Acompanhante
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-stone-500 font-bold uppercase">Destino</div>
                                                <div className="text-sm font-bold text-teal-700">{appt.service_name.split(' ')[0]}</div>
                                                <div className="text-xs font-mono">{appt.time}</div>
                                            </div>
                                        </div>

                                        {/* Endereço e Contato */}
                                        <div className="bg-white/50 p-2 rounded-lg mb-4 space-y-2">
                                            {appt.client_address && (
                                                <button 
                                                    onClick={() => handleOpenMap(appt.client_address!)} 
                                                    className="w-full text-left text-sm text-stone-700 flex items-start active:text-teal-700"
                                                >
                                                    <MapPinIcon />
                                                    <span className="truncate-2-lines">{appt.client_address}</span>
                                                </button>
                                            )}
                                            {appt.client_whatsapp && (
                                                <button 
                                                    onClick={() => handleOpenWhatsapp(appt.client_whatsapp!)} 
                                                    className="w-full text-left text-sm text-green-700 font-bold flex items-center"
                                                >
                                                    <WhatsappIcon />
                                                    {appt.client_whatsapp}
                                                </button>
                                            )}
                                            {!appt.client_whatsapp && <div className="text-xs text-stone-400 italic ml-1 flex items-center"><PhoneIcon /> Sem contato</div>}
                                        </div>

                                        {/* Botões de Ação (Grandes para Touch) */}
                                        <div className="grid grid-cols-2 gap-3 h-14">
                                            <button 
                                                onClick={() => handleTransportStatusUpdate(appt.id, 'present')}
                                                className={`rounded-lg font-bold flex justify-center items-center gap-2 transition-all active:scale-95 shadow-sm ${isPresent ? 'bg-green-600 text-white shadow-inner' : 'bg-white border-2 border-stone-200 text-stone-600'}`}
                                            >
                                                <CheckIcon /> EMBARCOU
                                            </button>
                                            <button 
                                                onClick={() => handleTransportStatusUpdate(appt.id, 'absent')}
                                                className={`rounded-lg font-bold flex justify-center items-center gap-2 transition-all active:scale-95 shadow-sm ${isAbsent ? 'bg-red-600 text-white shadow-inner' : 'bg-white border-2 border-stone-200 text-stone-600'}`}
                                            >
                                                <XIcon /> FALTOU
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </>
                )}
            </div>
            
            {/* Safe Area Padding for Mobile Bottom */}
            <div className="h-8"></div>
        </div>
    );
};
