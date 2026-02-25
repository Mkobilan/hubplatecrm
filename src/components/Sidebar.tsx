'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    LayoutDashboard,
    Users,
    Kanban,
    CalendarDays,
    Activity,
    Settings,
    LogOut,
    Zap,
} from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/leads', label: 'Leads', icon: Users },
    { href: '/pipeline', label: 'Pipeline', icon: Kanban },
    { href: '/calendar', label: 'Calendar', icon: CalendarDays },
    { href: '/activities', label: 'Activities', icon: Activity },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[var(--color-glass-border)] bg-[var(--color-surface-800)]">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-6">
                <div className="glow-gradient flex h-10 w-10 items-center justify-center rounded-xl">
                    <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-[var(--color-text-primary)]">HubPlate</h1>
                    <p className="text-xs text-[var(--color-text-muted)]">Sales CRM</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="mt-2 flex-1 space-y-1 px-3">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                ${isActive
                                    ? 'bg-[var(--color-brand-600)]/15 text-[var(--color-brand-400)] shadow-lg shadow-[var(--color-brand-600)]/5'
                                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-glass-hover)] hover:text-[var(--color-text-primary)]'
                                }`}
                        >
                            <Icon
                                className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-[var(--color-brand-400)]' : ''
                                    }`}
                            />
                            {item.label}
                            {isActive && (
                                <div className="ml-auto h-2 w-2 rounded-full bg-[var(--color-brand-400)] animate-pulse-glow" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="border-t border-[var(--color-glass-border)] p-3 space-y-1">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition-all hover:bg-[var(--color-glass-hover)] hover:text-[var(--color-text-primary)]"
                >
                    <Settings className="h-5 w-5" />
                    Settings
                </Link>
                <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[var(--color-text-muted)] transition-all hover:bg-red-500/10 hover:text-red-400"
                >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
