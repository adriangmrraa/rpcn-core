'use client';

import React from 'react';
import Editor from '@monaco-editor/react';
import { useUIStore } from '@/lib/store';
import { X, Copy, Download } from 'lucide-react';

export function CodeArtifact() {
    const { currentArtifact, setCurrentArtifact } = useUIStore();

    if (!currentArtifact) return null;

    return (
        <div className="flex h-full flex-col rounded-xl overflow-hidden border border-white/5 bg-[#0A0A0A]">
            <header className="flex items-center justify-between bg-black/40 px-4 py-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-foreground/40">{currentArtifact.filename}</span>
                    <span className="rounded bg-agent-thinking/20 px-1.5 py-0.5 text-[10px] text-agent-thinking uppercase font-bold">
                        {currentArtifact.language}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-white/5 rounded text-foreground/40 hover:text-foreground">
                        <Copy className="h-3 w-3" />
                    </button>
                    <button
                        onClick={() => setCurrentArtifact(null)}
                        className="p-1 hover:bg-white/5 rounded text-foreground/40 hover:text-foreground"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            </header>
            <div className="flex-1">
                <Editor
                    height="100%"
                    language={currentArtifact.language}
                    value={currentArtifact.code}
                    theme="vs-dark"
                    options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 12,
                        lineHeight: 20,
                        padding: { top: 16 },
                        fontFamily: 'JetBrains Mono, monospace',
                        scrollBeyondLastLine: false,
                        backgroundColor: '#0A0A0A'
                    }}
                />
            </div>
        </div>
    );
}
