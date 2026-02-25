'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateProfile } from '@/lib/supabase/queries';
import { Settings, User, Bell, Shield, Palette, Loader2 } from 'lucide-react';

export default function SettingsPage() {
    const [profile, setProfile] = useState<{ full_name: string; email: string; role: string; team: string } | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const supabase = createClient();

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                // Fetch profile from our profiles table
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                setProfile({
                    full_name: profileData?.full_name || user.user_metadata?.full_name || 'Sales Rep',
                    email: user.email || '',
                    role: profileData?.role || 'Sales Representative',
                    team: profileData?.team || 'General Sales',
                });
            }
            setLoading(false);
        }
        loadProfile();
    }, [supabase]);

    const updateProfile = async (id: string, updates: { full_name?: string; role?: string; team?: string }) => {
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id);
        if (error) throw error;
    };

    const handleSave = async () => {
        if (!userId || !profile) return;
        setSaving(true);
        setMessage(null);
        try {
            await updateProfile(userId, {
                full_name: profile.full_name,
                role: profile.role,
                team: profile.team
            });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-500)]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-3xl">
            <div>
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Settings</h1>
                <p className="text-[var(--color-text-secondary)]">Manage your account and preferences</p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {message.text}
                </div>
            )}

            {/* Profile */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="rounded-xl bg-[var(--color-brand-600)]/15 p-2.5">
                        <User className="h-5 w-5 text-[var(--color-brand-400)]" />
                    </div>
                    <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Profile</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Full Name</label>
                        <input
                            type="text"
                            value={profile?.full_name || ''}
                            onChange={(e) => setProfile(p => p ? { ...p, full_name: e.target.value } : null)}
                            className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Email</label>
                        <input
                            type="text"
                            value={profile?.email || ''}
                            disabled
                            className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors disabled:opacity-50"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Role</label>
                        <input
                            type="text"
                            value={profile?.role || ''}
                            onChange={(e) => setProfile(p => p ? { ...p, role: e.target.value } : null)}
                            className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Team</label>
                        <input
                            type="text"
                            value={profile?.team || ''}
                            onChange={(e) => setProfile(p => p ? { ...p, team: e.target.value } : null)}
                            className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="rounded-xl bg-amber-500/15 p-2.5">
                        <Bell className="h-5 w-5 text-amber-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Notifications</h2>
                </div>
                <div className="space-y-4">
                    {[
                        { label: 'Email notifications for new leads', desc: 'Get notified when a new lead is assigned to you' },
                        { label: 'Daily pipeline summary', desc: 'Receive a daily email with your pipeline status' },
                        { label: 'Activity reminders', desc: 'Get reminded about upcoming calls and meetings' },
                    ].map(({ label, desc }, i) => (
                        <div key={label} className="flex items-center justify-between rounded-xl bg-[var(--color-surface-700)] p-4">
                            <div>
                                <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
                                <p className="text-xs text-[var(--color-text-muted)]">{desc}</p>
                            </div>
                            <label className="relative inline-flex cursor-pointer items-center">
                                <input type="checkbox" defaultChecked={i < 2} className="peer sr-only" />
                                <div className="h-6 w-11 rounded-full bg-[var(--color-surface-500)] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[var(--color-brand-600)] peer-checked:after:translate-x-full" />
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Appearance */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="rounded-xl bg-purple-500/15 p-2.5">
                        <Palette className="h-5 w-5 text-purple-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Appearance</h2>
                </div>
                <div className="flex gap-4">
                    <button className="flex-1 rounded-xl bg-[var(--color-surface-900)] border-2 border-[var(--color-brand-500)] p-4 text-center transition-all">
                        <div className="mx-auto mb-2 h-8 w-8 rounded-lg bg-[var(--color-surface-700)]" />
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">Dark</p>
                        <p className="text-xs text-[var(--color-brand-400)]">Active</p>
                    </button>
                    <button className="flex-1 rounded-xl bg-gray-100 border-2 border-transparent p-4 text-center transition-all hover:border-[var(--color-glass-border)]">
                        <div className="mx-auto mb-2 h-8 w-8 rounded-lg bg-gray-300" />
                        <p className="text-sm font-medium text-gray-700">Light</p>
                        <p className="text-xs text-gray-400">Coming soon</p>
                    </button>
                </div>
            </div>

            {/* Save */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="glow-gradient rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
