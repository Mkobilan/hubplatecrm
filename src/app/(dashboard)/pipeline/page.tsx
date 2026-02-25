'use client';

import { useState } from 'react';
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from '@hello-pangea/dnd';
import { DollarSign, GripVertical, Plus, X, Calendar } from 'lucide-react';
import { demoDeals, demoLeads } from '@/lib/demo-data';
import { Deal, DealStage } from '@/lib/types';

const stages: { key: DealStage; label: string; className: string }[] = [
    { key: 'prospect', label: 'Prospect', className: 'stage-prospect' },
    { key: 'qualified', label: 'Qualified', className: 'stage-qualified' },
    { key: 'proposal', label: 'Proposal', className: 'stage-proposal' },
    { key: 'negotiation', label: 'Negotiation', className: 'stage-negotiation' },
    { key: 'won', label: 'Won', className: 'stage-won' },
    { key: 'lost', label: 'Lost', className: 'stage-lost' },
];

export default function PipelinePage() {
    const [deals, setDeals] = useState<Deal[]>(demoDeals);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        title: '', value: 0, stage: 'prospect' as DealStage,
        lead_id: '', expected_close_date: '', notes: '',
    });

    function onDragEnd(result: DropResult) {
        if (!result.destination) return;
        const dealId = result.draggableId;
        const newStage = result.destination.droppableId as DealStage;
        setDeals((prev) =>
            prev.map((d) => (d.id === dealId ? { ...d, stage: newStage, updated_at: new Date().toISOString() } : d))
        );
    }

    function handleCreate() {
        const newDeal: Deal = {
            id: `deal-${Date.now()}`,
            user_id: 'demo-user-001',
            lead_id: form.lead_id,
            title: form.title,
            value: form.value,
            stage: form.stage,
            expected_close_date: form.expected_close_date,
            notes: form.notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        setDeals((prev) => [...prev, newDeal]);
        setShowModal(false);
        setForm({ title: '', value: 0, stage: 'prospect', lead_id: '', expected_close_date: '', notes: '' });
    }

    function getStageValue(stage: DealStage) {
        return deals.filter((d) => d.stage === stage).reduce((sum, d) => sum + d.value, 0);
    }

    function getLeadName(leadId: string) {
        const lead = demoLeads.find((l) => l.id === leadId);
        return lead ? `${lead.first_name} ${lead.last_name}` : 'Unknown';
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Pipeline</h1>
                    <p className="text-[var(--color-text-secondary)]">
                        Drag and drop deals across stages
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="glow-gradient flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="h-4 w-4" /> New Deal
                </button>
            </div>

            {/* Kanban Board */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-6 gap-4 overflow-x-auto pb-4">
                    {stages.map((stage) => {
                        const stageDeals = deals.filter((d) => d.stage === stage.key);
                        const totalValue = getStageValue(stage.key);
                        return (
                            <Droppable droppableId={stage.key} key={stage.key}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`glass-card ${stage.className} min-h-[500px] rounded-2xl p-4 transition-all ${snapshot.isDraggingOver ? 'ring-2 ring-[var(--color-brand-500)]/50 bg-[var(--color-glass-hover)]' : ''
                                            }`}
                                    >
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                                                    {stage.label}
                                                </h3>
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-surface-500)] text-xs text-[var(--color-text-muted)]">
                                                    {stageDeals.length}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                                ${totalValue.toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            {stageDeals.map((deal, index) => (
                                                <Draggable key={deal.id} draggableId={deal.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`rounded-xl bg-[var(--color-surface-700)] p-4 transition-all hover:bg-[var(--color-surface-600)] ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-[var(--color-brand-500)] rotate-2' : ''
                                                                }`}
                                                        >
                                                            <div className="flex items-start gap-2">
                                                                <GripVertical className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-text-muted)]" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                                                                        {deal.title}
                                                                    </p>
                                                                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                                                        {getLeadName(deal.lead_id)}
                                                                    </p>
                                                                    <div className="flex items-center justify-between mt-3">
                                                                        <span className="flex items-center gap-1 text-xs font-semibold text-[var(--color-brand-400)]">
                                                                            <DollarSign className="h-3 w-3" />
                                                                            {deal.value.toLocaleString()}
                                                                        </span>
                                                                        {deal.expected_close_date && (
                                                                            <span className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
                                                                                <Calendar className="h-3 w-3" />
                                                                                {new Date(deal.expected_close_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        );
                    })}
                </div>
            </DragDropContext>

            {/* New Deal Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card w-full max-w-md p-6 mx-4 animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">New Deal</h2>
                            <button onClick={() => setShowModal(false)} className="rounded-lg p-2 hover:bg-[var(--color-surface-500)] transition-colors">
                                <X className="h-5 w-5 text-[var(--color-text-muted)]" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                    className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors"
                                    placeholder="Deal title"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Value ($)</label>
                                    <input
                                        type="number"
                                        value={form.value}
                                        onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
                                        className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Stage</label>
                                    <select
                                        value={form.stage}
                                        onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value as DealStage }))}
                                        className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors capitalize"
                                    >
                                        {stages.map((s) => (
                                            <option key={s.key} value={s.key}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Lead</label>
                                <select
                                    value={form.lead_id}
                                    onChange={(e) => setForm((f) => ({ ...f, lead_id: e.target.value }))}
                                    className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors"
                                >
                                    <option value="">Select a lead</option>
                                    {demoLeads.map((l) => (
                                        <option key={l.id} value={l.id}>{l.first_name} {l.last_name} — {l.company}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Expected Close Date</label>
                                <input
                                    type="date"
                                    value={form.expected_close_date}
                                    onChange={(e) => setForm((f) => ({ ...f, expected_close_date: e.target.value }))}
                                    className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-[var(--color-text-muted)]">Notes</label>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                                    rows={2}
                                    className="w-full rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-surface-700)] py-2 px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand-500)] transition-colors resize-none"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleCreate} className="glow-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95">
                                Create Deal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
