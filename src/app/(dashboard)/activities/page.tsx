'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Phone,
    Mail,
    Video,
    FileText,
    CheckSquare,
    Search,
    Filter,
    MoreVertical,
    Plus,
    Circle,
    CheckCircle2,
    Calendar,
    Loader2,
    X,
    Trash2,
} from 'lucide-react';
import { getActivities, getLeads, updateActivity, createActivity, deleteActivity } from '@/lib/supabase/queries';
import { Activity, ActivityType } from '@/lib/types';

const typeIcons: Record<ActivityType, any> = {
    call: Phone,
    email: Mail,
    meeting: Video,
    note: FileText,
    task: CheckSquare,
};

const typeColors: Record<ActivityType, string> = {
    call: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    email: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    meeting: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    note: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    task: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
};

export default function ActivitiesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<ActivityType | 'all'>('all');
    const [isVisible, setIsVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const queryClient = useQueryClient();

    // Queries
    const { data: activities, isLoading } = useQuery({
        queryKey: ['activities'],
        queryFn: getActivities,
    });

    const { data: leads } = useQuery({
        queryKey: ['leads'],
        queryFn: getLeads,
    });

    // Mutations
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Activity> }) => updateActivity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
        },
    });

    const createMutation = useMutation({
        mutationFn: createActivity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
            setIsModalOpen(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteActivity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
        },
    });

    const filteredActivities = activities?.filter((activity) => {
        const matchesSearch =
            activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.lead?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.lead?.last_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || activity.type === typeFilter;
        return matchesSearch && matchesType;
    }) || [];

    const handleCreateActivity = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const scheduledAt = formData.get('scheduled_at') as string;

        const newActivity = {
            title: formData.get('title') as string,
            type: formData.get('type') as ActivityType,
            lead_id: formData.get('lead_id') as string || null,
            description: formData.get('description') as string,
            scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
            completed: false,
        };
        createMutation.mutate(newActivity as any);
    };

    return (
        <div className="space-y-6 animate-fade-in relative min-h-full pb-20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Activities</h1>
                    <p className="text-[var(--color-text-secondary)]">Track your calls, meetings, and follow-up tasks</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="glow-gradient flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    Log Activity
                </button>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search activities or leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-[var(--color-text-muted)] ml-2" />
                    {(['all', 'call', 'email', 'meeting', 'task', 'note'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${typeFilter === type
                                ? type === 'all'
                                    ? 'bg-[var(--color-brand-600)] text-white shadow-lg shadow-[var(--color-brand-500)]/20'
                                    : `${typeColors[type]} border`
                                : 'bg-[var(--color-surface-700)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-600)]'
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Activity List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-500)]" />
                    </div>
                ) : filteredActivities.length > 0 ? (
                    filteredActivities.map((activity) => {
                        const Icon = typeIcons[activity.type];
                        return (
                            <div
                                key={activity.id}
                                className={`group glass-card flex items-center gap-4 p-4 transition-all hover:bg-[var(--color-surface-700)] ${activity.completed ? 'opacity-60' : ''
                                    }`}
                            >
                                <button
                                    onClick={() => updateMutation.mutate({ id: activity.id, data: { completed: !activity.completed } })}
                                    className={`flex-shrink-0 transition-colors ${activity.completed ? 'text-green-500' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-400)]'
                                        }`}
                                >
                                    {activity.completed ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                                </button>

                                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${activity.completed
                                    ? 'bg-[var(--color-surface-700)] text-gray-500'
                                    : typeColors[activity.type].split(' ')[1] + ' ' + typeColors[activity.type].split(' ')[0]
                                    }`}>
                                    <Icon className="h-5 w-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`truncate text-sm font-semibold text-[var(--color-text-primary)] ${activity.completed ? 'line-through' : ''
                                            }`}>
                                            {activity.title}
                                        </h3>
                                        {activity.lead && (
                                            <span className="text-xs text-[var(--color-text-muted)]">• {activity.lead.first_name} {activity.lead.last_name}</span>
                                        )}
                                    </div>
                                    <div className="mt-1 flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {activity.scheduled_at ? new Date(activity.scheduled_at).toLocaleDateString() : 'No date set'}
                                        </div>
                                        {activity.description && <p className="truncate">• {activity.description}</p>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            if (confirm('Delete activity?')) deleteMutation.mutate(activity.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    <button className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-600)]">
                                        <MoreVertical className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="glass-card flex flex-col items-center justify-center py-20 text-center">
                        <CheckSquare className="mb-4 h-12 w-12 text-[var(--color-text-muted)] opacity-20" />
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">No activities found</h3>
                        <p className="text-sm text-[var(--color-text-secondary)]">Your to-do list is empty. Log an activity to get started.</p>
                    </div>
                )}
            </div>

            {/* Log Activity Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="glass-card w-full max-w-md p-8 animate-fade-in shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Log Activity</h2>
                            <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-600)] transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateActivity} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Activity Title</label>
                                <input name="title" required placeholder="e.g. Follow up on proposal" className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Type</label>
                                    <select name="type" required className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none">
                                        <option value="call">Call</option>
                                        <option value="email">Email</option>
                                        <option value="meeting">Meeting</option>
                                        <option value="task">Task</option>
                                        <option value="note">Note</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Associated Lead</label>
                                    <select name="lead_id" className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none">
                                        <option value="">None</option>
                                        {leads?.map(l => (
                                            <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Scheduled For</label>
                                <input name="scheduled_at" type="datetime-local" className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Description</label>
                                <textarea name="description" rows={3} className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none resize-none" />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl bg-[var(--color-surface-700)] py-2.5 text-sm font-semibold hover:bg-[var(--color-surface-600)] transition-all">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="flex-1 glow-gradient rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'Logging...' : 'Log Activity'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
