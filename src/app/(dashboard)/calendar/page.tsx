'use client';

import { useState, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    X,
    Clock,
} from 'lucide-react';
import { demoCalendarEvents, demoLeads } from '@/lib/demo-data';
import { CalendarEvent } from '@/lib/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EVENT_TYPES: CalendarEvent['event_type'][] = ['follow_up', 'meeting', 'call', 'demo', 'other'];

export default function CalendarPage() {
    const [events, setEvents] = useState<CalendarEvent[]>(demoCalendarEvents);
    const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Feb 2026
    const [showModal, setShowModal] = useState(false);
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [form, setForm] = useState({
        title: '', description: '', start_time: '', end_time: '',
        event_type: 'meeting' as CalendarEvent['event_type'], lead_id: '',
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPad = firstDay.getDay();
        const days: (Date | null)[] = [];

        for (let i = 0; i < startPad; i++) days.push(null);
        for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
        const remaining = 7 - (days.length % 7);
        if (remaining < 7) for (let i = 0; i < remaining; i++) days.push(null);

        return days;
    }, [year, month]);

    function getEventsForDay(date: Date) {
        return events.filter((e) => {
            const d = new Date(e.start_time);
            return d.getFullYear() === date.getFullYear() &&
                d.getMonth() === date.getMonth() &&
                d.getDate() === date.getDate();
        });
    }

    function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)); }
    function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)); }

    function openCreateForDay(day: Date) {
        const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
        setForm({
            title: '', description: '',
            start_time: `${dateStr}T09:00`, end_time: `${dateStr}T10:00`,
            event_type: 'meeting', lead_id: '',
        });
        setSelectedDay(day);
        setShowModal(true);
    }

    function handleCreate() {
        const newEvent: CalendarEvent = {
            id: `evt-${Date.now()}`,
            user_id: 'demo-user-001',
            lead_id: form.lead_id || null,
            title: form.title,
            description: form.description,
            start_time: new Date(form.start_time).toISOString(),
            end_time: new Date(form.end_time).toISOString(),
            event_type: form.event_type,
            created_at: new Date().toISOString(),
        };
        setEvents((prev) => [...prev, newEvent]);
        setShowModal(false);
    }

    function handleDelete(id: string) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
    }

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    };

    // Click a day to show its events
    const dayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Calendar</h1>
                    <p className="text-[var(--color-text-secondary)]">
                        Schedule follow-ups and appointments
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Grid */}
                <div className="lg:col-span-2 glass-card p-6">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={prevMonth} className="rounded-xl p-2 hover:bg-[var(--color-surface-500)] transition-colors">
                            <ChevronLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
                        </button>
                        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{monthName}</h2>
                        <button onClick={nextMonth} className="rounded-xl p-2 hover:bg-[var(--color-surface-500)] transition-colors">
                            <ChevronRight className="h-5 w-5 text-[var(--color-text-secondary)]" />
                        </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS.map((d) => (
                            <div key={d} className="py-2 text-center text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Day Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, i) => {
                            if (!day) return <div key={`empty-${i}`} className="h-24 rounded-xl" />;
                            const dayEvts = getEventsForDay(day);
                            const selected = selectedDay && day.getDate() === selectedDay.getDate() && day.getMonth() === selectedDay.getMonth();
                            return (
                                <button
                                    key={day.toISOString()}
                                    className={`h-24 rounded-xl p-2 text-left transition-all hover:bg-[var(--color-glass-hover)] cursor-pointer ${selected ? 'ring-2 ring-[var(--color-brand-500)] bg-[var(--color-glass-hover)]' : ''
                                        } ${isToday(day) ? 'bg-[var(--color-brand-600)]/10' : ''}`}
                                    onClick={() => setSelectedDay(day)}
                                    onDoubleClick={() => openCreateForDay(day)}
                                >
                                    <span className={`text-sm font-medium ${isToday(day) ? 'text-[var(--color-brand-400)] font-bold' : 'text-[var(--color-text-primary)]'
                                        }`}>
                                        {day.getDate()}
                                    </span>
                                    <div className="mt-1 space-y-0.5">
                                        {dayEvts.slice(0, 2).map((e) => (
                                            <div
                                                key={e.id}
                                                className={`event-${e.event_type} truncate rounded px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-primary)] bg-[var(--color-surface-600)]`}
                                            >
                                                {e.title}
                                            </div>
                                        ))}
                                        {dayEvts.length > 2 && (
                                            <span className="text-[10px] text-[var(--color-text-muted)]">
                                                +{dayEvts.length - 2} more
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Day Detail Panel */}
                <div className="glass-card p-6">
                    {selectedDay ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                                    {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </h3>
                                <button
                                    onClick={() => openCreateForDay(selectedDay)}
                                    className="rounded-lg bg-[var(--color-brand-600)] p-2 transition-all hover:bg-[var(--color-brand-700)]"
                                >
                                    <Plus className="h-4 w-4 text-white" />
                                </button>
                            </div>
                            {dayEvents.length === 0 ? (
                                <div className="py-12 text-center">
                                    <p className="text-sm text-[var(--color-text-muted)]">No events this day</p>
                                    <button
                                        onClick={() => openCreateForDay(selectedDay)}
                                        className="mt-3 text-sm font-medium text-[var(--color-brand-400)] hover:underline"
                                    >
                                        Add an event
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {dayEvents.map((e) => (
                                        <div key={e.id} className={`event-${e.event_type} rounded-xl bg-[var(--color-surface-700)] p-4 transition-all hover:bg-[var(--color-surface-600)]`}>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{e.title}</p>
                                                    <div className="flex items-center gap-1 mt-1 text-xs text-[var(--color-text-muted)]">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(e.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                        {' – '}
                                                        {new Date(e.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                    </div>
                                                    {e.description && (
                                                        <p className="mt-2 text-xs text-[var(--color-text-secondary)]">{e.description}</p>
                                                    )}
                                                    <span className="mt-2 badge badge-contacted capitalize text-[10px]">
                                                        {e.event_type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(e.id)}
                                                    className="rounded-lg p-1 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <X className="h-3.5 w-3.5 text-[var(--color-text-muted)] hover:text-red-400" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-sm text-[var(--color-text-muted)]">Select a day to see events</p>
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">Double-click a day to create an event</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Event Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card w-full max-w-md p-6 mx-4 animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">New Event</h2>
                            <button onClick={() => setShowModal(false)} className="rounded-lg p-2 hover:bg-[var(--color-surface-500)] transition-colors">
                                <X className="h-5 w-5 text-[var(--color-text-muted)]" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                    className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors"
                                    placeholder="Event title"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Start</label>
                                    <input
                                        type="datetime-local"
                                        value={form.start_time}
                                        onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                                        className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-[var(--color-text-muted)]">End</label>
                                    <input
                                        type="datetime-local"
                                        value={form.end_time}
                                        onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                                        className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Type</label>
                                    <select
                                        value={form.event_type}
                                        onChange={(e) => setForm((f) => ({ ...f, event_type: e.target.value as CalendarEvent['event_type'] }))}
                                        className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors capitalize"
                                    >
                                        {EVENT_TYPES.map((t) => (
                                            <option key={t} value={t} className="capitalize">{t.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Lead (optional)</label>
                                    <select
                                        value={form.lead_id}
                                        onChange={(e) => setForm((f) => ({ ...f, lead_id: e.target.value }))}
                                        className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors"
                                    >
                                        <option value="">None</option>
                                        {demoLeads.map((l) => (
                                            <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    rows={2}
                                    className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors resize-none"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleCreate} className="glow-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95">
                                Create Event
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
