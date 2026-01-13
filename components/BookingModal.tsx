
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Professional, Service, User, ProfessionalUser, Appointment, ProfessionalSettings, Specialty, WorkSchedule } from '../types';
import { supabase } from '../utils/supabase';
import { medicalServices, dentalServices, nursingServices, examServices, DEFAULT_TRANSPORT_CAPACITY, HEALTH_UNITS, EXTERNAL_FACILITIES } from '../constants';

interface BookingModalProps {
    professional?: Professional | null;
    category?: string | null;
    user: User | ProfessionalUser;
    onClose: () => void;
}

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-teal-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const BadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>;
const BusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ExclamationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const WhatsappIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>;

const servicesByCategory: { [key: string]: Service[] } = {
    'Consultas Médicas': medicalServices,
    'Odontologia': dentalServices,
    'Enfermagem e Vacinas': nursingServices,
    'Exames e Procedimentos': examServices,
};

// Helper for local date string YYYY-MM-DD
const getLocalDateStr = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const generateTimeSlots = (
    date: Date, 
    settings: ProfessionalSettings, 
    professionalAppointments: Pick<Appointment, 'time'>[]
): { time: string; unitName?: string }[] => {
    
    // Check if there are multiple schedules or just legacy single schedule
    const schedules = settings.schedule || [];
    // If no schedule array, fallback to legacy checks (or return empty if legacy logic removed)
    // Assuming for now if schedule array is empty we rely on legacy props if they exist, or fail gracefully.
    
    // Logic: Find all schedules active for this day
    const dayOfWeek = date.getDay();
    const dateStr = getLocalDateStr(date);
    
    if (settings.blockedDays.includes(dateStr)) return [];

    let activeSchedules: WorkSchedule[] = [];

    if (schedules.length > 0) {
        activeSchedules = schedules.filter(s => s.workDays.includes(dayOfWeek));
    } else if (settings.workDays && settings.workHours) {
        // Fallback to legacy single schedule
        if (settings.workDays.includes(dayOfWeek)) {
            activeSchedules.push({
                unitId: 'legacy',
                unitName: settings.assignedUnit || 'Unidade Padrão',
                workDays: settings.workDays,
                start: settings.workHours.start,
                end: settings.workHours.end
            });
        }
    }

    if (activeSchedules.length === 0) return [];

    const slots: { time: string; unitName?: string }[] = [];
    const bookedTimes = professionalAppointments.map(a => a.time.substring(0, 5));
    const blockedSlotsForDay = settings.blockedTimeSlots?.[dateStr] || [];
    
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    // Generate slots for each active schedule on this day
    activeSchedules.forEach(schedule => {
        const startHour = parseInt(schedule.start.split(':')[0]);
        const endHour = parseInt(schedule.end.split(':')[0]);
        // Default lunch break hardcoded or from legacy if available, can be improved to be per-schedule
        const lunchStart = 12; 
        const lunchEnd = 13;

        for (let h = startHour; h < endHour; h++) {
            for (let m = 0; m < 60; m += 30) {
                if (h >= lunchStart && h < lunchEnd) continue;

                if (isToday && (h < now.getHours() || (h === now.getHours() && m < now.getMinutes()))) {
                    continue;
                }
                const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                
                // Avoid duplicates if ranges overlap (simple check)
                if (!slots.some(s => s.time === time) && !bookedTimes.includes(time) && !blockedSlotsForDay.includes(time)) {
                    slots.push({ time, unitName: schedule.unitName });
                }
            }
        }
    });

    return slots.sort((a, b) => a.time.localeCompare(b.time));
};

