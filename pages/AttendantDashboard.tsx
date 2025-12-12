
import React, { useState, useEffect, useMemo } from 'react';
import type { AttendantUser, User, ProfessionalUser, Appointment } from '../types';
import { supabase, getInitials, getColor } from '../utils/supabase';
import { QuickBookModal } from '../components/QuickBookModal';

// Reuse icons for consistency
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const WhatsappIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-4 h-4"}>
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
);

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
                <div className="flex items-center gap-4 mb-4">
                    {client.imageUrl ? (
                        <img src={client.imageUrl} alt={client.name} className="w-16 h-16 rounded-full object-cover border-2 border-stone-200" />
                    ) : (
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${getColor(client.name)}`}>
                            {getInitials(client.name)}
                        </div>
                    )}
                    <div>
                        <h3 className="text-2xl font-bold text-stone-800">{client.name}</h3>
                        <p className="text-stone-500">{client.email} {client.whatsapp && `• ${client.whatsapp}`}</p>
                    </div>
                </div>
                
                <h4 className="font-semibold text-stone-700 mb-3 border-b pb-2">Histórico de Atendimentos</h4>
                
                <div className="overflow-y-auto flex-grow pr-2">
                    {loading ? <p>Carregando...</p> : appointments.length > 0 ? (
                        <div className="space-y-3">
                            {appointments.map(appt => (
                                <div key={appt.id} className="border border-stone-200 rounded-lg p-3 hover:bg-stone-50">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-stone-700">{appt.service_name}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${appt.status === 'completed' ? 'bg-green-100 text-green-800' : appt.status === 'cancelled' ? 'bg-stone-200 text-stone-600' : 'bg-blue-100 text-blue-800'}`}>
                                            {appt.status === 'upcoming' ? 'Agendado' : appt.status === 'completed' ? 'Concluído' : 'Cancelado'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-sm text-stone-600">Prof: {appt.professional_name}</p>
                                        <span className="text-sm text-stone-500">{new Date(appt.date).toLocaleDateString()} às {appt.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-stone-500 text-center py-4 bg-stone-50 rounded-lg">Este paciente não possui histórico de agendamentos.</p>}
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

                {loading ? <p className="text-center text-stone-500 py-8">Carregando...</p> : (
                    <div className="space-y-2">
                        {activeTab === 'booking' && (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredProfessionals.map(prof => (
                                    <div key={prof.id} className="border border-stone-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow bg-stone-50">
                                        <div className="flex items-center overflow-hidden">
                                            <img src={prof.imageUrl || `https://i.pravatar.cc/150?u=${prof.id}`} className="w-12 h-12 rounded-full object-cover mr-3 bg-stone-300" alt="" />
                                            <div className="truncate">
                                                <p className="font-bold text-stone-800 truncate">{prof.name}</p>
                                                <p className="text-xs text-stone-500 truncate">{(prof as ProfessionalUser).specialties?.[0]?.name || 'Especialista'}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleOpenQuickBook(prof as ProfessionalUser)}
                                            className="bg-teal-600 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-teal-700 flex-shrink-0 shadow-sm"
                                        >
                                            Agendar
                                        </button>
                                    </div>
                                ))}
                                {filteredProfessionals.length === 0 && <p className="text-stone-500 col-span-full text-center py-8">Nenhum profissional encontrado.</p>}
                            </div>
                        )}

                        {activeTab === 'patients' && (
                            <div className="overflow-x-auto rounded-lg border border-stone-200">
                                <table className="min-w-full divide-y divide-stone-200">
                                    <thead className="bg-stone-100">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Nome</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">WhatsApp</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-stone-200">
                                        {filteredClients.map(client => (
                                            <tr key={client.id} className="hover:bg-stone-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            {client.imageUrl && client.imageUrl.startsWith('http') ? (
                                                                <img className="h-10 w-10 rounded-full object-cover" src={client.imageUrl} alt="" />
                                                            ) : (
                                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${getColor(client.name)}`}>
                                                                    {getInitials(client.name)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-stone-900">{client.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-stone-500">{client.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {client.whatsapp ? (
                                                        <div className="flex items-center text-sm text-stone-600">
                                                            <WhatsappIcon className="w-4 h-4 text-green-500 mr-2" />
                                                            {client.whatsapp}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-stone-400 italic">Não informado</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button 
                                                        onClick={() => setSelectedClientForHistory(client)} 
                                                        className="text-teal-600 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-md transition-colors inline-flex items-center"
                                                    >
                                                        <ClipboardListIcon /> <span className="ml-2">Ver Histórico</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredClients.length === 0 && <p className="text-stone-500 text-center py-8 bg-white">Nenhum paciente encontrado na busca rápida.</p>}
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
