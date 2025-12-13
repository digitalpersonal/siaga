import React, { useState, useEffect, useMemo } from 'react';
import type { AdminUser, User, ProfessionalUser, Appointment, Trip, Vehicle, DestinationCity, Specialty } from '../types';
import { supabase } from '../utils/supabase';
import { HEALTH_UNITS as DEFAULT_UNITS, HEALTH_UNITS, VEHICLE_CAPACITIES } from '../constants';
import { generateGeneralReport, generateTFDManifest } from '../utils/pdfGenerator';
import { QuickBookModal } from '../components/QuickBookModal';

// --- Icons ---
const ChartBarIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const UsersIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>;
const UserIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const CalendarIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const TruckIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>;
const OfficeBuildingIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const MapIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;
const BusIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
const PlusIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const XIcon = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const TrashIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const RefreshIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const DocumentDownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

// Simple beep sound using Web Audio API
const playAlert = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'triangle';
        // Play a high-low-high sequence
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); 
        oscillator.frequency.linearRampToValueAtTime(440, audioContext.currentTime + 0.2);
        oscillator.frequency.linearRampToValueAtTime(880, audioContext.currentTime + 0.4);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
        
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
            audioContext.close();
        }, 500);
    } catch (e) {
        console.error("Audio feedback error", e);
    }
};

const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-teal-500">
        <h3 className="text-stone-500 text-sm font-semibold uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold text-stone-800 mt-2">{value}</p>
    </div>
);