export const BookingModal: React.FC<BookingModalProps> = ({ professional, category, user, onClose }) => {
    const isServiceLedFlow = !professional;

    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(professional || null);
    const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null); // New state for Health Unit
    const [externalProfessionalName, setExternalProfessionalName] = useState(''); // Only for external
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Transport Logic
    const [hasCompanion, setHasCompanion] = useState(false);
    const [checkingCapacity, setCheckingCapacity] = useState(false);
    
    // Used for the initial step in Service-Led flow
    const [categoryProfessionals, setCategoryProfessionals] = useState<Professional[]>([]);
    const [loadingCategoryPros, setLoadingCategoryPros] = useState(false);
    
    const [timeSlots, setTimeSlots] = useState<{ time: string; unitName?: string }[]>([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [justSelectedTime, setJustSelectedTime] = useState<string | null>(null);

    // Auto-select specialty if the professional has only one
    useEffect(() => {
        if (selectedProfessional && selectedProfessional.specialties && selectedProfessional.specialties.length === 1) {
            setSelectedSpecialty(selectedProfessional.specialties[0]);
        } else if (selectedProfessional && (!selectedProfessional.specialties || selectedProfessional.specialties.length === 0)) {
            setSelectedSpecialty(null); 
        } else if (!selectedProfessional) {
            setSelectedSpecialty(null);
        }
    }, [selectedProfessional]);

    // Fetch professionals for the selected category (Service-Led Flow Step 1)
    useEffect(() => {
        if (isServiceLedFlow && category) {
            const fetchCategoryPros = async () => {
                setLoadingCategoryPros(true);
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, name, specialties:specialty, imageUrl:image_url, services, settings')
                    .eq('role', 'professional');

                if (error) {
                    console.error("Error fetching professionals for category:", error);
                    setError("Não foi possível carregar os servidores.");
                } else if (data) {
                    const categoryServices = servicesByCategory[category] || [];
                    const filtered = data.filter((p: any) => 
                        (p.services || []).some((s: Service) => categoryServices.some(cs => cs.name === s.name)) || 
                        (p.services || []).length === 0 
                    );
                    setCategoryProfessionals(filtered as Professional[]);
                }
                setLoadingCategoryPros(false);
            };
            fetchCategoryPros();
        }
    }, [isServiceLedFlow, category]);

    // Fetch availability when professional and date are selected
    useEffect(() => {
        if (selectedProfessional?.settings && selectedDate) {
            const fetchAvailability = async () => {
                setLoadingAvailability(true);
                setSelectedTime(null);
                setSelectedUnit(null); // Reset unit on date change, will be set by time slot
                
                const dateStr = getLocalDateStr(selectedDate);
                const { data, error } = await supabase
                    .from('appointments')
                    .select('time')
                    .eq('professional_id', selectedProfessional.id)
                    .eq('date', dateStr)
                    .neq('status', 'cancelled');

                if (error) {
                    console.error("Error fetching appointments for availability:", error);
                    setTimeSlots([]);
                } else {
                    const slots = generateTimeSlots(selectedDate, selectedProfessional.settings!, data || []);
                    setTimeSlots(slots);
                }
                setLoadingAvailability(false);
            };
            fetchAvailability();
        }
    }, [selectedProfessional, selectedDate]);
    
    // When a time is selected, automatically set the Unit based on that slot's schedule
    const handleTimeSelection = (time: string, unitName?: string) => {
        setSelectedTime(time);
        setJustSelectedTime(time);
        if (unitName) {
            setSelectedUnit(unitName);
        } else if (selectedProfessional?.settings?.assignedUnit) {
            setSelectedUnit(selectedProfessional.settings.assignedUnit);
        }
        setTimeout(() => setJustSelectedTime(null), 300);
    };

    const checkTransportCapacity = async (dateStr: string): Promise<boolean> => {
        if (selectedService?.locationType !== 'external') return true;

        setCheckingCapacity(true);
        const { data: externalAppointments, error } = await supabase
            .from('appointments')
            .select('hasCompanion')
            .eq('date', dateStr)
            .eq('locationType', 'external')
            .neq('status', 'cancelled');

        setCheckingCapacity(false);

        if (error) {
            console.error("Error checking transport capacity:", error);
            setError("Erro ao verificar disponibilidade de transporte.");
            return false;
        }

        const currentPassengers = (externalAppointments || []).reduce((acc, appt) => {
            return acc + 1 + (appt.hasCompanion ? 1 : 0);
        }, 0);

        const newPassengers = 1 + (hasCompanion ? 1 : 0);

        if (currentPassengers + newPassengers > DEFAULT_TRANSPORT_CAPACITY) {
            setError(`O transporte para esta data atingiu a lotação máxima (${DEFAULT_TRANSPORT_CAPACITY} lugares). Por favor, escolha outra data.`);
            return false;
        }

        return true;
    };

    const handleConfirmBooking = async () => {
        if (!selectedService || !selectedDate || !selectedTime || !user || !selectedProfessional) {
            setError("Por favor, preencha todos os campos.");
            return;
        }
        
        // Ensure unit is selected
        if (!selectedUnit) {
             setError("Unidade de atendimento não identificada.");
             return;
        }

        setIsSubmitting(true);
        setError(null);
        
        const dateStr = getLocalDateStr(selectedDate);

        // Check for duplicates
        const { data: existingAppointment, error: checkError } = await supabase
            .from('appointments')
            .select('id')
            .eq('client_id', user.id)
            .eq('professional_id', selectedProfessional.id)
            .eq('date', dateStr)
            .eq('status', 'upcoming');

        if (checkError) {
            setError("Erro ao verificar agenda.");
            setIsSubmitting(false);
            return;
        }
        
        if (existingAppointment && existingAppointment.length > 0) {
            setError("Você já possui agendamento com este profissional nesta data.");
            setIsSubmitting(false);
            return;
        }

        // Check Transport Capacity
        const hasCapacity = await checkTransportCapacity(dateStr);
        if (!hasCapacity) {
            setIsSubmitting(false);
            return;
        }

        const finalServiceName = selectedSpecialty 
            ? `${selectedService.name} (${selectedSpecialty.name})`
            : selectedService.name;

        const appointmentData = {
            client_id: user.id,
            professional_id: selectedProfessional.id,
            client_name: user.name,
            professional_name: selectedProfessional.name,
            professional_image_url: selectedProfessional.imageUrl,
            service_name: finalServiceName,
            date: dateStr,
            time: selectedTime,
            price: selectedService.price,
            status: 'upcoming' as const,
            // Transport and Location fields
            locationType: selectedService.locationType || 'local',
            healthUnit: selectedUnit, // Derived from the schedule slot
            destinationCity: selectedService.destinationCity, // For external
            externalProfessional: externalProfessionalName, // Name of doctor at destination
            hasCompanion: hasCompanion,
            transportStatus: selectedService.locationType === 'local' ? null : 'pending' // Only pending if transport needed
        };

        const { error } = await supabase.from('appointments').insert([appointmentData]);
        if (error) {
            console.error("Error creating appointment:", error);
            setError("Não foi possível criar o agendamento. Tente novamente.");
            setIsSubmitting(false);
        } else {
            setStep(prev => prev + 1);
            setIsSubmitting(false);
        }
    };
    
    const handleNextStep = () => {
        setError(null);
        handleConfirmBooking();
    };
    const handlePrevStep = () => setStep(prev => prev - 1);

    const formatPrice = (price: number) => {
        return price === 0 ? "Gratuito (SUS)" : `R$ ${price.toFixed(2)}`;
    }

    const renderSelectProfessionalForCategory = () => (
        <div>
            <h3 className="text-xl font-semibold mb-2 text-stone-700">1. Escolha o Profissional</h3>
            <p className="text-sm text-stone-500 mb-4">
                Encontramos {categoryProfessionals.length} especialistas para <strong>{category}</strong>.
            </p>
            {loadingCategoryPros ? (
                <div className="flex justify-center py-8"><p>Carregando servidores...</p></div>
            ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {categoryProfessionals.length > 0 ? categoryProfessionals.map(prof => {
                        const units = prof.settings?.schedule?.map(s => s.unitName).join(', ') || prof.settings?.assignedUnit || 'Variável';
                        return (
                            <div 
                                key={prof.id} 
                                onClick={() => { setSelectedProfessional(prof); setStep(s => s + 1); }} 
                                className="flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 border-stone-200 hover:bg-teal-50 hover:border-teal-500 hover:shadow-md group bg-white"
                            >
                                <img 
                                    src={prof.imageUrl} 
                                    alt={prof.name} 
                                    className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-stone-100 group-hover:border-teal-300" 
                                />
                                <div className="flex-grow">
                                    <p className="font-bold text-stone-800 text-lg group-hover:text-teal-700 transition-colors">{prof.name}</p>
                                    <p className="text-xs text-stone-500 font-medium">
                                        {(prof.specialties || []).map(s => s.name).join(', ') || 'Clínico Geral'}
                                    </p>
                                    <div className="flex items-center mt-1">
                                        <LocationIcon />
                                        <p className="text-xs text-stone-600 ml-1 truncate max-w-[200px]" title={units}>
                                            {units}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-stone-300 group-hover:text-teal-600 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        )
                    }) : (
                        <div className="text-center py-10 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                            <p className="text-stone-500 mt-2">Nenhum servidor disponível para esta categoria no momento.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // ... (renderSelectSpecialty remains similar) ...
    const renderSelectSpecialty = () => (
        <div>
            <h3 className="text-xl font-semibold mb-4 text-stone-700">{isServiceLedFlow ? '2' : '1'}. Selecione a Especialidade</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {(selectedProfessional?.specialties || []).map((spec, index) => (
                    <div 
                        key={index} 
                        onClick={() => { setSelectedSpecialty(spec); setStep(s => s + 1); }} 
                        className="p-4 border rounded-lg cursor-pointer hover:bg-stone-50 hover:border-teal-500 flex justify-between items-center group"
                    >
                        <div className="flex items-center">
                            <BadgeIcon />
                            <span className="font-semibold text-stone-800 ml-3">{spec.name}</span>
                        </div>
                        <span className="text-stone-400 group-hover:text-teal-600 transition-colors">Selecionar &rarr;</span>
                    </div>
                ))}
            </div>
        </div>
    );

    // ... (renderSelectService remains similar) ...
    const renderSelectService = () => {
        let services: Service[] = [];
        if (selectedProfessional) {
            services = selectedProfessional.services || [];
            if (category) {
                 const categoryServicesNames = (servicesByCategory[category] || []).map(s => s.name);
                 if (services.length > 0) {
                     services = services.filter(s => categoryServicesNames.includes(s.name));
                     if (services.length === 0) services = selectedProfessional.services || [];
                 }
            }
        }
        const showSpecialtyStep = (selectedProfessional?.specialties?.length || 0) > 1;
        let stepNumber = isServiceLedFlow ? (showSpecialtyStep ? 3 : 2) : (showSpecialtyStep ? 2 : 1);
        
        return (
            <div>
                <h3 className="text-xl font-semibold mb-1 text-stone-700">{stepNumber}. Escolha o procedimento</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 mt-4">
                    {services.length > 0 ? services.map(service => (
                        <div key={service.id} onClick={() => { setSelectedService(service); setStep(s => s + 1); }} className="p-4 border rounded-lg cursor-pointer hover:bg-stone-50 hover:border-teal-500">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-stone-800">{service.name}</span>
                                <span className="text-teal-600 font-medium bg-teal-50 px-2 py-1 rounded text-xs">{formatPrice(service.price)}</span>
                            </div>
                            <p className="text-sm text-stone-500">Duração média: {service.duration} min</p>
                        </div>
                    )) : (
                        <div className="text-center py-8">
                            <p className="text-stone-500">Nenhum serviço específico listado.</p>
                            <button onClick={() => setStep(prev => prev - 1)} className="text-teal-600 font-semibold mt-2 hover:underline">Voltar</button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // This replaces the old "Select Unit" step for LOCAL services, merging it with Time.
    // For EXTERNAL services, we still might want to select the destination unit explicitly.
    const renderSelectUnitExternal = () => {
        const isExternal = selectedService?.locationType === 'external';
        if (!isExternal) {
            setStep(s => s + 1);
            return null;
        }

        const showSpecialtyStep = (selectedProfessional?.specialties?.length || 0) > 1;
        let stepNumber = isServiceLedFlow ? (showSpecialtyStep ? 4 : 3) : (showSpecialtyStep ? 3 : 2);

        const locationList = selectedService?.destinationCity ? EXTERNAL_FACILITIES[selectedService.destinationCity] || [] : [];

        return (
            <div>
                <h3 className="text-xl font-semibold mb-4 text-stone-700">{stepNumber}. Local do Exame em {selectedService?.destinationCity}</h3>
                
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 mb-4">
                    {locationList.map((unit) => (
                        <div 
                            key={unit} 
                            onClick={() => { setSelectedUnit(unit); }} 
                            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 flex items-center ${selectedUnit === unit ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : 'border-stone-200 hover:bg-stone-50 hover:border-teal-500'}`}
                        >
                            <div className="p-2 rounded-full mr-3 bg-amber-100 text-amber-600"><LocationIcon /></div>
                            <span className="font-semibold text-stone-800">{unit}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-semibold text-stone-600 mb-1">Nome do Médico no Destino (Opcional)</label>
                    <input 
                        type="text" 
                        className="w-full p-2 border border-stone-300 rounded-lg text-sm"
                        value={externalProfessionalName}
                        onChange={(e) => setExternalProfessionalName(e.target.value)}
                    />
                </div>

                <div className="mt-6 flex justify-end">
                     <button 
                        onClick={() => setStep(s => s + 1)} 
                        disabled={!selectedUnit}
                        className="bg-teal-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                    >
                        Continuar
                    </button>
                </div>
            </div>
        );
    };

    const renderSelectDateTime = () => {
        const today = new Date();
        const minDate = getLocalDateStr(today);
        
        const isExternal = selectedService?.locationType === 'external';
        const showSpecialtyStep = (selectedProfessional?.specialties?.length || 0) > 1;
        
        // Count steps dynamically
        let stepCount = 1;
        if (isServiceLedFlow) stepCount++;
        if (showSpecialtyStep) stepCount++;
        if (isExternal) stepCount++; // Account for external unit selection

        return (
            <div>
                <h3 className="text-xl font-semibold mb-4 text-stone-700">{stepCount}. Selecione Data e Hora</h3>
                <input 
                    type="date" 
                    min={minDate} 
                    value={getLocalDateStr(selectedDate)} 
                    onChange={(e) => {
                        if (e.target.value) {
                             const [year, month, day] = e.target.value.split('-').map(Number);
                             setSelectedDate(new Date(year, month - 1, day));
                        }
                    }} 
                    className="w-full p-2 border border-stone-300 rounded-lg mb-4 focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                />
                
                {isExternal ? (
                    <div>
                        <label className="block text-sm font-semibold text-stone-600 mb-2">Horário do Procedimento:</label>
                        <input 
                            type="time" 
                            className="w-full p-3 border border-stone-300 rounded-lg text-lg font-bold text-stone-800"
                            value={selectedTime || ''}
                            onChange={(e) => setSelectedTime(e.target.value)}
                        />
                        <p className="text-xs text-stone-500 mt-2 bg-amber-50 p-2 rounded border border-amber-100">
                            Informe o horário exato agendado para o seu exame/consulta na outra cidade.
                        </p>
                    </div>
                ) : (
                    <>
                        {loadingAvailability ? <p className="text-stone-500">Verificando disponibilidade...</p> : (
                            <div className="grid grid-cols-2 gap-2">
                                {timeSlots.length > 0 ? timeSlots.map(slot => (
                                    <button 
                                        key={slot.time} 
                                        onClick={() => handleTimeSelection(slot.time, slot.unitName)} 
                                        className={`p-2 rounded-lg transition-colors duration-200 text-sm flex flex-col items-center justify-center border ${selectedTime === slot.time ? 'bg-teal-600 text-white border-teal-600' : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'} ${justSelectedTime === slot.time ? 'animate-pop' : ''}`}
                                    >
                                        <span className="font-bold text-base">{slot.time}</span>
                                        {slot.unitName && <span className="text-[10px] opacity-90 truncate w-full text-center">{slot.unitName}</span>}
                                    </button>
                                )) : <p className="text-stone-500 col-span-full text-center bg-stone-50 p-4 rounded">Nenhum horário disponível para esta data.</p>}
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    // ... (renderConfirm and renderSuccess remain largely the same, but using selectedUnit correctly)
    const renderConfirm = () => {
        const isExternal = selectedService?.locationType === 'external';
        const showSpecialtyStep = (selectedProfessional?.specialties?.length || 0) > 1;
        let stepCount = 1;
        if (isServiceLedFlow) stepCount++;
        if (showSpecialtyStep) stepCount++;
        if (isExternal) stepCount++;
        stepCount++;

        return (
            <div>
                <h3 className="text-xl font-semibold mb-4 text-stone-700">{stepCount}. Confirme o Agendamento</h3>
                {error && <div className="flex items-start bg-red-50 p-3 rounded mb-4 border border-red-200"><ExclamationIcon /><p className="text-red-700 text-sm ml-2">{error}</p></div>}
                
                <div className="bg-stone-50 p-4 rounded-lg space-y-3 border border-stone-200">
                    <div><p className="text-xs uppercase tracking-wide text-stone-500">Solicitante</p><p className="font-semibold text-stone-800">{user.name}</p></div>
                    <div><p className="text-xs uppercase tracking-wide text-stone-500">Profissional</p><p className="font-semibold text-stone-800">{selectedProfessional?.name}</p></div>
                    
                    {selectedUnit && (
                        <div className={`p-2 rounded -mx-2 px-2 ${isExternal ? 'bg-amber-100/50' : 'bg-teal-100/50'}`}>
                            <p className={`text-xs uppercase tracking-wide ${isExternal ? 'text-amber-700' : 'text-teal-700'}`}>Local</p>
                            <p className={`font-bold flex items-center ${isExternal ? 'text-amber-800' : 'text-teal-800'}`}>
                                <LocationIcon /> 
                                <span className="ml-1">{selectedUnit} {isExternal && `(${selectedService?.destinationCity})`}</span>
                            </p>
                        </div>
                    )}

                    <div>
                        <p className="text-xs uppercase tracking-wide text-stone-500">Procedimento</p>
                        <p className="font-semibold text-stone-800">{selectedService?.name}</p>
                    </div>
                    <div><p className="text-xs uppercase tracking-wide text-stone-500">Data e Hora</p><p className="font-semibold text-stone-800">{selectedDate.toLocaleDateString('pt-BR')} às {selectedTime}</p></div>
                </div>

                {isExternal && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                         <div className="flex items-start">
                             <div className="mr-3 mt-1"><BusIcon /></div>
                             <div>
                                 <h4 className="font-semibold text-amber-800 text-sm">Transporte Intermunicipal</h4>
                                 <p className="text-xs text-amber-700 mt-1">O transporte será fornecido pela prefeitura. Aguarde confirmação.</p>
                             </div>
                         </div>
                         <div className="mt-3 flex items-center bg-white p-2 rounded border border-amber-200">
                             <input type="checkbox" id="companion-check" checked={hasCompanion} onChange={(e) => setHasCompanion(e.target.checked)} className="h-5 w-5 text-teal-600 rounded" />
                             <label htmlFor="companion-check" className="ml-2 text-sm font-medium text-stone-700">Vou precisar de acompanhante?</label>
                         </div>
                    </div>
                )}
            </div>
        );
    };

    // ... (renderSuccess unchanged, assuming it uses the correct selectedUnit)
    const renderSuccess = () => {
        // ... (Send Whatsapp logic same as before)
        const handleSendWhatsapp = () => {
            const dateFormatted = selectedDate.toLocaleDateString('pt-BR');
            const unitInfo = selectedUnit ? `\n📍 *Local:* ${selectedUnit}` : '';
            const message = `*SIAGA - Confirmação* ✅\n\nOlá, ${user.name.split(' ')[0]}!\n🩺 *Serviço:* ${selectedService?.name}${unitInfo}\n🗓️ *Data:* ${dateFormatted}\n⏰ *Horário:* ${selectedTime}\n\n`;
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
        };

        return (
            <div className="text-center py-6">
                <CheckCircleIcon />
                <h3 className="text-2xl font-bold text-stone-800 mt-4">Agendamento Confirmado!</h3>
                <p className="text-stone-600 mt-2">Horário reservado com sucesso.</p>
                {selectedUnit && <p className="text-teal-700 font-bold mt-2 bg-teal-50 p-2 rounded inline-block border border-teal-100">Compareça na: {selectedUnit}</p>}
                
                <button onClick={handleSendWhatsapp} className="mt-6 w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center shadow-md">
                    <WhatsappIcon /> Enviar Comprovante no WhatsApp
                </button>
                <button onClick={onClose} className="mt-3 w-full text-stone-600 font-bold py-3 px-4 rounded-lg hover:bg-stone-100 transition-colors">Voltar ao Início</button>
            </div>
        );
    };

    // Logic to build steps array and navigation
    let steps = [];
    const buildSteps = () => {
        let flow = [];
        if (isServiceLedFlow) flow.push(renderSelectProfessionalForCategory);
        if ((selectedProfessional?.specialties?.length || 0) > 1) flow.push(renderSelectSpecialty);
        flow.push(renderSelectService);
        if (selectedService?.locationType === 'external') flow.push(renderSelectUnitExternal);
        flow.push(renderSelectDateTime);
        flow.push(renderConfirm);
        flow.push(renderSuccess);
        return flow;
    };
    steps = buildSteps();

    const currentStepIndex = step - 1;
    const currentStepRender = steps[currentStepIndex];
    const isAtConfirmScreen = step === steps.length - 1;
    const isAtSuccessScreen = step === steps.length;

    const canGoNext = () => {
        // Validation logic...
        if (currentStepRender === renderSelectProfessionalForCategory) return !!selectedProfessional;
        if (currentStepRender === renderSelectSpecialty) return !!selectedSpecialty;
        if (currentStepRender === renderSelectService) return !!selectedService;
        if (currentStepRender === renderSelectUnitExternal) return !!selectedUnit;
        if (currentStepRender === renderSelectDateTime) return !!selectedTime;
        return true;
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-500 hover:text-stone-800"><XIcon /></button>
                <div className="flex-shrink-0 mb-4 text-center">
                    <h2 className="text-2xl font-bold text-stone-800">Agendamento de Saúde</h2>
                    {selectedProfessional && !isAtSuccessScreen && <p className="text-stone-600 font-semibold mt-1">{selectedProfessional.name}</p>}
                </div>
                <div className="flex-grow overflow-y-auto mb-6 pr-2">
                    {currentStepRender && currentStepRender()}
                </div>
                {!isAtSuccessScreen && (
                    <div className="mt-auto flex-shrink-0 flex items-center justify-between pt-4 border-t border-stone-100">
                        <button onClick={handlePrevStep} disabled={step === 1 || isSubmitting || checkingCapacity} className="text-stone-600 font-semibold py-2 px-4 rounded-lg hover:bg-stone-100 disabled:opacity-50">Voltar</button>
                        {isAtConfirmScreen ? (
                             <button onClick={handleNextStep} disabled={isSubmitting || checkingCapacity} className="bg-teal-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-700 shadow-md disabled:opacity-50">{isSubmitting || checkingCapacity ? 'Processando...' : 'Confirmar'}</button>
                        ) : (
                            <button onClick={() => setStep(s => s + 1)} disabled={!canGoNext()} className="bg-teal-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-700 shadow-md disabled:opacity-50">Avançar</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
