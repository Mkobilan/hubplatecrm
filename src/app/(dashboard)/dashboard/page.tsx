'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import {
    Users,
    TrendingUp,
    DollarSign,
    Trophy,
    CalendarCheck,
    Activity,
    ArrowUpRight,
    Sparkles,
    Loader2,
} from 'lucide-react';
import { getDashboardStats, getDeals, getActivities, getCalendarEvents } from '@/lib/supabase/queries';

const stageColors: Record<string, string> = {
    prospect: 'bg-blue-500',
    qualified: 'bg-amber-500',
    proposal: 'bg-purple-500',
    negotiation: 'bg-cyan-500',
    won: 'bg-green-500',
    lost: 'bg-red-500',
};

export default function DashboardPage() {
    const supabase = createClient();
    const { data: profile } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            return data;
        },
    });

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: getDashboardStats,
    });

    const { data: deals, isLoading: dealsLoading } = useQuery({
        queryKey: ['deals'],
        queryFn: getDeals,
    });

    const { data: activities, isLoading: activitiesLoading } = useQuery({
        queryKey: ['activities'],
        queryFn: getActivities,
    });

    const { data: events, isLoading: eventsLoading } = useQuery({
        queryKey: ['calendar-events'],
        queryFn: getCalendarEvents,
    });

    if (statsLoading || dealsLoading || activitiesLoading || eventsLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-500)]" />
            </div>
        );
    }

    const firstName = profile?.full_name?.split(' ')[0];

    const statItems = [
        { label: 'Total Leads', value: stats?.totalLeads || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'New This Week', value: stats?.newLeadsThisWeek || 0, icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Active Deals', value: stats?.totalDeals || 0, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Pipeline Value', value: `$${((stats?.totalPipelineValue || 0) / 1000).toFixed(0)}k`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Won Deals', value: stats?.wonDeals || 0, icon: Trophy, color: 'text-green-400', bg: 'bg-green-500/10' },
        { label: 'Won Value', value: `$${((stats?.wonValue || 0) / 1000).toFixed(0)}k`, icon: DollarSign, color: 'text-teal-400', bg: 'bg-teal-500/10' },
        { label: 'Activities', value: stats?.activitiesThisWeek || 0, icon: Activity, color: 'text-rose-400', bg: 'bg-rose-500/10' },
        { label: 'Upcoming Events', value: stats?.upcomingEvents || 0, icon: CalendarCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    ];

    const recentDeals = deals?.slice(0, 5) || [];
    const upcomingActivities = activities?.filter((a) => !a.completed).slice(0, 5) || [];
    const upcomingEvents = events?.filter(e => new Date(e.start_time) > new Date()).slice(0, 4) || [];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                    Good morning{firstName ? `, ${firstName}` : ''}! <span className="text-gradient">☀️</span>
                </h1>
                <p className="mt-1 text-[var(--color-text-secondary)]">
                    Here&apos;s your sales overview for today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statItems.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="glass-card p-5 animate-fade-in"
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            <div className="flex items-center justify-between">
                                <div className={`${stat.bg} rounded-xl p-3`}>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-[var(--color-text-muted)]" />
                            </div>
                            <div className="mt-4">
                                <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                                    {stat.value}
                                </p>
                                <p className="text-sm text-[var(--color-text-secondary)]">{stat.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Deals */}
                <div className="glass-card p-6">
                    <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
                        Recent Deals
                    </h2>
                    <div className="space-y-3">
                        {recentDeals.length > 0 ? (
                            recentDeals.map((deal) => (
                                <div
                                    key={deal.id}
                                    className="flex items-center justify-between rounded-xl bg-[var(--color-surface-700)] p-4 transition-all hover:bg-[var(--color-surface-600)]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${stageColors[deal.stage] || 'bg-gray-500'}`} />
                                        <div>
                                            <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                                {deal.title}
                                            </p>
                                            <p className="text-xs text-[var(--color-text-muted)] capitalize">
                                                {deal.stage}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-[var(--color-brand-400)]">
                                        ${Number(deal.value).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-[var(--color-text-muted)] text-center py-4">No deals found.</p>
                        )}
                    </div>
                </div>

                {/* Upcoming Activities */}
                <div className="glass-card p-6">
                    <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
                        Upcoming Activities
                    </h2>
                    <div className="space-y-3">
                        {upcomingActivities.length > 0 ? (
                            upcomingActivities.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-center justify-between rounded-xl bg-[var(--color-surface-700)] p-4 transition-all hover:bg-[var(--color-surface-600)]"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                            {activity.title}
                                        </p>
                                        <p className="text-xs text-[var(--color-text-muted)]">
                                            {activity.scheduled_at
                                                ? new Date(activity.scheduled_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                })
                                                : 'No date'}
                                        </p>
                                    </div>
                                    <span className={`badge badge-${activity.type === 'call' ? 'new' : activity.type === 'email' ? 'contacted' : 'qualified'}`}>
                                        {activity.type}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-[var(--color-text-muted)] text-center py-4">No upcoming activities.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Upcoming Calendar Events */}
            <div className="glass-card p-6">
                <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
                    Upcoming Events
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {upcomingEvents.length > 0 ? (
                        upcomingEvents.map((event, i) => (
                            <div
                                key={event.id}
                                className={`event-${event.event_type} rounded-xl bg-[var(--color-surface-700)] p-4 transition-all hover:bg-[var(--color-surface-600)] animate-fade-in`}
                                style={{ animationDelay: `${i * 80}ms` }}
                            >
                                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                                    {event.title}
                                </p>
                                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                    {new Date(event.start_time).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </p>
                                <p className="text-xs text-[var(--color-text-muted)]">
                                    {new Date(event.start_time).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                    })}{' '}
                                    –{' '}
                                    {new Date(event.end_time).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                    })}
                                </p>
                                <span className="mt-2 badge badge-contacted capitalize text-[10px]">
                                    {event.event_type.replace('_', ' ')}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-[var(--color-text-muted)] text-center py-4 col-span-full">No upcoming events.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
