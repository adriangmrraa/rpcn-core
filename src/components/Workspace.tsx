'use client';

import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { cn } from '@/lib/utils';
import { Brain, MessageSquare, Database, Settings, Command, Search, Code, Layout, Terminal, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import { LiveTerminal } from '@/components/LiveTerminal';

interface WorkspaceProps {
    children: React.ReactNode;
    rightPane?: React.ReactNode;
    isThinking?: boolean;
}

export function Workspace({ children, rightPane: rightPaneProp, isThinking: isThinkingProp }: WorkspaceProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isTerminalOpen, setIsTerminalOpen] = useState(false); // Default closed for clean UI
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
        <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground selection:bg-agent-thinking/20">
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
                        "flex flex-col bg-black/40 transition-all duration-300 border-r border-white/5",
                        isSidebarCollapsed ? "min-w-[60px]" : "min-w-[200px]"
                    )}
                >
                    <div className="flex h-16 items-center px-4">
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-agent-thinking ring-1 ring-white/10 cursor-pointer hover:bg-white/10 transition-all"
                            onClick={() => router.push('/')}
                        >
                            <Brain className="h-5 w-5" />
                        </div>
                        {!isSidebarCollapsed && (
                            <span className="ml-3 font-semibold tracking-tight text-white/80">RPCN_OS</span>
                        )}
                    </div>

                    <nav className="flex-1 space-y-1 p-2 overflow-y-auto scrollbar-hide">
                        <div className="mb-4 px-3 text-[9px] font-bold uppercase tracking-widest text-white/20">Navigation</div>
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
                                <div className="mt-8 mb-4 px-3 text-[9px] font-bold uppercase tracking-widest text-white/20">Active Modules</div>
                                <div className="px-3 space-y-2">
                                    {installedSkills.map(skill => (
                                        <div key={skill} className="flex items-center gap-2 px-2 py-1.5 rounded bg-agent-thinking/5 border border-agent-thinking/10">
                                            <div className="h-1.5 w-1.5 rounded-full bg-agent-thinking animate-pulse" />
                                            <span className="text-[10px] font-mono text-agent-thinking/80 truncate">
                                                {skill.toUpperCase().replace(/-/g, '_')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </nav>

                    <footer className="p-4 border-t border-white/5">
                        <div className={cn(
                            "flex items-center gap-2 text-xs text-white/30",
                            isSidebarCollapsed && "justify-center"
                        )}>
                            <Command className="h-3 w-3" />
                            {!isSidebarCollapsed && <span>Cmd + K</span>}
                        </div>
                    </footer>
                </Panel>

                <PanelResizeHandle className="w-[1px] bg-transparent hover:bg-agent-thinking/50 transition-colors" />

                {/* Center Pane: Dynamic Content */}
                <Panel defaultSize={60} minSize={30}>
                    <div className="flex h-full flex-col relative bg-background/50">
                        {/* Header */}
                        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 px-6">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    isThinking ? "bg-agent-thinking animate-pulse" : "bg-emerald-500/50"
                                )} />
                                <span className="text-[10px] font-medium uppercase tracking-[2px] text-white/40 leading-none">
                                    {isThinking ? "Neural Sync Active" : "System Ready"}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="text-white/20 hover:text-white/60 transition-colors">
                                    <Search className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setRightPaneMode('settings')}
                                    className="text-white/20 hover:text-white/60 transition-colors"
                                >
                                    <Settings className="h-4 w-4" />
                                </button>
                            </div>
                        </header>

                        {/* Main Content Area */}
                        <div className="flex-1 overflow-hidden relative">
                            {children}
                        </div>

                        {/* Terminal Drawer (Collapsible) */}
                        <div className={cn(
                            "border-t border-white/5 bg-[#050505] transition-all duration-300 ease-in-out flex flex-col",
                            isTerminalOpen ? "h-[300px]" : "h-0"
                        )}>
                            <div className="flex-1 overflow-hidden p-2">
                                <LiveTerminal />
                            </div>
                        </div>

                        {/* Status Bar (Toggle for Terminal) */}
                        <div className="h-8 shrink-0 flex items-center justify-between px-4 border-t border-white/5 bg-white/[0.02]">
                            <button
                                onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                                className={cn(
                                    "flex items-center gap-2 text-[10px] uppercase tracking-wider font-mono transition-colors hover:text-white",
                                    isTerminalOpen ? "text-agent-thinking" : "text-white/30"
                                )}
                            >
                                <Terminal className="h-3 w-3" />
                                <span>{isTerminalOpen ? "Close Terminal" : "System Logs"}</span>
                            </button>

                            <div className="flex items-center gap-4 text-[10px] text-white/20 font-mono">
                                <span>v2.2.0-STABLE</span>
                                <span>{(new Date()).toISOString().split('T')[0]}</span>
                            </div>
                        </div>
                    </div>
                </Panel>

                {rightPane && (
                    <>
                        <PanelResizeHandle className="w-[1px] bg-transparent hover:bg-agent-thinking/50 transition-colors" />
                        <Panel defaultSize={35} minSize={20} className="bg-[#050505]">
                            <div className="flex h-full flex-col border-l border-white/5">
                                <header className="flex h-14 items-center gap-3 border-b border-white/5 px-6">
                                    <Brain className="h-3 w-3 text-agent-thinking" />
                                    <span className="text-[10px] font-bold uppercase tracking-[2px] text-white/40">
                                        Inspector
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
