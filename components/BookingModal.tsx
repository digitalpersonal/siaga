
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Professional, Service, User, ProfessionalUser, Appointment, ProfessionalSettings, Specialty } from '../types';
import { supabase } from '../utils/supabase';
import { medicalServices, dentalServices, nursingServices, examServices, DEFAULT_TRANSPORT_CAPACITY, HEALTH_UNITS } from '../constants';

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

const generateTimeSlots = (date: Date, settings: ProfessionalSettings, professionalAppointments: Pick<Appointment, 'time'>[]) => {
    if (!settings?.workHours) return [];
    
    const slots = [];
    const dateStr = getLocalDateStr(date);
    const dayOfWeek = date.getDay();

    if (!settings.workDays.includes(dayOfWeek) || settings.blockedDays.includes(dateStr)) {
        return [];
    }

    const bookedTimes = professionalAppointments.map(a => a.time.substring(0, 5));
    const blockedSlotsForDay = settings.blockedTimeSlots?.[dateStr] || [];

    const startHour = parseInt(settings.workHours.start.split(':')[0]);
    const endHour = parseInt(settings.workHours.end.split(':')[0]);
    const lunchStart = parseInt(settings.workHours.lunchStart?.split(':')[0] || '12');
    const lunchEnd = parseInt(settings.workHours.lunchEnd?.split(':')[0] || '13');
    
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    for (let h = startHour; h < endHour; h++) {
        for (let m = 0; m < 60; m += 30) {
            // Skip hours during lunch
            if (h >= lunchStart && h < lunchEnd) continue;

            if (isToday && (h < now.getHours() || (h === now.getHours() && m < now.getMinutes()))) {
                continue;
            }
            const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            if (!bookedTimes.includes(time) && !blockedSlotsForDay.includes(time)) {
                slots.push(time);
            }
        }
    }
    return slots;
};

