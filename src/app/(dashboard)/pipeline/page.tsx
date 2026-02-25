'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, DollarSign, MoreHorizontal, User, Calendar, Loader2, X } from 'lucide-react';
import { getDeals, updateDeal, createDeal, getLeads } from '@/lib/supabase/queries';
import { Deal, DealStage } from '@/lib/types';

const STAGES: { id: DealStage; title: string; color: string }[] = [
    { id: 'prospect', title: 'Prospecting', color: 'border-blue-500/50' },
    { id: 'qualified', title: 'Qualified', color: 'border-amber-500/50' },
    { id: 'proposal', title: 'Proposal', color: 'border-purple-500/50' },
    { id: 'negotiation', title: 'Negotiation', color: 'border-cyan-500/50' },
    { id: 'won', title: 'Won', color: 'border-green-500/50' },
    { id: 'lost', title: 'Lost', color: 'border-red-500/50' },
];

export default function PipelinePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();

    // Queries
    const { data: deals, isLoading: dealsLoading } = useQuery({
        queryKey: ['deals'],
        queryFn: getDeals,
    });

    const { data: leads } = useQuery({
        queryKey: ['leads'],
        queryFn: getLeads,
    });

    // Mutations
    const updateStageMutation = useMutation({
        mutationFn: ({ id, stage }: { id: string; stage: DealStage }) => updateDeal(id, { stage }),
        onMutate: async ({ id, stage }) => {
            await queryClient.cancelQueries({ queryKey: ['deals'] });
            const previousDeals = queryClient.getQueryData(['deals']);
            queryClient.setQueryData(['deals'], (old: Deal[] | undefined) =>
                old?.map((d) => (d.id === id ? { ...d, stage } : d))
            );
            return { previousDeals };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['deals'], context?.previousDeals);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['deals'] });
        },
    });

    const createMutation = useMutation({
        mutationFn: createDeal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deals'] });
            setIsModalOpen(false);
        },
    });

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        updateStageMutation.mutate({
            id: draggableId,
            stage: destination.droppableId as DealStage,
        });
    };

    const handleCreateDeal = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newDeal = {
            title: formData.get('title') as string,
            lead_id: formData.get('lead_id') as string,
            value: Number(formData.get('value')),
            stage: 'prospect' as DealStage,
            expected_close_date: formData.get('expected_close_date') as string,
            notes: '',
        };
        createMutation.mutate(newDeal);
    };

    if (dealsLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-500)]" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-120px)] flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Sales Pipeline</h1>
                    <p className="text-[var(--color-text-secondary)]">Drag and drop deals between stages to update progress</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="glass-card flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--color-text-muted)]">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                        Pipeline Value:
                        <span className="font-bold text-white">${deals?.reduce((sum, d) => sum + Number(d.value), 0).toLocaleString()}</span>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="glow-gradient flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        New Deal
                    </button>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
                    <div className="flex h-full min-w-max gap-4 px-1">
                        {STAGES.map((stage) => {
                            const stageDeals = deals?.filter((d) => d.stage === stage.id) || [];
                            const stageValue = stageDeals.reduce((sum, d) => sum + Number(d.value), 0);

                            return (
                                <div key={stage.id} className="flex h-full w-72 flex-col gap-3 rounded-2xl bg-black/20 p-3">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
                                                {stage.title}
                                            </h3>
                                            <span className="rounded-full bg-[var(--color-surface-600)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-text-muted)]">
                                                {stageDeals.length}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-bold text-emerald-400/80">${(stageValue / 1000).toFixed(0)}k</p>
                                    </div>

                                    <Droppable droppableId={stage.id}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableId}
                                                ref={provided.innerRef}
                                                className={`flex flex-1 flex-col gap-3 rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-white/5' : ''
                                                    }`}
                                            >
                                                {stageDeals.map((deal, index) => (
                                                    <Draggable key={deal.id} draggableId={deal.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`group glass-card overflow-hidden border-t-2 ${stage.color} p-4 transition-all hover:border-[var(--color-brand-500)] ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl z-50 ring-2 ring-[var(--color-brand-400)]' : ''
                                                                    }`}
                                                            >
                                                                <div className="mb-3 flex items-start justify-between">
                                                                    <h4 className="text-sm font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-400)] transition-colors">
                                                                        {deal.title}
                                                                    </h4>
                                                                    <button className="rounded-lg p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-700)]">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                                                        <User className="h-3 w-3" />
                                                                        {deal.lead ? `${deal.lead.first_name} ${deal.lead.last_name}` : 'No Lead'}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                                                        <Calendar className="h-3 w-3" />
                                                                        {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : 'N/A'}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-4 flex items-center justify-between border-t border-[var(--color-glass-border)] pt-3">
                                                                    <span className="text-xs text-[var(--color-text-muted)]">Value</span>
                                                                    <span className="text-sm font-bold text-emerald-400">${Number(deal.value).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </DragDropContext>

            {/* New Deal Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="glass-card w-full max-w-md p-8 animate-fade-in shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">New Deal</h2>
                            <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-600)] transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateDeal} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Deal Title</label>
                                <input name="title" required placeholder="e.g. Enterprise License" className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Associated Lead</label>
                                <select name="lead_id" required className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none">
                                    <option value="">Select a lead...</option>
                                    {leads?.map(l => (
                                        <option key={l.id} value={l.id}>{l.first_name} {l.last_name} ({l.company})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Value ($)</label>
                                <input name="value" type="number" required defaultValue="0" className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase mb-1">Expected Close Date</label>
                                <input name="expected_close_date" type="date" required className="w-full bg-[var(--color-surface-700)] border border-[var(--color-glass-border)] rounded-lg py-2 px-3 text-sm focus:border-[var(--color-brand-500)] outline-none" />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl bg-[var(--color-surface-700)] py-2.5 text-sm font-semibold hover:bg-[var(--color-surface-600)] transition-all">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="flex-1 glow-gradient rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'Creating...' : 'Create Deal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
