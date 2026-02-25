'use client';

import { useState } from 'react';
import {
    Search,
    Plus,
    Mail,
    Phone,
    Building2,
    MoreHorizontal,
    X,
    User,
    DollarSign,
    StickyNote,
} from 'lucide-react';
import { demoLeads } from '@/lib/demo-data';
import { Lead, LeadStatus } from '@/lib/types';

const statusOptions: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
const sourceOptions = ['Website', 'LinkedIn', 'Referral', 'Cold Email', 'Conference', 'Other'];

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>(demoLeads);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [showDetail, setShowDetail] = useState(false);

    // Form state
    const [form, setForm] = useState({
        first_name: '', last_name: '', email: '', phone: '',
        company: '', job_title: '', status: 'new' as LeadStatus,
        source: 'Website', estimated_value: 0, notes: '',
    });

    const filtered = leads.filter((l) => {
        const matchesSearch =
            `${l.first_name} ${l.last_name} ${l.company} ${l.email}`
                .toLowerCase()
                .includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    function openCreate() {
        setForm({
            first_name: '', last_name: '', email: '', phone: '',
            company: '', job_title: '', status: 'new',
            source: 'Website', estimated_value: 0, notes: '',
        });
        setSelectedLead(null);
        setShowModal(true);
    }

    function openEdit(lead: Lead) {
        setForm({
            first_name: lead.first_name, last_name: lead.last_name,
            email: lead.email, phone: lead.phone,
            company: lead.company, job_title: lead.job_title,
            status: lead.status, source: lead.source,
            estimated_value: lead.estimated_value, notes: lead.notes,
        });
        setSelectedLead(lead);
        setShowModal(true);
    }

    function handleSave() {
        if (selectedLead) {
            setLeads((prev) =>
                prev.map((l) =>
                    l.id === selectedLead.id
                        ? { ...l, ...form, updated_at: new Date().toISOString() }
                        : l
                )
            );
        } else {
            const newLead: Lead = {
                id: `lead-${Date.now()}`,
                user_id: 'demo-user-001',
                ...form,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            setLeads((prev) => [newLead, ...prev]);
        }
        setShowModal(false);
    }

    function handleDelete(id: string) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        setShowDetail(false);
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Leads</h1>
                    <p className="text-[var(--color-text-secondary)]">
                        Manage and track your prospects
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="glow-gradient flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="h-4 w-4" /> Add Lead
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search leads..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${filterStatus === 'all'
                                ? 'bg-[var(--color-brand-600)] text-white'
                                : 'bg-[var(--color-surface-600)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                            }`}
                    >
                        All
                    </button>
                    {statusOptions.map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`rounded-lg px-3 py-2 text-xs font-medium capitalize transition-all ${filterStatus === s
                                    ? 'bg-[var(--color-brand-600)] text-white'
                                    : 'bg-[var(--color-surface-600)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leads Table */}
            <div className="glass-card overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-[var(--color-glass-border)] text-[var(--color-text-muted)]">
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Company</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Value</th>
                            <th className="px-6 py-4 font-medium">Source</th>
                            <th className="px-6 py-4 font-medium"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((lead, i) => (
                            <tr
                                key={lead.id}
                                className="group border-b border-[var(--color-glass-border)] transition-colors hover:bg-[var(--color-glass-hover)] cursor-pointer animate-fade-in"
                                style={{ animationDelay: `${i * 50}ms` }}
                                onClick={() => { setSelectedLead(lead); setShowDetail(true); }}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-600)]/20 text-sm font-semibold text-[var(--color-brand-400)]">
                                            {lead.first_name[0]}{lead.last_name[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-[var(--color-text-primary)]">
                                                {lead.first_name} {lead.last_name}
                                            </p>
                                            <p className="text-xs text-[var(--color-text-muted)]">{lead.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-[var(--color-text-secondary)]">{lead.company}</td>
                                <td className="px-6 py-4">
                                    <span className={`badge badge-${lead.status}`}>{lead.status}</span>
                                </td>
                                <td className="px-6 py-4 font-semibold text-[var(--color-brand-400)]">
                                    ${lead.estimated_value.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-[var(--color-text-muted)]">{lead.source}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openEdit(lead); }}
                                        className="rounded-lg p-2 opacity-0 transition-all group-hover:opacity-100 hover:bg-[var(--color-surface-500)]"
                                    >
                                        <MoreHorizontal className="h-4 w-4 text-[var(--color-text-muted)]" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="py-12 text-center text-[var(--color-text-muted)]">
                        No leads found. Try adjusting your search or filters.
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card w-full max-w-lg p-6 mx-4 animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                                {selectedLead ? 'Edit Lead' : 'New Lead'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="rounded-lg p-2 hover:bg-[var(--color-surface-500)] transition-colors">
                                <X className="h-5 w-5 text-[var(--color-text-muted)]" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'First Name', key: 'first_name', icon: User },
                                { label: 'Last Name', key: 'last_name', icon: User },
                                { label: 'Email', key: 'email', icon: Mail },
                                { label: 'Phone', key: 'phone', icon: Phone },
                                { label: 'Company', key: 'company', icon: Building2 },
                                { label: 'Job Title', key: 'job_title', icon: User },
                            ].map(({ label, key, icon: Icon }) => (
                                <div key={key}>
                                    <label className="mb-1 block text-xs text-[var(--color-text-muted)]">{label}</label>
                                    <div className="relative">
                                        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                                        <input
                                            type="text"
                                            value={(form as Record<string, string | number>)[key] as string}
                                            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                                            className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 pl-9 pr-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors"
                                        />
                                    </div>
                                </div>
                            ))}
                            <div>
                                <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Status</label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as LeadStatus }))}
                                    className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors capitalize"
                                >
                                    {statusOptions.map((s) => (
                                        <option key={s} value={s} className="capitalize">{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Source</label>
                                <select
                                    value={form.source}
                                    onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                                    className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors"
                                >
                                    {sourceOptions.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Estimated Value</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                                    <input
                                        type="number"
                                        value={form.estimated_value}
                                        onChange={(e) => setForm((f) => ({ ...f, estimated_value: Number(e.target.value) }))}
                                        className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 pl-9 pr-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Notes</label>
                                <div className="relative">
                                    <StickyNote className="absolute left-3 top-3 h-4 w-4 text-[var(--color-text-muted)]" />
                                    <textarea
                                        value={form.notes}
                                        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                                        rows={3}
                                        className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 pl-9 pr-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-xl px-5 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="glow-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                            >
                                {selectedLead ? 'Save Changes' : 'Create Lead'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Slide-over */}
            {showDetail && selectedLead && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowDetail(false)}>
                    <div
                        className="h-full w-full max-w-md bg-[var(--color-surface-800)] border-l border-[var(--color-glass-border)] p-6 overflow-y-auto animate-slide-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Lead Details</h2>
                            <button onClick={() => setShowDetail(false)} className="rounded-lg p-2 hover:bg-[var(--color-surface-500)] transition-colors">
                                <X className="h-5 w-5 text-[var(--color-text-muted)]" />
                            </button>
                        </div>

                        {/* Avatar & Name */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-brand-600)]/20 text-xl font-bold text-[var(--color-brand-400)]">
                                {selectedLead.first_name[0]}{selectedLead.last_name[0]}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                                    {selectedLead.first_name} {selectedLead.last_name}
                                </h3>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    {selectedLead.job_title} at {selectedLead.company}
                                </p>
                                <span className={`badge badge-${selectedLead.status} mt-1`}>{selectedLead.status}</span>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-700)] p-3">
                                <Mail className="h-4 w-4 text-[var(--color-brand-400)]" />
                                <span className="text-sm text-[var(--color-text-primary)]">{selectedLead.email}</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-700)] p-3">
                                <Phone className="h-4 w-4 text-[var(--color-brand-400)]" />
                                <span className="text-sm text-[var(--color-text-primary)]">{selectedLead.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-700)] p-3">
                                <Building2 className="h-4 w-4 text-[var(--color-brand-400)]" />
                                <span className="text-sm text-[var(--color-text-primary)]">{selectedLead.company}</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl bg-[var(--color-surface-700)] p-3">
                                <DollarSign className="h-4 w-4 text-green-400" />
                                <span className="text-sm font-semibold text-green-400">
                                    ${selectedLead.estimated_value.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Notes */}
                        {selectedLead.notes && (
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-[var(--color-text-muted)] mb-2">Notes</h4>
                                <p className="rounded-xl bg-[var(--color-surface-700)] p-4 text-sm text-[var(--color-text-secondary)]">
                                    {selectedLead.notes}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDetail(false); openEdit(selectedLead); }}
                                className="flex-1 rounded-xl bg-[var(--color-brand-600)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-brand-700)]"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(selectedLead.id)}
                                className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
