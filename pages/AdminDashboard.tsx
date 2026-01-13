
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { AdminUser, User, Specialty, ProfessionalUser, Appointment } from '../types';
import { supabase } from '../utils/supabase';
import { QuickBookModal } from '../components/QuickBookModal';
import { ProfessionalCalendar } from '../components/ProfessionalCalendar';
import { DayDetailPanel } from '../components/DayDetailPanel';
import { HEALTH_UNIT_DATA, HEALTH_UNITS } from '../constants';

// Icons
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const BusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const UsersGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const SmallXIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const OfficeBuildingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

// Helper function
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
                    // assignedUnit removed from top level
                    settings: {
                        workHours: { start: '08:00', end: '17:00' }, // Standard UBS hours
                        workDays: [1, 2, 3, 4, 5],
                        blockedDays: [],
                        blockedTimeSlots: {},
                        assignedUnit: assignedUnit, // Added here
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

const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-stone-500 text-sm font-semibold uppercase">{title}</h3>
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

    if (loading) return <p>Carregando estatísticas...</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total de Usuários" value={stats.users} />
            <StatCard title="Profissionais Ativos" value={stats.professionals} />
            <StatCard title="Agendamentos Realizados" value={stats.appointments} />
            <StatCard title="Valor Estimado (Produção)" value={`R$ ${stats.revenue.toFixed(2)}`} />
        </div>
    );
};

