'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store';
import { ShoppingBag, Zap, Shield, BarChart, MessageSquare, Code, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const SKILLS = [
    {
        id: 'growth-hacker',
        name: 'Growth Hacker',
        description: 'Autonomous optimization of conversion funnels and lead generation.',
        icon: <Zap className="h-6 w-6 text-yellow-500" />,
        cost: '50 Credits',
        tier: 'Elite'
    },
    {
        id: 'cyber-sentinel',
        name: 'Cyber Sentinel',
        description: 'Advanced heuristic analysis for real-time security threats.',
        icon: <Shield className="h-6 w-6 text-blue-500" />,
        cost: '75 Credits',
        tier: 'Guardian'
    },
    {
        id: 'data-sculptor',
        name: 'Data Sculptor',
        description: 'Transforming unstructured noise into predictive market models.',
        icon: <BarChart className="h-6 w-6 text-purple-500" />,
        cost: '60 Credits',
        tier: 'Analyst'
    },
    {
        id: 'neural-copy',
        name: 'Neural Copywriter',
        description: 'High-conversion copy adapted to user psychological profiles.',
        icon: <MessageSquare className="h-6 w-6 text-green-500" />,
        cost: '40 Credits',
        tier: 'Creative'
    },
    {
        id: 'code-architect',
        name: 'Code Architect',
        description: 'Scaffolding and refactoring complex microservices autonomously.',
        icon: <Code className="h-6 w-6 text-cyan-500" />,
        cost: '100 Credits',
        tier: 'Architect'
    },
    {
        id: 'global-proxy',
        name: 'Global Proxy',
        description: 'Multi-lingual cultural adaptation and localization specialist.',
        icon: <Globe className="h-6 w-6 text-orange-500" />,
        cost: '45 Credits',
        tier: 'Linguist'
    }
];

export default function MarketplacePage() {
    const [installing, setInstalling] = useState<Record<string, 'idle' | 'installing' | 'installed'>>({});
    const { setRightPaneContent, installedSkills, setInstalledSkills } = useUIStore();

    useEffect(() => {
        setRightPaneContent(null); // Full width for marketplace

        // Sync local 'installed' state with global store
        const statusMap: Record<string, 'installed'> = {};
        installedSkills.forEach(id => statusMap[id] = 'installed');
        setInstalling(prev => ({ ...prev, ...statusMap }));
    }, [setRightPaneContent, installedSkills]);

    const handleInstall = async (skillId: string) => {
        if (installing[skillId] === 'installing' || installing[skillId] === 'installed') return;

        setInstalling(prev => ({ ...prev, [skillId]: 'installing' }));

        try {
            const res = await fetch('/api/marketplace/install', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skill_id: skillId,
                    user_id: 'default_user'
                })
            });

            if (res.ok) {
                setInstalledSkills([...installedSkills, skillId]);
            } else {
                setInstalling(prev => ({ ...prev, [skillId]: 'idle' }));
            }
        } catch (error) {
            console.error('Install failed:', error);
            setInstalling(prev => ({ ...prev, [skillId]: 'idle' }));
        }
    };

    return (
        <div className="h-full bg-[#0a0a0c] text-white p-8 overflow-y-auto scrollbar-hide">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <ShoppingBag className="h-8 w-8 text-agent-thinking" />
                    <h1 className="text-3xl font-bold tracking-tighter uppercase">Cognitive_Marketplace</h1>
                </div>
                <p className="text-white/40 max-w-2xl font-medium">
                    Provision your RPCN instance with domain-specific expertise. Modular cognitive architectures optimized for autonomous execution.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                {SKILLS.map((skill) => (
                    <div
                        key={skill.id}
                        className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.05] hover:border-agent-thinking/40"
                    >
                        <div className="mb-6 flex items-start justify-between">
                            <div className="rounded-xl bg-agent-thinking/10 p-4 border border-agent-thinking/20 group-hover:scale-110 transition-transform duration-500">
                                {skill.icon}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[2px] text-white/20">
                                {skill.tier}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold mb-3 group-hover:text-agent-thinking transition-colors">
                            {skill.name}
                        </h3>
                        <p className="text-xs text-white/40 mb-8 leading-relaxed h-12 overflow-hidden">
                            {skill.description}
                        </p>

                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase tracking-widest text-white/20 mb-1">Provisioning Cost</span>
                                <span className="text-sm font-mono font-bold text-agent-thinking">{skill.cost}</span>
                            </div>
                            <button
                                onClick={() => handleInstall(skill.id)}
                                disabled={installing[skill.id] === 'installing'}
                                className={cn(
                                    "rounded-xl px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg",
                                    installing[skill.id] === 'installed'
                                        ? "bg-agent-acting text-white"
                                        : "bg-white/5 text-white hover:bg-agent-thinking hover:shadow-agent-thinking/40"
                                )}
                            >
                                {installing[skill.id] === 'installing' ? 'Provisioning...' :
                                    installing[skill.id] === 'installed' ? 'Operational' : 'Deploy Module'}
                            </button>
                        </div>

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-tr from-agent-thinking/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}
            </div>
        </div>
    );
}
