'use client';

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search, Brain, Database, ShoppingBag, Settings, LogOut, Code } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';

export function CommandMenu() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm p-4"
        >
            <div className="w-full max-w-[640px] overflow-hidden rounded-xl border border-white/10 bg-[#0c0c0e] shadow-2xl animate-in zoom-in-95 duration-200">
                <Dialog.Title className="sr-only">Global Command Menu</Dialog.Title>
                <div className="flex items-center border-b border-white/5 px-4 py-3">
                    <Search className="mr-3 h-4 w-4 text-foreground/40" />
                    <Command.Input
                        placeholder="Type a command or search memories..."
                        className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/20"
                    />
                </div>

                <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-hide">
                    <Command.Empty className="px-4 py-8 text-center text-sm text-foreground/40">
                        No results found.
                    </Command.Empty>

                    <Command.Group heading="Navigation" className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-foreground/20">
                        <Item onSelect={() => runCommand(() => router.push('/'))} icon={<Brain className="mr-2 h-4 w-4" />}>
                            Neural Thread
                        </Item>
                        <Item onSelect={() => runCommand(() => router.push('/memory'))} icon={<Database className="mr-2 h-4 w-4" />}>
                            Memory Palace
                        </Item>
                        <Item onSelect={() => runCommand(() => router.push('/marketplace'))} icon={<ShoppingBag className="mr-2 h-4 w-4" />}>
                            Skills Marketplace
                        </Item>
                    </Command.Group>

                    <Command.Group heading="Technical" className="px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground/20 border-t border-white/5">
                        <Item onSelect={() => runCommand(() => { })} icon={<Code className="mr-2 h-4 w-4" />}>
                            Run Evaluations
                        </Item>
                        <Item onSelect={() => runCommand(() => { })} icon={<Settings className="mr-2 h-4 w-4" />}>
                            Preferences
                        </Item>
                    </Command.Group>

                    <Command.Group heading="Account" className="px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground/20 border-t border-white/5">
                        <Item icon={<LogOut className="mr-2 h-4 w-4" />}>
                            Disconnect Neural Link
                        </Item>
                    </Command.Group>
                </Command.List>

                <div className="flex items-center justify-between border-t border-white/5 bg-black/20 px-4 py-2 text-[10px] text-foreground/30">
                    <div className="flex items-center gap-4">
                        <span>↑↓ Navigate</span>
                        <span>↵ Enter</span>
                    </div>
                    <span>RPCN Kernel v2.0.0-alpha</span>
                </div>
            </div>
        </Command.Dialog>
    );
}

function Item({ children, icon, onSelect }: { children: React.ReactNode; icon: any; onSelect?: () => void }) {
    return (
        <Command.Item
            onSelect={onSelect}
            className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm text-foreground/60 transition-colors data-[selected=true]:bg-white/5 data-[selected=true]:text-foreground"
        >
            {icon}
            {children}
        </Command.Item>
    );
}