const DashboardOverview: React.FC = () => {
    const [stats, setStats] = useState({ users: 0, professionals: 0, appointments: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
                const { count: profCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'professional');
                const { count: apptCount, data: apptData } = await supabase.from('appointments').select('price', { count: 'exact' });
                
                const totalRevenue = apptData?.reduce((sum, appt) => sum + (appt.price || 0), 0) || 0;

                setStats({
                    users: userCount ?? 0,
                    professionals: profCount ?? 0,
                    appointments: apptCount ?? 0,
                    revenue: totalRevenue
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    // Real-time listener for Dashboard Stats
    useEffect(() => {
        const channel = supabase
            .channel('dashboard-stats')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'appointments' },
                () => {
                    // Re-fetch stats on any change
                    setLoading(true);
                    supabase.from('appointments').select('price', { count: 'exact' }).then(({ count, data }) => {
                        const totalRevenue = data?.reduce((sum, appt) => sum + (appt.price || 0), 0) || 0;
                        setStats(prev => ({
                            ...prev,
                            appointments: count ?? 0,
                            revenue: totalRevenue
                        }));
                        setLoading(false);
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (loading) return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>;

    return (
        <div>
            <h2 className="text-2xl font-bold text-stone-800 mb-6">Visão Geral</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Cidadãos Cadastrados" value={stats.users} />
                <StatCard title="Corpo Clínico" value={stats.professionals} />
                <StatCard title="Agendamentos" value={stats.appointments} />
                <StatCard title="Produção (Est.)" value={`R$ ${stats.revenue.toFixed(0)}`} />
            </div>
        </div>
    );
};

const LocalQueueManagement: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUnit, setSelectedUnit] = useState<string | 'all'>('all');

    const fetchQueue = async () => {
        setLoading(true);
        // Fetch only upcoming local appointments
        let query = supabase
            .from('appointments')
            .select('*')
            .eq('locationType', 'local')
            .eq('status', 'upcoming')
            .gte('date', new Date().toISOString().split('T')[0]) // From today onwards
            .order('date', { ascending: true })
            .order('time', { ascending: true });

        const { data, error } = await query;
        if (error) console.error("Error fetching local queue:", error);
        else setAppointments(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchQueue(); }, []);

    // Group appointments by Unit
    const groupedByUnit = useMemo(() => {
        const groups: Record<string, Appointment[]> = {};
        DEFAULT_UNITS.forEach(unit => groups[unit] = []); // Initialize with all known units
        
        appointments.forEach(appt => {
            const unit = appt.healthUnit || 'Não Definido';
            if (!groups[unit]) groups[unit] = [];
            groups[unit].push(appt);
        });
        return groups;
    }, [appointments]);

    const displayedAppointments = selectedUnit === 'all' 
        ? appointments 
        : (groupedByUnit[selectedUnit] || []);

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-stone-800">Filas de Atendimento (Local)</h2>
                    <p className="text-stone-500">Gestão de pacientes agendados para as unidades de saúde municipais.</p>
                </div>
                <button onClick={fetchQueue} className="bg-stone-100 text-stone-600 p-2 rounded-lg hover:bg-stone-200">
                    <RefreshIcon />
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button 
                    onClick={() => setSelectedUnit('all')}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${selectedUnit === 'all' ? 'bg-teal-600 text-white' : 'bg-white text-stone-600 hover:bg-stone-50 border'}`}
                >
                    Todas ({appointments.length})
                </button>
                {DEFAULT_UNITS.map(unit => {
                    const count = groupedByUnit[unit]?.length || 0;
                    return (
                        <button 
                            key={unit}
                            onClick={() => setSelectedUnit(unit)}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${selectedUnit === unit ? 'bg-teal-600 text-white' : 'bg-white text-stone-600 hover:bg-stone-50 border'}`}
                        >
                            {unit} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Kanban-like or List View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedUnit === 'all' ? (
                    // Dashboard View (Cards per Unit)
                    DEFAULT_UNITS.map(unit => {
                        const unitAppts = groupedByUnit[unit] || [];
                        if (unitAppts.length === 0) return null;
                        
                        return (
                            <div key={unit} className="bg-white p-4 rounded-xl shadow-md border border-stone-100">
                                <h3 className="font-bold text-teal-800 mb-3 flex items-center">
                                    <OfficeBuildingIcon /> 
                                    <span className="ml-2">{unit}</span>
                                </h3>
                                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                    {unitAppts.slice(0, 5).map(appt => (
                                        <div key={appt.id} className="text-sm border-b pb-2 last:border-0">
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-stone-700">{appt.time}</span>
                                                <span className="text-xs text-stone-500">{new Date(appt.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-stone-800 font-medium">{appt.client_name}</div>
                                            <div className="text-stone-500 text-xs">{appt.service_name}</div>
                                            <div className="text-stone-400 text-xs mt-0.5">Prof: {appt.professional_name}</div>
                                        </div>
                                    ))}
                                    {unitAppts.length > 5 && (
                                        <div className="text-center text-xs text-stone-500 pt-2 font-medium">
                                            + {unitAppts.length - 5} outros pacientes
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    // Detailed List View for Selected Unit
                    <div className="col-span-full bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center">
                            Lista de Espera: {selectedUnit}
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-stone-200">
                                <thead className="bg-stone-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Data/Hora</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Paciente</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Serviço/Especialidade</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Profissional</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-200">
                                    {displayedAppointments.map(appt => (
                                        <tr key={appt.id} className="hover:bg-stone-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900 font-mono">
                                                {new Date(appt.date).toLocaleDateString()} <strong>{appt.time}</strong>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">
                                                {appt.client_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">
                                                {appt.service_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                                                {appt.professional_name}
                                            </td>
                                        </tr>
                                    ))}
                                    {displayedAppointments.length === 0 && (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-stone-500">Nenhum paciente na fila desta unidade.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const TripManagement: React.FC = () => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [drivers, setDrivers] = useState<User[]>([]);
    const [destinations, setDestinations] = useState<DestinationCity[]>([]);
    const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
    
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Create Trip Form
    const [newTripData, setNewTripData] = useState({ date: '', time: '', destination_id: '', vehicle_id: '', driver_id: '' });

    const fetchData = async () => {
        // Fetch Trips
        const { data: tripData } = await supabase.from('trips').select('*').order('date', { ascending: true });
        setTrips(tripData || []);

        // Fetch Resources
        const { data: vData } = await supabase.from('vehicles').select('*');
        setVehicles(vData || []);
        
        const { data: dData } = await supabase.from('profiles').select('*').eq('role', 'driver');
        setDrivers(dData || []);

        const { data: cData } = await supabase.from('destinations').select('*');
        setDestinations(cData || []);

        // Fetch Pending External Appointments
        fetchPendingAppointments();
    };

    const fetchPendingAppointments = async () => {
        const { data } = await supabase
            .from('appointments')
            .select('*')
            .eq('locationType', 'external')
            .is('trip_id', null) // Not yet assigned
            .neq('status', 'cancelled')
            .order('date', { ascending: true });
        setPendingAppointments(data || []);
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreateTrip = async (e: React.FormEvent) => {
        e.preventDefault();
        const vehicle = vehicles.find(v => v.id === newTripData.vehicle_id);
        const driver = drivers.find(d => d.id === newTripData.driver_id);
        const destination = destinations.find(d => d.id === newTripData.destination_id);

        if (!vehicle || !driver || !destination) return;

        const newTrip = {
            id: crypto.randomUUID(),
            date: newTripData.date,
            time: newTripData.time,
            destination_id: destination.id,
            vehicle_id: vehicle.id,
            driver_id: driver.id,
            destination_name: destination.name,
            vehicle_name: vehicle.name,
            driver_name: driver.name,
            capacity: vehicle.capacity,
            passengers_count: 0,
            status: 'scheduled'
        };

        const { error } = await supabase.from('trips').insert([newTrip]);
        if (!error) {
            setTrips([...trips, newTrip as any]);
            setShowCreateModal(false);
            setNewTripData({ date: '', time: '', destination_id: '', vehicle_id: '', driver_id: '' });
        }
    };

    const handleAssignPatient = async (appointment: Appointment, trip: Trip) => {
        // Calculate passengers (Patient + Companion)
        const paxToAdd = 1 + (appointment.hasCompanion ? 1 : 0);
        
        if (trip.passengers_count + paxToAdd > trip.capacity) {
            alert(`Capacidade excedida! Veículo só tem ${trip.capacity - trip.passengers_count} lugares livres.`);
            return;
        }

        // Optimistic update
        const updatedTrip = { ...trip, passengers_count: trip.passengers_count + paxToAdd };
        setTrips(trips.map(t => t.id === trip.id ? updatedTrip : t));
        setPendingAppointments(prev => prev.filter(a => a.id !== appointment.id));
        if (selectedTrip?.id === trip.id) setSelectedTrip(updatedTrip);

        // DB Update
        await supabase.from('appointments').update({ trip_id: trip.id }).eq('id', appointment.id);
        await supabase.from('trips').update({ passengers_count: updatedTrip.passengers_count }).eq('id', trip.id);
    };

    const handleRemovePatient = async (appointment: Appointment) => {
        if (!selectedTrip) return;
        const paxToRemove = 1 + (appointment.hasCompanion ? 1 : 0);
        
        // Update Trip Local
        const updatedTrip = { ...selectedTrip, passengers_count: selectedTrip.passengers_count - paxToRemove };
        setTrips(trips.map(t => t.id === selectedTrip.id ? updatedTrip : t));
        setSelectedTrip(updatedTrip);
        
        // Update Lists
        setPendingAppointments([...pendingAppointments, { ...appointment, trip_id: undefined }]);
        
        // DB Update
        await supabase.from('appointments').update({ trip_id: null }).eq('id', appointment.id);
        await supabase.from('trips').update({ passengers_count: updatedTrip.passengers_count }).eq('id', selectedTrip.id);
    };

    const [tripPassengers, setTripPassengers] = useState<Appointment[]>([]);
    
    useEffect(() => {
        if (selectedTrip) {
            const loadPassengers = async () => {
                const { data } = await supabase.from('appointments').select('*').eq('trip_id', selectedTrip.id);
                setTripPassengers(data || []);
            };
            loadPassengers();
        }
    }, [selectedTrip]);

    // --- PDF GENERATION ---
    const handleDownloadManifest = async () => {
        if (!selectedTrip) return;
        const { data } = await supabase.from('appointments').select('*').eq('trip_id', selectedTrip.id);
        if (data) {
            generateTFDManifest(selectedTrip, data);
        }
    };

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-stone-800">Gestão de Viagens (TFD)</h2>
                    <p className="text-stone-500">Planejamento de frota e alocação de pacientes para outras cidades.</p>
                </div>
                <button onClick={() => setShowCreateModal(true)} className="bg-stone-800 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md hover:bg-stone-900">
                    <PlusIcon /> <span className="ml-2">Nova Viagem</span>
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* Left: Scheduled Trips */}
                <div className="lg:w-1/3 bg-white p-4 rounded-xl shadow-md overflow-hidden flex flex-col h-[600px]">
                    <h3 className="font-bold text-stone-700 mb-3 flex justify-between items-center">
                        Viagens Programadas
                        <button onClick={fetchData}><RefreshIcon /></button>
                    </h3>
                    <div className="overflow-y-auto space-y-3 pr-2 flex-grow">
                        {trips.length === 0 && <p className="text-stone-400 text-sm text-center mt-10">Nenhuma viagem agendada.</p>}
                        {trips.map(trip => (
                            <div 
                                key={trip.id} 
                                onClick={() => setSelectedTrip(trip)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedTrip?.id === trip.id ? 'border-teal-500 bg-teal-50' : 'border-stone-200 hover:bg-stone-50'}`}
                            >
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-stone-800">{new Date(trip.date).toLocaleDateString()}</span>
                                    <span className="text-sm font-mono bg-stone-200 px-2 rounded">{trip.time}</span>
                                </div>
                                <div className="text-sm text-teal-700 font-semibold mb-1 flex items-center"><MapIcon /> <span className="ml-1">{trip.destination_name}</span></div>
                                <div className="text-xs text-stone-500 mb-2">{trip.vehicle_name} ({trip.driver_name})</div>
                                {/* Capacity Bar */}
                                <div className="w-full bg-stone-200 rounded-full h-2.5">
                                    <div 
                                        className={`h-2.5 rounded-full ${trip.passengers_count >= trip.capacity ? 'bg-red-500' : 'bg-green-500'}`} 
                                        style={{ width: `${(trip.passengers_count / trip.capacity) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs mt-1 text-stone-500">
                                    <span>{trip.passengers_count} ocupados</span>
                                    <span>{trip.capacity} total</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Middle: Selected Trip Detail */}
                <div className="lg:w-1/3 bg-white p-4 rounded-xl shadow-md overflow-hidden flex flex-col h-[600px]">
                    {selectedTrip ? (
                        <>
                            <div className="mb-4 border-b pb-4">
                                <h3 className="font-bold text-xl text-teal-800">{selectedTrip.destination_name}</h3>
                                <p className="text-sm text-stone-600">Saída: {new Date(selectedTrip.date).toLocaleDateString()} às {selectedTrip.time}</p>
                                <p className="text-sm text-stone-600">Veículo: {selectedTrip.vehicle_name} | Mot: {selectedTrip.driver_name}</p>
                                
                                <button 
                                    onClick={handleDownloadManifest}
                                    className="mt-3 w-full bg-amber-600 text-white text-sm font-bold py-2 rounded flex items-center justify-center hover:bg-amber-700 shadow-sm"
                                >
                                    <DocumentDownloadIcon /> <span className="ml-2">Imprimir Manifesto Oficial</span>
                                </button>
                            </div>
                            <h4 className="font-bold text-stone-700 text-sm mb-2">Lista de Passageiros ({tripPassengers.length})</h4>
                            <div className="overflow-y-auto space-y-2 pr-2 flex-grow">
                                {tripPassengers.map(p => (
                                    <div key={p.id} className="flex justify-between items-center p-2 border rounded bg-stone-50 text-sm">
                                        <div>
                                            <span className="font-semibold block">{p.client_name}</span>
                                            {p.hasCompanion && <span className="text-xs text-amber-600 font-bold">+ Acompanhante</span>}
                                            <span className="text-xs text-stone-400 block">{p.client_address || 'Endereço n/d'}</span>
                                        </div>
                                        <button onClick={() => handleRemovePatient(p)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon /></button>
                                    </div>
                                ))}
                                {tripPassengers.length === 0 && <p className="text-stone-400 text-sm text-center">Nenhum passageiro alocado.</p>}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-stone-400">
                            <BusIcon />
                            <p className="mt-2">Selecione uma viagem para ver detalhes.</p>
                        </div>
                    )}
                </div>

                {/* Right: Pending Queue */}
                <div className="lg:w-1/3 bg-stone-100 p-4 rounded-xl border border-stone-200 overflow-hidden flex flex-col h-[600px]">
                    <h3 className="font-bold text-stone-700 mb-1">Fila de Espera (Transporte)</h3>
                    <p className="text-xs text-stone-500 mb-3">Pacientes aguardando alocação em veículo.</p>
                    
                    <div className="overflow-y-auto space-y-2 pr-2 flex-grow">
                        {pendingAppointments.map(appt => {
                            // Only allow adding if selected trip matches date (simple validation)
                            const canAdd = selectedTrip && new Date(selectedTrip.date).toISOString().split('T')[0] === new Date(appt.date).toISOString().split('T')[0];
                            
                            return (
                                <div key={appt.id} className="bg-white p-3 rounded shadow-sm border-l-4 border-amber-400">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-sm">{appt.client_name}</span>
                                        <span className="text-xs bg-stone-100 px-1 rounded">{new Date(appt.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-xs text-stone-600 mt-1 truncate">Dest: {appt.service_name}</div>
                                    {appt.hasCompanion && <div className="text-xs text-amber-600 font-bold mt-1">+ 1 Acompanhante</div>}
                                    
                                    <button 
                                        disabled={!canAdd}
                                        onClick={() => selectedTrip && handleAssignPatient(appt, selectedTrip)}
                                        className={`mt-2 w-full text-xs font-bold py-1 rounded ${canAdd ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
                                    >
                                        {canAdd ? 'Alocar na Viagem Selecionada' : 'Data Incompatível'}
                                    </button>
                                </div>
                            );
                        })}
                        {pendingAppointments.length === 0 && <p className="text-stone-400 text-sm text-center mt-10">Fila vazia. Todos alocados.</p>}
                    </div>
                </div>
            </div>

            {/* Create Trip Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Nova Viagem</h3>
                        <form onSubmit={handleCreateTrip} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase">Data</label>
                                <input type="date" required className="w-full border rounded p-2" value={newTripData.date} onChange={e => setNewTripData({...newTripData, date: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase">Horário Saída</label>
                                <input type="time" required className="w-full border rounded p-2" value={newTripData.time} onChange={e => setNewTripData({...newTripData, time: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase">Destino</label>
                                <select required className="w-full border rounded p-2 bg-white" value={newTripData.destination_id} onChange={e => setNewTripData({...newTripData, destination_id: e.target.value})}>
                                    <option value="">Selecione...</option>
                                    {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase">Veículo</label>
                                <select required className="w-full border rounded p-2 bg-white" value={newTripData.vehicle_id} onChange={e => setNewTripData({...newTripData, vehicle_id: e.target.value})}>
                                    <option value="">Selecione...</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.capacity} lug)</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase">Motorista</label>
                                <select required className="w-full border rounded p-2 bg-white" value={newTripData.driver_id} onChange={e => setNewTripData({...newTripData, driver_id: e.target.value})}>
                                    <option value="">Selecione...</option>
                                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded font-bold hover:bg-teal-700">Criar Viagem</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const AddProfessionalModal: React.FC<{
    onClose: () => void;
    onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [newSpecialtyName, setNewSpecialtyName] = useState('');
    const [newSpecialtyPrice, setNewSpecialtyPrice] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [bio, setBio] = useState('');
    const [assignedUnit, setAssignedUnit] = useState(HEALTH_UNITS[0]); // Default to first unit
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const handleAddSpecialty = () => {
        if (newSpecialtyName.trim() && newSpecialtyPrice) {
            setSpecialties([...specialties, { name: newSpecialtyName.trim(), price: Number(newSpecialtyPrice) }]);
            setNewSpecialtyName('');
            setNewSpecialtyPrice('');
        } else {
            alert('Por favor, preencha o nome e o preço da especialidade.');
        }
    };
    
    const removeSpecialty = (indexToRemove: number) => {
        setSpecialties(specialties.filter((_, index) => index !== indexToRemove));
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (specialties.length === 0) {
            setError('Por favor, adicione ao menos uma especialidade.');
            return;
        }

        setLoading(true);
        setError(null);
        
        let imageUrl = `https://i.pravatar.cc/150?u=${email}`;

        if (avatarFile) {
            try {
                const fileExt = avatarFile.name.split('.').pop();
                const filePath = `${crypto.randomUUID()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile);

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);
                
                if (!urlData.publicUrl) throw new Error("URL pública não foi gerada.");
                
                imageUrl = urlData.publicUrl;

            } catch (uploadError: any) {
                setError(`Erro no upload da imagem: ${uploadError.message}`);
                setLoading(false);
                return;
            }
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role: 'professional',
                    specialty: specialties,
                    whatsapp,
                    imageUrl,
                    bio,
                    settings: {
                        workHours: { start: '08:00', end: '17:00' }, // Standard UBS hours
                        workDays: [1, 2, 3, 4, 5],
                        blockedDays: [],
                        blockedTimeSlots: {},
                        assignedUnit: assignedUnit, 
                    },
                    services: []
                },
            },
        });

        if (signUpError) {
            setError(signUpError.message);
        } else if (data.user) {
            alert('Profissional cadastrado com sucesso!');
            onSuccess();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} aria-label="Fechar" className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 transition-colors">
                    <XIcon />
                </button>
                <h2 className="text-2xl font-bold text-center text-stone-800 mb-6">Novo Especialista / Médico</h2>
                
                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                
                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="flex flex-col items-center text-center">
                        <img src={previewUrl || 'https://via.placeholder.com/150'} alt="Pré-visualização do perfil" className="w-24 h-24 rounded-full object-cover border-4 border-stone-200 mb-4" />
                        <label className="cursor-pointer bg-stone-100 text-stone-700 font-semibold py-2 px-4 rounded-lg hover:bg-stone-200 transition-colors">
                            <span>Foto de Perfil</span>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                    </div>
                    <div>
                        <label className="block text-stone-600 mb-1" htmlFor="prof-name">Nome Completo</label>
                        <input type="text" id="prof-name" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" />
                    </div>
                    <div>
                        <label className="block text-stone-600 mb-1" htmlFor="prof-unit">Unidade de Atendimento (Local Fixo)</label>
                        <select 
                            id="prof-unit" 
                            value={assignedUnit} 
                            onChange={e => setAssignedUnit(e.target.value)} 
                            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                        >
                            {HEALTH_UNITS.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                            ))}
                        </select>
                        <p className="text-xs text-stone-500 mt-1">Isso define onde o paciente deverá comparecer.</p>
                    </div>
                     <div>
                        <label className="block text-stone-600 mb-1" htmlFor="prof-bio">Bio / Descrição</label>
                        <textarea id="prof-bio" value={bio} onChange={e => setBio(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" rows={3} placeholder="Descreva a especialidade e experiência do profissional."></textarea>
                    </div>
                     <div>
                        <label className="block text-stone-600 mb-1" htmlFor="prof-email">Email de Acesso</label>
                        <input type="email" id="prof-email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" />
                    </div>
                     <div>
                        <label className="block text-stone-600 mb-1" htmlFor="prof-password">Senha Provisória</label>
                        <input type="password" id="prof-password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" />
                    </div>
                    <div>
                        <label className="block text-stone-600 mb-1">Especialidades</label>
                        <div className="border rounded-lg p-2 space-y-2">
                             {specialties.map((spec, index) => (
                                <div key={index} className="flex items-center justify-between bg-stone-100 p-2 rounded-lg text-sm">
                                    <span>{spec.name} - R$ {spec.price.toFixed(2)}</span>
                                    <button type="button" onClick={() => removeSpecialty(index)} className="ml-2 text-red-500 hover:text-red-700 font-bold">&times;</button>
                                </div>
                            ))}
                            <div className="flex items-end gap-2 border-t pt-2">
                                <div className="flex-grow">
                                     <input type="text" value={newSpecialtyName} onChange={e => setNewSpecialtyName(e.target.value)} className="w-full px-2 py-1 border rounded-lg text-sm" placeholder="Nome da Especialidade" />
                                </div>
                                <div className="w-24">
                                     <input type="number" value={newSpecialtyPrice} onChange={e => setNewSpecialtyPrice(e.target.value)} className="w-full px-2 py-1 border rounded-lg text-sm" placeholder="Preço" step="0.01" />
                                </div>
                                <button type="button" onClick={handleAddSpecialty} className="h-9 bg-stone-700 text-white font-semibold px-3 rounded-lg hover:bg-stone-800 text-sm">Add</button>
                            </div>
                        </div>
                    </div>
                     <div>
                        <label className="block text-stone-600 mb-1" htmlFor="prof-whatsapp">WhatsApp (Opcional)</label>
                        <input type="tel" id="prof-whatsapp" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="(XX) XXXXX-XXXX" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-rose-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-rose-600 transition-colors duration-300 disabled:bg-rose-300">
                        {loading ? 'Cadastrando...' : 'Cadastrar Especialista'}
                    </button>
                </form>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

const ProfessionalManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSelectProModalOpen, setIsSelectProModalOpen] = useState(false);
    const [proSearchTerm, setProSearchTerm] = useState('');
    
    // Quick Booking State
    const [selectedProForBooking, setSelectedProForBooking] = useState<ProfessionalUser | null>(null);
    const [appointmentsForSelectedPro, setAppointmentsForSelectedPro] = useState<Appointment[]>([]);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'professional')
            .order('created_at', { ascending: false });
        if (error) console.error("Error fetching professionals:", error);
        else setUsers(data as User[] || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    
    const handleProfessionalAdded = () => {
        setIsAddModalOpen(false);
        fetchUsers();
    };

    const handleRemoveProfessional = async (userId: string) => {
        if (!window.confirm('Tem certeza que deseja remover este profissional? Esta ação removerá o perfil do profissional da plataforma. Esta ação não pode ser desfeita.')) {
            return;
        }
    
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);
    
        if (error) {
            alert('Erro ao remover o perfil do profissional.');
            console.error('Error removing profile:', error);
        } else {
            alert('Perfil do profissional removido com sucesso.');
            setUsers(currentUsers => currentUsers.filter(u => u.id !== userId));
        }
    };
    
    const handleOpenQuickBook = async (user: User) => {
        const today = new Date().toISOString().split('T')[0];
        const professionalUser = user as ProfessionalUser;
        
        const { data } = await supabase
            .from('appointments')
            .select('*')
            .eq('professional_id', user.id)
            .eq('date', today);
            
        setAppointmentsForSelectedPro(data || []);
        setSelectedProForBooking(professionalUser);
    };

    const handleQuickBookSuccess = () => {
        setSelectedProForBooking(null);
    };
    
    const filteredUsers = useMemo(() => 
        users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        ), [users, searchTerm]);

    if (loading) return <p>Carregando profissionais...</p>;
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                 <h3 className="text-2xl font-bold text-stone-800">Gerenciar Profissionais</h3>
                 <div className="flex gap-2">
                    <button 
                        onClick={() => setIsSelectProModalOpen(true)}
                        className="bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors flex items-center shadow-sm"
                    >
                        <CalendarIcon />
                        <span className="ml-2 hidden sm:inline">Agendamento Rápido</span>
                        <span className="ml-2 sm:hidden">Agendar</span>
                    </button>
                     <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-rose-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-rose-600 transition-colors flex items-center shadow-sm"
                    >
                        <PlusIcon />
                        <span className="ml-2 hidden sm:inline">Adicionar Profissional</span>
                        <span className="ml-2 sm:hidden">Adicionar</span>
                    </button>
                </div>
            </div>
            <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full max-w-sm p-2 border border-stone-300 rounded-lg mb-4"
            />
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-200">
                    <thead className="bg-stone-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Unidade</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-stone-200">
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{(user as ProfessionalUser).settings?.assignedUnit || 'Não atribuída'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                                    <button 
                                        onClick={() => handleOpenQuickBook(user)}
                                        className="text-teal-600 hover:text-teal-800 p-1 rounded-md hover:bg-teal-50 transition-colors"
                                        title="Agendamento Rápido"
                                    >
                                        <CalendarIcon />
                                    </button>
                                    <button 
                                        onClick={() => handleRemoveProfessional(user.id)} 
                                        className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors" 
                                        title="Remover Profissional"
                                    >
                                        <TrashIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredUsers.length === 0 && <p className="text-center text-stone-500 py-4">Nenhum profissional encontrado.</p>}
            </div>
            {isAddModalOpen && (
                <AddProfessionalModal 
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={handleProfessionalAdded}
                />
            )}
            {isSelectProModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[80vh] flex flex-col">
                        <button onClick={() => setIsSelectProModalOpen(false)} className="absolute top-4 right-4 text-stone-500 hover:text-stone-800"><XIcon /></button>
                        <h3 className="text-xl font-bold text-stone-800 mb-2">Novo Agendamento</h3>
                        <p className="text-stone-500 text-sm mb-4">Selecione o profissional para realizar o agendamento.</p>
                        
                        <input 
                            type="text" 
                            placeholder="Buscar profissional..."
                            value={proSearchTerm}
                            onChange={e => setProSearchTerm(e.target.value)}
                            className="w-full p-2 border border-stone-300 rounded-lg mb-4 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                        
                        <div className="overflow-y-auto flex-grow space-y-2 pr-2">
                            {users.filter(u => u.name.toLowerCase().includes(proSearchTerm.toLowerCase())).map(u => (
                                <div 
                                    key={u.id} 
                                    onClick={() => {
                                        setIsSelectProModalOpen(false);
                                        setProSearchTerm('');
                                        handleOpenQuickBook(u);
                                    }} 
                                    className="p-3 border border-stone-200 rounded-lg hover:bg-stone-50 hover:border-teal-500 cursor-pointer flex items-center transition-all group"
                                >
                                    <div className="h-10 w-10 rounded-full bg-stone-200 overflow-hidden mr-3 border border-stone-300">
                                         <img src={u.imageUrl || `https://i.pravatar.cc/150?u=${u.id}`} alt={u.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-stone-800 group-hover:text-teal-700">{u.name}</p>
                                        <p className="text-xs text-stone-500">{u.email}</p>
                                    </div>
                                </div>
                            ))}
                            {users.filter(u => u.name.toLowerCase().includes(proSearchTerm.toLowerCase())).length === 0 && (
                                <p className="text-center text-stone-500 py-4">Nenhum profissional encontrado.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {selectedProForBooking && (
                <QuickBookModal
                    user={selectedProForBooking}
                    appointmentsForToday={appointmentsForSelectedPro}
                    onClose={() => setSelectedProForBooking(null)}
                    onBookingSuccess={handleQuickBookSuccess}
                />
            )}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

const ReportsAnalytics: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(1); // First day of current month
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const date = new Date();
        return date.toISOString().split('T')[0]; // Today
    });

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: false });

        if (error) {
            console.error("Error fetching report data:", error);
        } else {
            setAppointments(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    // Real-time listener for Reports
    useEffect(() => {
        const channel = supabase
            .channel('reports-appointments')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'appointments' },
                (payload) => {
                    const newAppt = payload.new as Appointment;
                    // Check if new appointment falls within date range
                    if (newAppt.date >= startDate && newAppt.date <= endDate) {
                        setAppointments(prev => [newAppt, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                    }
                    // Trigger Alert
                    playAlert();
                    setAlertMessage(`Novo agendamento: ${newAppt.service_name} para ${newAppt.client_name}`);
                    setTimeout(() => setAlertMessage(null), 5000);
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'appointments' },
                (payload) => {
                     // Optimistic update for status changes
                     setAppointments(prev => prev.map(a => a.id === payload.new.id ? payload.new as Appointment : a));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [startDate, endDate]);

    const metrics = useMemo(() => {
        const total = appointments.length;
        const completed = appointments.filter(a => a.status === 'completed' || a.transportStatus === 'present').length;
        const cancelled = appointments.filter(a => a.status === 'cancelled').length;
        const noShow = appointments.filter(a => a.transportStatus === 'absent').length; 
        
        // Calculate service popularity
        const serviceCounts: Record<string, number> = {};
        appointments.forEach(a => {
            const name = a.service_name.split('(')[0].trim();
            serviceCounts[name] = (serviceCounts[name] || 0) + 1;
        });
        const topServices = Object.entries(serviceCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        return { total, completed, cancelled, noShow, topServices };
    }, [appointments]);

    const exportCSV = () => {
        const headers = ["ID", "Data", "Hora", "Paciente", "Profissional", "Serviço", "Local (Unidade)", "Status", "Transporte", "Valor"];
        const rows = appointments.map(a => [
            a.id,
            a.date,
            a.time,
            `"${a.client_name}"`,
            `"${a.professional_name}"`,
            `"${a.service_name}"`,
            `"${a.healthUnit || 'Não informado'}"`,
            a.status,
            a.transportStatus || 'N/A',
            a.price
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `relatorio_siaga_${startDate}_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 relative">
            {/* Alert Notification */}
            {alertMessage && (
                <div className="fixed top-24 right-6 bg-teal-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 flex items-center animate-bounce">
                    <BellIcon />
                    <span className="ml-3 font-bold">{alertMessage}</span>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="text-2xl font-bold text-stone-800 flex items-center">
                        <ChartBarIcon /> <span className="ml-2">Relatórios e Inteligência (BI)</span>
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

                {loading ? <p className="text-center py-10">Carregando dados...</p> : (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <p className="text-blue-600 font-bold text-sm uppercase">Total Agendamentos</p>
                                <p className="text-3xl font-extrabold text-blue-800">{metrics.total}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                <p className="text-green-600 font-bold text-sm uppercase">Realizados/Confirmados</p>
                                <p className="text-3xl font-extrabold text-green-800">{metrics.completed}</p>
                                <p className="text-xs text-green-600 mt-1">{((metrics.completed / (metrics.total || 1)) * 100).toFixed(1)}% taxa de comparecimento</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                <p className="text-red-600 font-bold text-sm uppercase">Faltas / Absenteísmo</p>
                                <p className="text-3xl font-extrabold text-red-800">{metrics.noShow}</p>
                                <p className="text-xs text-red-600 mt-1">Impacto direto na eficiência</p>
                            </div>
                            <div className="bg-stone-100 p-4 rounded-lg border border-stone-200">
                                <p className="text-stone-600 font-bold text-sm uppercase">Cancelamentos</p>
                                <p className="text-3xl font-extrabold text-stone-800">{metrics.cancelled}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Top Services Chart (CSS based) */}
                            <div className="bg-stone-50 p-5 rounded-xl border border-stone-200">
                                <h4 className="font-bold text-stone-700 mb-4">Serviços Mais Procurados</h4>
                                <div className="space-y-3">
                                    {metrics.topServices.map(([name, count], idx) => (
                                        <div key={name}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-stone-700">{idx + 1}. {name}</span>
                                                <span className="text-stone-500">{count} atendimentos</span>
                                            </div>
                                            <div className="w-full bg-stone-200 rounded-full h-2.5">
                                                <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${(count / (metrics.topServices[0][1] || 1)) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                    {metrics.topServices.length === 0 && <p className="text-stone-400 text-sm">Sem dados suficientes.</p>}
                                </div>
                            </div>
                            
                            {/* Recent Activity Log */}
                            <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 flex flex-col">
                                <h4 className="font-bold text-stone-700 mb-4">Auditoria Recente</h4>
                                <div className="overflow-y-auto flex-grow max-h-60 pr-2 space-y-2">
                                    {appointments.slice(0, 10).map(appt => (
                                        <div key={appt.id} className="text-sm border-b border-stone-200 pb-2 last:border-0">
                                            <div className="flex justify-between">
                                                <span className="font-bold text-stone-700">{appt.client_name}</span>
                                                <span className="text-stone-500 text-xs">{new Date(appt.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-stone-600 truncate w-2/3">{appt.service_name}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${appt.status === 'completed' ? 'bg-green-100 text-green-700' : appt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {appt.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
                                        <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase">Profissional</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-stone-200">
                                    {appointments.slice(0, 50).map(appt => (
                                        <tr key={appt.id} className="hover:bg-stone-50">
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-stone-900">{new Date(appt.date).toLocaleDateString()} <span className="text-stone-400 text-xs">{appt.time}</span></td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-stone-700 font-medium">{appt.client_name}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-stone-600">
                                                {appt.service_name}
                                                {appt.healthUnit && <div className="text-xs text-teal-600 mt-0.5">{appt.healthUnit}</div>}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-stone-600">{appt.professional_name}</td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    appt.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                    appt.status === 'cancelled' ? 'bg-stone-100 text-stone-800' : 
                                                    'bg-blue-100 text-blue-800'}`}>
                                                    {appt.status === 'upcoming' ? 'Agendado' : appt.status}
                                                </span>
                                                {appt.transportStatus === 'absent' && <span className="ml-1 text-xs text-red-600 font-bold">(Faltou)</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {appointments.length > 50 && (
                                <div className="p-3 text-center text-sm text-stone-500 bg-stone-50 border-t">
                                    Mostrando 50 de {appointments.length} registros. Use "Exportar CSV" para ver tudo.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const GlobalAppointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        setLoading(true);
        const { data } = await supabase.from('appointments').select('*').order('date', { ascending: false }).limit(50);
        setAppointments(data || []);
        setLoading(false);
    };
    useEffect(() => { fetchAppointments(); }, []);

    const handleExportPDF = () => {
        generateGeneralReport(appointments, "Últimos 50 Agendamentos");
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between mb-4 items-center">
                <h3 className="text-xl font-bold text-stone-800">Todos Agendamentos (Recentes)</h3>
                <div className="flex gap-3">
                    <button onClick={handleExportPDF} className="text-teal-600 text-sm font-bold border border-teal-600 px-3 py-1 rounded hover:bg-teal-50 flex items-center">
                        <DocumentDownloadIcon /> <span className="ml-1">PDF</span>
                    </button>
                    <button onClick={fetchAppointments} className="text-teal-600 text-sm font-bold hover:underline">Atualizar</button>
                </div>
            </div>
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-stone-200">
                    <thead className="bg-stone-100">
                        <tr><th className="px-4 py-2 text-left text-xs uppercase font-bold text-stone-500">Data</th><th className="px-4 py-2 text-left text-xs uppercase font-bold text-stone-500">Paciente</th><th className="px-4 py-2 text-left text-xs uppercase font-bold text-stone-500">Serviço/Prof</th><th className="px-4 py-2 text-left text-xs uppercase font-bold text-stone-500">Status</th></tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-stone-200">
                        {appointments.map(a => (
                            <tr key={a.id} className="hover:bg-stone-50 text-sm">
                                <td className="px-4 py-3 whitespace-nowrap">{new Date(a.date).toLocaleDateString()} {a.time}</td>
                                <td className="px-4 py-3">{a.client_name}</td>
                                <td className="px-4 py-3">{a.service_name}<br/><span className="text-xs text-stone-500">{a.professional_name}</span></td>
                                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${a.status === 'completed' ? 'bg-green-100 text-green-800' : a.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{a.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const AdminDashboard: React.FC<{ user: AdminUser }> = ({ user }) => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-stone-800">Painel Administrativo</h1>
                <p className="text-stone-500 mt-1">Gestão centralizada do sistema de saúde.</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 border-b border-stone-200 pb-2">
                {['overview', 'queue', 'trips', 'professionals', 'reports', 'appointments'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm capitalize transition-colors ${
                            activeTab === tab 
                            ? 'bg-teal-600 text-white' 
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                    >
                        {tab === 'overview' ? 'Visão Geral' : 
                         tab === 'queue' ? 'Filas (Local)' : 
                         tab === 'trips' ? 'Transporte (TFD)' : 
                         tab === 'professionals' ? 'Profissionais' : 
                         tab === 'reports' ? 'Relatórios' : 'Todos Agendamentos'}
                    </button>
                ))}
            </div>

            <div className="bg-stone-50 rounded-xl min-h-[500px]">
                {activeTab === 'overview' && <DashboardOverview />}
                {activeTab === 'queue' && <LocalQueueManagement />}
                {activeTab === 'trips' && <TripManagement />}
                {activeTab === 'professionals' && <ProfessionalManagement />}
                {activeTab === 'reports' && <ReportsAnalytics />}
                {activeTab === 'appointments' && <GlobalAppointments />}
            </div>
        </div>
    );
};