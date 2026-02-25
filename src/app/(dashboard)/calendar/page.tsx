'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar as CalendarIcon,
    Clock,
    User,
    MoreVertical,
    Loader2,
    X,
    Trash2,
    Pencil,
} from 'lucide-react';
import { getCalendarEvents, getLeads, createCalendarEvent, deleteCalendarEvent, updateCalendarEvent } from '@/lib/supabase/queries';
import { CalendarEvent } from '@/lib/types';

const typeColors: Record<string, string> = {
    demo: 'bg-green-500/15 text-green-400 border-green-500/30',
    meeting: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    follow_up: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    call: 'bg-red-500/15 text-red-400 border-red-500/30',
    other: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
};

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

    const queryClient = useQueryClient();

    // Queries
    const { data: events, isLoading: eventsLoading } = useQuery({
        queryKey: ['calendar-events'],
        queryFn: getCalendarEvents,
    });

    const { data: leads } = useQuery({
        queryKey: ['leads'],
        queryFn: getLeads,
    });

    // Mutations
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CalendarEvent> }) => updateCalendarEvent(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
            setEditingEvent(null);
        },
    });

    const createMutation = useMutation({
        mutationFn: createCalendarEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
            setIsModalOpen(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCalendarEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
        },
    });

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const handleCreateEvent = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const date = selectedDate || new Date();
        const startTime = formData.get('start_time') as string;
        const endTime = formData.get('end_time') as string;

        const startDateTime = new Date(date);
        const [startH, startM] = startTime.split(':');
        startDateTime.setHours(Number(startH), Number(startM));

        const endDateTime = new Date(date);
        const [endH, endM] = endTime.split(':');
        endDateTime.setHours(Number(endH), Number(endM));

        const newEvent = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            lead_id: formData.get('lead_id') as string || null,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            event_type: formData.get('event_type') as any,
        };
        createMutation.mutate(newEvent);
    };

    const dayEvents = (day: number) => {
        return events?.filter((e) => {
            const eDate = new Date(e.start_time);
            return eDate.getDate() === day && eDate.getMonth() === month && eDate.getFullYear() === year;
        }) || [];
    };

    if (eventsLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-500)]" />
            </div>
        );
    }

    return (
        <div className="grid h-[calc(100vh-120px)] grid-cols-1 gap-6 lg:grid-cols-4 animate-fade-in">
            {/* Calendar Grid */}
            <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h1>
                        <div className="flex items-center rounded-xl bg-[var(--color-surface-800)] p-1">
                            <button
                                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                                className="rounded-lg p-2 hover:bg-[var(--color-surface-700)] text-[var(--color-text-muted)] hover:text-white"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setCurrentDate(new Date())}
                                className="px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-white"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                                className="rounded-lg p-2 hover:bg-[var(--color-surface-700)] text-[var(--color-text-muted)] hover:text-white"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedDate(new Date());
                            setIsModalOpen(true);
                        }}
                        className="glow-gradient flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        New Event
                    </button>
                </div>

                <div className="glass-card flex h-[calc(100%-80px)] flex-col overflow-hidden">
                    <div className="grid grid-cols-7 bg-[var(--color-surface-800)] text-center text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="py-4 border-b border-[var(--color-glass-border)]">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="flex-1 grid grid-cols-7 overflow-y-auto min-h-0">
                        {Array.from({ length: firstDayOfMonth(year, month) }).map((_, i) => (
                            <div key={`empty-${i}`} className="border-b border-r border-[var(--color-glass-border)] bg-black/10" />
                        ))}
                        {Array.from({ length: daysInMonth(year, month) }).map((_, i) => {
                            const day = i + 1;
                            const isToday =
                                new Date().getDate() === day &&
                                new Date().getMonth() === month &&
                                new Date().getFullYear() === year;
                            const hasEvents = dayEvents(day).length > 0;

                            return (
                                <div
                                    key={day}
                                    className={`group relative flex h-full min-h-[100px] flex-col border-b border-r border-[var(--color-glass-border)] transition-colors hover:bg-white/5 ${isToday ? 'bg-[var(--color-brand-600)]/5' : ''
                                        }`}
                                    onClick={() => setSelectedDate(new Date(year, month, day))}
                                    onDoubleClick={() => setIsModalOpen(true)}
                                >
                                    <div className="flex justify-end p-2">
                                        <span
                                            className={`text-xs font-bold leading-none ${isToday
                                                ? 'flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-brand-600)] text-white'
                                                : 'text-[var(--color-text-muted)]'
                                                }`}
                                        >
                                            {day}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1 px-1 custom-scrollbar overflow-y-auto flex-1 pb-1">
                                        {dayEvents(day).map((event) => (
                                            <div
                                                key={event.id}
                                                className={`event-${event.event_type} rounded-lg border px-1.5 py-0.5 text-[10px] font-medium leading-tight truncate`}
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Side Panel */}
            <div className="flex flex-col gap-6 overflow-hidden">
                <div className="glass-card flex h-full flex-col p-6 animate-slide-in-right">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                            {selectedDate ? selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) : 'Select a date'}
                        </h2>
                        <div className="rounded-lg bg-[var(--color-surface-700)] p-2">
                            <CalendarIcon className="h-4 w-4 text-[var(--color-brand-400)]" />
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                        {selectedDate && dayEvents(selectedDate.getDate()).length > 0 ? (
                            dayEvents(selectedDate.getDate()).map((event) => (
                                <div key={event.id} className="group glass-card overflow-hidden bg-[var(--color-surface-700)] p-4 transition-all hover:bg-[var(--color-surface-600)]">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className={`badge border text-[10px] lowercase ${typeColors[event.event_type] || typeColors.other}`}>
                                            {event.event_type.replace('_', ' ')}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingEvent(event);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-blue-400 hover:bg-blue-500/10 rounded"
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm('Delete event?')) deleteMutation.mutate(event.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-400 hover:bg-red-500/10 rounded"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-2">{event.title}</h4>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                                            <Clock className="h-3 w-3" />
                                            {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        {event.lead && (
                                            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                                                <User className="h-3 w-3 text-[var(--color-brand-400)]" />
                                                {event.lead.first_name} {event.lead.last_name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--color-text-muted)]">
                                <CalendarIcon className="mb-4 h-12 w-12 opacity-10" />
                                <p className="text-xs">No events scheduled</p>
                            </div>
                        )}
                    </div>

                    {selectedDate && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-6 w-full rounded-xl bg-[var(--color-surface-700)] py-3 text-xs font-bold text-[var(--color-text-primary)] transition-all hover:bg-[var(--color-brand-600)]"
                        >
                            Schedule Something
                        </button>
                    )}
                </div>
            </div>

            {/* Schedule/Edit Event Modal */}
            {(isModalOpen || editingEvent) && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="glass-card w-full max-w-md p-8 animate-fade-in shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{editingEvent ? 'Edit Event' : 'Schedule Event'}</h2>
                            <button onClick={() => { setIsModalOpen(false); setEditingEvent(null); }} className="rounded-lg p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-600)] transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const date = selectedDate || (editingEvent ? new Date(editingEvent.start_time) : new Date());
                                const startTime = formData.get('start_time') as string;
                                const endTime = formData.get('end_time') as string;

                                const startDateTime = new Date(date);
                                const [startH, startM] = startTime.split(':');
                                startDateTime.setHours(Number(startH), Number(startM));

                                const endDateTime = new Date(date);
                                const [endH, endM] = endTime.split(':');
                                endDateTime.setHours(Number(endH), Number(endM));

                                const eventData = {
                                    title: formData.get('title') as string,
                                    description: formData.get('description') as string,
                                    lead_id: formData.get('lead_id') as string || null,
                                    start_time: startDateTime.toISOString(),
                                    end_time: endDateTime.toISOString(),
                                    event_type: formData.get('event_type') as any,
                                };

                                if (editingEvent) {
                                    updateMutation.mutate({ id: editingEvent.id, data: eventData });
                                } else {
                                    createMutation.mutate(eventData);
                                }
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Title</label>
                                <input name="title" required defaultValue={editingEvent?.title} placeholder="e.g. Coffee Meeting with David" className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Type</label>
                                <select name="event_type" required defaultValue={editingEvent?.event_type || 'meeting'} className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none">
                                    <option value="follow_up">Follow Up</option>
                                    <option value="meeting">Meeting</option>
                                    <option value="call">Call</option>
                                    <option value="demo">Demo</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Associated Lead (Optional)</label>
                                <select name="lead_id" defaultValue={editingEvent?.lead_id || ''} className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none">
                                    <option value="">None</option>
                                    {leads?.map(l => (
                                        <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Start Time</label>
                                    <input name="start_time" type="time" required defaultValue={editingEvent ? new Date(editingEvent.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : ''} className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">End Time</label>
                                    <input name="end_time" type="time" required defaultValue={editingEvent ? new Date(editingEvent.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : ''} className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Description</label>
                                <textarea name="description" rows={3} defaultValue={editingEvent?.description} className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none resize-none" />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => { setIsModalOpen(false); setEditingEvent(null); }} className="flex-1 rounded-xl bg-[var(--color-surface-700)] py-2.5 text-sm font-semibold hover:bg-[var(--color-surface-600)] transition-all">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex-1 glow-gradient rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {createMutation.isPending || updateMutation.isPending ? 'Processing...' : (editingEvent ? 'Save Changes' : 'Schedule')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
