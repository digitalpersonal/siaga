import React, { useState, useMemo } from 'react';
import type { Appointment, ProfessionalUser } from '../types';

interface ProfessionalCalendarProps {
    appointmentsByDate: Map<string, Appointment[]>;
    settings: ProfessionalUser['settings'];
    onDateSelect: (date: Date) => void;
}

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
);
const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
);


export const ProfessionalCalendar: React.FC<ProfessionalCalendarProps> = ({ appointmentsByDate, settings, onDateSelect }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDay = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday

    const calendarDays = useMemo(() => {
        const days = [];
        // Add empty cells for days before the start of the month
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }
        // Add cells for each day of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
        }
        return days;
    }, [currentDate, daysInMonth, startingDay]);
    
    const getAppointmentsForDay = (day: Date) => {
        const dateStr = day.toISOString().split('T')[0];
        return appointmentsByDate.get(dateStr) || [];
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };
    
    const isToday = (day: Date) => {
        const today = new Date();
        return day.getDate() === today.getDate() && day.getMonth() === today.getMonth() && day.getFullYear() === today.getFullYear();
    }

    const handleKeyDown = (e: React.KeyboardEvent, day: Date | null) => {
        if (!day) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onDateSelect(day);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-stone-100"><ChevronLeftIcon /></button>
                <h2 className="text-xl font-bold text-stone-800">
                    {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
                </h2>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-stone-100"><ChevronRightIcon /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm font-semibold text-stone-500 mb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                    if (!day) return <div key={`empty-${index}`} className="border rounded-lg h-24"></div>;

                    const dayAppointments = getAppointmentsForDay(day);
                    const dayOfWeek = day.getDay();
                    const dateStr = day.toISOString().split('T')[0];
                    const isWorkDay = settings.workDays.includes(dayOfWeek);
                    const isBlockedDay = settings.blockedDays.includes(dateStr);
                    const isInactive = !isWorkDay || isBlockedDay;

                    return (
                        <div
                            key={day.toISOString()}
                            role="button"
                            tabIndex={isInactive ? -1 : 0}
                            aria-label={`Ver agendamentos para ${day.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}`}
                            onClick={() => !isInactive && onDateSelect(day)}
                            onKeyDown={(e) => !isInactive && handleKeyDown(e, day)}
                            className={`border rounded-lg h-28 p-2 text-left flex flex-col focus:outline-none focus:ring-2 focus:ring-teal-400 ${isInactive ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'bg-white hover:bg-teal-50 cursor-pointer'}`}
                        >
                            <span className={`font-semibold ${isToday(day) ? 'bg-teal-600 text-white rounded-full h-6 w-6 flex items-center justify-center' : ''}`}>
                                {day.getDate()}
                            </span>
                            {!isInactive && dayAppointments.length > 0 && (
                                <div className="mt-auto text-xs space-y-1">
                                    {dayAppointments.slice(0, 2).map(appt => (
                                        <div key={appt.id} className="bg-teal-100 text-teal-800 p-1 rounded truncate">
                                           {appt.time} {appt.client_name.split(' ')[0]}
                                        </div>
                                    ))}
                                    {dayAppointments.length > 2 && (
                                        <div className="text-stone-500">
                                            + {dayAppointments.length - 2} mais
                                        </div>
                                    )}
                                </div>
                            )}
                            {isInactive && (
                                <div className="text-xs mt-auto text-center">{isBlockedDay ? 'Bloqueado' : 'Folga'}</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};