import { createClient } from './client';
import { Lead, Deal, Activity, CalendarEvent, DashboardStats } from '../types';

const supabase = createClient();

// ─── LEADS ───
export async function getLeads() {
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Lead[];
}

export async function createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('leads')
        .insert([{ ...lead, user_id: user.id }])
        .select()
        .single();
    if (error) throw error;
    return data as Lead;
}

export async function updateLead(id: string, lead: Partial<Lead>) {
    const { data, error } = await supabase
        .from('leads')
        .update(lead)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data as Lead;
}

export async function deleteLead(id: string) {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;
}

// ─── DEALS ───
export async function getDeals() {
    const { data, error } = await supabase
        .from('deals')
        .select('*, lead:leads(*)')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Deal[];
}

export async function createDeal(deal: Omit<Deal, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('deals')
        .insert([{ ...deal, user_id: user.id }])
        .select()
        .single();
    if (error) throw error;
    return data as Deal;
}

export async function updateDeal(id: string, deal: Partial<Deal>) {
    const { data, error } = await supabase
        .from('deals')
        .update(deal)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data as Deal;
}

// ─── ACTIVITIES ───
export async function getActivities() {
    const { data, error } = await supabase
        .from('activities')
        .select('*, lead:leads(*)')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Activity[];
}

export async function createActivity(activity: Omit<Activity, 'id' | 'created_at' | 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('activities')
        .insert([{ ...activity, user_id: user.id }])
        .select()
        .single();
    if (error) throw error;
    return data as Activity;
}

export async function updateActivity(id: string, activity: Partial<Activity>) {
    const { data, error } = await supabase
        .from('activities')
        .update(activity)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data as Activity;
}

export async function deleteActivity(id: string) {
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) throw error;
}

// ─── CALENDAR EVENTS ───
export async function getCalendarEvents() {
    const { data, error } = await supabase
        .from('calendar_events')
        .select('*, lead:leads(*)')
        .order('start_time', { ascending: true });
    if (error) throw error;
    return data as CalendarEvent[];
}

export async function createCalendarEvent(event: Omit<CalendarEvent, 'id' | 'created_at' | 'user_id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('calendar_events')
        .insert([{ ...event, user_id: user.id }])
        .select()
        .single();
    if (error) throw error;
    return data as CalendarEvent;
}

export async function updateCalendarEvent(id: string, event: Partial<CalendarEvent>) {
    const { data, error } = await supabase
        .from('calendar_events')
        .update(event)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data as CalendarEvent;
}

export async function deleteCalendarEvent(id: string) {
    const { error } = await supabase.from('calendar_events').delete().eq('id', id);
    if (error) throw error;
}

// ─── DASHBOARD STATS ───
export async function getDashboardStats(): Promise<DashboardStats> {
    const [leads, deals, activities, events] = await Promise.all([
        getLeads(),
        getDeals(),
        getActivities(),
        getCalendarEvents(),
    ]);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const newLeadsThisWeek = leads.filter(l => new Date(l.created_at) > weekAgo).length;
    const wonDeals = deals.filter(d => d.stage === 'won');
    const wonLeads = leads.filter(l => l.status === 'won');

    const totalDealsValue = deals.reduce((sum, d) => sum + Number(d.value), 0);
    const totalLeadsValue = leads.reduce((sum, l) => sum + Number(l.estimated_value || 0), 0);
    const totalPipelineValue = totalDealsValue + totalLeadsValue;

    const wonDealsValue = wonDeals.reduce((sum, d) => sum + Number(d.value), 0);
    const wonLeadsValue = wonLeads.reduce((sum, l) => sum + Number(l.estimated_value || 0), 0);
    const wonValue = wonDealsValue + wonLeadsValue;

    const activitiesThisWeek = activities.filter(a => new Date(a.created_at) > weekAgo).length;
    const upcomingEvents = events.filter(e => new Date(e.start_time) > now).length;

    return {
        totalLeads: leads.length,
        newLeadsThisWeek,
        totalDeals: deals.length,
        totalPipelineValue,
        wonDeals: wonDeals.length,
        wonValue,
        activitiesThisWeek,
        upcomingEvents,
    };
}

// ─── PROFILES ───
export async function updateProfile(id: string, profile: { full_name: string; role: string; team: string }) {
    const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}
