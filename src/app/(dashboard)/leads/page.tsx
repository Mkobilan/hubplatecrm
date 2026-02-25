'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Filter,
    Plus,
    MoreVertical,
    Mail,
    Phone,
    Building2,
    ChevronRight,
    ExternalLink,
    Loader2,
    Trash2,
    X,
} from 'lucide-react';
import { getLeads, createLead, updateLead, deleteLead } from '@/lib/supabase/queries';
import { Lead, LeadStatus } from '@/lib/types';

const statusBadgeMap: Record<LeadStatus, string> = {
    new: 'badge-new',
    contacted: 'badge-contacted',
    qualified: 'badge-qualified',
    proposal: 'badge-proposal',
    won: 'badge-won',
    lost: 'badge-lost',
};

const statusColorMap: Record<LeadStatus, string> = {
    new: 'bg-blue-500/10 text-blue-400',
    contacted: 'bg-purple-500/10 text-purple-400',
    qualified: 'bg-amber-500/10 text-amber-400',
    proposal: 'bg-indigo-500/10 text-indigo-400',
    won: 'bg-emerald-500/10 text-emerald-400',
    lost: 'bg-red-500/10 text-red-400',
};

export default function LeadsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const queryClient = useQueryClient();

    // Queries
    const { data: leads, isLoading } = useQuery({
        queryKey: ['leads'],
        queryFn: getLeads,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: createLead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            setIsModalOpen(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) => updateLead(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            setSelectedLead(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteLead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            setSelectedLead(null);
        },
    });

    const filteredLeads = leads?.filter((lead) => {
        const matchesSearch =
            `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    }) || [];

    const handleCreateLead = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newLeadData = {
            first_name: formData.get('first_name') as string,
            last_name: formData.get('last_name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            company: formData.get('company') as string,
            status: formData.get('status') as LeadStatus,
            estimated_value: Number(formData.get('estimated_value')),
            notes: '',
            job_title: '',
            source: '',
        };
        createMutation.mutate(newLeadData);
    };

    return (
        <div className="space-y-6 animate-fade-in relative min-h-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Leads</h1>
                    <p className="text-[var(--color-text-secondary)]">Manage and track your potential prospects</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="glow-gradient flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    Add Lead
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search leads by name or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
                    <Filter className="h-4 w-4 text-[var(--color-text-muted)] ml-2" />
                    {(['all', 'new', 'contacted', 'qualified', 'proposal', 'won', 'lost'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${statusFilter === status
                                ? 'bg-[var(--color-brand-600)] text-white shadow-lg shadow-[var(--color-brand-500)]/20'
                                : 'bg-[var(--color-surface-700)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-600)] hover:text-[var(--color-text-primary)]'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leads Table */}
            <div className="glass-card overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-500)]" />
                    </div>
                ) : filteredLeads.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[var(--color-surface-800)] text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Lead Name</th>
                                    <th className="px-6 py-4 font-semibold">Company</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Value</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-glass-border)]">
                                {filteredLeads.map((lead) => (
                                    <tr
                                        key={lead.id}
                                        onClick={() => setSelectedLead(lead)}
                                        className="group cursor-pointer transition-colors hover:bg-[var(--color-brand-500)]/5"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold ${statusColorMap[lead.status]}`}>
                                                    {lead.first_name[0]}{lead.last_name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-[var(--color-text-primary)]">{lead.first_name} {lead.last_name}</p>
                                                    <p className="text-xs text-[var(--color-text-muted)]">{lead.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-3.5 w-3.5" />
                                                {lead.company}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${statusBadgeMap[lead.status]}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-[var(--color-text-primary)]">
                                            ${Number(lead.estimated_value).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="rounded-lg p-1 text-[var(--color-text-muted)] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[var(--color-surface-600)] hover:text-[var(--color-text-primary)]">
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-4 rounded-full bg-[var(--color-surface-700)] p-4">
                            <Plus className="h-8 w-8 text-[var(--color-text-muted)]" />
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">No leads found</h3>
                        <p className="text-sm text-[var(--color-text-secondary)]">Start building your pipeline by adding your first lead.</p>
                    </div>
                )}
            </div>

            {/* Detail Slide-over */}
            {selectedLead && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div
                        className="h-full w-full max-w-lg bg-[var(--color-surface-800)] p-8 shadow-2xl shadow-black animate-slide-in flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`h-14 w-14 flex items-center justify-center rounded-2xl text-xl font-bold ${statusColorMap[selectedLead.status]}`}>
                                    {selectedLead.first_name[0]}{selectedLead.last_name[0]}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{selectedLead.first_name} {selectedLead.last_name}</h2>
                                    <p className="text-[var(--color-text-muted)]">{selectedLead.company}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedLead(null)} className="rounded-xl p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-700)] hover:text-white transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-8 overflow-y-auto pr-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass-card p-4">
                                    <p className="mb-1 text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Status</p>
                                    <select
                                        value={selectedLead.status}
                                        onChange={(e) => updateMutation.mutate({ id: selectedLead.id, data: { status: e.target.value as LeadStatus } })}
                                        className="w-full bg-transparent text-sm font-semibold text-[var(--color-brand-400)] outline-none cursor-pointer"
                                    >
                                        <option value="new">New</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="qualified">Qualified</option>
                                        <option value="proposal">Proposal</option>
                                        <option value="won">Won</option>
                                        <option value="lost">Lost</option>
                                    </select>
                                </div>
                                <div className="glass-card p-4">
                                    <p className="mb-1 text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Estimated Value</p>
                                    <p className="text-sm font-semibold text-emerald-400">${Number(selectedLead.estimated_value).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Contact Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-700)] p-4">
                                        <Mail className="h-4 w-4 text-[var(--color-text-muted)]" />
                                        <span className="text-sm">{selectedLead.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-700)] p-4">
                                        <Phone className="h-4 w-4 text-[var(--color-text-muted)]" />
                                        <span className="text-sm">{selectedLead.phone}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Actions</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-glass-border)] py-3 text-sm font-medium transition-all hover:bg-[var(--color-surface-700)]">
                                        <Mail className="h-4 w-4" /> Send Email
                                    </button>
                                    <button className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-glass-border)] py-3 text-sm font-medium transition-all hover:bg-[var(--color-surface-700)]">
                                        <Phone className="h-4 w-4" /> Log Call
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-[var(--color-glass-border)]">
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this lead?')) {
                                        deleteMutation.mutate(selectedLead.id);
                                    }
                                }}
                                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
                            >
                                <Trash2 className="h-4 w-4" /> Delete Lead
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Lead Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="glass-card w-full max-w-md p-8 animate-fade-in shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Add New Lead</h2>
                            <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-600)] transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateLead} className="space-y-4 overflow-y-auto pr-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">First Name</label>
                                    <input name="first_name" required className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Last Name</label>
                                    <input name="last_name" required className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Email</label>
                                <input name="email" type="email" required className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Phone</label>
                                <input name="phone" className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Company</label>
                                <input name="company" required className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Status</label>
                                <select name="status" className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none">
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="qualified">Qualified</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Estimated Value</label>
                                <input name="estimated_value" type="number" defaultValue="0" className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl bg-[var(--color-surface-700)] py-2.5 text-sm font-semibold hover:bg-[var(--color-surface-600)] transition-all">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="flex-1 glow-gradient rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'Adding...' : 'Add Lead'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
