'use client';

import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { cn } from '@/lib/utils';
import { Brain, MessageSquare, Database, Settings, Command, Search, Code, Layout, Terminal, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';

interface WorkspaceProps {
    children: React.ReactNode;
    rightPane?: React.ReactNode;
    isThinking?: boolean;
}

export function Workspace({ children, rightPane: rightPaneProp, isThinking: isThinkingProp }: WorkspaceProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { rightPaneMode, setRightPaneMode, rightPaneContent, isThinking: isThinkingStore, installedSkills, setInstalledSkills } = useUIStore();
    const router = useRouter();
    const pathname = usePathname();

    const rightPane = rightPaneProp || rightPaneContent;
    const isThinking = isThinkingProp !== undefined ? isThinkingProp : isThinkingStore;

    React.useEffect(() => {
        const fetchSkills = async () => {
            try {
                const res = await fetch('/api/memory/context');
                const data = await res.json();
                const installed = data.knowledge_graph?.edges
                    ?.filter((e: any) => e.label === 'INSTALLED')
                    ?.map((e: any) => e.to);
                if (installed) setInstalledSkills(installed);
            } catch (err) {
                console.error('Failed to fetch skills:', err);
            }
        };
        fetchSkills();
    }, [setInstalledSkills]);

    const navItems = [
        { icon: <MessageSquare className="h-4 w-4" />, label: 'Neural Hub', path: '/', active: pathname === '/' },
        { icon: <Database className="h-4 w-4" />, label: 'Memory Palace', path: '/memory', active: pathname === '/memory' },
        { icon: <ShoppingBag className="h-4 w-4" />, label: 'Marketplace', path: '/marketplace', active: pathname === '/marketplace' },
        { icon: <ShieldCheck className="h-4 w-4" />, label: 'The Vault', path: '/vault', active: pathname === '/vault' },
    ];

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
            <PanelGroup direction="horizontal">
                {/* Left Pane: Sidebar */}
                <Panel
                    defaultSize={15}
                    minSize={5}
                    maxSize={20}
                    collapsible
                    onCollapse={() => setIsSidebarCollapsed(true)}
                    onExpand={() => setIsSidebarCollapsed(false)}
                    className={cn(
                        "flex flex-col border-r border-border bg-black/40 transition-all duration-300",
                        isSidebarCollapsed ? "min-w-[60px]" : "min-w-[200px]"
                    )}
                >
                    <div className="flex h-16 items-center px-4">
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded bg-agent-thinking/20 text-agent-thinking ring-1 ring-agent-thinking/40 cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => router.push('/')}
                        >
                            <Brain className="h-5 w-5" />
                        </div>
                        {!isSidebarCollapsed && (
                            <span className="ml-3 font-semibold tracking-tight text-white/90">RPCN_OS</span>
                        )}
                    </div>

                    <nav className="flex-1 space-y-1 p-2 overflow-y-auto scrollbar-hide">
                        <div className="mb-4 px-3 text-[9px] font-bold uppercase tracking-widest text-foreground/20">Navigation</div>
                        {navItems.map((item) => (
                            <NavItem
                                key={item.path}
                                icon={item.icon}
                                label={item.label}
                                active={item.active}
                                collapsed={isSidebarCollapsed}
                                onClick={() => router.push(item.path)}
                            />
                        ))}

                        {!isSidebarCollapsed && installedSkills.length > 0 && (
                            <>
                                <div className="mt-8 mb-4 px-3 text-[9px] font-bold uppercase tracking-widest text-foreground/20">Active Modules</div>
                                <div className="px-3 space-y-2">
                                    {installedSkills.map(skill => (
                                        <div key={skill} className="flex items-center gap-2 px-2 py-1 rounded bg-agent-thinking/5 border border-agent-thinking/20">
                                            <div className="h-1.5 w-1.5 rounded-full bg-agent-thinking animate-pulse" />
                                            <span className="text-[10px] font-mono text-agent-thinking/80 truncate">
                                                {skill.toUpperCase().replace(/-/g, '_')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        <div className="mt-8 mb-4 px-3 text-[9px] font-bold uppercase tracking-widest text-foreground/20">System Views</div>
                        <NavItem
                            icon={<Code className="h-4 w-4" />}
                            label="Artifacts"
                            active={rightPaneMode === 'artifact'}
                            collapsed={isSidebarCollapsed}
                            onClick={() => setRightPaneMode('artifact')}
                        />
                        <NavItem
                            icon={<Terminal className="h-4 w-4" />}
                            label="Terminal"
                            active={rightPaneMode === 'terminal'}
                            collapsed={isSidebarCollapsed}
                            onClick={() => setRightPaneMode('terminal')}
                        />
                    </nav>

                    <footer className="p-4 border-t border-border/50">
                        <div className={cn(
                            "flex items-center gap-2 text-xs text-foreground/40",
                            isSidebarCollapsed && "justify-center"
                        )}>
                            <Command className="h-3 w-3" />
                            {!isSidebarCollapsed && <span>Cmd + K</span>}
                        </div>
                    </footer>
                </Panel>

                <PanelResizeHandle className="w-1 bg-border/20 transition-colors hover:bg-agent-thinking/40" />

                {/* Center Pane: Dynamic Content */}
                import {LiveTerminal} from '@/components/LiveTerminal';

                // ... existing imports ...

                // ... inside component ...
                {/* Center Pane: Dynamic Content + Terminal */}
                <Panel defaultSize={60} minSize={30}>
                    <PanelGroup direction="vertical">
                        <Panel defaultSize={75} minSize={50}>
                            <div className="flex h-full flex-col relative">
                                <header className="flex h-16 items-center justify-between border-b border-border/50 px-6 glass">
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "h-2 w-2 rounded-full",
                                            isThinking ? "bg-agent-thinking animate-pulse" : "bg-agent-acting shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                        )} />
                                        <span className="text-xs font-medium uppercase tracking-widest text-foreground/60 leading-none">
                                            {isThinking ? "Neural Sync in Progress..." : "Core Stable"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button className="text-foreground/40 hover:text-foreground transition-colors">
                                            <Search className="h-4 w-4" />
                                        </button>
                                        <button className="text-foreground/40 hover:text-foreground transition-colors">
                                            <Settings className="h-4 w-4" />
                                        </button>
                                    </div>
                                </header>

                                <div className="flex-1 overflow-hidden relative">
                                    {children}
                                </div>
                            </div>
                        </Panel>

                        <PanelResizeHandle className="h-1 bg-border/20 transition-colors hover:bg-agent-thinking/40" />

                        <Panel defaultSize={25} minSize={10} collapsible>
                            <div className="h-full w-full bg-[#050505] flex flex-col">
                                <header className="h-8 flex items-center px-4 border-b border-white/5 bg-white/[0.02]">
                                    <Terminal className="h-3 w-3 text-agent-thinking mr-2" />
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Use / Logs</span>
                                </header>
                                <div className="flex-1 overflow-hidden p-2">
                                    <LiveTerminal />
                                </div>
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>

                {rightPane && (
                    <>
                        <PanelResizeHandle className="w-1 bg-border/40 transition-colors hover:bg-agent-thinking/40" />
                        <Panel defaultSize={35} minSize={20} className="bg-[#050505]">
                            <div className="flex h-full flex-col border-l border-border/50">
                                <header className="flex h-14 items-center gap-3 border-b border-border/30 px-6">
                                    <Brain className="h-3 w-3 text-agent-thinking" />
                                    <span className="text-[10px] font-bold uppercase tracking-[2px] text-foreground/40">
                                        Inspector / Output
                                    </span>
                                </header>
                                <div className="flex-1 overflow-auto p-6 scrollbar-hide">
                                    {rightPane}
                                </div>
                            </div>
                        </Panel>
                    </>
                )}
            </PanelGroup>
        </div>
    );
}

function NavItem({ icon, label, active, collapsed, onClick }: { icon: any, label: string, active?: boolean, collapsed: boolean, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all cursor-pointer group",
                active
                    ? "bg-agent-thinking/10 text-agent-thinking ring-1 ring-agent-thinking/20"
                    : "text-foreground/40 hover:bg-white/5 hover:text-foreground",
                collapsed && "justify-center px-0"
            )}
        >
            <div className={cn(
                "transition-colors",
                active ? "text-agent-thinking" : "text-foreground/40 group-hover:text-foreground"
            )}>
                {icon}
            </div>
            {!collapsed && <span className="font-medium">{label}</span>}
        </div>
    );
}
