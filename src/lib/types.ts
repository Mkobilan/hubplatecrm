export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';

export interface Lead {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company: string;
    job_title: string;
    status: LeadStatus;
    source: string;
    estimated_value: number;
    notes: string;
    created_at: string;
    updated_at: string;
}

export type DealStage = 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface Deal {
    id: string;
    user_id: string;
    lead_id: string;
    title: string;
    value: number;
    stage: DealStage;
    expected_close_date: string;
    notes: string;
    created_at: string;
    updated_at: string;
    lead?: Lead;
}

export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task' | 'onboarding';

export interface Activity {
    id: string;
    user_id: string;
    lead_id: string | null;
    type: ActivityType;
    title: string;
    description: string;
    scheduled_at: string | null;
    completed: boolean;
    created_at: string;
    lead?: Lead;
}

export interface CalendarEvent {
    id: string;
    user_id: string;
    lead_id: string | null;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    event_type: 'follow_up' | 'meeting' | 'call' | 'demo' | 'other' | 'onboarding';
    created_at: string;
    lead?: Lead;
}

export interface DashboardStats {
    totalLeads: number;
    newLeadsThisWeek: number;
    totalDeals: number;
    totalPipelineValue: number;
    wonDeals: number;
    wonValue: number;
    activitiesThisWeek: number;
    upcomingEvents: number;
}
