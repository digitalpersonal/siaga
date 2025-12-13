
import React, { useState } from 'react';
import type { Appointment } from '../types';
import { supabase, getInitials, getColor } from '../utils/supabase';

interface AppointmentCardProps {
    appointment: Appointment;
    onUpdate: (updatedAppointment: Appointment) => void;
}

const StatusBadge: React.FC<{ status: Appointment['status'] }> = ({ status }) => {
    const statusInfo = {
        completed: { text: 'Concluído', style: 'bg-green-100 text-green-800' },
        cancelled: { text: 'Cancelado', style: 'bg-stone-200 text-stone-600' }
    };
    const info = statusInfo[status as keyof typeof statusInfo];
    if (!info) return null;
    return (
        <span className={`mt-1 text-xs font-semibold px-2 py-1 rounded-full ${info.style}`}>
            {info.text}
        </span>
    )
 }

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const ExternalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
);

const WhatsappIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
);

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onUpdate }) => {
    const [isCancelling, setIsCancelling] = useState(false);

    const appointmentDate = new Date(appointment.date + 'T00:00:00');
    const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const handleCancel = async () => {
        if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) return;
        
        setIsCancelling(true);
        const { data, error } = await supabase
            .from('appointments')
            .update({ status: 'cancelled' })
            .eq('id', appointment.id)
            .select()
            .single();
        
        if (error) {
            alert('Não foi possível cancelar o agendamento.');
            console.error('Error cancelling appointment:', error);
        } else if (data) {
            onUpdate(data as Appointment);
        }
        setIsCancelling(false);
    };

    const handleSendWhatsapp = () => {
        const dateStr = appointmentDate.toLocaleDateString('pt-BR');
        let locationInfo = '';
        
        if (appointment.locationType === 'external') {
            locationInfo = `🚌 *Viagem para:* ${appointment.destinationCity}\n🏥 *Local:* ${appointment.healthUnit}\n`;
            if (appointment.externalProfessional) locationInfo += `👨‍⚕️ *Profissional:* ${appointment.externalProfessional}\n`;
        } else {
            locationInfo = appointment.healthUnit ? `📍 *Local:* ${appointment.healthUnit}\n` : '';
        }

        const priceInfo = appointment.price === 0 ? "Gratuito (SUS)" : `R$ ${appointment.price.toFixed(2)}`;

        const message = 
            `*SIAGA - Detalhes do Agendamento*\n\n` +
            `Olá, *${appointment.client_name}*!\n` +
            `Seguem os dados do seu atendimento:\n\n` +
            `🩺 *Serviço:* ${appointment.service_name}\n` +
            `🗓️ *Data:* ${dateStr}\n` +
            `⏰ *Horário:* ${appointment.time}\n` +
            locationInfo +
            `💰 *Valor:* ${priceInfo}\n\n` +
            (appointment.locationType === 'external' ? '⚠️ O transporte sairá antes deste horário. Aguarde contato.' : 'Por favor, chegue com 15 minutos de antecedência.');

        const encodedMessage = encodeURIComponent(message);
        // Abre o seletor de contatos do WhatsApp com a mensagem preenchida
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    };

    const hasValidImage = appointment.professional_image_url && appointment.professional_image_url.startsWith('http');
    const isExternal = appointment.locationType === 'external';

    return (
        <div className={`bg-stone-50 border border-stone-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-shadow hover:shadow-sm ${isExternal ? 'border-l-4 border-l-amber-400' : ''}`}>
            {hasValidImage ? (
                 <img 
                    src={appointment.professional_image_url}
                    alt={appointment.professional_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-stone-200 flex-shrink-0"
                />
            ) : (
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold ${getColor(appointment.professional_name)} flex-shrink-0 border-2 border-stone-200`}>
                    <span className="text-xl">{getInitials(appointment.professional_name)}</span>
                </div>
            )}
            <div className="flex-grow">
                <h3 className="font-bold text-lg text-stone-800">{appointment.service_name}</h3>
                
                {isExternal ? (
                    <>
                        <p className="text-sm text-amber-700 font-semibold flex items-center mt-1">
                            <ExternalIcon /> Em {appointment.destinationCity}
                        </p>
                        <p className="text-xs text-stone-600 ml-5">
                            Local: {appointment.healthUnit}
                            {appointment.externalProfessional && ` • Dr(a). ${appointment.externalProfessional}`}
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-stone-600">com {appointment.professional_name}</p>
                        {appointment.healthUnit && (
                            <p className="text-sm text-teal-700 font-medium mt-1">
                                <LocationIcon /> {appointment.healthUnit}
                            </p>
                        )}
                    </>
                )}
                
                <p className="text-sm text-stone-500 mt-1 capitalize">{formattedDate} às {appointment.time}</p>
            </div>
            <div className="text-right sm:ml-4 flex-shrink-0 flex flex-col items-end gap-2">
                <p className="font-bold text-lg text-rose-600">R$ {appointment.price.toFixed(2)}</p>
                
                <button 
                    onClick={handleSendWhatsapp}
                    className="flex items-center text-xs font-semibold text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-full transition-colors border border-green-200"
                    title="Enviar detalhes por WhatsApp"
                >
                    <WhatsappIcon className="w-4 h-4 mr-1.5" />
                    Enviar Whats
                </button>

                {appointment.status === 'upcoming' && (
                     <button 
                        onClick={handleCancel}
                        disabled={isCancelling}
                        className="text-xs text-stone-500 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed underline">
                        {isCancelling ? 'Cancelando...' : 'Cancelar Agendamento'}
                     </button>
                )}
                {appointment.status !== 'upcoming' && <StatusBadge status={appointment.status} />}
            </div>
        </div>
    );
};
