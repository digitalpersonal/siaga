
import React, { useState, useEffect, useMemo } from 'react';
import type { AttendantUser, User, ProfessionalUser, Appointment } from '../types';
import { supabase } from '../utils/supabase';
import { QuickBookModal } from '../components/QuickBookModal';

// Reuse icons for consistency
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

const PatientHistoryModal: React.FC<{ client: User; onClose: () => void }> = ({ client, onClose }) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('client_id', client.id)
                .order('date', { ascending: false });

            if (error) console.error(error);
            else setAppointments(data || []);
            setLoading(false);
        };
        fetchHistory();
    }, [client.id]);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[80vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-stone-800"><XIcon /></button>
                <h3 className="text-xl font-bold text-stone-800 mb-2">Histórico: {client.name}</h3>
                <div className="overflow-y-auto flex-grow pr-2">
                    {loading ? <p>Carregando...</p> : appointments.length > 0 ? (
                        <div className="space-y-3">
                            {appointments.map(appt => (
                                <div key={appt.id} className="border border-stone-200 rounded-lg p-3 hover:bg-stone-50">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-stone-700">{appt.service_name}</span>
                                        <span className="text-sm text-stone-500">{new Date(appt.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-stone-600">Prof: {appt.professional_name}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${appt.status === 'completed' ? 'bg-green-100 text-green-800' : appt.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{appt.status}</span>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-stone-500 text-center py-4">Sem histórico.</p>}
                </div>
            </div>
        </div>
    );
};

export const AttendantDashboard: React.FC<{ user: AttendantUser }> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'booking' | 'patients'>('booking');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Data states
    const [professionals, setProfessionals] = useState<User[]>([]);
    const [clients, setClients] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    // Booking states
    const [selectedProForBooking, setSelectedProForBooking] = useState<ProfessionalUser | null>(null);
    const [appointmentsForSelectedPro, setAppointmentsForSelectedPro] = useState<Appointment[]>([]);
    
    // History states
    const [selectedClientForHistory, setSelectedClientForHistory] = useState<User | null>(null);

    useEffect(() => {
        if (activeTab === 'booking') fetchProfessionals();
        if (activeTab === 'patients') fetchClients();
    }, [activeTab]);

    const fetchProfessionals = async () => {
        setLoading(true);
        const { data } = await supabase.from('profiles').select('*').eq('role', 'professional');
        setProfessionals(data as User[] || []);
        setLoading(false);
    };

    const fetchClients = async () => {
        setLoading(true);
        const { data } = await supabase.from('profiles').select('*').eq('role', 'client').limit(50); // Limit for performance
        setClients(data as User[] || []);
        setLoading(false);
    };

    const handleOpenQuickBook = async (professionalUser: ProfessionalUser) => {
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase.from('appointments').select('*').eq('professional_id', professionalUser.id).eq('date', today);
        setAppointmentsForSelectedPro(data || []);
        setSelectedProForBooking(professionalUser);
    };

    const filteredProfessionals = useMemo(() => 
        professionals.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())), 
    [professionals, searchTerm]);

    const filteredClients = useMemo(() => 
        clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.includes(searchTerm)), 
    [clients, searchTerm]);

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-stone-800">Recepção / Atendimento</h1>
                <p className="text-stone-500 mt-1">Olá, {user.name}. Gerencie agendamentos e pacientes.</p>
            </div>

            <div className="flex border-b border-stone-200 mb-6">
                <button 
                    onClick={() => setActiveTab('booking')}
                    className={`flex items-center px-6 py-3 font-semibold transition-colors ${activeTab === 'booking' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-stone-500 hover:text-stone-800'}`}
                >
                    <CalendarIcon /> Novo Agendamento
                </button>
                <button 
                    onClick={() => setActiveTab('patients')}
                    className={`flex items-center px-6 py-3 font-semibold transition-colors ${activeTab === 'patients' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-stone-500 hover:text-stone-800'}`}
                >
                    <UserIcon /> Base de Pacientes
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md min-h-[500px]">
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        placeholder={activeTab === 'booking' ? "Buscar Profissional..." : "Buscar Paciente (Nome ou Email)..."}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? <p>Carregando...</p> : (
                    <div className="space-y-2">
                        {activeTab === 'booking' && (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredProfessionals.map(prof => (
                                    <div key={prof.id} className="border border-stone-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow bg-stone-50">
                                        <div className="flex items-center overflow-hidden">
                                            <img src={prof.imageUrl || `https://i.pravatar.cc/150?u=${prof.id}`} className="w-10 h-10 rounded-full object-cover mr-3 bg-stone-300" alt="" />
                                            <div className="truncate">
                                                <p className="font-bold text-stone-800 truncate">{prof.name}</p>
                                                <p className="text-xs text-stone-500 truncate">{(prof as ProfessionalUser).specialties?.[0]?.name || 'Especialista'}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleOpenQuickBook(prof as ProfessionalUser)}
                                            className="bg-teal-600 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-teal-700 flex-shrink-0"
                                        >
                                            Agendar
                                        </button>
                                    </div>
                                ))}
                                {filteredProfessionals.length === 0 && <p className="text-stone-500 col-span-full text-center">Nenhum profissional encontrado.</p>}
                            </div>
                        )}

                        {activeTab === 'patients' && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-stone-200">
                                    <thead className="bg-stone-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Nome</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Contato</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-stone-200">
                                        {filteredClients.map(client => (
                                            <tr key={client.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">{client.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{client.email}<br/>{client.whatsapp}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button onClick={() => setSelectedClientForHistory(client)} className="text-teal-600 hover:text-teal-900 font-medium flex items-center">
                                                        <ClipboardListIcon /> Ver Histórico
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredClients.length === 0 && <p className="text-stone-500 text-center py-4">Nenhum paciente encontrado na busca rápida.</p>}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedProForBooking && (
                <QuickBookModal
                    user={selectedProForBooking}
                    appointmentsForToday={appointmentsForSelectedPro}
                    onClose={() => setSelectedProForBooking(null)}
                    onBookingSuccess={() => setSelectedProForBooking(null)}
                />
            )}

            {selectedClientForHistory && (
                <PatientHistoryModal 
                    client={selectedClientForHistory} 
                    onClose={() => setSelectedClientForHistory(null)} 
                />
            )}
        </div>
    );
};
