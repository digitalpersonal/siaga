
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../utils/supabase';
import type { User, Appointment } from '../types';

interface ReminderSystemProps {
    user: User;
}

interface Toast {
    id: string;
    message: string;
    type: 'info' | 'urgent';
}

const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

// Simple beep sound using Web Audio API to avoid external assets
const playNotificationSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Sutil "Ding" sound
        oscillator.type = 'sine';
        const currentTime = audioContext.currentTime;
        
        // Frequência: Começa em 880Hz (A5) e cai para 440Hz (A4)
        oscillator.frequency.setValueAtTime(880, currentTime); 
        oscillator.frequency.exponentialRampToValueAtTime(440, currentTime + 0.5);
        
        // Volume: Ataque rápido e decaimento suave
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, currentTime + 0.05); 
        gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.5); 
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.5);
        
        setTimeout(() => {
            audioContext.close();
        }, 600);
    } catch (e) {
        console.error("Audio feedback not supported in this browser context", e);
    }
};

export const ReminderSystem: React.FC<ReminderSystemProps> = ({ user }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const processingRef = useRef(false);

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        const checkAppointments = async () => {
            // Prevent multiple checks firing at once if request takes long
            if (processingRef.current) return;
            processingRef.current = true;

            try {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const todayStr = `${year}-${month}-${day}`;
                
                let query = supabase
                    .from('appointments')
                    .select('*')
                    .eq('date', todayStr)
                    .eq('status', 'upcoming');

                if (user.role === 'professional') {
                    query = query.eq('professional_id', user.id);
                } else {
                    query = query.eq('client_id', user.id);
                }

                const { data: appointments } = await query;

                if (appointments) {
                    appointments.forEach((appt: Appointment) => {
                        // Construct date strictly to avoid timezone issues with plain strings
                        // Assuming appt.date is YYYY-MM-DD and appt.time is HH:MM
                        const apptDateTime = new Date(`${appt.date}T${appt.time}:00`);
                        const diffMs = apptDateTime.getTime() - now.getTime();
                        const diffMins = Math.floor(diffMs / 60000);

                        // Include date/time in key to handle rescheduling scenarios
                        const baseKey = `reminder_${appt.id}_${appt.date}_${appt.time}`;
                        const key15 = `${baseKey}_15min`;
                        const key60 = `${baseKey}_60min`;

                        if (diffMins >= 0 && diffMins <= 60) {
                            if (diffMins <= 15) {
                                if (!localStorage.getItem(key15)) {
                                    triggerNotification(appt, diffMins, 'urgent');
                                    localStorage.setItem(key15, 'true');
                                    // Also mark 60min as done to prevent back-to-back notifications if user logs in late
                                    localStorage.setItem(key60, 'true'); 
                                }
                            } else if (diffMins > 15 && diffMins <= 60) {
                                 if (!localStorage.getItem(key60)) {
                                    triggerNotification(appt, diffMins, 'info');
                                    localStorage.setItem(key60, 'true');
                                 }
                            }
                        }
                    });
                }
            } catch (error) {
                console.error("Error checking appointments:", error);
            } finally {
                processingRef.current = false;
            }
        };

        const triggerNotification = (appt: Appointment, minutes: number, type: 'info' | 'urgent') => {
            const isClient = user.role !== 'professional';
            const otherPartyName = isClient ? appt.professional_name : appt.client_name;
            const timeText = minutes <= 1 ? "agora" : `em ${minutes} minutos`;
            
            const message = `Seu agendamento de ${appt.service_name} com ${otherPartyName} começa ${timeText} (${appt.time}).`;
            
            // Play the enhanced subtle beep
            playNotificationSound();

            // System Notification
            if ('Notification' in window && Notification.permission === 'granted') {
                try {
                    new Notification('Lembrete SIAGA', {
                        body: message,
                        icon: '/vite.svg', // Ensure this path is valid in your project
                        tag: `appt-${appt.id}-${minutes <= 15 ? 'urgent' : 'info'}`
                    });
                } catch (e) {
                    console.error("Notification API error", e);
                }
            }

            // In-App Toast
            const id = Math.random().toString(36).substring(7);
            setToasts(prev => [...prev, { id, message, type }]);
            
            const duration = type === 'urgent' ? 12000 : 8000;
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration); 
        };

        checkAppointments();
        const interval = setInterval(checkAppointments, 60 * 1000);

        return () => clearInterval(interval);
    }, [user]);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    if (toasts.length === 0) return null;

    return (
        // z-[60] ensures it sits above standard modals (usually z-50)
        // pointer-events-none on container allows clicking through the empty space
        <div className="fixed top-24 right-4 z-[60] space-y-4 max-w-sm w-full px-4 md:px-0 pointer-events-none">
            {toasts.map(toast => (
                <div 
                    key={toast.id} 
                    className={`pointer-events-auto bg-white border-l-4 ${toast.type === 'urgent' ? 'border-red-500' : 'border-rose-500'} shadow-xl rounded-r-lg p-4 flex items-start animate-slide-in relative overflow-hidden`}
                >
                    <div className="flex-shrink-0 mr-3 mt-1">
                        <BellIcon />
                    </div>
                    <div className="flex-grow pr-6">
                        <p className={`font-bold text-sm ${toast.type === 'urgent' ? 'text-red-600' : 'text-stone-800'}`}>
                            {toast.type === 'urgent' ? 'Começa em breve!' : 'Lembrete de Agendamento'}
                        </p>
                        <p className="text-stone-600 text-sm mt-1 leading-relaxed">{toast.message}</p>
                    </div>
                    <div className="absolute top-2 right-2">
                        <button onClick={() => removeToast(toast.id)} className="text-stone-400 hover:text-stone-600 focus:outline-none p-1">
                            <span className="text-lg leading-none">&times;</span>
                        </button>
                    </div>
                </div>
            ))}
            <style>{`
                @keyframes slide-in {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in {
                    animation: slide-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>
        </div>
    );
};