export const BookingModal: React.FC<BookingModalProps> = ({ professional, category, user, onClose }) => {
    const isServiceLedFlow = !professional;

    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(professional || null);
    const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null); // New state for Health Unit
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
    
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
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

    // Auto-select unit if the professional has one assigned
    useEffect(() => {
        if (selectedProfessional?.settings?.assignedUnit) {
            setSelectedUnit(selectedProfessional.settings.assignedUnit);
        } else {
            setSelectedUnit(null);
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
                    // Filter professionals who offer at least one service in this category
                    const filtered = data.filter((p: any) => 
                        (p.services || []).some((s: Service) => categoryServices.some(cs => cs.name === s.name)) || 
                        (p.services || []).length === 0 // Show newly added pros without services just in case
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
        
        // Ensure unit is selected for local services
        if (selectedService.locationType === 'local' && !selectedUnit) {
             setError("Por favor, selecione a Unidade de Saúde.");
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
            console.error("Error checking for existing appointment:", checkError);
            setError("Ocorreu um erro ao verificar sua agenda. Tente novamente.");
            setIsSubmitting(false);
            return;
        }
        
        if (existingAppointment && existingAppointment.length > 0) {
            setError("Você já possui um atendimento agendado com este servidor para esta data.");
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
            healthUnit: selectedService.locationType === 'local' ? selectedUnit : 'Externo',
            hasCompanion: hasCompanion,
            transportStatus: 'pending'
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

    // New Step 1 for Category Flow: Explicit Professional Selection
    const renderSelectProfessionalForCategory = () => (
        <div>
            <h3 className="text-xl font-semibold mb-2 text-stone-700">1. Escolha o Profissional</h3>
            <p className="text-sm text-stone-500 mb-4">
                Encontramos {categoryProfessionals.length} especialistas para <strong>{category}</strong>. Selecione com quem deseja agendar.
            </p>
            {loadingCategoryPros ? (
                <div className="flex justify-center py-8"><p>Carregando servidores...</p></div>
            ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {categoryProfessionals.length > 0 ? categoryProfessionals.map(prof => (
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
                                {prof.settings?.assignedUnit && (
                                    <div className="flex items-center mt-1">
                                        <LocationIcon />
                                        <p className="text-xs text-stone-600 ml-1">
                                            {prof.settings.assignedUnit}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="text-stone-300 group-hover:text-teal-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                            <UserIcon />
                            <p className="text-stone-500 mt-2">Nenhum servidor disponível para esta categoria no momento.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderSelectSpecialty = () => (
        <div>
            <h3 className="text-xl font-semibold mb-4 text-stone-700">{isServiceLedFlow ? '2' : '1'}. Selecione a Especialidade</h3>
            <p className="text-sm text-stone-500 mb-4">Este profissional atende em múltiplas áreas. Por favor, selecione uma para continuar.</p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {(selectedProfessional?.specialties || []).map((spec, index) => (
                    <div 
                        key={index} 
                        onClick={() => { setSelectedSpecialty(spec); setStep(s => s + 1); }} 
                        className="p-4 border rounded-lg cursor-pointer transition-all duration-200 border-stone-200 hover:bg-stone-50 hover:border-teal-500 flex justify-between items-center group"
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

    const renderSelectService = () => {
        let services: Service[] = [];

        if (selectedProfessional) {
            if (category) {
                 const categoryServicesNames = (servicesByCategory[category] || []).map(s => s.name);
                 // Check if professional explicitly lists services. If not, check if we should fallback to category defaults 
                 // (only if the pro doesn't have custom services defined, implying they do 'standard' category work)
                 const proServices = selectedProfessional.services || [];
                 
                 if (proServices.length > 0) {
                     services = proServices.filter(s => categoryServicesNames.includes(s.name));
                     // Fallback: if intersection is empty, show all pro services (maybe category name mismatch)
                     if (services.length === 0) services = proServices;
                 } else {
                     // Fallback for pros with no services defined but listed in category
                     services = servicesByCategory[category] || [];
                 }
            } else {
                services = selectedProfessional.services || [];
            }
        } else {
             // Should not happen in new flow, but safe fallback
             services = category && servicesByCategory[category] ? servicesByCategory[category] : [];
        }

        const showSpecialtyStep = (selectedProfessional?.specialties?.length || 0) > 1;
        
        let stepNumber;
        if (isServiceLedFlow) {
            stepNumber = showSpecialtyStep ? 3 : 2;
        } else {
            stepNumber = showSpecialtyStep ? 2 : 1;
        }
        
        const subTitle = selectedSpecialty ? `Opções disponíveis para: ${selectedSpecialty.name}` : "";
        
        return (
            <div>
                <h3 className="text-xl font-semibold mb-1 text-stone-700">{stepNumber}. Escolha o procedimento</h3>
                {subTitle && <p className="text-sm text-teal-600 font-medium mb-4">{subTitle}</p>}
                {!subTitle && <div className="mb-4"></div>}
                
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {services.length > 0 ? services.map(service => (
                        <div key={service.id} onClick={() => { setSelectedService(service); setStep(s => s + 1); }} className="p-4 border rounded-lg cursor-pointer transition-all duration-200 border-stone-200 hover:bg-stone-50 hover:border-teal-500">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-stone-800">{service.name}</span>
                                <div className="flex items-center gap-2">
                                     {service.locationType === 'external' && (
                                        <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-semibold border border-amber-200">Outra Cidade</span>
                                     )}
                                    <span className="text-teal-600 font-medium bg-teal-50 px-2 py-1 rounded text-xs">{formatPrice(service.price)}</span>
                                </div>
                            </div>
                            <p className="text-sm text-stone-500">Duração média: {service.duration} min</p>
                        </div>
                    )) : (
                        <div className="text-center py-8">
                            <p className="text-stone-500">Nenhum serviço específico listado para este profissional nesta categoria.</p>
                            <button onClick={() => setStep(prev => prev - 1)} className="text-teal-600 font-semibold mt-2 hover:underline">Voltar e escolher outro profissional</button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Nova Etapa: Seleção de Unidade (apenas se for local E o profissional NÃO tiver unidade fixa)
    const renderSelectUnit = () => {
        if (selectedProfessional?.settings?.assignedUnit) return null;

        const showSpecialtyStep = (selectedProfessional?.specialties?.length || 0) > 1;
        let stepNumber;
        if (isServiceLedFlow) {
             stepNumber = showSpecialtyStep ? 4 : 3;
        } else {
             stepNumber = showSpecialtyStep ? 3 : 2;
        }

        // Skip if external
        if (selectedService?.locationType === 'external') {
            setStep(s => s + 1);
            return null; 
        }

        return (
            <div>
                <h3 className="text-xl font-semibold mb-4 text-stone-700">{stepNumber}. Selecione a Unidade</h3>
                <p className="text-sm text-stone-500 mb-4">Escolha em qual Posto de Saúde você deseja ser atendido.</p>
                
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {HEALTH_UNITS.map((unit) => (
                        <div 
                            key={unit} 
                            onClick={() => { setSelectedUnit(unit); setStep(s => s + 1); }} 
                            className="p-4 border rounded-lg cursor-pointer transition-all duration-200 border-stone-200 hover:bg-stone-50 hover:border-teal-500 flex items-center"
                        >
                            <div className="p-2 bg-teal-100 rounded-full text-teal-600 mr-3">
                                <LocationIcon />
                            </div>
                            <span className="font-semibold text-stone-800">{unit}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderSelectDateTime = () => {
        const today = new Date();
        const minDate = getLocalDateStr(today);
        
        const showSpecialtyStep = (selectedProfessional?.specialties?.length || 0) > 1;
        const isLocal = selectedService?.locationType === 'local';
        const hasFixedUnit = !!selectedProfessional?.settings?.assignedUnit;
        
        // Dynamic Step Counting
        let stepCount = 1; 
        if (isServiceLedFlow) stepCount++; // Pro select
        if (showSpecialtyStep) stepCount++; // Specialty
        if (isLocal && !hasFixedUnit) stepCount++; // Unit select

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
                {loadingAvailability ? <p className="text-stone-500">Verificando disponibilidade na agenda...</p> : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {timeSlots.length > 0 ? timeSlots.map(time => (
                            <button 
                                key={time} 
                                onClick={() => {
                                    setSelectedTime(time);
                                    setJustSelectedTime(time);
                                    setTimeout(() => setJustSelectedTime(null), 300);
                                }} 
                                className={`p-2 rounded-lg transition-colors duration-200 text-sm font-medium ${selectedTime === time ? 'bg-teal-600 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'} ${justSelectedTime === time ? 'animate-pop' : ''}`}
                            >
                                {time}
                            </button>
                        )) : <p className="text-stone-500 col-span-full text-center bg-stone-50 p-4 rounded">Nenhum horário disponível para esta data.</p>}
                    </div>
                )}
            </div>
        );
    };

    const renderConfirm = () => {
        const showSpecialtyStep = (selectedProfessional?.specialties?.length || 0) > 1;
        const isLocal = selectedService?.locationType === 'local';
        const hasFixedUnit = !!selectedProfessional?.settings?.assignedUnit;
        
        let stepCount = 1;
        if (isServiceLedFlow) stepCount++;
        if (showSpecialtyStep) stepCount++;
        if (isLocal && !hasFixedUnit) stepCount++;
        stepCount++; // For the Date step we just passed

        const isExternalService = selectedService?.locationType === 'external';

        return (
            <div>
                <h3 className="text-xl font-semibold mb-4 text-stone-700">{stepCount}. Confirme o Agendamento</h3>
                {error && (
                    <div className="flex items-start bg-red-50 p-3 rounded mb-4 border border-red-200">
                        <ExclamationIcon />
                        <p className="text-red-700 text-sm ml-2">{error}</p>
                    </div>
                )}
                
                <div className="bg-stone-50 p-4 rounded-lg space-y-3 border border-stone-200">
                    <div><p className="text-xs uppercase tracking-wide text-stone-500">Profissional / Unidade</p><p className="font-semibold text-stone-800">{selectedProfessional?.name}</p></div>
                    {selectedSpecialty && (
                        <div><p className="text-xs uppercase tracking-wide text-stone-500">Especialidade</p><p className="font-semibold text-teal-700">{selectedSpecialty.name}</p></div>
                    )}
                    {isLocal && selectedUnit && (
                        <div className="bg-teal-100/50 p-2 rounded -mx-2 px-2"><p className="text-xs uppercase tracking-wide text-teal-700">Local de Atendimento</p><p className="font-bold text-teal-800 flex items-center"><LocationIcon /> <span className="ml-1">{selectedUnit}</span></p></div>
                    )}
                    <div>
                        <p className="text-xs uppercase tracking-wide text-stone-500">Procedimento</p>
                        <p className="font-semibold text-stone-800 flex items-center">
                            {selectedService?.name}
                            {isExternalService && <span className="ml-2 text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">Transporte Necessário</span>}
                        </p>
                    </div>
                    <div><p className="text-xs uppercase tracking-wide text-stone-500">Data e Hora</p><p className="font-semibold text-stone-800">{selectedDate.toLocaleDateString('pt-BR')} às {selectedTime}</p></div>
                    <div className="border-t pt-2 mt-2"><p className="text-xs uppercase tracking-wide text-stone-500">Valor</p><p className="font-bold text-lg text-teal-700">{formatPrice(selectedService?.price || 0)}</p></div>
                </div>

                {isExternalService && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                         <div className="flex items-start">
                             <div className="mr-3 mt-1"><BusIcon /></div>
                             <div>
                                 <h4 className="font-semibold text-amber-800 text-sm">Transporte Intermunicipal</h4>
                                 <p className="text-xs text-amber-700 mt-1">Este serviço é realizado em outra cidade. O transporte será fornecido pela prefeitura.</p>
                             </div>
                         </div>
                         <div className="mt-3 flex items-center bg-white p-2 rounded border border-amber-200">
                             <input 
                                type="checkbox" 
                                id="companion-check" 
                                checked={hasCompanion} 
                                onChange={(e) => setHasCompanion(e.target.checked)}
                                className="h-5 w-5 text-teal-600 rounded focus:ring-teal-500"
                            />
                             <label htmlFor="companion-check" className="ml-2 text-sm font-medium text-stone-700 cursor-pointer select-none">
                                 Vou precisar de acompanhante?
                                 <span className="block text-xs text-stone-500 font-normal">Marque apenas se for estritamente necessário para garantir lugar no veículo. Ocupará uma vaga extra.</span>
                             </label>
                         </div>
                    </div>
                )}
            </div>
        );
    };

    const renderSuccess = () => {
        const handleSendWhatsapp = () => {
            if (!selectedService || !selectedDate || !selectedTime || !selectedProfessional) return;
            
            const dateFormatted = selectedDate.toLocaleDateString('pt-BR');
            const unitInfo = selectedUnit ? `\n📍 *Local:* ${selectedUnit}` : '';
            const companionInfo = hasCompanion ? '\n👥 *Acompanhante:* Sim' : '';
            const transportInfo = selectedService.locationType === 'external' ? '\n🚌 *Transporte:* Incluído (Chegar 30min antes)' : '';

            const message = `*SIAGA - Confirmação de Agendamento* ✅\n\nOlá, ${user.name.split(' ')[0]}! Seu agendamento foi realizado com sucesso.\n\n👨‍⚕️ *Profissional:* ${selectedProfessional.name}\n💉 *Serviço:* ${selectedService.name}${unitInfo}\n🗓️ *Data:* ${dateFormatted}\n⏰ *Horário:* ${selectedTime}${transportInfo}${companionInfo}\n\nRecomendamos chegar com 15 minutos de antecedência.`;

            const encodedMessage = encodeURIComponent(message);
            // Try to open a chat with self if number is available, else just open whatsapp with text pre-filled
            const targetPhone = user.whatsapp ? `55${user.whatsapp.replace(/\D/g, '')}` : '';
            const url = `https://wa.me/${targetPhone}?text=${encodedMessage}`;
            window.open(url, '_blank');
        };

        return (
            <div className="text-center py-6">
                <CheckCircleIcon />
                <h3 className="text-2xl font-bold text-stone-800 mt-4">Agendamento Confirmado!</h3>
                <p className="text-stone-600 mt-2">Seu horário de saúde foi reservado com sucesso.</p>
                {selectedService?.locationType === 'local' && (
                    <p className="text-teal-700 font-bold mt-2 bg-teal-50 p-2 rounded inline-block border border-teal-100">
                        Compareça na: {selectedUnit}
                    </p>
                )}
                {selectedService?.locationType === 'external' && (
                     <p className="text-amber-600 text-sm mt-2 font-medium bg-amber-50 p-2 rounded border border-amber-100 inline-block">
                         Chegue 30 minutos antes no ponto de embarque.
                         {hasCompanion ? ' Seu acompanhante está confirmado.' : ''}
                     </p>
                )}
                <p className="text-stone-500 text-sm mt-1">A confirmação foi enviada para o seu WhatsApp cadastrado.</p>
                
                <button 
                    onClick={handleSendWhatsapp}
                    className="mt-6 w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300 flex items-center justify-center shadow-md"
                >
                    <WhatsappIcon />
                    Enviar Comprovante no WhatsApp
                </button>

                <button onClick={onClose} className="mt-3 w-full text-stone-600 font-bold py-3 px-4 rounded-lg hover:bg-stone-100 transition-colors duration-300">
                    Voltar ao Início
                </button>
            </div>
        );
    };

    // Dynamic Step Array Construction
    const hasMultipleSpecialties = (selectedProfessional?.specialties?.length || 0) > 1;
    const isLocal = selectedService?.locationType === 'local';
    const hasFixedUnit = !!selectedProfessional?.settings?.assignedUnit;

    let steps = [];
    
    // Helper to build flow
    const buildSteps = () => {
        let flow = [];
        // 1. Professional selection (if not pre-selected)
        if (isServiceLedFlow) flow.push(renderSelectProfessionalForCategory);
        
        // 2. Specialty selection
        if (hasMultipleSpecialties) flow.push(renderSelectSpecialty);
        
        // 3. Service selection
        flow.push(renderSelectService);
        
        // 4. Unit selection (only if local AND professional does NOT have a fixed unit)
        if (isLocal && !hasFixedUnit) flow.push(renderSelectUnit);
        
        // 5. Date/Time
        flow.push(renderSelectDateTime);
        
        // 6. Confirm
        flow.push(renderConfirm);
        
        // 7. Success
        flow.push(renderSuccess);
        
        return flow;
    };

    steps = buildSteps();

    // Determine current logical step index for validation
    // The indices in `steps` array are 0-based, `step` state is 1-based.
    const currentStepIndex = step - 1;
    const currentStepRender = steps[currentStepIndex];
    const isAtConfirmScreen = step === steps.length - 1;
    const isAtSuccessScreen = step === steps.length;
    
    const canGoNext = () => {
        if (currentStepRender === renderSelectProfessionalForCategory) return !!selectedProfessional;
        if (currentStepRender === renderSelectSpecialty) return !!selectedSpecialty;
        if (currentStepRender === renderSelectService) return !!selectedService;
        if (currentStepRender === renderSelectUnit) return !!selectedUnit;
        if (currentStepRender === renderSelectDateTime) return !!selectedTime;
        return true;
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[90vh]">
                <button onClick={onClose} aria-label="Fechar" className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 transition-colors"><XIcon /></button>
                <div className="flex-shrink-0 mb-4 text-center">
                    <h2 className="text-2xl font-bold text-stone-800">Agendamento de Saúde</h2>
                    {selectedProfessional && !isAtSuccessScreen && (
                        <div className="mt-1">
                            <p className="text-stone-600 font-semibold">{selectedProfessional.name}</p>
                            {selectedProfessional.settings?.assignedUnit && <p className="text-xs text-teal-600 font-medium">{selectedProfessional.settings.assignedUnit}</p>}
                        </div>
                    )}
                </div>
                <div className="flex-grow overflow-y-auto mb-6 pr-2">
                    {currentStepRender && currentStepRender()}
                </div>
                {!isAtSuccessScreen && (
                    <div className="mt-auto flex-shrink-0 flex items-center justify-between pt-4 border-t border-stone-100">
                        <button onClick={handlePrevStep} disabled={step === 1 || isSubmitting || checkingCapacity} className="text-stone-600 font-semibold py-2 px-4 rounded-lg hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed">Voltar</button>
                        {isAtConfirmScreen ? (
                             <button onClick={handleNextStep} disabled={isSubmitting || checkingCapacity} className="bg-teal-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md">{isSubmitting || checkingCapacity ? 'Processando...' : 'Confirmar'}</button>
                        ) : (
                            <button onClick={() => setStep(s => s + 1)} disabled={!canGoNext()} className="bg-teal-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md">Avançar</button>
                        )}
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                @keyframes pop {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                .animate-pop { animation: pop 0.3s ease-out; }
            `}</style>
        </div>
    );
};
