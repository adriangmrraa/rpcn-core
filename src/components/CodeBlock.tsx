'use client';

import React from 'react';

export const CodeBlock = ({ code, language }: { code: string; language?: string }) => {
    return (
        <div className="group relative my-4 overflow-hidden rounded-lg bg-black/40 border border-white/10">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                <span className="text-[10px] font-mono text-white/40 uppercase">{language || 'code'}</span>
                <button
                    onClick={() => console.log('Executing code...')}
                    className="text-[10px] text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
                >
                    <span>▶ Run in Cloud</span>
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono text-white/80 leading-relaxed">
                <code>{code}</code>
            </pre>
        </div>
    );
};
