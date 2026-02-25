'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Zap, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            router.push('/dashboard');
            router.refresh();
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-900)] p-4 font-sans antialiased text-[var(--color-text-primary)]">
            <div className="w-full max-w-md space-y-8 animate-fade-in">
                {/* Logo & Header */}
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl glow-gradient animate-pulse-glow">
                        <Zap className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">
                        Welcome back to <span className="text-gradient">HubPlate</span>
                    </h1>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Sign in to manage your sales pipeline
                    </p>
                </div>

                {/* Login Form */}
                <div className="glass-card p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20 animate-slide-in">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-3 pl-11 pr-4 text-sm text-white placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 transition-all duration-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-3 pl-11 pr-4 text-sm text-white placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 transition-all duration-200"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="h-4 w-4 rounded border-[var(--color-glass-border)] bg-[var(--color-surface-700)] text-[var(--color-brand-500)] focus:ring-0" />
                                <span className="group-hover:text-[var(--color-text-secondary)] transition-colors">Remember me</span>
                            </label>
                            <button type="button" className="font-medium text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] transition-colors">
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="glow-gradient relative w-full rounded-xl bg-[var(--color-brand-600)] py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-[var(--color-brand-500)]/25 active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {loading ? (
                                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-xs text-[var(--color-text-muted)]">
                        Don&apos;t have an account?{' '}
                        <button className="font-semibold text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] transition-colors">
                            Contact your administrator
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
