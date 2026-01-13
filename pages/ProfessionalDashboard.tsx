
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { ProfessionalUser, Appointment, Service, Specialty } from '../types';
import { supabase, getInitials, getColor } from '../utils/supabase';
import { ProfessionalCalendar } from '../components/ProfessionalCalendar';
import { QuickBookModal } from '../components/QuickBookModal';
import { DayDetailPanel } from '../components/DayDetailPanel';
import { AppointmentHistory } from '../components/AppointmentHistory';

export interface ProfessionalDashboardProps {
    user: ProfessionalUser;
    onProfileUpdate: (updatedFields: Partial<ProfessionalUser>) => void;
}

// Icons
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const CogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const ClipboardListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 00-2-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
);
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const ArchiveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
);
const PlusCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);
const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
);
const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 00-2-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
    </svg>
);
const ChartBarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const ServiceEditor: React.FC<{ services: Service[]; userId: string; onServicesUpdate: (services: Service[]) => void; }> = ({ services, userId, onServicesUpdate }) => {
    const [localServices, setLocalServices] = useState(services || []);
    const [newServiceName, setNewServiceName] = useState('');
    const [newServicePrice, setNewServicePrice] = useState('');
    const [newServiceDuration, setNewServiceDuration] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleServiceChange = (index: number, field: keyof Service, value: any) => {
        const updatedServices = [...localServices];
        (updatedServices[index] as any)[field] = field === 'price' || field === 'duration' ? Number(value) : value;
        setLocalServices(updatedServices);
    };

    const handleRemoveService = (indexToRemove: number) => {
        if (window.confirm('Tem certeza que deseja remover este serviço? Esta ação não pode ser desfeita.')) {
            setLocalServices(prev => prev.filter((_, index) => index !== indexToRemove));
        }
    };

    const handleAddNewService = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newServiceName || !newServicePrice || !newServiceDuration) {
            alert("Por favor, preencha todos os campos do novo serviço.");
            return;
        }

        const newService: Service = {
            id: crypto.randomUUID(),
            name: newServiceName,
            price: Number(newServicePrice),
            duration: Number(newServiceDuration),
        };

        setLocalServices([...localServices, newService]);

        // Reset form fields
        setNewServiceName('');
        setNewServicePrice('');
        setNewServiceDuration('');
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        const { error } = await supabase
            .from('profiles')
            .update({ services: localServices })
            .eq('id', userId);
        
        setIsSaving(false);
        if (error) {
            alert("Erro ao salvar alterações.");
            console.error(error);
        } else {
            alert("Serviços atualizados com sucesso!");
            onServicesUpdate(localServices);
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-2xl font-bold text-stone-800 mb-4">Meus Serviços</h3>
            
            {localServices.length === 0 ? (
                <div className="text-center bg-stone-50 p-6 rounded-lg mb-6 border border-stone-200">
                    <p className="text-stone-600 font-medium">Você ainda não cadastrou nenhum serviço.</p>
                    <p className="text-stone-500 text-sm mt-1">Use o formulário abaixo para adicionar seu primeiro serviço e começar a receber agendamentos.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {localServices.map((service, index) => (
                        <div key={service.id || index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border rounded-lg bg-stone-50">
                            <div className="md:col-span-2">
                                <label className="text-xs font-medium text-stone-500">Nome do Serviço</label>
                                <input type="text" value={service.name} onChange={(e) => handleServiceChange(index, 'name', e.target.value)} className="mt-1 w-full p-2 border rounded-md border-stone-300" placeholder="Nome do Serviço" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-stone-500">Valor (R$)</label>
                                <input type="number" value={service.price} onChange={(e) => handleServiceChange(index, 'price', e.target.value)} className="mt-1 w-full p-2 border rounded-md border-stone-300" placeholder="Preço" />
                            </div>
                            <div className="flex items-end gap-2">
                                <div className="flex-grow">
                                    <label className="text-xs font-medium text-stone-500">Duração (min)</label>
                                    <input type="number" value={service.duration} onChange={(e) => handleServiceChange(index, 'duration', e.target.value)} className="mt-1 w-full p-2 border rounded-md border-stone-300" placeholder="Duração" />
                                </div>
                                <button onClick={() => handleRemoveService(index)} className="h-10 text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 flex justify-center items-center" aria-label="Remover serviço">
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            <div className="mt-8 border-t pt-6">
                <h4 className="text-xl font-bold text-stone-700 mb-3">Adicionar Novo Serviço</h4>
                <form onSubmit={handleAddNewService} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 bg-stone-50 border rounded-lg">
                     <div className="md:col-span-2">
                        <label htmlFor="new-service-name" className="text-sm font-medium text-stone-600">Nome do Serviço</label>
                        <input id="new-service-name" type="text" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} className="mt-1 w-full p-2 border rounded-md border-stone-300" placeholder="Ex: Atendimento Geral" />
                    </div>
                    <div>
                        <label htmlFor="new-service-price" className="text-sm font-medium text-stone-600">Valor (R$)</label>
                        <input id="new-service-price" type="number" value={newServicePrice} onChange={(e) => setNewServicePrice(e.target.value)} className="mt-1 w-full p-2 border rounded-md border-stone-300" placeholder="Ex: 0" />
                    </div>
                    <div className="flex items-end gap-2">
                         <div className="flex-grow">
                             <label htmlFor="new-service-duration" className="text-sm font-medium text-stone-600">Duração (min)</label>
                            <input id="new-service-duration" type="number" value={newServiceDuration} onChange={(e) => setNewServiceDuration(e.target.value)} className="mt-1 w-full p-2 border rounded-md border-stone-300" placeholder="Ex: 60" />
                        </div>
                        <button type="submit" className="h-10 bg-stone-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-stone-800 transition-colors">Adicionar</button>
                    </div>
                </form>
            </div>

            <div className="mt-8 pt-6 border-t flex justify-end">
                <button onClick={handleSaveChanges} disabled={isSaving} className="bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSaving ? 'Salvando...' : 'Salvar Alterações nos Serviços'}
                </button>
            </div>
        </div>
    );
};


const AvailabilityManager: React.FC<{ 
    user: ProfessionalUser,
    appointmentsByDate: Map<string, Appointment[]>,
    onSettingsUpdate: (settings: ProfessionalUser['settings']) => void;
}> = ({ user, appointmentsByDate, onSettingsUpdate }) => {
    const [localSettings, setLocalSettings] = useState<ProfessionalUser['settings']>(user.settings);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const isToday = (day: Date) => {
        const today = new Date();
        return day.getDate() === today.getDate() && day.getMonth() === today.getMonth() && day.getFullYear() === today.getFullYear();
    }
    
    // Calendar logic
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDay = firstDayOfMonth.getDay();

    const calendarDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < startingDay; i++) { days.push(null); }
        for (let i = 1; i <= daysInMonth; i++) { days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i)); }
        return days;
    }, [currentMonth, daysInMonth, startingDay]);
    
    // Time slots for selected day
    const timeSlots = useMemo(() => {
        const slots = [];
        const { workHours } = localSettings;
        if (!workHours) return [];
        const start = parseInt(workHours.start.split(':')[0]);
        const end = parseInt(workHours.end.split(':')[0]);
        for (let i = start; i < end; i++) {
            slots.push(`${String(i).padStart(2, '0')}:00`);
            slots.push(`${String(i).padStart(2, '0')}:30`);
        }
        return slots;
    }, [localSettings.workHours]);

    const getAppointmentForSlot = (time: string) => {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const appointmentsForDay = appointmentsByDate.get(dateStr) || [];
        return appointmentsForDay.find(a => a.time.startsWith(time.substring(0, 5)));
    };

    // Handlers
    const toggleBlockDay = (day: Date) => {
        const dateStr = day.toISOString().split('T')[0];
        const newBlockedDays = localSettings.blockedDays.includes(dateStr)
            ? localSettings.blockedDays.filter(d => d !== dateStr)
            : [...localSettings.blockedDays, dateStr];
        setLocalSettings({ ...localSettings, blockedDays: newBlockedDays });
    };

    const toggleBlockTimeSlot = (time: string) => {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const blockedSlotsForDay = localSettings.blockedTimeSlots?.[dateStr] || [];
        const isBlocked = blockedSlotsForDay.includes(time);
        
        const newBlockedSlotsForDay = isBlocked
            ? blockedSlotsForDay.filter(t => t !== time)
            : [...blockedSlotsForDay, time];

        setLocalSettings({
            ...localSettings,
            blockedTimeSlots: {
                ...localSettings.blockedTimeSlots,
                [dateStr]: newBlockedSlotsForDay
            }
        });
    };
    
     const handleSaveChanges = async () => {
        const { error } = await supabase
            .from('profiles')
            .update({ settings: localSettings })
            .eq('id', user.id);
        
        if (error) {
            alert("Erro ao salvar alterações.");
            console.error(error);
        } else {
            alert("Disponibilidade atualizada com sucesso!");
            onSettingsUpdate(localSettings);
        }
    };

    const isDayBlocked = localSettings.blockedDays.includes(selectedDate.toISOString().split('T')[0]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-2xl font-bold text-stone-800 mb-4">Gerenciar Disponibilidade</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calendar View */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 rounded-full hover:bg-stone-100">&lt;</button>
                        <h2 className="text-xl font-bold text-stone-800">{currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}</h2>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 rounded-full hover:bg-stone-100">&gt;</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm font-semibold text-stone-500 mb-2">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                            if (!day) return <div key={`empty-${index}`} className="border rounded-lg h-20"></div>;
                            const dateStr = day.toISOString().split('T')[0];
                            const isBlocked = localSettings.blockedDays.includes(dateStr);
                            const isSelected = day.toDateString() === selectedDate.toDateString();
                            return (
                                <div key={dateStr} onClick={() => setSelectedDate(day)} className={`border rounded-lg h-20 p-2 text-left cursor-pointer ${isSelected ? 'bg-teal-600 text-white' : isBlocked ? 'bg-stone-200 text-stone-500' : 'bg-white hover:bg-teal-50'}`}>
                                    <span className={`font-semibold ${isToday(day) && !isSelected ? 'text-teal-600' : ''}`}>{day.getDate()}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Time Slot View for Selected Day */}
                <div>
                    <h4 className="text-xl font-bold text-stone-700 mb-3">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
                     <button onClick={() => toggleBlockDay(selectedDate)} className={`w-full py-2 px-4 rounded-lg transition-colors mb-4 ${isDayBlocked ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isDayBlocked ? 'Desbloquear este dia' : 'Bloquear dia inteiro'}
                    </button>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                         {isDayBlocked ? (
                            <p className="text-center text-stone-500 p-4 bg-stone-50 rounded-lg">Este dia está bloqueado.</p>
                        ) : timeSlots.map(time => {
                            const appointment = getAppointmentForSlot(time);
                            const isBlocked = localSettings.blockedTimeSlots?.[selectedDate.toISOString().split('T')[0]]?.includes(time);

                            if (appointment) {
                                return <div key={time} className="p-2 rounded bg-teal-50 text-teal-700"><strong>{time}</strong> - Agendado com {appointment.client_name}</div>
                            }

                            return (
                                <div key={time} className="flex justify-between items-center p-2 rounded bg-white hover:bg-stone-50">
                                    <span className={isBlocked ? 'text-stone-400 line-through' : 'text-stone-700'}>{time}</span>
                                    <button onClick={() => toggleBlockTimeSlot(time)} className={`text-xs font-semibold py-1 px-2 rounded ${isBlocked ? 'bg-stone-200 text-stone-600' : 'bg-stone-100 text-stone-500'}`}>
                                        {isBlocked ? 'Desbloquear' : 'Bloquear'}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            <button onClick={handleSaveChanges} className="mt-8 bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors">Salvar Alterações</button>
        </div>
    );
};

const ProfileSettings: React.FC<{
    user: ProfessionalUser;
    onProfileUpdate: (updatedFields: Partial<ProfessionalUser>) => void;
}> = ({ user, onProfileUpdate }) => {
    const [uploading, setUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(user.imageUrl);
    const [profileData, setProfileData] = useState({
        name: user.name,
        specialties: user.specialties || [],
        whatsapp: user.whatsapp || '',
    });
    const [newSpecialtyName, setNewSpecialtyName] = useState('');
    const [newSpecialtyPrice, setNewSpecialtyPrice] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    // Generated public link
    const publicLink = `${window.location.origin}/?ref=${user.id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(publicLink).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const handleShareWhatsapp = () => {
        const text = `Olá! Agende seu horário comigo através deste link: ${publicLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSpecialty = () => {
        if (newSpecialtyName.trim() && newSpecialtyPrice) {
            setProfileData(prev => ({
                ...prev,
                specialties: [...prev.specialties, { name: newSpecialtyName.trim(), price: Number(newSpecialtyPrice) }]
            }));
            setNewSpecialtyName('');
            setNewSpecialtyPrice('');
        } else {
             alert('Por favor, preencha o nome e o preço da especialidade.');
        }
    };
    
    const removeSpecialty = (indexToRemove: number) => {
        setProfileData(prev => ({
            ...prev,
            specialties: prev.specialties.filter((_, index) => index !== indexToRemove)
        }));
    };


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

    const handleUpload = async () => {
        if (!avatarFile) return;

        setUploading(true);
        try {
            const fileExt = avatarFile.name.split('.').pop();
            const filePath = `${user.id}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);
            
            if (!urlData.publicUrl) throw new Error("URL pública não encontrada.");
            
            const newImageUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ image_url: newImageUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;
            
            onProfileUpdate({ imageUrl: newImageUrl });
            alert("Foto de perfil atualizada!");
        } catch (error: any) {
            console.error("Erro ao atualizar a foto:", error);
            alert(`Erro: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };
    
    const handleProfileDetailsSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (profileData.specialties.length === 0) {
            alert('Por favor, adicione ao menos uma especialidade.');
            return;
        }

        setIsSaving(true);
        
        // First, handle photo upload if a new one is selected
        if (avatarFile) {
            await handleUpload();
        }

        // Then, update the rest of the profile data
        const { error } = await supabase
            .from('profiles')
            .update({
                name: profileData.name,
                specialty: profileData.specialties,
                whatsapp: profileData.whatsapp,
            })
            .eq('id', user.id);

        if (error) {
            alert('Erro ao salvar as alterações do perfil.');
            console.error(error);
        } else {
            alert('Perfil atualizado com sucesso!');
            onProfileUpdate(profileData);
        }
        setIsSaving(false);
    };

    const hasValidImage = previewUrl && (previewUrl.startsWith('http') || previewUrl.startsWith('blob'));

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            {/* Share Section */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-4">
                    <ShareIcon />
                    <h3 className="text-xl font-bold text-teal-800">Compartilhar meu Perfil</h3>
                </div>
                <p className="text-teal-700 mb-4 text-sm">
                    Envie este link para seus clientes para que eles possam agendar diretamente com você.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-grow relative">
                        <input 
                            type="text" 
                            readOnly 
                            value={publicLink} 
                            className="w-full pl-4 pr-4 py-2 border border-teal-300 rounded-lg bg-white text-stone-600 focus:outline-none" 
                        />
                    </div>
                    <button 
                        onClick={handleCopyLink}
                        className="flex items-center justify-center bg-white border border-teal-300 text-teal-600 font-semibold px-4 py-2 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                        <span className="mr-2"><CopyIcon /></span>
                        {copySuccess ? 'Copiado!' : 'Copiar'}
                    </button>
                    <button 
                        onClick={handleShareWhatsapp}
                        className="flex items-center justify-center bg-green-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                        WhatsApp
                    </button>
                </div>
            </div>

            <h3 className="text-2xl font-bold text-stone-800 mb-6">Configurações do Perfil</h3>
            <form onSubmit={handleProfileDetailsSave}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Avatar Section */}
                    <div className="md:col-span-1 flex flex-col items-center text-center">
                        {hasValidImage ? (
                            <img src={previewUrl} alt="Pré-visualização do perfil" className="w-40 h-40 rounded-full object-cover border-4 border-stone-200 mb-4" />
                        ) : (
                             <div className={`w-40 h-40 rounded-full flex items-center justify-center text-white font-bold ${getColor(user.name)} border-4 border-stone-200 mb-4`}>
                                <span className="text-5xl">{getInitials(user.name)}</span>
                            </div>
                        )}
                        <label className="cursor-pointer bg-stone-100 text-stone-700 font-semibold py-2 px-4 rounded-lg hover:bg-stone-200 transition-colors w-full">
                            <span>Escolher arquivo...</span>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                        <p className="text-xs text-stone-500 mt-2">Max 2MB. JPG, PNG.</p>
                        {avatarFile && <p className="text-xs text-stone-600 mt-1 font-semibold truncate w-full px-2">Arquivo: {avatarFile.name}</p>}
                    </div>

                    {/* Profile Details Form Section */}
                    <div className="md:col-span-2">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-stone-600 mb-1">Nome Completo</label>
                                <input id="name" name="name" type="text" value={profileData.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300" />
                            </div>
                           <div>
                                <label className="block text-sm font-medium text-stone-600 mb-1">Especialidades</label>
                                <div className="border rounded-lg p-2 space-y-2">
                                    {profileData.specialties.map((spec, index) => (
                                        <div key={index} className="flex items-center justify-between bg-stone-100 p-2 rounded-lg text-sm">
                                            <span>{spec.name} - R$ {spec.price.toFixed(2)}</span>
                                            <button type="button" onClick={() => removeSpecialty(index)} className="ml-2 text-red-500 hover:text-red-700 font-bold">&times;</button>
                                        </div>
                                    ))}
                                    <div className="flex items-end gap-2 border-t pt-2">
                                        <div className="flex-grow">
                                            <input 
                                                type="text" 
                                                value={newSpecialtyName} 
                                                onChange={e => setNewSpecialtyName(e.target.value)}
                                                className="w-full px-2 py-1 border rounded-lg text-sm"
                                                placeholder="Nome da Especialidade"
                                            />
                                        </div>
                                        <div className="w-24">
                                            <input 
                                                type="number" 
                                                value={newSpecialtyPrice} 
                                                onChange={e => setNewSpecialtyPrice(e.target.value)}
                                                className="w-full px-2 py-1 border rounded-lg text-sm"
                                                placeholder="Preço"
                                                step="0.01"
                                            />
                                        </div>
                                        <button type="button" onClick={handleAddSpecialty} className="h-9 bg-stone-700 text-white font-semibold px-3 rounded-lg hover:bg-stone-800 text-sm">Add</button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="whatsapp" className="block text-sm font-medium text-stone-600 mb-1">WhatsApp</label>
                                <input id="whatsapp" name="whatsapp" type="tel" value={profileData.whatsapp} onChange={handleInputChange} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300" placeholder="(XX) XXXXX-XXXX" />
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="mt-8 pt-6 border-t flex justify-end">
                     <button 
                        type="submit"
                        disabled={isSaving || uploading}
                        className="bg-teal-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSaving || uploading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const ProfessionalReports: React.FC<{
    appointments: Appointment[];
}> = ({ appointments }) => {
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(1); // 1st of current month
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    const filteredAppointments = useMemo(() => {
        return appointments.filter(a => a.date >= startDate && a.date <= endDate);
    }, [appointments, startDate, endDate]);

    const metrics = useMemo(() => {
        const total = filteredAppointments.length;
        const completed = filteredAppointments.filter(a => a.status === 'completed').length;
        const cancelled = filteredAppointments.filter(a => a.status === 'cancelled').length;
        const revenue = filteredAppointments.reduce((acc, curr) => acc + (curr.status !== 'cancelled' ? curr.price : 0), 0);
        return { total, completed, cancelled, revenue };
    }, [filteredAppointments]);

    const exportCSV = () => {
        const headers = ["Data", "Hora", "Paciente", "Serviço", "Status", "Valor", "Observações"];
        const rows = filteredAppointments.map(a => [
            a.date,
            a.time,
            `"${a.client_name}"`,
            `"${a.service_name}"`,
            a.status,
            a.price,
            `"${a.notes || ''}"`
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `relatorio_atendimentos_${startDate}_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="text-2xl font-bold text-stone-800 flex items-center">
                        <ChartBarIcon /> <span className="ml-2">Relatórios de Desempenho</span>
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

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="text-blue-600 font-bold text-sm uppercase">Total Agendamentos</p>
                        <p className="text-3xl font-extrabold text-blue-800">{metrics.total}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <p className="text-green-600 font-bold text-sm uppercase">Atendimentos Realizados</p>
                        <p className="text-3xl font-extrabold text-green-800">{metrics.completed}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <p className="text-red-600 font-bold text-sm uppercase">Cancelamentos</p>
                        <p className="text-3xl font-extrabold text-red-800">{metrics.cancelled}</p>
                    </div>
                    <div className="bg-stone-100 p-4 rounded-lg border border-stone-200">
                        <p className="text-stone-600 font-bold text-sm uppercase">Produção Estimada</p>
                        <p className="text-3xl font-extrabold text-stone-800">R$ {metrics.revenue.toFixed(2)}</p>
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
                                <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-stone-500 uppercase">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-stone-200">
                            {filteredAppointments.length > 0 ? filteredAppointments.map(appt => (
                                <tr key={appt.id} className="hover:bg-stone-50">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-stone-900">{new Date(appt.date).toLocaleDateString()} <span className="text-stone-400 text-xs">{appt.time}</span></td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-stone-700 font-medium">{appt.client_name}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-stone-600">{appt.service_name}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            appt.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                            appt.status === 'cancelled' ? 'bg-stone-100 text-stone-800' : 
                                            'bg-blue-100 text-blue-800'}`}>
                                            {appt.status === 'upcoming' ? 'Agendado' : appt.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-stone-600">R$ {appt.price.toFixed(2)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-stone-500">Nenhum registro encontrado para este período.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


type Tab = 'agenda' | 'history' | 'services' | 'availability' | 'settings' | 'reports';

export const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({ user, onProfileUpdate }) => {
    const [activeTab, setActiveTab] = useState<Tab>('agenda');
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [localUser, setLocalUser] = useState(user);
    const [isQuickBookModalOpen, setIsQuickBookModalOpen] = useState(false);

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('professional_id', user.id);
        
        if (error) {
            console.error("Error fetching appointments:", error);
        } else {
            setAppointments(data || []);
        }
        setLoading(false);
    }, [user.id]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const appointmentsByDate = useMemo(() => {
        const map = new Map<string, Appointment[]>();
        appointments.forEach(appt => {
            const dateKey = appt.date;
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(appt);
        });
        return map;
    }, [appointments]);

    const handleDateSelect = useCallback((date: Date) => {
        setSelectedDate(date);
    }, []);
    
    const handleAppointmentCreated = useCallback(() => {
        fetchAppointments();
    }, [fetchAppointments]);
    
    const handleAppointmentUpdate = useCallback((updatedAppointment: Appointment) => {
        setAppointments(prev => prev.map(appt => appt.id === updatedAppointment.id ? updatedAppointment : appt));
    }, []);

    const appointmentsForSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        const dateStr = selectedDate.toISOString().split('T')[0];
        return appointmentsByDate.get(dateStr) || [];
    }, [selectedDate, appointmentsByDate]);
    
    const handleServicesUpdate = (updatedServices: Service[]) => {
        const updatedFields = { services: updatedServices };
        setLocalUser(prevUser => ({ ...prevUser, ...updatedFields }));
        onProfileUpdate(updatedFields);
    };

    const handleSettingsUpdate = (updatedSettings: ProfessionalUser['settings']) => {
        const updatedFields = { settings: updatedSettings };
        setLocalUser(prevUser => ({ ...prevUser, ...updatedFields }));
        onProfileUpdate(updatedFields);
    };

    const handleLocalProfileUpdate = (updatedFields: Partial<ProfessionalUser>) => {
        setLocalUser(prev => ({ ...prev, ...updatedFields }));
        onProfileUpdate(updatedFields);
    };

    const TabButton: React.FC<{ tabName: Tab; label: string; icon: React.ReactNode; }> = ({ tabName, label, icon }) => (
         <button onClick={() => setActiveTab(tabName)} className={`flex items-center px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${activeTab === tabName ? 'bg-white text-teal-600 border-b-0' : 'bg-transparent text-stone-600 hover:bg-white/50'}`}>
            {icon}
            {label}
        </button>
    );

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-stone-800">Painel do Profissional</h1>
                <p className="text-stone-500 mt-2 text-lg">Bem-vindo(a), {user.name.split(' ')[0]}! Gerencie sua agenda aqui.</p>
            </div>
            
            <div className="border-b border-stone-200 flex items-center mb-6 flex-wrap">
                <TabButton tabName="agenda" label="Agenda" icon={<CalendarIcon />} />
                <TabButton tabName="history" label="Histórico" icon={<ArchiveIcon />} />
                <TabButton tabName="reports" label="Relatórios" icon={<ChartBarIcon />} />
                <TabButton tabName="services" label="Meus Serviços" icon={<ClipboardListIcon />} />
                <TabButton tabName="availability" label="Disponibilidade" icon={<CogIcon />} />
                <TabButton tabName="settings" label="Configurações" icon={<UserIcon />} />
            </div>

            <div id="tab-content">
                {loading && <p>Carregando...</p>}
                {!loading && activeTab === 'agenda' && (
                    <>
                         <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 mb-6 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-stone-700">Gestão da Agenda</h3>
                                <p className="text-xs text-stone-500">Ações rápidas para o dia a dia.</p>
                            </div>
                            <button 
                                onClick={() => setIsQuickBookModalOpen(true)}
                                className="flex items-center bg-teal-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-700 transition-transform duration-300 hover:scale-105 shadow-md"
                            >
                                <PlusCircleIcon />
                                Agendamento Rápido
                            </button>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-6">
                           <div className="flex-grow">
                                <ProfessionalCalendar 
                                    appointmentsByDate={appointmentsByDate}
                                    onDateSelect={handleDateSelect}
                                    settings={localUser.settings}
                                />
                           </div>
                            {selectedDate && (
                                <DayDetailPanel 
                                    selectedDate={selectedDate}
                                    appointments={appointmentsForSelectedDate}
                                    settings={localUser.settings}
                                    professionalName={localUser.name} // Pass name for PDF
                                    onClose={() => setSelectedDate(null)}
                                    onAppointmentUpdate={handleAppointmentUpdate}
                                />
                            )}
                        </div>
                    </>
                )}
                {activeTab === 'history' && <AppointmentHistory appointments={appointments} onUpdate={handleAppointmentUpdate} />}
                {activeTab === 'reports' && <ProfessionalReports appointments={appointments} />}
                {activeTab === 'services' && <ServiceEditor services={localUser.services} userId={user.id} onServicesUpdate={handleServicesUpdate} />}
                {activeTab === 'availability' && <AvailabilityManager user={localUser} appointmentsByDate={appointmentsByDate} onSettingsUpdate={handleSettingsUpdate} />}
                {activeTab === 'settings' && <ProfileSettings user={localUser} onProfileUpdate={handleLocalProfileUpdate} />}
            </div>
             {isQuickBookModalOpen && (
                <QuickBookModal
                    user={localUser}
                    appointmentsForToday={appointmentsByDate.get(new Date().toISOString().split('T')[0]) || []}
                    onClose={() => setIsQuickBookModalOpen(false)}
                    onBookingSuccess={() => {
                        setIsQuickBookModalOpen(false);
                        handleAppointmentCreated();
                    }}
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
                @keyframes fade-in-right {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-fade-in-right {
                    animation: fade-in-right 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