const ReportsAnalytics: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(1); 
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [selectedUnit, setSelectedUnit] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: false });

        if (error) console.error("Error fetching report data:", error);
        else setAppointments(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [startDate, endDate]);

    useEffect(() => {
        const channel = supabase
            .channel('reports-appointments')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, (payload) => {
                const newAppt = payload.new as Appointment;
                if (newAppt.date >= startDate && newAppt.date <= endDate) {
                    setAppointments(prev => [newAppt, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                }
                playAlert();
                setAlertMessage(`Novo agendamento: ${newAppt.service_name} para ${newAppt.client_name}`);
                setTimeout(() => setAlertMessage(null), 5000);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'appointments' }, (payload) => {
                 setAppointments(prev => prev.map(a => a.id === payload.new.id ? payload.new as Appointment : a));
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [startDate, endDate]);

    // Filter appointments by selected Unit
    const filteredAppointments = useMemo(() => {
        if (!selectedUnit) return appointments;
        return appointments.filter(appt => appt.healthUnit === selectedUnit);
    }, [appointments, selectedUnit]);

    const metrics = useMemo(() => {
        const data = filteredAppointments;
        const total = data.length;
        const completed = data.filter(a => a.status === 'completed' || a.transportStatus === 'present').length;
        const cancelled = data.filter(a => a.status === 'cancelled').length;
        const noShow = data.filter(a => a.transportStatus === 'absent').length;
        
        const serviceCounts: Record<string, number> = {};
        data.forEach(a => {
            const name = a.service_name.split('(')[0].trim();
            serviceCounts[name] = (serviceCounts[name] || 0) + 1;
        });
        const topServices = Object.entries(serviceCounts).sort(([, a], [, b]) => b - a).slice(0, 5);

        return { total, completed, cancelled, noShow, topServices };
    }, [filteredAppointments]);

    const exportCSV = () => {
        const headers = ["ID", "Data", "Hora", "Paciente", "Profissional", "Serviço", "Local (Unidade)", "Status", "Transporte", "Valor"];
        const rows = filteredAppointments.map(a => [
            a.id, a.date, a.time, `"${a.client_name}"`, `"${a.professional_name}"`, `"${a.service_name}"`, `"${a.healthUnit || 'Não informado'}"`, a.status, a.transportStatus || 'N/A', a.price
        ].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `relatorio_siaga_${selectedUnit ? selectedUnit.replace(/\s+/g, '_') + '_' : ''}${startDate}_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 relative">
            {alertMessage && (
                <div className="fixed top-24 right-6 bg-teal-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 flex items-center animate-bounce">
                    <BellIcon />
                    <span className="ml-3 font-bold">{alertMessage}</span>
                </div>
            )}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                    <h3 className="text-2xl font-bold text-stone-800 flex items-center">
                        <ChartBarIcon /> <span className="ml-2">Relatórios e Inteligência (BI)</span>
                    </h3>
                    <div className="flex flex-col md:flex-row gap-3 items-center w-full xl:w-auto">
                        
                        {/* Filtro de Unidade */}
                        <div className="relative w-full md:w-64">
                            <select 
                                value={selectedUnit} 
                                onChange={e => setSelectedUnit(e.target.value)}
                                className="w-full pl-3 pr-8 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none appearance-none"
                            >
                                <option value="">Todas as Unidades</option>
                                {HEALTH_UNIT_DATA.map(u => (
                                    <option key={u.id} value={u.name}>{u.name}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-stone-500">
                                <OfficeBuildingIcon />
                            </div>
                        </div>

                        {/* Filtro de Data */}
                        <div className="flex items-center gap-2 bg-stone-50 p-1.5 rounded-lg border border-stone-200 w-full md:w-auto">
                            <span className="text-xs font-bold text-stone-500 ml-1">De:</span>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-white border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-teal-500" />
                            <span className="text-xs font-bold text-stone-500">Até:</span>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-white border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-teal-500" />
                        </div>

                        <button onClick={exportCSV} className="flex items-center justify-center bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors shadow-sm text-sm whitespace-nowrap w-full md:w-auto">
                            <DownloadIcon /> CSV
                        </button>
                    </div>
                </div>
                {loading ? <p className="text-center py-10">Carregando dados...</p> : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <p className="text-blue-600 font-bold text-sm uppercase">Total Agendamentos</p>
                                <p className="text-3xl font-extrabold text-blue-800">{metrics.total}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                <p className="text-green-600 font-bold text-sm uppercase">Realizados/Confirmados</p>
                                <p className="text-3xl font-extrabold text-green-800">{metrics.completed}</p>
                                <p className="text-xs text-green-600 mt-1">{metrics.total > 0 ? ((metrics.completed / metrics.total) * 100).toFixed(1) : 0}% taxa de comparecimento</p>
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
                            <div className="bg-stone-50 p-5 rounded-xl border border-stone-200">
                                <h4 className="font-bold text-stone-700 mb-4">Serviços Mais Procurados {selectedUnit ? `em ${selectedUnit}` : ''}</h4>
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
                            <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 flex flex-col">
                                <h4 className="font-bold text-stone-700 mb-4">Auditoria Recente {selectedUnit ? `em ${selectedUnit}` : ''}</h4>
                                <div className="overflow-y-auto flex-grow max-h-60 pr-2 space-y-2">
                                    {filteredAppointments.slice(0, 10).map(appt => (
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
                                    {filteredAppointments.slice(0, 50).map(appt => (
                                        <tr key={appt.id} className="hover:bg-stone-50">
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-stone-900">{new Date(appt.date).toLocaleDateString()} <span className="text-stone-400 text-xs">{appt.time}</span></td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-stone-700 font-medium">{appt.client_name}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-stone-600">
                                                {appt.service_name}
                                                {appt.healthUnit && <div className="text-xs text-teal-600 mt-0.5">{appt.healthUnit}</div>}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-stone-600">{appt.professional_name}</td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appt.status === 'completed' ? 'bg-green-100 text-green-800' : appt.status === 'cancelled' ? 'bg-stone-100 text-stone-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {appt.status === 'upcoming' ? 'Agendado' : appt.status}
                                                </span>
                                                {appt.transportStatus === 'absent' && <span className="ml-1 text-xs text-red-600 font-bold">(Faltou)</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredAppointments.length > 50 && <div className="p-3 text-center text-sm text-stone-500 bg-stone-50 border-t">Mostrando 50 de {filteredAppointments.length} registros. Use "Exportar CSV" para ver tudo.</div>}
                        </div>
                    </>
                )}
            </div>
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

    // Agenda Management State (NEW)
    const [selectedProForAgenda, setSelectedProForAgenda] = useState<ProfessionalUser | null>(null);
    const [appointmentsForAgenda, setAppointmentsForAgenda] = useState<Appointment[]>([]);
    const [selectedDateForAgenda, setSelectedDateForAgenda] = useState<Date | null>(null);

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
    
    // Quick Book Logic (Existing)
    const handleOpenQuickBook = async (user: User) => {
        const today = new Date().toISOString().split('T')[0];
        const professionalUser = user as ProfessionalUser;
        const { data } = await supabase.from('appointments').select('*').eq('professional_id', user.id).eq('date', today);
        setAppointmentsForSelectedPro(data || []);
        setSelectedProForBooking(professionalUser);
    };

    const handleQuickBookSuccess = () => {
        setSelectedProForBooking(null);
    };

    // Agenda Management Logic (NEW)
    const handleOpenAgenda = async (user: User) => {
        const professionalUser = user as ProfessionalUser;
        setSelectedProForAgenda(professionalUser);
        setSelectedDateForAgenda(new Date()); // Start with today/current view
        await fetchAppointmentsForAgenda(professionalUser.id);
    };

    const fetchAppointmentsForAgenda = async (profId: string) => {
        const { data, error } = await supabase.from('appointments').select('*').eq('professional_id', profId);
        if(!error) setAppointmentsForAgenda(data || []);
    };

    // Transform appointments list into Map for Calendar component
    const appointmentsByDate = useMemo(() => {
        const map = new Map<string, Appointment[]>();
        appointmentsForAgenda.forEach(appt => {
            const dateKey = appt.date;
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(appt);
        });
        return map;
    }, [appointmentsForAgenda]);

    const appointmentsForSelectedDate = useMemo(() => {
        if (!selectedDateForAgenda) return [];
        const dateStr = selectedDateForAgenda.toISOString().split('T')[0];
        return appointmentsByDate.get(dateStr) || [];
    }, [selectedDateForAgenda, appointmentsByDate]);

    const handleAppointmentUpdate = useCallback((updatedAppointment: Appointment) => {
        setAppointmentsForAgenda(prev => prev.map(appt => appt.id === updatedAppointment.id ? updatedAppointment : appt));
    }, []);
    
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
                                        onClick={() => handleOpenAgenda(user)}
                                        className="text-white bg-teal-600 hover:bg-teal-700 px-3 py-1 rounded-md text-xs font-bold transition-colors flex items-center"
                                        title="Gerenciar Agenda Completa"
                                    >
                                        <CalendarIcon /> Gerenciar Agenda
                                    </button>
                                    <button 
                                        onClick={() => handleOpenQuickBook(user)}
                                        className="text-teal-600 hover:text-teal-800 p-1 rounded-md hover:bg-teal-50 transition-colors"
                                        title="Agendamento Rápido"
                                    >
                                        <PlusIcon />
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
            
            {/* Modals */}
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

            {/* FULL AGENDA MANAGEMENT MODAL FOR ADMIN */}
            {selectedProForAgenda && (
                <div className="fixed inset-0 bg-stone-900/80 z-[60] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
                    <div className="bg-stone-100 w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="bg-white p-4 border-b border-stone-200 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-stone-800">Gerenciando Agenda: {selectedProForAgenda.name}</h2>
                                <p className="text-sm text-stone-500">Acesso Administrativo Total</p>
                            </div>
                            <button onClick={() => setSelectedProForAgenda(null)} className="text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 p-2 rounded-full transition-colors">
                                <XIcon />
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto p-6">
                            <div className="flex flex-col lg:flex-row gap-6 h-full">
                                <div className="flex-grow">
                                    <ProfessionalCalendar 
                                        appointmentsByDate={appointmentsByDate}
                                        onDateSelect={setSelectedDateForAgenda}
                                        settings={selectedProForAgenda.settings}
                                    />
                                </div>
                                {selectedDateForAgenda && (
                                    <DayDetailPanel 
                                        selectedDate={selectedDateForAgenda}
                                        appointments={appointmentsForSelectedDate}
                                        settings={selectedProForAgenda.settings}
                                        professionalName={selectedProForAgenda.name}
                                        onClose={() => setSelectedDateForAgenda(null)}
                                        onAppointmentUpdate={handleAppointmentUpdate}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
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

export const AdminDashboard: React.FC<{ user: AdminUser }> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'professionals' | 'reports'>('overview');

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-stone-800">Painel Administrativo</h1>
                <p className="text-stone-500 mt-2 text-lg">Bem-vindo(a), {user.name.split(' ')[0]}! Gestão global do sistema.</p>
            </div>

            <div className="border-b border-stone-200 flex items-center mb-6">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center px-6 py-3 font-semibold transition-colors ${activeTab === 'overview' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-stone-500 hover:text-stone-800'}`}
                >
                    <ChartBarIcon /> <span className="ml-2">Visão Geral</span>
                </button>
                <button 
                    onClick={() => setActiveTab('professionals')}
                    className={`flex items-center px-6 py-3 font-semibold transition-colors ${activeTab === 'professionals' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-stone-500 hover:text-stone-800'}`}
                >
                    <UsersIcon /> <span className="ml-2">Profissionais</span>
                </button>
                <button 
                    onClick={() => setActiveTab('reports')}
                    className={`flex items-center px-6 py-3 font-semibold transition-colors ${activeTab === 'reports' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-stone-500 hover:text-stone-800'}`}
                >
                    <ClipboardListIcon /> <span className="ml-2">Relatórios BI</span>
                </button>
            </div>

            {activeTab === 'overview' && <DashboardOverview />}
            {activeTab === 'professionals' && <ProfessionalManagement />}
            {activeTab === 'reports' && <ReportsAnalytics />}
        </div>
    );
};
