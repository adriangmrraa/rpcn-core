'use client';

import React, { useEffect, useRef } from 'react';
import 'xterm/css/xterm.css';

export function LiveTerminal() {
    const terminalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isMounted = true;
        let xterm: any;

        const initTerminal = async () => {
            // Dynamic import to avoid SSR "self is not defined" error
            const { Terminal } = await import('xterm');
            const { FitAddon } = await import('xterm-addon-fit');

            if (!isMounted || !terminalRef.current) return;

            xterm = new Terminal({
                cursorBlink: true,
                fontSize: 12,
                fontFamily: 'JetBrains Mono, monospace',
                theme: {
                    background: '#050505',
                    foreground: '#10b981',
                    cursor: '#10b981',
                    selectionBackground: 'rgba(16, 185, 129, 0.3)',
                },
            });

            const fitAddon = new FitAddon();
            xterm.loadAddon(fitAddon);
            xterm.open(terminalRef.current);

            // Small delay to ensure container is rendered before fitting
            setTimeout(() => {
                if (isMounted) fitAddon.fit();
            }, 100);

            xterm.writeln('\x1b[1;32m> \x1b[0mNeural Link established.');
            xterm.writeln('\x1b[1;32m> \x1b[0mMonitoring TRM Loop events...');

            const handleResize = () => fitAddon.fit();
            window.addEventListener('resize', handleResize);

            (xterm as any)._handleResize = handleResize;
        };

        initTerminal();

        return () => {
            isMounted = false;
            if (xterm) {
                if ((xterm as any)._handleResize) {
                    window.removeEventListener('resize', (xterm as any)._handleResize);
                }
                xterm.dispose();
            }
        };
    }, []);

    return (
        <div className="h-full w-full rounded-xl overflow-hidden border border-white/5 bg-[#050505] p-2">
            <div ref={terminalRef} className="h-full w-full" />
        </div>
    );
}
