'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Brain, Wrench, ShieldCheck, Search } from 'lucide-react';

export interface ThoughtStep {
    type: 'thought' | 'tool_use' | 'error';
    agent?: string;
    status?: string;
    content: string;
    tool?: string;
    input?: string;
}

export const ThoughtBubble = ({ steps }: { steps: ThoughtStep[] }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (steps.length === 0) return null;

    const getAgentIcon = (agent: string) => {
        switch (agent) {
            case 'librarian': return <Search className="h-3 w-3" />;
            case 'architect': return <Brain className="h-3 w-3" />;
            case 'critic': return <ShieldCheck className="h-3 w-3" />;
            default: return <Wrench className="h-3 w-3" />;
        }
    };

    return (
        <div className="my-4 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between px-5 py-3 hover:bg-white/5"
            >
                <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                        <Brain className="h-3 w-3" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[2px] text-white/60">
                        Cognitive Process ({steps.length} cycles)
                    </span>
                </div>
                {isOpen ? <ChevronDown className="h-3 w-3 text-white/40" /> : <ChevronRight className="h-3 w-3 text-white/40" />}
            </button>

            {isOpen && (
                <div className="relative space-y-4 p-5 pt-0">
                    {/* Vertical Line */}
                    <div className="absolute left-[34px] top-0 h-full w-[1px] bg-gradient-to-b from-white/10 to-transparent" />

                    {steps.map((step, i) => (
                        <div key={i} className="relative flex gap-4 text-xs animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className={cn(
                                "z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-white shadow-lg",
                                step.type === 'thought' ? "bg-[#1e1e24]" : "bg-amber-500/20 text-amber-400 border-amber-500/20"
                            )}>
                                {step.agent ? getAgentIcon(step.agent) : step.type === 'tool_use' ? <Wrench className="h-3 w-3" /> : '!'}
                            </div>

                            <div className="flex flex-1 flex-col justify-center py-0.5">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-white/80 capitalize">{step.agent || step.type}</span>
                                    <span className={cn(
                                        "text-[9px] px-1.5 py-0.5 rounded-full",
                                        step.status === 'approved' ? "bg-green-500/10 text-green-400" :
                                            step.status === 'rejected' ? "bg-red-500/10 text-red-400" : "bg-white/10 text-white/40"
                                    )}>{step.status || 'running'}</span>
                                </div>
                                <p className="text-white/40 leading-relaxed italic">
                                    "{step.content}"
                                </p>
                                {step.input && (
                                    <pre className="mt-2 rounded bg-black/40 p-2 text-[10px] text-amber-200/60 font-mono">
                                        {step.input}
                                    </pre>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
