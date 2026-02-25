'use client';

import { useState } from 'react';
import {
    Phone,
    Mail,
    Users,
    StickyNote,
    CheckSquare,
    Plus,
    X,
    Check,
    Circle,
    Filter,
} from 'lucide-react';
import { demoActivities, demoLeads } from '@/lib/demo-data';
import { Activity, ActivityType } from '@/lib/types';

const typeIcons: Record<ActivityType, typeof Phone> = {
    call: Phone,
    email: Mail,
    meeting: Users,
    note: StickyNote,
    task: CheckSquare,
};

const typeColors: Record<ActivityType, string> = {
    call: 'text-blue-400 bg-blue-500/10',
    email: 'text-purple-400 bg-purple-500/10',
    meeting: 'text-amber-400 bg-amber-500/10',
    note: 'text-teal-400 bg-teal-500/10',
    task: 'text-green-400 bg-green-500/10',
};

const activityTypes: ActivityType[] = ['call', 'email', 'meeting', 'note', 'task'];

export default function ActivitiesPage() {
    const [activities, setActivities] = useState<Activity[]>(demoActivities);
    const [showModal, setShowModal] = useState(false);
    const [filterType, setFilterType] = useState<ActivityType | 'all'>('all');
    const [filterDone, setFilterDone] = useState<'all' | 'pending' | 'completed'>('all');

    const [form, setForm] = useState({
        type: 'call' as ActivityType,
        title: '', description: '', lead_id: '',
        scheduled_at: '',
    });

    const filtered = activities.filter((a) => {
        const matchesType = filterType === 'all' || a.type === filterType;
        const matchesDone =
            filterDone === 'all' ||
            (filterDone === 'completed' && a.completed) ||
            (filterDone === 'pending' && !a.completed);
        return matchesType && matchesDone;
    });

    function toggleComplete(id: string) {
        setActivities((prev) =>
            prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
        );
    }

    function handleCreate() {
        const newActivity: Activity = {
            id: `act-${Date.now()}`,
            user_id: 'demo-user-001',
            lead_id: form.lead_id,
            type: form.type,
            title: form.title,
            description: form.description,
            scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
            completed: false,
            created_at: new Date().toISOString(),
        };
        setActivities((prev) => [newActivity, ...prev]);
        setShowModal(false);
        setForm({ type: 'call', title: '', description: '', lead_id: '', scheduled_at: '' });
    }

    function handleDelete(id: string) {
        setActivities((prev) => prev.filter((a) => a.id !== id));
    }

    function getLeadName(leadId: string) {
        const lead = demoLeads.find((l) => l.id === leadId);
        return lead ? `${lead.first_name} ${lead.last_name}` : 'Unknown';
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Activities</h1>
                    <p className="text-[var(--color-text-secondary)]">
                        Track calls, emails, meetings, and tasks
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="glow-gradient flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="h-4 w-4" /> Log Activity
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-[var(--color-text-muted)]" />
                    <span className="text-xs text-[var(--color-text-muted)]">Type:</span>
                </div>
                <button
                    onClick={() => setFilterType('all')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${filterType === 'all'
                            ? 'bg-[var(--color-brand-600)] text-white'
                            : 'bg-[var(--color-surface-600)] text-[var(--color-text-secondary)]'
                        }`}
                >
                    All
                </button>
                {activityTypes.map((t) => {
                    const Icon = typeIcons[t];
                    return (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${filterType === t
                                    ? 'bg-[var(--color-brand-600)] text-white'
                                    : 'bg-[var(--color-surface-600)] text-[var(--color-text-secondary)]'
                                }`}
                        >
                            <Icon className="h-3 w-3" /> {t}
                        </button>
                    );
                })}
                <div className="ml-4 flex items-center gap-2">
                    <span className="text-xs text-[var(--color-text-muted)]">Status:</span>
                    {(['all', 'pending', 'completed'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilterDone(s)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${filterDone === s
                                    ? 'bg-[var(--color-brand-600)] text-white'
                                    : 'bg-[var(--color-surface-600)] text-[var(--color-text-secondary)]'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Activity List */}
            <div className="space-y-3">
                {filtered.map((activity, i) => {
                    const Icon = typeIcons[activity.type];
                    const color = typeColors[activity.type];
                    return (
                        <div
                            key={activity.id}
                            className={`glass-card flex items-start gap-4 p-5 animate-fade-in ${activity.completed ? 'opacity-60' : ''
                                }`}
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            {/* Checkbox */}
                            <button
                                onClick={() => toggleComplete(activity.id)}
                                className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border transition-all ${activity.completed
                                        ? 'border-green-500 bg-green-500/20 text-green-400'
                                        : 'border-[var(--color-glass-border)] hover:border-[var(--color-brand-500)] text-transparent hover:text-[var(--color-brand-400)]'
                                    }`}
                            >
                                {activity.completed ? (
                                    <Check className="h-3.5 w-3.5" />
                                ) : (
                                    <Circle className="h-3.5 w-3.5" />
                                )}
                            </button>

                            {/* Icon */}
                            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
                                <Icon className="h-5 w-5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className={`text-sm font-medium ${activity.completed
                                                ? 'line-through text-[var(--color-text-muted)]'
                                                : 'text-[var(--color-text-primary)]'
                                            }`}>
                                            {activity.title}
                                        </p>
                                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                            {getLeadName(activity.lead_id)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {activity.scheduled_at && (
                                            <span className="text-xs text-[var(--color-text-muted)]">
                                                {new Date(activity.scheduled_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                                                })}
                                            </span>
                                        )}
                                        <button
                                            onClick={() => handleDelete(activity.id)}
                                            className="rounded-lg p-1.5 hover:bg-red-500/10 transition-colors"
                                        >
                                            <X className="h-3.5 w-3.5 text-[var(--color-text-muted)] hover:text-red-400" />
                                        </button>
                                    </div>
                                </div>
                                {activity.description && (
                                    <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                                        {activity.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="py-12 text-center text-[var(--color-text-muted)]">
                        No activities found.
                    </div>
                )}
            </div>

            {/* Create Activity Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card w-full max-w-md p-6 mx-4 animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Log Activity</h2>
                            <button onClick={() => setShowModal(false)} className="rounded-lg p-2 hover:bg-[var(--color-surface-500)] transition-colors">
                                <X className="h-5 w-5 text-[var(--color-text-muted)]" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {/* Type Selection */}
                            <div>
                                <label className="mb-2 block text-xs text-[var(--color-text-muted)]">Type</label>
                                <div className="flex gap-2">
                                    {activityTypes.map((t) => {
                                        const Icon = typeIcons[t];
                                        return (
                                            <button
                                                key={t}
                                                onClick={() => setForm((f) => ({ ...f, type: t }))}
                                                className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-3 text-xs font-medium capitalize transition-all ${form.type === t
                                                        ? 'bg-[var(--color-brand-600)]/20 text-[var(--color-brand-400)] ring-1 ring-[var(--color-brand-500)]'
                                                        : 'bg-[var(--color-surface-600)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                                                    }`}
                                            >
                                                <Icon className="h-4 w-4" />
                                                {t}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                    className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors"
                                    placeholder="Activity title"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Lead</label>
                                <select
                                    value={form.lead_id}
                                    onChange={(e) => setForm((f) => ({ ...f, lead_id: e.target.value }))}
                                    className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors"
                                >
                                    <option value="">Select a lead</option>
                                    {demoLeads.map((l) => (
                                        <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Scheduled</label>
                                <input
                                    type="datetime-local"
                                    value={form.scheduled_at}
                                    onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))}
                                    className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    rows={3}
                                    className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors resize-none"
                                    placeholder="Describe the activity..."
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleCreate} className="glow-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95">
                                Log Activity
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
