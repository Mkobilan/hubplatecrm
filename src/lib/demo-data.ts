import { Lead, Deal, Activity, CalendarEvent, DashboardStats } from './types';

// ─── Demo data so the app works immediately without Supabase ───
const DEMO_USER_ID = 'demo-user-001';

export const demoLeads: Lead[] = [
    {
        id: 'lead-1', user_id: DEMO_USER_ID,
        first_name: 'Sarah', last_name: 'Chen',
        email: 'sarah.chen@techcorp.io', phone: '(555) 234-5678',
        company: 'TechCorp Solutions', job_title: 'VP of Engineering',
        status: 'qualified', source: 'LinkedIn',
        estimated_value: 85000, notes: 'Interested in enterprise plan. Follow up next week.',
        created_at: '2026-02-20T10:00:00Z', updated_at: '2026-02-24T15:00:00Z',
    },
    {
        id: 'lead-2', user_id: DEMO_USER_ID,
        first_name: 'Marcus', last_name: 'Johnson',
        email: 'mjohnson@innovate.co', phone: '(555) 876-5432',
        company: 'Innovate Co', job_title: 'CEO',
        status: 'proposal', source: 'Referral',
        estimated_value: 120000, notes: 'Sent proposal on Feb 22. Awaiting feedback.',
        created_at: '2026-02-18T09:00:00Z', updated_at: '2026-02-22T11:00:00Z',
    },
    {
        id: 'lead-3', user_id: DEMO_USER_ID,
        first_name: 'Emily', last_name: 'Rodriguez',
        email: 'emily.r@globalfin.com', phone: '(555) 345-6789',
        company: 'Global Finance Ltd', job_title: 'Director of Operations',
        status: 'new', source: 'Website',
        estimated_value: 45000, notes: 'Downloaded whitepaper. Cold outreach pending.',
        created_at: '2026-02-24T14:00:00Z', updated_at: '2026-02-24T14:00:00Z',
    },
    {
        id: 'lead-4', user_id: DEMO_USER_ID,
        first_name: 'David', last_name: 'Park',
        email: 'dpark@nexgen.io', phone: '(555) 456-7890',
        company: 'NexGen Systems', job_title: 'CTO',
        status: 'contacted', source: 'Conference',
        estimated_value: 67000, notes: 'Met at SaaS Summit. Very engaged.',
        created_at: '2026-02-19T08:00:00Z', updated_at: '2026-02-23T10:00:00Z',
    },
    {
        id: 'lead-5', user_id: DEMO_USER_ID,
        first_name: 'Jessica', last_name: 'Wang',
        email: 'jwang@brightpath.com', phone: '(555) 567-8901',
        company: 'BrightPath Analytics', job_title: 'Head of Product',
        status: 'won', source: 'Referral',
        estimated_value: 95000, notes: 'Deal closed! Onboarding scheduled for March.',
        created_at: '2026-02-10T09:00:00Z', updated_at: '2026-02-25T09:00:00Z',
    },
    {
        id: 'lead-6', user_id: DEMO_USER_ID,
        first_name: 'Alex', last_name: 'Thompson',
        email: 'alex.t@cloudware.dev', phone: '(555) 678-9012',
        company: 'Cloudware Dev', job_title: 'Engineering Manager',
        status: 'new', source: 'Cold Email',
        estimated_value: 52000, notes: 'Responded positively to initial outreach.',
        created_at: '2026-02-25T08:00:00Z', updated_at: '2026-02-25T08:00:00Z',
    },
];

export const demoDeals: Deal[] = [
    {
        id: 'deal-1', user_id: DEMO_USER_ID, lead_id: 'lead-1',
        title: 'TechCorp Enterprise License', value: 85000,
        stage: 'qualified', expected_close_date: '2026-03-15',
        notes: 'Moving to proposal stage soon.', created_at: '2026-02-20T10:00:00Z', updated_at: '2026-02-24T15:00:00Z',
    },
    {
        id: 'deal-2', user_id: DEMO_USER_ID, lead_id: 'lead-2',
        title: 'Innovate Co Full Suite', value: 120000,
        stage: 'proposal', expected_close_date: '2026-03-01',
        notes: 'Proposal sent, decision expected next week.', created_at: '2026-02-18T09:00:00Z', updated_at: '2026-02-22T11:00:00Z',
    },
    {
        id: 'deal-3', user_id: DEMO_USER_ID, lead_id: 'lead-4',
        title: 'NexGen Integration Package', value: 67000,
        stage: 'prospect', expected_close_date: '2026-04-01',
        notes: 'Initial discovery call completed.', created_at: '2026-02-19T08:00:00Z', updated_at: '2026-02-23T10:00:00Z',
    },
    {
        id: 'deal-4', user_id: DEMO_USER_ID, lead_id: 'lead-5',
        title: 'BrightPath Analytics Deal', value: 95000,
        stage: 'won', expected_close_date: '2026-02-25',
        notes: 'Closed-won! Starting onboarding.', created_at: '2026-02-10T09:00:00Z', updated_at: '2026-02-25T09:00:00Z',
    },
    {
        id: 'deal-5', user_id: DEMO_USER_ID, lead_id: 'lead-3',
        title: 'Global Finance Starter', value: 45000,
        stage: 'prospect', expected_close_date: '2026-04-15',
        notes: 'New lead, needs nurturing.', created_at: '2026-02-24T14:00:00Z', updated_at: '2026-02-24T14:00:00Z',
    },
];

