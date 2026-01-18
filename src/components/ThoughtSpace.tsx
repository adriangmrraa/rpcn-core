'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Brain, Wrench, ShieldCheck, Search, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ThoughtStep {
    type: 'thought' | 'tool_use' | 'error';
    agent?: string;
    status?: string;
    content: string;
    tool?: string;
    input?: string;
}

export const ThoughtSpace = ({ steps }: { steps: ThoughtStep[] }) => {
    const getAgentIcon = (agent: string) => {
        const key = agent.toLowerCase();
        switch (key) {
            case 'librarian': return <Search className="h-3 w-3" />;
            case 'architect': return <Brain className="h-3 w-3" />;
            case 'critic':
            case 'validator': return <ShieldCheck className="h-3 w-3" />;
            case 'coder': return <Wrench className="h-3 w-3" />;
            default: return <Brain className="h-3 w-3" />;
        }
    };

    const getStatusIcon = (status?: string) => {
        if (status === 'approved') return <CheckCircle2 className="h-3 w-3 text-agent-acting" />;
        if (status === 'rejected' || status === 'failed') return <XCircle className="h-3 w-3 text-agent-error" />;
        return <Loader2 className="h-3 w-3 animate-spin text-agent-thinking" />;
    };

    return (
        <div className="space-y-4">
            {steps.map((step, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className={cn(
                        "relative overflow-hidden rounded-xl border bg-black/20 p-4 transition-all",
                        step.status === 'approved' ? "border-agent-acting/20" :
                            step.status === 'rejected' ? "border-agent-error/20" : "border-border/30"
                    )}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 border border-white/10 text-white/60">
                                {step.agent ? getAgentIcon(step.agent) : <Wrench className="h-3 w-3" />}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{step.agent || 'SYSTEM'}</span>
                        </div>
                        {getStatusIcon(step.status)}
                    </div>

                    <p className="text-xs text-foreground/70 leading-relaxed mb-2 italic">"{step.content}"</p>

                    {step.input && (
                        <div className="mt-3 overflow-hidden rounded-md bg-black/40 border border-white/5">
                            <div className="bg-white/5 px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-foreground/20 border-b border-white/5">IO Stream</div>
                            <pre className="p-3 text-[10px] font-mono text-agent-acting/80 overflow-x-auto whitespace-pre-wrap">
                                {step.input}
                            </pre>
                        </div>
                    )}

                    {/* Progress bar effect for running steps */}
                    {!step.status && i === steps.length - 1 && (
                        <div className="absolute bottom-0 left-0 h-[1px] w-full bg-agent-thinking/20 overflow-hidden">
                            <div className="h-full w-full bg-agent-thinking shimmer" />
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
};