export const demoActivities: Activity[] = [
    {
        id: 'act-1', user_id: DEMO_USER_ID, lead_id: 'lead-1',
        type: 'call', title: 'Discovery Call with Sarah',
        description: 'Discussed their current tech stack and pain points. Very interested in our enterprise features.',
        scheduled_at: '2026-02-24T14:00:00Z', completed: true, created_at: '2026-02-24T14:00:00Z',
    },
    {
        id: 'act-2', user_id: DEMO_USER_ID, lead_id: 'lead-2',
        type: 'email', title: 'Sent Proposal to Marcus',
        description: 'Emailed the full proposal with pricing breakdown and implementation timeline.',
        scheduled_at: '2026-02-22T10:00:00Z', completed: true, created_at: '2026-02-22T10:00:00Z',
    },
    {
        id: 'act-3', user_id: DEMO_USER_ID, lead_id: 'lead-4',
        type: 'meeting', title: 'Coffee with David Park',
        description: 'Informal meeting to discuss potential partnership opportunities.',
        scheduled_at: '2026-02-26T09:00:00Z', completed: false, created_at: '2026-02-23T10:00:00Z',
    },
    {
        id: 'act-4', user_id: DEMO_USER_ID, lead_id: 'lead-1',
        type: 'task', title: 'Prepare demo for TechCorp',
        description: 'Create a customized demo highlighting enterprise features.',
        scheduled_at: '2026-02-27T11:00:00Z', completed: false, created_at: '2026-02-24T16:00:00Z',
    },
    {
        id: 'act-5', user_id: DEMO_USER_ID, lead_id: 'lead-3',
        type: 'email', title: 'Follow-up email to Emily',
        description: 'Send a personalized follow-up with case studies relevant to their industry.',
        scheduled_at: '2026-02-26T15:00:00Z', completed: false, created_at: '2026-02-25T08:00:00Z',
    },
    {
        id: 'act-6', user_id: DEMO_USER_ID, lead_id: 'lead-5',
        type: 'call', title: 'Onboarding kickoff with Jessica',
        description: 'Schedule and prepare for the onboarding kickoff call.',
        scheduled_at: '2026-02-28T10:00:00Z', completed: false, created_at: '2026-02-25T09:00:00Z',
    },
];

export const demoCalendarEvents: CalendarEvent[] = [
    {
        id: 'evt-1', user_id: DEMO_USER_ID, lead_id: 'lead-1',
        title: 'TechCorp Demo Presentation', description: 'Present customized demo of enterprise features.',
        start_time: '2026-02-27T14:00:00Z', end_time: '2026-02-27T15:30:00Z',
        event_type: 'demo', created_at: '2026-02-24T16:00:00Z',
    },
    {
        id: 'evt-2', user_id: DEMO_USER_ID, lead_id: 'lead-4',
        title: 'Coffee Meeting - David Park', description: 'Informal discussion about NexGen partnership.',
        start_time: '2026-02-26T09:00:00Z', end_time: '2026-02-26T10:00:00Z',
        event_type: 'meeting', created_at: '2026-02-23T10:00:00Z',
    },
    {
        id: 'evt-3', user_id: DEMO_USER_ID, lead_id: 'lead-2',
        title: 'Follow-up Call - Marcus', description: 'Follow up on the proposal sent last week.',
        start_time: '2026-02-28T11:00:00Z', end_time: '2026-02-28T11:30:00Z',
        event_type: 'follow_up', created_at: '2026-02-22T11:00:00Z',
    },
    {
        id: 'evt-4', user_id: DEMO_USER_ID, lead_id: 'lead-5',
        title: 'BrightPath Onboarding Kickoff', description: 'First onboarding session with the BrightPath team.',
        start_time: '2026-02-28T10:00:00Z', end_time: '2026-02-28T11:00:00Z',
        event_type: 'meeting', created_at: '2026-02-25T09:00:00Z',
    },
    {
        id: 'evt-5', user_id: DEMO_USER_ID, lead_id: null,
        title: 'Weekly Sales Review', description: 'Internal team meeting to review pipeline and forecasts.',
        start_time: '2026-03-03T15:00:00Z', end_time: '2026-03-03T16:00:00Z',
        event_type: 'other', created_at: '2026-02-20T08:00:00Z',
    },
    {
        id: 'evt-6', user_id: DEMO_USER_ID, lead_id: 'lead-6',
        title: 'Intro Call - Alex Thompson', description: 'Initial intro call with Cloudware Dev.',
        start_time: '2026-03-01T13:00:00Z', end_time: '2026-03-01T13:30:00Z',
        event_type: 'call', created_at: '2026-02-25T10:00:00Z',
    },
];

export const demoDashboardStats: DashboardStats = {
    totalLeads: 6,
    newLeadsThisWeek: 2,
    totalDeals: 5,
    totalPipelineValue: 412000,
    wonDeals: 1,
    wonValue: 95000,
    activitiesThisWeek: 4,
    upcomingEvents: 5,
};
